import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] },
});

const STATS = [
  { value: '40,000+', label: 'Patients Served' },
  { value: '500+', label: 'Verified Doctors' },
  { value: '35+', label: 'Specialties' },
  { value: '99.9%', label: 'Uptime' },
];

const VALUES = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    ),
    title: 'Patient-First',
    desc: 'Every feature we build starts with one question — does this make healthcare easier for the patient?',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
      </svg>
    ),
    title: 'AI-Powered',
    desc: 'Our intelligent algorithms match patients with the right specialists, predict wait times, and streamline care.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    title: 'Secure & Private',
    desc: 'Bank-grade encryption, HIPAA-compliant infrastructure, and zero data selling — your health data stays yours.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5a17.92 17.92 0 01-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    ),
    title: 'Accessible',
    desc: 'Available 24/7 across web and mobile. Multi-language support with voice-enabled booking for all ages.',
  },
];

const TEAM = [
  { name: 'Dr. Arjun Mehta', role: 'Founder & CEO', image: 'https://randomuser.me/api/portraits/men/52.jpg' },
  { name: 'Priya Sharma', role: 'CTO', image: 'https://randomuser.me/api/portraits/women/37.jpg' },
  { name: 'Dr. Kavitha Rao', role: 'Chief Medical Officer', image: 'https://randomuser.me/api/portraits/women/63.jpg' },
  { name: 'Rohan Verma', role: 'Head of AI', image: 'https://randomuser.me/api/portraits/men/28.jpg' },
];

