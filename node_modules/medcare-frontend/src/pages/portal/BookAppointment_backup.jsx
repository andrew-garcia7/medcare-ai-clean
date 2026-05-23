import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  FaCalendarAlt, FaClock, FaUserMd, FaVideo, FaHospital,
  FaCheckCircle, FaChevronLeft, FaChevronRight, FaSearch,
  FaStethoscope, FaTimes, FaArrowLeft,
} from 'react-icons/fa';
import api from '../../services/api';

const SPECS = [
  'All', 'Cardiology', 'Orthopedics', 'Dermatology', 'Neurology',
  'Pediatrics', 'General', 'Gynecology', 'Oncology', 'Surgery',
  'Psychiatry', 'ENT', 'Ophthalmology',
];

export default function BookAppointment() {
  const navigate = useNavigate();
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

  useEffect(() => {
    api.get('/doctors').then(r => {
      const d = r.data?.data || r.data || [];
      setDoctors(d); setFilteredDocs(d);
    }).catch(() => {});
  }, []);

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
    } catch (err) { toast.error(err.message || 'Failed to book appointment'); }
    setLoading(false);
  };

  const dayN = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const monN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  return (
    <div className="w-full px-4 sm:px-6 lg:px-10 py-8 space-y-6">
      {/* Back + Header */}
      <div className="flex items-center gap-4">
        <motion.button whileHover={{ scale: 1.05, x: -2 }} whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur text-slate-400 hover:text-white hover:border-cyan-400/30 transition-all text-sm cursor-pointer">
          <FaArrowLeft size={12} /> Back
        </motion.button>
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Syne',sans-serif" }}>Book Appointment</h1>
          <p className="text-sm text-slate-400 mt-0.5">Find a doctor and schedule your visit</p>
        </div>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-2">
        {['Select Doctor', 'Date & Time', 'Review', 'Confirmed'].map((label, i) => (
          <div key={i} className="flex items-center gap-2 flex-1">
            <motion.div animate={{ scale: step === i + 1 ? 1.1 : 1 }}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                step > i + 1 ? 'bg-emerald-500 text-white' : step === i + 1 ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white' : 'bg-white/10 text-slate-500'
              }`}>{step > i + 1 ? <FaCheckCircle size={14} /> : i + 1}</motion.div>
            <span className={`text-xs whitespace-nowrap ${step === i + 1 ? 'font-bold text-white' : 'text-slate-500'}`}>{label}</span>
            {i < 3 && <div className={`flex-1 h-0.5 rounded-full ${step > i + 1 ? 'bg-emerald-500' : 'bg-white/10'}`} />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* STEP 1 */}
        {step === 1 && (
          <motion.div key="s1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>
            <div className="flex gap-3 mb-5 flex-wrap">
              <div className="flex-1 min-w-[200px] flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl">
                <FaSearch className="text-slate-500 text-sm" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search doctors..."
                  className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder-slate-500" />
              </div>
              <select value={specFilter} onChange={e => setSpecFilter(e.target.value)}
                className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white cursor-pointer outline-none">
                {SPECS.map(s => <option key={s} value={s} className="bg-slate-800">{s}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredDocs.map(doc => (
                <motion.div key={doc._id} whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(6,182,212,0.1)' }} whileTap={{ scale: 0.98 }}
                  onClick={() => { setSelectedDoctor(doc); setStep(2); }}
                  className="p-4 rounded-2xl bg-gradient-to-br from-[#0f172a] to-[#1e293b] border border-white/10 cursor-pointer transition-all hover:border-cyan-400/30">
                  <div className="flex gap-3 items-center">
                    <img src={doc.photo?.url || `https://ui-avatars.com/api/?name=${doc.user?.firstName}&background=0f172a&color=06b6d4`}
                      alt="" className="w-12 h-12 rounded-full object-cover border-2 border-cyan-400/20" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">Dr. {doc.user?.firstName} {doc.user?.lastName}</p>
                      <p className="text-xs text-slate-400">{doc.specialization}</p>
                    </div>
                  </div>
                  <div className="flex justify-between mt-3 text-xs">
                    <span className="text-amber-400 font-semibold">⭐ {doc.averageRating}</span>
                    <span className="text-white font-bold">₹{doc.consultationFee || doc.fee}</span>
                  </div>
                  {doc.isAvailableToday && (
                    <span className="inline-block mt-2 text-[11px] px-3 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">Available Today</span>
                  )}
                </motion.div>
              ))}
            </div>
            {filteredDocs.length === 0 && (
              <div className="text-center py-16 text-slate-500">
                <FaStethoscope size={40} className="mx-auto mb-3 opacity-30" /><p>No doctors found</p>
              </div>
            )}
          </motion.div>
        )}

        {/* STEP 2 */}
        {step === 2 && selectedDoctor && (
          <motion.div key="s2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-br from-[#0f172a] to-[#1e293b] border border-white/10 mb-5">
              <img src={selectedDoctor.photo?.url || ''} alt="" className="w-13 h-13 rounded-full object-cover border-2 border-cyan-400/20" />
              <div className="flex-1">
                <p className="text-[15px] font-bold text-white">Dr. {selectedDoctor.user?.firstName} {selectedDoctor.user?.lastName}</p>
                <p className="text-sm text-slate-400">{selectedDoctor.specialization} · ₹{selectedDoctor.consultationFee || selectedDoctor.fee}</p>
              </div>
              <motion.button whileHover={{ scale: 1.05 }} onClick={() => { setStep(1); setSelectedDoctor(null); setSelectedDate(''); setSelectedSlot(''); }}
                className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs cursor-pointer text-slate-400 hover:text-white transition">Change</motion.button>
            </div>

            <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2"><FaCalendarAlt className="text-cyan-400" /> Select Date</h4>
            <div className="flex gap-2 overflow-x-auto pb-2 mb-5">
              {dates.map(d => {
                const ds = d.toISOString().split('T')[0];
                const act = selectedDate === ds;
                return (
                  <motion.div key={ds} whileHover={{ y: -3 }} whileTap={{ scale: 0.95 }}
                    onClick={() => { setSelectedDate(ds); setSelectedSlot(''); }}
                    className={`min-w-[64px] p-3 rounded-xl cursor-pointer text-center transition-all border ${
                      act ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white border-cyan-500/50' : 'bg-white/5 text-slate-300 border-white/10 hover:border-white/20'
                    }`}>
                    <div className="text-[10px] font-semibold opacity-70">{dayN[d.getDay()]}</div>
                    <div className="text-xl font-extrabold" style={{ fontFamily: "'Syne',sans-serif" }}>{d.getDate()}</div>
                    <div className="text-[10px] font-medium opacity-70">{monN[d.getMonth()]}</div>
                  </motion.div>
                );
              })}
            </div>

            {selectedDate && (
              <>
                <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2"><FaClock className="text-purple-400" /> Select Time</h4>
                {slotsLoading ? (
                  <div className="text-center py-5 text-slate-500">Loading slots...</div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 mb-5">
                    {slots.map(slot => {
                      const act = selectedSlot === slot;
                      return (
                        <motion.div key={slot} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedSlot(slot)}
                          className={`py-2.5 px-2 rounded-xl cursor-pointer text-center text-sm font-medium transition-all border ${
                            act ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white border-cyan-500/50 font-bold' : 'bg-white/5 text-slate-300 border-white/10 hover:border-white/20'
                          }`}>{slot}</motion.div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            <h4 className="text-sm font-bold text-white mb-3">Consultation Mode</h4>
            <div className="flex gap-3 mb-5">
              {[{ value: 'in-person', label: 'In-Person', icon: <FaHospital /> }, { value: 'video', label: 'Video Call', icon: <FaVideo /> }].map(m => (
                <motion.div key={m.value} whileHover={{ y: -2 }} onClick={() => setMode(m.value)}
                  className={`flex-1 p-4 rounded-xl cursor-pointer text-center border flex items-center justify-center gap-2 text-sm font-semibold transition-all ${
                    mode === m.value ? 'bg-cyan-500/10 border-cyan-400/30 text-cyan-400' : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
                  }`}>{m.icon} {m.label}</motion.div>
              ))}
            </div>

            <h4 className="text-sm font-bold text-white mb-2">Reason for Visit</h4>
            <textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Describe your symptoms or reason..." rows={3}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-slate-500 resize-y outline-none focus:border-cyan-400/30" />

            <div className="flex gap-3 mt-5">
              <motion.button whileHover={{ scale: 1.02 }} onClick={() => setStep(1)}
                className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-semibold cursor-pointer text-slate-400 hover:text-white transition">
                <FaChevronLeft className="inline mr-1 text-[10px]" /> Back
              </motion.button>
              <motion.button whileHover={{ scale: 1.02, boxShadow: '0 0 25px rgba(6,182,212,0.35)' }} whileTap={{ scale: 0.97 }}
                onClick={() => setStep(3)} disabled={!selectedDate || !selectedSlot}
                className={`flex-1 py-3 rounded-xl text-sm font-bold border-none ${
                  selectedDate && selectedSlot ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white cursor-pointer' : 'bg-white/10 text-slate-500 cursor-not-allowed'
                }`}>
                Review Appointment <FaChevronRight className="inline ml-1 text-[10px]" />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* STEP 3 */}
        {step === 3 && selectedDoctor && (
          <motion.div key="s3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f172a] to-[#1e293b] border border-cyan-400/20 p-7">
              <div className="h-[3px] bg-gradient-to-r from-cyan-500 to-purple-500 absolute top-0 left-0 right-0" />
              <h3 className="text-lg font-extrabold text-white mb-5" style={{ fontFamily: "'Syne',sans-serif" }}>Review Your Appointment</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Doctor', value: `Dr. ${selectedDoctor.user?.firstName} ${selectedDoctor.user?.lastName}`, icon: <FaUserMd />, color: 'text-cyan-400 bg-cyan-500/10' },
                  { label: 'Specialization', value: selectedDoctor.specialization, icon: <FaStethoscope />, color: 'text-purple-400 bg-purple-500/10' },
                  { label: 'Date', value: new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }), icon: <FaCalendarAlt />, color: 'text-blue-400 bg-blue-500/10' },
                  { label: 'Time', value: selectedSlot, icon: <FaClock />, color: 'text-amber-400 bg-amber-500/10' },
                  { label: 'Mode', value: mode === 'in-person' ? 'In-Person Visit' : 'Video Consultation', icon: mode === 'in-person' ? <FaHospital /> : <FaVideo />, color: 'text-rose-400 bg-rose-500/10' },
                  { label: 'Fee', value: `₹${selectedDoctor.consultationFee || selectedDoctor.fee || 500}`, icon: <span>💰</span>, color: 'text-emerald-400 bg-emerald-500/10' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-3 items-center p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm ${item.color}`}>{item.icon}</div>
                    <div>
                      <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">{item.label}</p>
                      <p className="text-sm font-semibold text-white">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {reason && (
                <div className="mt-4 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <p className="text-[11px] font-semibold text-amber-500 uppercase tracking-wider mb-1">Reason for Visit</p>
                  <p className="text-sm text-amber-200">{reason}</p>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <motion.button whileHover={{ scale: 1.02 }} onClick={() => setStep(2)}
                  className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-semibold cursor-pointer text-slate-400 hover:text-white transition">
                  <FaChevronLeft className="inline mr-1 text-[10px]" /> Back
                </motion.button>
                <motion.button whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(6,182,212,0.4)' }} whileTap={{ scale: 0.97 }}
                  onClick={handleBook} disabled={loading}
                  className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-[15px] font-bold cursor-pointer border-none shadow-lg shadow-cyan-500/20 disabled:opacity-70">
                  {loading ? 'Booking...' : 'Confirm & Book Appointment'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <motion.div key="s4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', duration: 0.5 }}>
            <div className="text-center p-10 rounded-2xl bg-gradient-to-br from-[#0f172a] to-[#1e293b] border border-cyan-400/20">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}>
                <div className="w-20 h-20 rounded-full mx-auto mb-5 bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <FaCheckCircle size={36} className="text-white" />
                </div>
              </motion.div>
              <h2 className="text-2xl font-extrabold text-white mb-2" style={{ fontFamily: "'Syne',sans-serif" }}>Appointment Booked!</h2>
              <p className="text-sm text-slate-400 mb-5">Your appointment has been confirmed successfully.</p>

              {bookedApt && (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6 text-left max-w-[360px] mx-auto">
                  <p className="text-xs text-slate-500 mb-1">Reference</p>
                  <p className="text-base font-bold text-cyan-400 mb-3" style={{ fontFamily: "'Syne',sans-serif" }}>{bookedApt.referenceNumber}</p>
                  <p className="text-sm text-white font-semibold mb-1">{bookedApt.doctorName}</p>
                  <p className="text-xs text-slate-400 mb-1">{bookedApt.date} · {bookedApt.timeSlot}</p>
                  <p className="text-xs text-slate-400">{bookedApt.mode === 'video' ? '📹 Video Call' : '🏥 In-Person'}</p>
                </div>
              )}

              <div className="flex gap-3 justify-center">
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={() => navigate('/dashboard')}
                  className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-semibold cursor-pointer text-slate-400 hover:text-white transition">Go to Dashboard</motion.button>
                <motion.button whileHover={{ scale: 1.04, boxShadow: '0 0 20px rgba(6,182,212,0.3)' }} whileTap={{ scale: 0.97 }}
                  onClick={() => { setStep(1); setSelectedDoctor(null); setSelectedDate(''); setSelectedSlot(''); setBookedApt(null); }}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-bold cursor-pointer border-none">Book Another</motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
