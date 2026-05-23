import { useMemo, useRef, useState } from 'react';
import { motion, useScroll, } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';

import DoctorCard from '../components/DoctorCard';
import { useDoctors } from '../hooks/useApi';
import {
  GlassCard,
  SectionLabel,
  SectionSubtitle,
  Spinner,
  linkButtonClass,
} from '../components/ui/ui';

// ✅ HERO IMAGE 
const HERO_BG = "/doctor-bg.jpeg";

// ✅ DIFFERENT SECTION BACKGROUNDS
const BG = {
  departments:
    "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?q=80&w=2400&auto=format&fit=crop",

  doctors:
    "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=2400&auto=format&fit=crop",

  ai:
    "https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?q=80&w=2400&auto=format&fit=crop",

  testimonials:
    "https://images.unsplash.com/photo-1607746882042-944635dfe10e?q=80&w=2400&auto=format&fit=crop",
};

const SPECS = [
  { icon: '🫀', name: 'Cardiology', count: 48 },
  { icon: '🧠', name: 'Neurology', count: 32 },
  { icon: '🦴', name: 'Orthopedics', count: 41 },
  { icon: '🔬', name: 'Oncology', count: 36 },
  { icon: '🫁', name: 'Pulmonology', count: 24 },
  { icon: '👁️', name: 'Ophthalmology', count: 19 },
  { icon: '🧬', name: 'Genetics', count: 15 },
  { icon: '💉', name: 'Immunology', count: 22 },
];

const AI_FEATURES = [
  {
    icon: '🤖',
    title: 'AI Symptom Analyser',
    body: 'Describe symptoms in plain language. AI triages and recommends the right specialist instantly.',
  },
  {
    icon: '🧬',
    title: 'Predictive Health Insights',
    body: 'ML models analyse your data to predict risks before they become problems.',
  },
  {
    icon: '📊',
    title: 'AI Report Reader',
    body: 'Upload lab results. AI explains findings in plain language and highlights abnormalities.',
  },
  {
    icon: '🚑',
    title: 'Live Ambulance Tracking',
    body: 'Share GPS location instantly. Nearest ambulance dispatched with real-time tracking.',
  },
];

const TESTIMONIALS = [
  {
    stars: 5,
    quote:
      'The platform felt like a concierge service — I had a cardiologist booked before I finished my coffee.',
    name: 'James Martinez',
    detail: 'Cardiology • Feb 2026',
    image: "https://randomuser.me/api/portraits/men/32.jpg"
  },
  {
    stars: 5,
    quote:
      'Finally a system that respects my time. Transparent ratings and zero phone tag.',
    name: 'Priya Thompson',
    detail: 'Neurology • Jan 2026',
    image: "https://randomuser.me/api/portraits/women/44.jpg"
  },
  {
    stars: 5,
    quote:
      'Our department cut no-show rates with AI reminders. Patients love the clarity.',
    name: 'Chris Williams',
    detail: 'Admin • Mar 2026',
    image: "https://randomuser.me/api/portraits/men/85.jpg"
  },
];

function Stars({ count }) {
  return (
    <div className="flex items-center gap-0.5 text-amber-400 text-sm leading-none mb-5">
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} aria-hidden>
          ★
        </span>
      ))}
    </div>
  );
}

