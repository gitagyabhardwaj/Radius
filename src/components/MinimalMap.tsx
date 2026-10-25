import React, { useMemo, useEffect } from 'react';
import { Creator } from '../types';
import { CREATORS } from '../data';
import { Compass, Users, Briefcase } from 'lucide-react';
import { MapContainer, TileLayer, Circle, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Math distance formula
export function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

interface MinimalMapProps {
  centerLat: number;
  centerLng: number;
  onMapClick?: (lat: number, lng: number) => void;
  selectedCreatorId?: string | null;
  onSelectCreator?: (creatorId: string) => void;
  onRoastCreator?: (creator: Creator) => void;
  activeCampaignId?: string | null;
  creators?: Creator[];
}

// Subcomponent to handle map clicks
function MapEventsHandler({ onMapClick }: { onMapClick?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      if (onMapClick) {
        onMapClick(Number(e.latlng.lat.toFixed(4)), Number(e.latlng.lng.toFixed(4)));
      }
    },
  });
  return null;
}

// Subcomponent to update map view when center changes externally
function MapUpdater({ centerLat, centerLng }: { centerLat: number; centerLng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([centerLat, centerLng], map.getZoom(), { animate: true });
  }, [centerLat, centerLng, map]);
  return null;
}

// Subcomponent to fix Leaflet grey tiles / container resize issues
function MapResizer() {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    const t1 = setTimeout(() => map.invalidateSize(), 150);
    const t2 = setTimeout(() => map.invalidateSize(), 500);
    const handleResize = () => map.invalidateSize();
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('resize', handleResize);
    };
  }, [map]);
  return null;
}

