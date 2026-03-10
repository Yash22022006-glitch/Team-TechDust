import React from 'react';
import { Shield, Eye, Clock, CheckCircle, Search, MapPin, Building, User, Target, ChevronDown, Check, Camera, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AdminWorkViewProps {
    reports: any[];
}

export default function AdminWorkView({ reports }: AdminWorkViewProps) {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [statusFilter, setStatusFilter] = React.useState<'all' | 'verified' | 'resolved'>('all');
    const [selectedReport, setSelectedReport] = React.useState<any | null>(null);

    // Filter to works that are either resolved by worker or verified, simulating works done
    const workReports = reports.filter(r => r.status === 'resolved' || r.status === 'completed' || r.status === 'verified');

    // Fallback if the user just wants to see all "works" regardless of exact current DB status
    const displayReports = workReports.length > 0 ? workReports : reports.filter(r => r.status !== 'pending');

    const filteredWorks = displayReports.filter(work => {
        const matchesSearch = work.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
            work.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || work.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="flex flex-col h-full bg-[#050A05] text-white">
            <header className="px-6 py-4 flex flex-col gap-4 border-b border-white/5 sticky top-0 bg-[#050A05]/95 backdrop-blur-xl z-20">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">Work Log</h1>
                        <p className="text-xs text-neutral-400">Review completed tasks and field work</p>
                    </div>
                    <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20">
                        <CheckCircle className="text-amber-500" size={20} />
                    </div>
                </div>

                <div className="flex gap-2">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={16} />
                        <input
                            type="text"
                            placeholder="Search tasks..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#111812] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-amber-500/50 transition-colors"
                        />
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {filteredWorks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center text-neutral-500 mt-10">
                        <CheckCircle size={48} className="mb-4 opacity-20" />
                        <p className="text-sm">No completed works found matching your filters.</p>
                    </div>
                ) : (
                    filteredWorks.map((work) => (
                        <div
                            key={work.id}
                            onClick={() => setSelectedReport(work)}
                            className="bg-neutral-900/50 border border-white/5 rounded-2xl p-4 flex flex-col cursor-pointer hover:bg-neutral-900 transition-colors"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400">
                                        {work.status}
                                    </span>
                                </div>
                                <span className="text-[10px] text-neutral-500">{new Date(work.created_at).toLocaleDateString()}</span>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-20 h-20 bg-black rounded-xl overflow-hidden shrink-0 border border-white/5 relative group">
                                    {(work.status === 'resolved' || work.status === 'completed') && (
                                        <div className="absolute top-1 right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg border border-black z-10">
                                            <Check size={10} className="text-black" strokeWidth={3} />
                                        </div>
                                    )}
                                    {work.proof_image_url || work.image_url ? (
                                        <img src={work.proof_image_url || work.image_url} alt="Task" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-[#111812]">
                                            <ImageIcon className="text-neutral-600" size={24} />
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 flex flex-col">
                                    <h3 className="font-bold text-sm tracking-tight mb-1 capitalize text-amber-500">{work.type.replace('_', ' ')}</h3>
                                    <p className="text-xs text-neutral-400 line-clamp-2 mb-2 leading-relaxed">{work.description || 'Verified and completed field work task.'}</p>

                                    <div className="flex items-center gap-4 text-[10px] font-mono text-neutral-500 mt-auto">
                                        <div className="flex items-center gap-1">
                                            <MapPin size={10} />
                                            <span className="truncate max-w-[80px]">{work.location_lat?.toFixed(3)}, {work.location_lng?.toFixed(3)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal for detailed view */}
            <AnimatePresence>
                {selectedReport && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end justify-center sm:items-center p-4"
                        onClick={() => setSelectedReport(null)}
                    >
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            onClick={e => e.stopPropagation()}
                            className="bg-[#0A0F0C] w-full max-w-lg rounded-t-3xl sm:rounded-3xl border border-white/10 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
                        >
                            <div className="p-4 flex justify-between items-center border-b border-white/5 bg-[#050A05]">
                                <h3 className="font-bold tracking-tight text-lg text-amber-500">Work Details</h3>
                                <button
                                    onClick={() => setSelectedReport(null)}
                                    className="p-2 hover:bg-white/5 rounded-full transition-colors text-neutral-400"
                                >
                                    <ChevronDown size={20} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto">
                                <div className="relative aspect-[4/3] bg-black">
                                    <img src={selectedReport.proof_image_url || selectedReport.image_url} alt="Work Detail" className="w-full h-full object-contain" />
                                    <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-emerald-500/90 text-black shadow-lg">
                                        {selectedReport.status}
                                    </div>
                                </div>

                                <div className="p-6 space-y-6">
                                    <div>
                                        <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">Category</h4>
                                        <p className="capitalize font-medium text-lg text-white">{selectedReport.type.replace('_', ' ')}</p>
                                    </div>

                                    <div>
                                        <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">Details</h4>
                                        <p className="text-sm text-neutral-300 leading-relaxed bg-[#111812] p-4 rounded-xl border border-white/5">
                                            {selectedReport.description}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-[#111812] p-3 rounded-xl border border-white/5 flex gap-3 items-center">
                                            <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                                                <Target className="text-amber-500" size={14} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest">Confidence</p>
                                                <p className="font-mono text-sm">{(selectedReport.confidence * 100).toFixed(1)}%</p>
                                            </div>
                                        </div>
                                        <div className="bg-[#111812] p-3 rounded-xl border border-white/5 flex gap-3 items-center">
                                            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                                                <Shield className="text-blue-500" size={14} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest">Authority</p>
                                                <p className="font-mono text-sm capitalize">{selectedReport.authority_type || 'Municipal'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
