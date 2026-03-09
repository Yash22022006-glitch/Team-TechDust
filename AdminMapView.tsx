import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
    Plus,
    Minus,
    Crosshair,
    Layers,
    ChevronDown,
    Search,
    Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Hotspot marker icon
const HotspotIcon = (color: string, size: number = 16) => L.divIcon({
    className: 'hotspot-marker',
    html: `<div style="width:${size}px;height:${size}px;background:${color};border-radius:50%;border:2px solid rgba(255,255,255,0.6);box-shadow:0 0 14px ${color}88, 0 0 30px ${color}44;"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
});

// Predictive AI marker (yellow glow)
const PredictiveIcon = L.divIcon({
    className: 'predictive-marker',
    html: `<div style="width:20px;height:20px;background:radial-gradient(circle, #FBBF24 0%, #F59E0B44 60%, transparent 100%);border-radius:50%;animation:pulse 2s infinite;"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
});

function RecenterMap({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, 13);
    }, [center, map]);
    return null;
}

function ZoomControls({ onLocate }: { onLocate: () => void }) {
    const map = useMap();
    return (
        <div className="absolute top-24 right-3 z-[1000] flex flex-col gap-1.5">
            <button
                onClick={() => map.zoomIn()}
                className="w-10 h-10 bg-[#0E1511]/90 backdrop-blur-md border border-white/10 rounded-xl flex items-center justify-center text-white hover:bg-[#1A2E20] transition-colors active:scale-90"
            >
                <Plus size={18} strokeWidth={2.5} />
            </button>
            <button
                onClick={() => map.zoomOut()}
                className="w-10 h-10 bg-[#0E1511]/90 backdrop-blur-md border border-white/10 rounded-xl flex items-center justify-center text-white hover:bg-[#1A2E20] transition-colors active:scale-90"
            >
                <Minus size={18} strokeWidth={2.5} />
            </button>
            <div className="h-1" />
            <button
                onClick={onLocate}
                className="w-10 h-10 bg-[#0E1511]/90 backdrop-blur-md border border-white/10 rounded-xl flex items-center justify-center text-white hover:bg-[#1A2E20] transition-colors active:scale-90"
            >
                <Crosshair size={18} strokeWidth={2} />
            </button>
            <button
                className="w-10 h-10 bg-[#0E1511]/90 backdrop-blur-md border border-white/10 rounded-xl flex items-center justify-center text-white hover:bg-[#1A2E20] transition-colors active:scale-90"
            >
                <Layers size={18} strokeWidth={2} />
            </button>
        </div>
    );
}

interface Hotspot {
    id: string;
    lat: number;
    lng: number;
    type: 'waste' | 'air' | 'water' | 'industrial';
    severity: 'high' | 'medium' | 'low';
}