export default function MinimalMap({
  centerLat,
  centerLng,
  onMapClick,
  selectedCreatorId,
  onSelectCreator,
  onRoastCreator,
  creators,
}: MinimalMapProps) {
  
  // Ensure we have a valid list of creators with real numeric coordinates
  const validCreators = useMemo(() => {
    const list = (creators && creators.length > 0) ? creators : CREATORS;
    return list.filter(
      (c) =>
        typeof c.lat === 'number' &&
        typeof c.lng === 'number' &&
        !isNaN(c.lat) &&
        !isNaN(c.lng) &&
        (c.lat !== 0 || c.lng !== 0)
    );
  }, [creators]);

  const creatorsWithStatus = useMemo(() => {
    return validCreators.map((creator) => {
      const distance = getDistanceKm(centerLat, centerLng, creator.lat, creator.lng);
      // Considered inside geofence if within 15 km of target center
      const isInside = distance <= 15;
      return { ...creator, distance, isInside };
    });
  }, [centerLat, centerLng, validCreators]);

  const activeMatchesCount = useMemo(() => {
    return creatorsWithStatus.filter((c) => c.isInside).length;
  }, [creatorsWithStatus]);

  // Create glowing animated Leaflet markers
  const createIcon = (isSelected: boolean, isInside: boolean) => {
    const color = isSelected ? '#C9B8E8' : isInside ? '#C9B8E8' : '#525252';
    const size = isSelected ? 18 : 14;
    const offset = size / 2;
    const pulseRing = isSelected
      ? `<div style="position:absolute;inset:-6px;border-radius:50%;background:rgba(201,184,232,0.4);animation:radarPulse 1.8s infinite;"></div>`
      : isInside
      ? `<div style="position:absolute;inset:-4px;border-radius:50%;background:rgba(201,184,232,0.2);animation:radarPulse 2.4s infinite;"></div>`
      : '';

    return L.divIcon({
      className: 'custom-leaflet-marker',
      html: `
        <div style="position:relative;width:${size}px;height:${size}px;">
          ${pulseRing}
          <div style="
            width:${size}px;height:${size}px;
            border-radius:50%;
            background:${color};
            border:2px solid #0C0B0D;
            box-shadow:0 0 10px ${color}90, 0 2px 5px rgba(0,0,0,0.6);
            position:relative;z-index:2;
            cursor:pointer;
            transition:transform 0.15s ease;
          "></div>
        </div>
      `,
      iconSize: [size, size],
      iconAnchor: [offset, offset],
    });
  };

  return (
    <div className="relative w-full h-[380px] md:h-[450px] bg-[#0C0B0D] border border-[#26232B] rounded-2xl overflow-hidden select-none z-0 shadow-2xl">
      <style>{`
        @keyframes radarPulse {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(2.4); opacity: 0; }
        }
        .leaflet-container {
          background-color: #0C0B0D !important;
        }
        .custom-popup .leaflet-popup-content-wrapper {
          background: #151417 !important;
          color: #ffffff !important;
          border: 1px solid #26232B !important;
          border-radius: 16px !important;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.7) !important;
          padding: 0 !important;
        }
        .custom-popup .leaflet-popup-content {
          margin: 12px !important;
          line-height: 1.4 !important;
        }
        .custom-popup .leaflet-popup-tip {
          background: #151417 !important;
          border: 1px solid #26232B !important;
        }
        .custom-popup .leaflet-popup-close-button {
          color: #a1a1aa !important;
          padding: 6px !important;
        }
      `}</style>
      
      {/* Top-Left Engine Status Badge */}
      <div className="absolute top-4 left-4 z-[400] flex flex-col gap-2 pointer-events-none">
        <div className="bg-[#151417] border border-[#26232B] px-3.5 py-1.5 rounded-full flex items-center gap-2 shadow-md">
          <Compass className="w-3.5 h-3.5 text-[#C9B8E8] animate-spin-slow" />
          <span className="text-xs font-mono font-bold text-white tracking-wide uppercase">
            Delhi Geo-Radial Engine
          </span>
        </div>
        <div className="bg-[#0C0B0D] border border-[#26232B] text-white px-3.5 py-1.5 rounded-full shadow-md flex items-center gap-2">
          <Users className="w-3.5 h-3.5 text-[#C9B8E8]" />
          <span className="text-xs font-mono">
            <span className="text-zinc-400">Target Density: </span>
            <strong className="text-[#F1E3A8]">{activeMatchesCount} matched creators</strong>
          </span>
        </div>
      </div>

      {/* Bottom-Right Coordinates Tag */}
      <div className="absolute bottom-5 right-4 z-[400] bg-[#151417] px-3 py-1.5 rounded-xl border border-[#26232B] text-[10px] font-mono text-zinc-400 shadow-md flex flex-col gap-0.5 pointer-events-none">
        <div>LAT: {centerLat.toFixed(4)}</div>
        <div>LNG: {centerLng.toFixed(4)}</div>
      </div>

      {/* Bottom-Left Legend */}
      <div className="absolute bottom-5 left-4 z-[400] flex gap-3 bg-[#151417] border border-[#26232B] px-3.5 py-2 rounded-xl text-[10px] font-mono text-zinc-300 shadow-md pointer-events-none">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#C9B8E8] shadow-[0_0_6px_rgba(201,184,232,0.6)]" />
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#C9B8E8] border border-[#0C0B0D] shadow-[0_0_6px_rgba(201,184,232,0.3)]" />
          <span>Within Geofence</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#F1E3A8] shadow-[0_0_6px_rgba(241,227,168,0.6)]" />
          <span>Target Pin</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-zinc-600" />
          <span>Outer Ring</span>
        </div>
      </div>

      <MapContainer 
        center={[centerLat, centerLng]} 
        zoom={11} 
        style={{ width: '100%', height: '100%', zIndex: 1 }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url={`https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png?api_key=${import.meta.env.VITE_STADIA_API_KEY}`}
          maxZoom={20}
        />
        
        <MapEventsHandler onMapClick={onMapClick} />
        <MapUpdater centerLat={centerLat} centerLng={centerLng} />
        <MapResizer />

        {/* Outer Geofence Radius Circle (12km) */}
        <Circle
          center={[centerLat, centerLng]}
          radius={12000}
          pathOptions={{
            color: '#C9B8E8',
            fillColor: '#C9B8E8',
            fillOpacity: 0.05,
            weight: 1.5,
            dashArray: '6, 6',
          }}
        />

        {/* Core Priority Geofence Circle (5km) */}
        <Circle
          center={[centerLat, centerLng]}
          radius={5000}
          pathOptions={{
            color: '#26232B',
            fillColor: '#C9B8E8',
            fillOpacity: 0.03,
            weight: 1,
          }}
        />
        
        {/* Center Target Pinpoint */}
        <Marker 
          position={[centerLat, centerLng]} 
          interactive={false}
          icon={L.divIcon({
            className: 'custom-center-marker',
            html: `
              <div style="position:relative;width:16px;height:16px;">
                <div style="position:absolute;inset:-8px;border-radius:50%;background:rgba(241,227,168,0.35);animation:radarPulse 1.8s infinite;"></div>
                <div style="
                  width:16px;height:16px;
                  border-radius:50%;
                  background:#F1E3A8;
                  border:2.5px solid #0C0B0D;
                  box-shadow:0 0 15px rgba(241,227,168,0.8), 0 2px 6px rgba(0,0,0,0.6);
                  position:relative;z-index:2;
                "></div>
              </div>
            `,
            iconSize: [16, 16],
            iconAnchor: [8, 8]
          })}
        />

        {/* Creator Radar Markers */}
        {creatorsWithStatus.map((creator) => {
          const isSelected = selectedCreatorId === creator.id;
          return (
            <Marker 
              key={creator.id}
              position={[creator.lat, creator.lng]}
              icon={createIcon(isSelected, creator.isInside)}
              eventHandlers={{
                click: () => {
                  if (onSelectCreator) onSelectCreator(creator.id);
                  if (onRoastCreator) onRoastCreator(creator);
                },
              }}
            >
              <Popup className="custom-popup">
                <div 
                  className="flex items-center gap-2.5 mb-2.5 min-w-[170px] cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRoastCreator?.(creator);
                  }}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    onRoastCreator?.(creator);
                  }}
                  title={`Click to view ${creator.name}'s past work`}
                >
                  <img 
                    src={creator.avatar} 
                    alt={creator.name} 
                    className="w-8 h-8 rounded-full object-cover border border-[#C9B8E8]/50 shrink-0" 
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white leading-tight truncate">
                      {creator.name}
                    </div>
                    <div className="text-[10px] text-zinc-400 font-mono truncate">{creator.handle}</div>
                  </div>
                </div>
                <div className="flex flex-col gap-1 text-[11px] font-mono">
                  <div className="flex justify-between items-center text-zinc-300">
                    <span className="text-zinc-500">Distance:</span>
                    <strong className="text-white">{creator.distance ? creator.distance.toFixed(1) : '0'} km</strong>
                  </div>
                  <div className="flex justify-between items-center text-zinc-300">
                    <span className="text-zinc-500">Match Score:</span>
                    <strong className="text-[#C9B8E8]">{creator.matchScore}%</strong>
                  </div>
                  <div className="flex justify-between items-center text-zinc-300">
                    <span className="text-zinc-500">Local Audience:</span>
                    <strong className="text-white">{creator.audienceInLocality}%</strong>
                  </div>
                </div>
                {onRoastCreator && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRoastCreator(creator);
                    }}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      onRoastCreator(creator);
                    }}
                    className="mt-2.5 w-full py-1.5 px-2 bg-[#C9B8E8] hover:bg-[#D8CAF2] text-[#0C0B0D] font-mono font-bold text-[11px] rounded-xl flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-all border border-[#C9B8E8]"
                  >
                    <Briefcase className="w-3.5 h-3.5 text-[#0C0B0D]" />
                    <span>View Past Work</span>
                  </button>
                )}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
