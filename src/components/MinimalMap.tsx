import React, { useState, useMemo, useEffect } from 'react';
import { Creator } from '../types';
import { CREATORS } from '../data';
import { MapPin, Compass, Users } from 'lucide-react';
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

export default function MinimalMap({
  centerLat,
  centerLng,

  onMapClick,
  selectedCreatorId,
  onSelectCreator,
  creators,
}: MinimalMapProps) {
  
  const creatorsWithStatus = useMemo(() => {
    return (creators || CREATORS).map((creator) => {
      const distance = getDistanceKm(centerLat, centerLng, creator.lat, creator.lng);
      return { ...creator, distance, isInside: true };
    });
  }, [centerLat, centerLng, creators]);

  const activeMatchesCount = useMemo(() => {
    return creatorsWithStatus.filter((c) => c.isInside).length;
  }, [creatorsWithStatus]);

  // Create custom icons for leaflet
  const createIcon = (isSelected: boolean, isInside: boolean) => {
    const color = isSelected ? '#4f46e5' : isInside ? '#10b981' : '#9ca3af';
    const scale = isSelected ? 'scale(1.2)' : 'scale(1)';
    const stroke = isSelected ? 'border: 2px solid white;' : 'border: 1px solid white;';
    
    return L.divIcon({
      className: 'custom-leaflet-icon',
      html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; ${stroke} transform: ${scale}; box-shadow: 0 2px 4px rgba(0,0,0,0.2); transition: all 0.2s;"></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7]
    });
  };

  return (
    <div className="relative w-full h-[360px] md:h-[440px] bg-slate-50 border border-zinc-200/80 rounded-2xl overflow-hidden select-none z-0">
      
      {/* Overlay UI elements */}
      <div className="absolute top-4 left-4 z-[400] flex flex-col gap-1.5 pointer-events-none">
        <div className="bg-white/90 backdrop-blur-md border border-zinc-200/80 shadow-sm px-3 py-1.5 rounded-xl flex items-center gap-2">
          <Compass className="w-4 h-4 text-zinc-500 animate-spin-slow" />
          <span className="text-sm font-mono font-medium text-zinc-700">DELHI GEO-RADIAL ENGINE</span>
        </div>
        <div className="bg-zinc-950/95 backdrop-blur-sm text-white px-3 py-1.5 rounded-xl shadow-md flex items-center gap-2.5">
          <Users className="w-4 h-4 text-indigo-400" />
          <span className="text-sm font-sans font-medium">
            Active Target: <span className="text-indigo-300 font-bold">{activeMatchesCount} matches</span>
          </span>
        </div>
      </div>

      <div className="absolute bottom-6 right-4 z-[400] bg-white/95 backdrop-blur-sm px-2.5 py-1.5 rounded-lg border border-zinc-200/60 shadow-sm text-[11px] font-mono text-zinc-400 flex flex-col gap-0.5">
        <div>LAT: {centerLat.toFixed(4)}</div>
        <div>LNG: {centerLng.toFixed(4)}</div>
      </div>

      <div className="absolute bottom-6 left-4 z-[400] flex gap-4 bg-white/90 backdrop-blur-md border border-zinc-200/50 p-2 rounded-xl text-[11px] font-sans">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white shadow-sm" />
          <span className="text-zinc-600 font-medium">Matched Creators</span>
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
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        
        <MapEventsHandler onMapClick={onMapClick} />
        <MapUpdater centerLat={centerLat} centerLng={centerLng} />


        
        {/* Center Pinpoint */}
        <Marker 
          position={[centerLat, centerLng]} 
          interactive={false}
          icon={L.divIcon({
            className: 'custom-leaflet-icon-center',
            html: `<div style="background-color: #4f46e5; width: 10px; height: 10px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(79, 70, 229, 0.5);"></div>`,
            iconSize: [10, 10],
            iconAnchor: [5, 5]
          })}
        />

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
                <div className="flex items-center gap-2 mb-2">
                  <img src={creator.avatar} alt={creator.name} className="w-6 h-6 rounded-full object-cover" />
                  <div>
                    <div className="text-xs font-bold leading-tight m-0 p-0">{creator.name}</div>
                    <div className="text-[10px] text-gray-500 m-0 p-0">{creator.handle}</div>
                  </div>
                </div>
                <div className="text-[10px] space-y-1">
                  <div><strong>Matches:</strong> {creator.matchScore}%</div>
                  <div><strong>Audience:</strong> {creator.audienceInLocality}% local</div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
