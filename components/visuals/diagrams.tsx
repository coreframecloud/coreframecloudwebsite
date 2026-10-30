import type { CSSProperties, ReactNode } from "react";

/**
 * Animated SVG diagrams that carry a message instead of a paragraph.
 * CSS-only motion (cfv-* keyframes in globals.css): the markup is identical
 * with reduced motion, where the same parts crossfade instead of travelling.
 * Server components, no JavaScript. Brand colours only.
 */

const INK = "#101113";
const BLUE = "#2f6be0";
const SOFT = "#e8effb";
const MUTED = "#6b7079";

type V = CSSProperties & { [k: `--${string}`]: string | number };

function Frame({ label, children, viewBox }: { label: string; children: ReactNode; viewBox: string }) {
  return (
    <svg viewBox={viewBox} role="img" aria-label={label} className="h-auto w-full" xmlns="http://www.w3.org/2000/svg">
      <title>{label}</title>
      {children}
    </svg>
  );
}

function Laptop({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="0" y="0" width="120" height="78" rx="8" fill={INK} />
      <rect x="8" y="8" width="104" height="62" rx="3" fill={SOFT} />
      <rect x="18" y="20" width="56" height="7" rx="3" fill={BLUE} opacity="0.75" />
      <rect x="18" y="33" width="80" height="5" rx="2.5" fill="#c6d4f2" />
      <rect x="18" y="43" width="66" height="5" rx="2.5" fill="#c6d4f2" />
      <path d="M-14 84 H134 L124 92 H-4 Z" fill={INK} />
    </g>
  );
}

function Tower({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="0" y="0" width="86" height="120" rx="10" fill={INK} />
      <rect x="12" y="16" width="62" height="10" rx="5" fill="#1f2430" />
      <rect x="12" y="34" width="62" height="10" rx="5" fill="#1f2430" />
      <circle cx="68" cy="100" r="5" fill="#3ddc84" className="cfv-blink" />
      <rect x="12" y="56" width="62" height="28" rx="6" fill={BLUE} opacity="0.9" />
      <text x="43" y="74" textAnchor="middle" fontSize="11" fontWeight="600" fill="#fff" fontFamily="var(--font-inter)">
        GPU
      </text>
      <text x="43" y="142" textAnchor="middle" fontSize="12" fill={MUTED} fontFamily="var(--font-inter)">
        {label}
      </text>
    </g>
  );
}

/** Your laptop ⇄ the workstation in India: frames stream in, input goes out. */
export function StreamDiagram() {
  const out: V = { "--cfv-dx": "236px", "--cfv-dur": "2.6s" };
  const back: V = { "--cfv-dx": "-236px", "--cfv-dur": "3.4s" };
  return (
    <Frame viewBox="0 0 560 230" label="Your laptop streams a workstation in India: the picture comes to you, your mouse and keys go to it">
      <Laptop x={40} y={60} />
      <text x="100" y="186" textAnchor="middle" fontSize="12" fill={MUTED} fontFamily="var(--font-inter)">
        Your laptop
      </text>
      <line x1="176" y1="96" x2="420" y2="96" stroke="#c6d4f2" strokeWidth="2" strokeDasharray="4 6" />
      <line x1="176" y1="122" x2="420" y2="122" stroke="#c6d4f2" strokeWidth="2" strokeDasharray="4 6" />
      {[0, 0.65, 1.3, 1.95].map((d) => (
        <rect key={d} x="414" y="90" width="14" height="12" rx="3" fill={BLUE} className="cfv-slide" style={{ ...back, "--cfv-delay": `${d}s` } as V} />
      ))}
      {[0, 1.1, 2.2].map((d) => (
        <circle key={d} cx="180" cy="122" r="4" fill={INK} className="cfv-slide" style={{ ...out, "--cfv-delay": `${d}s` } as V} />
      ))}
      <text x="298" y="80" textAnchor="middle" fontSize="11.5" fill={BLUE} fontFamily="var(--font-inter)">
        4K at 60 fps
      </text>
      <text x="298" y="146" textAnchor="middle" fontSize="11.5" fill={MUTED} fontFamily="var(--font-inter)">
        your mouse and keys
      </text>
      <Tower x={440} y={40} label="India" />
    </Frame>
  );
}

/** A team of people, all connected to one shared storage pool that fills. */
export function TeamStorageDiagram() {
  const people = [
    [70, 50], [70, 190], [280, 24], [490, 50], [490, 190],
  ] as const;
  const cx = 280, cy = 130;
  return (
    <Frame viewBox="0 0 560 250" label="Everyone in the studio works from one shared cloud storage">
      {people.map(([x, y], i) => {
        const ang = (Math.atan2(cy - y, cx - x) * 180) / Math.PI;
        const len = Math.hypot(cx - x, cy - y) - 52;
        return (
          <g key={i}>
            <line x1={x} y1={y} x2={cx} y2={cy} stroke="#c6d4f2" strokeWidth="2" strokeDasharray="4 6" />
            <g transform={`translate(${x} ${y}) rotate(${ang})`}>
              <circle cx="26" cy="0" r="4.5" fill={BLUE} className="cfv-slide" style={{ "--cfv-dx": `${len - 26}px`, "--cfv-dur": "2.8s", "--cfv-delay": `${i * 0.5}s` } as V} />
            </g>
            <circle cx={x} cy={y} r="22" fill={SOFT} stroke={BLUE} strokeWidth="2" />
            <circle cx={x} cy={y - 5} r="7" fill={BLUE} opacity="0.85" />
            <path d={`M${x - 12} ${y + 13} a12 9 0 0 1 24 0`} fill={BLUE} opacity="0.85" />
          </g>
        );
      })}
      <g transform={`translate(${cx - 46} ${cy - 50})`}>
        <ellipse cx="46" cy="12" rx="46" ry="12" fill={INK} />
        <rect x="0" y="12" width="92" height="76" fill={INK} />
        <ellipse cx="46" cy="88" rx="46" ry="12" fill={INK} />
        <rect x="14" y="26" width="64" height="58" rx="6" fill="#1f2430" />
        <rect x="14" y="26" width="64" height="58" rx="6" fill={BLUE} className="cfv-fill" />
      </g>
      <text x={cx} y={cy + 72} textAnchor="middle" fontSize="12.5" fontWeight="600" fill={INK} fontFamily="var(--font-inter)">
        One shared studio storage
      </text>
    </Frame>
  );
}

