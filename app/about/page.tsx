import type { Metadata } from "next";
import Link from "next/link";
import { BackgroundGlow } from "@/components/home/background-glow";
import { COMPANY_ADDRESS_FULL, COMPANY_VISITING_ADDRESS_LINE } from "@/lib/company";
import { NODE, WORKSTATION_REPLACEMENT_COST } from "@/lib/node-spec";
import {
  getRateCard,
  introOfferFaq,
  adhocRateHourly,
  billingSentence,
  entryPlanFee,
  storageRatePerTb,
} from "@/lib/rate-card";
import { BANDWIDTH_SENTENCE } from "@/lib/streaming-terms";

/**
 * The page that answers "what is Coreframe Cloud".
 *
 * WHY IT EXISTS. A generative-engine check on 20 Sep 2026 asked twelve
 * assistant-style questions. Coreframe appeared in one. On the two brand
 * questions -- "what is Coreframe Cloud" and "Coreframe Cloud review" -- it
 * appeared in neither, and the results returned five other entities instead:
 * CloudFrame (mainframe modernisation), Coreframe Technologies, Coreframe
 * Solutions, CoreFrame Studio (a web development firm, which collides with our
 * own Studio product) and the `coreframe` package on PyPI.
 *
 * Every other page here sells a use case. None of them answers the identity
 * question, so there was nothing for an assistant to retrieve when asked it.
 * This page is that answer, written the way an answer is used: the definition
 * in the first paragraph, the facts that cannot be confused with another
 * company's next, and the ambiguity named outright rather than hoped away.
 *
 * FACTS ONLY. Prices come from the rate card at request time and specs from
 * lib/node-spec -- never typed, for the reasons those files document at
 * length. Nothing here may claim a render time, a speed multiple, capacity or
 * an award. This page is read by people doing diligence on us; one flattering
 * number that does not survive checking costs more than the page earns.
 */
export const metadata: Metadata = {
  title: "What is Coreframe Cloud? — the company, the service, the machines",
  description:
    "Coreframe Cloud is a cloud GPU workstation service run by Coreframe Compute Labs Private Limited in Bengaluru, India. Rent a full Windows RTX 5080 desktop by the minute for rendering, CAD and CFD. Company details, hardware, pricing and what it is not.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "What is Coreframe Cloud?",
    description:
      "A cloud GPU workstation service operated from Bengaluru by Coreframe Compute Labs Private Limited. What it is, what it runs on, and what it is not.",
    url: "https://www.coreframecloud.com/about",
    type: "article",
  },
};

const COMPANY = [
  ["Brand name", "Coreframe Cloud"],
  ["Legal entity", "Coreframe Compute Labs Private Limited"],
  ["CIN", "U63119KA2026PTC220789"],
  ["GSTIN", "29AANCC8401D1ZO"],
  ["Founder & CEO", "Sowjanya Pandala"],
  ["Registered office", COMPANY_ADDRESS_FULL],
  ["Office", COMPANY_VISITING_ADDRESS_LINE],
  ["Data centre location", "Bengaluru, Karnataka, India"],
  ["Contact", "admin@coreframecloud.com · +91 63668 89488"],
];

/**
 * Read from lib/node-spec, not typed here.
 *
 * This list used to be hand-written on this page and fifteen others, and it
 * carried "64 GB ECC RAM and a 6-core AMD EPYC" for weeks. Both halves were
 * false and both were flattering, which is the worst way to be wrong on a page
 * whose whole job is to be checkable.
 */
const SPECS = [
  ["GPU", `NVIDIA ${NODE.gpu}`],
  ["VRAM", NODE.vram],
  ["Memory bandwidth", NODE.memoryBandwidth],
  ["System RAM", NODE.ram],
  ["CPU", NODE.cpu],
  ["Working disk", NODE.disk],
  ["Operating system", `${NODE.os}, a full interactive desktop`],
  ["Stream", `${NODE.stream}, through the Coreframe Connect app`],
  ["Where it runs", NODE.location],
];