export default function AdminMapView() {
    const [center, setCenter] = useState<[number, number]>([12.9716, 77.5946]);
    const [filters, setFilters] = useState({
        waste: true,
        air: true,
        water: false,
        industrial: false
    });
    const [timeRange, setTimeRange] = useState('Last 24 Hours');
    const [showTimeDropdown, setShowTimeDropdown] = useState(false);
    const [predictiveAI, setPredictiveAI] = useState(true);

    // Mock hotspots around user's location
    const [hotspots, setHotspots] = useState<Hotspot[]>([]);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const lat = pos.coords.latitude;
                    const lng = pos.coords.longitude;
                    setCenter([lat, lng]);

                    // Generate mock hotspots around user location
                    setHotspots([
                        { id: '1', lat: lat + 0.008, lng: lng - 0.005, type: 'waste', severity: 'high' },
                        { id: '2', lat: lat - 0.004, lng: lng + 0.012, type: 'waste', severity: 'medium' },
                        { id: '3', lat: lat + 0.015, lng: lng + 0.008, type: 'air', severity: 'high' },
                        { id: '4', lat: lat - 0.012, lng: lng - 0.003, type: 'air', severity: 'low' },
                        { id: '5', lat: lat + 0.003, lng: lng - 0.018, type: 'water', severity: 'medium' },
                        { id: '6', lat: lat - 0.008, lng: lng + 0.020, type: 'water', severity: 'high' },
                        { id: '7', lat: lat + 0.020, lng: lng - 0.010, type: 'industrial', severity: 'high' },
                        { id: '8', lat: lat - 0.018, lng: lng - 0.015, type: 'industrial', severity: 'medium' },
                        { id: '9', lat: lat + 0.005, lng: lng + 0.025, type: 'waste', severity: 'low' },
                        { id: '10', lat: lat - 0.025, lng: lng + 0.005, type: 'air', severity: 'medium' },
                        { id: '11', lat: lat + 0.010, lng: lng + 0.015, type: 'waste', severity: 'high' },
                        { id: '12', lat: lat - 0.002, lng: lng - 0.022, type: 'air', severity: 'high' },
                    ]);
                },
                () => {
                    // Fallback hotspots around default location
                    setHotspots([
                        { id: '1', lat: 12.978, lng: 77.590, type: 'waste', severity: 'high' },
                        { id: '2', lat: 12.965, lng: 77.600, type: 'air', severity: 'medium' },
                        { id: '3', lat: 12.980, lng: 77.605, type: 'water', severity: 'high' },
                        { id: '4', lat: 12.960, lng: 77.585, type: 'industrial', severity: 'medium' },
                    ]);
                }
            );
        }
    }, []);

    const handleLocate = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
                setCenter([pos.coords.latitude, pos.coords.longitude]);
            });
        }
    };

    const toggleFilter = (key: keyof typeof filters) => {
        setFilters(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const hotspotColors: Record<string, string> = {
        waste: '#10B981',
        air: '#F59E0B',
        water: '#3B82F6',
        industrial: '#EF4444'
    };

    const filteredHotspots = hotspots.filter(h => filters[h.type]);
    const timeRangeOptions = ['Last 1 Hour', 'Last 6 Hours', 'Last 24 Hours', 'Last 7 Days', 'Last 30 Days'];

    return (
        <div className="h-full w-full relative bg-[#0E1511]">
            {/* Full-screen Map */}
            <MapContainer
                center={center}
                zoom={13}
                className="h-full w-full"
                attributionControl={false}
                zoomControl={false}
            >
                <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />

                {/* Hotspot Markers */}
                {filteredHotspots.map(h => (
                    <React.Fragment key={h.id}>
                        <Marker
                            position={[h.lat, h.lng]}
                            icon={HotspotIcon(hotspotColors[h.type], h.severity === 'high' ? 18 : h.severity === 'medium' ? 14 : 10)}
                        />
                        {h.severity === 'high' && (
                            <Circle
                                center={[h.lat, h.lng]}
                                radius={200}
                                pathOptions={{
                                    fillColor: hotspotColors[h.type],
                                    fillOpacity: 0.08,
                                    color: hotspotColors[h.type],
                                    weight: 1
                                }}
                            />
                        )}
                    </React.Fragment>
                ))}

                {/* Predictive AI markers */}
                {predictiveAI && (
                    <>
                        <Marker position={[center[0] - 0.006, center[1] + 0.004]} icon={PredictiveIcon} />
                        <Marker position={[center[0] + 0.012, center[1] - 0.008]} icon={PredictiveIcon} />
                    </>
                )}

                <RecenterMap center={center} />
                <ZoomControls onLocate={handleLocate} />
            </MapContainer>

            {/* Issue Filters Panel */}
            <div className="absolute top-3 left-3 z-[1000] w-[220px]">
                <div className="bg-[#0E1511]/92 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
                    <h4 className="text-[10px] font-bold text-emerald-500 tracking-widest uppercase mb-3">ISSUE FILTERS</h4>

                    <div className="flex flex-col gap-2.5">
                        {([
                            { key: 'waste' as const, label: 'Waste Accumulation' },
                            { key: 'air' as const, label: 'Air Quality Index' },
                            { key: 'water' as const, label: 'Water Contamination' },
                            { key: 'industrial' as const, label: 'Industrial Emissions' },
                        ]).map(item => (
                            <label key={item.key} className="flex items-center gap-2.5 cursor-pointer group">
                                <div
                                    onClick={() => toggleFilter(item.key)}
                                    className={`w-5 h-5 rounded flex items-center justify-center shrink-0 transition-all ${filters[item.key]
                                        ? 'bg-emerald-500 border-emerald-500'
                                        : 'bg-transparent border border-white/20 group-hover:border-white/40'
                                        }`}
                                >
                                    {filters[item.key] && (
                                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                            <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    )}
                                </div>
                                <span className="text-xs text-neutral-200">{item.label}</span>
                            </label>
                        ))}
                    </div>

                    <h4 className="text-[10px] font-bold text-emerald-500 tracking-widest uppercase mt-4 mb-2">TIME RANGE</h4>

                    <div className="relative">
                        <button
                            onClick={() => setShowTimeDropdown(!showTimeDropdown)}
                            className="w-full bg-[#1A2E20] border border-white/10 rounded-xl px-3 py-2.5 flex items-center justify-between text-xs text-white hover:border-emerald-500/30 transition-colors"
                        >
                            <span>{timeRange}</span>
                            <ChevronDown size={14} className={`text-neutral-400 transition-transform ${showTimeDropdown ? 'rotate-180' : ''}`} />
                        </button>
                        <AnimatePresence>
                            {showTimeDropdown && (
                                <motion.div
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -4 }}
                                    className="absolute top-full left-0 right-0 mt-1 bg-[#121E16] border border-white/10 rounded-xl overflow-hidden shadow-xl"
                                >
                                    {timeRangeOptions.map(opt => (
                                        <button
                                            key={opt}
                                            onClick={() => { setTimeRange(opt); setShowTimeDropdown(false); }}
                                            className={`w-full text-left px-3 py-2 text-xs hover:bg-emerald-500/10 transition-colors ${opt === timeRange ? 'text-emerald-500 bg-emerald-500/5' : 'text-neutral-300'}`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Predictive AI Card */}
                <div className="mt-3 bg-[#0E1511]/92 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                            </div>
                            <span className="text-sm font-bold text-white">Predictive AI</span>
                        </div>
                        {/* Toggle Switch */}
                        <button
                            onClick={() => setPredictiveAI(!predictiveAI)}
                            className={`w-12 h-6 rounded-full p-0.5 transition-colors ${predictiveAI ? 'bg-emerald-500' : 'bg-neutral-600'}`}
                        >
                            <motion.div
                                className="w-5 h-5 bg-white rounded-full shadow-md"
                                animate={{ x: predictiveAI ? 24 : 0 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            />
                        </button>
                    </div>
                    <p className="text-[10px] text-neutral-400 leading-relaxed">
                        Modeling future hotspots based on satellite data & historical dumping patterns.
                    </p>
                </div>
            </div>

            {/* Bottom Stats */}
            <div className="absolute bottom-4 left-3 right-3 z-[1000] grid grid-cols-2 gap-3">
                <div className="bg-[#0E1511]/92 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                        <div className="relative">
                            <div className="w-3 h-3 border-2 border-red-500 rounded-full" />
                            <div className="absolute -top-0.5 -left-1 w-1.5 h-3 border-l-2 border-red-500 rounded-l-full" />
                            <div className="absolute -top-0.5 -right-1 w-1.5 h-3 border-r-2 border-red-500 rounded-r-full" />
                        </div>
                    </div>
                    <div>
                        <div className="text-[9px] text-neutral-400 uppercase tracking-wider font-bold">Active Hotspots</div>
                        <div className="flex items-end gap-2">
                            <span className="text-2xl font-bold leading-none">{filteredHotspots.length}</span>
                            <span className="text-[10px] text-emerald-500 font-bold mb-0.5">+2 <span className="text-red-400">New</span></span>
                        </div>
                    </div>
                </div>

                <div className="bg-[#0E1511]/92 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-500">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M7 10L9 12L13 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <div>
                        <div className="text-[9px] text-neutral-400 uppercase tracking-wider font-bold">Resolved Area</div>
                        <div className="flex items-end gap-2">
                            <span className="text-2xl font-bold leading-none">84</span>
                            <span className="text-[10px] text-emerald-500 font-bold mb-0.5">+12%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
