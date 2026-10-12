import React, { useMemo, useEffect } from 'react';
import { Creator } from '../types';
import { CREATORS } from '../data';
import { Compass, Users } from 'lucide-react';
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
    const color = isSelected ? '#6366F1' : isInside ? '#10B981' : '#71717A';
    const size = isSelected ? 18 : 14;
    const offset = size / 2;
    const pulseRing = isSelected
      ? `<div style="position:absolute;inset:-6px;border-radius:50%;background:rgba(99,102,241,0.35);animation:radarPulse 1.8s infinite;"></div>`
      : isInside
      ? `<div style="position:absolute;inset:-4px;border-radius:50%;background:rgba(16,185,129,0.25);animation:radarPulse 2.4s infinite;"></div>`
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
            border:2px solid #ffffff;
            box-shadow:0 0 10px ${color}80, 0 2px 5px rgba(0,0,0,0.4);
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
    <div className="relative w-full h-[380px] md:h-[450px] bg-[#0c0d12] border border-zinc-800 rounded-2xl overflow-hidden select-none z-0 shadow-lg">
      <style>{`
        @keyframes radarPulse {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(2.4); opacity: 0; }
        }
        .leaflet-container {
          background-color: #0c0d12 !important;
        }
        .custom-popup .leaflet-popup-content-wrapper {
          background: #18181b !important;
          color: #ffffff !important;
          border: 1px solid #27272a !important;
          border-radius: 16px !important;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5) !important;
          padding: 0 !important;
        }
        .custom-popup .leaflet-popup-content {
          margin: 12px !important;
          line-height: 1.4 !important;
        }
        .custom-popup .leaflet-popup-tip {
          background: #18181b !important;
          border: 1px solid #27272a !important;
        }
        .custom-popup .leaflet-popup-close-button {
          color: #a1a1aa !important;
          padding: 6px !important;
        }
      `}</style>
      
      {/* Top-Left Engine Status Badge */}
      <div className="absolute top-4 left-4 z-[400] flex flex-col gap-2 pointer-events-none">
        <div className="bg-zinc-900/90 backdrop-blur-md border border-zinc-800 px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-md">
          <Compass className="w-3.5 h-3.5 text-indigo-400 animate-spin-slow" />
          <span className="text-xs font-mono font-bold text-white tracking-wide uppercase">
            Delhi Geo-Radial Engine
          </span>
        </div>
        <div className="bg-indigo-500/10 backdrop-blur-md border border-indigo-500/25 text-white px-3 py-1.5 rounded-xl shadow-md flex items-center gap-2">
          <Users className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-xs font-mono">
            <span className="text-zinc-400">Target Density: </span>
            <strong className="text-emerald-400">{activeMatchesCount} matched creators</strong>
          </span>
        </div>
      </div>

      {/* Bottom-Right Coordinates Tag */}
      <div className="absolute bottom-5 right-4 z-[400] bg-zinc-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-zinc-800 text-[10px] font-mono text-zinc-400 shadow-md flex flex-col gap-0.5 pointer-events-none">
        <div>LAT: {centerLat.toFixed(4)}</div>
        <div>LNG: {centerLng.toFixed(4)}</div>
      </div>

      {/* Bottom-Left Legend */}
      <div className="absolute bottom-5 left-4 z-[400] flex gap-3 bg-zinc-900/90 backdrop-blur-md border border-zinc-800 px-3 py-1.5 rounded-xl text-[10px] font-mono text-zinc-300 shadow-md pointer-events-none">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_6px_rgba(99,102,241,0.6)]" />
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
          <span>Within Geofence</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-zinc-500" />
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
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        <MapEventsHandler onMapClick={onMapClick} />
        <MapUpdater centerLat={centerLat} centerLng={centerLng} />
        <MapResizer />

        {/* Outer Geofence Radius Circle (12km) */}
        <Circle
          center={[centerLat, centerLng]}
          radius={12000}
          pathOptions={{
            color: '#6366f1',
            fillColor: '#6366f1',
            fillOpacity: 0.08,
            weight: 1.5,
            dashArray: '4, 8',
          }}
        />

        {/* Core Priority Geofence Circle (5km) */}
        <Circle
          center={[centerLat, centerLng]}
          radius={5000}
          pathOptions={{
            color: '#10b981',
            fillColor: '#10b981',
            fillOpacity: 0.06,
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
                <div style="position:absolute;inset:-8px;border-radius:50%;background:rgba(99,102,241,0.3);animation:radarPulse 1.8s infinite;"></div>
                <div style="
                  width:16px;height:16px;
                  border-radius:50%;
                  background:#6366f1;
                  border:2.5px solid #ffffff;
                  box-shadow:0 0 15px rgba(99,102,241,0.8), 0 2px 6px rgba(0,0,0,0.5);
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
                },
              }}
            >
              <Popup className="custom-popup">
                <div className="flex items-center gap-2.5 mb-2.5 min-w-[170px]">
                  <img 
                    src={creator.avatar} 
                    alt={creator.name} 
                    className="w-8 h-8 rounded-full object-cover border border-indigo-500/40 shrink-0" 
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white leading-tight truncate">{creator.name}</div>
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
                    <strong className="text-indigo-400">{creator.matchScore}%</strong>
                  </div>
                  <div className="flex justify-between items-center text-zinc-300">
                    <span className="text-zinc-500">Local Audience:</span>
                    <strong className="text-emerald-400">{creator.audienceInLocality}%</strong>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
