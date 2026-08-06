import Link from "next/link";

function Arrow({ label }: { label?: string }) {
  return (
    <div className="flex shrink-0 flex-col items-center justify-center gap-1 px-3">
      <span className="text-base text-white/25">→</span>
      {label && (
        <span className="whitespace-nowrap text-[10px] leading-tight text-white/35">{label}</span>
      )}
    </div>
  );
}

function FlowNode({
  icon,
  label,
  sub,
  accent = "slate",
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
          : "border-white/12 bg-white/[0.04]";
  const labelColor =
    accent === "cyan"
      ? "text-cyan-200"
      : accent === "emerald"
        ? "text-emerald-200"
        : accent === "amber"
          ? "text-amber-200"
          : "text-white/75";

  return (
    <div className={`w-36 shrink-0 rounded-2xl border ${border} px-3 py-4 text-center`}>
      <div className="text-2xl">{icon}</div>
      <div className={`mt-2 text-sm font-semibold leading-tight ${labelColor}`}>{label}</div>
      {sub && <div className="mt-1 text-xs leading-tight text-white/38">{sub}</div>}
    </div>
  );
}

function TeamBlock() {
  return (
    <div className="w-36 shrink-0 flex flex-col gap-2">
      {[
        { icon: "👩‍💻", role: "Architect" },
        { icon: "👨‍💻", role: "Designer" },
        { icon: "🧑‍💻", role: "Renderer" },
      ].map((u) => (
        <div
          key={u.role}
          className="flex items-center gap-2 rounded-xl border border-white/12 bg-white/[0.04] px-3 py-2"
        >
          <span className="text-base">{u.icon}</span>
          <span className="text-sm font-medium text-white/65">{u.role}</span>
        </div>
      ))}
    </div>
  );
}

function InfoTile({ title, body, titleColor }: { title: string; body: string; titleColor: string }) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.02] px-4 py-4">
      <div className={`mb-1.5 text-xs font-semibold uppercase tracking-wider ${titleColor}`}>{title}</div>
      <div className="text-sm leading-6 text-white/50">{body}</div>
    </div>
  );
}

export function WorkflowSection() {
  return (
    <section id="how-it-works" className="border-b border-white/10">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:py-14">

        <div className="cf-eyebrow">How it works</div>
        <h2 className="mt-4 cf-section-title">Two models. One platform.</h2>
        <p className="mt-4 cf-section-copy max-w-2xl">
          Ad-hoc sessions for one-off renders. Committed plans for studios where projects live
          on shared storage and the whole team picks up where anyone left off.
        </p>

        {/* ── B2B Committed ── */}
        <div className="mt-8">
          <div className="mb-4 flex items-center gap-3">
            <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-300">
              Studio · Committed plan
            </span>
            <span className="text-sm text-white/38">From ₹339/GPU-hr · Persistent NAS storage</span>
          </div>

          <div className="rounded-[24px] border border-cyan-400/15 bg-cyan-400/[0.02] p-6 md:p-8">
            <div className="overflow-x-auto">
              <div className="flex min-w-max items-center">
                <TeamBlock />
                <Arrow label="each logs in" />
                <FlowNode icon="🖥️" label="GPU Workstation" sub="RTX 5080 · Windows" accent="cyan" />
                <Arrow label="reads & writes" />
                <FlowNode icon="🗄️" label="NAS Storage" sub="2–10 TB · always on" accent="cyan" />
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <InfoTile title="Projects persist" titleColor="text-cyan-300" body="Scene files, assets, and renders stay on NAS after any session ends. No re-uploading." />
              <InfoTile title="Any user, anytime" titleColor="text-cyan-300" body="Designer uploads assets. Renderer picks up the same project immediately, no handoff needed." />
              <InfoTile title="Named seats" titleColor="text-cyan-300" body="5–25 named render seats. D5, Lumion, Enscape BYOL licences activate on each user's account." />
            </div>

            <div className="mt-4 text-xs text-white/28">
              Session ends → workstation shuts down → storage untouched → next user picks up where you left off
            </div>
          </div>
        </div>

        {/* ── Ad-hoc ── */}
        <div className="mt-5">
          <div className="mb-4 flex items-center gap-3">
            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-300">
              Ad-hoc · Pay-as-you-go
            </span>
            <span className="text-sm text-white/38">₹399/GPU-hr · No commitment</span>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-6 md:p-8">
            <div className="overflow-x-auto">
              <div className="flex min-w-max items-center">
                <FlowNode icon="🧑‍🎨" label="You" sub="one user" accent="slate" />
                <Arrow label="launch" />
                <FlowNode icon="🖥️" label="GPU Workstation" sub="RTX 5080 · Windows" accent="emerald" />
                <Arrow label="render to" />
                <FlowNode icon="⚡" label="NVMe Scratch" sub="50 GB · session only" accent="amber" />
                <Arrow label="download & done" />
                <FlowNode icon="💾" label="Your machine" sub="results saved locally" accent="slate" />
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <InfoTile title="No setup" titleColor="text-emerald-300" body="Launch a workstation, install your app, render. Ready in under 2 minutes. No contract." />
              <InfoTile title="Session storage" titleColor="text-amber-300" body="50 GB NVMe scratch for the duration. Download before shutting down — scratch is cleared on session end." />
              <InfoTile title="Charged by the hour" titleColor="text-emerald-300" body="Pay only for active GPU hours. Shut down when done and billing stops. No hidden charges." />
            </div>

            <div className="mt-4 text-xs text-white/28">
              Session ends → workstation destroyed → scratch cleared → billing stops
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="/signup" className="cf-btn-primary">Get started</Link>
          <Link href="/enterprise" className="cf-btn-secondary">See committed plans</Link>
        </div>

      </div>
    </section>
  );
}
