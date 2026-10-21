import type { Currency } from "@/lib/money";
import { StreamDiagram } from "@/components/visuals/diagrams";
import { PageByline } from "@/components/seo/page-byline";
import { GenImage } from "@/components/visuals/media";
import type { Metadata } from "next";
import Link from "next/link";
import { Fold } from "@/components/visuals/fold";
import { BackgroundGlow } from "@/components/home/background-glow";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbList, faqPage, OG_IMAGE } from "@/lib/seo";
import {
  getRateCard,
  adhocRateHourly,
  billingSentence,
  introOfferFaq,
  ladderPhrase,
  pricingFaqAnswer,
} from "@/lib/rate-card";
import { NODE, replacementCost } from "@/lib/node-spec";

/**
 * "Cloud workstation vs render farm" -- added 10 Oct 2026.
 *
 * WHY. The question is asked verbatim ("render farm vs cloud workstation",
 * "why can't render farms run Lumion") and every result was a competitor's
 * blog: Vagon, iRender, GarageFarm, a render-farm reseller. The answer was
 * already scattered over four FAQ entries on our own pages; nothing here
 * owned it, so nothing here was cited.
 *
 * HONESTY. This page has to say where a render farm is the better choice,
 * because it often is: a finished animation spread across many machines is
 * what farms are for, and a single workstation is not. No competitor prices
 * (they change, and the farms bill in units that do not convert to an hourly
 * figure without assumptions), no render times, no speed multiples. Our own
 * price comes from the rate card or is not shown.
 */
export function workstationVsFarmMetadata(): Metadata {
  // No price in this metadata: the same for both currency copies.
  return {
  title: "Cloud Workstation vs Render Farm",
  description:
    "A render farm renders a finished scene on many machines; a cloud workstation is one machine you drive yourself. Which fits D5, Lumion, V-Ray or Blender work.",
  keywords: [
    "cloud workstation vs render farm",
    "render farm vs cloud PC",
    "can a render farm run Lumion",
    "D5 Render render farm",
    "render farm India",
  ],
  alternates: { canonical: "/cloud-workstation-vs-render-farm" },
  openGraph: {
    images: [OG_IMAGE],
    title: "Cloud workstation vs render farm: which one you need",
    description:
      "One machine you drive, or many machines that render a finished job. Where each wins, written by a company that only sells one of them.",
    url: "https://www.coreframecloud.com/cloud-workstation-vs-render-farm",
    type: "article",
  },
  };
}

const ROWS: [string, string, string][] = [
  ["What you get", "One remote Windows desktop you control, with the GPU and the applications on it", "A queue that takes your finished scene and returns rendered frames"],
  ["How you use it", "Interactively: move the camera, change a material, re-render in the same session", "Submit a job, wait, download the output"],
  ["Best for", "Real-time renderers (D5, Lumion, Enscape, Twinmotion), look development, client revisions, any work that still needs a person at the controls", "Finished animations and large batches of frames that can be split across many machines at once"],
  ["Software", "Whatever runs on Windows, with your own licences for commercial tools", "Only the renderers and versions the farm supports"],
  ["Parallelism", "One GPU, one machine", "Many machines working on the same job"],
  ["How it is billed", "By time on the machine", "Usually by compute consumed (for example GHz-hours or benchmark-hours), varying with priority"],
];

