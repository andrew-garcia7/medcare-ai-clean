import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] },
});

const mouseGlow = (e) => {
  const rect = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--x', `${e.clientX - rect.left}px`);
  e.currentTarget.style.setProperty('--y', `${e.clientY - rect.top}px`);
};

const PAPERS = [
  {
    title: 'AI-Driven Appointment Optimization in Indian Healthcare',
    authors: 'Dr. Arjun Mehta, Rohan Verma, et al.',
    journal: 'Journal of Health Informatics • 2026',
    abstract: 'A study on how machine learning algorithms can reduce patient wait times by 62% while improving doctor utilization rates across multi-specialty hospitals.',
    tag: 'Machine Learning',
  },
  {
    title: 'Predicting No-Show Rates Using Behavioral Patterns',
    authors: 'Priya Sharma, Dr. Kavitha Rao',
    journal: 'Digital Health Review • 2025',
    abstract: 'Our proprietary model achieves 94% accuracy in predicting appointment no-shows, enabling proactive rescheduling and reducing revenue loss for healthcare providers.',
    tag: 'Predictive Analytics',
  },
  {
    title: 'Voice-Enabled Healthcare Booking for Rural India',
    authors: 'Rohan Verma, Sneha Patel',
    journal: 'ACM Conference on Health • 2025',
    abstract: 'Breaking language and literacy barriers through multilingual voice-assisted appointment booking, achieving 89% task completion rate among first-time users.',
    tag: 'NLP & Voice AI',
  },
  {
    title: 'Secure Patient Data Exchange Using Zero-Knowledge Proofs',
    authors: 'Vikram Singh, Priya Sharma',
    journal: 'IEEE Transactions on Privacy • 2026',
    abstract: 'A novel framework for sharing patient records between providers without exposing raw data, maintaining full HIPAA and DISHA compliance.',
    tag: 'Security',
  },
];

const FOCUS_AREAS = [
  { title: 'Symptom Analysis', desc: 'NLP-powered symptom-to-specialist matching with 96% accuracy', icon: '🧬' },
  { title: 'Drug Interactions', desc: 'Real-time prescription conflict detection across multi-provider care', icon: '💊' },
  { title: 'Wait Time Prediction', desc: 'ML models that predict OPD wait times within ±8 minutes', icon: '⏱️' },
  { title: 'Telemedicine Quality', desc: 'Adaptive video compression for low-bandwidth rural connections', icon: '📡' },
];

export default function ResearchPage() {
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
            <p className="text-amber-600 text-xs font-semibold tracking-[0.25em] uppercase mb-4">Innovation Lab</p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-800 mb-5" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              Our <span className="italic text-amber-600">Research</span>
            </h1>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">
              Pushing the boundaries of AI in healthcare — from lab to bedside.
            </p>
          </motion.div>
        </div>
      </div>

      {/* FOCUS AREAS */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <motion.div {...fadeUp()} className="text-center mb-10">
          <p className="text-amber-600 text-xs font-semibold tracking-[0.25em] uppercase mb-3">What We Study</p>
          <h2 className="text-3xl font-bold text-slate-800" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Focus Areas</h2>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FOCUS_AREAS.map((f, i) => (
            <motion.div
              key={f.title}
              {...fadeUp(i * 0.1)}
              whileHover={{ y: -8, scale: 1.03 }}
              whileTap={{ y: -8, scale: 1.03 }}
              className="relative group rounded-2xl bg-white border border-slate-200 shadow-sm transition-all duration-400 cursor-pointer hover:border-amber-400/60 hover:shadow-[0_8px_40px_rgba(245,158,11,0.18),0_0_60px_rgba(245,158,11,0.10)]"
            >
              <div className="p-6 group-hover:bg-gradient-to-br group-hover:from-[#18181b] group-hover:to-[#0f172a] group-hover:border-amber-400/60 group-hover:shadow-[0_8px_40px_rgba(245,158,11,0.18),0_0_60px_rgba(245,158,11,0.10)] transition-all duration-400 rounded-2xl border border-transparent text-center">
                <div className="h-[2px] w-full bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 opacity-60 mb-5 group-hover:opacity-90 transition-opacity duration-400" />
                <span className="text-3xl mb-3 block group-hover:text-amber-100 transition-colors">{f.icon}</span>
                <h3 className="text-slate-800 font-semibold text-sm mb-1 group-hover:text-amber-100 transition-colors">{f.title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed group-hover:text-slate-300 transition-colors">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* PUBLICATIONS */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <motion.div {...fadeUp()} className="text-center mb-10">
          <p className="text-amber-600 text-xs font-semibold tracking-[0.25em] uppercase mb-3">Publications</p>
          <h2 className="text-3xl font-bold text-slate-800" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Featured Papers</h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PAPERS.map((p, i) => (
            <motion.div
              key={p.title}
              {...fadeUp(i * 0.1)}
              whileHover={{ y: -8, scale: 1.03 }}
              whileTap={{ y: -8, scale: 1.03 }}
              className="relative group rounded-2xl bg-white border border-slate-200 shadow-sm transition-all duration-400 cursor-pointer hover:border-amber-400/60 hover:shadow-[0_8px_40px_rgba(245,158,11,0.18),0_0_60px_rgba(245,158,11,0.10)]"
            >
              <div className="p-7 group-hover:bg-gradient-to-br group-hover:from-[#18181b] group-hover:to-[#0f172a] group-hover:border-amber-400/60 group-hover:shadow-[0_8px_40px_rgba(245,158,11,0.18),0_0_60px_rgba(245,158,11,0.10)] transition-all duration-400 rounded-2xl border border-transparent">
                <div className="h-[2px] w-full bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 opacity-60 mb-6 group-hover:opacity-90 transition-opacity duration-400" />
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-600 text-[10px] font-medium border border-amber-200 mb-3 group-hover:bg-amber-400 group-hover:text-white group-hover:border-amber-400 transition-colors">
                  {p.tag}
                </span>
                <h3 className="font-semibold text-base mb-2 text-slate-800 group-hover:text-amber-100 transition-colors">{p.title}</h3>
                <p className="text-slate-400 text-xs mb-3 group-hover:text-slate-300 transition-colors">{p.authors}</p>
                <p className="text-slate-500 text-sm leading-relaxed mb-3 group-hover:text-slate-300 transition-colors">{p.abstract}</p>
                <p className="text-amber-600/60 text-xs italic group-hover:text-amber-300 transition-colors">{p.journal}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
