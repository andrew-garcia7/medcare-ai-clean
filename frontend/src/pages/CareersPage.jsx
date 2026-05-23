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

const OPENINGS = [
  {
    title: 'Senior ML Engineer — Healthcare AI',
    team: 'AI & Data',
    location: 'Bangalore • Hybrid',
    type: 'Full-Time',
    desc: 'Build and deploy production ML models for symptom analysis, doctor matching, and predictive scheduling.',
  },
  {
    title: 'Full-Stack Engineer — React & Node.js',
    team: 'Product Engineering',
    location: 'Bangalore • Remote',
    type: 'Full-Time',
    desc: 'Build beautiful, performant interfaces that doctors and patients love. You\'ll own features end-to-end.',
  },
  {
    title: 'Product Designer — Health UX',
    team: 'Design',
    location: 'Mumbai • Hybrid',
    type: 'Full-Time',
    desc: 'Design intuitive healthcare experiences across web and mobile. Accessibility and empathy are non-negotiable.',
  },
  {
    title: 'DevOps Engineer — Cloud Infrastructure',
    team: 'Platform',
    location: 'Bangalore • On-site',
    type: 'Full-Time',
    desc: 'Scale our infrastructure to serve millions of patients while maintaining 99.99% uptime and HIPAA compliance.',
  },
  {
    title: 'Data Analyst — Healthcare Insights',
    team: 'AI & Data',
    location: 'Remote • India',
    type: 'Full-Time',
    desc: 'Turn healthcare data into actionable insights. Build dashboards, run experiments, and shape product strategy.',
  },
  {
    title: 'Mobile Engineer — React Native',
    team: 'Product Engineering',
    location: 'Bangalore • Remote',
    type: 'Full-Time',
    desc: 'Build our next-gen mobile app that brings MedCare to 500M+ smartphone users across India.',
  },
];

const PERKS = [
  { icon: '🏥', title: 'Health Coverage', desc: 'Premium health insurance for you and your family' },
  { icon: '🏠', title: 'Flexible Work', desc: 'Hybrid & remote options — work from wherever you thrive' },
  { icon: '📚', title: 'Learning Budget', desc: '₹2L annual budget for courses, conferences, and books' },
  { icon: '🚀', title: 'Stock Options', desc: 'Real ownership with meaningful equity grants' },
  { icon: '🌴', title: 'Unlimited PTO', desc: 'We trust you to manage your time responsibly' },
  { icon: '🍕', title: 'Team Events', desc: 'Monthly team dinners, offsites, and hackathons' },
];

export default function CareersPage() {
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
            <p className="text-amber-600 text-xs font-semibold tracking-[0.25em] uppercase mb-4">Join Us</p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-800 mb-5" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              Build the Future of <span className="italic text-amber-600">Healthcare</span>
            </h1>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">
              We're a team of engineers, designers, and doctors obsessed with making healthcare work for everyone.
            </p>
          </motion.div>
        </div>
      </div>

      {/* PERKS */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <motion.div {...fadeUp()} className="text-center mb-10">
          <p className="text-amber-600 text-xs font-semibold tracking-[0.25em] uppercase mb-3">Why MedCare</p>
          <h2 className="text-3xl font-bold text-slate-800" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Perks & Benefits</h2>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {PERKS.map((p, i) => (
            <motion.div
              key={p.title}
              {...fadeUp(i * 0.08)}
              whileHover={{ y: -8, scale: 1.03 }}
              whileTap={{ y: -8, scale: 1.03 }}
              className="rounded-2xl bg-white border border-slate-200 shadow-sm transition-all duration-400 group cursor-pointer hover:border-amber-400/60 hover:shadow-[0_8px_40px_rgba(245,158,11,0.18),0_0_60px_rgba(245,158,11,0.10)]"
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
            >
              <div className="p-6 group-hover:bg-gradient-to-br group-hover:from-[#18181b] group-hover:to-[#0f172a] group-hover:border-amber-400/60 group-hover:shadow-[0_8px_40px_rgba(245,158,11,0.18),0_0_60px_rgba(245,158,11,0.10)] transition-all duration-400 rounded-2xl border border-transparent">
                <div className="h-[2px] w-full bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 opacity-60 mb-5 group-hover:opacity-90 transition-opacity duration-400" />
                <span className="text-2xl mb-2 block group-hover:text-amber-100 transition-colors">{p.icon}</span>
                <h3 className="text-slate-800 font-semibold text-sm mb-1 group-hover:text-amber-100 transition-colors">{p.title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed group-hover:text-slate-300 transition-colors">{p.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* OPENINGS */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <motion.div {...fadeUp()} className="text-center mb-10">
          <p className="text-amber-600 text-xs font-semibold tracking-[0.25em] uppercase mb-3">Open Roles</p>
          <h2 className="text-3xl font-bold text-slate-800" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Current Openings</h2>
        </motion.div>
        <div className="space-y-4">
          {OPENINGS.map((o, i) => (
            <motion.div
              key={o.title}
              {...fadeUp(i * 0.08)}
              whileHover={{ y: -8, scale: 1.03 }}
              whileTap={{ y: -8, scale: 1.03 }}
              className="rounded-2xl bg-white border border-slate-200 shadow-sm transition-all duration-400 group cursor-pointer hover:border-amber-400/60 hover:shadow-[0_8px_40px_rgba(245,158,11,0.18),0_0_60px_rgba(245,158,11,0.10)]"
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
            >
              <div className="p-6 group-hover:bg-gradient-to-br group-hover:from-[#18181b] group-hover:to-[#0f172a] group-hover:border-amber-400/60 group-hover:shadow-[0_8px_40px_rgba(245,158,11,0.18),0_0_60px_rgba(245,158,11,0.10)] transition-all duration-400 rounded-2xl border border-transparent">
                <div className="h-[2px] w-full bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 opacity-60 mb-5 group-hover:opacity-90 transition-opacity duration-400" />
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-base mb-1 text-slate-800 group-hover:text-amber-100 transition-colors">{o.title}</h3>
                    <p className="text-slate-500 text-sm mb-2 group-hover:text-slate-300 transition-colors">{o.desc}</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-600 text-[10px] font-medium border border-amber-200 group-hover:bg-amber-400 group-hover:text-white group-hover:border-amber-400 transition-colors">{o.team}</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-50 text-slate-500 text-[10px] border border-slate-200 group-hover:bg-slate-700 group-hover:text-white group-hover:border-slate-700 transition-colors">{o.location}</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] border border-emerald-200 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 transition-colors">{o.type}</span>
                    </div>
                  </div>
                  <button className="flex-shrink-0 px-6 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-yellow-500 to-amber-600 text-white shadow-[0_4px_16px_rgba(245,158,11,0.25)] hover:shadow-[0_8px_30px_rgba(245,158,11,0.4)] hover:scale-[1.03] transition-all duration-300 group-hover:bg-black group-hover:from-black group-hover:to-black group-hover:text-amber-300">
                    Apply Now
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
