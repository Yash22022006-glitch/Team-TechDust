import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Home, BarChart3, TreeDeciduous } from 'lucide-react';

interface ReportSuccessProps {
  onBackToHome: () => void;
  onViewStatus: () => void;
  pointsEarned: number;
}

export default function ReportSuccess({ onBackToHome, onViewStatus, pointsEarned }: ReportSuccessProps) {
  return (
    <div className="fixed inset-0 z-[60] bg-[#050A05] flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 15 }}
        className="relative mb-12"
      >
        {/* Animated Rings */}
        <div className="absolute inset-0 -m-8 border border-emerald-500/10 rounded-full animate-[ping_3s_infinite]" />
        <div className="absolute inset-0 -m-4 border border-emerald-500/20 rounded-full animate-[ping_2s_infinite]" />
        
        <div className="w-32 h-32 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20 relative">
          <CheckCircle2 className="text-emerald-500" size={64} />
          
          {/* Floating Icon */}
          <div className="absolute -top-2 -right-2 w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/40 border-4 border-[#050A05]">
            <TreeDeciduous size={20} className="text-black" />
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h1 className="text-4xl font-bold mb-4 leading-tight">
          Report Submitted<br />Successfully!
        </h1>
        <p className="text-neutral-400 mb-10 max-w-xs mx-auto">
          Our AI is verifying your report. You can track progress in the <span className="text-emerald-500 font-bold">Reports</span> tab.
        </p>
      </motion.div>

      {/* Points Card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="w-full max-w-[340px] bg-emerald-500/5 border border-emerald-500/20 rounded-[2rem] p-5 mb-12 relative overflow-hidden group mx-auto"
      >
        <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:scale-110 transition-transform pointer-events-none">
          <BarChart3 size={120} />
        </div>
        
        <div className="flex flex-col items-center text-center relative z-10">
          <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-[0.2em] block mb-1">Rewarding Impact</span>
          <h3 className="text-lg font-bold text-white leading-tight mb-4">Impact Points Earned</h3>
          <div className="bg-emerald-500 text-black h-12 px-8 rounded-2xl font-bold text-2xl shadow-lg shadow-emerald-500/30 flex items-center justify-center">
            +{pointsEarned}
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="w-full max-w-sm space-y-4"
      >
        <button
          onClick={onBackToHome}
          className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
        >
          <Home size={20} />
          Back to Home
        </button>
        <button
          onClick={onViewStatus}
          className="w-full py-4 bg-white/5 hover:bg-white/10 text-emerald-500 font-bold rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 border border-white/5"
        >
          View Report Status
        </button>
      </motion.div>
    </div>
  );
}
