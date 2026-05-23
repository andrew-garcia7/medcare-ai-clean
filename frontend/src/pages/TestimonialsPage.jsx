import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const mouseGlow = (e) => {
  const rect = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--x', `${e.clientX - rect.left}px`);
  e.currentTarget.style.setProperty('--y', `${e.clientY - rect.top}px`);
};

const ALL_TESTIMONIALS = [
  {
    stars: 5,
    quote: 'The platform felt like a concierge service — I had a cardiologist booked before I finished my coffee.',
    name: 'James Martinez',
    detail: 'Cardiology • Feb 2026',
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
    category: 'patient',
  },
  {
    stars: 5,
    quote: 'Finally a system that respects my time. Transparent ratings and zero phone tag.',
    name: 'Priya Thompson',
    detail: 'Neurology • Jan 2026',
    image: 'https://randomuser.me/api/portraits/women/44.jpg',
    category: 'patient',
  },
  {
    stars: 5,
    quote: 'Our department cut no-show rates with AI reminders. Patients love the clarity.',
    name: 'Chris Williams',
    detail: 'Admin • Mar 2026',
    image: 'https://randomuser.me/api/portraits/men/85.jpg',
    category: 'doctor',
  },
  {
    stars: 5,
    quote: 'Booking a dermatologist at 11 PM on a Sunday? Done in under 2 minutes. This is the future.',
    name: 'Ananya Sharma',
    detail: 'Dermatology • Mar 2026',
    image: 'https://randomuser.me/api/portraits/women/68.jpg',
    category: 'patient',
  },
  {
    stars: 5,
    quote: 'The AI symptom checker pointed me to the right specialist immediately — saved me weeks of guessing.',
    name: 'Robert Chen',
    detail: 'Orthopedics • Jan 2026',
    image: 'https://randomuser.me/api/portraits/men/45.jpg',
    category: 'patient',
  },
  {
    stars: 4,
    quote: 'As a GP, I get referrals with full context now. The patient handoff is seamless.',
    name: 'Dr. Sarah Mitchell',
    detail: 'General Medicine • Feb 2026',
    image: 'https://randomuser.me/api/portraits/women/21.jpg',
    category: 'doctor',
  },
  {
    stars: 5,
    quote: 'My elderly mother booked her own appointment — the interface is that intuitive. Incredible.',
    name: 'Vikram Patel',
    detail: 'Geriatrics • Dec 2025',
    image: 'https://randomuser.me/api/portraits/men/76.jpg',
    category: 'patient',
  },
  {
    stars: 5,
    quote: 'We integrated MedCare into our hospital workflow — appointment load balanced perfectly across 12 doctors.',
    name: 'Dr. Emily Foster',
    detail: 'Hospital Admin • Mar 2026',
    image: 'https://randomuser.me/api/portraits/women/55.jpg',
    category: 'doctor',
  },
  {
    stars: 5,
    quote: 'Paid for my consultation via UPI in seconds. Got a receipt instantly. No paperwork chaos.',
    name: 'Arjun Reddy',
    detail: 'ENT • Feb 2026',
    image: 'https://randomuser.me/api/portraits/men/22.jpg',
    category: 'patient',
  },
  {
    stars: 4,
    quote: 'The video consultation was crystal clear. Felt like an in-person visit without the waiting room.',
    name: 'Meera Joshi',
    detail: 'Psychiatry • Jan 2026',
    image: 'https://randomuser.me/api/portraits/women/33.jpg',
    category: 'patient',
  },
  {
    stars: 5,
    quote: 'I can finally see real ratings from verified patients. No more guessing which doctor to trust.',
    name: 'David Kim',
    detail: 'Cardiology • Mar 2026',
    image: 'https://randomuser.me/api/portraits/men/55.jpg',
    category: 'patient',
  },
  {
    stars: 5,
    quote: 'The prescription management is a game-changer. All my medications tracked in one place.',
    name: 'Fatima Al-Hassan',
    detail: 'Internal Medicine • Feb 2026',
    image: 'https://randomuser.me/api/portraits/women/90.jpg',
    category: 'patient',
  },
  {
    stars: 5,
    quote: 'My schedule fills up organically now. The platform handles all the booking logistics.',
    name: 'Dr. Rajesh Kumar',
    detail: 'Pediatrics • Jan 2026',
    image: 'https://randomuser.me/api/portraits/men/67.jpg',
    category: 'doctor',
  },
  {
    stars: 4,
    quote: 'Emergency ambulance tracking gave me peace of mind when my father had chest pain at 3 AM.',
    name: 'Sneha Gupta',
    detail: 'Emergency • Mar 2026',
    image: 'https://randomuser.me/api/portraits/women/12.jpg',
    category: 'patient',
  },
  {
    stars: 5,
    quote: 'From symptom input to sitting in a specialist\'s office — 48 hours. That\'s unheard of in India.',
    name: 'Karthik Nair',
    detail: 'Gastroenterology • Feb 2026',
    image: 'https://randomuser.me/api/portraits/men/91.jpg',
    category: 'patient',
  },
];

const FILTERS = [
  { key: 'all', label: 'All Stories' },
  { key: 'patient', label: 'Patients' },
  { key: 'doctor', label: 'Doctors & Staff' },
];

