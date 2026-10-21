import type { Currency } from "@/lib/money";
import { StreamDiagram } from "@/components/visuals/diagrams";
import { ViewContent } from "@/components/analytics/view-content";
import { PageHeroBg } from "@/components/page-hero-bg";
import { GpuCineBand } from "@/components/gpu-cine-band";
import { GPU_HEROES } from "@/lib/gpu-heroes";
import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbList } from "@/lib/seo";
import { BackgroundGlow } from "@/components/home/background-glow";
import { PricingCards } from "@/components/pricing/pricing-cards";
import { getRateCard, ladderPhrase, ladderRanges, pricingFaqAnswer, taxSentence } from "@/lib/rate-card";
import { GpuLadder } from "@/components/pricing/gpu-ladder";
import { storageTerms } from "@/lib/storage-terms";
import { NODE, replacementCost } from "@/lib/node-spec";
import Link from "next/link";
import { LastUpdated, SpecTable } from "@/components/gpu/spec-table";

export function enscapeMetadata(currency: Currency): Metadata {
  const usdView = currency === "USD";
  return {
  title: "Enscape GPU Workstation, by the minute",
  description:
    `Run Enscape on a GPU workstation in India, with Revit, SketchUp or Rhino on the same desktop. Billed per minute, ${usdView ? "in US dollars, no GST" : "GST included"}. Your own licence.`,
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
}

/**
 * Hardware comes from lib/node-spec and nowhere else. The hand-typed array
 * this replaced sold remote-desktop access as a feature, which is wrong twice
 * over: the machine is reached through the Coreframe Connect app, and remote
 * desktop is the thing the homepage positions against.
 */
/** The GPU, VRAM, CPU and RAM rows come from the live rate card's ladder
 *  (ladderSpecRows; owner, 21 Oct 2026); the rest are fixed facts of every node. */
const FIXED_SPECS: [string, string][] = [
  ["Disk", NODE.disk],
  ["OS", NODE.os],
  ["Access", `Coreframe Connect app, streamed at ${NODE.stream}`],
  ["Display driver", "WDDM, which Enscape requires"],
  ["Host apps", "Revit, SketchUp, Rhino, Archicad"],
  ["Location", NODE.location],
];

/** VRAM is the number to compare (13 Oct audit: as a real table, not prose). */
const vramCompare = (vram: string): [string, string][] => [
  ["Coreframe workstations", vram],
  ["Many laptops and entry desktops sold for design work", "6 to 8 GB"],
];

export default async function EnscapeView({ currency }: { currency: Currency }) {
  const card = await getRateCard();
  const storage = storageTerms(card);
  const priceAnswer = pricingFaqAnswer(card, currency);
  const machineCost = replacementCost(currency);
  const ladder = ladderRanges(card);
  const vram = ladder?.vram ?? NODE.vram;

  const faqs: { q: string; a: string }[] = [
    {
      q: "Does Enscape work on a cloud GPU?",
      a: `Yes, on a card with a WDDM display driver and RT cores. A Coreframe workstation is a ${NODE.os} machine with a dedicated NVIDIA RTX GPU and the full WDDM driver, so Enscape installs, finds the RT cores and ray-traces the way it does on a desktop machine. You reach it through the Coreframe Connect app, streamed at ${NODE.stream}.`,
    },
    {
      q: "Can I use Enscape with Revit or SketchUp on a cloud workstation?",
      a: "Yes. Enscape is a plugin, so install its host application first (Revit, SketchUp, Rhino or Archicad), then Enscape on top, and work the way you would locally. Both sign in with your own accounts.",
    },
    {
      q: "What is in the workstation?",
      a: `${ladderPhrase(card) ? `${ladderPhrase(card)!.charAt(0).toUpperCase()}${ladderPhrase(card)!.slice(1)}` : "A dedicated NVIDIA RTX GPU"}, with ${NODE.disk}, running ${NODE.os} in ${NODE.location}. The GPUs on offer and their prices are on the pricing page. One customer per node. Nobody shares the card, and it isn't sliced into a virtual GPU.`,
    },
    {
      q: "Do I need my own Enscape licence?",
      a: "Yes, Enscape is bring your own licence. Sign in to your Enscape account on the workstation to activate your named-user or floating seat. Coreframe only charges for GPU-hours.",
    },
    ...(priceAnswer
      ? [{ q: currency === "USD" ? "How much does an Enscape cloud workstation cost?" : "How much does an Enscape cloud workstation cost in India?", a: priceAnswer }]
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
      <ViewContent name="Enscape cloud GPU workstation" category="workstation" />
      <JsonLd data={breadcrumbList([{ name: "Enscape cloud GPU workstation", path: "/enscape-cloud-gpu" }])} />
      <BackgroundGlow />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="cf-gpu-page relative">
        <section className="cf-section px-5 cf-pagehero">
          <PageHeroBg image={GPU_HEROES["enscape-cloud-gpu"]} />
          <div className="cf-wide">
          <div className="min-w-0 max-w-[620px]">
            <p className="cf-eyebrow mb-5">Enscape · Cloud GPU · Bengaluru</p>
            <h1 className="cf-display">
              Run Enscape on a GPU workstation.
              <br className="hidden md:block" /> Ray tracing included.
            </h1>
            <p className="cf-lead mt-[22px]">
            Enscape needs VRAM your modelling laptop doesn&rsquo;t have. Run it on a workstation-class RTX GPU and walk the client through the building.
          </p>
            <p className="cf-section-copy mt-5">
              You reach it through the Coreframe Connect app, streamed at{" "}
              {NODE.stream}. The viewport moves when you move the mouse, which is
              what you want from a real-time renderer.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup" className="cf-btn-primary">
                Start a session
              </Link>
              <Link href="/enterprise" className="cf-btn-secondary">
                Team plans
              </Link>
            </div>
            <LastUpdated date="18 October 2026" path="/enscape-cloud-gpu" className="mt-6" />
          </div>
        </div>
        </section>
      <section className="cf-section px-5 pb-0">
        <div className="cf-wide grid items-center gap-8 cf-cine cf-cine--panel p-6 sm:p-10 lg:grid-cols-[0.8fr_1.2fr]">
          <h2 className="cf-section-title">Enscape runs here. You see it there.</h2>
          <div className="min-w-0"><StreamDiagram /></div>
        </div>
      </section>

        {/* Cinema band (owner, 16 Oct 2026): the hero's look carried down the page. */}
        <GpuCineBand className="mb-16 sm:mb-20" page="enscape-cloud-gpu">
          <div className="cf-wide">
            <h2 className="cf-section-title">Why this card for Enscape.</h2>
            <div className="mt-9 grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
              {[
                {
                  title: "Real RT cores",
                  body: "Enscape's ray-traced reflections, shadows and global illumination run on the GPU's dedicated RT cores, the same silicon a local RTX machine uses.",
                },
                {
                  title: "Your host app, same desktop",
                  body: "Install Revit, SketchUp, Rhino or Archicad on the same workstation. Enscape plugs into it the same way it does locally. It's an ordinary Windows desktop.",
                },
                {
                  title: "No machine to buy",
                  body: `A workstation that renders comfortably costs about ${machineCost}${currency === "USD" ? "" : " in India"}. You buy it once, and then it sits idle for the three weeks after the presentation you bought it for. Rent one and it's there when the deadline is.`,
                },
              ].map((c) => (
                <div key={c.title} className="cf-card">
                  <p className="cf-card-label">{c.title}</p>
                  <p className="cf-section-copy">{c.body}</p>
                </div>
              ))}
            </div>
          </div>
        </GpuCineBand>

        <section className="cf-section px-5 pt-0">
          <div className="cf-wide">
            <h2 className="cf-section-title">The machine.</h2>
            {/* The GPU ladder from the live rate card (owner, 21 Oct 2026). */}
            <div className="mt-6"><GpuLadder card={card} currency={currency} compact /></div>
            <SpecTable rows={FIXED_SPECS} caption="The Enscape workstation: hardware and access" />
            <SpecTable rows={vramCompare(vram)} caption="VRAM compared" showCaption />
            <p className="cf-section-copy mt-5">
              Each node has one GPU and one customer at a time. The number to
              compare is VRAM: {vram}, against the 6 to 8 GB in most laptops
              sold for design work. VRAM decides whether a scene loads at full
              texture resolution or has to be cut down.
            </p>
          </div>
        </section>

        <section className="cf-section px-5 pt-0">
          <div className="cf-wide">
            <h2 className="cf-section-title">What it costs.</h2>
            <PricingCards
              card={card}
              currency={currency}
              adhocNote={`${storage.paidGb} GB of persistent storage included, kept while your account is active. Session scratch is cleared when the session ends.`}
            />
            <div className="cf-note mt-8">
              <p className="cf-section-copy">
                <span className="font-semibold text-ink">
                  The Enscape licence is yours to bring.
                </span>{" "}
                Sign in to your Enscape account on the workstation to activate your
                seat. Named-user and floating both work. {taxSentence(currency)}
              </p>
            </div>
            <p className="mt-5 text-[15px] leading-6 text-ink-2">
              Studio of 3 or more?{" "}
              <Link href="/enterprise" className="text-ink underline underline-offset-4">
                Team plans
              </Link>{" "}
              share one pool of hours and one {currency === "USD" ? "invoice" : "GST invoice"}.
            </p>
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
                ["/d5-render-cloud-workstation", "D5 Render on a GPU workstation"],
                ["/lumion-cloud-gpu", "Lumion on a GPU workstation"],
                ["/software/revit-cloud-workstation", "Revit on a cloud workstation"],
                ["/vram-for-architectural-rendering", "Is 8 GB of VRAM enough?"],
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
