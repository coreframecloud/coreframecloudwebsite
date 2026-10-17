import { StreamDiagram } from "@/components/visuals/diagrams";
import { ViewContent } from "@/components/analytics/view-content";
import { Fold } from "@/components/visuals/fold";
import { GenImage } from "@/components/visuals/media";
import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbList } from "@/lib/seo";
import Link from "next/link";
import { BackgroundGlow } from "@/components/home/background-glow";
import { SpecBlock, K, V, C } from "@/components/home/spec-block";
import { NODE } from "@/lib/node-spec";
import {
  getRateCard,
  planTiers,
  adhocRateHourly,
  adhocRate,
  storageRatePerTb,
  billingSentence,
} from "@/lib/rate-card";
import { storageTerms } from "@/lib/storage-terms";

export const metadata: Metadata = {
  title: "Cloud Rendering for Architects in India",
  description:
    "RTX 5080 cloud workstations for architecture studios: D5 Render, Lumion, Enscape and Revit, persistent project storage, named seats, hosted in Bengaluru.",
  keywords: [
    "cloud rendering for architects India",
    "cloud GPU architecture India",
    "D5 Render cloud architects",
    "Lumion cloud India architects",
    "Enscape cloud Revit India",
    "architecture visualisation cloud GPU",
  ],
  alternates: { canonical: "/cloud-rendering-for-architects" },
};

/**
 * THE SPEC IS NOT TYPED ON THIS PAGE. It comes from lib/node-spec, which is
 * where every page reads it since the site spent weeks claiming server-grade
 * memory and a server-grade CPU that this fleet has never had.
 *
 * NO SPEED CLAIMS. The old copy said a fly-through needs "sustained GPU
 * throughput your local machine can't sustain", and the FAQ said the node
 * "outperforms most mid-range local GPUs". Both were assertions about a reader's
 * hardware that we have never measured, on a page aimed at people who would
 * know. What is true, and is all this page now claims, is that the render
 * happens somewhere else: your own machine stays free, and several people can
 * render at once on separate workstations.
 *
 * THE FAQ IS VISIBLE. The FAQPage JSON-LD used to describe questions that
 * appeared nowhere on the page. Both now render from the same array, so the
 * structured data and the copy cannot drift apart.
 */

const useCases = [
  {
    title: "D5 Render walkthroughs.",
    body: "The fly-through renders on the node, so your own machine stays free and you can keep modelling while it runs.",
  },
  {
    title: "Enscape inside Revit or SketchUp.",
    body: "Enscape is a plugin, so its host application goes on first. Your named-user licence signs in the same way it does on your own PC.",
  },
  {
    title: "Lumion scenes with heavy assets.",
    body: `${NODE.vram} on the card. High-resolution textures, dense vegetation and animated water fit without you having to turn the quality setting down.`,
  },
  {
    title: "Handoffs without a pen drive.",
    body: "On a committed plan the project files live on NAS. A designer uploads the model and whoever renders it opens the same file, instead of hunting for the latest copy on somebody's desktop.",
  },
  {
    title: "Client NDA work stays in India.",
    body: `Every node and every byte of storage sits in ${NODE.location}. A client's unreleased building never touches an overseas server.`,
  },
  {
    title: "Everyone renders at once.",
    body: "In the week before a presentation, each person takes their own workstation for as long as they need it, and hands it back the same day.",
  },
];

const workflow = [
  { n: "01", title: "Open the account.", body: "Sign up, verify your email, add credit to the wallet." },
  { n: "02", title: "Launch a workstation.", body: `One click. A ${NODE.gpu} machine running ${NODE.os} boots and hands you a desktop.` },
  { n: "03", title: "Sign in to your software.", body: "D5 Render, Twinmotion, Unreal and Blender are on the image already. We set up Revit, AutoCAD, Lumion and Enscape with you once, and after that they're on every workstation you launch, running on your own licence." },
  { n: "04", title: "Move the project across.", body: "Drag the scene and its assets in. You don't need FTP, a VPN or a shared drive." },
  { n: "05", title: "Render.", body: "The node does the work. On a committed plan the files stay on NAS, so the next person to open the job has them." },
  { n: "06", title: "Close the window.", body: "Download what you need and shut the session down. Billing stops, and NAS keeps the project." },
];

/**
 * Presentation only — which card is highlighted, and the copy for the ad-hoc
 * card, which is not a plan row. Every figure comes from the rate card.
 *
 * This table used to hold five hardcoded prices AND the sentence "Per full
 * hour, no commitment", which was never true: the API has billed per minute
 * since it was written.
 */
// "Medium Firm" until 18 Oct 2026 (Team plans rename); both accepted.
const PLAN_HIGHLIGHT = new Set(["Medium Team", "Medium Firm"]);