const mouseGlow = (e) => {
  const rect = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--x', `${e.clientX - rect.left}px`);
  e.currentTarget.style.setProperty('--y', `${e.clientY - rect.top}px`);
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">

      {/* HERO */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/3 w-96 h-96 rounded-full bg-amber-500/[0.07] blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-cyan-500/[0.05] blur-[100px]" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 text-center">
          <motion.div {...fadeUp()}>
            <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-amber-600 text-sm mb-8 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
              Back to Home
            </Link>
            <p className="text-amber-600 text-xs font-semibold tracking-[0.25em] uppercase mb-4">Our Story</p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-800 mb-5" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              Redefining <span className="italic text-amber-600">Healthcare</span>
            </h1>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">
              MedCare was born from a simple belief — quality healthcare should be accessible, intelligent, and human.
            </p>
          </motion.div>
        </div>
      </div>

      {/* STATS */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              {...fadeUp(i * 0.1)}
              whileHover={{ y: -8, scale: 1.03 }}
              className="rounded-2xl bg-white border border-slate-200 shadow-sm transition-all duration-400 group cursor-pointer"
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
            >
              <div className="p-6 text-center group-hover:bg-gradient-to-br group-hover:from-[#18181b] group-hover:to-[#0f172a] group-hover:border-amber-400/60 group-hover:shadow-[0_8px_40px_rgba(245,158,11,0.18),0_0_60px_rgba(245,158,11,0.10)] transition-all duration-400 rounded-2xl border border-transparent">
                <p className="text-3xl font-bold text-amber-600 group-hover:text-amber-100 transition-colors">{s.value}</p>
                <p className="text-slate-500 text-xs mt-1 group-hover:text-slate-300 transition-colors">{s.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* MISSION */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <motion.div {...fadeUp()} className="rounded-2xl bg-white border border-slate-200 shadow-sm">
          <motion.div
            whileHover={{ y: -8, scale: 1.03 }}
            className="group cursor-pointer rounded-2xl"
          >
            <div className="p-10 md:p-14 group-hover:bg-gradient-to-br group-hover:from-[#18181b] group-hover:to-[#0f172a] group-hover:border-amber-400/60 group-hover:shadow-[0_8px_40px_rgba(245,158,11,0.18),0_0_60px_rgba(245,158,11,0.10)] transition-all duration-400 rounded-2xl border border-transparent">
              <div className="h-[2px] w-full bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 opacity-60 mb-10 group-hover:opacity-90 transition-opacity duration-400" />
              <p className="text-amber-600 text-xs font-semibold tracking-[0.25em] uppercase mb-3 group-hover:text-amber-100 transition-colors">Our Mission</p>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-4 group-hover:text-amber-100 transition-colors" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                Bridge the gap between patients and <span className="italic text-amber-600 group-hover:text-amber-200 transition-colors">world-class care</span>
              </h2>
              <p className="text-slate-500 leading-relaxed max-w-3xl group-hover:text-slate-300 transition-colors">
                We're building India's most intelligent healthcare platform — one that uses AI to cut through bureaucracy, 
                respect patients' time, and empower doctors to focus on what they do best: healing. From a rural clinic in 
                Rajasthan to a specialty hospital in Mumbai, MedCare connects everyone to the care they deserve.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* VALUES */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <motion.div {...fadeUp()} className="text-center mb-10">
          <p className="text-amber-600 text-xs font-semibold tracking-[0.25em] uppercase mb-3">What Drives Us</p>
          <h2 className="text-3xl font-bold text-slate-800" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Our Core Values
          </h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {VALUES.map((v, i) => (
            <motion.div
              key={v.title}
              {...fadeUp(i * 0.1)}
              whileHover={{ y: -8, scale: 1.03 }}
              className="rounded-2xl bg-white border border-slate-200 shadow-sm transition-all duration-400 group cursor-pointer"
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
            >
              <div className="p-7 group-hover:bg-gradient-to-br group-hover:from-[#18181b] group-hover:to-[#0f172a] group-hover:border-amber-400/60 group-hover:shadow-[0_8px_40px_rgba(245,158,11,0.18),0_0_60px_rgba(245,158,11,0.10)] transition-all duration-400 rounded-2xl border border-transparent">
                <div className="h-[2px] w-full bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 opacity-60 mb-6 group-hover:opacity-90 transition-opacity duration-400" />
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 flex-shrink-0 group-hover:bg-amber-400 group-hover:text-white group-hover:border-amber-400 transition-colors">
                    {v.icon}
                  </div>
                  <div>
                    <h3 className="text-slate-800 font-semibold text-base mb-1 group-hover:text-amber-100 transition-colors">{v.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed group-hover:text-slate-300 transition-colors">{v.desc}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* TEAM */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <motion.div {...fadeUp()} className="text-center mb-10">
          <p className="text-amber-600 text-xs font-semibold tracking-[0.25em] uppercase mb-3">Leadership</p>
          <h2 className="text-3xl font-bold text-slate-800" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            The Team Behind MedCare
          </h2>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {TEAM.map((t, i) => (
            <motion.div
              key={t.name}
              {...fadeUp(i * 0.1)}
              whileHover={{ y: -8, scale: 1.03 }}
              className="rounded-2xl bg-white border border-slate-200 shadow-sm transition-all duration-400 group cursor-pointer"
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
            >
              <div className="p-6 text-center group-hover:bg-gradient-to-br group-hover:from-[#18181b] group-hover:to-[#0f172a] group-hover:border-amber-400/60 group-hover:shadow-[0_8px_40px_rgba(245,158,11,0.18),0_0_60px_rgba(245,158,11,0.10)] transition-all duration-400 rounded-2xl border border-transparent">
                <div className="h-[2px] w-full bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 opacity-60 mb-5 group-hover:opacity-90 transition-opacity duration-400" />
                <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-amber-200 shadow-[0_4px_16px_rgba(0,0,0,0.08)] mb-4 group-hover:border-amber-400/80 transition-all duration-400">
                  <img src={t.image} alt={t.name} className="w-full h-full object-cover" loading="lazy" />
                </div>
                <p className="font-semibold text-sm text-slate-800 group-hover:text-amber-100 transition-colors">{t.name}</p>
                <p className="text-slate-500 text-xs mt-1 group-hover:text-slate-300 transition-colors">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
