import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FaFileMedical, FaFlask, FaXRay, FaStethoscope,
  FaCalendarAlt, FaChevronDown, FaChevronUp, FaNotesMedical, FaArrowLeft,
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../services/api';

const TC = {
  visit:   { icon: <FaStethoscope />, c: 'text-yellow-400',  bg: 'bg-yellow-400/10',  bd: 'border-yellow-400/20',  label: 'Consultation' },
  lab:     { icon: <FaFlask />,       c: 'text-amber-400',   bg: 'bg-amber-400/10',   bd: 'border-amber-400/20',   label: 'Lab Report' },
  imaging: { icon: <FaXRay />,        c: 'text-orange-400',  bg: 'bg-orange-400/10',  bd: 'border-orange-400/20',  label: 'Imaging' },
  default: { icon: <FaFileMedical />, c: 'text-yellow-400/60', bg: 'bg-yellow-400/5', bd: 'border-yellow-400/10',  label: 'Record' },
};

const mouseGlow = (e) => {
  const rect = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--x', `${e.clientX - rect.left}px`);
  e.currentTarget.style.setProperty('--y', `${e.clientY - rect.top}px`);
};

export default function Records() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    const params = filter !== 'all' ? `?type=${filter}` : '';
    api.get(`/appointments/data/records${params}`)
      .then(r => { setRecords(r.data?.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [filter]);

  const filters = [
    { value: 'all', label: 'All Records' },
    { value: 'visit', label: 'Consultations' },
    { value: 'lab', label: 'Lab Reports' },
    { value: 'imaging', label: 'Imaging' },
  ];

  const cfg = (type) => TC[type] || TC.default;

  const grouped = {};
  records.forEach(rec => {
    const d = new Date(rec.date);
    const key = `${d.toLocaleString('default', { month: 'long' })} ${d.getFullYear()}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(rec);
  });

  return (
    <div className="w-full px-4 sm:px-6 lg:px-10 py-8 space-y-7">
      {/* ── Golden Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <motion.button whileHover={{ scale: 1.05, x: -2 }} whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0f172a] border border-yellow-400/20 backdrop-blur text-yellow-400/70 hover:text-yellow-300 hover:border-yellow-400/40 transition-all text-sm cursor-pointer shadow-[0_0_15px_rgba(251,191,36,0.08)]">
            <FaArrowLeft size={12} /> Back
          </motion.button>
          <div>
            <h1 className="text-4xl md:text-5xl tracking-wide luxury-text" style={{ fontFamily: "'Playfair Display', 'Cormorant Garamond', serif" }}>
              Medical Records
            </h1>
            <p className="text-sm text-gray-400 mt-1 italic">Your complete health timeline</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {records.length > 0 && !loading && (
            !confirmDelete ? (
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-red-400/70 hover:text-red-400 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 hover:border-red-500/20 transition-all cursor-pointer">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                Delete All
              </motion.button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-red-400">Delete all?</span>
                <motion.button whileTap={{ scale: 0.95 }}
                  onClick={async () => {
                    try {
                      await api.delete('/appointments/data/records');
                      setRecords([]);
                      toast.success('All records deleted');
                    } catch { toast.error('Failed to delete'); }
                    setConfirmDelete(false);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-red-500 hover:bg-red-600 transition-colors cursor-pointer">Yes</motion.button>
                <motion.button whileTap={{ scale: 0.95 }}
                  onClick={() => setConfirmDelete(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 bg-[#1a2236] hover:bg-[#253049] transition-colors cursor-pointer">Cancel</motion.button>
              </div>
            )
          )}
          <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 shadow-[0_0_12px_rgba(251,191,36,0.1)]">
            {records.length} Records
          </span>
        </div>
      </div>

      {/* ── Golden Filters ── */}
      <div className="flex gap-2 flex-wrap">
        {filters.map(f => (
          <motion.button key={f.value} whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}
            onClick={() => setFilter(f.value)}
            className={`px-5 py-2 rounded-full text-sm font-semibold cursor-pointer transition-all duration-300 border ${
              filter === f.value
                ? 'bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 text-black border-yellow-400/50 shadow-[0_0_18px_rgba(251,191,36,0.3)]'
                : 'bg-[#0f172a] text-slate-400 border-yellow-400/10 hover:border-yellow-400/30 hover:text-yellow-400/80'
            }`}>{f.label}</motion.button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
            className="w-10 h-10 border-[3px] border-slate-700 border-t-yellow-400 rounded-full" />
        </div>
      ) : records.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <FaFileMedical size={40} className="mx-auto mb-3 opacity-30" />
          <p>No records found</p>
        </div>
      ) : (
        <div className="relative pl-7">
          {/* Golden timeline line */}
          <div className="absolute left-[10px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-yellow-400 via-amber-500 to-slate-700/30 rounded-full" />

          {Object.entries(grouped).map(([month, recs]) => (
            <div key={month} className="mb-7">
              <div className="flex items-center gap-3 mb-3.5 -ml-7">
                <div className="w-[22px] h-[22px] rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center z-10 shadow-[0_0_12px_rgba(251,191,36,0.35)]">
                  <FaCalendarAlt size={9} className="text-black" />
                </div>
                <span className="text-sm font-bold text-yellow-400" style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic' }}>{month}</span>
              </div>

              <div className="flex flex-col gap-3">
                {recs.map((rec, i) => {
                  const c = cfg(rec.type);
                  const open = expandedId === rec._id;
                  return (
                    <motion.div key={rec._id}
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                      className="premium-card cursor-pointer"
                      onMouseMove={mouseGlow}
                      onClick={() => setExpandedId(open ? null : rec._id)}>
                      <div className="card-inner">
                        {/* Gold accent bar */}
                        <div className="h-[2px] w-full bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 opacity-60" />

                        <div className="relative z-10 p-4 flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl ${c.bg} border ${c.bd} flex items-center justify-center ${c.c} text-base shrink-0`}>{c.icon}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{rec.title}</p>
                            <p className="text-xs text-gray-400">{rec.doctorName} &middot; {new Date(rec.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                          </div>
                          <span className={`text-[11px] px-3 py-0.5 rounded-full ${c.bg} ${c.c} border ${c.bd} font-semibold hidden sm:inline`}>{c.label}</span>
                          <span className="text-yellow-400/40 text-xs">{open ? <FaChevronUp /> : <FaChevronDown />}</span>
                        </div>

                        <AnimatePresence>
                          {open && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                              className="overflow-hidden">
                              <div className="mx-4 mb-4 pt-3 border-t border-yellow-400/10 space-y-3">
                                {rec.diagnosis && (
                                  <div className="p-3 rounded-xl bg-yellow-400/5 border border-yellow-400/15">
                                    <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-wider">Diagnosis</span>
                                    <p className="text-sm font-semibold text-yellow-300 mt-1">{rec.diagnosis}</p>
                                  </div>
                                )}
                                {rec.notes && (
                                  <div className="flex gap-2 items-start">
                                    <FaNotesMedical className="text-yellow-400/40 mt-0.5 shrink-0" />
                                    <p className="text-sm text-slate-300 leading-relaxed">{rec.notes}</p>
                                  </div>
                                )}
                                {rec.results && (
                                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {Object.entries(rec.results).map(([key, val]) => (
                                      <div key={key} className="p-2.5 rounded-xl bg-[#0a0f1a] border border-yellow-400/10">
                                        <p className="text-[10px] text-gray-500 font-semibold uppercase">{key.replace(/([A-Z])/g, ' $1')}</p>
                                        <p className="text-sm font-bold text-white mt-0.5" style={{ fontFamily: "'Syne',sans-serif" }}>{val}</p>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