function Stars({ count, delay = 0 }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.svg
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: delay + i * 0.08, type: 'spring', stiffness: 400 }}
          className={`w-3.5 h-3.5 ${i < count ? 'text-amber-400 drop-shadow-[0_0_4px_rgba(251,189,35,0.4)]' : 'text-slate-700'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </motion.svg>
      ))}
    </div>
  );
}

export default function TestimonialsPage() {
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all'
    ? ALL_TESTIMONIALS
    : ALL_TESTIMONIALS.filter(t => t.category === filter);

  const avgRating = (ALL_TESTIMONIALS.reduce((s, t) => s + t.stars, 0) / ALL_TESTIMONIALS.length).toFixed(1);

  return (
    <div className="min-h-screen bg-[#0a0e1a]">

      {/* ═══ HERO HEADER ═══ */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-amber-500/[0.04] blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-cyan-500/[0.03] blur-[100px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-amber-400 text-sm mb-8 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
              Back to Home
            </Link>

            <p className="text-amber-400 text-xs font-semibold tracking-[0.25em] uppercase mb-4">Patient Stories</p>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              Trusted by <span className="italic text-amber-400/90">thousands</span>
            </h1>

            <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-10">
              Real stories from patients, doctors, and care teams using MedCare every day.
            </p>

            {/* Stats row */}
            <div className="flex items-center justify-center gap-8 sm:gap-12 flex-wrap">
              <div className="text-center">
                <p className="text-3xl font-bold text-white">40,000<span className="text-amber-400">+</span></p>
                <p className="text-slate-500 text-xs mt-1">Happy Patients</p>
              </div>
              <div className="w-px h-10 bg-white/[0.06] hidden sm:block" />
              <div className="text-center">
                <p className="text-3xl font-bold text-white">{avgRating}<span className="text-amber-400">★</span></p>
                <p className="text-slate-500 text-xs mt-1">Average Rating</p>
              </div>
              <div className="w-px h-10 bg-white/[0.06] hidden sm:block" />
              <div className="text-center">
                <p className="text-3xl font-bold text-white">500<span className="text-amber-400">+</span></p>
                <p className="text-slate-500 text-xs mt-1">Verified Doctors</p>
              </div>
              <div className="w-px h-10 bg-white/[0.06] hidden sm:block" />
              <div className="text-center">
                <p className="text-3xl font-bold text-white">35<span className="text-amber-400">+</span></p>
                <p className="text-slate-500 text-xs mt-1">Specialities</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ═══ FILTER TABS ═══ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <div className="flex items-center justify-center gap-2">
          {FILTERS.map((f) => (
            <motion.button
              key={f.key}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(f.key)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                filter === f.key
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-[0_4px_20px_rgba(251,191,36,0.3)]'
                  : 'bg-white/[0.04] text-slate-400 border border-white/[0.06] hover:bg-white/[0.08] hover:text-white'
              }`}
            >
              {f.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* ═══ TESTIMONIALS GRID ═══ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filtered.map((t, i) => (
              <motion.div
                key={t.name}
                layout
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.06, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="premium-card"
                onMouseMove={mouseGlow}
              >
                <div className="card-inner">
                  {/* Gold accent bar */}
                  <div className="h-[2px] w-full bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 opacity-60" />

                  <div className="relative z-10 p-7">
                    {/* Quote icon */}
                    <svg className="w-8 h-8 text-amber-400/20 mb-4 flex-shrink-0 group-hover:text-amber-400/40 transition-colors duration-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11H10v10H0z"/>
                    </svg>

                    {/* Stars */}
                    <Stars count={t.stars} delay={i * 0.06} />

                    {/* Quote */}
                    <p className="text-slate-300/90 text-sm leading-relaxed mt-3 mb-6 flex-1 italic">
                      "{t.quote}"
                    </p>

                    {/* Divider */}
                    <div className="h-px bg-gradient-to-r from-transparent via-amber-400/20 to-transparent mb-4" />

                    {/* Author */}
                    <div className="flex items-center gap-3">
                      <div className="relative flex-shrink-0">
                        <div className="w-11 h-11 rounded-full overflow-hidden border border-amber-400/20 shadow-[0_4px_16px_rgba(0,0,0,0.3),0_0_12px_rgba(251,191,36,0.08)]">
                          <img
                            src={t.image}
                            alt={t.name}
                            className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                            loading="lazy"
                          />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="luxury-text font-semibold text-sm leading-tight truncate">{t.name}</p>
                        <p className="text-slate-500 text-xs mt-0.5">{t.detail}</p>
                      </div>
                      {t.category === 'doctor' && (
                        <span className="flex-shrink-0 px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-[9px] font-medium border border-cyan-500/20 shadow-[0_0_8px_rgba(6,182,212,0.1)]">
                          Verified Doctor
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center mt-16"
        >
          <div className="inline-flex flex-col items-center gap-4 p-8 rounded-2xl bg-gradient-to-br from-amber-500/[0.06] to-transparent border border-amber-400/10">
            <p className="text-white text-lg font-semibold">Join 40,000+ patients who trust MedCare</p>
            <p className="text-slate-400 text-sm max-w-md">
              Book your first appointment today and experience healthcare that puts you first.
            </p>
            <Link
              to="/doctors"
              className="px-8 py-3 rounded-full text-sm font-semibold bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 text-white shadow-[0_4px_24px_rgba(251,191,36,0.3)] hover:shadow-[0_8px_40px_rgba(251,191,36,0.45)] hover:scale-[1.03] transition-all duration-300"
            >
              Find a Doctor →
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
