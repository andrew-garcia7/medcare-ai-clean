import MadoxLogo from './MadoxLogo';
import { Outlet, Link } from "react-router-dom";
import Navbar from "../Navbar";
import Cursor from "../Cursor";
import SocialBar from "../SocialBar";
import { useLocation } from "react-router-dom";

const FOOTER_LINKS = {
  Platform: [
    { label: 'Find Doctors', to: '/doctors' },
    { label: 'Book Appointment', to: '/book' },
    { label: 'Patient Portal', to: '/dashboard' },
    { label: 'Emergency Tracker', to: '/emergency' },
  ],
  Specialties: [
    { label: 'Cardiology', to: '/doctors?search=Cardiology' },
    { label: 'Neurology', to: '/doctors?search=Neurology' },
    { label: 'Oncology', to: '/doctors?search=Oncology' },
    { label: 'Orthopedics', to: '/doctors?search=Orthopedics' },
  ],
  Company: [
    { label: 'About MedCare', to: '/about' },
    { label: 'Research', to: '/research' },
    { label: 'Careers', to: '/careers' },
  ],
};

export default function Layout() {

    const location = useLocation(); 
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-800">

      {/* CURSOR */}
      <Cursor />

      {/* NAVBAR */}
      <Navbar />

      {/* MAIN */}
      <main className="flex-1 pt-[72px]">
        <div className="w-full px-0">
          <Outlet />
        </div>
      </main>

      {/* 🔥 DARK FOOTER */}
      <footer className="relative z-10 border-t border-white/[0.06] bg-[#020617] overflow-hidden">

        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[700px] h-[250px] bg-amber-500/[0.04] blur-[140px]" />
          <div className="absolute right-0 bottom-0 w-[400px] h-[200px] bg-yellow-500/[0.04] blur-[60px]" />
        </div>

        <div className="relative w-full px-6 lg:px-12 xl:px-20 py-16">

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">

            <div>
              <div className="flex items-center gap-2 mb-5">
                <MadoxLogo key={location.pathname} small />
              </div>
              <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
                India's most advanced AI-powered healthcare platform.
              </p>
            </div>

            {Object.entries(FOOTER_LINKS).map(([title, items]) => (
              <div key={title}>
                <h4 className="text-xs text-slate-600 uppercase mb-5 tracking-widest">
                  {title}
                </h4>

                <ul className="space-y-3 text-sm text-slate-500">
                  {items.map((item) => (
                    <li key={item.label} className="group relative">
                      <Link to={item.to} className="transition group-hover:text-amber-400">
                        {item.label}
                      </Link>
                      <span className="absolute left-0 -bottom-1 w-0 h-[1px] bg-amber-400 transition-all duration-300 group-hover:w-full" />
                    </li>
                  ))}
                </ul>
              </div>
            ))}

          </div>

          <div className="mt-14 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

          <div className="mt-6 flex flex-col md:flex-row items-center justify-between text-xs text-slate-600 gap-3">
            <span>
              © {new Date().getFullYear()} MedCare Health Platform. All rights reserved.
            </span>

            <div className="flex gap-6">
              <Link to="/terms" className="hover:text-amber-400 transition-colors">Terms</Link>
              <Link to="/privacy" className="hover:text-amber-400 transition-colors">Privacy Policy</Link>
              <Link to="/cookies" className="hover:text-amber-400 transition-colors">Cookies</Link>
            </div>
          </div>

          {/* Premium Floating Social Bar */}
          <SocialBar />

        </div>
      </footer>

    </div>
  );
}