const planWhatsapp = (plan: string) =>
  `https://wa.me/916366889488?text=${encodeURIComponent(
    `Hi Coreframe, I'd like to discuss the ${plan} plan for my architecture studio.`
  )}`;

/** One array. It renders as the page's Questions section AND as the JSON-LD. */
const faqs = [
  {
    q: "Can I run Revit on a cloud GPU workstation?",
    a: "Yes. Revit runs on the workstation the way it runs on your own PC, and Enscape, D5 Render and the other Revit plugins work with it. You bring your own Autodesk licence; we never supply one.",
  },
  {
    q: "How do team members share project files?",
    a: "On committed plans the project files live on persistent NAS storage. Anyone with a named seat opens the same files, so nobody copies files between sessions or passes round a pen drive.",
  },
  {
    q: "Is cloud rendering faster than a local workstation for architects?",
    a: "It depends on the machine you have now, so we don't publish a speed multiple or render times. What we can say is that the render happens somewhere else. Your own machine stays free while it runs, and several people in the studio can render at the same time on separate workstations instead of queueing for one desk.",
  },
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

export default async function ArchitectsPage() {
  const card = await getRateCard();
  const storage = storageTerms(card);
  const storageRate = storageRatePerTb(card);
  const adhoc = adhocRate(card);

  const plans = [
    {
      name: "Ad-hoc",
      price: adhocRateHourly(card) ?? "—",
      note:
        `${billingSentence(card)} No commitment. ${storage.paidGb} GB of persistent storage included, ` +
        "kept while your account is active. Session scratch is cleared at session end, so " +
        "download outputs first.",
      cta: "Get started",
      href: "/signup",
      highlight: false,
    },
    ...planTiers(card).map((t) => ({
      name: t.name,
      price: `₹${Math.round(t.monthly_fee_rupees).toLocaleString("en-IN")}/mo`,
      note: [
        t.included_storage_gb >= 1024
          ? `${Math.round(t.included_storage_gb / 1024)} TB NAS`
          : `${t.included_storage_gb} GB NAS`,
        t.file_retention_days ? `${t.file_retention_days}-day retention` : null,
        `${t.named_seats} seats`,
        `${Math.round(t.included_gpu_hours)} GPU-hrs`,
        t.overage_hourly_rate_rupees != null
          ? `₹${Math.round(t.overage_hourly_rate_rupees).toLocaleString("en-IN")}/hr extra`
          : null,
      ].filter(Boolean).join(" · "),
      cta: "Get a quote",
      href: planWhatsapp(t.name),
      highlight: PLAN_HIGHLIGHT.has(t.name),
    })),
  ];

  return (
    <div className="relative min-h-screen text-ink">
      <ViewContent name="Cloud rendering for architects" category="workstation" />
      <JsonLd data={breadcrumbList([{ name: "Cloud rendering for architects", path: "/cloud-rendering-for-architects" }])} />
      <BackgroundGlow />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main className="relative">
        <section className="cf-section px-5 cf-pagehero">
          <div className="cf-wide grid items-center gap-10 lg:grid-cols-[1.05fr_1fr]">
          <div className="min-w-0">
            <p className="cf-eyebrow mb-5">Architecture studios · India</p>
            <h1 className="cf-display">
              Nobody should be waiting for the render desk.
            </h1>
            <p className="cf-lead mt-6">
            {NODE.gpu} workstations by the minute for D5 Render, Lumion, Enscape and Revit. Everyone renders at once, from shared project files.
          </p>

            <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:gap-4">
              <Link href="/signup" className="cf-btn-primary w-full sm:w-auto min-h-[44px]">
                Get started
              </Link>
              <Link href="/enterprise" className="cf-btn-secondary w-full sm:w-auto min-h-[44px]">
                Team plans
              </Link>
            </div>
          </div>
          <GenImage src="/visuals/gen-architect-client-walkthrough-16x9.webp" alt="An architect showing clients a 3D walkthrough on a wall screen" width={1600} height={914} sizes="(max-width: 1024px) 100vw, 480px" parallax priority />
        </div>
        </section>
      <section className="cf-section px-5 pb-0">
        <div className="cf-wide grid items-center gap-8 rounded-[28px] bg-tint-blue p-6 sm:p-10 lg:grid-cols-[0.8fr_1.2fr]">
          <h2 className="cf-section-title">Open the project. Render. Close it.</h2>
          <div className="min-w-0"><StreamDiagram /></div>
        </div>
      </section>

        <div className="cf-rule" />

        <section className="cf-section px-5">
          <div className="cf-wide">
            <SpecBlock label="The machine you are renting">
              <C># one workstation, per seat</C>
              {"\n\n"}
              {"  "}<K>gpu</K>{"            "}<V>{NODE.gpu}</V> · <V>{NODE.vram}</V>{"\n"}
              {"  "}<K>bandwidth</K>{"      "}<V>{NODE.memoryBandwidth}</V> memory bandwidth on the card{"\n"}
              {"  "}<K>memory</K>{"         "}<V>{NODE.ram}</V> system RAM{"\n"}
              {"  "}<K>cpu</K>{"            "}<V>{NODE.cpu}</V>{"\n"}
              {"  "}<K>working disk</K>{"   "}<V>{NODE.disk}</V>{"\n"}
              {"  "}<K>os</K>{"             "}<V>{NODE.os}</V>, a full desktop you work on{"\n"}
              {"  "}<K>access</K>{"         "}Coreframe Connect app, streamed at <V>{NODE.stream}</V>{"\n"}
              {"  "}<K>location</K>{"       "}<V>{NODE.location}</V>{"\n"}
              {"  "}<K>licences</K>{"       "}yours; we never supply one
            </SpecBlock>
          </div>
        </section>

        <div className="cf-rule" />

        <section className="cf-section px-5">
          <div className="cf-wide">
            <p className="cf-eyebrow mb-5">What architects use it for</p>
            <h2 className="cf-section-title">Six things a studio stops waiting on.</h2>
            <div className="mt-10 grid grid-cols-1 gap-9 sm:grid-cols-2 lg:grid-cols-3">
              {useCases.map((u) => (
                <div key={u.title} className="cf-card">
                  <h3 className="text-base font-semibold tracking-[-0.01em] text-ink">{u.title}</h3>
                  <p className="mt-2.5 text-sm leading-[1.62] break-words text-ink-2">{u.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="cf-rule" />

        <section className="cf-section px-5">
          <div className="cf-wide">
            <p className="cf-eyebrow mb-5">How it works</p>
            <h2 className="cf-section-title">Six steps, and you only pay while the machine is running.</h2>
            <div className="mt-10 grid grid-cols-1 gap-9 sm:grid-cols-2 lg:grid-cols-3">
              {workflow.map((s) => (
                <div key={s.n} className="cf-card">
                  <p className="cf-card-label">{s.n}</p>
                  <h3 className="text-base font-semibold tracking-[-0.01em] text-ink">{s.title}</h3>
                  <p className="mt-2.5 text-sm leading-[1.62] break-words text-ink-2">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="cf-rule" />

        <section className="cf-section px-5">
          <div className="cf-wide">
            <p className="cf-eyebrow mb-5">Plans</p>
            <h2 className="cf-section-title">Pay by the minute, or commit for the year.</h2>
            <div className="mt-10 grid grid-cols-1 gap-9 sm:grid-cols-2 lg:grid-cols-3">
              {plans.map((p) => (
                <div key={p.name} className="cf-card">
                  <p className="cf-card-label">
                    {p.name}
                    {p.highlight ? " · best value" : ""}
                  </p>
                  <p className="font-display text-2xl font-semibold tracking-[-0.02em] break-words text-ink">
                    {p.price}
                  </p>
                  <p className="mt-2.5 text-sm leading-[1.62] break-words text-ink-2">{p.note}</p>
                  <Link
                    href={p.href}
                    target={p.href.startsWith("https://wa") ? "_blank" : undefined}
                    rel={p.href.startsWith("https://wa") ? "noreferrer" : undefined}
                    className={`mt-5 min-h-[44px] w-full ${p.highlight ? "cf-btn-primary" : "cf-btn-secondary"}`}
                  >
                    {p.cta}
                  </Link>
                </div>
              ))}
            </div>
            <p className="mt-8 text-sm leading-[1.62] text-ink-2">
              All prices include 18% GST, so what you see is what you pay. Every invoice shows the
              taxable value and GST split.
              {adhoc ? ` Committed tiers bill extra GPU-hours below the ${adhoc} ad-hoc rate.` : ""}
              {storageRate ? ` Persistent NAS storage beyond your plan, or on its own, is ${storageRate}/TB/month and is retained for as long as it is subscribed.` : ""}
              {" "}Software is bring-your-own-licence. Named-user licences work.
            </p>
          </div>
        </section>

        <div className="cf-rule" />

        <section className="cf-section px-5">
          <div className="cf-col">
<Fold title="What studios ask before they start.">
            <dl className="mt-10 divide-y divide-rule border-y border-rule">
              {faqs.map((f) => (
                <div key={f.q} className="py-6">
                  <dt className="text-lg font-semibold tracking-[-0.02em] break-words text-ink">{f.q}</dt>
                  <dd className="mt-2.5 text-base leading-[1.62] break-words text-ink-2">{f.a}</dd>
                </div>
              ))}
            </dl>
          </Fold>
</div>
        </section>

        <section className="cf-section px-5 pt-0">
          <div className="cf-col flex flex-wrap gap-x-6 gap-y-1 text-sm">
            {[
              ["/", "Home"],
              ["/d5-render-cloud-workstation", "D5 Render"],
              ["/lumion-cloud-gpu", "Lumion"],
              ["/enscape-cloud-gpu", "Enscape"],
              ["/cloud-workstation-vs-render-farm", "Cloud workstation vs render farm"],
              ["/floor-plan-to-render", "Floor plan to interior render (Studio)"],
            ].map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className="inline-flex min-h-[44px] items-center text-blue hover:underline"
              >
                {label} &rarr;
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
