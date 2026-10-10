import type { Metadata } from "next";
import Link from "next/link";
import { BackgroundGlow } from "@/components/home/background-glow";
import { SpecBlock, K, B } from "@/components/home/spec-block";
import { NODE } from "@/lib/node-spec";
import { getRateCard, adhocRateHourly, getIntroOffer, hoursLabel, rupees } from "@/lib/rate-card";

/**
 * How much VRAM architectural rendering actually needs.
 *
 * WHY THIS PAGE. "Is 8 GB enough for Lumion / D5 / Enscape" is asked
 * constantly and answered badly -- almost every result is a spec table
 * reprinted from a vendor page, and the vendors disagree with each other.
 * An answer engine asked this question has nothing good to cite.
 *
 * THE FINDING THAT MAKES IT WORTH PUBLISHING. The vendors do not actually
 * answer it. Enscape publishes 4 GB minimum and 8 GB recommended. D5 publishes
 * a GPU MODEL floor and no VRAM number at all, while saying in the same
 * breath that "video memory determines how well complex scenes are handled".
 * So the honest answer is that the number depends on the scene and not on the
 * software -- and the useful thing we can give someone is how to measure
 * their own, which nobody else bothers to write down.
 *
 * SOURCED AND DATED. Every vendor figure below is in VENDOR with the date it
 * was read. Vendor requirements change with every major release and a figure
 * without a date is a figure nobody can check.
 *
 * NO BENCHMARKS, NO SPEED CLAIMS. We have not measured D5 or Lumion against
 * each other and will not imply we have. Capacity is checkable; speed here
 * would be marketing.
 *
 * HONEST ABOUT OUR OWN CEILING. Our node has 16 GB. Above that we are the
 * wrong answer and the page says so and names the alternative, same rule as
 * coreframe-vs-irender. A page that concludes "buy from us" regardless of the
 * question is cited by nobody and deserves to be.
 */

const VENDOR_CHECKED = "2 October 2026";
const VENDOR = {
  enscape: { min: "4 GB", recommended: "8 GB", vr: "12 GB" },
  d5: { gpuFloor: "GTX 1060 6 GB", vramPublished: null as string | null },
};

export const metadata: Metadata = {
  title: "Is 8 GB of VRAM enough for architectural rendering?",
  description:
    "Enscape recommends 8 GB. D5 publishes no VRAM figure. Your scene decides, not your software: how to measure what it uses, and what happens when you run out.",
  keywords: [
    "is 8GB VRAM enough for rendering",
    "VRAM for Lumion D5 Enscape",
    "how much VRAM architectural visualisation",
    "GPU memory 3D rendering requirements",
  ],
  alternates: { canonical: "/vram-for-architectural-rendering" },
  openGraph: {
    title: "Is 8 GB of VRAM enough for architectural rendering?",
    description:
      "What the vendors actually publish, how to measure your own scene, and what happens when you run out.",
    url: "https://www.coreframecloud.com/vram-for-architectural-rendering",
    type: "article",
  },
};

const pad = (s: string, n: number) => (s.length >= n ? s : s + " ".repeat(n - s.length));

/**
 * A FAQPage for THIS page's own questions. The one in explainer-faq.tsx is
 * scoped to the home page; two FAQPage nodes on two different URLs is correct
 * and is how an answer engine finds the question it was asked. What must not
 * happen is a second Organization node -- layout.tsx owns that one.
 */
