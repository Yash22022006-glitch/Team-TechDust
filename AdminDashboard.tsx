import React, { useState } from 'react';
import {
    TrendingUp,
    AlertTriangle,
    Satellite,
    CheckCircle,
    X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Alert {
    id: string;
    title: string;
    description: string;
    time: string;
    type: 'critical' | 'info';
    status: 'active' | 'escalated' | 'dismissed';
}

const initialAlerts: Alert[] = [
    {
        id: '1',
        title: 'Illegal Dumping Detected',
        description: 'CCTV Unit #402 reported unauthorized disposal at North Waterfront.',
        time: '2m ago',
        type: 'critical',
        status: 'active'
    },
    {
        id: '2',
        title: 'Air Quality Spike',
        description: 'Satellite data indicates high PM2.5 levels near District B.',
        time: '15m ago',
        type: 'info',
        status: 'active'
    },
    {
        id: '3',
        title: 'Overflowing Bin Cluster',
        description: 'Sensors in Sector 4 report 3 bins at 95%+ capacity.',
        time: '28m ago',
        type: 'critical',
        status: 'active'
    },
    {
        id: '4',
        title: 'Water Contamination Risk',
        description: 'Chemical runoff detected near River Point industrial area.',
        time: '1h ago',
        type: 'info',
        status: 'active'
    }
];

export default function AdminDashboard() {
    const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
    const [expandedAlert, setExpandedAlert] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'warning' | 'info' } | null>(null);

    const showToast = (message: string, type: 'success' | 'warning' | 'info') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleEscalate = (id: string) => {
        setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'escalated' } : a));
        const alert = alerts.find(a => a.id === id);
        showToast(`"${alert?.title}" escalated to management`, 'warning');
    };

    const handleDismiss = (id: string) => {
        setAlerts(prev => prev.filter(a => a.id !== id));
        showToast('Alert dismissed', 'success');
    };

    const handleViewDetails = (id: string) => {
        setExpandedAlert(expandedAlert === id ? null : id);
    };

    const activeAlerts = alerts.filter(a => a.status === 'active');
    const escalatedAlerts = alerts.filter(a => a.status === 'escalated');

    return (
        <div className="flex flex-col h-full bg-[#0E1511] text-white">
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6 pb-24">

                {/* Toast Notification */}
                <AnimatePresence>
                    {toast && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl border text-sm font-bold flex items-center gap-2 shadow-2xl ${toast.type === 'success' ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' :
                                    toast.type === 'warning' ? 'bg-orange-500/20 border-orange-500/30 text-orange-400' :
                                        'bg-blue-500/20 border-blue-500/30 text-blue-400'
                                }`}
                        >
                            {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                            {toast.message}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* System Stats Section */}
                <div>
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-xs font-bold text-neutral-400 tracking-wider">SYSTEM STATS</h3>
                        <span className="text-[9px] font-bold bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded border border-emerald-500/20 uppercase tracking-wider">LIVE</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="bg-[#121E16] border border-white/5 rounded-2xl p-4 relative overflow-hidden flex flex-col justify-between min-h-[90px]">
                            <div className="absolute left-0 top-3 bottom-3 w-1 bg-emerald-500 rounded-r-md"></div>
                            <div className="text-[11px] text-neutral-400 pl-2">Active Issues</div>
                            <div className="flex items-end justify-between pl-2 mt-2">
                                <span className="text-3xl font-bold leading-none">128</span>
                                <div className="flex items-center text-[10px] text-emerald-500 font-bold gap-0.5 mb-1 bg-emerald-500/10 px-1.5 rounded py-0.5">
                                    <TrendingUp size={10} />
                                    <span>12%</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#121E16] border border-white/5 rounded-2xl p-4 relative overflow-hidden flex flex-col justify-between min-h-[90px]">
                            <div className="absolute left-0 top-3 bottom-3 w-1 bg-orange-500 rounded-r-md"></div>
                            <div className="text-[11px] text-neutral-400 pl-2">Pending</div>
                            <div className="flex items-end justify-between pl-2 mt-2">
                                <span className="text-3xl font-bold leading-none">42</span>
                                <div className="flex items-center text-[9px] text-orange-500 font-bold gap-0.5 mb-1 px-1.5 rounded py-0.5 uppercase tracking-wide">
                                    <div className="w-1.5 h-1.5 rounded-full border border-orange-500"></div>
                                    <span>STABLE</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#121E16] border border-white/5 rounded-2xl p-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[11px] text-neutral-400">Worker Efficiency</span>
                            <span className="text-sm font-bold text-emerald-500">94%</span>
                        </div>
                        <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 w-[94%] rounded-full"></div>
                        </div>
                    </div>
                </div>

                {/* Escalated Alerts */}
                {escalatedAlerts.length > 0 && (
                    <div>
                        <h3 className="text-xs font-bold text-orange-400 tracking-wider mb-3 uppercase">ESCALATED ({escalatedAlerts.length})</h3>
                        <div className="flex flex-col gap-3">
                            {escalatedAlerts.map(alert => (
                                <motion.div
                                    key={alert.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-orange-500/5 border border-orange-500/20 rounded-2xl p-4 flex gap-3"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0 mt-0.5 text-orange-500">
                                        <AlertTriangle size={20} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="text-sm font-bold text-white">{alert.title}</h4>
                                            <span className="text-[9px] font-bold bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded uppercase">Escalated</span>
                                        </div>
                                        <p className="text-xs text-neutral-400 leading-relaxed">{alert.description}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {/* System Alerts Section */}
                <div>
                    <h3 className="text-xs font-bold text-neutral-400 tracking-wider mb-3 uppercase">SYSTEM ALERTS ({activeAlerts.length})</h3>

                    <AnimatePresence>
                        <div className="flex flex-col gap-3">
                            {activeAlerts.length === 0 ? (
                                <div className="text-center py-8 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                                    <CheckCircle size={24} className="text-emerald-500 mx-auto mb-2" />
                                    <p className="text-xs text-neutral-400">All alerts have been handled.</p>
                                </div>
                            ) : activeAlerts.map(alert => (
                                <motion.div
                                    key={alert.id}
                                    layout
                                    exit={{ opacity: 0, x: -100, height: 0, marginBottom: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className={`rounded-2xl p-4 flex gap-3 ${alert.type === 'critical'
                                            ? 'bg-[#1C1816] border border-red-500/20'
                                            : 'bg-[#121E16] border border-white/5'
                                        }`}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${alert.type === 'critical'
                                            ? 'bg-red-500/10 border border-red-500/20 text-red-500'
                                            : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-500'
                                        }`}>
                                        {alert.type === 'critical' ? <AlertTriangle size={20} /> : <Satellite size={20} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="text-sm font-bold text-white">{alert.title}</h4>
                                            <span className="text-[10px] text-neutral-400">{alert.time}</span>
                                        </div>
                                        <p className="text-xs text-neutral-400 leading-relaxed mb-3">
                                            {alert.description}
                                        </p>

                                        {/* Expanded Details */}
                                        <AnimatePresence>
                                            {expandedAlert === alert.id && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="mb-3 overflow-hidden"
                                                >
                                                    <div className="bg-white/5 rounded-xl p-3 text-xs text-neutral-300 leading-relaxed space-y-2 border border-white/5">
                                                        <div className="flex justify-between"><span className="text-neutral-500">Alert ID:</span><span className="font-mono">ALT-{alert.id.padStart(4, '0')}</span></div>
                                                        <div className="flex justify-between"><span className="text-neutral-500">Severity:</span><span className={alert.type === 'critical' ? 'text-red-400' : 'text-emerald-400'}>{alert.type === 'critical' ? 'Critical' : 'Moderate'}</span></div>
                                                        <div className="flex justify-between"><span className="text-neutral-500">Source:</span><span>{alert.type === 'critical' ? 'CCTV / IoT Sensor' : 'Satellite / Remote'}</span></div>
                                                        <div className="flex justify-between"><span className="text-neutral-500">Status:</span><span className="text-emerald-400">Active</span></div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {alert.type === 'critical' ? (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEscalate(alert.id)}
                                                    className="bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold px-4 py-2 rounded-lg transition-colors uppercase tracking-wider active:scale-95"
                                                >
                                                    ESCALATE
                                                </button>
                                                <button
                                                    onClick={() => handleDismiss(alert.id)}
                                                    className="bg-[#2A3441] hover:bg-[#323D4D] text-blue-200 text-[10px] font-bold px-4 py-2 rounded-lg transition-colors uppercase tracking-wider border border-blue-500/20 active:scale-95"
                                                >
                                                    DISMISS
                                                </button>
                                                <button
                                                    onClick={() => handleViewDetails(alert.id)}
                                                    className="text-neutral-400 hover:text-white text-[10px] font-bold px-3 py-2 rounded-lg transition-colors uppercase tracking-wider active:scale-95"
                                                >
                                                    {expandedAlert === alert.id ? 'HIDE' : 'DETAILS'}
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleViewDetails(alert.id)}
                                                className="text-emerald-500 hover:text-emerald-400 text-[10px] font-bold flex items-center gap-1 transition-colors uppercase tracking-wider active:scale-95"
                                            >
                                                {expandedAlert === alert.id ? 'HIDE DETAILS' : 'VIEW DETAILS'}
                                                <span className="text-lg leading-none mt-[-2px]">{expandedAlert === alert.id ? '↑' : '→'}</span>
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </AnimatePresence>
                </div>

            </div>
        </div>
    );
}
