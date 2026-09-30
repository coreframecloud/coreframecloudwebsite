import type { Metadata } from "next";
import { BackgroundGlow } from "@/components/home/background-glow";
import { PricingCards } from "@/components/pricing/pricing-cards";
import { getRateCard, pricingFaqAnswer } from "@/lib/rate-card";
import { NODE, WORKSTATION_REPLACEMENT_COST } from "@/lib/node-spec";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Enscape Cloud GPU Workstation — RTX 5080, India",
  description:
    "Run Enscape on an RTX 5080 cloud workstation in India. Real-time architectural visualisation on the GPU, billed per minute with GST included. BYOL — bring your Enscape subscription.",
  keywords: [
    "Enscape cloud GPU India",
    "Enscape cloud rendering India",
    "Enscape cloud workstation",
    "cloud GPU for Enscape",
    "Enscape RTX cloud India",
    "Enscape Revit cloud GPU",
    "Enscape SketchUp cloud",
  ],
  alternates: { canonical: "/enscape-cloud-gpu" },
};

/**
 * Hardware comes from lib/node-spec and nowhere else. The hand-typed array
 * this replaced sold remote-desktop access as a feature, which is wrong twice
 * over: the machine is reached through the Coreframe Connect app, and remote
 * desktop is the thing the homepage positions against.
 */
const SPECS: [string, string][] = [
  ["GPU", NODE.gpu],
  ["VRAM", `${NODE.vram} · ${NODE.memoryBandwidth}`],
  ["System RAM", NODE.ram],
  ["CPU", NODE.cpu],
  ["Disk", NODE.disk],
  ["OS", NODE.os],
  ["Access", `Coreframe Connect app, streamed at ${NODE.stream}`],
  ["Display driver", "WDDM, which Enscape requires"],
  ["Host apps", "Revit, SketchUp, Rhino, Archicad"],
  ["Location", NODE.location],
];

