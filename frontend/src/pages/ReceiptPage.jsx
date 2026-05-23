import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import api from '../services/api';

export default function ReceiptPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const receiptRef = useRef(null);
  const data = location.state;

  const [fetchedData, setFetchedData] = useState(null);
  const [loading, setLoading] = useState(!data);

  useEffect(() => {
    if (data) { console.log('Receipt STATE:', data); return; }
    const pid = searchParams.get('pid') || id;
    if (!pid) { navigate('/', { replace: true }); return; }
    api.get(`/appointments/payment/${pid}`)
      .then(res => {
        if (res.data?.success && res.data?.data) { setFetchedData(res.data.data); setLoading(false); }
        else navigate('/', { replace: true });
      })
      .catch(() => navigate('/', { replace: true }));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const finalData = data || fetchedData;

  if (loading && !finalData) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Loading receipt…</p>
      </div>
    );
  }
  if (!finalData) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center text-white">
        Failed to load receipt.
      </div>
    );
  }

  const {
    doctorName, doctor, date, time, fee, paymentId, method, maskedCard,
    patientName, patientPhone, patientEmail, visitReason, appointmentId,
  } = finalData;

  const displayDate = date
    ? new Date(date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : '\u2014';
  const paidVia = maskedCard ? `${method} ${maskedCard}` : method || 'Card';
  const nowStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex flex-col items-center justify-center p-4 sm:p-8 pt-24 relative">

      {/* Ambient glow */}
      <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-15 blur-[120px]"
        style={{ background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)' }} />

      {/* Receipt Card */}
      <motion.div
        ref={receiptRef}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-2xl relative z-10"
      >
        <div
          className="rounded-3xl overflow-hidden"
          style={{
            background: '#0b1120',
            boxShadow: '0 30px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04), 0 0 60px rgba(245,158,11,0.06)',
          }}
        >
          {/* Gold top border */}
          <div className="h-1 bg-gradient-to-r from-yellow-500 via-amber-400 to-orange-500" />

          {/* Header */}
          <div className="px-8 sm:px-12 pt-10 pb-8 text-center" style={{ background: 'linear-gradient(180deg, #111827 0%, #0b1120 100%)' }}>
            {/* Logo */}
            <div className="flex items-center justify-center gap-2.5 mb-5">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 via-yellow-500 to-orange-500 flex items-center justify-center shadow-[0_4px_20px_rgba(251,191,36,0.35)]">
                <svg className="w-5.5 h-5.5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">MedCare</span>
            </div>

            <h1 className="text-2xl font-extrabold text-white tracking-tight">Payment Receipt</h1>
            <p className="text-slate-500 text-sm mt-1">Transaction confirmed</p>

            {/* Success badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
              className="mt-5 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-emerald-500/10 border border-emerald-500/20"
            >
              <svg className="w-4.5 h-4.5 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-emerald-400 text-sm font-bold">Paid Successfully</span>
            </motion.div>

            {/* Amount */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-6"
            >
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-600 font-semibold">Amount Paid</p>
              <p className="text-5xl font-extrabold text-white mt-1">{'\u20B9'}{(fee || 500).toLocaleString('en-IN')}</p>
            </motion.div>
          </div>

          {/* Tear effect separator */}
          <div className="relative px-4">
            <div className="border-t-2 border-dashed border-[#1a2236]" />
            <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#0a0e1a]" />
            <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#0a0e1a]" />
          </div>

          {/* Details */}
          <div className="px-8 sm:px-12 py-8">
            {/* Transaction ID bar */}
            <div className="flex items-center justify-between mb-6 px-5 py-4 rounded-2xl" style={{ background: '#111827', border: '1px solid #1e293b', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)' }}>
              <div>
                <p className="text-[9px] uppercase tracking-[0.15em] text-slate-500 font-semibold">Transaction ID</p>
                <p className="text-amber-400 text-xs font-bold font-mono mt-0.5">{paymentId || id}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] uppercase tracking-[0.15em] text-slate-500 font-semibold">Date & Time</p>
                <p className="text-white/80 text-xs font-medium mt-0.5">{nowStr}</p>
              </div>
            </div>

            {/* Detail rows */}
            <div className="space-y-0">
              {[
                { label: 'Doctor', value: doctorName || 'Doctor', icon: '🩺' },
                doctor?.specialization && { label: 'Specialization', value: doctor.specialization, icon: '🏥' },
                { label: 'Patient', value: patientName || '\u2014', icon: '👤' },
                patientPhone && { label: 'Phone', value: patientPhone, icon: '📞' },
                patientEmail && { label: 'Email', value: patientEmail, icon: '✉️' },
                { label: 'Appointment Date', value: displayDate, icon: '📅' },
                { label: 'Time Slot', value: time || '\u2014', icon: '🕐' },
                visitReason && { label: 'Reason', value: visitReason, icon: '📋' },
                { label: 'Payment Method', value: paidVia, icon: '💳' },
                { label: 'Status', value: 'Confirmed', icon: '✅', highlight: true },
              ].filter(Boolean).map((row, i) => (
                <motion.div
                  key={row.label}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.05 }}
                  className="flex items-center justify-between py-3.5 border-b border-[#1a2236] last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm w-5 text-center">{row.icon}</span>
                    <span className="text-slate-500 text-xs font-medium">{row.label}</span>
                  </div>
                  <span className={`text-xs font-semibold max-w-[55%] text-right ${row.highlight ? 'text-emerald-400' : 'text-white/85'}`}>
                    {row.value}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Fee breakdown */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="mt-6 p-5 rounded-2xl"
              style={{ background: '#111827', border: '1px solid #1e293b', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)' }}
            >
              <div className="space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Consultation Fee</span>
                  <span className="text-white/80">{'\u20B9'}{fee || 500}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Platform Fee</span>
                  <span className="text-emerald-400 font-semibold">FREE</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">GST</span>
                  <span className="text-slate-500">Included</span>
                </div>
                <div className="h-px bg-[#1a2236] my-1" />
                <div className="flex justify-between items-center">
                  <span className="text-white font-semibold text-sm">Total Paid</span>
                  <span className="text-xl font-extrabold bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">{'\u20B9'}{fee || 500}</span>
                </div>
              </div>
            </motion.div>

            {appointmentId && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-4 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/5 border border-amber-500/10"
              >
                <svg className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span className="text-amber-400/70 text-[10px]">Appointment Ref: <span className="font-mono font-semibold text-amber-400">{appointmentId}</span></span>
              </motion.div>
            )}
          </div>

          {/* Security footer */}
          <div className="px-8 sm:px-12 pb-8">
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

      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
        className="mt-6 w-full max-w-2xl flex gap-3 relative z-10"
      >
        <motion.button
          whileHover={{ scale: 1.03, boxShadow: '0 8px 32px rgba(59,130,246,0.4)' }}
          whileTap={{ scale: 0.97 }}
          onClick={() => window.print()}
          className="flex-1 py-4 rounded-2xl text-sm font-bold bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-[0_4px_24px_rgba(59,130,246,0.3)] transition-shadow flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download Receipt
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

      {/* Watermark */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3 }}
        className="mt-6 text-slate-700 text-[10px] text-center relative z-10"
      >
        This is a computer-generated receipt and does not require a signature.
      </motion.p>
    </div>
  );
}