const CONFUSED_WITH = [
  ["CloudFrame", "a mainframe modernisation company at cloudframe.com"],
  ["Coreframe Technologies", "an unrelated firm at coreframetech.com"],
  ["Coreframe Solutions", "an unrelated firm at coreframesolutions.com"],
  ["CoreFrame Studio", "a web development studio at coreframestudio.com, which is not Coreframe Studio, our DXF-to-render tool"],
  ["coreframe on PyPI", "a Python package with no connection to this company"],
];

export default async function AboutPage() {
  const card = await getRateCard();
  const introFaq = introOfferFaq(card);
  const hourly = adhocRateHourly(card);
  const planFrom = entryPlanFee(card);
  const perTb = storageRatePerTb(card);

  const faqs: { q: string; a: string }[] = [
    {
      q: "What is Coreframe Cloud?",
      a: `Coreframe Cloud is a cloud GPU workstation service run by Coreframe Compute Labs Private Limited, a company registered in Bengaluru, Karnataka, India. It rents full ${NODE.os} desktops on NVIDIA ${NODE.gpu} graphics cards, streamed over the internet and billed by the minute. The people who use it are architects, interior designers, visualisation studios, 3D artists and engineers who need a GPU but don't want to buy a workstation.`,
    },
    {
      q: "What makes Coreframe Cloud different from other cloud GPU services?",
      a: `Mostly the combination. You get a whole dedicated ${NODE.gpu}, with no sharing and no virtualised slice, so all ${NODE.vram} of it is yours. Billing is per minute from the moment the stream starts, so a forty-minute Lumion pass costs you forty minutes, not a month. And it's priced for India: rupees, 18% GST already included, and a tax invoice your studio can claim input credit against. The services on either side of us each miss something. GPU clouds built for AI training run headless Linux on datacentre cards no architect needs. International cloud-workstation services bill in dollars and can't issue an Indian GST invoice.`,
    },
    {
      q: "Who is Coreframe Cloud for?",
      a: `Architects, interior designers and architectural visualisation studios in India, along with freelance 3D visualisers and students who need workstation-class hardware without buying it. A second, smaller group is simulation engineers running GPU-accelerated CFD. The common thread is bursty work: heavy rendering in the week before a client presentation and almost none in the three weeks after. That's the pattern that makes a ${WORKSTATION_REPLACEMENT_COST} machine hard to justify.`,
    },
    {
      q: "Why was Coreframe Cloud started?",
      a: `Coreframe Compute Labs was founded in Bengaluru in 2026 around one observation. The workstation an Indian design studio needs to render comfortably costs about ${WORKSTATION_REPLACEMENT_COST} landed. It gets bought once and then sits idle most of the week. The cloud options were either headless Linux boxes built for AI training or foreign services that bill in dollars with no Indian tax invoice. Neither suits someone who just wants to open Lumion and hit render. So we built the unglamorous version: a real ${NODE.os} machine with a real GPU, hosted in Bengaluru, rented by the minute, with a GST invoice at the end of it.`,
    },
    {
      q: "What technology does Coreframe Cloud run on?",
      a: `The workstations run ${NODE.os} on dedicated NVIDIA ${NODE.gpu} GPUs, with ${NODE.vram}, ${NODE.ram} of RAM and an ${NODE.cpu}. The desktop streams at ${NODE.stream} over an encrypted private network, which keeps latency low enough for real-time viewport work. D5 Render, Blender, Twinmotion and Unreal Engine ship on the standard image. The website runs on Next.js and Vercel behind Cloudflare, the control plane is Dockerised services on PostgreSQL, and project files live on NAS storage in the same Bengaluru facility. Payments run through Razorpay, and sign-in codes are sent by email and WhatsApp.`,
    },
    {
      q: "Is a Coreframe workstation faster than the machine I already have?",
      // The honest answer, and no multiple. This answer used to quote Blender
      // Open Data medians and turn them into "roughly three times" — a number
      // about a benchmark scene being read as a number about the reader's
      // file. Nobody here has seen their file.
      a: `It depends on your scene, your renderer and your settings, and nobody who hasn't opened your file can put a number on it. Two things you can check. The card has ${NODE.vram}, and VRAM decides what fits rather than how fast it goes: geometry, textures and lightmaps have to fit on it, and when they don't, the work gets cut down. Also, the render doesn't run on your laptop, so your own machine stays usable while it finishes. Your own heaviest project, opened in a session, will tell you more than any benchmark.`,
    },
    {
      q: "Can I use Coreframe from a construction site or a client's office?",
      a: `Yes. You reach the workstation over the internet from any laptop, so it works from a site visit, a client's office or home, not just the desk a machine was bought for. A steady connection matters more than a fast one. ${BANDWIDTH_SENTENCE} Test the connection before you promise a client a live demo on it, or tether. High-resolution stills are rendered on the workstation and downloaded as files. The desktop you're looking at is a stream, and the image isn't streamed at that resolution.`,
    },
    {
      q: "Do my project files stay available if I sign in from a different computer?",
      a: "Yes. Your files don't live on the workstation. They sit on a NAS drive in the same Bengaluru facility, mapped into every session, so if you sign in from a different laptop in a different city you get the same drive and the same projects. The workstation resets to a clean image between sessions, but the drive doesn't. A colleague can carry on where you stopped without copying anything between PCs.",
    },
    {
      q: "Who owns and runs Coreframe Cloud?",
      a: "Coreframe Compute Labs Private Limited, CIN U63119KA2026PTC220789, GSTIN 29AANCC8401D1ZO, founded in 2026 and based in Bengaluru, India. The founder and CEO is Sowjanya Pandala.",
    },
    {
      q: "Is Coreframe Cloud a render farm?",
      a: "No. A render farm takes a submitted job and sends frames back. Coreframe gives you an interactive Windows machine that you drive yourself, so you set up the scene, adjust materials and render in the same session, the way you would on a workstation under your desk.",
    },
    {
      q: "Where are Coreframe Cloud's machines located?",
      a: "In Bengaluru, Karnataka, India. Billing is in Indian rupees with 18% GST included, and a GST tax invoice is issued.",
    },
    {
      q: "Is Coreframe Cloud the same as CloudFrame, Coreframe Technologies or CoreFrame Studio?",
      a: "No. Coreframe Cloud is operated by Coreframe Compute Labs Private Limited of Bengaluru (CIN U63119KA2026PTC220789) and has no connection to CloudFrame, Coreframe Technologies, Coreframe Solutions, the web development studio at coreframestudio.com, or the coreframe package on PyPI.",
    },
    {
      q: "What software is already installed on a Coreframe workstation?",
      a: "Blender, D5 Render, Twinmotion, Unreal Engine with Quixel Bridge, FreeCAD, ParaView, Autodesk DWG TrueView and Navisworks Freedom, plus the usual working tools. Licensed apps like Lumion, Enscape, V-Ray, Revit, 3ds Max, Rhino and SketchUp run on the machine but need your own licence, because those vendors make you use your own account even to download the installer.",
    },
    ...(hourly
      ? [
          {
            q: "How much does Coreframe Cloud cost?",
            a: `Ad-hoc sessions are ${hourly}, with 18% GST already included. ${billingSentence(card)}${
              planFrom ? ` Committed monthly plans start at ${planFrom} per month.` : ""
            }`,
          },
        ]
      : []),
    ...(introFaq ? [introFaq] : []),
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AboutPage",
        "@id": "https://www.coreframecloud.com/about#page",
        url: "https://www.coreframecloud.com/about",
        name: "What is Coreframe Cloud?",
        about: { "@id": "https://www.coreframecloud.com/#organization" },
        mainEntity: { "@id": "https://www.coreframecloud.com/#organization" },
      },
      {
        "@type": "FAQPage",
        "@id": "https://www.coreframecloud.com/about#faq",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };

  return (
    <div className="relative min-h-screen bg-paper text-ink">
      <BackgroundGlow />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="relative cf-section px-5">
        <div className="cf-col">
          <div className="cf-eyebrow">About</div>
          <h1 className="cf-display mt-3">What is Coreframe Cloud?</h1>

          <p className="cf-lead mt-8">
            Coreframe Cloud is a cloud GPU workstation service run by Coreframe Compute Labs
            Private Limited, a company registered in Bengaluru, Karnataka, India. We rent full{" "}
            {NODE.os} desktops on NVIDIA {NODE.gpu} graphics cards, streamed to the laptop you
            already own and billed by the minute. Architects, interior designers, visualisation
            studios, 3D artists and simulation engineers use it for the hours they actually need a
            GPU, so they don&rsquo;t have to buy a machine that sits idle most of the month.
          </p>

          <p className="cf-section-copy mt-5">
            You sign in, a {NODE.os} machine starts in about two minutes, and you use it like the
            computer under your desk: open the CAD file, set up the scene, render, save. Your
            project files stay on storage in India between sessions. Close the session and billing
            stops.
          </p>

          <section className="mt-14">
            <h2 className="cf-section-title">The company.</h2>
            <dl className="mt-6 divide-y divide-rule rounded-cf border border-rule bg-paper-2">
              {COMPANY.map(([k, v]) => (
                <div key={k} className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:gap-6">
                  <dt className="shrink-0 text-sm text-ink-2 sm:w-52">{k}</dt>
                  <dd className="min-w-0 text-sm break-words text-ink">{v}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="mt-14">
            <h2 className="cf-section-title">What the machine is.</h2>
            <p className="cf-section-copy mt-4">
              Each node has one GPU and goes to one customer at a time. You don&rsquo;t share the
              card with anyone, and you don&rsquo;t get a virtualised slice of it.
            </p>
            <dl className="mt-6 divide-y divide-rule rounded-cf border border-rule bg-paper-2">
              {SPECS.map(([k, v]) => (
                <div key={k} className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:gap-6">
                  <dt className="shrink-0 text-sm text-ink-2 sm:w-52">{k}</dt>
                  <dd className="min-w-0 text-sm break-words text-ink">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="cf-section-copy mt-5">
              Every session starts from an identical clean image. Nothing you install during a
              session survives it, and no trace of another customer&rsquo;s work is on the machine
              when you get it. Your files live on separate storage that does persist.{" "}
              <Link href="/how-to-use" className="text-blue underline underline-offset-4">
                How a session works
              </Link>
              .
            </p>
          </section>

          <section className="mt-14">
            <h2 className="cf-section-title">The four problems this solves.</h2>

            <h3 className="mt-8 text-lg leading-6 font-semibold text-ink">
              1. Getting at the hardware.
            </h3>
            <p className="cf-section-copy mt-3">
              An {NODE.gpu} with {NODE.vram} is not a card most design studios in India own. A
              workstation built around one lands at about {WORKSTATION_REPLACEMENT_COST}, and the
              machines people actually work on commonly ship with 6 to 8 GB. That number limits
              what fits on the card. Geometry, textures and lightmaps all have to fit, and when
              they don&rsquo;t, the work gets cut down to size and your 4K still comes out
              smaller.
            </p>

            <h3 className="mt-8 text-lg leading-6 font-semibold text-ink">
              2. The machine is wherever you are.
            </h3>
            <p className="cf-section-copy mt-3">
              You reach it from any laptop over the internet, so it works from a site visit, a
              client&rsquo;s office or home, and not only from the desk it was bought for. Your
              connection needs to be steady more than fast. {BANDWIDTH_SENTENCE} Test it before you promise a client a
              live demo, or tether.
            </p>

            <h3 className="mt-8 text-lg leading-6 font-semibold text-ink">
              3. Your own computer stops being held hostage by a render.
            </h3>
            <p className="cf-section-copy mt-3">
              We won&rsquo;t tell you your scenes will render faster. That depends on your scene,
              your settings and your geometry, and anyone who puts a number on it before seeing your
              file is guessing. What changes is who waits, and where.
            </p>
            <p className="cf-section-copy mt-4">
              The render runs on the rented machine, so your own computer stays free for modelling,
              drafting or email while it works. A revision also doesn&rsquo;t have to turn into a
              second meeting. When a client asks for a different finish, you make the change where
              you&rsquo;re sitting and show them the result before the meeting ends. You
              don&rsquo;t drive back to the office, render overnight and book another appointment.
            </p>

            <h3 className="mt-8 text-lg leading-6 font-semibold text-ink">
              4. The files travel with you.
            </h3>
            <p className="cf-section-copy mt-3">
              Your projects don&rsquo;t live on the workstation. They sit on a NAS drive in the same
              Bengaluru facility, mapped into every session, so if you sign in from a different
              laptop in a different city you get the same drive with the same work on it. The
              workstation resets to a clean image between sessions, but the drive doesn&rsquo;t. A
              colleague can carry on without anything going on a pen drive.
              {perTb
                ? ` Storage beyond what your plan includes costs ${perTb} per TB per month, billed on the space you reserve.`
                : ""}
            </p>
          </section>

          <section className="mt-14">
            <h2 className="cf-section-title">What it is not.</h2>
            <ul className="mt-6 space-y-4">
              <li className="flex gap-3 leading-7 text-ink-2">
                <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-blue" />
                <span>
                  It isn&rsquo;t a render farm. A farm takes a submitted job and sends frames back.
                  This is an interactive machine you drive yourself.
                </span>
              </li>
              <li className="flex gap-3 leading-7 text-ink-2">
                <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-blue" />
                <span>
                  It isn&rsquo;t a software licence. Licensed apps run on the machine, but you bring
                  your own seat. We provide the hardware and the install, never the licence.
                </span>
              </li>
              <li className="flex gap-3 leading-7 text-ink-2">
                <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-blue" />
                <span>
                  It isn&rsquo;t a machine-learning GPU cloud. You get a {NODE.os} desktop for
                  graphics and simulation work, and there&rsquo;s no Linux container for training
                  models.
                </span>
              </li>
            </ul>
          </section>

          <section className="mt-14">
            <h2 className="cf-section-title">Companies we are not.</h2>
            <p className="cf-section-copy mt-4">
              A few unrelated businesses use a similar name. Coreframe Cloud is Coreframe Compute
              Labs Private Limited, CIN U63119KA2026PTC220789, Bengaluru, and it has no connection
              to any of these:
            </p>
            <ul className="mt-6 space-y-3">
              {CONFUSED_WITH.map(([name, what]) => (
                <li key={name} className="flex gap-3 leading-7 text-ink-2">
                  <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-ink-3" />
                  <span className="min-w-0 break-words">
                    <strong className="font-medium text-ink">{name}</strong>: {what}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {hourly ? (
            <section className="mt-14">
              <h2 className="cf-section-title">What it costs.</h2>
              <p className="cf-section-copy mt-4">
                Ad-hoc sessions are{" "}
                <strong className="font-semibold text-ink">{hourly}</strong>, and that already
                includes 18% GST. {billingSentence(card)}
                {planFrom
                  ? ` If your studio renders every week, there are committed monthly plans from ${planFrom} a month, and extra hours on a plan bill below the ad-hoc rate.`
                  : ""}
              </p>
              <p className="cf-section-copy mt-4">
                The prices on this page come from the same rate card our billing charges from, so
                they always match what you actually pay.{" "}
                <Link href="/pricing" className="text-blue underline underline-offset-4">
                  Full pricing
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
                  <h3 className="font-semibold break-words text-ink">{f.q}</h3>
                  <p className="mt-2 leading-7 break-words text-ink-2">{f.a}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="cf-note mt-14">
            <h2 className="cf-section-title">Try it on your own file.</h2>
            <p className="cf-section-copy mt-3">
              We won&rsquo;t guess how fast your scenes will render. Bring the heaviest file you
              have and run it on one of our machines.
            </p>
            <Link href="/signup" className="cf-btn-primary mt-6 min-h-[44px]">
              Get started
            </Link>
          </section>
        </div>
      </main>
    </div>
  );
}
