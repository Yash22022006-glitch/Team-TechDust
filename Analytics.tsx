import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area,
  LineChart,
  Line
} from 'recharts';
import {
  Shield,
  TrendingUp,
  Award,
  Wind,
  Droplets,
  Zap,
  Activity,
  AlertCircle
} from 'lucide-react';

interface SummaryItem {
  type: string;
  count: number;
}

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'];

// Mock data for futuristic metrics
const AQI_DATA = [
  { time: '00:00', value: 42 },
  { time: '04:00', value: 38 },
  { time: '08:00', value: 55 },
  { time: '12:00', value: 62 },
  { time: '16:00', value: 48 },
  { time: '20:00', value: 44 },
];

export default function Analytics({ summary, reports }: { summary: SummaryItem[], reports: any[] }) {
  const totalReports = summary.reduce((acc, curr) => acc + curr.count, 0);

  // Calculate a mock sustainability score
  const score = Math.max(0, 100 - (totalReports * 2));

  return (
    <div className="space-y-6 pb-8">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">System Analytics</h2>
          <p className="text-neutral-500 text-xs">Real-time environmental intelligence feed</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Live Twin Sync</span>
        </div>
      </div>

      {/* Top Grid: Health Index & AQI */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sustainability Score Card */}
        <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-2xl p-6 relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-emerald-400">
                <Shield size={18} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Environmental Health Index</span>
              </div>
              <div className="px-2 py-0.5 bg-emerald-500/20 rounded text-[8px] font-bold text-emerald-500 uppercase">Live</div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-6xl font-bold text-white tracking-tighter">{score}</span>
              <span className="text-emerald-500/50 text-sm font-medium">/ 100</span>
            </div>
            <p className="text-[10px] text-neutral-400 mt-2 max-w-[180px]">Composite score based on air quality, waste management, and community reports.</p>
            <div className="mt-6 flex items-center gap-3">
              <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-1000 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                  style={{ width: `${score}%` }}
                />
              </div>
              <span className="text-[10px] font-mono text-emerald-500 font-bold">OPTIMAL</span>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 blur-[80px] rounded-full -mr-24 -mt-24 group-hover:bg-emerald-500/20 transition-colors" />
        </div>

        {/* AQI Real-time Chart */}
        <div className="bg-neutral-900/50 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-blue-400">
              <Wind size={18} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Air Quality (AQI)</span>
            </div>
            <span className="text-xl font-bold text-white font-mono">48</span>
          </div>
          <div className="h-24 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={AQI_DATA}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorValue)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Violation Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-neutral-900/50 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 flex items-center gap-2">
              <TrendingUp size={16} />
              Violation Distribution
            </h3>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="type"
                  type="category"
                  stroke="#525252"
                  fontSize={9}
                  tickFormatter={(val) => val.replace('_', ' ')}
                  width={70}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626', borderRadius: '12px' }}
                  itemStyle={{ color: '#10b981' }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={15}>
                  {summary.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-neutral-900/50 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 flex items-center gap-2">
              <Wind size={16} />
              Air Quality Zones
            </h3>
          </div>
          <div className="space-y-4">
            {[
              { zone: 'Industrial Zone A', aqi: 72, status: 'Moderate' },
              { zone: 'Residential Sector 4', aqi: 34, status: 'Good' },
              { zone: 'Central Business Dist.', aqi: 56, status: 'Moderate' },
            ].map((zone, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs text-white font-medium">{zone.zone}</span>
                  <span className="text-[9px] text-neutral-500 uppercase tracking-wider">{zone.status}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${zone.aqi > 60 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${zone.aqi}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono text-white w-6">{zone.aqi}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Secondary Metrics Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-neutral-900/50 border border-white/10 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-cyan-400 mb-2">
            <Droplets size={16} />
            <span className="text-[9px] font-bold uppercase tracking-widest">Water Purity</span>
          </div>
          <div className="text-2xl font-bold text-white font-mono">94%</div>
          <div className="text-[9px] text-neutral-500 mt-1">Stable across 12 sensors</div>
        </div>
        <div className="bg-neutral-900/50 border border-white/10 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-amber-400 mb-2">
            <Zap size={16} />
            <span className="text-[9px] font-bold uppercase tracking-widest">Grid Load</span>
          </div>
          <div className="text-2xl font-bold text-white font-mono">62%</div>
          <div className="text-[9px] text-neutral-500 mt-1">Renewable mix: 40%</div>
        </div>
      </div>

      {/* Community Impact & AI Insights */}
      <div className="bg-neutral-900/50 border border-white/10 rounded-2xl p-6">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-6 flex items-center gap-2">
          <Activity size={16} />
          Digital Twin Insights
        </h3>
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-xl font-bold text-white font-mono">{totalReports}</div>
              <div className="text-[8px] text-neutral-500 uppercase tracking-wider">Incidents</div>
            </div>
            <div className="text-center border-x border-white/5">
              <div className="text-xl font-bold text-white font-mono">12</div>
              <div className="text-[8px] text-neutral-500 uppercase tracking-wider">Active Units</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-white font-mono">{Math.floor(totalReports * 0.4)}</div>
              <div className="text-[8px] text-neutral-500 uppercase tracking-wider">Resolutions</div>
            </div>
          </div>

          {/* Sustainability Goals */}
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">2026 Sustainability Goal</span>
              <span className="text-xs font-mono text-emerald-500">72%</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 w-[72%] rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
            </div>
            <p className="text-[9px] text-neutral-500 italic text-right">Target: 85% by Q4</p>
          </div>

          <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl flex gap-3">
            <AlertCircle className="text-emerald-500 shrink-0" size={18} />
            <div>
              <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider mb-1">AI Prediction</p>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Waste accumulation risk high in Sector 4 for the next 48h. Recommend preemptive routing.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Report History Section */}
      <div className="bg-neutral-900/50 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 flex items-center gap-2">
            <Activity size={16} />
            Report History
          </h3>
          <span className="text-[10px] font-mono text-emerald-500">{reports.length} Total Cases</span>
        </div>

        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {reports.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed border-white/5 rounded-2xl">
              <p className="text-neutral-500 text-xs">No reports found in history</p>
            </div>
          ) : (
            reports.map((report, index) => (
              <div key={report.id || index} className="bg-white/5 border border-white/5 rounded-xl p-4 flex gap-4 hover:bg-white/[0.07] transition-colors">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-black shrink-0 border border-white/10">
                  <img src={report.image_url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-sm font-bold text-white capitalize truncate">{report.type.replace('_', ' ')}</h4>
                    <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${report.status === 'verified' ? 'bg-emerald-500/20 text-emerald-400' :
                        report.status === 'assigned' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-yellow-500/20 text-yellow-400'
                      }`}>
                      {report.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-500 line-clamp-1 mb-2">{report.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[8px] text-neutral-600">
                      <TrendingUp size={10} />
                      <span>Case #ET-{1000 + (report.id || index)}</span>
                    </div>
                    <span className="text-[8px] text-neutral-600">{new Date(report.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