export default function Home() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  

  const navigate = useNavigate();
  const [doctorField, setDoctorField] = useState('');
  const [symptomField, setSymptomField] = useState('');
  const [locationField, setLocationField] = useState('');
  const [heroBgFailed, setHeroBgFailed] = useState(false);

  const { data, isLoading, isError, error } = useDoctors({
    limit: '3',
    sort: '-averageRating',
  });

  const offline =
    isError &&
    (String(error?.message || '').includes('ECONNREFUSED') ||
      String(error?.message || '').includes('Network') ||
      String(error?.code || '').includes('ERR_NETWORK'));

  const fallbackDoctors = useMemo(
    () => [
      {
        _id: 'mock-1',
        user: { firstName: 'Sarah', lastName: 'Johnson' },
        specialization: 'Cardiology',
        averageRating: 4.9,
        totalReviews: 312,
        hospitals: [{ city: 'Manhattan' }],
        experience: 11,
        isAvailableToday: true,
        photo: {
          url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=360&q=70',
        },
      },
      {
        _id: 'mock-2',
        user: { firstName: 'Marcus', lastName: 'Reid' },
        specialization: 'Neurology',
        averageRating: 4.7,
        totalReviews: 247,
        hospitals: [{ city: 'Brooklyn' }],
        experience: 9,
        isAvailableToday: false,
        photo: {
          url: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d",
        },
      },
      {
        _id: 'mock-3',
        user: { firstName: 'Aisha', lastName: 'Lim' },
        specialization: 'Oncology',
        averageRating: 4.8,
        totalReviews: 189,
        hospitals: [{ city: 'Queens' }],
        experience: 7,
        isAvailableToday: true,
        photo: {
          url: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&w=400&q=80",
        },
      },
    ],
    []
  );

  const allDoctors = data?.data?.length ? data.data : fallbackDoctors;
  const doctors = allDoctors.slice(0, 3);

  const onHeroSearch = (e) => {
    e.preventDefault();
    const parts = [doctorField, symptomField, locationField]
      .map((s) => s.trim())
      .filter(Boolean);
    const q = parts.join(' ');
    navigate(q ? `/doctors?search=${encodeURIComponent(q)}` : '/doctors');
  };

  const L = linkButtonClass;

  return (
    <div className="pb-10">
      {isError && (
        <div className="max-w-7xl mx-auto mt-6 md:mt-8 px-4" role="status">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 text-amber-700 px-5 py-4 text-sm ">
            {offline
              ? 'We can\'t reach the MedCare API (backend on port 5000). The UI still renders—doctor listings may be empty until the server is available.'
              : `Something went wrong: ${String(error?.message || 'Unknown error')}`}
          </div>
        </div>
      )}

      {/* ================= HERO ================= */}
      <section
        ref={heroRef}
        
        className="relative w-screen left-1/2 -translate-x-1/2 min-h-screen flex items-center justify-center overflow-hidden"
      >
        {!heroBgFailed && (
          <div className="absolute inset-0 z-0">
  <img
    src={HERO_BG}
    alt="Medical background"
    className="w-full h-full object-cover opacity-80 will-change-transform"
    onError={() => setHeroBgFailed(true)}
  />
</div>
        )}

        {heroBgFailed && (
          <div className="absolute inset-0 z-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900" />
        )}

        {/* ✅ LIGHT OVERLAY (FIXED) */}
<div className="absolute inset-0 z-10 bg-black/20" />

{/* 🔥 CURSOR SPOTLIGHT ADD KAR YAHI */}


        {/* ✅ GLOW (REDUCED + FIXED) */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          <div className="absolute top-[12%] left-[8%] w-[240px] h-[240px] bg-amber-400/5 rounded-full blur-[30px]" />
          <div className="absolute bottom-[10%] right-[10%] w-[200px] h-[200px] bg-blue-500/5 rounded-full blur-[30px]" />
        </div>

        {/* ✅ SOFT RADIAL LIGHT */}
        <div className="absolute inset-0 z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(0,212,180,0.06),transparent_60%)]" />

        <div className="relative z-20 w-full flex flex-col items-center justify-center text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
            className="w-full"
          >
            <div className="flex items-center justify-center mb-8">
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-600 shadow-[0_10px_30px_rgba(251,191,36,0.08)]">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-300/60 opacity-45" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.8)]" />
                </span>
                AI-Powered Global Healthcare
              </span>
            </div>

            <h1 className="font-serif font-light text-white text-4xl md:text-6xl lg:text-7xl leading-tight text-center mb-6 drop-shadow-[0_10px_40px_rgba(0,0,0,0.7)]">
  World-Class Care Powered by <br />
  <span className="bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-400 bg-clip-text text-transparent animate-pulse">
    Artificial Intelligence
  </span>
