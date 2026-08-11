export default function ConvertZoneLogo({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="czGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
        <linearGradient id="czGrad2" x1="100%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#60a5fa" />
        </linearGradient>
        <filter id="czGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#2563eb" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* Main Logo Group with Filter */}
      <g filter="url(#czGlow)">
        {/* Background Shield/Circle Base */}
        <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#czGrad1)" />

        {/* Dynamic Curved Exchange Loop Arrow Top-Right */}
        <path
          d="M 28 13 C 34 13 37 18 37 24 C 37 29 33 34 27 35"
          stroke="#ffffff"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 23 35 L 28 32 L 28 38 Z"
          fill="#ffffff"
        />

        {/* Dynamic Curved Exchange Loop Arrow Bottom-Left */}
        <path
          d="M 20 35 C 14 35 11 30 11 24 C 11 19 15 14 21 13"
          stroke="#ffffff"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 25 13 L 20 16 L 20 10 Z"
          fill="#ffffff"
        />

        {/* Inner Core Pulse Dot */}
        <circle cx="24" cy="24" r="3" fill="#ffffff" />
      </g>
    </svg>
  );
}
