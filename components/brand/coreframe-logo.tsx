import clsx from "clsx";

type CoreframeLogoProps = {
  size?: number;
  className?: string;
  title?: string;
};

export function CoreframeLogo({
  size = 64,
  className,
  title = "CoreFrame Cloud",
}: CoreframeLogoProps) {
  const gradientId = "coreframe-gradient";
  const glowId = "coreframe-glow";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 128 128"
      role="img"
      aria-label={title}
      className={clsx("shrink-0", className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
    >
      <defs>
        <linearGradient id={gradientId} x1="16" y1="20" x2="112" y2="108" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="55%" stopColor="#4F46E5" />
          <stop offset="100%" stopColor="#D946EF" />
        </linearGradient>

        <radialGradient id="coreframe-core" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(64 64) rotate(90) scale(42)">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="35%" stopColor="#93C5FD" stopOpacity="0.8" />
          <stop offset="75%" stopColor="#4F46E5" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#0B1020" stopOpacity="0" />
        </radialGradient>

        <filter id={glowId} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g filter={`url(#${glowId})`}>
        <path
          d="M64 10L103 32V55L112 60V68L103 73V96L64 118L25 96V73L16 68V60L25 55V32L64 10Z"
          stroke={`url(#${gradientId})`}
          strokeWidth="5"
          strokeLinejoin="round"
        />

        <path
          d="M64 27L90 42V72L64 87L38 72V42L64 27Z"
          fill="url(#coreframe-core)"
          stroke={`url(#${gradientId})`}
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        <path
          d="M64 27V57M64 57L90 72M64 57L38 72M64 57L44 46M64 57L84 46M64 57V87"
          stroke="#D8E7FF"
          strokeOpacity="0.9"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path
          d="M44 46L64 57L84 46"
          stroke="#D8E7FF"
          strokeOpacity="0.9"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <circle cx="64" cy="64" r="10" fill="#FFFFFF" fillOpacity="0.95" />
        <circle cx="64" cy="64" r="18" fill="url(#coreframe-core)" />
      </g>
    </svg>
  );
}
