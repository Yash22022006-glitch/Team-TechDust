import React from 'react';
import {
    ArrowLeft, Layers, Search, Mic, Plus, Minus, Check, Camera,
    Wand2, Target, MapPin, Clock, Leaf, Navigation,
    MoreVertical, ClipboardList, Map as MapIcon, TrendingUp, User, ChevronDown
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom markers
const LiveDotIcon = L.divIcon({
    className: 'custom-live-marker',
    html: `<div style="width:20px;height:20px;background:#4285F4;border-radius:50%;border:3px solid white;box-shadow:0 0 10px rgba(66,133,244,0.5);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
});

const NavArrowIcon = L.divIcon({
    className: 'custom-nav-marker',
    html: `
    <div style="transform: rotate(45deg); display: flex; align-items: center; justify-content: center; filter: drop-shadow(0px 4px 6px rgba(0,0,0,0.4));">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 21l10-3 10 3L12 2z" fill="#4285F4" stroke="white" stroke-width="2" stroke-linejoin="round"/>
        </svg>
    </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20]
});

const DestinationIcon = L.divIcon({
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
function RecenterMap({ center, zoom }: { center: [number, number], zoom?: number }) {
    const map = useMap();
    React.useEffect(() => {
        if (!center || typeof center[0] !== 'number' || typeof center[1] !== 'number' || !isFinite(center[0]) || !isFinite(center[1])) return;
        map.flyTo(center, zoom || map.getZoom(), { duration: 1.5 });
    }, [center, zoom, map]);
    return null;
}

// Force Leaflet to recalculate container size after React mounts it
// This fixes maps showing as blank/grey when rendered inside hidden tabs
function InvalidateSize() {
    const map = useMap();
    React.useEffect(() => {
        // Small delay to let React finish layout
        const timer = setTimeout(() => {
            map.invalidateSize();
        }, 100);
        return () => clearTimeout(timer);
    }, [map]);
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

interface WorkerViewProps {
    role: string;
    setRole: (role: any) => void;
    reports?: any[];
    onTaskCompleted?: () => void;
}

export default function WorkerView({ role, setRole, reports = [], onTaskCompleted }: WorkerViewProps) {
    const [activeWorkerTab, setActiveWorkerTab] = React.useState<'tasks' | 'route' | 'history' | 'profile'>('tasks');
    const [activeTask, setActiveTask] = React.useState<any | null>(null);
    const [navigationStatus, setNavigationStatus] = React.useState<'idle' | 'navigating' | 'arrived'>('idle');
    const [isUploadingCompletion, setIsUploadingCompletion] = React.useState(false);
    const [completionImagePreview, setCompletionImagePreview] = React.useState<string | null>(null);
    const [isSubmittingCompletion, setIsSubmittingCompletion] = React.useState(false);
    const [realLocation, setRealLocation] = React.useState<[number, number] | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // Auto-select first task when entering Route tab without a task
    React.useEffect(() => {
        if (activeWorkerTab === 'route' && !activeTask) {
            const pending = reports.filter(r => r.status === 'pending' || r.status === 'assigned');
            if (pending.length > 0) {
                setActiveTask(pending[0]);
            }
        }
    }, [activeWorkerTab, activeTask, reports]);

    React.useEffect(() => {
        if (!navigator.geolocation) {
            console.error("Geolocation is not supported by your browser");
            return;
        }

        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                setRealLocation([position.coords.latitude, position.coords.longitude]);
            },
            (error) => {
                console.error("Error getting location:", error);
            },
            { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
        );

        return () => navigator.geolocation.clearWatch(watchId);
    }, []);

    const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCompletionImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmitCompletion = async () => {
        if (!activeTask || !completionImagePreview) return;
        setIsSubmittingCompletion(true);
        try {
            const response = await fetch(`/api/reports/${activeTask.id}/resolve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ proof_image_url: completionImagePreview })
            });

            if (response.ok) {
                setNavigationStatus('idle');
                setCompletionImagePreview(null);
                setIsUploadingCompletion(false);
                setActiveWorkerTab('tasks');
                setActiveTask(null);
                if (onTaskCompleted) {
                    onTaskCompleted();
                }
            } else {
                const errorText = await response.text();
                console.error("Failed to submit completion:", errorText);
                alert(`Submission failed: ${errorText}`);
            }
        } catch (err: any) {
            console.error("Error submitting completion:", err);
            alert(`Network Error: ${err.message}`);
        } finally {
            setIsSubmittingCompletion(false);
        }
    };

    const pendingTasks = reports.filter(r => r.status === 'pending' || r.status === 'assigned');

    const defaultCenter: [number, number] = activeTask
        ? [Number(activeTask.location_lat), Number(activeTask.location_lng)]
        : pendingTasks.length > 0
            ? [Number(pendingTasks[0].location_lat), Number(pendingTasks[0].location_lng)]
            : [13.1143, 80.1548];

    // Use the real tracker, fallback to simulated center if GPS isn't available yet
    // Offset of 0.0076° in lat/lng = ~1.2km diagonal (1° lat ≈ 111.32km)
    const liveLocation: [number, number] = realLocation && typeof realLocation[0] === 'number' && !isNaN(realLocation[0])
        ? realLocation
        : [
            (defaultCenter && !isNaN(defaultCenter[0]) ? defaultCenter[0] : 13.1143) - 0.0076,
            (defaultCenter && !isNaN(defaultCenter[1]) ? defaultCenter[1] : 80.1548) - 0.0076
        ];

    // Calculate real dynamic distance and time
    const targetLocation: [number, number] = activeTask
        ? [Number(activeTask.location_lat), Number(activeTask.location_lng)]
        : defaultCenter;
    const rawDistanceKm = calculateDistance(liveLocation[0], liveLocation[1], targetLocation[0], targetLocation[1]);
    // Use real distance if GPS is active and distance is reasonable, otherwise show default 1.2 km
    const distanceKm = realLocation && rawDistanceKm < 50 ? rawDistanceKm : 1.2;
    const estTimeMin = Math.max(1, Math.ceil(distanceKm * 12));

    console.log("Routing coordinates check:", {
        liveLocation,
        targetLocation,
        defaultCenter,
        navigationStatus,
        activeTaskLat: activeTask?.location_lat,
        activeTaskLng: activeTask?.location_lng
    });

    return (
        <div className="flex flex-col h-screen bg-[#0A0F0C] text-white font-sans overflow-hidden relative font-medium pb-[70px]">

            {activeWorkerTab === 'tasks' && (
                <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24 bg-black h-full">
                    <h1 className="text-2xl font-bold mb-6 mt-2 tracking-tight">Assigned Tasks</h1>
                    {pendingTasks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-neutral-400">
                            <ClipboardList size={40} className="mb-3 opacity-20" />
                            <p>No pending tasks available.</p>
                        </div>
                    ) : (
                        pendingTasks.map((task) => (
                            <div key={task.id} className="bg-[#17201B] border border-white/5 rounded-2xl p-4 shadow-xl">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] uppercase font-bold text-[#2ED573] bg-[#2ED573]/10 px-2 py-0.5 rounded">
                                        {task.type.replace('_', ' ')}
                                    </span>
                                    <span className="text-[10px] text-neutral-500 font-mono">
                                        {new Date(task.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <h3 className="font-bold text-lg mb-1 truncate">{task.description || "Environmental Issue"}</h3>
                                <div className="flex items-center gap-1.5 text-neutral-400 mb-4">
                                    <MapPin size={12} className="fill-neutral-400 text-[#17201B]" />
                                    <span className="text-[11px] truncate">Lat: {task.location_lat?.toFixed(4)}, Lng: {task.location_lng?.toFixed(4)}</span>
                                </div>
                                <button
                                    onClick={() => {
                                        setActiveTask(task);
                                        setActiveWorkerTab('route');
                                    }}
                                    className="w-full bg-[#2ED573]/20 hover:bg-[#2ED573]/30 text-[#2ED573] border border-[#2ED573]/30 font-bold py-2.5 rounded-xl transition-colors active:scale-95 text-sm"
                                >
                                    Take Task
                                </button>
                            </div>
                        ))
                    )}
                </div>
            )}

            {activeWorkerTab === 'route' && (
                <>
                    {/* Full-screen Map Background */}
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
                        <MapContainer
                            center={isFinite(defaultCenter[0]) && isFinite(defaultCenter[1]) ? defaultCenter : [13.1143, 80.1548]}
                            zoom={14}
                            style={{ height: '100vh', width: '100%' }}
                            zoomControl={false}
                            whenReady={(mapInstance: any) => {
                                // Force Leaflet to recalculate container size
                                setTimeout(() => {
                                    mapInstance.target.invalidateSize();
                                }, 200);
                            }}
                        >
                            <TileLayer
                                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                            />

                            <InvalidateSize />

                            {/* Always show worker location marker */}
                            {navigationStatus === 'idle' ? (
                                <Marker position={liveLocation} icon={LiveDotIcon} />
                            ) : (
                                <Marker position={liveLocation} icon={NavArrowIcon} />
                            )}

                            {/* Destination marker when task is active */}
                            {activeTask && (
                                <>
                                    <Marker position={[Number(activeTask.location_lat), Number(activeTask.location_lng)]} icon={DestinationIcon} />
                                    {navigationStatus !== 'idle' ? (
                                        <RecenterMap center={liveLocation} zoom={18} />
                                    ) : (
                                        <RecenterMap center={[
                                            (liveLocation[0] + Number(activeTask?.location_lat || liveLocation[0])) / 2,
                                            (liveLocation[1] + Number(activeTask?.location_lng || liveLocation[1])) / 2
                                        ]} zoom={15} />
                                    )}
                                </>
                            )}

                            {/* If no task is active, just center on live location */}
                            {!activeTask && (
                                <RecenterMap center={liveLocation} zoom={14} />
                            )}
                        </MapContainer>
                    </div>

                    {/* Center Content / Floating UI Layers */}
                    <div className="flex-1 relative z-10 flex flex-col justify-end px-4 pb-24 pointer-events-none">

                        {/* IDLE STATE: Main Task Sequence Card */}
                        {navigationStatus === 'idle' && (
                            <div className="bg-[#17201B] border border-white/5 rounded-3xl p-5 shadow-2xl pointer-events-auto">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[9px] font-bold text-[#2ED573] uppercase tracking-[0.1em]">Current Sequence</span>
                                    <div className="px-3 py-1 bg-[#2ED573]/10 border border-[#2ED573]/30 rounded-full">
                                        <span className="text-[10px] font-bold text-[#2ED573]">Task 1/5</span>
                                    </div>
                                </div>

                                <h2 className="text-xl font-bold mb-1 tracking-tight">
                                    {activeTask ? activeTask.description || activeTask.type.replace('_', ' ') : 'Main St. Plaza Cleanup'}
                                </h2>
                                <div className="flex items-center gap-1.5 text-neutral-400 mb-6">
                                    <MapPin size={12} className="fill-neutral-400 text-[#17201B]" />
                                    <span className="text-[11px]">
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
                                        <Clock size={16} className="text-[#2ED573] mb-1 fill-[#2ED573] stroke-[#17201B]" />
                                        <span className="font-bold text-sm tracking-wide">{estTimeMin} min</span>
                                        <span className="text-[8px] text-neutral-500 uppercase tracking-widest mt-0.5">Est. Time</span>
                                    </div>
                                    <div className="flex flex-col items-center justify-center">
                                        <Leaf size={16} className="text-[#2ED573] mb-1 fill-[#2ED573] stroke-[#17201B]" />
                                        <span className="font-bold text-sm tracking-wide text-white">450</span>
                                        <span className="text-[8px] text-neutral-500 uppercase tracking-widest mt-0.5">Eco-Points</span>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-3 w-full border-t border-white/5 pt-5 mt-2">
                                    <button
                                        onClick={() => {
                                            if (activeTask) {
                                                const lat = Number(activeTask.location_lat);
                                                const lng = Number(activeTask.location_lng);
                                                // Open Google Maps with directions
                                                window.open(
                                                    `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`,
                                                    '_blank'
                                                );
                                            }
                                            setNavigationStatus('navigating');
                                        }}
                                        className="w-full font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all outline-none border-2 border-transparent bg-[#2ED573] hover:bg-[#2ada6a] text-black shadow-lg shadow-[#2ED573]/20"
                                    >
                                        <Navigation size={18} className="fill-black stroke-black" />
                                        <span className="text-sm">Start Navigation</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* NAVIGATING STATE: Minimal Mark as Arrived Button */}
                        {navigationStatus === 'navigating' && (
                            <div className="pointer-events-auto flex justify-center mb-6">
                                <button
                                    onClick={() => setNavigationStatus('arrived')}
                                    className="bg-[#24B161] hover:bg-[#2ED573] text-black font-bold py-4 px-10 rounded-full flex items-center justify-center gap-3 active:scale-95 transition-all shadow-[0_10px_30px_rgba(46,213,115,0.4)] border-2 border-[#1E2922]"
                                >
                                    <MapPin size={22} className="fill-black stroke-[#24B161]" />
                                    <span className="text-base tracking-wide uppercase">Mark as Arrived</span>
                                </button>
                            </div>
                        )}

                        {/* ARRIVED STATE: Success Confirmation or Completion Upload */}
                        {navigationStatus === 'arrived' && (
                            <div className="bg-[#17201B] border border-[#2ED573]/40 rounded-3xl p-6 shadow-[0_10px_40px_rgba(46,213,115,0.2)] pointer-events-auto text-center flex flex-col items-center animate-in fade-in slide-in-from-bottom-5 duration-500">
                                {!isUploadingCompletion ? (
                                    <>
                                        <div className="w-20 h-20 bg-[#2ED573]/20 rounded-full flex items-center justify-center mb-5 border-4 border-[#2ED573]">
                                            <Check className="text-[#2ED573]" size={40} strokeWidth={4} />
                                        </div>
                                        <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Successfully Reached!</h2>
                                        <p className="text-neutral-400 text-sm mb-6 max-w-[250px] leading-relaxed">You have arrived at the designated task location. Safe to proceed.</p>
                                        <button
                                            onClick={() => setIsUploadingCompletion(true)}
                                            className="w-full bg-[#2ED573] hover:bg-[#2ada6a] text-black font-bold py-4 rounded-xl active:scale-95 transition-all text-sm uppercase tracking-wide shadow-[0_5px_15px_rgba(46,213,115,0.3)]"
                                        >
                                            Capture Completion
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <h2 className="text-xl font-bold text-white mb-1 tracking-tight">Task Completion</h2>
                                        <p className="text-neutral-400 text-xs mb-5">Please provide photographic evidence of the resolved issue.</p>

                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className="w-full h-40 bg-black/40 border-2 border-dashed border-[#2ED573]/30 rounded-2xl mb-5 flex flex-col items-center justify-center cursor-pointer hover:border-[#2ED573]/60 transition-colors overflow-hidden relative"
                                        >
                                            {completionImagePreview ? (
                                                <img src={completionImagePreview} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <>
                                                    <div className="w-12 h-12 bg-[#2ED573]/10 rounded-full flex items-center justify-center mb-2">
                                                        <Camera size={24} className="text-[#2ED573]" />
                                                    </div>
                                                    <span className="text-sm font-bold text-[#2ED573]">Tap to Capture</span>
                                                </>
                                            )}
                                        </div>

                                        <input
                                            type="file"
                                            accept="image/*"
                                            capture="environment"
                                            ref={fileInputRef}
                                            onChange={handleImageCapture}
                                            className="hidden"
                                        />

                                        <div className="flex gap-3 w-full">
                                            <button
                                                onClick={() => {
                                                    setIsUploadingCompletion(false);
                                                    setCompletionImagePreview(null);
                                                }}
                                                className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-3.5 rounded-xl border border-white/10 transition-colors text-sm"
                                            >
                                                Back
                                            </button>
                                            <button
                                                onClick={handleSubmitCompletion}
                                                disabled={!completionImagePreview || isSubmittingCompletion}
                                                className="flex-[2] bg-[#2ED573] hover:bg-[#2ada6a] disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-3.5 rounded-xl active:scale-95 transition-all text-sm uppercase tracking-wide shadow-lg"
                                            >
                                                {isSubmittingCompletion ? 'Submitting...' : 'Submit Work'}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* HISTORY TAB: Completed Tasks */}
            {activeWorkerTab === 'history' && (
                <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24 bg-black h-full">
                    <h1 className="text-2xl font-bold mb-2 mt-2 tracking-tight">Work History</h1>
                    <p className="text-neutral-500 text-xs mb-6">Your completed duties and resolved tasks</p>

                    {reports.filter(r => r.status === 'resolved' || r.status === 'completed').length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-neutral-400">
                            <Clock size={40} className="mb-3 opacity-20" />
                            <p>No completed tasks yet.</p>
                            <p className="text-xs text-neutral-600 mt-1">Tasks you complete will appear here.</p>
                        </div>
                    ) : (
                        reports.filter(r => r.status === 'resolved' || r.status === 'completed').map((task) => (
                            <HistoryCard key={task.id} task={task} />
                        ))
                    )}
                </div>
            )}

            {/* PROFILE TAB */}
            {activeWorkerTab === 'profile' && (
                <div className="flex-1 overflow-y-auto p-4 pb-24 bg-black h-full">
                    {/* Profile Header */}
                    <div className="flex flex-col items-center pt-8 mb-8">
                        <div className="w-24 h-24 bg-gradient-to-br from-[#2ED573] to-emerald-700 rounded-full flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(46,213,115,0.3)]">
                            <User size={40} className="text-black" />
                        </div>
                        <h2 className="text-xl font-bold tracking-tight">EcoTwin Worker</h2>
                        <p className="text-neutral-500 text-xs mt-1">worker@ecotwin.app</p>
                        <span className="mt-2 px-3 py-1 bg-[#2ED573]/10 border border-[#2ED573]/30 rounded-full text-[10px] font-bold text-[#2ED573] uppercase tracking-widest">
                            Field Worker
                        </span>
                    </div>

                    {/* Stats Summary */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                        <div className="bg-[#17201B] border border-white/5 rounded-2xl p-4 text-center">
                            <span className="text-xl font-bold text-white">
                                {reports.filter(r => r.status === 'resolved' || r.status === 'completed').length}
                            </span>
                            <p className="text-[9px] text-neutral-500 uppercase tracking-widest mt-1">Tasks Done</p>
                        </div>
                        <div className="bg-[#17201B] border border-white/5 rounded-2xl p-4 text-center">
                            <span className="text-xl font-bold text-white">
                                {Math.round(reports.filter(r => r.status === 'resolved' || r.status === 'completed').length * 1.5)}h
                            </span>
                            <p className="text-[9px] text-neutral-500 uppercase tracking-widest mt-1">Hours</p>
                        </div>
                        <div className="bg-[#17201B] border border-white/5 rounded-2xl p-4 text-center">
                            <span className="text-xl font-bold text-[#2ED573]">
                                {reports.filter(r => r.status === 'resolved' || r.status === 'completed').length * 450}
                            </span>
                            <p className="text-[9px] text-neutral-500 uppercase tracking-widest mt-1">Eco-Points</p>
                        </div>
                    </div>

                    {/* Menu Items */}
                    <div className="space-y-2">
                        <button
                            onClick={() => setRole('public')}
                            className="w-full bg-[#17201B] border border-white/5 rounded-2xl p-4 flex items-center justify-between active:scale-[0.98] transition-transform"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-blue-500/10 rounded-xl flex items-center justify-center">
                                    <ArrowLeft size={16} className="text-blue-400" />
                                </div>
                                <span className="text-sm font-medium text-white">Switch to Public</span>
                            </div>
                            <ChevronDown size={16} className="text-neutral-500 -rotate-90" />
                        </button>
                    </div>
                </div>
            )}

            {/* Bottom Navigation */}
            <div className="fixed bottom-0 left-0 right-0 z-50 shrink-0 bg-[#141C16] border-t border-white/5 h-[70px] flex items-center justify-around px-2 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] pb-safe">
                <NavButton
                    icon={<ClipboardList size={22} />}
                    label="Tasks"
                    active={activeWorkerTab === 'tasks'}
                    onClick={() => setActiveWorkerTab('tasks')}
                />
                <NavButton
                    icon={<MapIcon size={22} />}
                    label="Route"
                    active={activeWorkerTab === 'route'}
                    onClick={() => setActiveWorkerTab('route')}
                />
                <NavButton
                    icon={<Clock size={22} />}
                    label="History"
                    active={activeWorkerTab === 'history'}
                    onClick={() => setActiveWorkerTab('history')}
                />
                <NavButton
                    icon={<User size={22} />}
                    label="Profile"
                    active={activeWorkerTab === 'profile'}
                    onClick={() => setActiveWorkerTab('profile')}
                />
            </div>

        </div>
    );
}

function NavButton({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
    return (
        <button onClick={onClick} className="flex flex-col items-center justify-center gap-1.5 w-16 h-full transition-transform active:scale-95">
            <div className={`${active ? 'text-[#2ED573]' : 'text-neutral-500'} ${active && 'drop-shadow-[0_0_8px_rgba(46,213,115,0.4)]'}`}>
                {icon}
            </div>
            <span className={`text-[10px] font-bold ${active ? 'text-[#2ED573]' : 'text-neutral-500'}`}>
                {label}
            </span>
        </button>
    )
}

function HistoryCard({ task }: { task: any }) {
    const [showPhoto, setShowPhoto] = React.useState(false);

    return (
        <div className="bg-[#17201B] border border-white/5 rounded-2xl p-4 shadow-xl">
            <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                    {task.type?.replace('_', ' ') || 'Task'}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${task.status === 'resolved'
                    ? 'text-[#2ED573] bg-[#2ED573]/10'
                    : 'text-blue-400 bg-blue-500/10'
                    }`}>
                    {task.status === 'resolved' ? '✓ Resolved' : '✓ Completed'}
                </span>
            </div>
            <h3 className="font-bold text-base mb-1 truncate text-white">
                {task.description || 'Environmental Issue'}
            </h3>
            <div className="flex items-center gap-1.5 text-neutral-400 mb-3">
                <MapPin size={11} className="fill-neutral-400 text-[#17201B]" />
                <span className="text-[10px] truncate">
                    Lat: {Number(task.location_lat).toFixed(4)}, Lng: {Number(task.location_lng).toFixed(4)}
                </span>
            </div>
            <div className="flex items-center justify-between border-t border-white/5 pt-3">
                <div className="flex items-center gap-1.5 text-neutral-500">
                    <Clock size={12} />
                    <span className="text-[10px]">
                        {new Date(task.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                </div>
                {task.proof_image_url && (
                    <button
                        onClick={() => setShowPhoto(!showPhoto)}
                        className="text-[10px] text-emerald-500 font-bold uppercase flex items-center gap-1 active:scale-95 transition-transform"
                    >
                        📷 {showPhoto ? 'Hide Photo' : 'View Photo'}
                    </button>
                )}
            </div>

            {/* Expandable Photo Preview */}
            {showPhoto && task.proof_image_url && (
                <div className="mt-3 pt-3 border-t border-white/5">
                    <div className="rounded-xl overflow-hidden border border-white/10 bg-black/30">
                        <img
                            src={task.proof_image_url}
                            alt="Completion proof"
                            className="w-full h-auto max-h-64 object-cover"
                        />
                    </div>
                    <p className="text-[9px] text-neutral-500 text-center mt-2">Submitted proof of completion</p>
                </div>
            )}
        </div>
    );
}
