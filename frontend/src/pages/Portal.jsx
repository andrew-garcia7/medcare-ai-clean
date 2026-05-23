import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import {
  FaHome, FaCalendarAlt, FaFileMedical, FaPills, FaRobot, FaUser,
  FaHeartbeat, FaBell, FaSearch, FaChevronRight, FaFire, FaShieldAlt, FaTint,
} from "react-icons/fa";

export default function Portal() {
  const [active, setActive] = useState(0);
  const [hoveredBtn, setHoveredBtn] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { notifications, addNotification } = useNotificationStore();
  const unreadCount = notifications.filter((n) => !n.read).length;

  const userInitials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`;
  const userDisplayName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Patient';

  const searchItems = [
    { label: 'Appointments', path: '/dashboard/appointments' },
    { label: 'Records', path: '/dashboard/records' },
    { label: 'Prescriptions', path: '/dashboard/prescriptions' },
    { label: 'AI Assistant', path: '/dashboard/ai' },
    { label: 'Profile', path: '/dashboard/profile' },
    { label: 'Notifications', path: '/dashboard/notifications' },
    { label: 'Book Appointment', path: '/dashboard/appointments' },
    { label: 'Health Tips', path: '/dashboard/records' },
    { label: 'Medication Reminders', path: '/dashboard/prescriptions' },
  ];
  const filteredSearch = searchQuery.trim()
    ? searchItems.filter(s => s.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const [appointments, setAppointments] = useState([]);
  const [prescriptionCount, setPrescriptionCount] = useState(0);
  const [recordCount, setRecordCount] = useState(0);

  useEffect(() => {
    api.get('/appointments/user?upcoming=true').then(r => setAppointments(r.data?.data || [])).catch(() => {});
    api.get('/appointments/data/prescriptions').then(r => setPrescriptionCount(r.data?.count || 0)).catch(() => {});
    api.get('/appointments/data/records').then(r => setRecordCount(r.data?.count || 0)).catch(() => {});
  }, []);

  // Seed welcome notification once
  useEffect(() => {
    if (notifications.length === 0) {
      addNotification({ type: 'system', title: 'Welcome to MedCare!', message: 'Your patient portal is ready. Book appointments, track health records, and manage prescriptions — all in one place.' });
      addNotification({ type: 'info', title: 'Complete Your Profile', message: 'Add your medical history, allergies, and emergency contacts to get personalized care recommendations.' });
    }
  }, []);

  const nextApt = appointments[0] || null;
  const userName = user?.firstName || 'Ajoy';

  const menu = [
    { name: "Overview",      icon: <FaHome /> },
    { name: "Appointments",  icon: <FaCalendarAlt /> },
    { name: "Records",       icon: <FaFileMedical /> },
    { name: "Prescriptions", icon: <FaPills /> },
    { name: "AI Assistant",  icon: <FaRobot /> },
    { name: "Profile",       icon: <FaUser /> },
  ];
  const paths = ["/dashboard", "/dashboard/appointments", "/dashboard/records", "/dashboard/prescriptions", "/dashboard/ai", "/dashboard/profile"];

  const stats = [
    { num: String(appointments.length), label: "Appointments", color: "#06b6d4", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
    { num: String(prescriptionCount),   label: "Prescriptions", color: "#a78bfa", bg: "bg-purple-500/10", border: "border-purple-500/20" },
    { num: String(recordCount),          label: "Records",       color: "#3b82f6", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    { num: "72",                          label: "Heart Rate",    color: "#f43f5e", bg: "bg-rose-500/10", border: "border-rose-500/20", unit: "bpm" },
  ];

  const actionBtns = [
    { label: "Health Tips",      icon: <FaFire />,      color: "text-cyan-400",   bg: "bg-cyan-500/10",   border: "border-cyan-500/20", glow: "rgba(6,182,212,0.2)" },
    { label: "Reports Analysis", icon: <FaShieldAlt />, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20", glow: "rgba(139,92,246,0.2)" },
    { label: "Daily Progress",   icon: <FaHeartbeat />, color: "text-blue-400",   bg: "bg-blue-500/10",   border: "border-blue-500/20", glow: "rgba(59,130,246,0.2)" },
  ];

  const medications = [
    { name: "Atorvastatin 20mg", time: "8:00 PM", color: "#a78bfa", done: false },
    { name: "Metformin 500mg",   time: "1:00 PM", color: "#06b6d4", done: true },
    { name: "Vitamin D3 1000IU", time: "9:00 AM", color: "#f59e0b", done: true },
  ];

  return (
    <div className="min-h-screen w-full flex flex-col" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#1e293b;border-radius:99px}`}
      </style>

      <div className="flex flex-1">
        {/* SIDEBAR */}
        <div className="w-64 min-w-[256px] min-h-screen bg-gradient-to-b from-[#0a0f1a] to-[#0f172a] border-r border-white/5 flex flex-col p-[24px_14px] gap-1 overflow-y-auto">
          <div className="flex items-center gap-2.5 px-2.5 pb-6 border-b border-white/5 mb-2">
            <div className="w-[38px] h-[38px] bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-cyan-500/30">＋</div>
            <span className="text-lg font-bold text-white tracking-tight" style={{ fontFamily: "'Syne',sans-serif" }}>MedCare</span>
          </div>

          <p className="text-[10px] tracking-[1.5px] text-slate-600 uppercase px-2.5 pt-1 pb-2 font-semibold">Navigation</p>

          {menu.map((item, i) => (
            <motion.div key={i} whileHover={{ x: 4 }} whileTap={{ scale: 0.97 }}
              onClick={() => { setActive(i); navigate(paths[i]); }}
              className={`flex items-center gap-3 py-[11px] px-3.5 rounded-[13px] cursor-pointer text-sm transition-all border ${
                active === i
                  ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400 font-semibold'
                  : 'border-transparent text-slate-500 hover:bg-white/5 hover:text-slate-300'
              }`}>
              <span className={`text-[15px] ${active === i ? 'text-cyan-400' : 'text-slate-600'}`}>{item.icon}</span>
              {item.name}
              {active === i && <motion.span layoutId="chevron" className="ml-auto text-cyan-400 text-[10px]"><FaChevronRight /></motion.span>}
            </motion.div>
          ))}

          <div onClick={() => navigate("/dashboard/profile")}
            className="mt-auto p-3.5 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-2.5 cursor-pointer hover:bg-white/10 transition">
            <div className="w-[34px] h-[34px] rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold overflow-hidden">
              {user?.avatar ? (
                <img src={typeof user.avatar === 'string' ? user.avatar : user.avatar.url} alt="" className="w-full h-full object-cover" />
              ) : userInitials}
            </div>
            <div>
              <div className="text-[13px] font-semibold text-white">{userDisplayName}</div>
              <div className="text-[11px] text-slate-500">Patient</div>
            </div>
          </div>
        </div>

        {/* MAIN */}
        <div className="flex-1 overflow-y-auto p-7 flex flex-col gap-6 bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#020617]">

          {/* Header */}
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-[26px] font-extrabold text-white tracking-tight" style={{ fontFamily: "'Syne',sans-serif" }}>Patient Portal</h1>
              <p className="text-[13px] text-slate-500 mt-0.5">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} · Welcome back, {userName} 👋</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div onClick={() => setSearchOpen(!searchOpen)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-[13px] cursor-pointer transition-all ${
                    searchOpen
                      ? 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-400'
                      : 'bg-white/5 border border-white/10 text-slate-500 hover:text-slate-300 hover:border-white/20'
                  }`}>
                  <FaSearch className="text-xs" />
                  {!searchOpen && <span>Search…</span>}
                  {searchOpen && (
                    <input autoFocus value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Escape') { setSearchOpen(false); setSearchQuery(''); } if (e.key === 'Enter' && filteredSearch.length) { navigate(filteredSearch[0].path); setSearchOpen(false); setSearchQuery(''); } }}
                      onClick={e => e.stopPropagation()}
                      placeholder="Search portal…"
                      className="bg-transparent outline-none text-white text-[13px] w-40 placeholder-slate-500" />
                  )}
                </div>
                {searchOpen && searchQuery.trim() && (
                  <div className="absolute top-full mt-2 right-0 w-64 bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
                    {filteredSearch.length ? filteredSearch.map((item, i) => (
                      <div key={i} onClick={() => { navigate(item.path); setSearchOpen(false); setSearchQuery(''); }}
                        className="px-4 py-3 text-sm text-slate-300 hover:bg-cyan-500/10 hover:text-cyan-400 cursor-pointer transition flex items-center gap-2 border-b border-white/5 last:border-0">
                        <FaSearch className="text-[10px] text-slate-600" /> {item.label}
                      </div>
                    )) : (
                      <div className="px-4 py-3 text-sm text-slate-500">No results found</div>
                    )}
                  </div>
                )}
              </div>
              <motion.div whileHover={{ scale: 1.1 }} onClick={() => navigate("/dashboard/notifications")}
                className="w-[38px] h-[38px] rounded-full bg-white/5 border border-white/10 flex items-center justify-center cursor-pointer relative text-slate-400 hover:text-cyan-400 hover:border-cyan-500/20 transition">
                <FaBell />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1 border-2 border-[#0f172a]">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </motion.div>
              <motion.button onClick={() => navigate("/dashboard/appointments")}
                whileHover={{ scale: 1.04, boxShadow: '0 0 30px rgba(6,182,212,0.4)' }} whileTap={{ scale: 0.97 }}
                className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-none rounded-full font-semibold text-[13px] cursor-pointer shadow-lg shadow-cyan-500/25 flex items-center gap-2">
                + Book Appointment
              </motion.button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                whileHover={{ y: -5, boxShadow: '0 12px 30px rgba(0,0,0,0.3)' }}
                onClick={() => { if (i === 0) navigate("/dashboard/appointments"); if (i === 1) navigate("/dashboard/prescriptions"); if (i >= 2) navigate("/dashboard/records"); }}
                className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f172a] to-[#1e293b] border ${s.border} p-5 cursor-pointer group transition-all`}>
                <div className={`absolute -top-5 -right-5 w-20 h-20 rounded-full ${s.bg} opacity-60`} />
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition" />
                <div className="relative z-10">
                  <p className="text-[11px] text-slate-500 uppercase tracking-widest font-semibold mb-2">{s.label}</p>
                  <h2 className="text-3xl font-extrabold leading-none" style={{ fontFamily: "'Syne',sans-serif", color: s.color }}>
                    {s.num}{s.unit && <span className="text-sm font-normal text-slate-500 ml-1">{s.unit}</span>}
                  </h2>
                  <div className={`mt-3 h-[3px] rounded-full ${s.bg} overflow-hidden`}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${40 + i * 15}%` }} transition={{ delay: 0.5 + i * 0.1, duration: 0.8 }}
                      className="h-full rounded-full" style={{ background: s.color }} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Appointment + AI */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
              whileHover={{ y: -3 }}
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f172a] to-[#1e293b] border border-cyan-400/20 p-6">
              <div className="h-[3px] bg-gradient-to-r from-cyan-500 to-blue-600 absolute top-0 left-0 right-0" />
              <span className="text-[10px] font-bold tracking-widest text-cyan-400 uppercase">Upcoming</span>
              <h3 className="text-base font-bold text-white mt-2 mb-1" style={{ fontFamily: "'Syne',sans-serif" }}>Next Appointment</h3>
              <p className="text-[15px] font-semibold text-slate-200">{nextApt ? nextApt.doctorName : 'No upcoming appointments'}</p>
              <p className="text-[13px] text-slate-500 mt-0.5">{nextApt ? `🕙 ${nextApt.timeSlot} · ${nextApt.mode === 'video' ? 'Video Call' : 'In Person'} · ${nextApt.doctorSpecialization}` : 'Book one now →'}</p>
              <div className="mt-4 flex gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />Confirmed
                </span>
                <motion.button whileHover={{ scale: 1.05 }} onClick={() => navigate("/dashboard/appointments")}
                  className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-semibold cursor-pointer">View Details</motion.button>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}
              whileHover={{ y: -3 }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1e1b4b] to-[#0f172a] border border-purple-500/20 p-6">
              <div className="h-[3px] bg-gradient-to-r from-purple-500 to-cyan-500 absolute top-0 left-0 right-0" />
              <div className="flex items-center gap-2.5 mb-3">
                <motion.div animate={{ scale: [1, 1.08, 1], rotate: [0, 5, -5, 0] }} transition={{ repeat: Infinity, duration: 4 }}
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white text-lg shadow-lg shadow-purple-500/30">✦</motion.div>
                <div>
                  <h3 className="text-[15px] font-bold text-purple-300" style={{ fontFamily: "'Syne',sans-serif" }}>AI Health Insight</h3>
                  <p className="text-[10px] text-purple-400">Powered by MedCare AI</p>
                </div>
              </div>
              <p className="text-sm text-purple-200 leading-relaxed">Your health is improving steadily. Maintain your routine and stay consistent with medications for optimal recovery.</p>
              <div className="mt-3 text-[11px] text-purple-500">Updated 2 hours ago</div>
            </motion.div>
          </div>

          {/* Medications */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            className="rounded-2xl bg-gradient-to-br from-[#0f172a] to-[#1e293b] border border-white/10 p-6">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="text-base font-bold text-white" style={{ fontFamily: "'Syne',sans-serif" }}>Medication Reminders</h3>
                <p className="text-xs text-slate-500 mt-0.5">Take medicines on time for faster recovery.</p>
              </div>
              <span onClick={() => navigate("/dashboard/prescriptions")} className="text-[11px] text-cyan-400 font-semibold cursor-pointer hover:text-cyan-300 transition">View All →</span>
            </div>
            <div className="flex flex-col gap-2.5">
              {medications.map((med, i) => (
                <motion.div key={i} whileHover={{ x: 4 }} onClick={() => navigate("/dashboard/prescriptions")}
                  className={`flex items-center gap-3.5 p-3.5 rounded-xl cursor-pointer transition-all border ${
                    med.done ? 'bg-white/[0.02] border-white/5 opacity-60' : 'bg-white/5 border-white/10'
                  }`}>
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: med.color, boxShadow: `0 0 8px ${med.color}60` }} />
                  <span className={`flex-1 text-sm font-medium ${med.done ? 'text-slate-500 line-through' : 'text-slate-200'}`}>{med.name}</span>
                  <span className="text-xs text-slate-500">⏰ {med.time}</span>
                  <span className={`text-[11px] font-semibold px-3 py-0.5 rounded-full border ${
                    med.done ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'text-slate-300 border-white/10 bg-white/5'
                  }`}>{med.done ? '✓ Done' : 'Pending'}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {actionBtns.map((btn, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.08 }}
                whileHover={{ y: -5, boxShadow: `0 12px 35px ${btn.glow}` }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/dashboard/records")}
                onMouseEnter={() => setHoveredBtn(i)} onMouseLeave={() => setHoveredBtn(null)}
                className={`relative overflow-hidden p-5 rounded-2xl ${btn.bg} border ${btn.border} flex items-center justify-center gap-2.5 cursor-pointer transition-all`}>
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-current to-transparent opacity-30" style={{ color: btn.glow }} />
                <span className={`text-lg ${btn.color}`}>{btn.icon}</span>
                <span className={`text-[15px] font-bold ${btn.color} tracking-tight`} style={{ fontFamily: "'Syne',sans-serif" }}>{btn.label}</span>
              </motion.div>
            ))}
          </div>

          {/* Quick Metrics */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            className="rounded-2xl bg-gradient-to-br from-[#0f172a] to-[#1e293b] border border-white/10 px-6 py-4 flex items-center gap-8 flex-wrap">
            <span className="text-[11px] text-slate-600 uppercase tracking-widest font-semibold">Quick Metrics</span>
            {[
              { icon: <FaHeartbeat />, label: "BP",          val: "120/80",   color: "#f43f5e" },
              { icon: <FaTint />,      label: "Blood Sugar", val: "98 mg/dL", color: "#f59e0b" },
              { icon: <FaShieldAlt />, label: "Health Score", val: "87%",     color: "#06b6d4" },
              { icon: <FaFire />,      label: "Calories",    val: "1,840",    color: "#f97316" },
            ].map((m, i) => (
              <div key={i} className="flex items-center gap-2">
                <span style={{ color: m.color }} className="text-sm">{m.icon}</span>
                <div>
                  <div className="text-[10px] text-slate-500 font-semibold tracking-wider">{m.label}</div>
                  <div className="text-sm font-bold text-white" style={{ fontFamily: "'Syne',sans-serif" }}>{m.val}</div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
