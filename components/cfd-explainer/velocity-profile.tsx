/**
 * The velocity profile drawn over the wall-layers sketch (owner, 16 Oct 2026:
 * "the weakest art: add a simple SVG overlay so it reads"). Same viewBox as
 * the 1536x864 sketch, drawn in its empty bottom-right corner as an inset
 * card: the wall, the thin prism layers stacked on it (each a little thicker
 * than the one below), and the speed profile over them, zero at the wall and
 * rising to the core flow. Labels are ours, in mono, never painted.
 */
export function VelocityProfileOverlay() {
  // inset card geometry (viewBox units)
  const x0 = 880, x1 = 1524, yTop = 470, wallY = 778;
  // prism layers: first one thinnest, growth ~1.35
  const layers: number[] = [];
  let t = 12, y = wallY;
  for (let i = 0; i < 6; i++) { y -= t; layers.push(y); t *= 1.35; }
  // u(y) ~ (y/delta)^(1/7), drawn as arrows from the left edge of the plot
  const left = 930, umax = 520, delta = wallY - yTop - 30;
  const u = (h: number) => umax * Math.pow(Math.min(h / delta, 1), 1 / 7);
  const pts: string[] = [];
  for (let h = 0; h <= delta; h += 4) pts.push(`${(left + u(h)).toFixed(1)},${(wallY - h).toFixed(1)}`);
  const arrows = [12, 40, 100, 180, 260];
  return (
    <svg className="cfx-overlay" viewBox="0 0 1536 864" aria-hidden>
      <rect x={x0} y={yTop - 34} width={x1 - x0} height={wallY - yTop + 96} rx="12" fill="#fffffff2" stroke="#101113" strokeWidth="3" />
      {/* wall with hatching */}
      <line x1={left - 30} y1={wallY} x2={x1 - 20} y2={wallY} stroke="#101113" strokeWidth="5" />
      {Array.from({ length: 19 }, (_, i) => (
        <line key={i} x1={left - 20 + i * 30} y1={wallY + 4} x2={left - 40 + i * 30} y2={wallY + 24} stroke="#101113" strokeWidth="2" />
      ))}
      {/* prism layers */}
      {layers.map((ly) => (
        <line key={ly} x1={left} y1={ly} x2={x1 - 20} y2={ly} stroke="#2a9d93" strokeWidth="2" opacity="0.75" />
      ))}
      {/* the profile */}
      <polyline points={pts.join(" ")} fill="none" stroke="#24549f" strokeWidth="7" strokeLinecap="round" />
      <line x1={left} y1={wallY} x2={left} y2={yTop + 10} stroke="#101113" strokeWidth="2" strokeDasharray="6 6" />
      {arrows.map((h) => {
        const len = u(h);
        const yy = wallY - h;
        return (
          <g key={h} stroke="#24549f" strokeWidth="5" fill="#24549f">
            <line x1={left} y1={yy} x2={left + len - 14} y2={yy} />
            <path d={`M${left + len},${yy} l-24,-12 v24 z`} stroke="none" />
          </g>
        );
      })}
      {/* labels */}
      <text x={left + 14} y={yTop + 6} fontFamily="ui-monospace, Menlo, monospace" fontSize="48" fill="#101113">speed →</text>
      <text x={x1 - 24} y={wallY + 52} textAnchor="end" fontFamily="ui-monospace, Menlo, monospace" fontSize="44" fill="#101113">wall</text>
    </svg>
  );
}