const FAQ: { q: string; a: string }[] = [
  {
    q: "Is 8 GB of VRAM enough for architectural rendering?",
    a: `For Enscape, 8 GB is the figure Chaos publishes as recommended rather than minimum, with 4 GB as the floor and 12 GB for VR (read ${VENDOR_CHECKED}). For a single building at 1080p it's usually workable. It stops being enough when you load 4K texture sets, a point cloud or a full site context with vegetation. What sets the limit is your scene, whichever software you use.`,
  },
  {
    q: "What VRAM does D5 Render need?",
    a: `D5 publishes a GPU model floor of ${VENDOR.d5.gpuFloor} and no VRAM figure at all, while stating that video memory determines how well complex scenes are handled. There's no official number to quote, so measuring your own scene is the only reliable answer.`,
  },
  {
    q: "What happens when a scene exceeds the GPU's VRAM?",
    a: "It doesn't slow down gradually. Either the application spills to system memory across the PCIe bus, which is far slower than local VRAM and feels like the machine has stalled, or it refuses to load the scene and reports an out-of-memory error. Because the failure is that abrupt, headroom matters more than the average case.",
  },
  {
    q: "How do I find out how much VRAM my scene uses?",
    a: "Open the scene, then in Windows Task Manager go to Performance, select your GPU, and read Dedicated GPU memory while you orbit the viewport and start a render. That figure, plus roughly 2 GB of headroom for Windows and the display, is the card you need.",
  },
];

