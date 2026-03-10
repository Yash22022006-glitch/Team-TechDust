import React, { useState, useEffect } from 'react';
import {
    Trophy, Share2, Heart, SlidersHorizontal, Leaf, Zap, Droplets,
    TreePine, Users, ChevronRight, Camera, X, CheckCircle2, ScanLine, Stars
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type MissionStatus = 'available' | 'joined' | 'completed';
type FilterCat = 'all' | 'seasonal' | 'daily' | 'community';

interface Mission {
    id: string;
    title: string;
    description: string;
    image: string;
    badge: string;
    badgeIcon: React.ReactNode;
    xp: number;
    daysLeft?: number;
    status: MissionStatus;
    progress?: number;
    category: FilterCat;
}

const initialMissions: Mission[] = [
    {
        id: '1',
        title: 'River Guard Spring',
        description: 'Protect local waterways from seasonal runoff and pollutants.',
        image: '/river_mission.png',
        badge: 'Spring Guardian',
        badgeIcon: <Droplets size={12} />,
        xp: 500,
        daysLeft: 12,
        status: 'available',
        category: 'seasonal',
    },
    {
        id: '2',
        title: 'Urban Pollinator',
        description: 'Plant bee-friendly flowers in your balcony or garden spaces.',
        image: '/pollinator_mission.png',
        badge: 'Bee Friend',
        badgeIcon: <Leaf size={12} />,
        xp: 350,
        daysLeft: 24,
        status: 'available',
        category: 'seasonal',
    },
    {
        id: '3',
        title: 'Zero Waste Week',
        description: 'Minimize waste generation for 7 consecutive days. Track progress with daily check-ins.',
        image: '/zero_waste_mission.png',
        badge: 'Waste Warrior',
        badgeIcon: <TreePine size={12} />,
        xp: 600,
        status: 'joined',
        progress: 75,
        category: 'community',
    },
    {
        id: '4',
        title: 'Air Quality Reporter',
        description: 'Report air quality observations from 5 different locations in your neighborhood.',
        image: '',
        badge: 'Sky Watcher',
        badgeIcon: <Zap size={12} />,
        xp: 250,
        daysLeft: 7,
        status: 'available',
        category: 'daily',
    },
    {
        id: '5',
        title: 'Community Cleanup Drive',
        description: 'Organize or join a neighborhood cleanup event. Minimum 2 hours of participation required.',
        image: '',
        badge: 'Street Hero',
        badgeIcon: <Users size={12} />,
        xp: 800,
        daysLeft: 5,
        status: 'available',
        category: 'community',
    },
];

interface ChallengesViewProps {
    onXpGained?: (amount: number) => void;
}

export default function ChallengesView({ onXpGained }: ChallengesViewProps) {
    const [missions, setMissions] = useState<Mission[]>(initialMissions);
    const [activeFilter, setActiveFilter] = useState<FilterCat>('all');
    const [toast, setToast] = useState<string | null>(null);
    const [showShareId, setShowShareId] = useState<string | null>(null);

    // AI Submission Flow States
    const [activeSubmitMission, setActiveSubmitMission] = useState<Mission | null>(null);
    const [submissionPhase, setSubmissionPhase] = useState<'idle' | 'analyzing' | 'reward' | 'completed'>('idle');
    const [submitNotes, setSubmitNotes] = useState('');

    const showToastMsg = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    };

    const handleJoin = (id: string) => {
        setMissions(prev => prev.map(m =>
            m.id === id ? { ...m, status: 'joined' as MissionStatus, progress: 5 } : m
        ));
        const mission = missions.find(m => m.id === id);
        showToastMsg(`🎯 Joined "${mission?.title}" — Let's go!`);
    };

    const openSubmissionModal = (id: string) => {
        const mission = missions.find(m => m.id === id);
        if (mission) {
            setActiveSubmitMission(mission);
            setSubmissionPhase('idle');
            setSubmitNotes('');
        }
    };

    const processSubmission = () => {
        if (!activeSubmitMission) return;
        setSubmissionPhase('analyzing');

        // Simulate AI Analysis
        setTimeout(() => {
            const currentProgress = activeSubmitMission.progress || 0;
            const progressGained = 15;
            const newProgress = Math.min(100, currentProgress + progressGained);
            const isCompleted = newProgress >= 100;

            if (isCompleted) {
                setSubmissionPhase('reward');
                if (onXpGained) onXpGained(activeSubmitMission.xp);
            } else {
                setSubmissionPhase('completed');
                updateMissionProgress(activeSubmitMission.id, newProgress, false);
            }
        }, 2500);
    };

    const collectReward = () => {
        if (activeSubmitMission) {
            updateMissionProgress(activeSubmitMission.id, 100, true);
        }
        closeModal();
    };

    const closeModal = () => {
        setActiveSubmitMission(null);
        setSubmissionPhase('idle');
    };

    const updateMissionProgress = (id: string, newProgress: number, completed: boolean) => {
        setMissions(prev => prev.map(m =>
            m.id === id ? {
                ...m,
                progress: newProgress,
                status: completed ? 'completed' : m.status
            } : m
        ));
    };

    const handleShare = (id: string) => {
        showToastMsg('📤 Challenge shared to community feed!');
    };

    const handleLike = (id: string) => {
        showToastMsg('❤️ Added to favorites!');
    };

    const handleParticipateNow = () => {
        const existingMission = missions.find(m => m.id === 'clean-air-init');
        if (!existingMission) {
            const newMission: Mission = {
                id: 'clean-air-init',
                title: 'Clean Air Initiative',
                description: 'Contribute to city-wide emission monitoring and urban forestry projects.',
                image: '',
                badge: 'Air Guardian',
                badgeIcon: <Leaf size={12} />,
                xp: 1000,
                daysLeft: 30,
                status: 'joined',
                progress: 0,
                category: 'seasonal',
            };
            setMissions(prev => [newMission, ...prev]);
            showToastMsg('🌱 You\'re now participating in the Clean Air Initiative!');

            // Switch filter to 'seasonal' to ensure the user sees the new mission if they are on another tab that isn't 'all'
            if (activeFilter !== 'all') {
                setActiveFilter('seasonal');
            }
        }
    };

    const filters: { key: FilterCat; label: string }[] = [
        { key: 'all', label: 'All' },
        { key: 'seasonal', label: 'Seasonal' },
        { key: 'daily', label: 'Daily' },
        { key: 'community', label: 'Community' },
    ];

    const filtered = activeFilter === 'all'
        ? missions
        : missions.filter(m => m.category === activeFilter);

    const impactPercent = 45;

    return (
        <div className="flex flex-col h-full bg-[#0E1511] text-white">
            <div className="flex-1 overflow-y-auto pb-24 relative">

                {/* Toast */}
                <AnimatePresence>
                    {toast && (
                        <motion.div
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm font-bold shadow-2xl"
                        >
                            {toast}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* AI Submission Modal Overlay */}
                <AnimatePresence>
                    {activeSubmitMission && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 20 }}
                                className="w-full max-w-sm bg-[#121E16] border border-emerald-500/20 rounded-3xl overflow-hidden relative shadow-2xl shadow-emerald-500/10"
                            >
                                {/* Modal Header */}
                                {submissionPhase !== 'reward' && (
                                    <div className="flex items-center justify-between p-4 border-b border-white/5">
                                        <h3 className="font-bold text-sm">Submit Mission Proof</h3>
                                        <button onClick={closeModal} className="p-1 rounded-full text-neutral-400 hover:text-white bg-white/5">
                                            <X size={16} />
                                        </button>
                                    </div>
                                )}

                                {/* Phase 1: Input */}
                                {submissionPhase === 'idle' && (
                                    <div className="p-5">
                                        <div className="mb-4">
                                            <p className="text-xs text-emerald-500 font-bold mb-1">{activeSubmitMission.title}</p>
                                            <p className="text-xs text-neutral-400">Upload a photo or sensor reading to verify your task completion.</p>
                                        </div>

                                        <div className="h-32 rounded-xl border-2 border-dashed border-emerald-500/20 text-emerald-500/50 flex flex-col items-center justify-center gap-2 mb-4 hover:bg-emerald-500/5 transition-colors cursor-pointer active:scale-95">
                                            <Camera size={28} />
                                            <span className="text-xs font-bold">Tap to Upload Photo</span>
                                        </div>

                                        <textarea
                                            value={submitNotes}
                                            onChange={e => setSubmitNotes(e.target.value)}
                                            placeholder="Add notes or data points (optional)..."
                                            className="w-full bg-[#0E1511] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-neutral-500 outline-none focus:border-emerald-500 mb-5 resize-none h-20"
                                        />

                                        <button
                                            onClick={processSubmission}
                                            className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all"
                                        >
                                            <Stars size={16} /> Analyze Proof
                                        </button>
                                    </div>
                                )}

                                {/* Phase 2: Analyzing */}
                                {submissionPhase === 'analyzing' && (
                                    <div className="p-8 flex flex-col items-center justify-center">
                                        <div className="relative w-24 h-24 mb-6">
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                                className="absolute inset-0 rounded-full border-b-2 border-emerald-500"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <ScanLine size={32} className="text-emerald-500" />
                                            </div>
                                            <motion.div
                                                animate={{ top: ['0%', '100%', '0%'] }}
                                                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                                                className="absolute left-0 right-0 h-0.5 bg-emerald-400 shadow-[0_0_10px_2px_rgba(52,211,153,0.5)]"
                                            />
                                        </div>
                                        <h3 className="text-lg font-bold text-emerald-500 mb-2">EcoTwin AI Analyzing</h3>
                                        <p className="text-xs text-neutral-400 text-center animate-pulse">
                                            Verifying metadata and image forensics...
                                        </p>
                                    </div>
                                )}

                                {/* Phase 3: Completed (Partial Progress) */}
                                {submissionPhase === 'completed' && (
                                    <div className="p-8 flex flex-col items-center justify-center text-center">
                                        <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                                            <CheckCircle2 size={32} />
                                        </div>
                                        <h3 className="text-lg font-bold text-white mb-2">Proof Verified!</h3>
                                        <p className="text-xs text-neutral-400 mb-6">
                                            Your progress on {activeSubmitMission.title} has increased by 15%. Keep going!
                                        </p>
                                        <button
                                            onClick={closeModal}
                                            className="w-full bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-black font-bold py-3 rounded-xl transition-all"
                                        >
                                            Done
                                        </button>
                                    </div>
                                )}

                                {/* Phase 4: Reward Celebration */}
                                {submissionPhase === 'reward' && (
                                    <div className="p-8 flex flex-col items-center justify-center text-center bg-gradient-to-b from-yellow-500/20 to-[#121E16]">
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: [0, 1.2, 1] }}
                                            transition={{ type: "spring", duration: 0.6 }}
                                            className="w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center text-black mb-5 shadow-[0_0_30px_rgba(234,179,8,0.5)]"
                                        >
                                            <Trophy size={40} />
                                        </motion.div>
                                        <span className="text-[10px] font-bold text-yellow-500 tracking-wider uppercase mb-1">Mission Completed</span>
                                        <h3 className="text-2xl font-bold text-white mb-2">{activeSubmitMission.title}</h3>

                                        <div className="flex items-center justify-center gap-1 text-2xl font-black text-yellow-400 my-4 shadow-lg">
                                            + {activeSubmitMission.xp} XP
                                        </div>

                                        <p className="text-xs text-neutral-300 mb-6 px-4">
                                            Incredible work! The city has awarded you the <span className="font-bold text-emerald-400">{activeSubmitMission.badge}</span> badge.
                                        </p>
                                        <button
                                            onClick={collectReward}
                                            className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 rounded-xl active:scale-95 transition-all"
                                        >
                                            Collect Reward
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Active Challenge Banner */}
                <div className="p-4 pb-0">
                    <div className="relative bg-gradient-to-br from-[#0d3320] to-[#0a1f14] rounded-2xl p-5 overflow-hidden border border-emerald-500/10">
                        {/* Background pattern */}
                        <div className="absolute inset-0 opacity-10" style={{
                            backgroundImage: 'radial-gradient(circle at 70% 30%, rgba(16,185,129,0.3), transparent 60%)'
                        }} />
                        <div className="relative z-10">
                            <span className="text-[8px] font-bold bg-emerald-500 text-black px-2 py-1 rounded uppercase tracking-wider">
                                ACTIVE CHALLENGE
                            </span>
                            <h2 className="text-xl font-bold mt-3 mb-1.5">Clean Air Initiative</h2>
                            <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                                Contribute to city-wide emission monitoring and urban forestry projects.
                            </p>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleParticipateNow}
                                    className={`text-black text-xs font-bold px-5 py-2.5 rounded-xl transition-all ${missions.some(m => m.id === 'clean-air-init')
                                            ? 'bg-emerald-500/50 cursor-not-allowed'
                                            : 'bg-emerald-500 hover:bg-emerald-600 active:scale-95'
                                        }`}
                                    disabled={missions.some(m => m.id === 'clean-air-init')}
                                >
                                    {missions.some(m => m.id === 'clean-air-init') ? 'Participating' : 'Participate Now'}
                                </button>
                                <div className="flex -space-x-2">
                                    <div className="w-7 h-7 rounded-full bg-emerald-700 border-2 border-[#0a1f14] flex items-center justify-center text-[9px] font-bold">YM</div>
                                    <div className="w-7 h-7 rounded-full bg-teal-700 border-2 border-[#0a1f14] flex items-center justify-center text-[9px] font-bold">SK</div>
                                </div>
                                <span className="text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-2 py-1 rounded-lg">112</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* City-Wide Impact */}
                <div className="p-4">
                    <div className="bg-[#121E16] border border-white/5 rounded-2xl p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <span className="text-sm">📊</span>
                                <span className="text-xs font-bold">City-Wide Impact</span>
                            </div>
                            <span className="text-xs font-bold text-emerald-500">{impactPercent}% Reached</span>
                        </div>
                        <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden mb-2">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${impactPercent}%` }}
                                transition={{ duration: 1.5, ease: 'easeOut' }}
                                className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full"
                            />
                        </div>
                        <div className="flex justify-between text-[10px] text-neutral-500">
                            <span>2,300 kg CO2 Offset</span>
                            <span>Target: 5,000 kg</span>
                        </div>
                    </div>
                </div>

                {/* Seasonal Missions Header */}
                <div className="px-4 mb-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-base font-bold">Seasonal Missions</h3>
                        <button
                            className="flex items-center gap-1.5 text-emerald-500 text-xs font-bold"
                        >
                            Filter <SlidersHorizontal size={12} />
                        </button>
                    </div>
                    {/* Filter Tabs */}
                    <div className="flex gap-1 mt-2">
                        {filters.map(f => (
                            <button
                                key={f.key}
                                onClick={() => setActiveFilter(f.key)}
                                className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-colors ${activeFilter === f.key
                                    ? 'text-emerald-500 bg-emerald-500/10'
                                    : 'text-neutral-400 hover:text-white'
                                    }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Mission Cards */}
                <div className="px-4 flex flex-col gap-5">
                    <AnimatePresence>
                        {filtered.map(mission => (
                            <motion.div
                                key={mission.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="bg-[#121E16] border border-white/5 rounded-2xl overflow-hidden shadow-lg"
                            >
                                {/* Mission Image */}
                                {mission.image ? (
                                    <div className="h-[140px] bg-[#0E1511] relative overflow-hidden">
                                        <img
                                            src={mission.image}
                                            alt={mission.title}
                                            className="w-full h-full object-cover opacity-80"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#121E16] via-transparent to-transparent" />
                                    </div>
                                ) : (
                                    <div className="h-[80px] bg-gradient-to-br from-[#1A3020] to-[#0E1511] relative flex items-center justify-center">
                                        <TreePine size={24} className="text-emerald-500/20" />
                                    </div>
                                )}

                                <div className="p-4">
                                    {/* Title row */}
                                    <div className="flex items-center justify-between mb-1.5">
                                        <h4 className="text-sm font-bold">{mission.title}</h4>
                                        {mission.status === 'joined' ? (
                                            <span className="text-[8px] font-bold bg-emerald-500 text-black px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)]">Joined</span>
                                        ) : mission.status === 'completed' ? (
                                            <span className="text-[8px] font-bold bg-yellow-500 text-black px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(234,179,8,0.3)]">Completed</span>
                                        ) : mission.daysLeft ? (
                                            <span className="text-[8px] font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">{mission.daysLeft}d left</span>
                                        ) : null}
                                    </div>

                                    {/* Description */}
                                    <p className="text-xs text-neutral-400 leading-relaxed mb-3">{mission.description}</p>

                                    {/* Progress bar for joined missions */}
                                    {mission.status === 'joined' && mission.progress !== undefined && (
                                        <div className="mb-3">
                                            <div className="flex justify-between text-[9px] mb-1">
                                                <span className="text-emerald-500 font-bold">PROGRESS</span>
                                                <span className="text-white font-bold">{mission.progress}%</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${mission.progress}%` }}
                                                    transition={{ duration: 0.5 }}
                                                    className="h-full bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Completed badge */}
                                    {mission.status === 'completed' && (
                                        <div className="mb-3 flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-2">
                                            <Trophy size={14} className="text-yellow-400" />
                                            <span className="text-[10px] font-bold text-yellow-400">Mission Complete! +{mission.xp} XP earned</span>
                                        </div>
                                    )}

                                    {/* Badge & XP */}
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="flex items-center gap-1 text-[10px] text-neutral-300">
                                            {mission.badgeIcon}
                                            <span className="font-bold">{mission.badge}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-[10px] text-neutral-300 bg-neutral-800/50 px-2 py-1 rounded-md">
                                            <Zap size={10} className="text-yellow-400" />
                                            <span className="font-bold text-yellow-400">{mission.xp} XP</span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2">
                                        {mission.status === 'available' && (
                                            <button
                                                onClick={() => handleJoin(mission.id)}
                                                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-bold py-2.5 rounded-xl transition-all active:scale-95 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                                            >
                                                Join Mission
                                            </button>
                                        )}

                                        {mission.status === 'joined' && (
                                            <button
                                                onClick={() => openSubmissionModal(mission.id)}
                                                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-bold py-2.5 rounded-xl transition-all active:scale-95 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                                            >
                                                Submit Proof
                                            </button>
                                        )}

                                        {mission.status === 'completed' && (
                                            <button
                                                className="flex-1 bg-[#1A2E20] text-emerald-500/50 text-xs font-bold py-2.5 rounded-xl border border-emerald-500/10"
                                                disabled
                                            >
                                                Completed ✓
                                            </button>
                                        )}

                                        {mission.status === 'available' && (
                                            <button
                                                onClick={() => handleShare(mission.id)}
                                                className="w-10 h-10 rounded-xl bg-[#1A2E20] border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white transition-colors active:scale-95"
                                            >
                                                <Share2 size={16} />
                                            </button>
                                        )}

                                        {mission.status !== 'available' && (
                                            <button
                                                onClick={() => handleLike(mission.id)}
                                                className="w-10 h-10 rounded-xl bg-[#1A2E20] border border-white/10 flex items-center justify-center text-neutral-400 hover:text-red-400 transition-colors active:scale-95"
                                            >
                                                <Heart size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

            </div>
        </div>
    );
}
