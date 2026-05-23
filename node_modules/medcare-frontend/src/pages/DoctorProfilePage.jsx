import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import { useDoctor } from '../hooks/useApi';
import toast from 'react-hot-toast';

const FALLBACK_IMAGES = [
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

function SectionTitle({ children }) {
  return (
    <h3 className="luxury-text font-semibold text-lg mb-4 flex items-center gap-2.5">
      <span className="w-1 h-5 rounded-full bg-gradient-to-b from-yellow-400 to-amber-500" />
      {children}
    </h3>
  );
}

function SkeletonProfile() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white animate-pulse">
      <div className="w-full px-6 lg:px-12 xl:px-20 pt-10">
        <div className="h-8 w-20 bg-slate-100 rounded-xl mb-8" />
        <div className="rounded-2xl bg-[#0f172a] border border-white/10 p-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-36 h-36 rounded-2xl bg-white/[0.06]" />
            <div className="flex-1 space-y-3">
              <div className="h-8 bg-white/[0.06] rounded-xl w-64" />
              <div className="h-4 bg-white/[0.06] rounded w-40" />
              <div className="h-4 bg-white/[0.04] rounded w-56" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-2xl bg-[#0f172a] border border-white/10" />)}
        </div>
      </div>
    </div>
  );
}

export default function DoctorProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: doctor, isLoading } = useDoctor(id);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [mapMode, setMapMode] = useState('doctor');
  const [imgError, setImgError] = useState(false);

  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [visitReason, setVisitReason] = useState('');
  const [patientNotes, setPatientNotes] = useState('');
  const [detailsSaved, setDetailsSaved] = useState(false);

  const getUserLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setUserLocation(null)
      );
    }
  }, []);

  useEffect(() => { getUserLocation(); }, [getUserLocation]);

  if (isLoading) return <SkeletonProfile />;

  if (!doctor) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-[#0f172a] border border-white/10 shadow-xl flex items-center justify-center">
          <svg className="w-7 h-7 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-slate-400 text-sm luxury-text">Doctor not found.</p>
        <button onClick={() => navigate('/doctors')} className="text-amber-400 text-xs hover:underline">Back to all doctors</button>
      </div>
    );
  }

  const name = `Dr. ${doctor?.user?.firstName} ${doctor?.user?.lastName}`;
  const fallbackImg = FALLBACK_IMAGES[((doctor?._id || '').charCodeAt(1) || 0) % FALLBACK_IMAGES.length];
  const imgSrc = imgError ? fallbackImg : (doctor?.photo?.url || fallbackImg);

  const stars = Array.from({ length: 5 }, (_, i) => {
    const rating = doctor?.averageRating || 0;
    if (i < Math.floor(rating)) return 'full';
    if (i < rating) return 'half';
    return 'empty';
  });

  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      key: d.toISOString().split('T')[0],
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNum: d.getDate(),
      month: d.toLocaleDateString('en-US', { month: 'short' }),
    };
  });

  const timeSlots = ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM'];

  const getMapSrc = () => {
    if (mapMode === 'hospitals' && userLocation) {
      return `https://www.google.com/maps?q=hospitals+near+me&ll=${userLocation.lat},${userLocation.lng}&z=14&output=embed`;
    }
    if (mapMode === 'location' && userLocation) {
      return `https://www.google.com/maps?q=${userLocation.lat},${userLocation.lng}&z=15&output=embed`;
    }
    if (doctor?.lat && doctor?.lng) {
      return `https://www.google.com/maps?q=${doctor.lat},${doctor.lng}&z=15&output=embed`;
    }
    return 'https://www.google.com/maps?q=Mumbai&output=embed';
  };

  const handleBooking = () => {
    if (!detailsSaved) return toast.error('Please save your patient details first');
    if (selectedDate && selectedTime) {
      navigate(`/payment/${id}`, {
        state: { doctor, date: selectedDate, time: selectedTime, fee: doctor?.consultationFee, patientName, patientPhone, patientEmail, visitReason, patientNotes }
      });
    }
  };

  const glassInput = "w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-amber-400/20 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-amber-400/50 focus:ring-2 focus:ring-amber-500/10 focus:shadow-[0_0_20px_rgba(251,191,36,0.1)] transition-all duration-300";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-20"
    >
      {/* Back button */}
      <div className="w-full px-6 lg:px-12 xl:px-20 pt-8">
        <motion.button
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="group flex items-center gap-2 mb-6 px-5 py-2.5 rounded-xl bg-[#0f172a]/60 backdrop-blur-sm border border-amber-400/20 text-slate-400 hover:text-amber-300 hover:border-amber-400/40 hover:bg-amber-500/[0.06] hover:shadow-[0_4px_16px_rgba(251,191,36,0.15)] transition-all duration-300"
        >
          <svg className="w-4 h-4 group-hover:-translate-x-1.5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-xs font-medium tracking-wide">Back</span>
        </motion.button>
      </div>

      {/* HERO CARD */}
      <div className="w-full px-6 lg:px-12 xl:px-20">
        <div className="premium-card" onMouseMove={mouseGlow}>
          <div className="card-inner">
            <div className="h-[2px] w-full bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500" />
            <div className="p-6 md:p-8 relative">
              <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-amber-500/[0.06] via-yellow-500/[0.03] to-transparent rounded-full blur-3xl" />

              <div className="relative flex flex-col md:flex-row gap-6 items-start">
                {/* Photo */}
                <div className="relative flex-shrink-0">
                  <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl overflow-hidden border border-amber-400/20 shadow-[0_8px_24px_rgba(0,0,0,0.3)]">
                    <img
                      src={imgSrc}
                      alt={name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                      onError={() => setImgError(true)}
                    />
                  </div>
                  {doctor?.isAvailableToday && (
                    <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 border-[3px] border-[#0f172a] shadow-[0_0_12px_rgba(52,211,153,0.6)]" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <h1 className="luxury-text text-2xl md:text-4xl font-bold tracking-wide">{name}</h1>
                  <p className="text-amber-400 font-medium text-sm mt-1.5 tracking-wider uppercase">{doctor?.specialization}</p>

                  <div className="flex items-center gap-2 mt-3">
                    <div className="flex gap-0.5">
                      {stars.map((s, i) => (
                        <motion.svg key={i} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1, type: 'spring', stiffness: 400 }} className={`w-4 h-4 ${s === 'empty' ? 'text-slate-700' : 'text-amber-400 drop-shadow-[0_0_6px_rgba(251,189,35,0.5)]'}`} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </motion.svg>
                      ))}
                    </div>
                    <span className="text-white/80 text-sm font-medium">{doctor?.averageRating?.toFixed(1)}</span>
                    <span className="text-slate-500 text-xs">({doctor?.totalReviews} reviews)</span>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    {doctor?.languages?.map((lang) => (
                      <span key={lang} className="text-[10px] px-2.5 py-1 rounded-full bg-white/[0.05] border border-amber-400/20 text-slate-400">{lang}</span>
                    ))}
                    <span className="text-[10px] px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400">{doctor?.city}</span>
                  </div>
                </div>

                {/* Fee badge */}
                <div className="flex-shrink-0 text-center px-6 py-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border border-amber-400/20">
                  <span className="text-slate-500 text-[10px] uppercase tracking-wider block">Consultation</span>
                  <span className="luxury-text text-3xl font-bold mt-1 block">{'\u20B9'}{doctor?.consultationFee}</span>
                  <span className="text-slate-500 text-[10px] block mt-0.5">per visit</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* STATS ROW */}
      <div className="w-full px-6 lg:px-12 xl:px-20 mt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Experience', value: `${doctor?.experience} Years` },
            { label: 'Patients', value: `${(doctor?.totalReviews || 0) * 8}+` },
            { label: 'Rating', value: doctor?.averageRating?.toFixed(1) },
            { label: 'Reviews', value: doctor?.totalReviews },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 + i * 0.06 }} className="premium-card" onMouseMove={mouseGlow}>
              <div className="card-inner p-4 text-center">
                <p className="luxury-text font-bold text-xl mt-1">{stat.value}</p>
                <p className="text-slate-500 text-[10px] uppercase tracking-wider">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="w-full px-6 lg:px-12 xl:px-20 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* LEFT COLUMN (3/5) */}
          <div className="lg:col-span-3 space-y-6">

            {/* About */}
            <div className="premium-card" onMouseMove={mouseGlow}>
              <div className="card-inner p-6">
                <SectionTitle>About</SectionTitle>
                <p className="text-slate-400 text-sm leading-[1.8] whitespace-pre-line font-serif">{doctor?.bio || 'No bio available.'}</p>
              </div>
            </div>

            {/* Education + Contact 2-col grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">

              {/* Education */}
              {doctor?.education?.length > 0 && (
                <div className="premium-card h-full" onMouseMove={mouseGlow}>
                  <div className="card-inner p-6 h-full">
                    <SectionTitle>Education</SectionTitle>
                    <div className="space-y-3">
                      {doctor.education.map((edu, i) => (
                        <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.1 }} className="flex items-start gap-3">
                          <div className="mt-1.5 w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)] flex-shrink-0" />
                          <p className="text-slate-400 text-sm font-serif">{edu}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Contact Card */}
              <div className="premium-card h-full" onMouseMove={mouseGlow}>
                <div className="card-inner p-6 h-full">
                  <SectionTitle>Contact Doctor</SectionTitle>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-sm">{'\u260E'}</div>
                      <div>
                        <p className="text-slate-500 text-[10px] uppercase tracking-wider">Phone</p>
                        <p className="text-white/80 text-sm font-medium">+91 98765 43210</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-sm">{'\u2709'}</div>
                      <div>
                        <p className="text-slate-500 text-[10px] uppercase tracking-wider">Email</p>
                        <p className="text-white/80 text-sm font-medium">{doctor?.user?.firstName?.toLowerCase()}.{doctor?.user?.lastName?.toLowerCase()}@medcare.in</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-sm">{'\u{1F3E5}'}</div>
                      <div>
                        <p className="text-slate-500 text-[10px] uppercase tracking-wider">Clinic</p>
                        <p className="text-white/80 text-sm font-medium">{doctor?.address || doctor?.city}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="premium-card" onMouseMove={mouseGlow}>
              <div className="card-inner">
                <div className="p-5 border-b border-white/[0.06]">
                  <SectionTitle>Location & Hospitals</SectionTitle>
                  <p className="text-slate-500 text-xs mt-1">{doctor?.address}</p>
                  <div className="flex gap-2 mt-3">
                    {[{ key: 'doctor', label: 'Doctor' }, { key: 'hospitals', label: 'Nearby Hospitals' }, { key: 'location', label: 'My Location' }].map((m) => (
                      <button key={m.key} onClick={() => setMapMode(m.key)} className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-300 ${mapMode === m.key ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-white shadow-[0_0_12px_rgba(251,191,36,0.3)]' : 'bg-white/[0.05] border border-white/10 text-slate-400 hover:text-white hover:bg-white/[0.08]'}`}>
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <iframe title="Map" src={getMapSrc()} width="100%" height="320" style={{ border: 0 }} allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="rounded-b-2xl" />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (2/5) */}
          <div className="lg:col-span-2 space-y-6">

            {/* BOOKING CARD */}
            <div className="premium-card" onMouseMove={mouseGlow}>
              <div className="card-inner p-6">
                <SectionTitle>Book Appointment</SectionTitle>

                <p className="text-slate-500 text-[10px] uppercase tracking-wider mb-3">Select Date</p>
                <div className="grid grid-cols-7 gap-1.5 mb-6">
                  {dates.map((d) => (
                    <motion.button key={d.key} whileHover={{ scale: 1.1, y: -2 }} whileTap={{ scale: 0.92 }} onClick={() => { setSelectedDate(d.key); setSelectedTime(''); }} className={`flex flex-col items-center py-2.5 rounded-xl text-center transition-all duration-300 ${selectedDate === d.key ? 'bg-gradient-to-b from-yellow-500 to-amber-600 text-white shadow-[0_4px_20px_rgba(251,191,36,0.4)]' : 'bg-white/[0.05] border border-white/10 text-slate-500 hover:text-white hover:bg-white/[0.08]'}`}>
                      <span className="text-[9px] font-medium uppercase tracking-wider">{d.dayName}</span>
                      <span className="text-sm font-bold mt-0.5">{d.dayNum}</span>
                      <span className="text-[8px] text-slate-500 mt-0.5">{d.month}</span>
                    </motion.button>
                  ))}
                </div>

                <AnimatePresence>
                  {selectedDate && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}>
                      <p className="text-slate-500 text-[10px] uppercase tracking-wider mb-3">Select Time</p>
                      <div className="grid grid-cols-3 gap-2 mb-6">
                        {timeSlots.map((t, i) => (
                          <motion.button key={t} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }} onClick={() => setSelectedTime(t)} className={`py-2.5 rounded-xl text-[11px] font-medium transition-all duration-300 ${selectedTime === t ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-white shadow-[0_4px_16px_rgba(251,191,36,0.3)]' : 'bg-white/[0.05] border border-white/10 text-slate-500 hover:text-white hover:bg-white/[0.08]'}`}>
                            {t}
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {selectedDate && selectedTime && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="rounded-xl bg-white/[0.04] border border-amber-400/20 p-4 mb-5">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Date</span>
                        <span className="text-white/80 font-medium">{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                      </div>
                      <div className="flex justify-between text-xs mt-2">
                        <span className="text-slate-500">Time</span>
                        <span className="text-white/80 font-medium">{selectedTime}</span>
                      </div>
                      <div className="h-px bg-amber-400/10 my-2.5" />
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Fee</span>
                        <span className="luxury-text font-bold">{'\u20B9'}{doctor?.consultationFee}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button whileHover={selectedDate && selectedTime ? { scale: 1.03 } : {}} whileTap={selectedDate && selectedTime ? { scale: 0.97 } : {}} onClick={handleBooking} disabled={!selectedDate || !selectedTime || !detailsSaved} className="w-full py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed bg-gradient-to-r from-yellow-500 to-amber-600 text-white shadow-[0_4px_20px_rgba(251,191,36,0.25)] hover:shadow-[0_8px_30px_rgba(251,191,36,0.4)]">
                  Proceed to Payment
                </motion.button>
                {!detailsSaved && selectedDate && selectedTime && (
                  <p className="text-[10px] text-amber-400/70 text-center mt-2">↓ Please save patient details below first</p>
                )}

                <div className="mt-4 flex items-center gap-2 text-[11px]">
                  {doctor?.isAvailableToday ? (
                    <>
                      <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }} className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                      <span className="text-emerald-400">Available today</span>
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <span className="text-amber-400">Next available: {doctor?.nextAvailable}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* PATIENT DETAILS CARD */}
            <div className="premium-card" onMouseMove={mouseGlow}>
              <div className="card-inner p-6">
                <div className="flex items-center justify-between mb-4">
                  <SectionTitle>Patient Details</SectionTitle>
                  {detailsSaved && (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1">
                      <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>✓</motion.span> Saved
                    </motion.span>
                  )}
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-slate-400 text-[11px] font-medium block mb-1.5">Full Name</label>
                    <input type="text" value={patientName} onChange={(e) => { setPatientName(e.target.value); setDetailsSaved(false); }} placeholder="Your full name" className={glassInput} disabled={detailsSaved} style={detailsSaved ? { opacity: 0.7 } : {}} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-400 text-[11px] font-medium block mb-1.5">Phone</label>
                      <input type="tel" value={patientPhone} onChange={(e) => { setPatientPhone(e.target.value); setDetailsSaved(false); }} placeholder="+91 98765 43210" className={glassInput} disabled={detailsSaved} style={detailsSaved ? { opacity: 0.7 } : {}} />
                    </div>
                    <div>
                      <label className="text-slate-400 text-[11px] font-medium block mb-1.5">Email</label>
                      <input type="email" value={patientEmail} onChange={(e) => { setPatientEmail(e.target.value); setDetailsSaved(false); }} placeholder="you@email.com" className={glassInput} disabled={detailsSaved} style={detailsSaved ? { opacity: 0.7 } : {}} />
                    </div>
                  </div>
                  <div>
                    <label className="text-slate-400 text-[11px] font-medium block mb-1.5">Reason for Visit</label>
                    <input type="text" value={visitReason} onChange={(e) => { setVisitReason(e.target.value); setDetailsSaved(false); }} placeholder="e.g. Annual checkup, chest pain..." className={glassInput} disabled={detailsSaved} style={detailsSaved ? { opacity: 0.7 } : {}} />
                  </div>
                  <div>
                    <label className="text-slate-400 text-[11px] font-medium block mb-1.5">Notes (Optional)</label>
                    <textarea value={patientNotes} onChange={(e) => { setPatientNotes(e.target.value); setDetailsSaved(false); }} placeholder="Any additional information for the doctor..." rows={3} className={`${glassInput} resize-none`} disabled={detailsSaved} style={detailsSaved ? { opacity: 0.7 } : {}} />
                  </div>

                  {/* Save / Edit Button */}
                  <AnimatePresence mode="wait">
                    {detailsSaved ? (
                      <motion.button
                        key="edit"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => setDetailsSaved(false)}
                        className="w-full mt-2 py-3 rounded-2xl text-sm font-bold tracking-wide cursor-pointer border border-amber-400/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-all duration-300"
                      >
                        ✏️ Edit Details
                      </motion.button>
                    ) : (
                      <motion.button
                        key="save"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        type="button"
                        whileHover={{ scale: 1.03, boxShadow: '0 0 30px rgba(251,191,36,0.4), 0 0 60px rgba(251,191,36,0.15)' }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => {
                          if (!patientName.trim()) return toast.error('Please enter your name');
                          if (!patientPhone.trim()) return toast.error('Please enter your phone number');
                          if (!patientEmail.trim()) return toast.error('Please enter your email');
                          if (!visitReason.trim()) return toast.error('Please enter reason for visit');
                          setDetailsSaved(true);
                          toast.success('Patient details saved! You can now proceed to payment.');
                        }}
                        className="w-full mt-2 py-3.5 rounded-2xl text-sm font-bold tracking-wide cursor-pointer border-none relative overflow-hidden bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 text-black shadow-[0_4px_20px_rgba(251,191,36,0.3)] transition-all duration-300"
                      >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          <motion.span
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                            className="text-base"
                          >💾</motion.span>
                          Save Details
                        </span>
                        <motion.span
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
                          animate={{ x: ['-100%', '200%'] }}
                          transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut', repeatDelay: 1 }}
                        />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