export default async function Page() {
  const card = await getRateCard();
  const rate = adhocRateHourly(card);
  const intro = getIntroOffer(card);

  const eightIsFine = [
    "One building, no site context, at 1080p or 1440p.",
    "Texture sets at 2K. Most manufacturer libraries ship at 2K and look identical at render size.",
    "Enscape or D5 walkthroughs of an interior with a few rooms, rather than a masterplan.",
    "You're producing stills and short clips rather than long animations.",
  ];

  const eightIsNot = [
    "4K texture sets, especially PBR materials with five maps each.",
    "A scanned point cloud, or a surveyed site mesh, loaded alongside the model.",
    "Full landscape context. Scattered trees and grass are the most common single cause of running out.",
    "A federated model: architecture plus structure plus services, opened together.",
    "VR. Enscape asks for 12 GB, and that's before your scene is anything unusual.",
  ];

  return (
    <div className="relative min-h-screen text-ink">
      <BackgroundGlow />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQ.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        }}
      />

      <main className="relative">
        <section className="cf-section px-5">
          <div className="cf-col">
            <p className="cf-eyebrow mb-5">Explainer</p>
            <h1 className="cf-display">Is 8 GB of VRAM enough?</h1>
            <p className="cf-lead mt-6">
              Usually yes, until very suddenly it isn&apos;t. The software vendors
              don&apos;t help much: one publishes a recommendation and the other
              publishes no number at all. So below is what they do say, with the
              date we read it, and then how to measure your own scene instead of
              guessing from a spec table.
            </p>
          </div>
        </section>

        <div className="cf-rule" />

        <section className="cf-section px-5">
          <div className="cf-wide">
            <SpecBlock label={`What the vendors actually publish (read ${VENDOR_CHECKED})`}>
              {"  "}
              <K>{pad("Enscape, minimum", 26)}</K>
              {VENDOR.enscape.min}
              {"\n"}
              {"  "}
              <K>{pad("Enscape, recommended", 26)}</K>
              <B>{VENDOR.enscape.recommended}</B>
              {"\n"}
              {"  "}
              <K>{pad("Enscape, VR", 26)}</K>
              {VENDOR.enscape.vr}
              {"\n\n"}
              {"  "}
              <K>{pad("D5 Render, GPU floor", 26)}</K>
              {VENDOR.d5.gpuFloor}
              {"\n"}
              {"  "}
              <K>{pad("D5 Render, VRAM", 26)}</K>
              {"not published"}
              {"\n\n"}
              {"  "}
              <B>{pad(`Coreframe ${NODE.gpu}`, 26)}</B>
              <B>{NODE.vram}</B>
              {"\n"}
            </SpecBlock>
            <p className="mt-6 text-sm text-white/55">
              Enscape figures from Chaos&apos;s published system requirements.
              D5&apos;s own specification page lists GPU models and states that
              video memory determines how well complex scenes are handled, but
              gives no figure for it. Both read on {VENDOR_CHECKED}; vendor
              requirements change with major releases, so check the date before
              relying on this.
            </p>
          </div>
        </section>

        <div className="cf-rule" />

        <section className="cf-section px-5">
          <div className="cf-col">
            <h2 className="cf-title">Running out happens all at once</h2>
            <p className="cf-lead mt-5">
              The spec tables leave this out. A scene that exceeds the card&apos;s
              memory doesn&apos;t just render a bit more slowly. Either the
              application spills into system RAM across the PCIe bus, which is an
              order of magnitude slower than the memory on the card and feels like
              the machine has frozen, or it refuses the scene outright with an
              out-of-memory error.
            </p>
            <p className="cf-lead mt-5">
              So the useful thing to ask is how much headroom is left once it
              fits. Windows and your display take roughly 2 GB before your
              renderer sees any.
            </p>
          </div>
        </section>

        <div className="cf-rule" />

        <section className="cf-section px-5">
          <div className="cf-col">
            <h2 className="cf-title">Measure your own scene in two minutes</h2>
            <ol className="mt-7 grid gap-4 text-white/80">
              <li className="cf-card-sm">Open your heaviest real project. A test file won&apos;t tell you much.</li>
              <li className="cf-card-sm">Ctrl+Shift+Esc for Task Manager, then <b className="text-white">Performance</b> → your GPU.</li>
              <li className="cf-card-sm">Watch <b className="text-white">Dedicated GPU memory</b> while you orbit the viewport, then while a render starts. The peak is your number.</li>
              <li className="cf-card-sm">Add about 2 GB of headroom. That&apos;s the card you need, whatever the vendor table says.</li>
            </ol>
          </div>
        </section>

        <div className="cf-rule" />

        <section className="cf-section px-5">
          <div className="cf-col">
            <h2 className="cf-title">When 8 GB is genuinely fine</h2>
            <ul className="mt-7 grid gap-4">
              {eightIsFine.map((t) => <li key={t} className="cf-card-sm text-white/80">{t}</li>)}
            </ul>
            <h2 className="cf-title mt-14">When it is not</h2>
            <ul className="mt-7 grid gap-4">
              {eightIsNot.map((t) => <li key={t} className="cf-card-sm text-white/80">{t}</li>)}
            </ul>
          </div>
        </section>

        <div className="cf-rule" />

        <section className="cf-section px-5">
          <div className="cf-col">
            <h2 className="cf-title">Where we fit, and where we don&apos;t</h2>
            <p className="cf-lead mt-5">
              A Coreframe workstation has <b className="text-white">{NODE.vram}</b>. That&apos;s
              twice Enscape&apos;s recommended figure, with enough headroom for
              4K textures and a reasonable amount of site context.
              {rate ? ` It rents at ${rate}.` : ""}
            </p>
            <p className="cf-lead mt-5">
              It isn&apos;t enough for everything. If your measured peak is above
              about 14 GB (say a large point cloud, a federated model with
              services, or serious VR work), you want a 24 GB or 32 GB card, and
              we don&apos;t have one. Providers like iRender rent single 4090 and
              5090 nodes by the hour, and that&apos;s the right answer for those
              scenes. We&apos;d rather tell you than take an hour of your money
              and have you run out of memory halfway through.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:gap-4">
              <Link href="/login" className="cf-btn-primary">
                {intro ? `Try it: ${rupees(intro.priceRupees)} for ${hoursLabel(intro.hours)}` : "Create an account"}
              </Link>
              <Link href="/coreframe-vs-irender" className="cf-btn-secondary">
                Compare the two on price
              </Link>
            </div>
          </div>
        </section>

        <div className="cf-rule" />

        <section className="cf-section px-5">
          <div className="cf-col">
            <h2 className="cf-title">Questions</h2>
            <div className="mt-7 grid gap-5">
              {FAQ.map((f) => (
                <div key={f.q} className="cf-card-sm">
                  <p className="font-semibold text-white">{f.q}</p>
                  <p className="mt-2 text-white/75">{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
