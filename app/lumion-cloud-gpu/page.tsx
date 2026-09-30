import type { Metadata } from "next";
import { BackgroundGlow } from "@/components/home/background-glow";
import { PricingCards } from "@/components/pricing/pricing-cards";
import { getRateCard, pricingFaqAnswer } from "@/lib/rate-card";
import { NODE } from "@/lib/node-spec";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Lumion Cloud GPU Workstation — RTX 5080, India",
  description:
    "Run Lumion on an RTX 5080 cloud workstation in India. Real-time rendering on the GPU, billed per minute with GST included. BYOL — bring your own Lumion licence.",
  keywords: [
    "Lumion cloud GPU India",
    "Lumion cloud rendering India",
    "Lumion cloud workstation",
    "cloud GPU for Lumion",
    "Lumion RTX cloud India",
  ],
  alternates: { canonical: "/lumion-cloud-gpu" },
};

/**
 * Every hardware figure on this page comes from lib/node-spec.
 *
 * It used to be a hand-typed array, one of sixteen copies of the same numbers
 * across the site, and two of those copies described server-class memory and a
 * server-class CPU that this node has never had. The only spec a page may state
 * now is one that came from NODE — the Lumion-specific rows below describe the
 * software, not the hardware.
 */
const SPECS: [string, string][] = [
  ["GPU", NODE.gpu],
  ["VRAM", `${NODE.vram} · ${NODE.memoryBandwidth}`],
  ["System RAM", NODE.ram],
  ["CPU", NODE.cpu],
  ["Disk", NODE.disk],
  ["OS", NODE.os],
  ["Access", `Coreframe Connect app, streamed at ${NODE.stream}`],
  ["Display driver", "WDDM, which Lumion requires"],
  ["Location", NODE.location],
];

export default async function LumionPage() {
  const card = await getRateCard();
  const priceAnswer = pricingFaqAnswer(card);

  /**
   * One array, rendered twice — as the visible questions and as the FAQPage
   * schema. Keeping them separate is how a page ends up telling Google one
   * thing and the reader another.
   */
  const faqs: { q: string; a: string }[] = [
    {
      q: "Does Lumion work on a cloud GPU?",
      a: `Yes, on a card with a WDDM display driver. That rules out the compute-only datacentre cards most GPU rentals hand you, which Lumion will not start on. A Coreframe workstation is a ${NODE.os} machine with a consumer ${NODE.gpu} and the full WDDM driver, so Lumion installs and runs the way it does on a desktop under your table. You reach the machine through the Coreframe Connect app and it is streamed to you at ${NODE.stream}.`,
    },
    {
      q: "What is in the workstation?",
      a: `${NODE.gpu} with ${NODE.vram}, ${NODE.ram} of system memory, ${NODE.cpu} and ${NODE.disk}, running ${NODE.os} in ${NODE.location}. One customer per node — the card is not shared and not sliced into a virtual GPU.`,
    },
    {
      q: "Do I need my own Lumion licence?",
      a: "Yes — Lumion is bring your own licence. Install Lumion on the workstation and activate your existing named-user or floating seat. Coreframe charges for the machine and nothing else.",
    },
    // Appended only when the rate card answered. This used to be a hand-typed
    // rate described as "charged per full hour" — wrong about the unit from the
    // day it was written, and published as structured data, which is the one
    // place a wrong price gets quoted back at you.
    ...(priceAnswer
      ? [{ q: "How much does Lumion cloud GPU cost in India?", a: priceAnswer }]
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
            <p className="cf-eyebrow mb-5">Lumion · Cloud GPU · Bengaluru</p>
            <h1 className="cf-display">
              Run Lumion on an RTX 5080.
              <br className="hidden md:block" /> Nothing to buy.
            </h1>
            <p className="cf-lead mt-[22px]">
              Lumion does its work on the GPU. That is why the laptop you model on
              stalls the moment the viewport has to resolve. Start a Windows
              workstation with an RTX&nbsp;5080, install your own Lumion licence,
              and the scene renders there while your own machine stays free for
              the next drawing.
            </p>
            <p className="cf-section-copy mt-5">
              You reach it through the Coreframe Connect app, streamed at{" "}
              {NODE.stream}. Not a remote desktop, and not a render queue you
              submit a file to and wait on.
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
            <h2 className="cf-section-title">Why this card for Lumion.</h2>
            <div className="mt-9 grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
              {[
                {
                  title: "VRAM is the ceiling",
                  body: `Geometry, textures and vegetation all have to fit on the card. This one carries ${NODE.vram}. Many laptops and entry desktops sold for design work carry 6 to 8 GB, which is what forces a scene to be cut down.`,
                },
                {
                  title: "Consumer RTX drivers",
                  body: "Lumion needs a WDDM display driver. This is a consumer card running the consumer driver — not a datacentre card with a compute-only driver, which Lumion refuses to start on.",
                },
                {
                  title: "Files stay in India",
                  body: `The node is in ${NODE.location} and project storage sits beside it. Nothing leaves the country, which is the question NDA clients ask first.`,
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
              One node, one GPU, one customer at a time. We do not publish render
              times, because they depend on your scene, your settings and your
              geometry — open your heaviest project on it and watch.
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
                  The Lumion licence is yours to bring.
                </span>{" "}
                Named-user and floating seats both work. Install Lumion, activate
                your seat, and start. All prices include 18% GST — what you see is
                what you pay, and a GST invoice showing the taxable value and the
                tax split is issued.
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
                ["/enscape-cloud-gpu", "Enscape on a cloud RTX 5080"],
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
