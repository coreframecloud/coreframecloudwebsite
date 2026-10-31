import { publicGpus, type RateCard } from "@/lib/rate-card";

/**
 * Infographics for the GPU workstations page (owner, 31 Oct 2026: "shorten
 * it, collapse all answers, introduce infographics, phone friendly").
 * Server components; every figure comes from the live rate card.
 */

const ICONS = {
  signup: (
    <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0" />
  ),
  pick: (
    <>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M7 10h4M7 14h2M15 10v4" />
    </>
  ),
  work: (
    <>
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8M12 16v4" />
    </>
  ),
};

/** Sign up -> pick a GPU -> work, as three icon tiles in one row. */
export function HowItWorksStrip({ className = "" }: { className?: string }) {
  const steps: { k: keyof typeof ICONS; title: string; line: string }[] = [
    { k: "signup", title: "Sign up", line: "Email and a one-time code" },
    { k: "pick", title: "Pick a GPU", line: "In the Coreframe app" },
    { k: "work", title: "Work", line: "Your Windows desktop, streamed" },
  ];
  return (
    <ol className={`grid grid-cols-3 gap-2.5 sm:gap-5 ${className}`}>
      {steps.map((s, i) => (
        <li key={s.k} className="relative flex min-w-0 flex-col items-center rounded-[20px] border border-white/12 bg-white/6 px-2 py-4 text-center sm:px-5 sm:py-6">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-hl text-ink sm:h-14 sm:w-14">
            <svg viewBox="0 0 24 24" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              {ICONS[s.k]}
            </svg>
          </span>
          <span className="mt-2.5 text-[13px] font-semibold tracking-[0.04em] text-white/70 uppercase">Step {i + 1}</span>
          <strong className="mt-0.5 font-heading text-[16px] leading-tight font-medium text-white sm:text-[19px]">{s.title}</strong>
          <span className="mt-1 text-[13px] leading-[1.35] text-white/80 sm:text-[14px]">{s.line}</span>
        </li>
      ))}
    </ol>
  );
}

/**
 * GPU memory as bars: one bar per VRAM size on the public ladder, with the
 * cards that have it. The same cards, in the same order, as the list below.
 */
export function MemoryLadder({ card, className = "" }: { card: RateCard | null; className?: string }) {
  const gpus = publicGpus(card);
  if (!gpus.length) return null;
  const sizes = [...new Set(gpus.map((g) => g.vram_gb))].sort((a, b) => a - b);
  const max = sizes[sizes.length - 1];
  return (
    <figure className={className}>
      <figcaption className="text-[13px] font-semibold tracking-[0.08em] text-ink-2 uppercase">GPU memory by card</figcaption>
      <ul className="mt-3 space-y-2.5">
        {sizes.map((v) => {
          const names = gpus.filter((g) => g.vram_gb === v).map((g) => g.name);
          return (
            <li key={v} className="grid grid-cols-[4.2rem_minmax(0,1fr)] items-center gap-3">
              <span className="font-heading text-[19px] leading-none font-semibold text-ink tabular-nums">{v} GB</span>
              <span className="min-w-0">
                <span
                  className="block h-3 rounded-full bg-blue"
                  style={{ width: `${Math.max(14, Math.round((v / max) * 100))}%` }}
                  aria-hidden
                />
                <span className="mt-1 block text-[13px] leading-snug text-ink-2">{names.join(" · ")}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </figure>
  );
}
