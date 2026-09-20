import type { Metadata } from "next";
import Link from "next/link";
import { BackgroundGlow } from "@/components/home/background-glow";
import {
  getRateCard,
  getTrialTerms,
  adhocRateHourly,
  billingSentence,
  pricingFaqAnswer,
} from "@/lib/rate-card";

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

const SPECS = [
  ["GPU", "NVIDIA RTX 5080"],
  ["VRAM", "16 GB GDDR7"],
  ["System RAM", "64 GB ECC"],
  ["CPU", "6-core AMD EPYC"],
  ["Display driver", "WDDM, which D5 needs for real-time viewport work"],
  ["D5 Render", "Preinstalled — sign in with your own D5 account"],
  ["Storage", "Persistent project storage, separate from the machine"],
  ["Location", "Bengaluru, Karnataka, India"],
];

export default async function D5Page() {
  const card = await getRateCard();
  const trial = getTrialTerms(card);
  const hourly = adhocRateHourly(card);
  const priceAnswer = pricingFaqAnswer(card);

  const faqs: { q: string; a: string }[] = [
    {
      q: "Can I run D5 Render on a cloud workstation?",
      a: "Yes. Coreframe gives you a full Windows desktop with an NVIDIA RTX 5080, and D5 Render is already installed on it. You sign in with your own D5 account, open your project and work in the live viewport exactly as you would on a local machine. It is the real application, not a web version of it.",
    },
    {
      q: "Is D5 Render included, or do I need my own licence?",
      a: "The application is installed for you, so you never spend paid minutes downloading it. The account is yours: you sign in with your own D5 credentials, and whatever plan you hold with D5 is what applies. We supply the machine, not the licence.",
    },
    {
      q: "Is this the same as a render farm?",
      a: "No. A render farm takes a finished scene, renders frames on machines you never see, and sends images back. Coreframe hands you the machine itself. You can move the camera, change a material, relight the scene and re-render in the same session, which is how D5 is actually used — the feedback loop is the point of a real-time renderer.",
    },
    {
      q: "How much VRAM does D5 Render need?",
      a: "VRAM is the ceiling on scene size in any GPU renderer: geometry, textures and lightmaps all have to fit on the card. The RTX 5080 in a Coreframe workstation has 16 GB of GDDR7. Many laptops and entry desktops sold for design work ship with 6 to 8 GB, which is what forces people to cut texture resolution or split a scene. We will not predict how your particular scene behaves — run it on a trial session and watch the VRAM meter yourself.",
    },
    {
      q: "What happens to my D5 project files when the session ends?",
      a: "Every session starts from an identical clean machine, so anything installed during a session is gone when it ends. Your project files do not live on that machine — they sit on persistent storage that carries over, so a session opened on Friday picks up where Monday's stopped. The clean reset is what guarantees no trace of another customer's work, or yours, is left behind.",
    },
    {
      q: "Can I use D5 Render with Revit, SketchUp, Rhino or 3ds Max on the same machine?",
      a: "Yes. It is an ordinary Windows desktop, so the D5 plugins and the host applications sit side by side. Blender and Twinmotion are preinstalled alongside D5. Revit, SketchUp, Rhino, 3ds Max and similar licensed applications run on the machine but need your own licence, because those vendors require your own account even to download the installer.",
    },
    {
      q: "What internet speed do I need to use a Coreframe workstation?",
      a: "You are streaming a desktop, so what matters is a steady connection rather than a fast one. Around 25 Mbps with stable latency is a comfortable working floor. Rendering happens on the workstation in Bengaluru, and a finished 4K or 8K still is a file you download, not something streamed frame by frame.",
    },
    ...(priceAnswer ? [{ q: "How much does it cost to render in D5 on Coreframe?", a: priceAnswer }] : []),
    ...(trial?.enabled
      ? [
          {
            q: "Can I try it before paying?",
            a: `Yes — ${trial.gpu_minutes} free GPU minutes valid for ${trial.gpu_validity_days} days, with no card required.${
              trial.requires_identity_verification
                ? " Identity verification through DigiLocker is required first, because Indian regulations require a verified subscriber record for rented compute."
                : ""
            } We make no claim about what you can finish in that time — it depends entirely on your scene. Use it to open your heaviest project and see how the machine behaves.`,
          },
        ]
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
    <div className="relative min-h-screen text-white">
      <BackgroundGlow />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="relative mx-auto max-w-3xl px-6 pb-24 pt-20 md:pt-28">
        <div className="text-sm font-medium uppercase tracking-[0.25em] text-cyan-300">
          D5 Render
        </div>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
          Run D5 Render on a rented RTX 5080.
        </h1>

        <p className="mt-8 text-lg leading-8 text-slate-200">
          Coreframe gives you a full Windows desktop with an NVIDIA RTX 5080, D5
          Render already installed, streamed to whatever laptop you own and
          billed by the minute. You sign in with your own D5 account, open your
          project and work in the live viewport — the real application on real
          hardware, not a web preview and not a queue.
        </p>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold tracking-tight">
            The problem D5 users actually have
          </h2>
          <p className="mt-4 leading-8 text-slate-300">
            D5 is a real-time renderer, which is exactly why weak hardware hurts
            so much. The whole reason to use it is that you move the camera and
            the image resolves while you watch. On an underpowered card that loop
            breaks: the viewport stutters, you stop exploring options, and a 4K
            still becomes something you set running and walk away from.
          </p>
          <p className="mt-4 leading-8 text-slate-300">
            The usual answer is to buy a workstation. A machine that renders
            comfortably lands at roughly ₹5,00,000 in India, gets bought once,
            and sits idle most of the week — because visualisation work is
            bursty. You need serious hardware for the four days before a client
            presentation and almost none for the three weeks after it.
          </p>
          <p className="mt-4 leading-8 text-slate-300">
            Renting inverts that. The machine exists when the deadline does.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold tracking-tight">The machine</h2>
          <dl className="mt-6 divide-y divide-white/[0.08] rounded-2xl border border-white/[0.08] bg-white/[0.02]">
            {SPECS.map(([k, v]) => (
              <div key={k} className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:gap-6">
                <dt className="w-52 shrink-0 text-sm text-slate-400">{k}</dt>
                <dd className="text-sm text-slate-100">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-5 leading-8 text-slate-300">
            One node, one GPU, one customer at a time — no shared card and no
            virtualised slice of one. The comparison worth making is VRAM, not
            speed: many laptops and entry desktops sold for design work carry 6
            to 8 GB, and that is the number that decides whether a scene loads at
            full texture resolution or has to be cut down. We do not publish
            render times, because they depend entirely on your scene, your
            settings and your geometry.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold tracking-tight">
            How a session works
          </h2>
          <ol className="mt-6 space-y-5">
            {[
              "Sign in and start a workstation. It comes up in about two minutes, and provisioning is free — billing starts when the stream does.",
              "Your project files are already there, on persistent storage that survives between sessions. Nothing has to be copied onto the machine each time.",
              "Open D5, sign in with your own account, and work. Twinmotion, Blender and Unreal Engine are on the same desktop if you need them.",
              "Render at full resolution on the workstation. The finished image is a file you download, not something streamed pixel by pixel.",
              "Close the session. Billing stops, the machine is wiped back to a clean image, and your files stay where they were.",
            ].map((step, i) => (
              <li key={i} className="flex gap-4 leading-8 text-slate-300">
                <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-cyan-400/30 text-sm text-cyan-300">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <p className="mt-5 leading-8 text-slate-300">
            <Link href="/how-to-use" className="text-cyan-300 underline underline-offset-4">
              The full setup walkthrough
            </Link>{" "}
            covers installing Coreframe Connect and the identity check.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold tracking-tight">
            The revision that happens in the room
          </h2>
          <p className="mt-4 leading-8 text-slate-300">
            The version of this that studios feel most is the client meeting. A
            client asks for the kitchen in a different finish, and the normal
            answer is to go back to the office, re-render overnight and book a
            second meeting. With the workstation reachable from a laptop, the
            change can be made where you are sitting and the result put on the
            client&rsquo;s own screen before the meeting ends.
          </p>
          <p className="mt-4 leading-8 text-slate-300">
            Two honest caveats. Test the connection at the client&rsquo;s office
            first, or tether — a demo that stalls in front of their client is
            worse than not offering it. And the high-resolution still is a file
            rendered on the workstation, not a live stream at that resolution.
          </p>
        </section>

        {hourly ? (
          <section className="mt-14">
            <h2 className="text-2xl font-semibold tracking-tight">What it costs</h2>
            <p className="mt-4 leading-8 text-slate-300">
              <strong className="font-semibold text-white">{hourly}</strong>, with
              18% GST already included in that figure. {billingSentence(card)}
            </p>
            <p className="mt-4 leading-8 text-slate-300">
              That price is read from the same rate card the billing system
              charges from, so a figure on this page cannot drift from what you
              are actually charged. A GST tax invoice showing the split is issued
              on every recharge.{" "}
              <Link href="/#pricing" className="text-cyan-300 underline underline-offset-4">
                Full pricing and monthly plans
              </Link>
              .
            </p>
          </section>
        ) : null}

        <section className="mt-14">
          <h2 className="text-2xl font-semibold tracking-tight">Questions</h2>
          <div className="mt-6 space-y-7">
            {faqs.map((f) => (
              <div key={f.q}>
                <h3 className="font-semibold text-white">{f.q}</h3>
                <p className="mt-2 leading-7 text-slate-400">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14 rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.05] p-6">
          <h2 className="text-lg font-semibold">Test it with your own scene</h2>
          <p className="mt-3 leading-7 text-slate-300">
            Take the D5 project that ties up your machine all afternoon and run
            it on ours. That answers the question better than any number we could
            put on this page.
          </p>
          <Link
            href="/signup"
            className="mt-5 inline-block rounded-lg bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-300"
          >
            Start free
          </Link>
        </section>

        <nav className="mt-14 border-t border-white/[0.08] pt-8">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-white/40">
            Related
          </h2>
          <ul className="mt-4 space-y-2">
            {[
              ["/d5-render-vs-local-gpu", "Renting a workstation vs buying an RTX 5080"],
              ["/cloud-rendering-for-architects", "Cloud rendering for architecture studios"],
              ["/software/twinmotion-cloud-workstation", "Twinmotion cloud workstation"],
              ["/lumion-cloud-gpu", "Lumion on a cloud RTX 5080"],
              ["/apps", "Everything preinstalled on a workstation"],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="text-cyan-300 hover:underline">
                  {label} →
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </main>
    </div>
  );
}
