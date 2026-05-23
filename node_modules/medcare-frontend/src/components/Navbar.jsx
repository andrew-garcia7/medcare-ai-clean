import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import { useAuthStore } from '../store/authStore';
import MadoxLogo from './ui/MadoxLogo';
import api from '../services/api';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/doctors', label: 'Doctors' },
  { to: '/book', label: 'Book' },
  { to: '/emergency', label: 'Emergency' },
  { to: '/dashboard', label: 'Portal' },
];

function NavLinkItem({ to, label, location }) {
  const active =
    location.pathname === to || (to !== '/' && location.pathname.startsWith(to));

  return (
    <Link
      to={to}
      className={`group relative px-1 py-2 text-[13px] font-medium font-sans tracking-normal transition-colors duration-300 ease-out whitespace-nowrap ${
        active ? 'text-slate-700' : 'text-slate-500 hover:text-slate-700'
      }`}
    >
      {label}
      <span
        className={`absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 origin-center transition-transform duration-300 ease-out ${
          active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
        }`}
      />
    </Link>
  );
}

/* ───────────────── PAYMENT PANEL ───────────────── */
function PaymentPanel({ open, onClose }) {
  const panelRef = useRef(null);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ totalPaid: 0, totalPending: 0, currency: 'INR' });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/appointments/payments/history');
      if (data.success) {
        setTransactions(data.data);
        setSummary(data.summary);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) { fetchPayments(); setConfirmDelete(false); }
  }, [open, fetchPayments]);

  useEffect(() => {
    function handleClick(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open, onClose]);

  const filtered = activeTab === 'all'
    ? transactions
    : transactions.filter(t => t.status === activeTab);

  const statusColor = (s) => {
    if (s === 'paid') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (s === 'pending') return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    if (s === 'failed') return 'text-red-400 bg-red-500/10 border-red-500/20';
    return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
  };

  const statusIcon = (s) => {
    if (s === 'paid') return (
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
      </svg>
    );
    if (s === 'pending') return (
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
    return (
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    );
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            onClick={onClose}
          />
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: -12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-full mt-2 w-[380px] sm:w-[420px] rounded-2xl overflow-hidden z-50"
            style={{ boxShadow: '0 25px 80px rgba(0,0,0,0.7), 0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)' }}
          >
            {/* Solid opaque background - no transparency */}
            <div className="bg-[#0b1120] rounded-2xl overflow-hidden">
              {/* Top gold accent bar */}
              <div className="h-[2.5px] w-full bg-gradient-to-r from-yellow-500 via-amber-400 to-orange-500" />

              {/* Header */}
              <div className="px-5 pt-5 pb-4" style={{ background: 'linear-gradient(180deg, #111827 0%, #0b1120 100%)' }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 via-yellow-500 to-orange-500 flex items-center justify-center shadow-[0_4px_16px_rgba(251,191,36,0.35)]">
                      <svg className="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-[15px] font-bold text-white tracking-tight">Payments</h3>
                      <p className="text-[10px] text-slate-500 mt-0.5">Transaction history</p>
                    </div>
                  </div>
                  <button onClick={onClose} className="w-8 h-8 rounded-xl bg-[#1a2236] border border-[#253049] flex items-center justify-center text-slate-500 hover:text-white hover:bg-[#1e2943] transition-all duration-200">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>

                {/* Delete All confirmation */}
                {transactions.length > 0 && (
                  <div className="mb-4">
                    {!confirmDelete ? (
                      <button
                        onClick={() => setConfirmDelete(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold text-red-400/70 hover:text-red-400 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 hover:border-red-500/20 transition-all"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        Delete All History
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-red-400">Delete all transactions?</span>
                        <button
                          onClick={async () => {
                            try {
                              await api.delete('/appointments/payments/history');
                              setTransactions([]);
                              setSummary({ totalPaid: 0, totalPending: 0, currency: 'INR' });
                            } catch { /* ignore */ }
                            setConfirmDelete(false);
                          }}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-white bg-red-500 hover:bg-red-600 transition-colors"
                        >Yes, Delete</button>
                        <button
                          onClick={() => setConfirmDelete(false)}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-medium text-slate-400 bg-[#1a2236] hover:bg-[#253049] transition-colors"
                        >Cancel</button>
                      </div>
                    )}
                  </div>
                )}

                {/* Summary cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative px-4 py-3 rounded-xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #064e3b 0%, #0b1120 100%)' }}>
                    <div className="absolute top-0 right-0 w-16 h-16 rounded-full bg-emerald-500/10 -translate-y-1/2 translate-x-1/2" />
                    <div className="relative">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                          <svg className="w-2.5 h-2.5 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <p className="text-[9px] uppercase tracking-[0.15em] text-emerald-400/80 font-semibold">Total Paid</p>
                      </div>
                      <p className="text-xl font-extrabold text-emerald-400">{'\u20B9'}{summary.totalPaid.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                  <div className="relative px-4 py-3 rounded-xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #78350f33 0%, #0b1120 100%)' }}>
                    <div className="absolute top-0 right-0 w-16 h-16 rounded-full bg-amber-500/10 -translate-y-1/2 translate-x-1/2" />
                    <div className="relative">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <div className="w-4 h-4 rounded-full bg-amber-500/20 flex items-center justify-center">
                          <svg className="w-2.5 h-2.5 text-amber-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <p className="text-[9px] uppercase tracking-[0.15em] text-amber-400/80 font-semibold">Pending</p>
                      </div>
                      <p className="text-xl font-extrabold text-amber-400">{'\u20B9'}{summary.totalPending.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-[#1a2236]" />

              {/* Tabs */}
              <div className="px-5 pt-3.5 pb-1 bg-[#0b1120] flex gap-1.5">
                {[
                  { key: 'all', label: 'All', count: transactions.length },
                  { key: 'paid', label: 'Paid', count: transactions.filter(t => t.status === 'paid').length },
                  { key: 'pending', label: 'Pending', count: transactions.filter(t => t.status === 'pending').length },
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-3.5 py-2 rounded-lg text-[11px] font-semibold transition-all duration-200 ${
                      activeTab === tab.key
                        ? 'bg-gradient-to-b from-amber-500/20 to-amber-600/10 text-amber-300 border border-amber-400/30 shadow-[0_2px_8px_rgba(251,191,36,0.1)]'
                        : 'text-slate-500 hover:text-slate-300 hover:bg-[#131b2e] border border-transparent'
                    }`}
                  >
                    {tab.label}
                    {tab.count > 0 && <span className={`ml-1.5 text-[9px] ${activeTab === tab.key ? 'text-amber-400/60' : 'text-slate-600'}`}>({tab.count})</span>}
                  </button>
                ))}
              </div>

              {/* Transaction list */}
              <div className="px-4 py-3 max-h-[340px] overflow-y-auto space-y-2 bg-[#0b1120]" style={{ scrollbarWidth: 'thin', scrollbarColor: '#1e293b #0b1120' }}>
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-8 h-8 border-[2.5px] border-[#1a2236] border-t-amber-400 rounded-full animate-spin" />
                    <p className="text-slate-600 text-[10px] mt-3">Loading transactions...</p>
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-[#111827] border border-[#1a2236] flex items-center justify-center">
                      <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" strokeWidth={1.2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <p className="text-slate-500 text-xs font-medium">No transactions found</p>
                    <p className="text-slate-700 text-[10px] mt-1">Payment history will appear here</p>
                  </div>
                ) : (
                  filtered.map((txn, i) => (
                    <motion.div
                      key={txn._id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="group p-3.5 rounded-xl border transition-all duration-200 cursor-default"
                      style={{ background: '#111827', borderColor: '#1a2236' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#141d2f'; e.currentTarget.style.borderColor = '#253049'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#111827'; e.currentTarget.style.borderColor = '#1a2236'; }}
                    >
                      <div className="flex items-start gap-3">
                        {/* Doctor avatar */}
                        <div className="w-11 h-11 rounded-xl overflow-hidden border-2 border-[#1a2236] flex-shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
                          {txn.doctorPhoto ? (
                            <img src={txn.doctorPhoto} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-[10px] font-bold">
                              {txn.doctorName?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-white text-[13px] font-semibold truncate">{txn.doctorName}</p>
                            <span className={`text-[13px] font-bold ml-2 whitespace-nowrap ${txn.status === 'paid' ? 'text-emerald-400' : 'text-amber-400'}`}>
                              {txn.status === 'paid' ? '-' : ''}{'\u20B9'}{txn.amount.toLocaleString('en-IN')}
                            </span>
                          </div>
                          <p className="text-slate-500 text-[10px] mt-0.5 font-medium">{txn.doctorSpecialization}</p>

                          <div className="flex items-center justify-between mt-2.5">
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex items-center gap-1 px-2 py-[3px] rounded-md text-[9px] font-bold uppercase border ${statusColor(txn.status)}`}>
                                {statusIcon(txn.status)}
                                {txn.status}
                              </span>
                              <span className="text-slate-600 text-[10px] font-medium">
                                {new Date(txn.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[#1a2236]">
                            <svg className="w-3 h-3 text-slate-700" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" /></svg>
                            <span className="text-slate-600 text-[9px] font-mono tracking-wide">{txn.referenceNumber}</span>
                            {txn.timeSlot && (
                              <>
                                <span className="w-1 h-1 rounded-full bg-slate-700" />
                                <span className="text-slate-600 text-[9px] font-medium">{txn.timeSlot}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="px-5 py-3.5 flex items-center justify-between" style={{ background: '#0a0f1d', borderTop: '1px solid #1a2236' }}>
                <div className="flex items-center gap-2 text-[10px] text-slate-600">
                  <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-500/5 border border-emerald-500/10">
                    <svg className="w-3 h-3 text-emerald-500/70" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-emerald-500/70 font-medium">Secured</span>
                  </div>
                  <span className="text-slate-700">by MedCare</span>
                </div>
                <span className="text-slate-600 text-[10px] font-medium">{filtered.length} transaction{filtered.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);

  const { isAuthenticated, user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); setPaymentOpen(false); }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav
     className={`fixed top-0 left-0 right-0 z-[600] h-[72px] 
transition-all duration-500 ease-out border-b border-white/[0.12]
${
  scrolled
    ? 'bg-white/[0.07] backdrop-blur-2xl shadow-[0_4px_30px_rgba(0,0,0,0.12)]'
    : 'bg-white/[0.04] backdrop-blur-xl'
}`}
    >
      <div className="relative w-full h-full px-6 lg:px-12 xl:px-20 flex items-center">
        <Link to="/" className="relative z-20 flex-shrink-0 min-w-0">
          <MadoxLogo />
        </Link>

        <div className="absolute left-1/2 top-1/2 hidden md:flex -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-8 lg:gap-10 z-10 pointer-events-none">
          <div className="flex items-center gap-8 lg:gap-10 pointer-events-auto">
            {NAV_LINKS.map(({ to, label }) => (
              <NavLinkItem key={to} to={to} label={label} location={location} />
            ))}
          </div>
        </div>

        <div className="ml-auto relative z-20 flex items-center justify-end gap-2 sm:gap-3 flex-shrink-0">
          <Link
            to="/emergency"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-[12px] font-semibold font-sans tracking-wide text-white bg-gradient-to-r from-red-500 to-pink-600 border border-red-200 shadow-[0_4px_16px_rgba(239,68,68,0.15)] hover:shadow-[0_4px_24px_rgba(244,63,94,0.25)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 ease-out"
          >
            <span aria-hidden>🚨</span> Emergency
          </Link>

          {isAuthenticated ? (
            <>
              {/* Payment Button + Panel */}
              <div className="relative hidden sm:block">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setPaymentOpen(!paymentOpen)}
                  className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border ${
                    paymentOpen
                      ? 'bg-amber-500/15 border-amber-400/40 text-amber-300 shadow-[0_0_16px_rgba(251,191,36,0.15)]'
                      : 'bg-white/[0.04] border-white/[0.1] text-slate-400 hover:text-amber-300 hover:bg-amber-500/[0.06] hover:border-amber-400/30'
                  }`}
                  aria-label="Payments"
                >
                  <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </motion.button>
                <PaymentPanel open={paymentOpen} onClose={() => setPaymentOpen(false)} />
              </div>

              <Link to="/dashboard" className="hidden md:flex items-center gap-2.5 group relative">
                <motion.div
                  whileHover={{ scale: 1.08, rotate: [0, -3, 3, 0] }}
                  transition={{ duration: 0.4 }}
                  className="relative w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 flex items-center justify-center text-[11px] font-bold text-white overflow-hidden ring-2 ring-amber-200/40 group-hover:ring-amber-400/60 shadow-[0_4px_16px_rgba(251,191,36,0.2)] group-hover:shadow-[0_4px_24px_rgba(251,191,36,0.4)] transition-all duration-300"
                >
                  {user?.avatar ? (
                    <img src={typeof user.avatar === 'string' ? user.avatar : user.avatar.url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`
                  )}
                  <span className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.div>
                <span className="text-[12px] font-semibold bg-gradient-to-r from-amber-600 to-yellow-500 bg-clip-text text-transparent group-hover:from-yellow-400 group-hover:to-orange-500 max-w-[100px] truncate hidden lg:inline font-sans transition-all duration-300">
                  {user?.firstName}
                </span>
              </Link>
              <motion.button
                type="button"
                onClick={handleLogout}
                whileHover={{ scale: 1.04, y: -1 }}
                whileTap={{ scale: 0.96 }}
                className="px-5 py-2 rounded-full text-[12px] font-semibold font-sans bg-gradient-to-r from-rose-500 to-pink-600 text-white border border-rose-300/30 shadow-[0_4px_16px_rgba(244,63,94,0.15)] hover:shadow-[0_4px_24px_rgba(244,63,94,0.3)] transition-all duration-300 ease-out"
              >
                Logout
              </motion.button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="hidden sm:inline px-3 py-2 text-[12px] font-sans text-slate-500 hover:text-slate-800 transition-colors duration-300"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-5 py-2.5 rounded-full text-[12px] font-semibold font-sans text-white bg-gradient-to-r from-yellow-500 to-amber-600 border border-amber-300/30 shadow-[0_4px_16px_rgba(251,191,36,0.15)] hover:shadow-[0_4px_24px_rgba(251,191,36,0.25)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 ease-out"
              >
                My Portal
              </Link>
            </>
          )}

          <button
            type="button"
            className="md:hidden p-2.5 rounded-2xl text-slate-400 hover:text-white hover:bg-white/[0.08] border border-white/10 transition-all duration-300"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-label="Menu"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden overflow-hidden border-t border-white/[0.1] bg-white/[0.06] backdrop-blur-2xl"
          >
            <div className="px-6 py-4 space-y-1 w-full">
              {NAV_LINKS.map(({ to, label }) => {
                const active =
                  location.pathname === to ||
                  (to !== '/' && location.pathname.startsWith(to));
                return (
                  <Link
                    key={to}
                    to={to}
                    className={`block px-4 py-3 rounded-2xl text-[14px] font-sans transition-all duration-300 ${
                      active
                        ? 'text-amber-300 bg-amber-500/10 border border-amber-500/20'
                        : 'text-slate-400 hover:text-white hover:bg-white/[0.06] border border-transparent'
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
              <Link
                to="/emergency"
                className="flex items-center justify-center gap-2 px-4 py-3 mt-2 rounded-2xl text-white bg-gradient-to-r from-red-500 to-pink-600 font-semibold text-sm border border-red-200"
              >
                🚨 Emergency
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
