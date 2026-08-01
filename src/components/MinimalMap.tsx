import React, { useState, useMemo, useEffect } from 'react';
import { Creator } from '../types';
import { CREATORS } from '../data';
import { MapPin, Compass, Users } from 'lucide-react';
import { MapContainer, TileLayer, Circle, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion } from 'motion/react';

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
    
    // Fix Leaflet's tile loading bug when mounted inside a flex/animating container
    const t = setTimeout(() => {
      map.invalidateSize();
    }, 400); // 400ms allows Framer Motion animations to finish expanding the layout
    
    return () => clearTimeout(t);
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

  // Create animated SVG pulse markers for leaflet
  const createIcon = (isSelected: boolean, isInside: boolean) => {
    const color = isSelected ? '#6366F1' : '#10B981';
    const glowColor = isSelected ? 'rgba(99,102,241,0.9)' : 'rgba(16,185,129,0.8)';
    const size = isSelected ? 18 : 14;
    const offset = size / 2;
    const pulseColor = isSelected ? 'rgba(99,102,241,0.4)' : 'rgba(16,185,129,0.35)';
    const pulseDuration = isSelected ? '1.5s' : '2s';

    return L.divIcon({
      className: 'custom-leaflet-icon',
      html: `
        <div style="position:relative;width:${size}px;height:${size}px;">
          <div style="
            position:absolute;inset:-6px;
            border-radius:50%;
            background:${pulseColor};
            animation:ping ${pulseDuration} cubic-bezier(0,0,0.2,1) infinite;
          "></div>
          <div style="
            width:${size}px;height:${size}px;
            border-radius:50%;
            background:${color};
            border:2px solid rgba(255,255,255,0.9);
            box-shadow:0 0 0 2px ${color},0 0 16px ${glowColor};
            position:relative;z-index:1;
          "></div>
        </div>
        <style>
          @keyframes ping{75%,100%{transform:scale(2);opacity:0}}
        </style>
      `,
      iconSize: [size, size],
      iconAnchor: [offset, offset],
    });
  };

  return (
    <div className="relative w-full h-[380px] md:h-[460px] rounded-2xl overflow-hidden select-none z-0" style={{ background: '#0F1115', border: '1px solid rgba(255,255,255,0.08)' }}>
      
      {/* Top-left overlay: engine label */}
      <div className="absolute top-4 left-4 z-[400] flex flex-col gap-2 pointer-events-none">
        <div style={{ background: 'rgba(15,17,21,0.85)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderTopColor: 'rgba(255,255,255,0.18)', borderRadius: '10px' }} className="px-3 py-1.5 flex items-center gap-2">
          <Compass className="w-3.5 h-3.5 text-indigo-400 animate-spin-slow" />
          <span className="text-[11px] font-mono font-semibold text-zinc-300 tracking-widest uppercase">Location Engine</span>
        </div>
      </div>

      {/* Bottom-right: coordinates */}
      <div className="absolute bottom-5 right-4 z-[400] text-[10px] font-mono text-zinc-400 flex flex-col gap-0.5" style={{ background: 'rgba(15,17,21,0.8)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', padding: '6px 10px' }}>
        <div>LAT: {centerLat.toFixed(4)}</div>
        <div>LNG: {centerLng.toFixed(4)}</div>
      </div>



      <MapContainer 
        center={[centerLat, centerLng]} 
        zoom={11} 
        style={{ width: '100%', height: '100%', zIndex: 1, background: '#0F1115' }}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        <MapEventsHandler onMapClick={onMapClick} />
        <MapUpdater centerLat={centerLat} centerLng={centerLng} />
        
        {/* Center Pinpoint — bright violet with double ring */}
        <Marker
          position={[centerLat, centerLng]}
          interactive={false}
          icon={L.divIcon({
            className: 'custom-leaflet-icon-center',
            html: `
              <div style="position:relative;width:16px;height:16px;">
                <div style="
                  position:absolute;inset:-8px;
                  border-radius:50%;
                  background:rgba(99,102,241,0.25);
                  animation:ping 1.8s cubic-bezier(0,0,0.2,1) infinite;
                "></div>
                <div style="
                  width:16px;height:16px;
                  border-radius:50%;
                  background:#6366F1;
                  border:2.5px solid rgba(255,255,255,0.95);
                  box-shadow:0 0 0 3px rgba(99,102,241,0.4),0 0 24px rgba(99,102,241,0.7);
                  position:relative;z-index:1;
                "></div>
              </div>
              <style>@keyframes ping{75%,100%{transform:scale(2);opacity:0}}</style>
            `,
            iconSize: [16, 16],
            iconAnchor: [8, 8],
          })}
        />

      </MapContainer>
    </div>
  );
}
