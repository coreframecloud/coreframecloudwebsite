"use client";

export function ArchitectureBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* right-side architecture cluster */}
      <div className="absolute right-[-6%] top-[8%] h-[78vh] w-[58vw] opacity-[0.28]">
        <svg
          viewBox="0 0 1200 900"
          className="h-full w-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="archLine" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.22" />
            </linearGradient>

            <filter id="archGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <g filter="url(#archGlow)" stroke="url(#archLine)" strokeWidth="1.4">
            {/* main tower */}
            <path d="M650 760 L840 640 L1020 710 L825 830 Z" />
            <path d="M840 640 L840 220 L1020 290 L1020 710" />
            <path d="M650 760 L650 340 L840 220" />
            <path d="M650 340 L825 210 L1020 290" />

            {/* tower floors */}
            <path d="M650 410 L840 290 L1020 360" />
            <path d="M650 485 L840 365 L1020 435" />
            <path d="M650 560 L840 440 L1020 510" />
            <path d="M650 635 L840 515 L1020 585" />

            {/* side tower */}
            <path d="M430 790 L610 680 L760 735 L580 845 Z" />
            <path d="M610 680 L610 360 L760 425 L760 735" />
            <path d="M430 790 L430 470 L610 360" />
            <path d="M430 470 L585 360 L760 425" />

            {/* side tower floors */}
            <path d="M430 545 L610 435 L760 495" />
            <path d="M430 620 L610 510 L760 570" />
            <path d="M430 695 L610 585 L760 645" />

            {/* front podium */}
            <path d="M250 860 L470 735 L640 790 L420 915 Z" />
            <path d="M470 735 L470 610 L640 665 L640 790" />
            <path d="M250 860 L250 730 L470 610" />
            <path d="M250 730 L425 615 L640 665" />

            {/* podium grid */}
            <path d="M250 790 L470 665 L640 720" />
            <path d="M250 825 L470 700 L640 755" />

            {/* background block */}
            <path d="M760 700 L930 595 L1080 650 L910 760 Z" />
            <path d="M930 595 L930 430 L1080 490 L1080 650" />
            <path d="M760 700 L760 540 L930 430" />
            <path d="M760 540 L900 440 L1080 490" />
          </g>
        </svg>
      </div>

      {/* subtle blueprint grid */}
      <div className="absolute inset-0 opacity-[0.08]">
        <svg
          viewBox="0 0 1600 1000"
          className="h-full w-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          {Array.from({ length: 14 }).map((_, i) => (
            <line
              key={`h-${i}`}
              x1="0"
              y1={i * 80}
              x2="1600"
              y2={i * 80}
              stroke="#67e8f9"
              strokeWidth="0.6"
            />
          ))}
          {Array.from({ length: 20 }).map((_, i) => (
            <line
              key={`v-${i}`}
              x1={i * 80}
              y1="0"
              x2={i * 80}
              y2="1000"
              stroke="#67e8f9"
              strokeWidth="0.6"
            />
          ))}
        </svg>
      </div>

      {/* stronger ambient glows */}
      <div className="absolute right-[12%] top-[18%] h-[26rem] w-[26rem] rounded-full bg-cyan-400/12 blur-3xl" />
      <div className="absolute right-[4%] top-[30%] h-[20rem] w-[20rem] rounded-full bg-blue-500/10 blur-3xl" />

      <style jsx>{`
        div > svg,
        .absolute.right-\\[-6\\%] {
          animation: archFloat 16s ease-in-out infinite alternate;
        }

        @keyframes archFloat {
          0% {
            transform: translate3d(0px, 0px, 0px) scale(1);
          }
          100% {
            transform: translate3d(-12px, -8px, 0px) scale(1.015);
          }
        }
      `}</style>
    </div>
  );
}
