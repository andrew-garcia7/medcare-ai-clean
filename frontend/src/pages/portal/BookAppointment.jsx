import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  FaCalendarAlt, FaClock, FaUserMd, FaVideo, FaHospital,
  FaCheckCircle, FaChevronLeft, FaChevronRight, FaSearch,
  FaStethoscope, FaArrowLeft, FaStar,
} from 'react-icons/fa';
import api from '../../services/api';
import { useNotificationStore } from '../../store/notificationStore';

const SPECS = [
  'All', 'Cardiology', 'Orthopedics', 'Dermatology', 'Neurology',
  'Pediatrics', 'General', 'Gynecology', 'Oncology', 'Surgery',
  'Psychiatry', 'ENT', 'Ophthalmology',
];

const FALLBACK_IMGS = [
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1594824476967-48c8b964ac31?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&h=400&fit=crop&crop=face',
];

const mouseGlow = (e) => {
  const rect = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--x', `${e.clientX - rect.left}px`);
  e.currentTarget.style.setProperty('--y', `${e.clientY - rect.top}px`);
};

export default function BookAppointment() {
  const navigate = useNavigate();
  const { addNotification } = useNotificationStore();
  const [step, setStep] = useState(1);
  const [doctors, setDoctors] = useState([]);
  const [filteredDocs, setFilteredDocs] = useState([]);
  const [search, setSearch] = useState('');
  const [specFilter, setSpecFilter] = useState('All');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [mode, setMode] = useState('in-person');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [bookedApt, setBookedApt] = useState(null);
  const [docError, setDocError] = useState(false);

  const fetchDoctors = useCallback(() => {
    setDocError(false);
    api.get('/doctors').then(r => {
      const d = r.data?.data || r.data || [];
      setDoctors(d); setFilteredDocs(d);
    }).catch(() => setDocError(true));
  }, []);

  useEffect(() => { fetchDoctors(); }, [fetchDoctors]);

  useEffect(() => {
    let f = doctors;
    if (specFilter !== 'All') f = f.filter(d => d.specialization === specFilter);
    if (search) { const q = search.toLowerCase(); f = f.filter(d => `${d.user?.firstName} ${d.user?.lastName}`.toLowerCase().includes(q) || d.specialization?.toLowerCase().includes(q)); }
    setFilteredDocs(f);
  }, [search, specFilter, doctors]);

  useEffect(() => {
    if (!selectedDoctor || !selectedDate) return;
    setSlotsLoading(true);
    api.get(`/appointments/slots?doctorId=${selectedDoctor._id}&date=${selectedDate}`)
      .then(r => { setSlots(r.data?.data?.slots || []); setSlotsLoading(false); })
      .catch(() => {
        const fb = [];
        for (let h = 9; h < 17; h++) { fb.push(`${h > 12 ? h - 12 : h}:00 ${h >= 12 ? 'PM' : 'AM'}`); fb.push(`${h > 12 ? h - 12 : h}:30 ${h >= 12 ? 'PM' : 'AM'}`); }
        setSlots(fb); setSlotsLoading(false);
      });
  }, [selectedDoctor, selectedDate]);

  const dates = [];
  const today = new Date();
  for (let i = 1; i <= 14; i++) { const d = new Date(today); d.setDate(d.getDate() + i); dates.push(d); }

  const handleBook = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/appointments', { doctorId: selectedDoctor._id, date: selectedDate, timeSlot: selectedSlot, mode, reason });
      setBookedApt(data.data); setStep(4);
      toast.success('Appointment booked successfully!');
      addNotification({ type: 'appointment', title: 'Appointment Booked', message: `Your ${mode} appointment with Dr. ${selectedDoctor.user?.firstName || ''} ${selectedDoctor.user?.lastName || ''} on ${selectedDate} at ${selectedSlot} has been confirmed.` });
    } catch (err) {
      toast.error(err.message || 'Failed to book appointment');
      addNotification({ type: 'error', title: 'Booking Failed', message: 'We couldn\'t book your appointment. Please try again or contact support.' });
    }
    setLoading(false);
  };

  const getFallback = useCallback((doc, idx) => FALLBACK_IMGS[((doc?._id || '').charCodeAt(1) || idx) % FALLBACK_IMGS.length], []);

  const dayN = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const monN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  return (
    <div className="w-full px-4 sm:px-6 lg:px-10 py-8 space-y-7">
      {/* ── Back + GOLDEN Header ── */}
      <div className="flex items-center gap-4">
        <motion.button whileHover={{ scale: 1.05, x: -2 }} whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0f172a] border border-yellow-400/20 backdrop-blur text-yellow-400/70 hover:text-yellow-300 hover:border-yellow-400/40 transition-all text-sm cursor-pointer shadow-[0_0_15px_rgba(251,191,36,0.08)]">
          <FaArrowLeft size={12} /> Back
        </motion.button>
        <div>
          <h1 className="text-4xl md:text-5xl tracking-wide luxury-text" style={{ fontFamily: "'Playfair Display', 'Cormorant Garamond', serif" }}>
            Book Appointment
          </h1>
          <p className="text-sm text-gray-400 mt-1 italic">Find a specialist and schedule your premium consultation</p>
        </div>
      </div>

      {/* ── GOLDEN Steps Indicator ── */}
      <div className="flex items-center gap-2">
        {['Select Doctor', 'Date & Time', 'Review', 'Confirmed'].map((label, i) => (
          <div key={i} className="flex items-center gap-2 flex-1">
            <motion.div animate={{ scale: step === i + 1 ? 1.15 : 1 }}
              className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all duration-300 ${
                step > i + 1
                  ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-black shadow-[0_0_15px_rgba(251,191,36,0.4)]'
                  : step === i + 1
                    ? 'bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 text-black shadow-[0_0_20px_rgba(251,191,36,0.5)]'
                    : 'bg-white/5 text-slate-600 border border-white/10'
              }`}>{step > i + 1 ? <FaCheckCircle size={14} /> : i + 1}</motion.div>
            <span className={`text-xs whitespace-nowrap transition-all ${step === i + 1 ? 'font-bold text-yellow-400' : step > i + 1 ? 'text-yellow-400/60' : 'text-slate-600'}`}>{label}</span>
            {i < 3 && <div className={`flex-1 h-0.5 rounded-full transition-all ${step > i + 1 ? 'bg-gradient-to-r from-yellow-400 to-amber-500' : 'bg-white/10'}`} />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ══════ STEP 1: SELECT DOCTOR ══════ */}
        {step === 1 && (
          <motion.div key="s1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>

            {/* Dark Glass Search + Filter */}
            <div className="flex gap-3 mb-6 flex-wrap">
              <div className="flex-1 min-w-[200px] relative group">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-400/40 text-sm group-focus-within:text-yellow-400 transition" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search doctors by name or specialty..."
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#0f172a] border border-yellow-400/20 text-white text-sm placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-yellow-400/40 focus:border-yellow-400/40 transition shadow-[0_0_20px_rgba(251,191,36,0.05)]" />
              </div>
              <select value={specFilter} onChange={e => setSpecFilter(e.target.value)}
                className="px-4 py-3 rounded-xl bg-[#0f172a] border border-yellow-400/20 text-sm text-white cursor-pointer outline-none focus:ring-2 focus:ring-yellow-400/40">
                {SPECS.map(s => <option key={s} value={s} className="bg-[#0f172a]">{s}</option>)}
              </select>
            </div>

            {/* Doctor Cards — Premium Card Style */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredDocs.map((doc, idx) => (
                <motion.div
                  key={doc._id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06, duration: 0.5 }}
                  className="premium-card cursor-pointer"
                  onMouseMove={mouseGlow}
                  onClick={() => { setSelectedDoctor(doc); setStep(2); }}
                >
                  <div className="card-inner">
                    {/* Gold accent bar */}
                    <div className="h-[2px] w-full bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 opacity-60" />

                    <div className="relative z-10 p-5">
                      <div className="flex items-start gap-3.5">
                        {/* Avatar */}
                        <div className="relative shrink-0">
                          <div className="w-14 h-14 rounded-xl overflow-hidden border border-amber-400/20 shadow-[0_4px_16px_rgba(0,0,0,0.3),0_0_20px_rgba(251,191,36,0.1)]">
                            <img
                              src={doc.photo?.url || getFallback(doc, idx)}
                              alt={`Dr. ${doc.user?.firstName}`}
                              className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                              loading="lazy"
                              onError={(e) => { e.target.src = getFallback(doc, idx); }}
                            />
                          </div>
                          {doc.isAvailableToday && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-[#0f172a] shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white truncate">Dr. {doc.user?.firstName} {doc.user?.lastName}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{doc.specialization}</p>

                          {/* Star Rating */}
                          <div className="flex items-center gap-1 mt-2">
                            {Array.from({ length: 5 }, (_, i) => (
                              <FaStar key={i} size={10} className={i < Math.floor(doc.averageRating || 0) ? 'text-yellow-400' : 'text-gray-700'} />
                            ))}
                            <span className="text-[10px] text-yellow-400/70 ml-1 font-semibold">{doc.averageRating}</span>
                          </div>
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="h-px w-full bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent my-3.5" />

                      {/* Bottom row */}
                      <div className="flex justify-between items-center">
                        <span className="text-yellow-400 text-lg font-extrabold" style={{ fontFamily: "'Syne',sans-serif" }}>
                          ₹{doc.consultationFee || doc.fee}
                        </span>
                        {doc.isAvailableToday && (
                          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 font-semibold">Available Today</span>
                        )}
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-yellow-400/10 text-yellow-400/80 border border-yellow-400/20 font-semibold">Book →</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {filteredDocs.length === 0 && (
              <div className="text-center py-16 text-slate-500">
                <FaStethoscope size={40} className="mx-auto mb-3 opacity-30" />
                <p>{docError ? 'Could not load doctors. Backend may be offline.' : 'No doctors found'}</p>
                {docError && (
                  <motion.button whileHover={{ scale: 1.05 }} onClick={fetchDoctors}
                    className="mt-3 px-5 py-2 rounded-xl bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-xs font-semibold cursor-pointer hover:bg-yellow-400/20 transition">
                    Retry
                  </motion.button>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* ══════ STEP 2: DATE & TIME ══════ */}
        {step === 2 && selectedDoctor && (
          <motion.div key="s2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>

            {/* Selected Doctor Card */}
            <div className="premium-card mb-6" onMouseMove={mouseGlow}>
              <div className="card-inner">
                <div className="h-[2px] w-full bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 opacity-60" />
                <div className="p-5 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl overflow-hidden border border-amber-400/20 shadow-[0_4px_16px_rgba(0,0,0,0.3),0_0_20px_rgba(251,191,36,0.1)]">
                    <img src={selectedDoctor.photo?.url || getFallback(selectedDoctor, 0)} alt=""
                      className="w-full h-full object-cover" onError={(e) => { e.target.src = getFallback(selectedDoctor, 0); }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[15px] font-bold text-white">Dr. {selectedDoctor.user?.firstName} {selectedDoctor.user?.lastName}</p>
                    <p className="text-sm text-gray-400">{selectedDoctor.specialization} · <span className="text-yellow-400 font-bold">₹{selectedDoctor.consultationFee || selectedDoctor.fee}</span></p>
                  </div>
                  <motion.button whileHover={{ scale: 1.05 }} onClick={() => { setStep(1); setSelectedDoctor(null); setSelectedDate(''); setSelectedSlot(''); }}
                    className="px-3.5 py-1.5 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-xs cursor-pointer text-yellow-400 hover:bg-yellow-400/20 transition font-semibold">Change</motion.button>
                </div>
              </div>
            </div>

            {/* Date Selector */}
            <h4 className="text-sm font-bold text-yellow-400 mb-3 flex items-center gap-2"><FaCalendarAlt /> Select Date</h4>
            <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-thin">
              {dates.map(d => {
                const ds = d.toISOString().split('T')[0];
                const act = selectedDate === ds;
                return (
                  <motion.div key={ds} whileHover={{ y: -3 }} whileTap={{ scale: 0.95 }}
                    onClick={() => { setSelectedDate(ds); setSelectedSlot(''); }}
                    className={`min-w-[68px] p-3 rounded-xl cursor-pointer text-center transition-all duration-300 border ${
                      act
                        ? 'bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 text-black border-yellow-400/50 shadow-[0_0_20px_rgba(251,191,36,0.35)]'
                        : 'bg-[#0f172a] text-slate-300 border-yellow-400/10 hover:border-yellow-400/30'
                    }`}>
                    <div className={`text-[10px] font-semibold ${act ? 'opacity-80' : 'opacity-50'}`}>{dayN[d.getDay()]}</div>
                    <div className="text-xl font-extrabold" style={{ fontFamily: "'Syne',sans-serif" }}>{d.getDate()}</div>
                    <div className={`text-[10px] font-medium ${act ? 'opacity-80' : 'opacity-50'}`}>{monN[d.getMonth()]}</div>
                  </motion.div>
                );
              })}
            </div>

            {/* Time Slots */}
            {selectedDate && (
              <>
                <h4 className="text-sm font-bold text-yellow-400 mb-3 flex items-center gap-2"><FaClock /> Select Time</h4>
                {slotsLoading ? (
                  <div className="text-center py-5 text-slate-500">Loading slots...</div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 mb-6">
                    {slots.map(slot => {
                      const act = selectedSlot === slot;
                      return (
                        <motion.div key={slot} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedSlot(slot)}
                          className={`py-2.5 px-2 rounded-xl cursor-pointer text-center text-sm font-medium transition-all duration-300 border ${
                            act
                              ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-black border-yellow-400/50 font-bold shadow-[0_0_15px_rgba(251,191,36,0.3)]'
                              : 'bg-[#0f172a] text-slate-300 border-yellow-400/10 hover:border-yellow-400/30'
                          }`}>{slot}</motion.div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {/* Mode */}
            <h4 className="text-sm font-bold text-yellow-400 mb-3">Consultation Mode</h4>
            <div className="flex gap-3 mb-6">
              {[{ value: 'in-person', label: 'In-Person', icon: <FaHospital /> }, { value: 'video', label: 'Video Call', icon: <FaVideo /> }].map(m => (
                <motion.div key={m.value} whileHover={{ y: -2 }} onClick={() => setMode(m.value)}
                  className={`flex-1 p-4 rounded-xl cursor-pointer text-center border flex items-center justify-center gap-2 text-sm font-semibold transition-all duration-300 ${
                    mode === m.value
                      ? 'bg-yellow-400/10 border-yellow-400/30 text-yellow-400 shadow-[0_0_15px_rgba(251,191,36,0.15)]'
                      : 'bg-[#0f172a] border-yellow-400/10 text-slate-400 hover:border-yellow-400/20'
                  }`}>{m.icon} {m.label}</motion.div>
              ))}
            </div>

            {/* Reason */}
            <h4 className="text-sm font-bold text-yellow-400 mb-2">Reason for Visit</h4>
            <textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Describe your symptoms or reason..." rows={3}
              className="w-full px-4 py-3 rounded-xl bg-[#0f172a] border border-yellow-400/20 text-sm text-white placeholder-gray-500 resize-y outline-none focus:ring-2 focus:ring-yellow-400/40 focus:border-yellow-400/40 transition" />

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <motion.button whileHover={{ scale: 1.02 }} onClick={() => setStep(1)}
                className="px-6 py-3 rounded-xl bg-[#0f172a] border border-yellow-400/20 text-sm font-semibold cursor-pointer text-yellow-400/70 hover:text-yellow-400 hover:border-yellow-400/40 transition">
                <FaChevronLeft className="inline mr-1 text-[10px]" /> Back
              </motion.button>
              <motion.button
                whileHover={selectedDate && selectedSlot ? { scale: 1.02, boxShadow: '0 0 30px rgba(251,191,36,0.4)' } : {}}
                whileTap={selectedDate && selectedSlot ? { scale: 0.97 } : {}}
                onClick={() => setStep(3)} disabled={!selectedDate || !selectedSlot}
                className={`flex-1 py-3 rounded-xl text-sm font-bold border-none transition-all ${
                  selectedDate && selectedSlot
                    ? 'bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 text-black cursor-pointer shadow-[0_4px_20px_rgba(251,191,36,0.3)]'
                    : 'bg-white/5 text-slate-600 cursor-not-allowed'
                }`}>
                Review Appointment <FaChevronRight className="inline ml-1 text-[10px]" />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ══════ STEP 3: REVIEW ══════ */}
        {step === 3 && selectedDoctor && (
          <motion.div key="s3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>
            <div className="premium-card" onMouseMove={mouseGlow}>
              <div className="card-inner">
                <div className="h-[2px] w-full bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 opacity-60" />
                <div className="p-7">
                  <h3 className="text-xl luxury-text mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>Review Your Appointment</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { label: 'Doctor', value: `Dr. ${selectedDoctor.user?.firstName} ${selectedDoctor.user?.lastName}`, icon: <FaUserMd />, accent: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' },
                      { label: 'Specialization', value: selectedDoctor.specialization, icon: <FaStethoscope />, accent: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
                      { label: 'Date', value: new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }), icon: <FaCalendarAlt />, accent: 'text-orange-400 bg-orange-400/10 border-orange-400/20' },
                      { label: 'Time', value: selectedSlot, icon: <FaClock />, accent: 'text-yellow-300 bg-yellow-300/10 border-yellow-300/20' },
                      { label: 'Mode', value: mode === 'in-person' ? 'In-Person Visit' : 'Video Consultation', icon: mode === 'in-person' ? <FaHospital /> : <FaVideo />, accent: 'text-amber-300 bg-amber-300/10 border-amber-300/20' },
                      { label: 'Fee', value: `₹${selectedDoctor.consultationFee || selectedDoctor.fee || 500}`, icon: <span className="text-sm">💰</span>, accent: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' },
                    ].map((item, i) => (
                      <div key={i} className="flex gap-3 items-center p-4 rounded-xl bg-[#0a0f1a] border border-yellow-400/10">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm border ${item.accent}`}>{item.icon}</div>
                        <div>
                          <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider">{item.label}</p>
                          <p className="text-sm font-semibold text-white">{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {reason && (
                    <div className="mt-4 p-3.5 rounded-xl bg-yellow-400/5 border border-yellow-400/15">
                      <p className="text-[11px] font-semibold text-yellow-500 uppercase tracking-wider mb-1">Reason for Visit</p>
                      <p className="text-sm text-yellow-200/80">{reason}</p>
                    </div>
                  )}

                  <div className="flex gap-3 mt-6">
                    <motion.button whileHover={{ scale: 1.02 }} onClick={() => setStep(2)}
                      className="px-6 py-3 rounded-xl bg-[#0a0f1a] border border-yellow-400/20 text-sm font-semibold cursor-pointer text-yellow-400/70 hover:text-yellow-400 transition">
                      <FaChevronLeft className="inline mr-1 text-[10px]" /> Back
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02, boxShadow: '0 0 35px rgba(251,191,36,0.45)' }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleBook} disabled={loading}
                      className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 text-black text-[15px] font-extrabold cursor-pointer border-none shadow-[0_4px_25px_rgba(251,191,36,0.35)] disabled:opacity-70">
                      {loading ? 'Booking...' : 'Confirm & Book Appointment'}
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ══════ STEP 4: SUCCESS ══════ */}
        {step === 4 && (
          <motion.div key="s4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', duration: 0.5 }}>
            <div className="premium-card" onMouseMove={mouseGlow}>
              <div className="card-inner">
                <div className="h-[2px] w-full bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 opacity-60" />
                <div className="text-center p-10">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}>
                    <div className="w-20 h-20 rounded-full mx-auto mb-5 bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-[0_0_40px_rgba(251,191,36,0.4)]">
                      <FaCheckCircle size={36} className="text-black" />
                    </div>
                  </motion.div>
                  <h2 className="text-2xl luxury-text mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Appointment Booked!</h2>
                  <p className="text-sm text-gray-400 mb-6">Your appointment has been confirmed successfully.</p>

                  {bookedApt && (
                    <div className="bg-[#0a0f1a] border border-yellow-400/15 rounded-2xl p-5 mb-6 text-left max-w-[380px] mx-auto">
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Reference</p>
                      <p className="text-base font-bold text-yellow-400 mb-3" style={{ fontFamily: "'Syne',sans-serif" }}>{bookedApt.referenceNumber}</p>
                      <div className="h-px w-full bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent my-3" />
                      <p className="text-sm text-white font-semibold mb-1">{bookedApt.doctorName}</p>
                      <p className="text-xs text-gray-400 mb-1">{bookedApt.date} · {bookedApt.timeSlot}</p>
                      <p className="text-xs text-gray-400">{bookedApt.mode === 'video' ? '📹 Video Call' : '🏥 In-Person'}</p>
                    </div>
                  )}

                  <div className="flex gap-3 justify-center">
                    <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={() => navigate('/dashboard')}
                      className="px-6 py-3 rounded-xl bg-[#0a0f1a] border border-yellow-400/20 text-sm font-semibold cursor-pointer text-yellow-400/70 hover:text-yellow-400 transition">Go to Dashboard</motion.button>
                    <motion.button whileHover={{ scale: 1.04, boxShadow: '0 0 25px rgba(251,191,36,0.4)' }} whileTap={{ scale: 0.97 }}
                      onClick={() => { setStep(1); setSelectedDoctor(null); setSelectedDate(''); setSelectedSlot(''); setBookedApt(null); }}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 text-black text-sm font-extrabold cursor-pointer border-none shadow-[0_4px_20px_rgba(251,191,36,0.3)]">Book Another</motion.button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
