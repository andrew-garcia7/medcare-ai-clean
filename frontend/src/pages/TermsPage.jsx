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
    title: '1. Acceptance of Terms',
    content: `By accessing or using MedCare's platform (web and mobile applications), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services. We reserve the right to update these terms at any time, with notice provided via email or in-app notification.`,
  },
  {
    title: '2. Description of Services',
    content: `MedCare provides an AI-powered healthcare platform that enables: online doctor discovery and appointment booking; secure video and audio consultations; prescription management and health record storage; digital payments for consultations; emergency ambulance tracking; and AI-assisted symptom analysis. MedCare is a technology platform and does not itself provide medical services.`,
  },
  {
    title: '3. User Accounts',
    content: `You must be at least 18 years old to create an account. You are responsible for maintaining the confidentiality of your login credentials and for all activities under your account. You agree to provide accurate, current, and complete information during registration and to update such information as needed.`,
  },
  {
    title: '4. Medical Disclaimer',
    content: `MedCare's AI symptom checker and health recommendations are for informational purposes only and do not constitute medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider for medical decisions. In case of a medical emergency, call your local emergency number immediately.`,
  },
  {
    title: '5. Payments & Refunds',
    content: `Consultation fees are set by individual doctors and processed through Razorpay/Stripe. Payments are due at the time of booking. Refunds are available if: the doctor cancels the appointment; the consultation does not take place due to a technical issue on our end; or you cancel at least 4 hours before the scheduled time. Refunds are processed within 5-7 business days.`,
  },
  {
    title: '6. Intellectual Property',
    content: `All content, features, and functionality of the MedCare platform — including text, graphics, logos, icons, images, audio, software, and source code — are the exclusive property of MedCare Health Pvt. Ltd. and are protected by Indian and international copyright, trademark, and intellectual property laws.`,
  },
  {
    title: '7. Limitation of Liability',
    content: `MedCare shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the platform. Our total liability for any claims shall not exceed the amount you paid to MedCare in the 12 months preceding the claim. This does not limit liability for gross negligence or willful misconduct.`,
  },
  {
    title: '8. Governing Law',
    content: `These terms shall be governed by the laws of India. Any disputes arising from these terms or your use of the platform shall be subject to the exclusive jurisdiction of the courts in Bangalore, Karnataka, India.`,
  },
];

export default function TermsPage() {
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
              Terms of <span className="italic text-amber-600">Service</span>
            </h1>
            <p className="text-slate-400 text-sm">Last updated: March 1, 2026</p>
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
