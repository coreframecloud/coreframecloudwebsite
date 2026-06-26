import Link from "next/link";

/* ── shared node component ── */
function Node({
  icon,
  label,
  sub,
  accent,
}: {
  icon: string;
  label: string;
  sub?: string;
  accent?: "cyan" | "emerald" | "amber" | "slate";
}) {
  const border =
    accent === "cyan"
      ? "border-cyan-400/30 bg-cyan-400/[0.05]"
      : accent === "emerald"
        ? "border-emerald-400/30 bg-emerald-400/[0.05]"
        : accent === "amber"
          ? "border-amber-400/30 bg-amber-400/[0.05]"
          : "border-white/10 bg-white/[0.03]";
  const text =
    accent === "cyan"
      ? "text-cyan-200"
      : accent === "emerald"
        ? "text-emerald-200"
        : accent === "amber"
          ? "text-amber-200"
          : "text-white/70";

  return (
    <div className={`rounded-2xl border ${border} px-4 py-3 text-center`}>
      <div className="text-2xl">{icon}</div>
      <div className={`mt-1 text-xs font-semibold ${text}`}>{label}</div>
      {sub && <div className="mt-0.5 text-[10px] text-white/35">{sub}</div>}
    </div>
  );
}

function Arrow({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 px-1">
      <div className="text-white/20 text-lg">→</div>
      {label && <div className="text-[9px] text-white/30 text-center leading-tight">{label}</div>}
    </div>
  );
}

export function WorkflowSection() {
  return (
    <section id="how-it-works" className="border-b border-white/10">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:py-14">

        <div className="cf-eyebrow">How it works</div>
        <h2 className="mt-4 cf-section-title">
          Two models. One platform.
        </h2>
        <p className="mt-5 cf-section-copy max-w-2xl">
          Ad-hoc sessions for one-off renders. Committed plans for studios where
          projects live on shared storage and the whole team picks up where anyone left off.
        </p>

        {/* ── B2B Committed ── */}
        <div className="mt-8">
          <div className="flex items-center gap-3 mb-5">
            <span className="rounded-full bg-cyan-400/10 border border-cyan-400/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-300">
              Studio / Committed plan
            </span>
            <span className="text-xs text-white/35">₹250/GPU-hr · Persistent NAS storage</span>
          </div>

          <div className="rounded-[24px] border border-cyan-400/15 bg-cyan-400/[0.02] p-6 md:p-8">
            {/* Users row */}
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2 mb-4">
              <div className="flex gap-2">
                <Node icon="👩‍💻" label="Architect" sub="User 1" accent="slate" />
                <Node icon="👨‍💻" label="Designer" sub="User 2" accent="slate" />
                <Node icon="🧑‍💻" label="Renderer" sub="User 3" accent="slate" />
              </div>
              <div className="flex items-center gap-2 sm:contents">
                <Arrow label="each logs in" />
                <div className="flex-1 min-w-[140px]">
                  <Node icon="🖥️" label="GPU Workstation" sub="RTX 5070 Ti · Windows" accent="cyan" />
                </div>
                <Arrow label="reads & writes" />
                <div className="flex-1 min-w-[140px]">
                  <Node icon="🗄️" label="NAS Storage" sub="2–10 TB · always on" accent="cyan" />
                </div>
              </div>
            </div>

            {/* What persists */}
            <div className="mt-4 grid gap-3 sm:grid-cols-3 text-sm">
              <div className="rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3">
                <div className="text-cyan-300 font-semibold text-xs uppercase tracking-wider mb-1">Projects persist</div>
                <div className="text-white/50 text-xs leading-5">Scene files, assets, and renders stay on NAS after any session ends. No re-uploading.</div>
              </div>
              <div className="rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3">
                <div className="text-cyan-300 font-semibold text-xs uppercase tracking-wider mb-1">Any user, anytime</div>
                <div className="text-white/50 text-xs leading-5">Designer uploads assets. Renderer picks up the same project immediately, no handoff needed.</div>
              </div>
              <div className="rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3">
                <div className="text-cyan-300 font-semibold text-xs uppercase tracking-wider mb-1">Named seats</div>
                <div className="text-white/50 text-xs leading-5">5–25 named render seats. Each seat maps to one user — D5, Lumion, Enscape BYOL licences activate normally.</div>
              </div>
            </div>

            <div className="mt-4 text-xs text-white/30">
              Session ends → workstation shuts down → storage untouched → next user picks up where you left off
            </div>
          </div>
        </div>

        {/* ── B2C Ad-hoc ── */}
        <div className="mt-5">
          <div className="flex items-center gap-3 mb-5">
            <span className="rounded-full bg-emerald-400/10 border border-emerald-400/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-300">
              Ad-hoc · Pay-as-you-go
            </span>
            <span className="text-xs text-white/35">₹400/GPU-hr · No commitment</span>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-6 md:p-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2 mb-4">
              <div className="flex items-center gap-2">
                <Node icon="🧑‍🎨" label="You" sub="one user" accent="slate" />
                <Arrow label="launch" />
                <div className="flex-1 min-w-[120px]">
                  <Node icon="🖥️" label="GPU Workstation" sub="RTX 5070 Ti · Windows" accent="emerald" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Arrow label="render to" />
                <div className="flex-1 min-w-[120px]">
                  <Node icon="⚡" label="NVMe Scratch" sub="50 GB · session only" accent="amber" />
                </div>
                <Arrow label="download & done" />
                <Node icon="💾" label="Your machine" sub="results saved locally" accent="slate" />
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3 text-sm">
              <div className="rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3">
                <div className="text-emerald-300 font-semibold text-xs uppercase tracking-wider mb-1">No setup</div>
                <div className="text-white/50 text-xs leading-5">Launch a workstation, install your app, render. Ready in under 2 minutes. No contract.</div>
              </div>
              <div className="rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3">
                <div className="text-amber-300 font-semibold text-xs uppercase tracking-wider mb-1">Session storage</div>
                <div className="text-white/50 text-xs leading-5">50 GB NVMe scratch for the duration. Download your outputs before shutting down — scratch is cleared on session end.</div>
              </div>
              <div className="rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3">
                <div className="text-emerald-300 font-semibold text-xs uppercase tracking-wider mb-1">Charged by the hour</div>
                <div className="text-white/50 text-xs leading-5">Pay only for active GPU hours. Shut down when done and billing stops. No hidden charges.</div>
              </div>
            </div>

            <div className="mt-4 text-xs text-white/30">
              Session ends → workstation destroyed → scratch cleared → billing stops
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="/signup" className="cf-btn-primary">
            Get started
          </Link>
          <Link href="/enterprise" className="cf-btn-secondary">
            See committed plans
          </Link>
        </div>

      </div>
    </section>
  );
}
