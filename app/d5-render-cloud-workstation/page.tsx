import type { Metadata } from "next";
import Link from "next/link";
import { BackgroundGlow } from "@/components/home/background-glow";
import {
  getRateCard,
  introOfferFaq,
  adhocRateHourly,
  billingSentence,
  pricingFaqAnswer,
} from "@/lib/rate-card";
import { NODE, WORKSTATION_REPLACEMENT_COST } from "@/lib/node-spec";
import { BANDWIDTH_SENTENCE } from "@/lib/streaming-terms";

/**
 * The D5 Render page, promoted out of the app/[slug] stub renderer.
 *
 * WHY. Search Console, 90 days to 18 Sep 2026: D5 is the strongest cluster we
 * have -- "d5 render cloud" at position 4, "d5 cloud" at 8.2, "d5 cloud render"
 * at 10 -- and every one of those impressions landed on 219 words of generic
 * copy with no FAQ schema, no specifics and no internal links. The queries were
 * already there; the page was not worth the click.
 *
 * THE URL IS UNCHANGED on purpose. /d5-render-cloud-workstation is indexed and
 * ranking; moving it to /software/ would trade a known position for a redirect.
 * A static route beats the [slug] dynamic route in Next's matcher, so this file
 * takes over the path and the stub entry has been deleted.
 *
 * FACTS. D5 Render is preinstalled on the image; the customer signs in with
 * their own D5 account. Prices come from the rate card, never typed. No render
 * times, no speed multiples, no capacity promises -- see the copy rules in
 * coreframe-outreach. VRAM and core counts are published specifications and are
 * the honest way to make the hardware point.
 */
export const metadata: Metadata = {
  title: "D5 Render Cloud Workstation — RTX 5080 by the minute",
  description:
    "Run D5 Render on a full Windows RTX 5080 workstation in India, billed per minute with GST included. D5 is preinstalled, you sign in with your own account, and project files persist between sessions.",
  keywords: [
    "D5 Render cloud workstation",
    "D5 Render cloud GPU India",
    "run D5 Render without a gaming laptop",
    "D5 Render RTX 5080",
    "cloud PC for D5 Render",
  ],
  alternates: { canonical: "/d5-render-cloud-workstation" },
  openGraph: {
    title: "D5 Render Cloud Workstation — RTX 5080 by the minute",
    description:
      "A full Windows desktop with an RTX 5080, D5 Render preinstalled, billed per minute from Bengaluru.",
    url: "https://www.coreframecloud.com/d5-render-cloud-workstation",
    type: "article",
  },
};

const SPECS: [string, string][] = [
  ["GPU", NODE.gpu],
  ["VRAM", `${NODE.vram} · ${NODE.memoryBandwidth}`],
  ["System RAM", NODE.ram],
  ["CPU", NODE.cpu],
  ["Disk", NODE.disk],
  ["OS", NODE.os],
  ["Access", `Coreframe Connect app, streamed at ${NODE.stream}`],
  ["Display driver", "WDDM, which D5 needs for real-time viewport work"],
  ["D5 Render", "Preinstalled; sign in with your own D5 account"],
  ["Project storage", "Persistent, separate from the machine"],
  ["Location", NODE.location],
];