</h1>

            <p className="font-sans text-sm md:text-base text-white/80 text-center leading-relaxed max-w-2xl mx-auto mt-2 mb-10">
              Connect with verified specialists. Book instantly. Manage your complete health journey with AI.
            </p>

            <motion.form
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true, margin: '-50px' }}
              onSubmit={onHeroSearch}
              className="w-full max-w-7xl mx-auto mb-10 px-4"
            >
              <div className="flex flex-col md:flex-row items-stretch rounded-2xl md:rounded-full bg-white/80 border border-slate-200 shadow-[0_10px_30px_rgba(0,0,0,0.08)] overflow-hidden p-2 gap-2 md:gap-0 md:pr-2">
                <div className="flex-1 flex flex-col sm:flex-row min-w-0 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 rounded-xl md:rounded-full overflow-hidden">
                  <input
                    type="text"
                    value={doctorField}
                    onChange={(e) => setDoctorField(e.target.value)}
                    placeholder="Doctor / specialty"
                    className="flex-1 min-w-0 bg-transparent border-0 px-4 sm:px-5 py-3.5 text-sm text-slate-800 placeholder:text-slate-500 focus:outline-none focus:ring-0 focus:bg-amber-50/30 transition-colors"
                    aria-label="Doctor or specialty"
                  />
                  <input
                    type="text"
                    value={symptomField}
                    onChange={(e) => setSymptomField(e.target.value)}
                    placeholder="Describe symptoms"
                    className="flex-1 min-w-0 bg-transparent border-0 px-4 sm:px-5 py-3.5 text-sm text-slate-800 placeholder:text-slate-500 focus:outline-none focus:ring-0 focus:bg-amber-50/30 transition-colors"
                    aria-label="Symptoms"
                  />
                  <input
                    type="text"
                    value={locationField}
                    onChange={(e) => setLocationField(e.target.value)}
                    placeholder="City or hospital"
                    className="flex-1 min-w-0 bg-transparent border-0 px-4 sm:px-5 py-3.5 text-sm text-slate-800 placeholder:text-slate-500 focus:outline-none focus:ring-0 focus:bg-amber-50/30 transition-colors"
                    aria-label="Location"
                  />
                </div>
                <button
                  type="submit"
                  className="shrink-0 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center self-center rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 text-white shadow-[0_10px_30px_rgba(251,191,36,0.2)] hover:shadow-[0_25px_60px_rgba(251,191,36,0.35)] hover:-translate-y-1 hover:scale-[1.02] active:scale-95 transition-all duration-300 ease-out mx-auto md:mx-0"
                  aria-label="Search"
                >
                  <span className="text-lg font-light" aria-hidden>
                    →
                  </span>
                </button>
              </div>
            </motion.form>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 mb-16">
              <Link to="/doctors" className={`${L.base} ${L.lg} ${L.primary} w-full sm:w-auto justify-center`}>
                Find Doctor
              </Link>
              <Link to="/book" className={`${L.base} ${L.lg} ${L.outline} w-full sm:w-auto justify-center`}>
                Book Appointment
              </Link>
              <Link to="/emergency" className={`${L.base} ${L.lg} ${L.dangerOutline} w-full sm:w-auto justify-center gap-2`}>
                <span aria-hidden>🚨</span> Emergency
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto pt-6 border-t border-slate-200">
              {[
                { value: '400+', label: 'SPECIALISTS' },
                { value: '12', label: 'LOCATIONS' },
                { value: '98%', label: 'SATISFACTION' },
                { value: '24/7', label: 'AI SUPPORT' },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className="font-serif text-3xl md:text-4xl font-light text-slate-800 tracking-tight mb-1">
                    {s.value}
                  </div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* SPECIALTIES / DEPARTMENTS ================= */}
      <section className="relative w-screen left-1/2 -translate-x-1/2 py-24 overflow-hidden bg-gradient-to-b from-[#f8fafc] via-[#eef2ff] to-[#e0f2fe]">


        {/* BACKGROUND GLOW BLOBS */}
<div className="absolute inset-0 z-0 pointer-events-none">
  <div className="absolute top-0 left-0 w-40 h-40 bg-amber-400/20 rounded-full blur-[60px]" />
  <div className="absolute bottom-0 right-0 w-40 h-40 bg-yellow-400/20 rounded-full blur-[60px]" />
</div>

        <div className="relative z-20 w-full">
          <div className="max-w-7xl mx-auto px-4 md:px-10">
            {/* HEADING */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.55 }}
              className="text-center mb-16"
            >
              <SectionLabel>MEDICAL DEPARTMENTS</SectionLabel>

              <h2 className="font-serif text-3xl md:text-5xl font-light text-slate-800 tracking-tight leading-tight mt-4 mb-4">
                World-class care in{' '}
                <span className="italic bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-300 bg-clip-text text-transparent">
                  every specialty
                </span>
              </h2>

              <SectionSubtitle>
                Verified clinicians across all core disciplines.
              </SectionSubtitle>
            </motion.div>

            {/* CARDS GRID */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            className="rounded-2xl bg-white/80 backdrop-blur-md border border-white/40 
shadow-[0_10px_40px_rgba(0,0,0,0.08)]
hover:shadow-[0_20px_60px_rgba(251,191,36,0.2)] 
hover:-translate-y-1
transition-all duration-300 overflow-hidden"
            >
             <div className="grid grid-cols-2 md:grid-cols-4 gap-[1px] bg-slate-200/50">

  {SPECS.map((s, i) => (
    <motion.div
      key={s.name}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ delay: i * 0.03 }}
      whileHover={{ y: -2 }}
      onClick={() => navigate(`/doctors?specialty=${s.name}`)}
      className="group relative overflow-hidden bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 
      shadow-[0_10px_40px_rgba(0,0,0,0.4)]
      hover:scale-[1.02] hover:shadow-[0_20px_60px_rgba(251,191,36,0.25)]
      transition-all duration-300 cursor-pointer
      p-6 text-center flex flex-col items-center justify-center min-h-[160px]"
    >

      {/* GRADIENT BORDER */}
      <div className="absolute inset-0 rounded-2xl p-[1px] bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 opacity-0 group-hover:opacity-100 blur-sm" />

      {/* GLASS REFLECTION */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 pointer-events-none">
        <div className="w-full h-full bg-gradient-to-br from-white/10 via-transparent to-transparent" />
      </div>

      {/* CONTENT WRAPPER */}
      <div className="relative z-10">

        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-amber-400/50 to-transparent mb-4" />

        <div className="text-3xl group-hover:scale-125 group-hover:rotate-6 transition-all duration-300">
          {s.icon}
        </div>

        <div className="text-white mt-4 font-semibold group-hover:text-amber-300 transition">
          {s.name}
        </div>

        <div className="text-sm text-white/70">
          {s.count} specialists
        </div>

      </div>

    </motion.div>
  ))}

