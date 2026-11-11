import type { Currency } from "@/lib/money";
import { StreamDiagram } from "@/components/visuals/diagrams";
import { ViewContent } from "@/components/analytics/view-content";
import { PageHeroBg } from "@/components/page-hero-bg";
import { GpuCineBand } from "@/components/gpu-cine-band";
import { GPU_HEROES } from "@/lib/gpu-heroes";
import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbList, softwareServiceLd } from "@/lib/seo";
import { BackgroundGlow } from "@/components/home/background-glow";
import { PricingCards } from "@/components/pricing/pricing-cards";
import { getRateCard, ladderPhrase, ladderRanges, pricingFaqAnswer, taxSentence } from "@/lib/rate-card";
import { softwareStart } from "@/lib/software-start";
import { SoftwareFitPanel, SoftwarePickSection, SoftwareStartEnd, SoftwareStartHero } from "@/components/software/software-start";
import { storageTerms } from "@/lib/storage-terms";
import { NODE } from "@/lib/node-spec";
import Link from "next/link";
import { LastUpdated, SpecTable } from "@/components/gpu/spec-table";

export function lumionMetadata(currency: Currency): Metadata {
  const usdView = currency === "USD";
  return {
  title: "Lumion GPU Workstation, by the minute",
  description:
    `Run Lumion on a GPU workstation in India. Real-time rendering on the GPU, billed per minute${usdView ? " in US dollars, no GST" : " with GST included"}. BYOL — bring your own Lumion licence.`,
  keywords: [
    "Lumion cloud GPU India",
    "Lumion cloud rendering India",
    "Lumion cloud workstation",
    "cloud GPU for Lumion",
    "Lumion RTX cloud India",
  ],
  alternates: { canonical: "/lumion-cloud-gpu" },
  };
}

/**
 * Every hardware figure on this page comes from lib/node-spec.
 *
 * It used to be a hand-typed array, one of sixteen copies of the same numbers
 * across the site, and two of those copies described server-class memory and a
 * server-class CPU that this node has never had. The only spec a page may state
 * now is one that came from NODE — the Lumion-specific rows below describe the
 * software, not the hardware.
 */
/** The GPU, VRAM, CPU and RAM rows come from the live rate card's ladder
 *  (ladderSpecRows; owner, 21 Oct 2026); the rest are fixed facts of every node. */
const FIXED_SPECS: [string, string][] = [
  ["Disk", NODE.disk],
  ["OS", NODE.osShort],
  ["Access", `Coreframe Connect app, streamed at ${NODE.stream}`],
  ["Display driver", "WDDM, which Lumion requires"],
  ["Location", NODE.locationShort],
];

/** VRAM is the number to compare (13 Oct audit: as a real table, not prose). */
const vramCompare = (vram: string): [string, string][] => [
  ["Coreframe workstations", vram],
  ["Many laptops and entry desktops sold for design work", "6 to 8 GB"],
];

