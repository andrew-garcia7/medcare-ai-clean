export default function AnimatedLogo() {
  return (
    <div className="flex items-center gap-2">
      <svg viewBox="0 0 180 50" className="w-[160px] h-[42px]">

        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00d4b4" />
            <stop offset="100%" stopColor="#4f9cf9" />
          </linearGradient>
        </defs>

        {/* Pulse circle */}
        <circle cx="18" cy="25" r="8" fill="url(#grad)">
          <animate attributeName="r" values="8;11;8" dur="1.5s" repeatCount="indefinite"/>
        </circle>

        {/* Stethoscope rotating */}
        <g>
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 18 25"
            to="360 18 25"
            dur="6s"
            repeatCount="indefinite"
          />
          <path d="M18 25 C30 40, 50 40, 60 25" stroke="white" strokeWidth="2" fill="none"/>
        </g>

        {/* Text */}
        <text x="40" y="30" fontSize="20" fill="#fff">Med</text>
        <text x="78" y="30" fontSize="20" fill="url(#grad)">Care</text>

      </svg>
    </div>
  );
}