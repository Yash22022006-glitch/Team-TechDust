import React, { useState } from 'react';
import {
    Search,
    SlidersHorizontal,
    Radio,
    Satellite,
    CircleCheckBig,
    UserCircle,
    Camera,
    MoreHorizontal,
    X,
    Play,
    MapPin,
    Navigation,
    FileText,
    BarChart3,
    Clock,
    Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type AlertSeverity = 'critical' | 'high' | 'medium' | 'low';
type FilterTab = 'all' | 'critical' | 'ai' | 'field';
type AlertStatus = 'active' | 'acknowledged' | 'resolved' | 'escalated' | 'shutdown';

interface AlertItem {
    id: string;
    severity: AlertSeverity;
    title: string;
    description: string;
    source: string;
    time: string;
    type: FilterTab;
    imageUrl?: string;
    gps?: string;
    status: AlertStatus;
    actions: { label: string; variant: 'danger' | 'outline' | 'primary' | 'ghost' }[];
    // Inline panel state
    inlinePanel?: 'footage' | 'report' | 'sensor' | 'tracking' | 'routes' | 'analysis' | 'schedule' | null;
}

const initialAlerts: AlertItem[] = [
    {
        id: '1', severity: 'critical', title: 'Unscheduled Emission Spike',
        description: 'CO2 levels at Sector 7-G have exceeded the daily safety threshold by 42%. Potential leak detected near processing unit. Nearest residential zone is 800m away.',
        source: 'AI Camera #04', time: '2 mins ago', type: 'ai', status: 'active',
        actions: [{ label: 'Emergency Shutdown', variant: 'danger' }, { label: 'Verify Footage', variant: 'outline' }]
    },
    {
        id: '5', severity: 'critical', title: 'Chemical Spill in Drainage',
        description: 'Industrial solvent detected in drainage system near Zone 3-A. Concentration at 3.8x safe limits. Downstream water treatment plant alerted.',
        source: 'IoT Sensor Net', time: '5 mins ago', type: 'ai', status: 'active',
        actions: [{ label: 'Emergency Shutdown', variant: 'danger' }, { label: 'Dispatch Team', variant: 'outline' }]
    },
    {
        id: '9', severity: 'critical', title: 'Toxic Gas Leak Detected',
        description: 'H2S concentration at 28ppm near Industrial Unit 12-B. Evacuation threshold is 20ppm. Three workers reported feeling nauseous.',
        source: 'Gas Sensor Array #07', time: '8 mins ago', type: 'ai', status: 'active',
        actions: [{ label: 'Evacuate Zone', variant: 'danger' }, { label: 'Alert Hospital', variant: 'outline' }, { label: 'View Sensor Data', variant: 'outline' }]
    },
    {
        id: '2', severity: 'high', title: 'Illegal Dumping Detected',
        description: 'Satellite imagery shows unauthorized waste disposal. Estimated volume: 12 cubic meters of construction debris and organic waste.',
        source: 'Satellite Sentinel', time: '14 mins ago', type: 'ai', imageUrl: '/dumping.png', gps: 'GPS: 34.05, -118.24', status: 'active',
        actions: [{ label: 'Assign Drone', variant: 'primary' }, { label: 'File Report', variant: 'outline' }]
    },
    {
        id: '6', severity: 'high', title: 'Noise Violation — Block C',
        description: 'Construction site exceeding 85dB during restricted hours (10PM-6AM). Third violation this month. 7 resident complaints filed.',
        source: 'AI Camera #12', time: '22 mins ago', type: 'ai', status: 'active',
        actions: [{ label: 'Issue Warning', variant: 'primary' }, { label: 'View Footage', variant: 'outline' }, { label: 'Escalate', variant: 'outline' }]
    },
    {
        id: '10', severity: 'high', title: 'River Turbidity Anomaly',
        description: 'Turbidity levels in East River at ER-04 increased 340% in 2 hours. Possible upstream contamination or soil erosion.',
        source: 'Water Sensor ER-04', time: '30 mins ago', type: 'ai', status: 'active',
        actions: [{ label: 'Dispatch Team', variant: 'primary' }, { label: 'View Sensor Data', variant: 'outline' }]
    },
    {
        id: '3', severity: 'medium', title: 'Task #4920 Resolved',
        description: 'Water quality sensor at South River Basin recalibrated and back online. Sensor accuracy verified at 99.2%.',
        source: 'Marcus V. (Field)', time: '45 mins ago', type: 'field', status: 'resolved',
        actions: [{ label: 'View Report', variant: 'outline' }, { label: 'Acknowledge', variant: 'primary' }]
    },
    {
        id: '7', severity: 'medium', title: 'Maintenance Complete — Sector 5',
        description: 'Scheduled maintenance on air quality stations AQ-05 through AQ-09 completed. All units passed diagnostics.',
        source: 'Diana R. (Field)', time: '1 hour ago', type: 'field', status: 'resolved',
        actions: [{ label: 'View Report', variant: 'outline' }, { label: 'Acknowledge', variant: 'primary' }]
    },
    {
        id: '11', severity: 'medium', title: 'Waste Route Optimization',
        description: 'AI routing engine re-optimized North District routes. Estimated 18% fuel savings and 23 min shorter total time.',
        source: 'Route AI Engine', time: '1.5 hours ago', type: 'ai', status: 'active',
        actions: [{ label: 'Apply Changes', variant: 'primary' }, { label: 'Compare Routes', variant: 'outline' }, { label: 'Dismiss', variant: 'outline' }]
    },
    {
        id: '4', severity: 'low', title: 'Potential Algae Bloom',
        description: 'Citizen reported green discoloration in North Canal. Similar reports from 2 other users within 48 hours.',
        source: 'EcoTwin Citizen App', time: '1 hour ago', type: 'field', status: 'active',
        actions: [{ label: 'Verify Report', variant: 'primary' }, { label: 'Dismiss', variant: 'outline' }]
    },
    {
        id: '8', severity: 'low', title: 'Sensor Battery Low — Grid B7',
        description: 'Soil moisture sensor SM-B7-03 battery at 12%. Estimated 5 days remaining. Last reading was normal.',
        source: 'IoT Management', time: '2 hours ago', type: 'field', status: 'active',
        actions: [{ label: 'Schedule Replacement', variant: 'primary' }, { label: 'Dismiss', variant: 'outline' }]
    },
    {
        id: '12', severity: 'low', title: 'Tree Canopy Change Detected',
        description: '2.3% canopy reduction in Park District over 30 days. Likely seasonal but worth monitoring.',
        source: 'Satellite Analysis', time: '3 hours ago', type: 'ai', status: 'active',
        actions: [{ label: 'View Analysis', variant: 'outline' }, { label: 'Flag for Review', variant: 'primary' }, { label: 'Dismiss', variant: 'outline' }]
    }
];

const severityConfig: Record<AlertSeverity, { label: string; color: string; bg: string; border: string }> = {
    critical: { label: 'CRITICAL', color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30' },
    high: { label: 'HIGH', color: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500/30' },
    medium: { label: 'MEDIUM', color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/30' },
    low: { label: 'LOW', color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/30' }
};

const severityIcon: Record<AlertSeverity, React.ReactNode> = {
    critical: <Radio size={20} />,
    high: <Satellite size={20} />,
    medium: <CircleCheckBig size={20} />,
    low: <UserCircle size={20} />
};

// ─── Inline Panel Components ───
function FootagePanel({ source }: { source: string }) {
    return (
        <div className="mt-3 pt-3 border-t border-white/5">
            <div className="bg-black rounded-xl overflow-hidden relative">
                <div className="h-[160px] bg-gradient-to-br from-[#0a1a0e] to-[#050a05] flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(16,185,129,0.03)_2px,rgba(16,185,129,0.03)_4px)]" />
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                            <Play size={20} className="text-emerald-500 ml-0.5" />
                        </div>
                        <span className="text-[10px] text-neutral-500">Live Feed — {source}</span>
                    </div>
                    <div className="absolute top-2 left-2 flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-[8px] font-bold text-red-400 uppercase">REC</span>
                    </div>
                    <div className="absolute top-2 right-2 text-[8px] font-mono text-neutral-600">
                        {new Date().toLocaleTimeString()}
                    </div>
                    <div className="absolute bottom-2 right-2 text-[8px] font-mono text-neutral-600">
                        1080p • 30fps
                    </div>
                </div>
            </div>
        </div>
    );
}

function SensorPanel() {
    const data = [
        { label: 'H2S', value: '28 ppm', status: 'critical', limit: '20 ppm' },
        { label: 'CO2', value: '1842 ppm', status: 'high', limit: '1000 ppm' },
        { label: 'PM2.5', value: '78 µg/m³', status: 'high', limit: '35 µg/m³' },
        { label: 'Temp', value: '34.2°C', status: 'normal', limit: '40°C' },
        { label: 'Humidity', value: '67%', status: 'normal', limit: '80%' },
        { label: 'Wind', value: '12 km/h NE', status: 'normal', limit: '-' },
    ];
    return (
        <div className="mt-3 pt-3 border-t border-white/5">
            <div className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest mb-2">LIVE SENSOR READINGS</div>
            <div className="grid grid-cols-3 gap-2">
                {data.map(d => (
                    <div key={d.label} className="bg-[#0E1511] rounded-lg p-2.5">
                        <span className="text-[8px] text-neutral-500 uppercase block">{d.label}</span>
                        <span className={`text-xs font-bold ${d.status === 'critical' ? 'text-red-400' : d.status === 'high' ? 'text-orange-400' : 'text-emerald-400'}`}>{d.value}</span>
                        <span className="text-[7px] text-neutral-600 block">Limit: {d.limit}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ReportPanel({ title }: { title: string }) {
    return (
        <div className="mt-3 pt-3 border-t border-white/5">
            <div className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest mb-2">FIELD REPORT</div>
            <div className="bg-[#0E1511] rounded-xl p-3 space-y-2">
                <div className="flex justify-between"><span className="text-[9px] text-neutral-500">Report</span><span className="text-[10px] font-mono text-white">{title}</span></div>
                <div className="flex justify-between"><span className="text-[9px] text-neutral-500">Filed by</span><span className="text-[10px] text-white">Field Technician</span></div>
                <div className="flex justify-between"><span className="text-[9px] text-neutral-500">Duration</span><span className="text-[10px] text-white">2h 15m</span></div>
                <div className="flex justify-between"><span className="text-[9px] text-neutral-500">Parts Used</span><span className="text-[10px] text-white">Calibration Kit v2</span></div>
                <div className="flex justify-between"><span className="text-[9px] text-neutral-500">Result</span><span className="text-[10px] text-emerald-400 font-bold">PASS — 99.2%</span></div>
                <div className="flex justify-between"><span className="text-[9px] text-neutral-500">Next Service</span><span className="text-[10px] text-white">March 2027</span></div>
            </div>
        </div>
    );
}

function TrackingPanel({ type }: { type: 'drone' | 'team' | 'evacuation' | 'hospital' }) {
    const configs = {
        drone: { title: 'DRONE TRACKING', unit: 'Drone #D-07', eta: '3 min', speed: '45 km/h', battery: '87%', distance: '1.2 km' },
        team: { title: 'TEAM TRACKING', unit: 'Alpha Team (4 members)', eta: '11 min', speed: '35 km/h', battery: '-', distance: '4.8 km' },
        evacuation: { title: 'EVACUATION STATUS', unit: 'Zone 12-B', eta: 'In progress', speed: '-', battery: '-', distance: '23 personnel' },
        hospital: { title: 'HOSPITAL ALERT', unit: 'City General Hospital', eta: 'Notified', speed: '-', battery: '-', distance: '3.5 km away' },
    };
    const c = configs[type];
    return (
        <div className="mt-3 pt-3 border-t border-white/5">
            <div className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest mb-2">{c.title}</div>
            <div className="bg-[#0E1511] rounded-xl p-3">
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                        {type === 'drone' ? <Navigation size={16} /> : type === 'team' ? <Users size={16} /> : <MapPin size={16} />}
                    </div>
                    <div>
                        <div className="text-xs font-bold">{c.unit}</div>
                        <div className="text-[9px] text-neutral-500">ETA: {c.eta}</div>
                    </div>
                    <div className="ml-auto flex items-center gap-1">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[8px] text-emerald-400 font-bold">LIVE</span>
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                    {[{ l: 'Distance', v: c.distance }, { l: type === 'drone' ? 'Speed' : 'Status', v: c.speed || 'En route' }, { l: type === 'drone' ? 'Battery' : 'Priority', v: c.battery || 'HIGH' }].map(d => (
                        <div key={d.l} className="text-center">
                            <span className="text-[7px] text-neutral-600 uppercase block">{d.l}</span>
                            <span className="text-[10px] font-bold text-white">{d.v}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function RoutesPanel() {
    return (
        <div className="mt-3 pt-3 border-t border-white/5">
            <div className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest mb-2">ROUTE COMPARISON</div>
            <div className="grid grid-cols-2 gap-2">
                <div className="bg-[#0E1511] rounded-xl p-3">
                    <div className="text-[9px] text-neutral-500 mb-1">Current Route</div>
                    <div className="text-xs font-bold text-white mb-1">142 km • 4h 35m</div>
                    <div className="text-[9px] text-neutral-500">Fuel: 68L estimated</div>
                    <div className="w-full h-1 bg-neutral-800 rounded mt-2"><div className="h-full bg-orange-500 rounded" style={{ width: '100%' }} /></div>
                </div>
                <div className="bg-[#0E1511] rounded-xl p-3 border border-emerald-500/20">
                    <div className="text-[9px] text-emerald-500 mb-1">Optimized Route ✦</div>
                    <div className="text-xs font-bold text-white mb-1">116 km • 4h 12m</div>
                    <div className="text-[9px] text-emerald-400">Fuel: 56L (-18%)</div>
                    <div className="w-full h-1 bg-neutral-800 rounded mt-2"><div className="h-full bg-emerald-500 rounded" style={{ width: '82%' }} /></div>
                </div>
            </div>
        </div>
    );
}

function AnalysisPanel() {
    return (
        <div className="mt-3 pt-3 border-t border-white/5">
            <div className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest mb-2">SATELLITE ANALYSIS</div>
            <div className="bg-[#0E1511] rounded-xl p-3 space-y-2">
                <div className="flex justify-between"><span className="text-[9px] text-neutral-500">Canopy Coverage (30d ago)</span><span className="text-[10px] text-white">78.4%</span></div>
                <div className="flex justify-between"><span className="text-[9px] text-neutral-500">Canopy Coverage (now)</span><span className="text-[10px] text-orange-400 font-bold">76.1% (↓2.3%)</span></div>
                <div className="flex justify-between"><span className="text-[9px] text-neutral-500">Affected Area</span><span className="text-[10px] text-white">12.4 hectares</span></div>
                <div className="flex justify-between"><span className="text-[9px] text-neutral-500">Likely Cause</span><span className="text-[10px] text-yellow-400">Seasonal / Unknown</span></div>
                <div className="flex justify-between"><span className="text-[9px] text-neutral-500">NDVI Change</span><span className="text-[10px] text-white">-0.08 avg</span></div>
                <div className="flex justify-between"><span className="text-[9px] text-neutral-500">Confidence</span><span className="text-[10px] text-white">94.7%</span></div>
            </div>
        </div>
    );
}

function SchedulePanel() {
    return (
        <div className="mt-3 pt-3 border-t border-white/5">
            <div className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest mb-2">REPLACEMENT SCHEDULE</div>
            <div className="bg-[#0E1511] rounded-xl p-3 space-y-2">
                <div className="flex justify-between"><span className="text-[9px] text-neutral-500">Sensor</span><span className="text-[10px] font-mono text-white">SM-B7-03</span></div>
                <div className="flex justify-between"><span className="text-[9px] text-neutral-500">Technician</span><span className="text-[10px] text-white">B. Lee (Field Ops)</span></div>
                <div className="flex justify-between"><span className="text-[9px] text-neutral-500">Scheduled</span><span className="text-[10px] text-emerald-400">Tomorrow, 9:00 AM</span></div>
                <div className="flex justify-between"><span className="text-[9px] text-neutral-500">Battery Type</span><span className="text-[10px] text-white">LiPo 3.7V 6000mAh</span></div>
                <div className="flex justify-between"><span className="text-[9px] text-neutral-500">Est. Duration</span><span className="text-[10px] text-white">15 minutes</span></div>
            </div>
        </div>
    );
}

// ─── Main Component ───
export default function AdminAlertsView() {
    const [alerts, setAlerts] = useState<AlertItem[]>(initialAlerts);
    const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'warning' | 'info' | 'danger' } | null>(null);
    const [expandedAlert, setExpandedAlert] = useState<string | null>(null);

    const showToast = (message: string, type: 'success' | 'warning' | 'info' | 'danger' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    };

    const toastColors = {
        success: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
        warning: 'bg-orange-500/20 border-orange-500/30 text-orange-400',
        info: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
        danger: 'bg-red-500/20 border-red-500/30 text-red-400'
    };

    const updateAlert = (alertId: string, updates: Partial<AlertItem>) => {
        setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, ...updates } : a));
    };

    const handleAction = (alertId: string, action: string) => {
        const alert = alerts.find(a => a.id === alertId);
        if (!alert) return;

        switch (action) {
            case 'Emergency Shutdown':
                updateAlert(alertId, {
                    status: 'shutdown',
                    actions: [{ label: 'View Incident Log', variant: 'outline' }, { label: 'Reactivate', variant: 'primary' }],
                    inlinePanel: null
                });
                showToast(`⚠️ Emergency shutdown initiated — ${alert.title}`, 'danger');
                break;

            case 'Reactivate':
                updateAlert(alertId, {
                    status: 'acknowledged',
                    actions: [{ label: 'Systems Restarting...', variant: 'outline' }],
                    inlinePanel: null
                });
                showToast('🔄 Systems reactivation in progress...', 'warning');
                setTimeout(() => {
                    updateAlert(alertId, {
                        status: 'resolved',
                        actions: [{ label: 'Resolved ✓', variant: 'outline' }, { label: 'View Incident Log', variant: 'outline' }]
                    });
                    showToast('✅ Systems back online — incident resolved', 'success');
                }, 2000);
                break;

            case 'Evacuate Zone':
                updateAlert(alertId, {
                    status: 'acknowledged',
                    actions: [{ label: 'View Evacuation', variant: 'primary' }, { label: 'Alert Hospital', variant: 'outline' }],
                    inlinePanel: 'tracking'
                });
                showToast('🚨 Evacuation order sent — Zone 12-B', 'danger');
                break;

            case 'View Evacuation':
                updateAlert(alertId, { inlinePanel: alert.inlinePanel === 'tracking' ? null : 'tracking' });
                break;

            case 'Alert Hospital':
                updateAlert(alertId, { inlinePanel: 'tracking' });
                showToast('🏥 City General Hospital notified — 3 potential patients', 'warning');
                break;

            case 'Verify Footage':
            case 'View Footage':
                updateAlert(alertId, { inlinePanel: alert.inlinePanel === 'footage' ? null : 'footage' });
                break;

            case 'View Sensor Data':
                updateAlert(alertId, { inlinePanel: alert.inlinePanel === 'sensor' ? null : 'sensor' });
                break;

            case 'Assign Drone':
                updateAlert(alertId, {
                    status: 'acknowledged',
                    actions: [{ label: 'Track Drone', variant: 'primary' }, { label: 'View Feed', variant: 'outline' }, { label: 'File Report', variant: 'outline' }],
                    inlinePanel: 'tracking'
                });
                showToast('🚁 Drone #D-07 dispatched — ETA 4 minutes', 'success');
                break;

            case 'Track Drone':
                updateAlert(alertId, { inlinePanel: alert.inlinePanel === 'tracking' ? null : 'tracking' });
                break;

            case 'View Feed':
                updateAlert(alertId, { inlinePanel: alert.inlinePanel === 'footage' ? null : 'footage' });
                break;

            case 'File Report':
                updateAlert(alertId, { inlinePanel: alert.inlinePanel === 'report' ? null : 'report' });
                showToast('📝 Incident report template opened', 'info');
                break;

            case 'Dispatch Team':
                updateAlert(alertId, {
                    status: 'acknowledged',
                    actions: [{ label: 'Track Team', variant: 'primary' }, { label: 'View Sensor Data', variant: 'outline' }],
                    inlinePanel: 'tracking'
                });
                showToast('👷 Field team Alpha dispatched — ETA 12 min', 'success');
                break;

            case 'Track Team':
                updateAlert(alertId, { inlinePanel: alert.inlinePanel === 'tracking' ? null : 'tracking' });
                break;

            case 'Issue Warning':
                updateAlert(alertId, {
                    status: 'acknowledged',
                    actions: [{ label: 'Warning Issued ✓', variant: 'outline' }, { label: 'View Footage', variant: 'outline' }, { label: 'Escalate', variant: 'primary' }]
                });
                showToast('⚠️ Official warning issued to construction site — Block C', 'warning');
                break;

            case 'Escalate':
                updateAlert(alertId, {
                    status: 'escalated',
                    actions: [{ label: 'Escalated ✓', variant: 'outline' }, { label: 'View Footage', variant: 'outline' }],
                    inlinePanel: null
                });
                showToast('📤 Alert escalated to regulatory authority', 'warning');
                break;

            case 'View Report':
                updateAlert(alertId, { inlinePanel: alert.inlinePanel === 'report' ? null : 'report' });
                break;

            case 'Acknowledge':
                updateAlert(alertId, {
                    status: 'acknowledged',
                    actions: [{ label: 'Acknowledged ✓', variant: 'outline' }, { label: 'View Report', variant: 'outline' }]
                });
                showToast('👍 Update acknowledged — ' + alert.title, 'success');
                break;

            case 'Apply Changes':
                updateAlert(alertId, {
                    status: 'resolved',
                    actions: [{ label: 'Applied ✓', variant: 'outline' }, { label: 'View Routes', variant: 'outline' }],
                    inlinePanel: null
                });
                showToast('✅ Route optimization applied — 3 trucks updated', 'success');
                break;

            case 'Compare Routes':
            case 'View Routes':
                updateAlert(alertId, { inlinePanel: alert.inlinePanel === 'routes' ? null : 'routes' });
                break;

            case 'Verify Report':
                updateAlert(alertId, {
                    status: 'acknowledged',
                    actions: [{ label: 'Verified ✓', variant: 'outline' }, { label: 'Assign Inspector', variant: 'primary' }]
                });
                showToast('✅ Citizen report verified — queued for field inspection', 'success');
                break;

            case 'Assign Inspector':
                updateAlert(alertId, {
                    status: 'resolved',
                    actions: [{ label: 'Inspector Assigned ✓', variant: 'outline' }],
                    inlinePanel: 'tracking'
                });
                showToast('👤 Inspector Priya M. assigned — ETA 25 mins', 'success');
                break;

            case 'Schedule Replacement':
                updateAlert(alertId, {
                    status: 'acknowledged',
                    actions: [{ label: 'Scheduled ✓', variant: 'outline' }, { label: 'View Schedule', variant: 'outline' }],
                    inlinePanel: 'schedule'
                });
                showToast('🔋 Battery replacement scheduled — Tomorrow 9 AM, Tech B. Lee', 'success');
                break;

            case 'View Schedule':
                updateAlert(alertId, { inlinePanel: alert.inlinePanel === 'schedule' ? null : 'schedule' });
                break;

            case 'View Analysis':
                updateAlert(alertId, { inlinePanel: alert.inlinePanel === 'analysis' ? null : 'analysis' });
                break;

            case 'Flag for Review':
                updateAlert(alertId, {
                    status: 'acknowledged',
                    actions: [{ label: 'Flagged ✓', variant: 'outline' }, { label: 'View Analysis', variant: 'outline' }]
                });
                showToast('🚩 Flagged for environmental review board', 'warning');
                break;

            case 'View Incident Log':
                updateAlert(alertId, { inlinePanel: alert.inlinePanel === 'report' ? null : 'report' });
                break;

            case 'Dismiss':
                setAlerts(prev => prev.filter(a => a.id !== alertId));
                showToast('🗑️ Alert dismissed — ' + alert.title, 'info');
                return;

            default:
                showToast(`ℹ️ ${action}`, 'info');
        }
    };

    const tabs: { key: FilterTab; label: string; count: number }[] = [
        { key: 'all', label: 'All', count: alerts.length },
        { key: 'critical', label: 'Critical', count: alerts.filter(a => a.severity === 'critical' || a.severity === 'high').length },
        { key: 'ai', label: 'AI Detections', count: alerts.filter(a => a.type === 'ai').length },
        { key: 'field', label: 'Field Updates', count: alerts.filter(a => a.type === 'field').length }
    ];

    const filtered = alerts.filter(a => {
        const matchesTab = activeFilter === 'all' ||
            (activeFilter === 'critical' && (a.severity === 'critical' || a.severity === 'high')) ||
            (activeFilter === 'ai' && a.type === 'ai') ||
            (activeFilter === 'field' && a.type === 'field');
        const matchesSearch = searchQuery === '' ||
            a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.source.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
    });

    const newCount = alerts.filter(a => a.status === 'active' && (a.severity === 'critical' || a.severity === 'high')).length;

    const statusConfig: Record<AlertStatus, { label: string; cls: string }> = {
        active: { label: 'ACTIVE', cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
        acknowledged: { label: 'ACK', cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
        resolved: { label: 'RESOLVED', cls: 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20' },
        escalated: { label: 'ESCALATED', cls: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
        shutdown: { label: 'SHUTDOWN', cls: 'bg-red-500/10 text-red-400 border-red-500/20' }
    };

    const renderInlinePanel = (alert: AlertItem) => {
        if (!alert.inlinePanel) return null;
        switch (alert.inlinePanel) {
            case 'footage': return <FootagePanel source={alert.source} />;
            case 'sensor': return <SensorPanel />;
            case 'report': return <ReportPanel title={alert.title} />;
            case 'tracking':
                if (alert.title.includes('Dumping') || alert.title.includes('Drone')) return <TrackingPanel type="drone" />;
                if (alert.title.includes('Evacu') || alert.title.includes('Gas')) return <TrackingPanel type="evacuation" />;
                if (alert.title.includes('Algae') || alert.title.includes('Inspector')) return <TrackingPanel type="team" />;
                return <TrackingPanel type="team" />;
            case 'routes': return <RoutesPanel />;
            case 'analysis': return <AnalysisPanel />;
            case 'schedule': return <SchedulePanel />;
            default: return null;
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#0E1511] text-white">
            <div className="flex-1 overflow-y-auto pb-24">

                {/* Toast */}
                <AnimatePresence>
                    {toast && (
                        <motion.div
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl border text-sm font-bold shadow-2xl max-w-[90vw] text-center ${toastColors[toast.type]}`}
                        >
                            {toast.message}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Header */}
                <div className="p-4 pb-0">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold">Alerts & Notifications</h2>
                        <button className="w-9 h-9 rounded-xl bg-[#1A2E20] border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white transition-colors">
                            <SlidersHorizontal size={16} />
                        </button>
                    </div>

                    {/* Search */}
                    <div className="relative mb-4">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                        <input
                            type="text"
                            placeholder="Search eco-anomalies..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#121E16] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500/30 transition-colors"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white">
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex gap-1 mb-1">
                        {tabs.map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveFilter(tab.key)}
                                className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1.5 ${activeFilter === tab.key ? 'text-emerald-500 bg-emerald-500/10' : 'text-neutral-400 hover:text-white'
                                    }`}
                            >
                                {tab.label}
                                <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${activeFilter === tab.key ? 'bg-emerald-500/20' : 'bg-white/5'}`}>{tab.count}</span>
                            </button>
                        ))}
                    </div>
                    <div className="h-[2px] bg-emerald-500/30 rounded-full mb-4" />
                </div>

                {/* Recent Activity */}
                <div className="flex items-center justify-between px-4 mb-3">
                    <span className="text-[10px] font-bold text-emerald-500 tracking-widest uppercase">RECENT ACTIVITY</span>
                    <span className="text-[10px] font-bold text-emerald-500">{newCount} NEW</span>
                </div>

                {/* Alert Cards */}
                <div className="px-4 flex flex-col gap-4">
                    <AnimatePresence>
                        {filtered.length === 0 ? (
                            <div className="text-center py-12 text-neutral-500 text-xs">No alerts match your filters.</div>
                        ) : filtered.map(alert => {
                            const sev = severityConfig[alert.severity];
                            const sc = statusConfig[alert.status];
                            return (
                                <motion.div
                                    key={alert.id}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -100, height: 0, marginBottom: 0, padding: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className={`bg-[#121E16] border rounded-2xl p-4 overflow-hidden transition-colors ${alert.status === 'escalated' ? 'border-orange-500/30' :
                                            alert.status === 'shutdown' ? 'border-red-500/30' :
                                                alert.status === 'acknowledged' ? 'border-blue-500/20' :
                                                    'border-white/5'
                                        }`}
                                >
                                    {/* Meta Row */}
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className={`w-9 h-9 rounded-xl ${sev.bg} flex items-center justify-center shrink-0 ${sev.color}`}>
                                            {severityIcon[alert.severity]}
                                        </div>
                                        <div className="flex items-center gap-2 flex-wrap flex-1">
                                            <span className={`text-[8px] font-bold ${sev.color} ${sev.bg} ${sev.border} border px-1.5 py-0.5 rounded uppercase tracking-wider`}>{sev.label}</span>
                                            <span className={`text-[7px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${sc.cls}`}>{sc.label}</span>
                                            <span className="text-[10px] text-neutral-500">{alert.time} • {alert.source}</span>
                                        </div>
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-sm font-bold mb-2">{alert.title}</h3>

                                    {/* Description */}
                                    {alert.description && (
                                        <p className="text-xs text-neutral-400 leading-relaxed mb-3">{alert.description}</p>
                                    )}

                                    {/* Image */}
                                    {alert.imageUrl && (
                                        <div className="relative mb-3 rounded-xl overflow-hidden">
                                            <div className="h-[140px] bg-gradient-to-br from-[#1A3020] to-[#0E1511] flex items-center justify-center">
                                                <Camera size={24} className="text-emerald-500/30" />
                                            </div>
                                            {alert.gps && (
                                                <div className="absolute bottom-2 left-2 bg-black/70 text-[9px] text-emerald-400 font-mono px-2 py-1 rounded">{alert.gps}</div>
                                            )}
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {alert.actions.map((action, i) => {
                                            const done = action.label.includes('✓') || action.label.includes('...');
                                            return (
                                                <button
                                                    key={i}
                                                    onClick={() => handleAction(alert.id, action.label)}
                                                    disabled={done}
                                                    className={`text-[10px] font-bold px-4 py-2 rounded-lg transition-all active:scale-95 ${done ? 'bg-[#1A2E20] text-neutral-500 border border-white/5 cursor-default' :
                                                            action.variant === 'danger' ? 'bg-red-500 hover:bg-red-600 text-white' :
                                                                action.variant === 'primary' ? 'bg-emerald-500 hover:bg-emerald-600 text-black' :
                                                                    'bg-[#1A2E20] hover:bg-[#223825] text-white border border-white/10'
                                                        }`}
                                                >
                                                    {action.label}
                                                </button>
                                            );
                                        })}
                                        <button
                                            onClick={() => setExpandedAlert(expandedAlert === alert.id ? null : alert.id)}
                                            className="ml-auto w-8 h-8 rounded-lg bg-[#1A2E20] border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
                                        >
                                            <MoreHorizontal size={16} />
                                        </button>
                                    </div>

                                    {/* Inline Panels */}
                                    <AnimatePresence>
                                        {alert.inlinePanel && (
                                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                                {renderInlinePanel(alert)}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Expanded Details */}
                                    <AnimatePresence>
                                        {expandedAlert === alert.id && (
                                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                                <div className="mt-3 pt-3 border-t border-white/5 grid grid-cols-2 gap-2">
                                                    {[
                                                        { l: 'Alert ID', v: `ECO-${alert.id.padStart(4, '0')}` },
                                                        { l: 'Severity', v: sev.label, color: sev.color },
                                                        { l: 'Source', v: alert.source },
                                                        { l: 'Status', v: alert.status.toUpperCase() },
                                                        { l: 'Category', v: alert.type === 'ai' ? 'AI Detection' : 'Field Update' },
                                                        { l: 'Reported', v: alert.time },
                                                    ].map(d => (
                                                        <div key={d.l} className="bg-[#0E1511] rounded-lg p-2.5">
                                                            <span className="text-[8px] text-neutral-500 uppercase tracking-wider block mb-0.5">{d.l}</span>
                                                            <span className={`text-[10px] font-bold ${'color' in d && d.color ? d.color : 'text-white'}`}>{d.v}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
