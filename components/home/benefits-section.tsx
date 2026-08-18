/**
 * The four arguments, each tied to a situation a studio recognises.
 *
 * These are deliberately NOT feature bullets. Each one names a moment — the
 * queue for the good machine, the client asking for a change, the file you
 * cannot find, the hire you cannot make — because that is how this audience
 * describes its own problems.
 *
 * CLAIMS DELIBERATELY AVOIDED HERE:
 *   · No "a dedicated machine for everyone, always". There are two nodes.
 *     Capacity promises are the ones that produce an angry first customer.
 *   · No "your files live permanently". Storage figures come from the live
 *     rate card and retention is a real, separate clock.
 */

import type { StorageTerms } from "@/lib/storage-terms";

export function BenefitsSection({ storage }: { storage: StorageTerms }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Row
        eyebrow="Everyone gets one"
        title={<>No more &ldquo;can I use<br />the GPU machine?&rdquo;</>}
        body="Most studios have one or two good workstations and a queue for them. Every person who needs GPU power opens Connect and starts their own session instead — so the deadline crunch stops being a scheduling problem."
        points={[
          "Each person works in their own session, at full speed",
          "Billed per minute, per person — you pay for hours actually worked",
          "Add capacity for a busy week, drop it when the project ships",
        ]}
        art={<TeamArt />}
      />

      <Row
        flip
        eyebrow="In front of the client"
        title={<>Stop saying<br />&ldquo;we&apos;ll come back tomorrow.&rdquo;</>}
        body="You're at a client's office, on a laptop, and they ask for a change. Today that means going back, rendering overnight and booking another meeting. With a workstation a click away, you make the change while you're still in the room."
        compare={{
          before: ["“Can we see it warmer?”", "“We'll render it tonight and come back Thursday.”"],
          after: ["“Can we see it warmer?”", "“Give me a few minutes.”"],
        }}
        art={<RenderArt />}
      />

      <Row
        eyebrow="Files"
        title={<>Upload once.<br /><Grad>Pick up where you stopped.</Grad></>}
        body="Your project files live on Coreframe storage in India, not on the workstation. Close a session on Monday, open one on Friday, and everything is where you left it — no copying scenes onto a drive, no re-uploading 40 GB."
        points={[
          `${storage.trialGb} GB free on every account, ${storage.paidGb} GB once you top up`,
          "Your files, not the machine's — the workstation itself resets clean between sessions",
          "Stored in India, on our own hardware",
        ]}
        art={<StorageArt />}
      />

      <Row
        flip
        eyebrow="Hiring"
        title={<>Hire the right person.<br /><Grad>Not the nearest one.</Grad></>}
        body="A good visualiser two states away doesn't need to relocate, and you don't need to ship them a workstation. They sign in to the same account, open the same project, and work on the same class of machine as everyone in the office."
        points={[
          "No hardware to buy, ship, insure or recover when someone leaves",
          "Contractors get access for a project and lose it cleanly at the end",
          "Company files never sit on a personal laptop",
        ]}
        art={<MapArt />}
      />
    </section>
  );
}

function Grad({ children }: { children: React.ReactNode }) {
  return (
    <span className="bg-gradient-to-r from-cyan-300 to-emerald-300 bg-clip-text text-transparent">
      {children}
    </span>
  );
}

