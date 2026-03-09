import React from 'react';
import { 
  Trash2, 
  CheckCircle, 
  Camera, 
  ChevronRight, 
  MapPin, 
  Clock,
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import MapDashboard from './MapDashboard';

interface HomeProps {
  reports: any[];
  onStartReport: () => void;
  points: number;
}

export default function Home({ reports, onStartReport, points }: HomeProps) {
  // Mock stats for now as per image
  const stats = [
    { label: 'Impact Points', value: points.toLocaleString(), change: '+50 from last report', icon: <CheckCircle size={18} className="text-emerald-500" /> },
    { label: 'Waste Cleaned', value: '5 Tons', change: '+15% from last month', icon: <Trash2 size={18} className="text-emerald-500" /> },
  ];

  const myReports = reports.slice(0, 2); // Mocking "my reports"

  return (
    <div className="flex flex-col gap-6 p-4 pb-10">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-neutral-900/80 border border-white/5 rounded-2xl p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-emerald-500">
              {stat.icon}
              <span className="text-[10px] font-bold uppercase tracking-wider">{stat.label}</span>
            </div>
            <div className="text-2xl font-black">{stat.value}</div>
            <div className="text-[10px] text-emerald-500 font-medium">{stat.change}</div>
          </div>
        ))}
      </div>

      {/* Report Banner */}
      <div className="relative overflow-hidden bg-[#0A1F14] border border-emerald-500/10 rounded-3xl p-6">
        <div className="relative z-10 flex flex-col gap-2">
          <h2 className="text-xl font-bold text-white tracking-tight">Report Environmental Issue</h2>
          <p className="text-xs text-neutral-400 leading-relaxed max-w-[240px]">
            Help keep your city clean. Snap a photo of illegal dumping or pollution.
          </p>
          <button 
            onClick={onStartReport}
            className="mt-4 bg-[#10B981] hover:bg-[#059669] text-black font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] w-full"
          >
            <Camera size={20} className="stroke-[2.5]" />
            <span className="text-sm">Start Report</span>
          </button>
        </div>
        
        {/* Abstract geometric pattern in background */}
        <div className="absolute bottom-0 right-0 opacity-10 pointer-events-none translate-x-4 translate-y-4">
          <div className="w-24 h-24 border-[12px] border-emerald-500 rotate-45" />
        </div>
      </div>

      {/* Track My Reports */}
      <div className="flex flex-col gap-3">
        <h3 className="text-lg font-bold">Track My Reports</h3>
        <div className="flex flex-col gap-3">
          {myReports.length > 0 ? myReports.map((report, i) => (
            <div key={report.id} className="bg-neutral-900/50 border border-white/5 rounded-2xl p-3 flex gap-4">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-black shrink-0">
                <img src={report.image_url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                <div className="flex justify-between items-start">
                  <h4 className="text-sm font-bold truncate pr-2 capitalize">{report.type.replace('_', ' ')}</h4>
                  <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-tighter ${
                    report.status === 'verified' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {report.status === 'verified' ? 'RESOLVED' : 'IN REVIEW'}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-neutral-500 text-[10px]">
                  <Clock size={10} />
                  <span>{report.status === 'verified' ? 'Closed on Oct 12' : 'Reported 2 hours ago'}</span>
                </div>
                <div className="w-full h-1.5 bg-neutral-800 rounded-full mt-2 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${report.status === 'verified' ? 'bg-emerald-500 w-full' : 'bg-emerald-500 w-1/3'}`} 
                  />
                </div>
              </div>
            </div>
          )) : (
            <div className="text-center py-6 bg-neutral-900/30 rounded-2xl border border-dashed border-white/10">
              <p className="text-xs text-neutral-500">No reports tracked yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