export default async function LumionView({ currency }: { currency: Currency }) {
  const card = await getRateCard();
  const storage = storageTerms(card);
  const priceAnswer = pricingFaqAnswer(card, currency);
  const ladder = ladderRanges(card);
  const vram = ladder?.vram ?? NODE.vram;

  /**
   * One array, rendered twice — as the visible questions and as the FAQPage
   * schema. Keeping them separate is how a page ends up telling Google one
   * thing and the reader another.
   */
  // Price first, one action, account at Start (owner, 10-11 Nov 2026).
  const start = softwareStart("lumion-cloud-gpu", card, currency);
  const gpuFaq =
    start.fit && start.rec
      ? {
          q: `What GPU do I need for ${start.fit.app}?`,
          a: `For ${start.fit.app} we recommend the ${start.rec.name} with ${start.rec.vram} GB of VRAM. ${start.fit.gpu.why} Every card on the price list runs it; you pick the card when you start.`,
        }
      : null;
  const faqs: { q: string; a: string }[] = [
    {
      q: "Does Lumion work on a cloud GPU?",
      a: `Yes, on a card with a WDDM display driver. That rules out the compute-only datacentre cards most GPU rentals hand you, because Lumion won't start on them. A Coreframe workstation is a Windows machine (${NODE.os}) with a dedicated NVIDIA RTX GPU and the full WDDM driver, so Lumion installs and runs the way it does on a desktop under your table. You reach the machine through the Coreframe Connect app, streamed to you at ${NODE.stream}.`,
    },
    {
      q: "What is in the workstation?",
      a: `${ladderPhrase(card) ? `${ladderPhrase(card)!.charAt(0).toUpperCase()}${ladderPhrase(card)!.slice(1)}` : "A dedicated NVIDIA RTX GPU"}, with ${NODE.disk}, running ${NODE.os} in ${NODE.location}. The GPUs on offer and their prices are on the pricing page. One customer per node. Nobody shares the card, and it isn't sliced into a virtual GPU.`,
    },
    {
      q: "Do I need my own Lumion licence?",
      a: "Yes, Lumion is bring your own licence. Install Lumion on the workstation and activate your existing named-user or floating seat. Coreframe only charges for the machine.",
    },
    // Appended only when the rate card answered. This used to be a hand-typed
    // rate described as "charged per full hour" — wrong about the unit from the
    // day it was written, and published as structured data, which is the one
    // place a wrong price gets quoted back at you.
    ...(priceAnswer
      ? [{ q: currency === "USD" ? "How much does a Lumion cloud GPU cost?" : "How much does Lumion cloud GPU cost in India?", a: priceAnswer }]
      : []),
    ...(gpuFaq ? [gpuFaq] : []),
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
      <ViewContent name="Lumion cloud GPU workstation" category="workstation" />
      <JsonLd data={breadcrumbList([{ name: "Lumion cloud GPU workstation", path: "/lumion-cloud-gpu" }])} />
      {/* What is for sale on the page (11 Nov 2026; the /software pages and D5 already had it). */}
      <JsonLd
        data={softwareServiceLd({
          slug: "lumion-cloud-gpu",
          path: "/lumion-cloud-gpu",
          name: "Lumion on a GPU workstation, by the minute",
          description: "A Windows GPU workstation for Lumion, streamed to your laptop and billed per minute. Bring your own Lumion licence; project files persist.",
          card,
        })}
      />
      <BackgroundGlow />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="cf-gpu-page relative">
        <section className="cf-section px-5 cf-pagehero">
          <PageHeroBg image={GPU_HEROES["lumion-cloud-gpu"]} />
          <div className="cf-wide">
          <div className="min-w-0 max-w-[620px]">
            <p className="cf-eyebrow mb-5">Lumion · Cloud workstation</p>
            <h1 className="cf-display">
              Run Lumion on a GPU workstation.
              <br className="hidden md:block" /> Nothing to buy.
            </h1>
            {/* Price first and ONE big action on the first phone screen (11 Nov 2026). */}
            <SoftwareStartHero data={start} where="sw_lumion" appName={start.fit?.app} />
            <p className="cf-lead mt-7">
            A Lumion workstation in the cloud. Lumion needs a strong GPU: run your own Lumion licence on a workstation-class RTX GPU while your laptop stays free.
          </p>
            <p className="cf-section-copy mt-5">
              You reach it through the Coreframe Connect app, streamed at{" "}
              {NODE.stream}. It isn&rsquo;t a remote desktop, and there&rsquo;s no render
              queue to submit a file to and wait on.
            </p>

            <LastUpdated date="11 November 2026" path="/lumion-cloud-gpu" className="mt-6" />
          </div>
        </div>
        </section>
      <section className="cf-section px-5 pb-0">
        <div className="cf-wide grid items-center gap-8 cf-cine cf-cine--panel p-6 sm:p-10 lg:grid-cols-[0.8fr_1.2fr]">
          <h2 className="cf-section-title">Lumion runs here. You see it there.</h2>
          <div className="min-w-0"><StreamDiagram /></div>
        </div>
      </section>

        {/* Cinema band (owner, 16 Oct 2026): the hero's look carried down the page. */}
        <GpuCineBand className="mb-16 sm:mb-20" page="lumion-cloud-gpu">
          <div className="cf-wide">
            <h2 className="cf-section-title">Why this card for Lumion.</h2>
            <div className="mt-9 grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
              {[
                {
                  title: "VRAM is the ceiling",
                  body: `Geometry, textures and vegetation all have to fit on the card. Coreframe workstations carry ${vram} of VRAM. Many laptops and entry desktops sold for design work have 6 to 8 GB, and that's what forces you to cut a scene down.`,
                },
                {
                  title: "A display driver, not compute-only",
                  body: "Lumion needs a WDDM display driver. Every card here runs one, so Lumion starts as it does on a desktop. It refuses to start on a datacentre card with a compute-only driver.",
                },
                {
                  title: "Files stay in India",
                  body: `The node is in ${NODE.location} and project storage is in India too. Nothing leaves the country, and that's usually the first thing NDA clients ask about.`,
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

        {/* Preinstalled vs your own licence, the recommended card, and the price-first
            picker in place of the plain ladder (11 Nov 2026). */}
        <section className="cf-section px-5 pt-0">
          <SoftwareFitPanel data={start} />
          <SoftwarePickSection data={start} currency={currency} where="sw_lumion" title={`Pick a GPU for ${start.fit?.app ?? "it"}.`} className="mt-14" />
        </section>

        <section className="cf-section px-5 pt-0">
          <div className="cf-wide">
            <h2 className="cf-section-title">The machine.</h2>
            <SpecTable rows={FIXED_SPECS} caption="The Lumion workstation: hardware and access" />
            <SpecTable rows={vramCompare(vram)} caption="VRAM compared" showCaption />
            <p className="cf-section-copy mt-5">
              Each node has one GPU and one customer at a time. We don&rsquo;t publish
              render times because they depend on your scene and your settings.
              Open your heaviest project on it and see for yourself.
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
                  The Lumion licence is yours to bring.
                </span>{" "}
                Named-user and floating seats both work. Install Lumion, activate
                your seat and start. {taxSentence(currency)}
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
          <SoftwareStartEnd data={start} where="sw_lumion" />
        </section>

        <section className="cf-section px-5 pt-0">
          <div className="cf-col">
            <div className="cf-rule" />
            <ul className="mt-8 space-y-1">
              {[
                ["/", "Home"],
                ["/d5-render-cloud-workstation", "D5 Render on a GPU workstation"],
                ["/enscape-cloud-gpu", "Enscape on a GPU workstation"],
                ["/cloud-workstation-vs-render-farm", "Cloud workstation vs render farm"],
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
