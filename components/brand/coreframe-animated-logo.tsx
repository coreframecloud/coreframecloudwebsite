"use client";

import clsx from "clsx";

type CoreframeAnimatedLogoProps = {
  size?: number;
  className?: string;
  animated?: boolean;
  title?: string;
};

export function CoreframeAnimatedLogo({
  size = 64,
  className,
  animated = true,
  title = "CoreFrame Cloud",
}: CoreframeAnimatedLogoProps) {
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
        <linearGradient id="cf-gpu-green" x1="18" y1="18" x2="110" y2="110" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#99F6E4" />
          <stop offset="45%" stopColor="#34D399" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>

        <linearGradient id="cf-gpu-core" x1="46" y1="42" x2="84" y2="82" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ECFEFF" />
          <stop offset="45%" stopColor="#A7F3D0" />
          <stop offset="100%" stopColor="#34D399" />
        </linearGradient>

        <radialGradient
          id="cf-gpu-glow"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(64 64) rotate(90) scale(34)"
        >
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="38%" stopColor="#6EE7B7" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
        </radialGradient>

        <filter id="cf-soft-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="3.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g filter="url(#cf-soft-glow)">
        <rect
          x="18"
          y="30"
          width="92"
          height="60"
          rx="12"
          stroke="url(#cf-gpu-green)"
          strokeWidth="4.5"
          fill="rgba(7,18,20,0.14)"
        />

        <path
          d="M15 42H22M15 53H22M15 64H22M15 75H22"
          stroke="url(#cf-gpu-green)"
          strokeWidth="3"
          strokeLinecap="round"
        />

        <path
          d="M106 44H113M106 54H113M106 64H113M106 74H113"
          stroke="url(#cf-gpu-green)"
          strokeWidth="3"
          strokeLinecap="round"
        />

        <path
          d="M42 92H86"
          stroke="url(#cf-gpu-green)"
          strokeWidth="4"
          strokeLinecap="round"
        />

        <path
          d="M48 98H80"
          stroke="url(#cf-gpu-green)"
          strokeOpacity="0.8"
          strokeWidth="3"
          strokeLinecap="round"
        />

        <g className={animated ? "cf-logo-float" : undefined}>
          <rect
            x="34"
            y="42"
            width="60"
            height="36"
            rx="8"
            stroke="url(#cf-gpu-green)"
            strokeWidth="3"
            fill="rgba(9,22,27,0.22)"
          />

          <path
            d="M48 60L64 50L80 60L64 70L48 60Z"
            fill="url(#cf-gpu-core)"
            stroke="#E6FFF8"
            strokeOpacity="0.9"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M64 50V70"
            stroke="#E6FFF8"
            strokeOpacity="0.95"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M48 60H80"
            stroke="#E6FFF8"
            strokeOpacity="0.72"
            strokeWidth="1.4"
            strokeLinecap="round"
          />

          <circle
            cx="64"
            cy="60"
            r="14"
            fill="url(#cf-gpu-glow)"
            className={animated ? "cf-logo-pulse" : undefined}
          />
          <circle
            cx="64"
            cy="60"
            r="4.2"
            fill="#FFFFFF"
            className={animated ? "cf-logo-core" : undefined}
          />
        </g>
      </g>
    </svg>
  );
}
