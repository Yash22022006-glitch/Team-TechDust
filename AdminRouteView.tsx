import React from 'react';
import {
    Navigation, MapPin, Clock, Leaf, Plus, Minus, ChevronDown, Check,
    MoreVertical, Wand2
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { motion, AnimatePresence } from 'motion/react';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom markers
const AdminLiveDotIcon = L.divIcon({
    className: 'custom-live-marker',
    html: `<div style="width:20px;height:20px;background:#4285F4;border-radius:50%;border:3px solid white;box-shadow:0 0 10px rgba(66,133,244,0.5);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
});

const AdminDestinationIcon = L.divIcon({
    className: 'custom-task-marker',
    html: `
    <div style="display: flex; align-items: center; justify-content: center; filter: drop-shadow(0px 4px 4px rgba(0,0,0,0.4)); mb-2">
        <svg width="36" height="36" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 0C8.268 0 2 6.268 2 14c0 10.5 14 18 14 18s14-7.5 14-18c0-7.732-6.268-14-14-14zm0 20c-3.314 0-6-2.686-6-6s2.686-6 6-6 6 2.686 6 6-2.686 6-6 6z" fill="#EA4335" stroke="white" stroke-width="1.5"/>
        </svg>
    </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36]
});

// Component to handle recentering the map
function AdminRecenterMap({ center, zoom }: { center: [number, number], zoom?: number }) {
    const map = useMap();
    React.useEffect(() => {
        if (!center || typeof center[0] !== 'number' || typeof center[1] !== 'number' || !isFinite(center[0]) || !isFinite(center[1])) return;
        map.flyTo(center, zoom || map.getZoom(), { duration: 1.5 });
    }, [center, zoom, map]);
    return null;
}

// Distance calculation
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}