</div>
            </motion.div>

          </div>
        </div>
      </section>

      


      {/* ================= TOP DOCTORS ================= */}
      <section className="relative w-screen left-1/2 -translate-x-1/2 py-24 overflow-hidden bg-gradient-to-b from-[#f8fafc] via-[#eef2ff] to-[#e0f2fe]">



      {/* GLOW BLOBS */}
<div className="absolute inset-0 z-0 pointer-events-none">
  <div className="absolute top-0 left-0 w-40 h-40 bg-amber-400/20 rounded-full blur-[60px]" />
  <div className="absolute bottom-0 right-0 w-40 h-40 bg-yellow-400/20 rounded-full blur-[60px]" />
</div>


        {/* MAIN CONTENT WRAPPER */}
        <div className="relative z-20 w-full">
          <div className="max-w-7xl mx-auto px-4 md:px-10">

            {/* HEADER */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.55 }}
              className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14"
            >
              <div>
                <SectionLabel>FEATURED PHYSICIANS</SectionLabel>

                <h2 className="font-serif text-3xl md:text-5xl font-light text-slate-800 tracking-tight leading-tight mt-3 mb-3">
                  Our top{' '}
                  <span className="italic bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">
                    specialists
                  </span>
                </h2>

                <SectionSubtitle>
                  Highly rated clinicians available to book today.
                </SectionSubtitle>
              </div>

              <Link
                to="/doctors"
                className={`${L.base} ${L.md} ${L.outline} rounded-2xl`}
              >
                View all 400+ <span aria-hidden>→</span>
              </Link>
            </motion.div>

            {/* DOCTORS GRID */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4 rounded-2xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
                <Spinner size="lg" />
                <p className="text-sm text-slate-500">Loading specialists…</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                {doctors.map((doc, i) => (
                  <DoctorCard key={doc._id} doctor={doc} index={i} layout="grid" />
                ))}
              </div>
            )}

          </div>

        </div>

      </section>

      

      {/* ================= AI FEATURES ================= */}
     <section className="relative w-screen left-1/2 -translate-x-1/2 py-24 overflow-hidden bg-gradient-to-b from-[#f8fafc] via-[#eef2ff] to-[#e0f2fe]">

  <div className="absolute inset-0 z-0 pointer-events-none">
  <div className="absolute top-0 left-0 w-40 h-40 bg-amber-400/20 rounded-full blur-[60px]" />
  <div className="absolute bottom-0 right-0 w-40 h-40 bg-yellow-400/20 rounded-full blur-[60px]" />
