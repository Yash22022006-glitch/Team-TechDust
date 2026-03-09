import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import { AlertTriangle, Trash2, Flame, Wind, Droplets, Plus, Minus } from 'lucide-react';

// Define colors based on the legend
const COLORS = {
  garbage: '#EAB308', // Yellow
  burning: '#F97316', // Orange
  smoke: '#9CA3AF',   // Gray
  water_pollution: '#3B82F6', // Blue
  other: '#EF4444'    // Red
};

const createColoredIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px ${color}88;"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6]
  });
};

const typeIcons: Record<string, React.ReactNode> = {
  garbage: <Trash2 className="text-yellow-500" />,
  burning: <Flame className="text-orange-500" />,
  smoke: <Wind className="text-gray-400" />,
  water_pollution: <Droplets className="text-blue-500" />,
  other: <AlertTriangle className="text-red-500" />
};

// Custom icon for user location
const UserIcon = L.divIcon({
  className: 'user-location-marker',
  html: `<div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-[0_0_10px_rgba(59,130,246,0.8)] animate-pulse"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

interface Report {
  id: number;
  type: string;
  confidence: number;
  location_lat: number;
  location_lng: number;
  image_url: string;
  description: string;
  created_at: string;
}

export default function MapDashboard({ reports }: { reports: Report[] }) {
  const [center, setCenter] = useState<[number, number]>([12.9716, 77.5946]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setCenter([pos.coords.latitude, pos.coords.longitude]);
      });
    }
  }, []);

  return (
    <div className="h-full w-full relative rounded-xl overflow-hidden border border-white/10 shadow-2xl">
      <MapContainer 
        center={center} 
        zoom={13} 
        className="h-full w-full" 
        attributionControl={false}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        {/* User Current Location Marker (Live Location Pointer) */}
        {center && (
          <>
            <Marker position={center} icon={UserIcon}>
              <Popup>
                <div className="text-xs font-bold text-blue-600">You are here</div>
              </Popup>
            </Marker>
            <Circle 
              center={center} 
              radius={200} 
              pathOptions={{ fillColor: '#3b82f6', fillOpacity: 0.1, color: '#3b82f6', weight: 1 }} 
            />
          </>
        )}

        {reports.map((report) => (
          <Marker 
            key={report.id} 
            position={[report.location_lat, report.location_lng]}
            icon={createColoredIcon(COLORS[report.type as keyof typeof COLORS] || COLORS.other)}
          >
            <Popup className="custom-popup">
              <div className="p-2 min-w-[200px]">
                <div className="flex items-center gap-2 mb-2">
                  {typeIcons[report.type] || <AlertTriangle />}
                  <h3 className="font-bold capitalize text-gray-900">{report.type.replace('_', ' ')}</h3>
                </div>
                {report.image_url && (
                  <img 
                    src={report.image_url} 
                    alt="Violation" 
                    className="w-full h-32 object-cover rounded mb-2"
                    referrerPolicy="no-referrer"
                  />
                )}
                <p className="text-xs text-gray-600 mb-1">{report.description}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-[10px] text-gray-400">
                    {new Date(report.created_at).toLocaleString()}
                  </span>
                  <span className="text-[10px] font-mono bg-gray-100 px-1 rounded">
                    {(report.confidence * 100).toFixed(1)}% conf
                  </span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
        
        <RecenterMap center={center} />
        <CustomZoomControls />
      </MapContainer>
    </div>
  );
}

function RecenterMap({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
}

function CustomZoomControls() {
  const map = useMap();

  return (
    <div className="absolute top-4 right-4 z-[1000] flex flex-col items-center">
      <div className="bg-emerald-500/10 backdrop-blur-md border border-emerald-500/30 rounded-full p-0.5 flex flex-col gap-0.5 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
        <button 
          onClick={() => map.zoomIn()}
          className="w-6 h-6 bg-emerald-500 hover:bg-emerald-400 text-black rounded-full flex items-center justify-center transition-all active:scale-90 shadow-md"
          title="Zoom In"
        >
          <Plus size={12} strokeWidth={4} />
        </button>
        <div className="w-full h-[1px] bg-emerald-500/10 mx-auto" />
        <button 
          onClick={() => map.zoomOut()}
          className="w-6 h-6 bg-emerald-500 hover:bg-emerald-400 text-black rounded-full flex items-center justify-center transition-all active:scale-90 shadow-md"
          title="Zoom Out"
        >
          <Minus size={12} strokeWidth={4} />
        </button>
      </div>
    </div>
  );
}
