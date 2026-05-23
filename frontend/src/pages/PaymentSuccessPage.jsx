import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import api from '../services/api';

const confettiColors = ['#14b8a6','#3b82f6','#a855f7','#f59e0b','#ef4444','#10b981','#ec4899','#f97316'];
const REDIRECT_SECONDS = 5;

export default function PaymentSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const data = location.state;

  const [fetchedData, setFetchedData] = useState(null);
  const [loading, setLoading] = useState(!data);
  const [redirectCount, setRedirectCount] = useState(REDIRECT_SECONDS);

  // Stable confetti values
  const confetti = useMemo(() =>
    Array.from({ length: 50 }).map((_, i) => ({
      w: Math.random() * 10 + 4,
      h: Math.random() * 10 + 4,
      round: Math.random() > 0.5,
      color: confettiColors[i % confettiColors.length],
      dy: -(120 + Math.random() * 300),
      dx: (Math.random() - 0.5) * 600,
      rot: Math.random() * 720 - 360,
    }))
  , []);

  // Fetch from backend if no route state
  useEffect(() => {
    if (data) { console.log('PaymentSuccess STATE:', data); return; }
    const pid = searchParams.get('pid');
    if (!pid) { navigate('/', { replace: true }); return; }
    api.get(`/appointments/payment/${pid}`)
      .then(res => {
        if (res.data?.success && res.data?.data) { setFetchedData(res.data.data); setLoading(false); }
        else navigate('/', { replace: true });
      })
      .catch(() => navigate('/', { replace: true }));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const finalData = data || fetchedData;

  // Auto-redirect countdown → dashboard
  useEffect(() => {
    if (!finalData) return;
    if (redirectCount <= 0) { navigate('/dashboard', { replace: true }); return; }
    const t = setTimeout(() => setRedirectCount(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [finalData, redirectCount, navigate]);

  /* Loading */
  if (loading && !finalData) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Loading payment details…</p>
      </div>
    );
  }
  if (!finalData) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center text-white">
        Something went wrong. Please try again.
      </div>
    );
  }

  const { doctorName, date, time, fee, paymentId, method, maskedCard, patientName } = finalData;
  const progressPct = ((REDIRECT_SECONDS - redirectCount) / REDIRECT_SECONDS) * 100;

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-4 pt-24 overflow-hidden relative">

      {/* Ambient glow */}
      <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-20 blur-[120px]"
        style={{ background: 'radial-gradient(circle, #10b981 0%, transparent 70%)' }} />

      {/* Confetti */}
      {confetti.map((c, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 0, x: 0, rotate: 0 }}
          animate={{ opacity: [0, 1, 1, 0], y: [0, c.dy], x: [0, c.dx], rotate: c.rot }}
          transition={{ delay: 0.2 + i * 0.022, duration: 2.4, ease: 'easeOut' }}
          className="absolute left-1/2 top-1/2 pointer-events-none"
          style={{ width: c.w, height: c.h, borderRadius: c.round ? '50%' : '2px', background: c.color }}
        />
      ))}

      <div className="w-full max-w-2xl mx-auto relative z-10">
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 160, damping: 20 }}
        >
          <div
            className="rounded-3xl overflow-hidden"
            style={{
              background: '#0b1120',
              boxShadow: '0 30px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04), 0 0 60px rgba(16,185,129,0.08)',
            }}
          >
            {/* Top gradient bar */}
            <div className="h-1 bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400" />

            <div className="px-8 sm:px-12 py-10 text-center">

              {/* Animated check circle */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.15, type: 'spring', stiffness: 260, damping: 18 }}
                className="relative w-28 h-28 mx-auto"
              >
                <motion.div
                  animate={{ scale: [1, 1.35, 1], opacity: [0.25, 0.05, 0.25] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -inset-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 blur-2xl"
                />
                <div className="absolute inset-0 rounded-full border-4 border-emerald-400/20" />
                <div className="absolute inset-2 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-[0_8px_32px_rgba(16,185,129,0.5)]">
                  <motion.svg
                    className="w-12 h-12 text-white"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                  >
                    <motion.path
                      d="M5 13l4 4L19 7"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ delay: 0.55, duration: 0.45, ease: 'easeOut' }}
                    />
                  </motion.svg>
                </div>
              </motion.div>

              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-8 text-3xl font-extrabold bg-gradient-to-r from-green-300 via-emerald-400 to-teal-400 bg-clip-text text-transparent"
              >
                Payment Successful!
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.65 }}
                className="text-slate-500 text-sm mt-2"
              >
                Your appointment has been confirmed
              </motion.p>

              {/* Amount */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.75 }}
                className="mt-6"
              >
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-600 font-semibold">Amount Paid</p>
                <p className="text-4xl font-extrabold text-white mt-1">
                  {'\u20B9'}{(fee || 500).toLocaleString('en-IN')}
                </p>
              </motion.div>

              {/* Transaction ID */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.85 }}
                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500/10 border border-emerald-500/20"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 text-xs font-semibold font-mono tracking-wide">{paymentId}</span>
              </motion.div>

              {/* Details card */}
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.95 }}
                className="mt-8 rounded-2xl p-6 text-left"
                style={{ background: '#111827', border: '1px solid #1e293b', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)' }}
              >
                <div className="space-y-4">
                  {[
                    { icon: '🩺', label: 'Doctor', value: doctorName || 'Doctor' },
                    { icon: '👤', label: 'Patient', value: patientName || '\u2014' },
                    { icon: '📅', label: 'Date', value: date ? new Date(date).toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' }) : '\u2014' },
                    { icon: '🕐', label: 'Time', value: time || '\u2014' },
                    { icon: '💳', label: 'Paid via', value: maskedCard ? `${method} ${maskedCard}` : method || 'Card' },
                  ].map((r, idx) => (
                    <motion.div
                      key={r.label}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1 + idx * 0.06 }}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-sm">{r.icon}</span>
                        <span className="text-slate-500 text-xs font-medium">{r.label}</span>
                      </div>
                      <span className="text-white/85 text-xs font-semibold">{r.value}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Progress bar + countdown */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="mt-6"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-600 text-[11px]">Redirecting to dashboard</span>
                  <span className="text-amber-400 text-[11px] font-bold tabular-nums">{redirectCount}s</span>
                </div>
                <div className="h-1.5 rounded-full bg-[#1a2236] overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
                    initial={{ width: '0%' }}
                    animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                  />
                </div>
              </motion.div>

              {/* Action buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 }}
                className="mt-8 flex gap-3"
              >
                <motion.button
                  whileHover={{ scale: 1.03, boxShadow: '0 8px 32px rgba(16,185,129,0.4)' }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate(`/receipt/${paymentId}?pid=${paymentId}`, { state: finalData })}
                  className="flex-1 py-4 rounded-2xl text-sm font-bold bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-[0_4px_24px_rgba(16,185,129,0.3)] transition-shadow flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  View Receipt
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03, boxShadow: '0 8px 32px rgba(251,191,36,0.4)' }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate('/dashboard')}
                  className="flex-1 py-4 rounded-2xl text-sm font-bold bg-gradient-to-r from-yellow-500 to-amber-600 text-white shadow-[0_4px_24px_rgba(251,191,36,0.3)] transition-shadow flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  Dashboard
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate('/')}
                  className="py-4 px-5 rounded-2xl text-sm font-medium text-slate-400 hover:text-white transition-all"
                  style={{ background: '#111827', border: '1px solid #1e293b' }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" />
                  </svg>
                </motion.button>
              </motion.div>

            </div>

            {/* Security footer */}
            <div className="px-8 pb-6">
              <div className="flex items-center justify-center gap-5 py-3 rounded-xl" style={{ background: '#111827', border: '1px solid #1e293b' }}>
                <div className="flex items-center gap-1 text-[10px] text-slate-500">
                  <svg className="w-3.5 h-3.5 text-green-500/70" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                  256-bit SSL
                </div>
                <div className="w-px h-3 bg-[#1e293b]" />
                <div className="flex items-center gap-1 text-[10px] text-slate-500">
                  <svg className="w-3.5 h-3.5 text-blue-400/70" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  PCI DSS
                </div>
                <div className="w-px h-3 bg-[#1e293b]" />
                <div className="flex items-center gap-1 text-[10px] text-slate-500">
                  <svg className="w-3.5 h-3.5 text-amber-400/70" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  RBI Verified
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