export default async function D5Page() {
  const card = await getRateCard();
  const introFaq = introOfferFaq(card);
  const hourly = adhocRateHourly(card);
  const priceAnswer = pricingFaqAnswer(card);

  const faqs: { q: string; a: string }[] = [
    {
      q: "Can I run D5 Render on a cloud workstation?",
      a: `Yes. Coreframe gives you a full ${NODE.os} desktop with an NVIDIA ${NODE.gpu}, and D5 Render is already installed on it. You sign in with your own D5 account, open your project and work in the live viewport the same way you would on a local machine. It's the full desktop application. You reach it through the Coreframe Connect app rather than a remote desktop, and the stream runs at ${NODE.stream}.`,
    },
    {
      q: "Is D5 Render included, or do I need my own licence?",
      a: "The application is installed for you, so you never spend paid minutes downloading it. The account is yours: you sign in with your own D5 credentials, and whatever plan you hold with D5 is what applies. We supply the machine. The licence is yours.",
    },
    {
      q: "Is this the same as a render farm?",
      a: "No. A render farm takes a finished scene, renders frames on machines you never see, and sends images back. Coreframe hands you the machine itself. You can move the camera, change a material, relight the scene and re-render in the same session. That back-and-forth is how people use D5, and it's why you'd pick a real-time renderer in the first place.",
    },
    {
      q: "How much VRAM does D5 Render need?",
      a: `VRAM is the ceiling on scene size in any GPU renderer: geometry, textures and lightmaps all have to fit on the card. The ${NODE.gpu} in a Coreframe workstation has ${NODE.vram}. Many laptops and entry desktops sold for design work ship with 6 to 8 GB, which is what forces people to cut texture resolution or split a scene. We can't tell you how your particular scene will behave, so run it in a session and watch the VRAM meter yourself.`,
    },
    {
      q: "What happens to my D5 project files when the session ends?",
      a: "Every session starts from an identical clean machine, so anything installed during a session is gone when it ends. Your project files don't live on that machine. They sit on persistent storage that carries over, so a session you open on Friday picks up where Monday's stopped. The clean reset is how we make sure no trace of another customer's work, or yours, is left behind.",
    },
    {
      q: "Can I use D5 Render with Revit, SketchUp, Rhino or 3ds Max on the same machine?",
      a: "Yes. It's an ordinary Windows desktop, so the D5 plugins and the host applications sit side by side. Blender and Twinmotion are preinstalled alongside D5. Revit, SketchUp, Rhino, 3ds Max and similar licensed applications run on the machine but need your own licence, because those vendors require your own account even to download the installer.",
    },
    {
      q: "What internet speed do I need to use a Coreframe workstation?",
      a: `You're streaming a desktop, so a steady connection matters more than a fast one. ${BANDWIDTH_SENTENCE} Rendering happens on the workstation in Bengaluru, and a finished 4K or 8K still is a file you download. It isn't streamed to you frame by frame.`,
    },
    ...(priceAnswer ? [{ q: "How much does it cost to render in D5 on Coreframe?", a: priceAnswer }] : []),
    ...(introFaq ? [introFaq] : []),
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

      <main className="relative cf-section px-5">
        <div className="cf-col">
        <p className="cf-eyebrow mb-5">D5 Render · Cloud GPU · Bengaluru</p>
        <h1 className="cf-display">
          Run D5 Render on a rented RTX 5080.
        </h1>

        <p className="cf-lead mt-[22px]">
          Coreframe gives you a full Windows desktop with an NVIDIA RTX 5080, D5
          Render already installed, streamed to whatever laptop you own and
          billed by the minute. You sign in with your own D5 account, open your
          project and work in the live viewport. It&rsquo;s the full application on
          real hardware, with no web preview in between and no queue.
        </p>

        <section className="mt-14">
          <h2 className="cf-section-title">
            The problem D5 users actually have.
          </h2>
          <p className="mt-4 leading-8 text-ink-2">
            D5 is a real-time renderer, which is why weak hardware hurts it so
            much. You use it because you move the camera and the image resolves
            while you watch. On an underpowered card that loop
            breaks: the viewport stutters, you stop exploring options, and a 4K
            still becomes something you set running and walk away from.
          </p>
          <p className="mt-4 leading-8 text-ink-2">
            The usual answer is to buy a workstation. A machine that renders
            comfortably costs roughly {WORKSTATION_REPLACEMENT_COST} in
            India. You buy it once and it sits idle most of the week, because
            visualisation work comes in bursts. You need serious hardware for the four days before a client
            presentation and almost none for the three weeks after it.
          </p>
          <p className="mt-4 leading-8 text-ink-2">
            Renting flips that around: you have the machine for those four days and don&rsquo;t pay for the three weeks.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="cf-section-title">The machine.</h2>
          <dl className="mt-6 divide-y divide-rule overflow-hidden rounded-cf border border-rule bg-paper-2">
            {SPECS.map(([k, v]) => (
              <div key={k} className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:gap-6">
                <dt className="text-sm text-ink-2 sm:w-52 sm:shrink-0">{k}</dt>
                <dd className="text-sm break-words text-ink">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-5 leading-8 text-ink-2">
            Each node has one GPU and one customer at a time. You don&rsquo;t share the
            card, and you don&rsquo;t get a virtualised slice of it. The number we&rsquo;d
            compare is VRAM: this card has {NODE.vram}, while many laptops and
            entry desktops sold for design work have 6 to 8 GB. VRAM decides
            whether a scene loads at full texture resolution or has to be cut
            down. We don&rsquo;t publish render times because they depend entirely on
            your scene and your settings.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="cf-section-title">
            How a session works.
          </h2>
          <ol className="mt-6 space-y-5">
            {[
              "Sign in and start a workstation. It comes up in about two minutes. Provisioning is free, and billing starts when the stream does.",
              "Your project files are already there, on persistent storage that survives between sessions. Nothing has to be copied onto the machine each time.",
              "Open D5, sign in with your own account, and work. Twinmotion, Blender and Unreal Engine are on the same desktop if you need them.",
              "Render at full resolution on the workstation. The finished image is a file you download. It doesn't come through the stream.",
              "Close the session. Billing stops, the machine is wiped back to a clean image, and your files stay where they were.",
            ].map((step, i) => (
              <li key={i} className="flex gap-4 leading-8 text-ink-2">
                <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-blue/30 text-sm text-blue">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <p className="mt-5 leading-8 text-ink-2">
            <Link href="/how-to-use" className="text-blue underline underline-offset-4">
              The full setup walkthrough
            </Link>{" "}
            covers sign-up and installing Coreframe Connect.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="cf-section-title">
            The revision that happens in the room.
          </h2>
          <p className="mt-4 leading-8 text-ink-2">
            Studios feel this most in client meetings. A
            client asks for the kitchen in a different finish, and the normal
            answer is to go back to the office, re-render overnight and book a
            second meeting. With the workstation reachable from a laptop, you
            can make the change where you&rsquo;re sitting and put the result on
            the client&rsquo;s own screen before the meeting ends.
          </p>
          <p className="mt-4 leading-8 text-ink-2">
            Two caveats. Test the connection at the client&rsquo;s office first,
            or tether, because a demo that stalls in front of the client is worse
            than no demo. And the high-resolution still is a file rendered on the
            workstation. You won&rsquo;t see it as a live stream at that
            resolution.
          </p>
        </section>

        {hourly ? (
          <section className="mt-14">
            <h2 className="cf-section-title">What it costs.</h2>
            <p className="mt-4 leading-8 text-ink-2">
              <strong className="font-semibold text-ink">{hourly}</strong>, with
              18% GST already included in that figure. {billingSentence(card)}
            </p>
            <p className="mt-4 leading-8 text-ink-2">
              We read that price from the same rate card billing charges from,
              so the figure on this page can&rsquo;t drift from what you&rsquo;re
              actually charged. A GST tax invoice showing the split is issued
              on every recharge.{" "}
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
          <h2 className="cf-section-title">Test it with your own scene.</h2>
          <p className="mt-3 leading-7 text-ink-2">
            Take the D5 project that ties up your machine all afternoon and run
            it on ours. You&rsquo;ll learn more from that than from any number we
            could put on this page.
          </p>
          <Link href="/signup" className="cf-btn-primary mt-6">
            Get started
          </Link>
        </section>

        <nav className="mt-14 border-t border-rule pt-8">
          <p className="cf-eyebrow mb-4">Related</p>
          <ul className="space-y-1">
            {[
              ["/d5-render-vs-local-gpu", "Renting a workstation vs buying an RTX 5080"],
              ["/cloud-rendering-for-architects", "Cloud rendering for architecture studios"],
              ["/software/twinmotion-cloud-workstation", "Twinmotion cloud workstation"],
              ["/lumion-cloud-gpu", "Lumion on a cloud RTX 5080"],
              ["/apps", "Everything preinstalled on a workstation"],
            ].map(([href, label]) => (
              <li key={href}>
                <Link
                  href={href}
                  className="inline-flex min-h-[44px] items-center text-blue hover:underline"
                >
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
