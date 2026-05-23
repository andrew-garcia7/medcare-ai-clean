export default function MedCareLogo({ small = false }) {
  return (
    <svg
      viewBox="0 0 180 50"
      xmlns="http://www.w3.org/2000/svg"
      className={small ? 'w-[120px] h-[32px]' : 'w-[160px] h-[42px]'}
    >
      <defs>
        <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00d4b4" />
          <stop offset="100%" stopColor="#4f9cf9" />
        </linearGradient>
      </defs>

      {/* 🔥 Background medical box */}
      <rect x="2" y="10" width="30" height="30" rx="8" fill="url(#logo-grad)" />

      {/* 🔥 Medical cross */}
      <rect x="15" y="14" width="4" height="22" rx="2" fill="white" />
      <rect x="8" y="21" width="18" height="4" rx="2" fill="white" />

      {/* 🔥 Stethoscope shape */}
      <path
        d="M22 28 C35 40, 55 40, 60 25"
        stroke="white"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="60" cy="25" r="3" fill="white" />

      {/* 🔥 Doctor head icon */}
      <circle cx="22" cy="8" r="4" fill="url(#logo-grad)" />
      <rect x="19" y="12" width="6" height="4" rx="2" fill="url(#logo-grad)" />

      {/* 🔥 Text */}
      <text
        x="40"
        y="30"
        fontFamily="Cormorant Garamond, serif"
        fontSize="20"
        fontWeight="500"
        fill="#f0f4f8"
      >
        Med
      </text>

      <text
        x="78"
        y="30"
        fontFamily="Cormorant Garamond, serif"
        fontSize="20"
        fontWeight="300"
        fill="url(#logo-grad)"
      >
        Care
      </text>

      <text
        x="40"
        y="40"
        fontFamily="Outfit, sans-serif"
        fontSize="7"
        letterSpacing="2"
        fill="#506070"
      >
        AI HEALTHCARE
      </text>
    </svg>
  );
}