import React, { useState, useEffect } from 'react';
import {
  Map as MapIcon,
  Camera,
  BarChart3,
  Globe,
  User,
  ShieldCheck,
  HardHat,
  LayoutGrid,
  Bell,
  Plus,
  Leaf,
  AlertCircle,
  Zap,
  Settings
} from 'lucide-react';
import MapDashboard from './components/MapDashboard';
import ReportForm from './components/ReportForm';
import Analytics from './components/Analytics';
import WorkerDashboard from './components/WorkerDashboard';
import Home from './components/Home';
import Notifications from './components/Notifications';
import ReportSuccess from './components/ReportSuccess';
import Profile from './components/Profile';
import AdminDashboard from './components/AdminDashboard';
import { motion, AnimatePresence } from 'motion/react';

type Role = 'public' | 'admin' | 'worker';

export default function App() {
  const [reports, setReports] = useState<any[]>([]);
  const [summary, setSummary] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'home' | 'map' | 'report' | 'analytics' | 'worker' | 'profile'>('home');
  const [role, setRole] = useState<Role>('public');
  const [points, setPoints] = useState(1250); // Initial points
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([
    { id: '1', title: 'Report Verified', message: 'Your report on "Garbage Dumping" has been verified by an admin.', type: 'success', time: '2h ago', read: false },
    { id: '2', title: 'New Task Assigned', message: 'A new environmental violation has been assigned to you.', type: 'info', time: '5h ago', read: false },
    { id: '3', title: 'System Update', message: 'EcoTwin v2.4 is now live with improved AI detection.', type: 'info', time: '1d ago', read: true },
    { id: '4', title: 'High Pollution Alert', message: 'Air quality in your area has dropped below safety levels.', type: 'warning', time: '2d ago', read: true },
  ]);

  const fetchData = async () => {
    try {
      const [reportsRes, summaryRes] = await Promise.all([
        fetch('/api/reports'),
        fetch('/api/analytics/summary')
      ]);

      if (!reportsRes.ok || !summaryRes.ok) {
        throw new Error(`HTTP error! status: ${reportsRes.status} ${summaryRes.status}`);
      }

      const reportsData = await reportsRes.json();
      const summaryData = await summaryRes.json();
      setReports(reportsData);
      setSummary(summaryData);
      setFetchError(null);
    } catch (err) {
      console.error("Failed to fetch data", err);
      setFetchError("Connection to server failed. Retrying...");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleAssign = async (id: number) => {
    await fetch(`/api/reports/${id}/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ worker_id: 'worker-01' })
    });
    fetchData();
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return (
    <div className="flex flex-col h-screen bg-[#050A05] text-white overflow-hidden font-sans">
      {/* Mobile Header */}
      <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-[#050A05]/80 backdrop-blur-xl z-30 sticky top-0">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
            <Leaf className="text-emerald-500 fill-emerald-500" size={20} />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xl tracking-tight">{role === 'admin' ? 'EcoTwin Admin' : 'EcoTwin'}</span>
            {role === 'admin' && (
              <span className="text-[9px] font-bold text-amber-500 tracking-[0.2em] uppercase">EXECUTIVE OVERVIEW</span>
            )}
          </div>
          {fetchError && (
            <div className="flex items-center gap-1 ml-4 px-2 py-0.5 bg-red-500/10 border border-red-500/20 rounded text-[10px] text-red-400 animate-pulse">
              <AlertCircle size={10} />
              <span>Offline</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            className="bg-neutral-900 border border-white/10 rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-wider outline-none"
          >
            <option value="public">Public</option>
            <option value="admin">Admin</option>
            <option value="worker">Worker</option>
          </select>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`p-2 rounded-full relative transition-colors ${showNotifications ? 'bg-emerald-500/20 text-emerald-500' : 'bg-white/5 text-white'}`}
          >
            <Bell size={20} />
            {notifications.some(n => !n.read) && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full border-2 border-[#050A05]" />
            )}
          </button>
        </div>
      </header>

      {/* Notifications Panel */}
      <AnimatePresence>
        {showNotifications && (
          <Notifications
            notifications={notifications}
            onClose={() => setShowNotifications(false)}
            onMarkAsRead={markAsRead}
            onClearAll={clearAllNotifications}
          />
        )}
      </AnimatePresence>

      {/* Success Screen */}
      <AnimatePresence>
        {showSuccess && (
          <ReportSuccess
            pointsEarned={50}
            onBackToHome={() => {
              setShowSuccess(false);
              setActiveTab('home');
            }}
            onViewStatus={() => {
              setShowSuccess(false);
              setActiveTab('map');
            }}
          />
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full overflow-y-auto"
            >
              {role === 'admin' ? (
                <AdminDashboard />
              ) : (
                <Home reports={reports} onStartReport={() => setActiveTab('report')} points={points} />
              )}
            </motion.div>
          )}

          {activeTab === 'map' && (
            <motion.div
              key="map"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col"
            >
              <div className="h-[45vh] w-full">
                <MapDashboard reports={reports} />
              </div>
              <div className="p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-500">Live Feed</h2>
                  <span className="text-[10px] font-mono text-emerald-500">{reports.length} active nodes</span>
                </div>
                <div className="space-y-3">
                  {reports.map(report => (
                    <div key={report.id} className="bg-neutral-900/50 border border-white/5 rounded-2xl p-4 flex gap-4">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-black shrink-0">
                        <img src={report.image_url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${report.status === 'verified' ? 'bg-emerald-500/20 text-emerald-400' :
                            report.status === 'assigned' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-yellow-500/20 text-yellow-400'
                            }`}>
                            {report.status}
                          </span>
                          <span className="text-[9px] text-neutral-600">{new Date(report.created_at).toLocaleTimeString()}</span>
                        </div>
                        <h3 className="text-sm font-bold capitalize truncate">{report.type.replace('_', ' ')}</h3>
                        <p className="text-xs text-neutral-500 line-clamp-1">{report.description}</p>

                        {role === 'admin' && report.status === 'pending' && (
                          <button
                            onClick={() => handleAssign(report.id)}
                            className="mt-2 text-[10px] font-bold text-blue-400 hover:text-blue-300 underline"
                          >
                            Assign to Field Worker
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'report' && (
            <motion.div
              key="report"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-6"
            >
              <ReportForm
                onReportSubmitted={() => {
                  fetchData();
                  setPoints(prev => prev + 50);
                  setShowSuccess(true);
                }}
                onClose={() => setActiveTab('home')}
              />
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full overflow-y-auto p-4"
            >
              <Analytics summary={summary} reports={reports} />
            </motion.div>
          )}

          {activeTab === 'worker' && (
            <motion.div
              key="worker"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full overflow-y-auto"
            >
              <WorkerDashboard reports={reports} onUpdate={fetchData} />
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full overflow-y-auto"
            >
              <Profile
                points={points}
                userEmail="sit23ec116@sairamtap.edu.in"
                onBack={() => setActiveTab('home')}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="relative z-40 shrink-0">
        {role === 'admin' ? (
          <nav className="h-20 bg-[#050A05]/95 backdrop-blur-2xl border-t border-white/5 w-full flex items-center justify-around px-2 pb-safe">
            <NavButton
              icon={<LayoutGrid size={24} />}
              label="Dashboard"
              active={activeTab === 'home'}
              onClick={() => setActiveTab('home')}
            />
            <NavButton
              icon={<MapIcon size={24} />}
              label="Map"
              active={activeTab === 'map'}
              onClick={() => setActiveTab('map')}
            />

            {/* Spacer for the floating center button */}
            <div className="w-14 shrink-0" />

            <NavButton
              icon={<Zap size={24} />}
              label="Alerts"
              active={activeTab === 'analytics'}
              onClick={() => setActiveTab('analytics')}
            />
            <NavButton
              icon={<Settings size={24} />}
              label="Settings"
              active={activeTab === 'profile'}
              onClick={() => setActiveTab('profile')}
            />
          </nav>
        ) : (
          <nav className="h-20 bg-[#050A05]/95 backdrop-blur-2xl border-t border-white/5 w-full flex items-center justify-around px-2 pb-safe">
            <NavButton
              icon={<LayoutGrid size={24} />}
              label="Home"
              active={activeTab === 'home'}
              onClick={() => setActiveTab('home')}
            />
            <NavButton
              icon={<MapIcon size={24} />}
              label="Explore"
              active={activeTab === 'map'}
              onClick={() => setActiveTab('map')}
            />

            {/* Spacer for the floating center button */}
            <div className="w-14 shrink-0" />

            {role === 'worker' ? (
              <NavButton
                icon={<HardHat size={24} />}
                label="Tasks"
                active={activeTab === 'worker'}
                onClick={() => setActiveTab('worker')}
              />
            ) : (
              <NavButton
                icon={<BarChart3 size={24} />}
                label="Reports"
                active={activeTab === 'analytics'}
                onClick={() => setActiveTab('analytics')}
              />
            )}
            <NavButton
              icon={<User size={24} />}
              label="Profile"
              active={activeTab === 'profile'}
              onClick={() => setActiveTab('profile')}
            />
          </nav>
        )}

        {/* Floating Center Plus Button */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-7 pointer-events-none">
          <button
            onClick={() => setActiveTab('report')}
            className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center text-black shadow-lg shadow-emerald-500/40 active:scale-90 transition-transform border-4 border-[#050A05] pointer-events-auto"
          >
            <Plus size={32} strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  );
}

function NavButton({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition-all duration-300 flex-1 ${active ? 'text-emerald-500' : 'text-neutral-500'
        }`}
    >
      <div className={`p-1 rounded-xl transition-colors`}>
        {icon}
      </div>
      <span className="text-[10px] font-bold tracking-tight">{label}</span>
    </button>
  );
}
