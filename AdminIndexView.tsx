import React, { useState } from 'react';
import { ChevronDown, AlertTriangle, TrendingUp, TrendingDown, Clock, Heart, CheckCircle2, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminIndexView({ onNavigateToMap }: { onNavigateToMap?: () => void }) {
    const [trendRange, setTrendRange] = useState('Last 30 Days');
    const [showDropdown, setShowDropdown] = useState(false);
    const rangeOptions = ['Last 7 Days', 'Last 30 Days', 'Last 90 Days'];

    // Chart data points for Environmental Trends
    const chartPoints = [30, 35, 28, 42, 38, 55, 50, 62, 58, 70, 65, 72, 68, 75, 80, 78, 82, 85, 80, 88, 84, 90, 87, 92];
    const maxVal = Math.max(...chartPoints);
    const chartHeight = 120;

    // Build SVG path
    const pathD = chartPoints.map((val, i) => {
        const x = (i / (chartPoints.length - 1)) * 100;
        const y = chartHeight - (val / maxVal) * (chartHeight - 10);
        return `${i === 0 ? 'M' : 'L'}${x},${y}`;
    }).join(' ');

    const areaD = pathD + ` L100,${chartHeight} L0,${chartHeight} Z`;

    return (
        <div className="flex flex-col h-full bg-[#0E1511] text-white">
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5 pb-24">

                {/* City Health Index */}
                <div className="bg-[#121E16] border border-white/5 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-neutral-400">City Health Index</span>
                        <Heart size={18} className="text-red-400" fill="#f87171" />
                    </div>
                    <div className="flex items-end gap-2 mb-3">
                        <span className="text-4xl font-bold">92</span>
                        <span className="text-xl text-neutral-500 font-bold mb-0.5">/100</span>
                        <span className="text-xs text-emerald-500 font-bold mb-1 ml-1">+2.4%</span>
                    </div>
                    <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all" style={{ width: '92%' }} />
                    </div>
                </div>

                {/* Issues Resolved */}
                <div className="bg-[#121E16] border border-white/5 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-neutral-400">Issues Resolved</span>
                        <CheckCircle2 size={18} className="text-emerald-500" />
                    </div>
                    <div className="flex items-end gap-2 mb-1">
                        <span className="text-3xl font-bold">1,240</span>
                        <span className="text-xs text-emerald-500 font-bold mb-1 flex items-center gap-0.5">
                            <TrendingUp size={12} />+18%
                        </span>
                    </div>
                    <p className="text-[10px] text-neutral-500">Target: 1,500/month</p>
                </div>

                {/* Avg Response Time */}
                <div className="bg-[#121E16] border border-white/5 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-neutral-400">Avg Response Time</span>
                        <Clock size={18} className="text-orange-400" />
                    </div>
                    <div className="flex items-end gap-2 mb-1">
                        <span className="text-3xl font-bold">14m</span>
                        <span className="text-xs text-emerald-500 font-bold mb-1 flex items-center gap-0.5">
                            <TrendingDown size={12} />-6%
                        </span>
                    </div>
                    <p className="text-[10px] text-neutral-500">Optimization required in Sector 7</p>
                </div>

                {/* Environmental Trends */}
                <div className="bg-[#121E16] border border-white/5 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-1">
                        <div>
                            <h3 className="text-base font-bold mb-0.5">Environmental Trends</h3>
                            <p className="text-[10px] text-neutral-500">Air, Water & Waste Quality Index</p>
                        </div>
                        <div className="relative">
                            <button
                                onClick={() => setShowDropdown(!showDropdown)}
                                className="bg-[#1A2E20] border border-white/10 rounded-lg px-3 py-1.5 text-[10px] text-white flex items-center gap-1"
                            >
                                {trendRange}
                                <ChevronDown size={12} className={`text-neutral-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                            </button>
                            <AnimatePresence>
                                {showDropdown && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -4 }}
                                        className="absolute top-full right-0 mt-1 bg-[#121E16] border border-white/10 rounded-lg overflow-hidden shadow-xl z-10 min-w-[130px]"
                                    >
                                        {rangeOptions.map(opt => (
                                            <button
                                                key={opt}
                                                onClick={() => { setTrendRange(opt); setShowDropdown(false); }}
                                                className={`w-full text-left px-3 py-1.5 text-[10px] hover:bg-emerald-500/10 ${opt === trendRange ? 'text-emerald-500' : 'text-neutral-300'}`}
                                            >
                                                {opt}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Chart */}
                    <div className="mt-4 relative">
                        <svg viewBox={`0 0 100 ${chartHeight}`} className="w-full h-[120px]" preserveAspectRatio="none">
                            <defs>
                                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
                                    <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            <path d={areaD} fill="url(#chartGrad)" />
                            <path d={pathD} fill="none" stroke="#10B981" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
                        </svg>
                        <div className="flex justify-between text-[9px] text-neutral-600 mt-1 px-1">
                            <span>WEEK 1</span><span>WEEK 2</span><span>WEEK 3</span><span>WEEK 4</span>
                        </div>
                    </div>
                </div>

                {/* Hotspots by District */}
                <div className="bg-[#121E16] border border-white/5 rounded-2xl p-5">
                    <h3 className="text-base font-bold mb-4">Hotspots by District</h3>
                    <div className="flex flex-col gap-3">
                        {[
                            { name: 'Downtown Core', density: 84, color: '#EF4444' },
                            { name: 'Industrial Park B', density: 62, color: '#F59E0B' },
                            { name: 'Riverside Residential', density: 12, color: '#10B981' },
                        ].map(d => (
                            <div key={d.name}>
                                <div className="flex justify-between items-center mb-1.5">
                                    <span className="text-xs text-neutral-300">{d.name}</span>
                                    <span className="text-[10px] font-bold text-neutral-400">{d.density}% Density</span>
                                </div>
                                <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${d.density}%` }}
                                        transition={{ duration: 1, ease: 'easeOut' }}
                                        className="h-full rounded-full"
                                        style={{ backgroundColor: d.color }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={onNavigateToMap}
                        className="w-full mt-4 py-2.5 border border-emerald-500/30 rounded-xl text-emerald-500 text-xs font-bold hover:bg-emerald-500/5 transition-colors active:scale-[0.98]"
                    >
                        VIEW DETAILED MAP
                    </button>
                </div>

                {/* Predictive Risk Analysis */}
                <div className="bg-[#121E16] border border-white/5 rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <h3 className="text-base font-bold">Predictive Risk Analysis</h3>
                        <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <div className="bg-red-500/5 border border-red-500/15 rounded-xl p-3 flex gap-3">
                            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0 text-red-500">
                                <AlertTriangle size={16} />
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-red-400 mb-0.5">Water Salinity Surge</h4>
                                <p className="text-[10px] text-neutral-400 leading-relaxed">82% probability in Sector 4 within 48h due to tidal changes.</p>
                            </div>
                        </div>

                        <div className="bg-orange-500/5 border border-orange-500/15 rounded-xl p-3 flex gap-3">
                            <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0 text-orange-500">
                                <AlertTriangle size={16} />
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-orange-400 mb-0.5">AQI Degradation</h4>
                                <p className="text-[10px] text-neutral-400 leading-relaxed">71% probability of PM2.5 increase in West District.</p>
                            </div>
                        </div>

                        <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-3 flex gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 text-emerald-500">
                                <AlertTriangle size={16} />
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-emerald-400 mb-0.5">Waste Management Peak</h4>
                                <p className="text-[10px] text-neutral-400 leading-relaxed">Optimization recommended for North collection route.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Live Satellite Feed */}
                <div className="bg-[#121E16] border border-white/5 rounded-2xl overflow-hidden">
                    <div className="h-[180px] bg-gradient-to-b from-[#1A2E20] to-[#0E1511] relative flex items-center justify-center">
                        <div className="absolute inset-0 opacity-20" style={{
                            backgroundImage: 'linear-gradient(rgba(16,185,129,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.1) 1px, transparent 1px)',
                            backgroundSize: '20px 20px'
                        }} />
                        <MapPin size={32} className="text-emerald-500/40" />
                    </div>
                    <div className="p-4 bg-emerald-500/5 border-t border-emerald-500/10">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                            <span className="text-[10px] font-bold text-white uppercase tracking-wider">LIVE SATELLITE FEED</span>
                        </div>
                        <p className="text-[9px] text-neutral-500 mt-0.5">All sensors active: 93.2%</p>
                    </div>
                </div>

            </div>
        </div>
    );
}
