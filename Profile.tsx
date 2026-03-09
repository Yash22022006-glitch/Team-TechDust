import React from 'react';
import { 
  ArrowLeft, 
  Settings, 
  CheckCircle2, 
  TrendingUp, 
  TrendingDown, 
  Trash2, 
  Cpu, 
  Zap,
  ShieldCheck
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  LineChart, 
  Line, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip 
} from 'recharts';

interface ProfileProps {
  points: number;
  userEmail: string;
  onBack?: () => void;
}

const EFFICIENCY_DATA = [
  { day: 'MON', value: 30 },
  { day: 'TUE', value: 45 },
  { day: 'WED', value: 38 },
  { day: 'THU', value: 55 },
  { day: 'FRI', value: 50 },
  { day: 'SAT', value: 62 },
  { day: 'SUN', value: 65 },
];

export default function Profile({ points, userEmail, onBack }: ProfileProps) {
  return (
    <div className="flex flex-col h-full bg-[#0A110A] text-white">
      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8 pb-24 custom-scrollbar">
        {/* Profile Info */}
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-6">
            <div className="w-32 h-32 rounded-full p-1 border-2 border-emerald-500/50">
              <div className="w-full h-full rounded-full overflow-hidden border-2 border-[#0A110A] bg-neutral-800">
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&h=256&auto=format&fit=crop" 
                  alt="Marcus Chen"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
            <div className="absolute bottom-1 right-1 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center border-4 border-[#0A110A]">
              <CheckCircle2 size={16} className="text-black" strokeWidth={3} />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-1">Marcus Chen</h2>
          <p className="text-emerald-500 font-bold text-sm mb-1">Senior Field Responder</p>
          <p className="text-neutral-500 text-xs font-medium">EcoTwin Certified • Grade 04</p>
        </div>

        {/* Stats Grid */}
        <div className="space-y-3">
          <StatCard 
            label="Tasks Completed" 
            value="342" 
            trend="+12%" 
            isPositive={true} 
          />
          <StatCard 
            label="Avg. Resolution" 
            value="22" 
            unit="mins"
            trend="-5%" 
            isPositive={false} 
          />
          <StatCard 
            label="Eco-Impact Score" 
            value="985" 
            trend="+15%" 
            isPositive={true} 
          />
        </div>

        {/* Efficiency Score Section */}
        <div className="space-y-4">
          <div className="flex items-end justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Efficiency Score</h3>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-emerald-500">94%</span>
              <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">7 Day Avg.</span>
            </div>
          </div>
          
          <div className="h-48 w-full bg-neutral-900/40 border border-white/5 rounded-2xl p-4 overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={EFFICIENCY_DATA}>
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#10b981" 
                  strokeWidth={3} 
                  dot={false}
                  animationDuration={2000}
                />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#525252' }}
                  dy={10}
                />
                <YAxis hide domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626', borderRadius: '12px' }}
                  itemStyle={{ color: '#10b981' }}
                  labelStyle={{ color: '#525252', fontSize: '10px' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Goal Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <h3 className="text-lg font-bold text-white">Weekly Goal</h3>
            <span className="text-sm font-bold text-neutral-400">85% Complete</span>
          </div>
          <div className="h-3 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full w-[85%] shadow-[0_0_15px_rgba(16,185,129,0.4)]" />
          </div>
          <p className="text-xs text-neutral-500">17 of 20 high-priority tasks resolved this week.</p>
        </div>

        {/* Skills Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">Skills & Certifications</h3>
          <div className="flex flex-wrap gap-3">
            <SkillTag icon={<Trash2 size={16} />} label="Waste Management" />
            <SkillTag icon={<Cpu size={16} />} label="AI Diagnostics" />
            <SkillTag icon={<Zap size={16} />} label="Emergency Response" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, unit, trend, isPositive }: { label: string, value: string, unit?: string, trend: string, isPositive: boolean }) {
  return (
    <div className="bg-neutral-900/40 border border-white/5 rounded-2xl p-5 flex items-center justify-between group hover:bg-neutral-900/60 transition-colors">
      <div>
        <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-1">{label}</span>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-white">{value}</span>
          {unit && <span className="text-sm text-neutral-500 font-medium">{unit}</span>}
        </div>
      </div>
      <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-bold ${
        isPositive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
      }`}>
        {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        {trend}
      </div>
    </div>
  );
}

function SkillTag({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <div className="flex items-center gap-2 px-4 py-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-default">
      <div className="text-emerald-500">{icon}</div>
      <span className="text-xs font-bold">{label}</span>
    </div>
  );
}