</div>

        {/* CONTENT WRAPPER */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 md:px-10">

          {/* HEADING */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.55 }}
            className="text-left mb-16 max-w-3xl"
          >
            <SectionLabel className="mb-3">HEALTHCARE INNOVATION</SectionLabel>

            <h2 className="font-serif text-3xl md:text-5xl font-light text-slate-800 tracking-tight leading-tight">
              AI that works for{' '}
              <span className="block sm:inline mt-2 italic bg-gradient-to-r from-yellow-400 to-amber-600 bg-clip-text text-transparent">
                your health
              </span>
            </h2>

            <SectionSubtitle className="mt-4">
              Assistive tools that make complex care simple — without replacing your clinician.
            </SectionSubtitle>
          </motion.div>

          {/* GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-fr">
            {AI_FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 18 }}
               whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: i * 0.05, duration: 0.45 }}
                className="h-full"
              >
                <div className="group relative overflow-hidden p-8 h-full flex flex-col 
bg-[#0f172a]/70 backdrop-blur-sm border border-white/10
shadow-[0_10px_40px_rgba(0,0,0,0.4)]
hover:shadow-[0_10px_40px_rgba(251,191,36,0.4)]
hover:-translate-y-1 hover:scale-[1.02]
transition-all duration-300">

  {/* GRADIENT */}
<div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 
bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-500" />


<div className="relative z-10"> 

                  <div className="h-[3px] w-full bg-gradient-to-r from-transparent via-amber-400/40 to-transparent mb-6" />

                  <div className="flex items-start gap-5">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 border border-white/20 text-2xl">
                      {f.icon}
                    </div>

                    <div>
                      <h3 className="text-lg md:text-xl font-semibold text-white group-hover:text-amber-300 mb-2 transition">
                        {f.title}
                      </h3>

                      <p className="text-sm md:text-base text-white/70 group-hover:text-white transition">
                        {f.body}
                      </p>
                    </div>
                  </div>

                </div>

                </div>

              </motion.div>
            ))}
          </div>

        </div>

      </section>


      

      <section className="relative w-screen left-1/2 -translate-x-1/2 py-24 overflow-hidden bg-gradient-to-b from-[#f8fafc] via-[#eef2ff] to-[#e0f2fe]">



      {/* GLOW BLOBS */}
<div className="absolute inset-0 z-0 pointer-events-none">
  <div className="absolute top-0 left-0 w-40 h-40 bg-amber-400/20 rounded-full blur-[60px]" />
  <div className="absolute bottom-0 right-0 w-40 h-40 bg-yellow-400/20 rounded-full blur-[60px]" />
</div>

        

        {/* CONTENT WRAPPER */}
        <div className="relative z-20 w-full">
          <div className="max-w-7xl mx-auto px-4 md:px-10">

            {/* HEADING */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.55 }}
              className="text-center mb-16"
            >
              <SectionLabel>PATIENT STORIES</SectionLabel>

              <h2 className="font-serif text-3xl md:text-5xl font-light text-slate-800 tracking-tight leading-tight mt-4 mb-4">
                Trusted by{' '}
                <span className="italic bg-gradient-to-r from-yellow-400 to-amber-600 bg-clip-text text-transparent">
                  thousands
                </span>
              </h2>

              <SectionSubtitle className="mx-auto">
                Real stories from patients and care teams using MedCare.
              </SectionSubtitle>

              <div className="flex justify-center mt-4">
<Link
  to="/testimonials"
  className="px-6 py-2 rounded-full text-sm font-medium 
  bg-gradient-to-r from-yellow-400 to-amber-500 text-white
  shadow-lg hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(251,191,36,0.6)]
  transition-all duration-300 inline-block"
>
  40,000+ more →
</Link>
</div>
            </motion.div>

            {/* TESTIMONIAL GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
              {TESTIMONIALS.map((t, i) => (
                <motion.div
                  key={t.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  className="h-full"
                >
                 
<div className="group relative overflow-hidden p-8 h-full flex flex-col 
bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 
shadow-[0_10px_40px_rgba(0,0,0,0.4)]
hover:shadow-[0_10px_40px_rgba(251,191,36,0.35)]
hover:-translate-y-1 hover:scale-[1.02]
transition-all duration-300 rounded-2xl">



  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 
bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-500" />


<div className="relative z-10">

                    <Stars count={t.stars} />

                    <p className="text-sm text-white group-hover:text-white italic mb-6 flex-1 transition">
                      "{t.quote}"
                    </p>

                    <div className="flex items-center gap-3 pt-3 border-t border-white/10">
                     <img
  src={t.image}
  alt={t.name}
  className="h-11 w-11 rounded-full object-cover border border-white/20"
/>

                      <div>
                        <p className="text-white group-hover:text-white font-semibold text-sm transition">{t.name}</p>
                        <p className="text-white/70 group-hover:text-white/70 text-xs transition">{t.detail}</p>
                      </div>
                    </div>

                  </div>

                  </div>
                </motion.div>
              ))}
            </div>

          </div>

        </div>

      </section>
      {/* ================= CTA BANNER ================= */}
      <section className="relative w-screen left-1/2 -translate-x-1/2 py-24 overflow-hidden bg-gradient-to-b from-[#020617] via-[#020617] to-[#020617]">

      {/* 🌌 FULL BACKGROUND IMAGE */}
