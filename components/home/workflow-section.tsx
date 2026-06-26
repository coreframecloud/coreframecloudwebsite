import Link from "next/link";

function Arrow({ label }: { label?: string }) {
  return (
    <div className="flex shrink-0 flex-col items-center justify-center gap-1 px-2">
      <span className="text-sm text-white/20">→</span>
      {label && (
        <span className="whitespace-nowrap text-[9px] leading-tight text-white/28">{label}</span>
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
          : "border-white/10 bg-white/[0.03]";
  const labelColor =
    accent === "cyan"
      ? "text-cyan-200"
      : accent === "emerald"
        ? "text-emerald-200"
        : accent === "amber"
          ? "text-amber-200"
          : "text-white/65";

  return (
    <div className={`w-32 shrink-0 rounded-2xl border ${border} px-3 py-3 text-center`}>
      <div className="text-xl">{icon}</div>
      <div className={`mt-1 text-[11px] font-semibold leading-tight ${labelColor}`}>{label}</div>
      {sub && <div className="mt-0.5 text-[9px] leading-tight text-white/30">{sub}</div>}
    </div>
  );
}

function TeamBlock() {
  return (
    <div className="w-32 shrink-0 flex flex-col gap-1.5">
      {[
        { icon: "👩‍💻", role: "Architect" },
        { icon: "👨‍💻", role: "Designer" },
        { icon: "🧑‍💻", role: "Renderer" },
      ].map((u) => (
        <div
          key={u.role}
          className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-2.5 py-1.5"
        >
          <span className="text-sm">{u.icon}</span>
          <span className="text-[11px] font-medium text-white/55">{u.role}</span>
        </div>
      ))}
    </div>
  );
}

function InfoTile({ title, body, titleColor }: { title: string; body: string; titleColor: string }) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3">
      <div className={`mb-1 text-[10px] font-semibold uppercase tracking-wider ${titleColor}`}>{title}</div>
      <div className="text-xs leading-5 text-white/48">{body}</div>
    </div>
  );
}

const steps = [
  { n: "01", title: "Create your account", body: "Sign up and add wallet credit. Takes under 2 minutes." },
  { n: "02", title: "Launch a workstation", body: "One click spins up an RTX 5070 Ti Windows machine with full WDDM driver." },
  { n: "03", title: "Install your app & licence", body: "Install D5 Render, Lumion, or Enscape. Sign in with your named-user account — BYOL, activates instantly." },
  { n: "04", title: "Upload your project", body: "Transfer scene files to the workstation over our encrypted storage layer. 1 Gbps link." },
  { n: "05", title: "Render at full speed", body: "GPU ray tracing, DLSS, real-time path tracing. 3–5× faster than a mid-range local GPU." },
  { n: "06", title: "Download & shut down", body: "Save outputs to your machine. End the session. Charged per full GPU-hour. No idle billing." },
];

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
            <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-cyan-300">
              Studio · Committed plan
            </span>
            <span className="text-xs text-white/35">₹250/GPU-hr · Persistent NAS storage</span>
          </div>

          <div className="rounded-[24px] border border-cyan-400/15 bg-cyan-400/[0.02] p-5 md:p-7">
            <div className="overflow-x-auto">
              <div className="flex min-w-max items-center">
                <TeamBlock />
                <Arrow label="each logs in" />
                <FlowNode icon="🖥️" label="GPU Workstation" sub="RTX 5070 Ti · Windows" accent="cyan" />
                <Arrow label="reads & writes" />
                <FlowNode icon="🗄️" label="NAS Storage" sub="2–10 TB · always on" accent="cyan" />
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <InfoTile title="Projects persist" titleColor="text-cyan-300" body="Scene files, assets, and renders stay on NAS after any session ends. No re-uploading." />
              <InfoTile title="Any user, anytime" titleColor="text-cyan-300" body="Designer uploads assets. Renderer picks up the same project immediately, no handoff needed." />
              <InfoTile title="Named seats" titleColor="text-cyan-300" body="5–25 named render seats. D5, Lumion, Enscape BYOL licences activate normally." />
            </div>
            <div className="mt-4 text-[10px] text-white/25">
              Session ends → workstation shuts down → storage untouched → next user picks up where you left off
            </div>
          </div>
        </div>

        {/* ── Ad-hoc ── */}
        <div className="mt-4">
          <div className="mb-4 flex items-center gap-3">
            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-300">
              Ad-hoc · Pay-as-you-go
            </span>
            <span className="text-xs text-white/35">₹400/GPU-hr · No commitment</span>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5 md:p-7">
            <div className="overflow-x-auto">
              <div className="flex min-w-max items-center">
                <FlowNode icon="🧑‍🎨" label="You" sub="one user" accent="slate" />
                <Arrow label="launch" />
                <FlowNode icon="🖥️" label="GPU Workstation" sub="RTX 5070 Ti · Windows" accent="emerald" />
                <Arrow label="render to" />
                <FlowNode icon="⚡" label="NVMe Scratch" sub="50 GB · session only" accent="amber" />
                <Arrow label="download & done" />
                <FlowNode icon="💾" label="Your machine" sub="results saved locally" accent="slate" />
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <InfoTile title="No setup" titleColor="text-emerald-300" body="Launch a workstation, install your app, render. Ready in under 2 minutes. No contract." />
              <InfoTile title="Session storage" titleColor="text-amber-300" body="50 GB NVMe scratch for the duration. Download before shutting down — scratch is cleared on session end." />
              <InfoTile title="Charged by the hour" titleColor="text-emerald-300" body="Pay only for active GPU hours. Shut down when done and billing stops. No hidden charges." />
            </div>
            <div className="mt-4 text-[10px] text-white/25">
              Session ends → workstation destroyed → scratch cleared → billing stops
            </div>
          </div>
        </div>

        {/* ── 6-step walkthrough ── */}
        <div className="mt-10">
          <div className="cf-eyebrow">Step by step</div>
          <h3 className="mt-3 text-xl font-semibold text-white">From sign-up to render in under 5 minutes</h3>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n} className="rounded-2xl border border-white/8 bg-white/[0.02] p-5">
                <div className="text-xs font-bold text-white/20 mb-2">{s.n}</div>
                <div className="text-sm font-semibold text-white">{s.title}</div>
                <p className="mt-1.5 text-xs leading-5 text-white/48">{s.body}</p>
              </div>
            ))}
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
