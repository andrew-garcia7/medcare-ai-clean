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
    title: '1. Information We Collect',
    content: `We collect information you provide directly — such as your name, email, phone number, date of birth, and medical history when you create an account or book an appointment. We also automatically collect device information (browser type, IP address, operating system) and usage data (pages visited, features used, timestamps) through cookies and analytics tools.`,
  },
  {
    title: '2. How We Use Your Information',
    content: `Your data is used to: facilitate appointment bookings and doctor-patient matching; personalize your healthcare experience; send appointment reminders and health updates; process payments securely; improve our AI algorithms (with anonymized data only); and comply with legal and regulatory requirements.`,
  },
  {
    title: '3. Data Sharing & Disclosure',
    content: `We never sell your personal or medical data. We share information only with: your chosen doctors and healthcare providers (with your consent); payment processors (Razorpay, Stripe) for transaction processing; cloud infrastructure providers (AWS) under strict data processing agreements; and law enforcement when required by Indian law.`,
  },
  {
    title: '4. Data Security',
    content: `All data is encrypted at rest (AES-256) and in transit (TLS 1.3). We implement role-based access controls, regular security audits, and penetration testing. Medical records are stored in HIPAA and DISHA-compliant infrastructure. We maintain SOC 2 Type II certification.`,
  },
  {
    title: '5. Your Rights',
    content: `Under the Digital Personal Data Protection Act (DPDPA) 2023, you have the right to: access your personal data; correct inaccurate data; delete your account and associated data; withdraw consent at any time; receive data in a portable format; and lodge a complaint with the Data Protection Board of India.`,
  },
  {
    title: '6. Data Retention',
    content: `We retain your personal data for as long as your account is active. Medical records are retained for a minimum of 3 years after your last interaction as required by Indian medical regulations. You can request account deletion at any time through your dashboard settings.`,
  },
  {
    title: '7. Third-Party Services',
    content: `We use trusted third-party services including Razorpay and Stripe for payments, AWS for cloud hosting, Google Analytics for usage insights (anonymized), and Twilio for SMS notifications. Each provider operates under their own privacy policy and our data processing agreements.`,
  },
  {
    title: '8. Contact Us',
    content: `For privacy-related inquiries, contact our Data Protection Officer at privacy@medcare.health. For general support, email support@medcare.health or use the in-app chat. Response time: within 48 hours for privacy requests.`,
  },
];

export default function PrivacyPage() {
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
              Privacy <span className="italic text-amber-600">Policy</span>
            </h1>
            <p className="text-slate-400 text-sm">Last updated: March 15, 2026</p>
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
