import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] },
});

const SECTIONS = [
  {
    title: '1. What Are Cookies?',
    content: `Cookies are small text files stored on your device when you visit a website. They help us remember your preferences, understand how you use our platform, and improve your experience. Cookies can be "session" (deleted when you close your browser) or "persistent" (remain until they expire or you delete them).`,
  },
  {
    title: '2. Essential Cookies',
    content: `These cookies are strictly necessary for the platform to function. They enable core features like secure login, session management, appointment booking flows, and payment processing. You cannot opt out of essential cookies as the platform would not work without them.`,
  },
  {
    title: '3. Analytics Cookies',
    content: `We use analytics cookies (Google Analytics) to understand how visitors interact with our platform — which pages are most popular, how users navigate, and where they encounter issues. This data is anonymized and aggregated. It helps us improve the user experience and fix bugs faster.`,
  },
  {
    title: '4. Preference Cookies',
    content: `These cookies remember your choices — such as your preferred language, theme settings, saved payment methods, and recently viewed doctors. They make your experience more personalized and save you time on future visits.`,
  },
  {
    title: '5. Marketing Cookies',
    content: `We do not use third-party advertising cookies. We do not sell your browsing data or show targeted ads from external advertisers. If this policy changes in the future, we will notify you and request explicit consent before enabling any marketing cookies.`,
  },
  {
    title: '6. Managing Cookies',
    content: `You can manage cookie preferences through your browser settings. Most browsers allow you to block or delete cookies. Note that blocking essential cookies may prevent you from using core platform features like booking or payments. To opt out of analytics cookies, you can use the Google Analytics Opt-out Browser Add-on.`,
  },
  {
    title: '7. Updates to This Policy',
    content: `We may update this Cookie Policy from time to time to reflect changes in technology, regulation, or our business practices. The "last updated" date at the top of this page indicates when the policy was last revised. Continued use of the platform after changes constitutes your acceptance.`,
  },
];

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">

      {/* HERO */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/3 w-96 h-96 rounded-full bg-amber-500/[0.07] blur-[120px]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-12 text-center">
          <motion.div {...fadeUp()}>
            <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-amber-600 text-sm mb-8 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
              Back to Home
            </Link>
            <p className="text-amber-600 text-xs font-semibold tracking-[0.25em] uppercase mb-4">Legal</p>
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-800 mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              Cookie <span className="italic text-amber-600">Policy</span>
            </h1>
            <p className="text-slate-400 text-sm">Last updated: February 20, 2026</p>
          </motion.div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="w-full px-4 sm:px-8 lg:px-16 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-7xl mx-auto">
          {SECTIONS.map((s, i) => (
            <motion.div
              key={s.title}
              {...fadeUp(i * 0.06)}
              whileHover={{ y: -8, scale: 1.03 }}
              whileTap={{ y: -8, scale: 1.03 }}
              className="relative group rounded-2xl bg-white border border-slate-200 transition-all duration-400 cursor-pointer hover:border-amber-400/60 hover:shadow-[0_8px_40px_rgba(245,158,11,0.18),0_0_60px_rgba(245,158,11,0.10)]"
            >
              <div className="p-6 rounded-2xl transition-all duration-400 group-hover:bg-gradient-to-br group-hover:from-[#18181b] group-hover:to-[#0f172a] group-active:bg-gradient-to-br group-active:from-[#18181b] group-active:to-[#0f172a]">
                <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 opacity-40 group-hover:opacity-90 transition-opacity duration-400" />
                <h2 className="text-slate-800 font-semibold text-base mb-3 group-hover:text-amber-100 group-active:text-amber-100 transition-colors">{s.title}</h2>
                <p className="text-slate-500 text-sm leading-relaxed group-hover:text-slate-300 group-active:text-slate-300 transition-colors">{s.content}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