function Row({
  eyebrow, title, body, points, compare, art, flip = false,
}: {
  eyebrow: string;
  title: React.ReactNode;
  body: string;
  points?: string[];
  compare?: { before: string[]; after: string[] };
  art: React.ReactNode;
  flip?: boolean;
}) {
  return (
    <div className="grid items-center gap-10 border-t border-white/10 py-14 lg:grid-cols-2 lg:gap-14">
      <div className={flip ? "lg:order-2" : undefined}>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">{eyebrow}</p>
        <h2 className="mt-4 text-3xl font-semibold leading-[1.12] tracking-[-0.025em] text-white sm:text-4xl">
          {title}
        </h2>
        <p className="mt-4 text-base leading-7 text-white/70">{body}</p>

        {points ? (
          <ul className="mt-6 flex flex-col gap-3">
            {points.map((p) => (
              <li key={p} className="flex gap-3 text-[15px] leading-6 text-white/70">
                <span aria-hidden className="mt-0.5 shrink-0 font-bold text-emerald-400">✓</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        ) : null}

        {compare ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-red-400/25 bg-red-400/[0.05] p-5">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-300">✕ Today</p>
              <p className="mt-3 text-[15px] leading-7 text-white/80">
                <em className="not-italic text-white/60">{compare.before[0]}</em>
                <br />
                {compare.before[1]}
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-400/35 bg-emerald-400/[0.06] p-5">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-300">✓ With Coreframe</p>
              <p className="mt-3 text-[15px] leading-7 text-white/80">
                <em className="not-italic text-white/60">{compare.after[0]}</em>
                <br />
                {compare.after[1]}
              </p>
            </div>
          </div>
        ) : null}
      </div>

      <div className={`flex min-h-[220px] items-center justify-center rounded-3xl border border-white/10 bg-white/[0.035] p-6 ${flip ? "lg:order-1" : ""}`}>
        {art}
      </div>
    </div>
  );
}

/* ── artwork ─────────────────────────────────────────────────────────────
   Inline SVG with real text at readable sizes. No raster images, so these
   stay crisp and cost nothing to load.                                     */

function TeamArt() {
  return (
    <svg viewBox="0 0 340 190" className="h-auto w-full max-w-[340px]" role="img" aria-label="Three team members each connecting to their own Coreframe session.">
      <g fontFamily="system-ui">
        {[["Designer", 18], ["Visualiser", 72], ["Intern", 126]].map(([label, y]) => (
          <g key={label as string}>
            <rect x="10" y={y as number} width="96" height="46" rx="9" fill="rgba(255,255,255,.05)" stroke="rgba(255,255,255,.18)" />
            <text x="58" y={(y as number) + 28} textAnchor="middle" fontSize="13.5" fill="#e8eef5">{label}</text>
          </g>
        ))}
        <line x1="112" y1="41" x2="196" y2="70" stroke="#22d3ee" strokeWidth="1.6" strokeDasharray="5 4" opacity=".6" />
        <line x1="112" y1="95" x2="196" y2="95" stroke="#22d3ee" strokeWidth="1.6" strokeDasharray="5 4" opacity=".6" />
        <line x1="112" y1="149" x2="196" y2="120" stroke="#22d3ee" strokeWidth="1.6" strokeDasharray="5 4" opacity=".6" />
        <rect x="200" y="56" width="128" height="78" rx="14" fill="rgba(34,211,238,.10)" stroke="#22d3ee" strokeWidth="1.8" />
        <text x="264" y="88" textAnchor="middle" fontSize="13.5" fill="#22d3ee" fontWeight="800" letterSpacing="1.6">COREFRAME</text>
        <text x="264" y="110" textAnchor="middle" fontSize="13" fill="#a8bccd">a session each</text>
      </g>
    </svg>
  );
}

function RenderArt() {
  return (
    <svg viewBox="0 0 320 180" className="h-auto w-full max-w-[320px]" role="img" aria-label="A laptop in a client meeting rendering on demand.">
      <g fontFamily="system-ui">
        <rect x="46" y="30" width="228" height="112" rx="12" fill="rgba(255,255,255,.05)" stroke="rgba(255,255,255,.2)" strokeWidth="1.6" />
        <rect x="30" y="142" width="260" height="15" rx="6" fill="rgba(255,255,255,.08)" stroke="rgba(255,255,255,.15)" />
        <rect x="62" y="46" width="196" height="80" rx="6" fill="rgba(34,211,238,.10)" stroke="rgba(34,211,238,.34)" />
        <text x="160" y="80" textAnchor="middle" fontSize="14" fill="#e8eef5" fontWeight="600">Rendering…</text>
        <rect x="92" y="94" width="136" height="9" rx="4.5" fill="rgba(34,211,238,.16)" />
        <rect x="92" y="94" width="40" height="9" rx="4.5" fill="#22d3ee">
          <animate attributeName="width" values="10;136;10" dur="3.2s" repeatCount="indefinite" />
        </rect>
        <text x="160" y="172" textAnchor="middle" fontSize="13.5" fill="#a8bccd">on the laptop already in the room</text>
      </g>
    </svg>
  );
}

function StorageArt() {
  return (
    <svg viewBox="0 0 320 180" className="h-auto w-full max-w-[320px]" role="img" aria-label="One upload, reused across many sessions.">
      <g fontFamily="system-ui">
        <rect x="14" y="62" width="66" height="56" rx="8" fill="rgba(52,211,153,.09)" stroke="rgba(52,211,153,.45)" strokeWidth="1.6" />
        <text x="47" y="95" textAnchor="middle" fontSize="13" fill="#e8eef5">Project</text>
        <line x1="86" y1="90" x2="128" y2="90" stroke="#34d399" strokeWidth="1.6" strokeDasharray="5 4" opacity=".7" />
        <ellipse cx="168" cy="90" rx="38" ry="30" fill="rgba(52,211,153,.09)" stroke="#34d399" strokeWidth="1.8" />
        <text x="168" y="87" textAnchor="middle" fontSize="13" fill="#34d399" fontWeight="700">Storage</text>
        <text x="168" y="104" textAnchor="middle" fontSize="12" fill="#a8bccd">in India</text>
        <line x1="208" y1="72" x2="248" y2="46" stroke="#22d3ee" strokeWidth="1.4" strokeDasharray="4 3" opacity=".6" />
        <line x1="208" y1="90" x2="248" y2="90" stroke="#22d3ee" strokeWidth="1.4" strokeDasharray="4 3" opacity=".6" />
        <line x1="208" y1="108" x2="248" y2="134" stroke="#22d3ee" strokeWidth="1.4" strokeDasharray="4 3" opacity=".6" />
        {[["Mon", 30, 51, "#a8bccd", ".09"], ["Fri", 74, 95, "#ffffff", ".15"], ["Next mo", 118, 139, "#a8bccd", ".09"]].map(([lbl, y, ty, fill, op]) => (
          <g key={lbl as string}>
            <rect x="250" y={y as number} width="60" height="32" rx="7" fill={`rgba(34,211,238,${op})`} stroke={fill === "#ffffff" ? "#22d3ee" : "rgba(34,211,238,.35)"} />
            <text x="280" y={ty as number} textAnchor="middle" fontSize="12.5" fill={fill as string}>{lbl}</text>
          </g>
        ))}
      </g>
    </svg>
  );
}

function MapArt() {
  return (
    <svg viewBox="0 0 300 190" className="h-auto w-full max-w-[300px]" role="img" aria-label="Team members in different cities connecting to one shared workspace.">
      <g fontFamily="system-ui">
        <circle cx="150" cy="95" r="66" fill="none" stroke="rgba(34,211,238,.26)" strokeWidth="1.5" />
        <ellipse cx="150" cy="95" rx="32" ry="66" fill="none" stroke="rgba(34,211,238,.15)" strokeWidth="1.2" />
        <line x1="84" y1="95" x2="216" y2="95" stroke="rgba(34,211,238,.18)" strokeWidth="1.2" />
        <circle cx="150" cy="95" r="17" fill="rgba(34,211,238,.16)" stroke="#22d3ee" strokeWidth="1.8" />
        <circle cx="150" cy="95" r="26" fill="none" stroke="#22d3ee" strokeWidth="1.2" opacity=".35">
          <animate attributeName="r" values="17;34;17" dur="3.2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values=".45;0;.45" dur="3.2s" repeatCount="indefinite" />
        </circle>
        {[["Pune", 62, 52, 16, 42], ["Delhi", 240, 46, 222, 34], ["Kochi", 250, 132, 230, 156], ["Jaipur", 54, 140, 12, 164]].map(([c, cx, cy, tx, ty]) => (
          <g key={c as string}>
            <circle cx={cx as number} cy={cy as number} r="6" fill="#34d399" />
            <text x={tx as number} y={ty as number} fontSize="13" fill="#a8bccd">{c}</text>
            <line x1={cx as number} y1={cy as number} x2="150" y2="95" stroke="rgba(34,211,238,.5)" strokeWidth="1.2" strokeDasharray="4 3" />
          </g>
        ))}
      </g>
    </svg>
  );
}
