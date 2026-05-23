import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, useAnimationFrame, useMotionValue, useSpring, useTransform } from 'framer-motion';

/* ─── Social data ─── */
const SOCIALS = [
  {
    label: 'Twitter',
    href: 'https://twitter.com',
    color: '#1d9bf0',
    icon: (
      <svg className="w-[15px] h-[15px]" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
  {
    label: 'Instagram',
    href: 'https://instagram.com',
    color: '#e1306c',
    icon: (
      <svg className="w-[15px] h-[15px]" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C16.67.014 16.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
      </svg>
    ),
  },
  {
    label: 'Facebook',
    href: 'https://facebook.com',
    color: '#1877f2',
    icon: (
      <svg className="w-[15px] h-[15px]" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com',
    color: '#0a66c2',
    icon: (
      <svg className="w-[15px] h-[15px]" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
  },
  {
    label: 'YouTube',
    href: 'https://youtube.com',
    color: '#ff0000',
    icon: (
      <svg className="w-[15px] h-[15px]" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
  },
];

/* ─── Click sound (lazy-loaded) ─── */
let clickAudio = null;
const playClick = () => {
  try {
    if (!clickAudio) {
      clickAudio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgipusrp5YKS9cmravrrVjMSxPgq+0u8F6Rjk+bqC0v8WMWkE2Wpa2wMmhcFA4RoCxyNHKgWI+O1eMucjU1sSVdUkxPI2YwMvesrmfeFE0NHeXtdTd4siwpqZXN0F0hJSgtcXE/MnOQqMHZ3srd7ee3mYJLOT+Glr3f5vHWn3xELTqHlrXU2d3n4c+5eFMuO4SXr8zU1tjDpX5TNT2Bk6zF1N7m5+PTs4heOTd5jaW+0Nzm7efdu5xyUzQ2coWfuMzb5u3u6+TNoX5dRDhsgZiyyM7V2NjQwq+VeV9JPkZeepOsw9Th5+jl38+7oIRoT0JPYHmQqb7N1Nnb19DBeVU+');
      clickAudio.volume = 0.15;
    }
    clickAudio.currentTime = 0;
    clickAudio.play().catch(() => {});
  } catch {}
};

/* ─── Magnetic icon button ─── */
function MagneticIcon({ social, index }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 20 });
  const springY = useSpring(y, { stiffness: 300, damping: 20 });
  const [hovered, setHovered] = useState(false);

  const handleMouse = useCallback((e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * 0.25);
    y.set((e.clientY - cy) * 0.25);
  }, [x, y]);

  const handleLeave = useCallback(() => {
    x.set(0);
    y.set(0);
    setHovered(false);
  }, [x, y]);

  return (
    <motion.a
      ref={ref}
      href={social.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={social.label}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouse}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleLeave}
      onClick={playClick}
      whileTap={{ scale: 0.85 }}
      initial={{ opacity: 0, scale: 0, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 1.0 + index * 0.08, type: 'spring', stiffness: 400, damping: 18 }}
      className="social-icon-btn relative"
    >
      {/* Hover glow ring */}
      <motion.div
        className="absolute inset-0 rounded-full pointer-events-none"
        animate={{
          boxShadow: hovered
            ? `0 0 16px ${social.color}60, 0 0 32px ${social.color}25`
            : '0 0 0px transparent',
        }}
        transition={{ duration: 0.3 }}
      />

      {/* Icon */}
      <motion.div
        animate={{
          scale: hovered ? 1.2 : 1,
          rotate: hovered ? 6 : 0,
          color: hovered ? social.color : '#94a3b8',
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        className="relative z-10"
      >
        {social.icon}
      </motion.div>

      {/* Tooltip */}
      <motion.span
        initial={{ opacity: 0, y: 8, scale: 0.85 }}
        animate={hovered ? { opacity: 1, y: -32, scale: 1 } : { opacity: 0, y: 8, scale: 0.85 }}
        transition={{ duration: 0.2 }}
        className="absolute left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md bg-white/10 backdrop-blur-md text-[9px] text-white font-medium whitespace-nowrap pointer-events-none border border-white/10"
      >
        {social.label}
      </motion.span>
    </motion.a>
  );
}

/* ─── Main Social Bar ─── */
export default function SocialBar() {
  const barRef = useRef(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const barX = useSpring(0, { stiffness: 80, damping: 25 });
  const barY = useSpring(0, { stiffness: 80, damping: 25 });
  const glowX = useMotionValue(50);
  const glowY = useMotionValue(50);

  // Cursor follow (container shifts toward cursor)
  useEffect(() => {
    let rafId;
    const track = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener('mousemove', track, { passive: true });

    const update = () => {
      if (!barRef.current) { rafId = requestAnimationFrame(update); return; }
      const rect = barRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = mouseX.get() - cx;
      const dy = mouseY.get() - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = 250;

      if (dist < maxDist) {
        const strength = (1 - dist / maxDist) * 6;
        barX.set(dx / dist * strength);
        barY.set(dy / dist * strength);
        // glow follows
        const pctX = ((mouseX.get() - rect.left) / rect.width) * 100;
        const pctY = ((mouseY.get() - rect.top) / rect.height) * 100;
        glowX.set(Math.max(0, Math.min(100, pctX)));
        glowY.set(Math.max(0, Math.min(100, pctY)));
      } else {
        barX.set(0);
        barY.set(0);
      }
      rafId = requestAnimationFrame(update);
    };
    rafId = requestAnimationFrame(update);

    return () => {
      window.removeEventListener('mousemove', track);
      cancelAnimationFrame(rafId);
    };
  }, [mouseX, mouseY, barX, barY, glowX, glowY]);

  const glowBg = useTransform(
    [glowX, glowY],
    ([gx, gy]) => `radial-gradient(circle at ${gx}% ${gy}%, rgba(59,130,246,0.12), rgba(250,204,21,0.06), transparent 70%)`
  );

  return (
    <motion.div
      ref={barRef}
      style={{ x: barX, y: barY }}
      className="social-bar-container"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty('--x', `${e.clientX - rect.left}px`);
        e.currentTarget.style.setProperty('--y', `${e.clientY - rect.top}px`);
      }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* Gold accent bar */}
      <div className="absolute top-0 left-3 right-3 h-[1.5px] bg-gradient-to-r from-transparent via-amber-400/50 to-transparent rounded-full" />
      {/* Cursor-follow inner glow */}
      <motion.div
        className="absolute inset-0 rounded-full pointer-events-none z-0"
        style={{ background: glowBg }}
      />

      {/* Arrow indicator */}
      <motion.div
        className="relative z-10 flex items-center justify-center w-5 text-blue-400/50"
        animate={{ x: [0, 3, 0], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
        </svg>
      </motion.div>

      {/* Separator */}
      <div className="w-px h-4 bg-gradient-to-b from-blue-500/20 via-white/10 to-amber-500/20 mx-0.5" />

      {/* Icons */}
      {SOCIALS.map((s, i) => (
        <MagneticIcon key={s.label} social={s} index={i} />
      ))}

      {/* Inline styles for the bar */}
      <style>{`
        .social-bar-container {
          position: fixed;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 9999;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 7px 14px 7px 10px;
          border-radius: 1rem;
          background: #0f172a;
          border: 1px solid rgba(255,255,255,0.08);
          animation: socialFloat 4s ease-in-out infinite;
          overflow: visible;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .social-bar-container:hover {
          transform: translateX(-50%) translateY(-4px) scale(1.02);
          border-color: rgba(251,191,36,0.25);
          box-shadow:
            0 0 30px rgba(251,191,36,0.15),
            0 0 60px rgba(251,191,36,0.08),
            0 20px 60px rgba(245,158,11,0.06);
        }

        /* Golden border glow (behind) */
        .social-bar-container::before {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: calc(1rem + 2px);
          background: linear-gradient(135deg, #facc15, #f59e0b, #d97706, #facc15);
          background-size: 300% 300%;
          animation: borderShift 6s ease infinite;
          z-index: -2;
          filter: blur(6px);
          opacity: 0;
          transition: opacity 0.4s ease;
        }

        .social-bar-container:hover::before {
          opacity: 0.7;
        }

        /* Mouse-follow spotlight */
        .social-bar-container::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: radial-gradient(
            200px circle at var(--x, 50%) var(--y, 50%),
            rgba(251,191,36,0.10),
            transparent 60%
          );
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: 10;
          pointer-events: none;
        }

        .social-bar-container:hover::after {
          opacity: 1;
        }

        .social-icon-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 0.625rem;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.06);
          cursor: pointer;
          transition: background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
          text-decoration: none;
        }

        .social-icon-btn:hover {
          background: rgba(255,255,255,0.10);
          border-color: rgba(251,191,36,0.20);
          box-shadow: 0 0 12px rgba(251,191,36,0.12);
        }

        @keyframes socialFloat {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(-5px); }
        }

        @keyframes borderShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </motion.div>
  );
}