<div className="absolute inset-0 z-0 overflow-hidden">
  <img
    src="https://images.unsplash.com/photo-1506744038136-46273834b3fb"
    alt=""
    className="w-full h-full object-cover opacity-30"
  />

  {/* DARK OVERLAY */}
  <div className="absolute inset-0 bg-[#020617]/80" />
</div>


{/* ✨ BALANCED PARTICLES */}
<div className="absolute inset-0 z-10 pointer-events-none">
  {[...Array(25)].map((_, i) => {

    const isLeft = i % 2 === 0;

    // ✅ YAHAN ADD KAR
    const size = Math.random() > 0.7 ? 4 : 2;

    return (
      <span
        key={i}

        // ✅ NEW:
        className="absolute rounded-full bg-amber-300 opacity-70 animate-particle"

        style={{
          // ✅ SIZE APPLY
          width: `${size}px`,
          height: `${size}px`,

          top: `${Math.random() * 100}%`,

          left: isLeft
            ? `${Math.random() * 40}%`
            : `${60 + Math.random() * 40}%`,

          animationDuration: `${4 + Math.random() * 6}s`,
          animationDelay: `${Math.random() * 5}s`
        }}
      />
    );
  })}
</div>


      

        <div className="relative z-20 max-w-5xl mx-auto text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <SectionLabel className="mb-3 text-center">GET STARTED</SectionLabel>
            <h2 className="font-serif text-3xl md:text-6xl font-light text-white text-center leading-tight mb-6">
              Your health.{' '}
              <span className="italic bg-gradient-to-r from-yellow-400 to-amber-600 bg-clip-text text-transparent">
                Reimagined.
              </span>
            </h2>
            <p className="font-sans text-sm md:text-base text-slate-300 text-center mb-12">
              Join 50,000+ patients experiencing the future of healthcare.
            </p>

{/* 🔥 ROTATING AVATARS */}
<div className="relative w-[220px] h-[220px] mx-auto mb-6">

  <div className="absolute inset-0 rounded-full bg-amber-400/10 blur-[60px]" />

  <div className="absolute inset-0 animate-spin">
    {[
      "https://randomuser.me/api/portraits/men/32.jpg",
      "https://randomuser.me/api/portraits/women/44.jpg",
      "https://randomuser.me/api/portraits/men/76.jpg",
      "https://randomuser.me/api/portraits/women/68.jpg",
      "https://randomuser.me/api/portraits/men/11.jpg",
      "https://randomuser.me/api/portraits/women/12.jpg",
      "https://randomuser.me/api/portraits/men/85.jpg",
      "https://randomuser.me/api/portraits/women/90.jpg"
    ].map((img, i) => (
      <img
        key={i}
        src={img}
        alt=""
        className="absolute w-12 h-12 rounded-full border-2 border-white shadow-lg hover:scale-110 transition"
        style={{
          top: `${50 + 40 * Math.sin((i / 8) * 2 * Math.PI)}%`,
          left: `${50 + 40 * Math.cos((i / 8) * 2 * Math.PI)}%`,
          transform: "translate(-50%, -50%)"
        }}
      />
    ))}
  </div>
</div>

{/* 🔥 COUNTER */}
<p className="text-amber-400 text-sm mb-6 font-medium text-center">
  <span className="text-white font-semibold text-lg">50,000+</span> patients joined
</p>

{/* BUTTONS */}
<div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4 mt-4">
              <Link to="/doctors" className={`${L.base} ${L.lg} ${L.primary} rounded-2xl`}>
                Find Your Doctor
              </Link>
              <Link to="/register" className={`${L.base} ${L.lg} ${L.outline} rounded-2xl`}>
                Patient Portal
              </Link>
              <Link to="/emergency" className={`${L.base} ${L.lg} ${L.dangerOutline} rounded-2xl gap-2`}>
                <span aria-hidden>🚨</span> Emergency Tracker
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