export default async function WorkstationVsFarmView({ currency }: { currency: Currency }) {
  const card = await getRateCard();
  const hourly = adhocRateHourly(card, currency);
  const priceAnswer = pricingFaqAnswer(card, currency);
  const introFaq = introOfferFaq(card, currency);
  const machineCost = replacementCost(currency);

  const faqs: { q: string; a: string }[] = [
    {
      q: "What is the difference between a cloud workstation and a render farm?",
      a: "A cloud workstation is one remote computer that you operate yourself, the same way you would a machine under your desk. A render farm is a service that takes a finished scene and renders its frames on many machines you never see. A workstation is for the work that still needs you at the controls; a farm is for output once the scene is done.",
    },
    {
      q: "Can I use a render farm for D5 Render or Lumion?",
      a: "Real-time renderers such as D5 Render, Lumion, Enscape and Twinmotion are built to be driven interactively on one machine with a GPU, which is why they are usually run on a workstation rather than submitted to a farm queue. If you are considering a farm for one of them, check the farm's supported-software list for your exact application and version first.",
    },
    {
      q: "When is a render farm the better choice?",
      a: "When the scene is finished and the job is big: an animation of hundreds or thousands of frames, especially in an offline renderer such as V-Ray, Corona, Arnold or Cycles that the farm supports. Splitting frames across many machines is what farms are built for, and a single workstation cannot do that.",
    },
    {
      q: "When is a cloud workstation the better choice?",
      a: `When you are still working on the scene, when you use a real-time renderer, or when your own laptop cannot run the application at all. Coreframe gives you a full ${NODE.os} desktop with ${ladderPhrase(card) ?? "a dedicated NVIDIA RTX GPU"} in ${NODE.location}, streamed to the laptop you already own.`,
    },
    {
      q: "Can I use both?",
      a: "Yes, and many studios do. Model, light and iterate on a workstation, then send a finished animation to a farm that supports your renderer. A cloud workstation also helps when the scene is too heavy to open on your own computer in the first place.",
    },
    {
      q: "Does Coreframe run a render farm?",
      a: "No. Coreframe rents single Windows RTX workstations by the minute. We don't split jobs across machines and we don't quote render times, because they depend entirely on your scene and settings.",
    },
    ...(priceAnswer ? [{ q: "How much does a Coreframe workstation cost?", a: priceAnswer }] : []),
    ...(introFaq ? [introFaq] : []),
  ];

  return (
    <div className="relative min-h-screen text-ink">
      <BackgroundGlow />
      <JsonLd data={faqPage(faqs)} />
      <JsonLd data={breadcrumbList([{ name: "Cloud workstation vs render farm", path: "/cloud-workstation-vs-render-farm" }])} />

      <section className="cf-section cf-pagehero px-5">
        <div className="cf-wide grid items-center gap-10 lg:grid-cols-[1.05fr_1fr]">
          <div className="min-w-0">
              <p className="cf-eyebrow mb-5">Comparison · Rendering</p>
              <h1 className="cf-display">Cloud workstation or render farm?</h1>
          
              <p className="cf-lead mt-[22px]">
            A render farm renders a <em>finished</em> scene on many machines. A workstation is <em>one</em> machine you drive while the scene is still changing.
          </p>
              <PageByline path="/cloud-workstation-vs-render-farm" className="mt-4 opacity-75" />
        </div>
          <GenImage src="/visuals/gen-visualiser-home-16x9.webp" alt="A 3D visualiser working on a laptop at home" width={1600} height={914} sizes="(max-width: 1024px) 100vw, 480px" parallax priority />
        </div>
      </section>
      <section className="cf-section px-5 pb-0">
        <div className="cf-wide grid items-center gap-8 rounded-[28px] bg-tint-blue p-6 sm:p-10 lg:grid-cols-[0.8fr_1.2fr]">
          <h2 className="cf-section-title">One machine, yours, while you work.</h2>
          <div className="min-w-0"><StreamDiagram /></div>
        </div>
      </section>
      <main className="relative cf-section px-5">
        <div className="cf-col">
          <section className="mt-14">
            <h2 className="cf-section-title">Side by side.</h2>
            <div className="mt-6 overflow-x-auto rounded-cf border border-rule bg-paper-2">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead>
                  <tr className="border-b border-rule">
                    <th className="px-4 py-3 font-semibold text-ink"></th>
                    <th className="px-4 py-3 font-semibold text-ink">Cloud workstation</th>
                    <th className="px-4 py-3 font-semibold text-ink">Render farm</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rule">
                  {ROWS.map(([k, ws, farm]) => (
                    <tr key={k} className="align-top">
                      <th scope="row" className="px-4 py-3 font-medium text-ink-2">{k}</th>
                      <td className="px-4 py-3 text-ink">{ws}</td>
                      <td className="px-4 py-3 text-ink">{farm}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <Fold title="Where a render farm wins.">
            <p className="mt-4 leading-8 text-ink-2">
              A farm is the right answer when the creative work is done and what
              is left is volume. Hundreds of animation frames in V-Ray, Corona,
              Arnold or Cycles can be split across many machines working at the same
              time, which one computer cannot do. A single
              rented workstation, ours included, does not do that. We sell one
              machine at a time, and we would rather say so here than have you
              find out mid-deadline.
            </p>
          </Fold>

          <Fold title="Where a workstation wins.">
            <p className="mt-4 leading-8 text-ink-2">
              Real-time renderers are interactive by design. You use D5, Lumion,
              Enscape or Twinmotion because you move the camera and the image
              resolves while you watch, and that loop needs a person at a machine
              with a capable GPU. The same goes for look development, the client
              who wants the kitchen in a different finish, and the scene too heavy
              to open on your laptop at all. None of that is a job you can submit
              to a queue.
            </p>
            <p className="mt-4 leading-8 text-ink-2">
              A Coreframe workstation is a full {NODE.os} desktop with{" "}
              {ladderPhrase(card) ?? "a dedicated NVIDIA RTX GPU"},
              hosted in {NODE.location} and streamed to the laptop you already
              own. Your project files sit on a drive that persists between
              sessions. We don&rsquo;t publish render times, because they depend
              on your scene and settings.
            </p>
          </Fold>

          <Fold title="And the third option: buying.">
            <p className="mt-4 leading-8 text-ink-2">
              If you would keep a GPU busy most of the working week, owning one
              can be cheaper than either.{" "}
              {`A machine of this class costs roughly ${machineCost}${currency === "USD" ? "" : " in India"} by our own estimate.`}{" "}
              The{" "}
              <Link href="/d5-render-vs-local-gpu" className="text-blue underline underline-offset-4">
                rent-or-buy break-even
              </Link>{" "}
              works through both sides.
            </p>
          </Fold>

          {hourly ? (
            <section className="mt-14">
              <h2 className="cf-section-title">What a workstation costs here.</h2>
              <p className="mt-4 leading-8 text-ink-2">
                <strong className="font-semibold text-ink">{hourly}</strong>,{" "}
                {currency === "USD" ? "with no GST" : "with GST included"}.{" "}
                {billingSentence(card, currency)}{" "}
                <Link href="/pricing" className="text-blue underline underline-offset-4">
                  Full pricing and monthly plans
                </Link>
                .
              </p>
            </section>
          ) : null}

          <section className="mt-14">
            <h2 className="cf-section-title">Questions.</h2>
            <div className="mt-6 space-y-7">
              {faqs.map((f) => (
                <div key={f.q}>
                  <h3 className="font-semibold text-ink">{f.q}</h3>
                  <p className="mt-2 leading-7 text-ink-2">{f.a}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-14 rounded-cf border border-blue/20 bg-blue/[0.05] p-6">
            <h2 className="cf-section-title">Try it with your own scene.</h2>
            <p className="mt-3 leading-7 text-ink-2">
              Open the project your laptop struggles with on a Coreframe GPU
              workstation and see how it behaves. That tells you more than any
              comparison page can.
            </p>
            <Link href="/signup" className="cf-btn-primary mt-6">
              Get started
            </Link>
          </section>

          <nav className="mt-14 border-t border-rule pt-8">
            <p className="cf-eyebrow mb-4">Related</p>
            <ul className="space-y-1">
              {[
                ["/d5-render-cloud-workstation", "D5 Render on a GPU workstation"],
                ["/lumion-cloud-gpu", "Lumion on a GPU workstation"],
                ["/software/3ds-max-cloud-workstation", "3ds Max, V-Ray and Corona"],
                ["/software/after-effects-premiere-cloud-workstation", "After Effects and Premiere Pro"],
                ["/coreframe-vs-irender", "Coreframe vs iRender"],
                ["/d5-render-vs-local-gpu", "Renting a workstation vs buying one"],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="inline-flex min-h-[44px] items-center text-blue hover:underline">
                    {label} →
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </main>
    </div>
  );
}