/** Files leave the laptop and land on the project drive, ticked off. */
export function FileSyncDiagram() {
  const files = ["scene.blend", "textures/", "client-v3.d5a"];
  return (
    <Frame viewBox="0 0 560 200" label="Your files go up to your project drive once and wait there between sessions">
      <Laptop x={36} y={50} />
      <g transform="translate(420 40)">
        <rect x="0" y="0" width="110" height="120" rx="12" fill={SOFT} stroke={BLUE} strokeWidth="2" />
        <rect x="16" y="18" width="78" height="10" rx="5" fill={BLUE} opacity="0.85" />
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(16 ${42 + i * 22})`}>
            <rect width="62" height="14" rx="4" fill="#fff" stroke="#c6d4f2" />
            <circle cx="72" cy="7" r="6" fill="#3ddc84" className="cfv-pulse" style={{ "--cfv-delay": `${i * 0.6}s` } as V} />
          </g>
        ))}
        <text x="55" y="142" textAnchor="middle" fontSize="12" fill={MUTED} fontFamily="var(--font-inter)">
          Project drive
        </text>
      </g>
      {files.map((f, i) => (
        <g key={f} className="cfv-slide" style={{ "--cfv-dx": "236px", "--cfv-dur": "3.6s", "--cfv-delay": `${i * 1.2}s` } as V}>
          <rect x="172" y={62 + i * 26} width="96" height="20" rx="5" fill="#fff" stroke={BLUE} />
          <text x="220" y={76 + i * 26} textAnchor="middle" fontSize="10.5" fill={INK} fontFamily="var(--font-inter)">
            {f}
          </text>
        </g>
      ))}
    </Frame>
  );
}

/** Two rates as bars, filled on a loop; values come from the live rate card. */
export function RateBars({ rows }: { rows: { label: string; value: string; ratio: number }[] }) {
  return (
    <div className="space-y-5" role="img" aria-label={rows.map((r) => `${r.label}: ${r.value}`).join("; ")}>
      {rows.map((r, i) => (
        <div key={r.label}>
          <div className="mb-2 flex items-baseline justify-between text-[14px]">
            <span className="text-ink-2">{r.label}</span>
            <span className="font-heading text-[20px] font-medium text-ink">{r.value}</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-ink/[0.07]">
            <div
              className="h-full origin-left rounded-full bg-blue cfv-grow"
              style={{ width: `${Math.max(8, Math.min(100, r.ratio * 100))}%`, "--cfv-delay": `${i * 0.3}s` } as V}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Scene memory against two card sizes: it overflows 8 GB, fits in 16 GB. */
export function VramDiagram() {
  return (
    <Frame viewBox="0 0 560 220" label="A heavy scene that needs about 11 GB overflows an 8 GB card and fits on a 16 GB card">
      {[
        { y: 40, label: "8 GB card", cap: 8, color: "#d64545" },
        { y: 130, label: "16 GB on Coreframe", cap: 16, color: BLUE },
      ].map((b) => {
        const scale = 380 / 16;
        const need = 11;
        const fit = Math.min(need, b.cap);
        return (
          <g key={b.label}>
            <text x="20" y={b.y - 10} fontSize="13" fontWeight="600" fill={INK} fontFamily="var(--font-inter)">
              {b.label}
            </text>
            <rect x="20" y={b.y} width={b.cap * scale} height="34" rx="8" fill="#eef1f6" stroke="#c6d4f2" />
            <rect x="20" y={b.y} width={fit * scale} height="34" rx="8" fill={b.color} opacity="0.9" className="cfv-grow-x" />
            {need > b.cap ? (
              <g className="cfv-pulse">
                <rect x={20 + b.cap * scale} y={b.y} width={(need - b.cap) * scale} height="34" rx="8" fill="none" stroke="#d64545" strokeWidth="2" strokeDasharray="5 4" />
                <text x={24 + b.cap * scale + ((need - b.cap) * scale) / 2} y={b.y + 22} textAnchor="middle" fontSize="11.5" fill="#d64545" fontFamily="var(--font-inter)">
                  doesn&apos;t fit
                </text>
              </g>
            ) : (
              <text x={28 + fit * scale} y={b.y + 22} fontSize="11.5" fill={BLUE} fontFamily="var(--font-inter)">
                fits, with room to spare
              </text>
            )}
          </g>
        );
      })}
      <text x="20" y="208" fontSize="11" fill={MUTED} fontFamily="var(--font-inter)">
        Example scene: about 11 GB of textures and geometry
      </text>
    </Frame>
  );
}
