import React from 'react';
import { Bell, X, Trash2, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { motion } from 'motion/react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  time: string;
  read: boolean;
}

interface NotificationsProps {
  notifications: Notification[];
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
}

export default function Notifications({ notifications, onClose, onMarkAsRead, onClearAll }: NotificationsProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="text-emerald-500" size={18} />;
      case 'warning': return <AlertTriangle className="text-amber-500" size={18} />;
      case 'error': return <X className="text-red-500" size={18} />;
      default: return <Info className="text-blue-500" size={18} />;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="absolute top-16 right-4 w-[calc(100vw-32px)] max-w-sm bg-[#0A1F14] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
    >
      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-emerald-950/20">
        <div className="flex items-center gap-2">
          <Bell size={18} className="text-emerald-500" />
          <h3 className="font-bold text-sm">Notifications</h3>
          {notifications.some(n => !n.read) && (
            <span className="bg-emerald-500 text-black text-[10px] font-black px-1.5 py-0.5 rounded-full">
              {notifications.filter(n => !n.read).length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={onClearAll}
            className="p-1.5 hover:bg-white/5 rounded-lg text-neutral-500 transition-colors"
            title="Clear all"
          >
            <Trash2 size={16} />
          </button>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-white/5 rounded-lg text-neutral-500 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        {notifications.length > 0 ? (
          <div className="flex flex-col">
            {notifications.map((n) => (
              <div 
                key={n.id} 
                className={`p-4 border-b border-white/5 flex gap-3 transition-colors cursor-pointer hover:bg-white/5 ${!n.read ? 'bg-emerald-500/5' : ''}`}
                onClick={() => onMarkAsRead(n.id)}
              >
                <div className="mt-0.5 shrink-0">
                  {getIcon(n.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={`text-sm font-bold truncate ${!n.read ? 'text-white' : 'text-neutral-400'}`}>
                      {n.title}
                    </h4>
                    <span className="text-[10px] text-neutral-600 shrink-0 ml-2">{n.time}</span>
                  </div>
                  <p className={`text-xs leading-relaxed ${!n.read ? 'text-neutral-300' : 'text-neutral-500'}`}>
                    {n.message}
                  </p>
                </div>
                {!n.read && (
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 shrink-0" />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 text-center flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-neutral-700">
              <Bell size={24} />
            </div>
            <p className="text-sm text-neutral-500">No new notifications</p>
          </div>
        )}
      </div>

      {notifications.length > 0 && (
        <div className="p-3 bg-emerald-950/10 text-center">
          <button className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest hover:underline">
            View All Activity
          </button>
        </div>
      )}
    </motion.div>
  );
}