export default function AdminRouteView({ reports }: { reports: any[] }) {
    // We simulate following an active worker on a route
    const pendingTasks = reports.filter(r => r.status === 'pending' || r.status === 'assigned');
    const activeTask = pendingTasks.length > 0 ? pendingTasks[0] : null;

    const defaultCenter: [number, number] = activeTask
        ? [Number(activeTask.location_lat), Number(activeTask.location_lng)]
        : [12.9716, 77.5946];

    // Simulated worker drone/truck location slightly offset En-route
    const liveLocation: [number, number] = [
        defaultCenter[0] - 0.009,
        defaultCenter[1] - 0.009
    ];

    const distanceKm = calculateDistance(liveLocation[0], liveLocation[1], defaultCenter[0], defaultCenter[1]);
    const estTimeMin = Math.max(1, Math.ceil(distanceKm * 12));

    return (
        <div className="flex flex-col h-full bg-[#0A0F0C] text-white font-sans overflow-hidden relative font-medium pb-[70px]">

            {/* Living Route Map Background */}
            <div className="absolute inset-0 z-0 bg-[#0A0F0C] w-full h-full">
                {isFinite(defaultCenter[0]) && isFinite(defaultCenter[1]) && (
                    <MapContainer
                        center={defaultCenter}
                        zoom={14}
                        style={{ height: '100%', width: '100%', opacity: 0.6 }}
                        zoomControl={false}
                    >
                        <TileLayer
                            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                        />

                        {/* Truck/Worker Live Location */}
                        <Marker position={liveLocation} icon={AdminLiveDotIcon} />

                        {/* Task Destination */}
                        <Marker position={defaultCenter} icon={AdminDestinationIcon} />

                        {/* Google Maps style route line (outline + inner line) */}
                        <Polyline
                            positions={[liveLocation, defaultCenter]}
                            pathOptions={{ color: '#174EA6', weight: 9, opacity: 0.9 }}
                        />
                        <Polyline
                            positions={[liveLocation, defaultCenter]}
                            pathOptions={{ color: '#4285F4', weight: 5, opacity: 1 }}
                        />

                        <AdminRecenterMap center={[
                            (liveLocation[0] + defaultCenter[0]) / 2,
                            (liveLocation[1] + defaultCenter[1]) / 2
                        ]} zoom={15} />

                    </MapContainer>
                )}
            </div>

            {/* Float UI Controls */}
            <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                <button className="w-10 h-10 bg-[#17201B] border border-white/5 rounded-xl flex items-center justify-center text-white shadow-lg active:scale-95 transition-transform">
                    <Plus size={20} />
                </button>
                <button className="w-10 h-10 bg-[#17201B] border border-white/5 rounded-xl flex items-center justify-center text-white shadow-lg active:scale-95 transition-transform">
                    <Minus size={20} />
                </button>
            </div>

            {/* Bottom Overlay UI (Exact replication) */}
            <div className="flex-1 relative z-10 flex flex-col justify-end px-4 pb-0 pointer-events-none gap-2">

                {/* Optimization Alert */}
                <div className="bg-emerald-500/20 backdrop-blur-md border border-emerald-500/50 rounded-xl px-4 py-3 flex items-center justify-between shadow-[0_0_20px_rgba(46,213,115,0.15)] pointer-events-auto w-full max-w-sm mx-auto">
                    <div className="flex items-center gap-2 text-emerald-500">
                        <Wand2 size={14} className="fill-emerald-500/20" />
                        <span className="text-[10px] font-bold tracking-widest uppercase">Route Optimization Available</span>
                    </div>
                    <button className="bg-emerald-500 text-black text-[10px] font-bold px-3 py-1.5 rounded-lg active:scale-95 transition-transform shadow-[0_2px_10px_rgba(46,213,115,0.3)]">
                        OPTIMIZE NOW
                    </button>
                </div>

                {/* Main Action Card */}
                <div className="bg-[#17201B] border border-white/5 rounded-t-3xl p-5 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] pointer-events-auto">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-[9px] font-bold text-[#2ED573] uppercase tracking-[0.1em]">Current Sequence</span>
                        <div className="px-3 py-1 bg-[#2ED573]/10 border border-[#2ED573]/30 rounded-full">
                            <span className="text-[10px] font-bold text-[#2ED573]">Task 1/5</span>
                        </div>
                    </div>

                    <h2 className="text-xl font-bold mb-1 tracking-tight truncate">
                        {activeTask ? activeTask.description || activeTask.type.replace('_', ' ') : 'Main St. Plaza Cleanup'}
                    </h2>
                    <div className="flex items-center gap-1.5 text-neutral-400 mb-6">
                        <MapPin size={12} className="fill-neutral-400 text-[#17201B]" />
                        <span className="text-[11px] truncate">
                            {activeTask ? `Lat: ${activeTask.location_lat?.toFixed(4)}, Lng: ${activeTask.location_lng?.toFixed(4)}` : '1420 Market Street, Downtown'}
                        </span>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 divide-x divide-white/5 mb-6">
                        <div className="flex flex-col items-center justify-center">
                            <MapPin size={16} className="text-[#2ED573] mb-1 fill-[#2ED573] stroke-[#17201B]" />
                            <span className="font-bold text-sm tracking-wide">{distanceKm.toFixed(1)} km</span>
                            <span className="text-[8px] text-neutral-500 uppercase tracking-widest mt-0.5">Distance</span>
                        </div>
                        <div className="flex flex-col items-center justify-center">
                            <Clock size={16} className="text-[#2ED573] mb-1" />
                            <span className="font-bold text-sm tracking-wide">{estTimeMin} min</span>
                            <span className="text-[8px] text-neutral-500 uppercase tracking-widest mt-0.5">Est. Time</span>
                        </div>
                        <div className="flex flex-col items-center justify-center">
                            <Leaf size={16} className="text-[#2ED573] mb-1" />
                            <span className="font-bold text-sm tracking-wide">450</span>
                            <span className="text-[8px] text-neutral-500 uppercase tracking-widest mt-0.5">Eco-Points</span>
                        </div>
                    </div>

                    {/* Action Area */}
                    <div className="flex items-center gap-3 w-full border-t border-white/5 pt-5 mt-2">
                        <button className="flex-1 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all outline-none border-2 border-transparent bg-[#2ED573] hover:bg-[#2ada6a] text-black shadow-[0_5px_20px_rgba(46,213,115,0.25)]">
                            <Navigation size={18} className="fill-black stroke-black" />
                            <span className="text-sm tracking-wide">Start Navigation</span>
                        </button>
                        <button className="w-12 h-12 shrink-0 bg-[#253028] hover:bg-[#2d3a31] rounded-xl flex items-center justify-center active:scale-95 transition-transform text-neutral-400 shadow-[0_5px_20px_rgba(0,0,0,0.5)] border border-white/5">
                            <MoreVertical size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
