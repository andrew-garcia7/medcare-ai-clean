import { Routes, Route, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Portal from "./Portal";
import BookAppointment from "./portal/BookAppointment";
import Records from "./portal/Records";
import Prescriptions from "./portal/Prescriptions";
import Profile from "./portal/Profile";
import VoiceAssistant from "../components/VoiceAssistant";
import { FaArrowLeft, FaTrash, FaTrashAlt, FaCheck } from "react-icons/fa";
import { useNotificationStore } from "../store/notificationStore";
import { useEffect } from "react";

const Notifications = () => {
  const navigate = useNavigate();
  const { notifications, deleteAll, deleteNotification, markAsRead } = useNotificationStore();

  // Mark all as read when viewing
  useEffect(() => {
    notifications.forEach((n) => {
      if (!n.read) markAsRead(n.id);
    });
  }, []);

  const formatTime = (iso) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const typeColors = {
    appointment: { border: 'border-cyan-500/20', glow: 'hover:shadow-[0_8px_30px_rgba(6,182,212,0.15)]', accent: 'bg-cyan-500/10 text-cyan-400' },
    payment:     { border: 'border-emerald-500/20', glow: 'hover:shadow-[0_8px_30px_rgba(16,185,129,0.15)]', accent: 'bg-emerald-500/10 text-emerald-400' },
    profile:     { border: 'border-purple-500/20', glow: 'hover:shadow-[0_8px_30px_rgba(139,92,246,0.15)]', accent: 'bg-purple-500/10 text-purple-400' },
    system:      { border: 'border-amber-500/20', glow: 'hover:shadow-[0_8px_30px_rgba(245,158,11,0.15)]', accent: 'bg-amber-500/10 text-amber-400' },
    success:     { border: 'border-emerald-500/20', glow: 'hover:shadow-[0_8px_30px_rgba(16,185,129,0.15)]', accent: 'bg-emerald-500/10 text-emerald-400' },
    warning:     { border: 'border-yellow-500/20', glow: 'hover:shadow-[0_8px_30px_rgba(234,179,8,0.15)]', accent: 'bg-yellow-500/10 text-yellow-400' },
    error:       { border: 'border-red-500/20', glow: 'hover:shadow-[0_8px_30px_rgba(239,68,68,0.15)]', accent: 'bg-red-500/10 text-red-400' },
    info:        { border: 'border-blue-500/20', glow: 'hover:shadow-[0_8px_30px_rgba(59,130,246,0.15)]', accent: 'bg-blue-500/10 text-blue-400' },
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-50 to-white">

      {/* Hero Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/3 w-96 h-96 rounded-full bg-amber-500/[0.07] blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-cyan-500/[0.05] blur-[100px]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 pt-12 pb-10">
          <div className="flex items-center justify-between">
            <button onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-amber-600 hover:border-amber-300/50 hover:shadow-[0_4px_16px_rgba(245,158,11,0.12)] transition-all text-sm cursor-pointer">
              <FaArrowLeft size={12} /> Back
            </button>
            <div className="text-center">
              <p className="text-amber-600 text-xs font-semibold tracking-[0.25em] uppercase mb-2">Portal</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-800" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                Your <span className="italic text-amber-600">Notifications</span>
              </h2>
            </div>
            {notifications.length > 0 ? (
              <button onClick={deleteAll}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-red-200 text-red-400 hover:bg-red-50 hover:border-red-300 transition-all text-sm cursor-pointer">
                <FaTrashAlt size={11} /> Clear All
              </button>
            ) : <div className="w-[120px]" />}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="w-full px-4 sm:px-8 lg:px-16 pb-24">
        {notifications.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-24">
            <div className="text-6xl mb-5">🔔</div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3" style={{ fontFamily: "'Cormorant Garamond', serif" }}>No Notifications</h3>
            <p className="text-sm text-slate-400">You're all caught up! We'll notify you of any updates.</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 max-w-7xl mx-auto">
            <AnimatePresence>
              {notifications.map((n, i) => {
                const colors = typeColors[n.type] || typeColors.info;
                return (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: i * 0.06, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                    whileHover={{ y: -8, scale: 1.03 }}
                    whileTap={{ y: -8, scale: 1.03 }}
                    className="relative group rounded-2xl bg-white border border-slate-200 transition-all duration-400 cursor-pointer hover:border-amber-400/60 hover:shadow-[0_8px_40px_rgba(245,158,11,0.18),0_0_60px_rgba(245,158,11,0.10)]"
                  >
                    <div className="p-6 rounded-2xl transition-all duration-400 group-hover:bg-gradient-to-br group-hover:from-[#18181b] group-hover:to-[#0f172a] group-active:bg-gradient-to-br group-active:from-[#18181b] group-active:to-[#0f172a]">
                      {/* Golden top accent line */}
                      <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 opacity-40 group-hover:opacity-90 transition-opacity duration-400" />

                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className={`w-11 h-11 rounded-xl ${colors.accent} flex items-center justify-center text-lg flex-shrink-0 border border-slate-100 group-hover:border-amber-300/30 group-hover:shadow-[0_0_12px_rgba(245,158,11,0.15)] transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-[#18181b] group-hover:to-[#0f172a] group-hover:text-amber-100 group-active:bg-gradient-to-br group-active:from-[#18181b] group-active:to-[#0f172a] group-active:text-amber-100`}>
                          {n.icon}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <h4 className="text-sm font-semibold text-slate-800 truncate group-hover:text-amber-100 group-active:text-amber-100 transition-colors">{n.title}</h4>
                            {!n.read && <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0 shadow-[0_0_6px_rgba(245,158,11,0.5)]" />}
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed group-hover:text-slate-300 group-active:text-slate-300 transition-colors">{n.message}</p>
                          <p className="text-[10px] text-slate-400 mt-2.5 uppercase tracking-wider font-medium group-hover:text-amber-200 group-active:text-amber-200 transition-colors">{formatTime(n.timestamp)}</p>
                        </div>

                        {/* Delete */}
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
                          className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center text-red-400 hover:bg-red-100 transition-all cursor-pointer flex-shrink-0"
                        >
                          <FaTrash size={10} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default function Dashboard() {
  return (
    <Routes>
      <Route index element={<Portal />} />
      <Route path="appointments" element={<BookAppointment />} />
      <Route path="records" element={<Records />} />
      <Route path="prescriptions" element={<Prescriptions />} />
      <Route path="ai" element={<VoiceAssistant />} />
      <Route path="profile" element={<Profile />} />
      <Route path="notifications" element={<Notifications />} />
    </Routes>
  );
}