export default async function EnscapePage() {
  const card = await getRateCard();
  const priceAnswer = pricingFaqAnswer(card);

  const faqs: { q: string; a: string }[] = [
    {
      q: "Does Enscape work on a cloud GPU?",
      a: `Yes, on a card with a WDDM display driver and RT cores. A Coreframe workstation is a ${NODE.os} machine with a consumer ${NODE.gpu} and the full WDDM driver, so Enscape installs, finds the RT cores and ray-traces the way it does on a desktop machine. You reach it through the Coreframe Connect app, streamed at ${NODE.stream}.`,
    },
    {
      q: "Can I use Enscape with Revit or SketchUp on a cloud workstation?",
      a: "Yes. Enscape is a plugin, so install its host application first — Revit, SketchUp, Rhino or Archicad — then Enscape on top, and work exactly as you would locally. Both sign in with your own accounts.",
    },
    {
      q: "What is in the workstation?",
      a: `${NODE.gpu} with ${NODE.vram}, ${NODE.ram} of system memory, ${NODE.cpu} and ${NODE.disk}, running ${NODE.os} in ${NODE.location}. One customer per node — the card is not shared and not sliced into a virtual GPU.`,
    },
    {
      q: "Do I need my own Enscape licence?",
      a: "Yes — Enscape is bring your own licence. Sign in to your Enscape account on the workstation to activate your named-user or floating seat. Coreframe charges for GPU-hours and nothing else.",
    },
    ...(priceAnswer
      ? [{ q: "How much does an Enscape cloud workstation cost in India?", a: priceAnswer }]
      : []),
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div className="relative min-h-screen text-ink">
      <BackgroundGlow />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="relative">
        <section className="cf-section px-5">
          <div className="cf-col">
            <p className="cf-eyebrow mb-5">Enscape · Cloud GPU · Bengaluru</p>
            <h1 className="cf-display">
              Run Enscape on an RTX 5080.
              <br className="hidden md:block" /> Ray tracing included.
            </h1>
            <p className="cf-lead mt-[22px]">
              Enscape ray-traces in real time, which asks for VRAM and RT cores
              the modelling laptop does not have. Start a Windows workstation with
              an RTX&nbsp;5080, install Revit or SketchUp and Enscape on top, and
              walk the client through the building while your own machine stays
              free.
            </p>
            <p className="cf-section-copy mt-5">
              You reach it through the Coreframe Connect app, streamed at{" "}
              {NODE.stream}. The viewport moves when you move the mouse, which is
              the whole point of a real-time renderer.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup" className="cf-btn-primary">
                Start a session
              </Link>
              <Link href="/enterprise" className="cf-btn-secondary">
                Studio plans
              </Link>
            </div>
          </div>
        </section>

        <section className="cf-section px-5 pt-0">
          <div className="cf-wide">
            <h2 className="cf-section-title">Why this card for Enscape.</h2>
            <div className="mt-9 grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
              {[
                {
                  title: "RT cores, not emulation",
                  body: "Enscape's ray-traced reflections, shadows and global illumination run on the dedicated RT cores of the RTX 5080 — the same silicon a local RTX machine uses for them.",
                },
                {
                  title: "Your host app, same desktop",
                  body: "Install Revit, SketchUp, Rhino or Archicad on the same workstation. Enscape plugs into it exactly as it does locally, because it is an ordinary Windows desktop.",
                },
                {
                  title: "No machine to buy",
                  body: `A workstation that renders comfortably lands at about ${WORKSTATION_REPLACEMENT_COST} in India, gets bought once, and sits idle the three weeks after the presentation it was bought for. Renting means the machine exists when the deadline does.`,
                },
              ].map((c) => (
                <div key={c.title} className="cf-card">
                  <p className="cf-card-label">{c.title}</p>
                  <p className="cf-section-copy">{c.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="cf-section px-5 pt-0">
          <div className="cf-wide">
            <h2 className="cf-section-title">The machine.</h2>
            <dl className="mt-8 overflow-hidden rounded-cf border border-rule bg-paper-2">
              {SPECS.map(([k, v], i) => (
                <div
                  key={k}
                  className={`flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6 ${
                    i > 0 ? "border-t border-rule" : ""
                  }`}
                >
                  <dt className="text-sm text-ink-2">{k}</dt>
                  <dd className="text-sm font-medium break-words text-ink sm:text-right">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="cf-section-copy mt-5">
              One node, one GPU, one customer at a time. The comparison worth
              making is VRAM: {NODE.vram} against the 6 to 8 GB in most laptops
              sold for design work, and VRAM is what decides whether a scene loads
              at full texture resolution or has to be cut down.
            </p>
          </div>
        </section>

        <section className="cf-section px-5 pt-0">
          <div className="cf-wide">
            <h2 className="cf-section-title">What it costs.</h2>
            <PricingCards
              card={card}
              adhocNote="20 GB persistent storage free, 50 GB once you add credit. Session scratch is cleared when the session ends."
            />
            <div className="cf-note mt-8">
              <p className="cf-section-copy">
                <span className="font-semibold text-ink">
                  The Enscape licence is yours to bring.
                </span>{" "}
                Sign in to your Enscape account on the workstation to activate your
                seat. Named-user and floating both work. All prices include 18%
                GST — what you see is what you pay, and a GST invoice showing the
                taxable value and the tax split is issued.
              </p>
            </div>
          </div>
        </section>

        <section className="cf-section px-5 pt-0">
          <div className="cf-col">
            <h2 className="cf-section-title">Questions.</h2>
            <div className="mt-8 space-y-7">
              {faqs.map((f) => (
                <div key={f.q}>
                  <h3 className="font-semibold text-ink">{f.q}</h3>
                  <p className="cf-section-copy mt-2 break-words">{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="cf-section px-5 pt-0">
          <div className="cf-col">
            <div className="cf-rule" />
            <ul className="mt-8 space-y-1">
              {[
                ["/", "Home"],
                ["/d5-render-cloud-workstation", "D5 Render on a cloud RTX 5080"],
                ["/lumion-cloud-gpu", "Lumion on a cloud RTX 5080"],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="inline-flex min-h-[44px] items-center text-blue hover:underline"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
