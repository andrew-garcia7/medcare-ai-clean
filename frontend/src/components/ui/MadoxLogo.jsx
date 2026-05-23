import { motion } from "framer-motion";
import { useState, useRef } from "react";

/* 🔊 SOUND */
function useBirdSound() {
  const audioRef = useRef(null);

  return () => {
    if (!audioRef.current) {
      audioRef.current = new Audio("/sounds/bird-tick.mp3");
      audioRef.current.volume = 0.25;
    }
    audioRef.current.currentTime = 0;
    audioRef.current.play();
  };
}

/* 💥 SPARK */
function Spark({ show }) {
  return (
    <motion.div
      className="absolute w-3 h-3 bg-yellow-400 rounded-full"
      animate={show ? { scale: [0, 1.5, 0], opacity: [0, 1, 0] } : {}}
      transition={{ duration: 0.4 }}
      style={{ boxShadow: "0 0 20px #facc15" }}
    />
  );
}

/* 🐦 BIRD */
function Bird({ onHit }) {
  return (
    <motion.div
      key={window.location.pathname}   // 🔥 FIX FREEZE
      className="absolute left-[-120px]"
      animate={{
        x: [0, 120, 0],
        y: [0, -10, 0],
      }}
      transition={{
        duration: 2.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      onUpdate={(latest) => {
        if (latest.x > 110 && latest.x < 120) {
          onHit();
        }
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24">
        <path
          d="M2 12 Q8 4 14 10 Q10 11 8 16 Q6 14 2 12 Z"
          fill="#3b82f6"
        />
      </svg>
    </motion.div>
  );
}

/* 🏥 STETHOSCOPE BACKGROUND */
function StethoBG() {
  return (
    <svg
      viewBox="0 0 120 120"
      className="absolute w-28 h-28 opacity-100"
      style={{
        filter: "drop-shadow(0 0 10px rgba(59,130,246,0.6))"
      }}
    >
      <defs>
        <linearGradient id="grad" x1="0" y1="0" x2="120" y2="120">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#facc15" />
        </linearGradient>
      </defs>

      <path
        d="M30 30 Q60 90 90 30"
        stroke="url(#grad)"
        strokeWidth="4"
        fill="none"
      />

      <path
        d="M60 90 L60 110"
        stroke="url(#grad)"
        strokeWidth="4"
      />

      
    </svg>
  );
}

/* 🚀 MAIN */
export default function MadoxLogo() {
  const [spark, setSpark] = useState(false);
  const playSound = useBirdSound();

  const handleHit = () => {
    if (!spark) {
      setSpark(true);
      playSound();
      setTimeout(() => setSpark(false), 300);
    }
  };

  return (
    <div className="relative flex items-center justify-center">
      
      {/* BG ICON */}
      <StethoBG />

      {/* TEXT */}
      <span
        className="text-2xl font-serif italic z-10"
        style={{
          background: "linear-gradient(90deg, #3b82f6, #facc15)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        Madox
      </span>

      {/* BIRD */}
      <Bird onHit={handleHit} />

      {/* SPARK */}
      {spark && <Spark show={spark} />}
    </div>
  );
}