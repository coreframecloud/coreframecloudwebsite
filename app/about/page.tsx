import type { Metadata } from "next";
import Link from "next/link";
import { BackgroundGlow } from "@/components/home/background-glow";
import {
  getRateCard,
  getTrialTerms,
  adhocRateHourly,
  billingSentence,
  entryPlanFee,
} from "@/lib/rate-card";

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
 * FACTS ONLY. Prices come from the rate card at request time -- never typed,
 * for the reason lib/rate-card.ts documents at length. Nothing here may claim a
 * render time, a speed multiple, capacity, or an award.
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
  ["Registered office", "Kadubeesanahalli, Bengaluru, Karnataka 560087, India"],
  ["Data centre location", "Bengaluru, Karnataka, India"],
  ["Contact", "admin@coreframecloud.com · +91 63668 89488"],
];

const SPECS = [
  ["GPU", "NVIDIA RTX 5080"],
  ["VRAM", "16 GB GDDR7"],
  ["System RAM", "64 GB ECC"],
  ["CPU", "6-core AMD EPYC"],
  ["Operating system", "Windows 11, full interactive desktop"],
  ["Network", "Dedicated 1 Gbps"],
  ["Access", "Coreframe Connect, streamed over an encrypted private network"],
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
  const trial = getTrialTerms(card);
  const hourly = adhocRateHourly(card);
  const planFrom = entryPlanFee(card);

  const faqs: { q: string; a: string }[] = [
    {
      q: "What is Coreframe Cloud?",
      a: "Coreframe Cloud is a cloud GPU workstation service operated by Coreframe Compute Labs Private Limited, a company registered in Bengaluru, Karnataka, India. It rents full Windows desktops running on NVIDIA RTX 5080 graphics cards, streamed over the internet and billed by the minute, to architects, interior designers, visualisation studios, 3D artists and engineers who need GPU power without buying a workstation.",
    },
    {
      q: "Who owns and runs Coreframe Cloud?",
      a: "Coreframe Compute Labs Private Limited, CIN U63119KA2026PTC220789, GSTIN 29AANCC8401D1ZO, founded in 2026 and based in Bengaluru, India. The founder and CEO is Sowjanya Pandala.",
    },
    {
      q: "Is Coreframe Cloud a render farm?",
      a: "No. A render farm takes a submitted job and sends frames back. Coreframe gives you an interactive Windows machine that you drive yourself, so you set up the scene, adjust materials and render in the same session, exactly as you would on a workstation under your desk.",
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
      a: "Blender, D5 Render, Twinmotion, Unreal Engine with Quixel Bridge, FreeCAD, ParaView, Autodesk DWG TrueView and Navisworks Freedom, plus the usual working tools. Licensed applications such as Lumion, Enscape, V-Ray, Revit, 3ds Max, Rhino and SketchUp run on the machine but need your own licence, because those vendors require your own account even to download the installer.",
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
    ...(trial?.enabled
      ? [
          {
            q: "Is there a free trial?",
            a: `Yes — ${trial.gpu_minutes} free GPU minutes valid for ${trial.gpu_validity_days} days, and ${trial.storage_gb} GB of free storage for ${trial.storage_validity_days} days, with no card required.${
              trial.requires_identity_verification
                ? " Identity verification through DigiLocker is required before the trial starts, because Indian regulations require a verified subscriber record for rented compute."
                : ""
            }`,
          },
        ]
      : []),
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
    <div className="relative min-h-screen text-white">
      <BackgroundGlow />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="relative mx-auto max-w-3xl px-6 pb-24 pt-20 md:pt-28">
        <div className="text-sm font-medium uppercase tracking-[0.25em] text-cyan-300">
          About
        </div>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
          What is Coreframe Cloud?
        </h1>

        <p className="mt-8 text-lg leading-8 text-slate-200">
          Coreframe Cloud is a cloud GPU workstation service operated by{" "}
          <strong className="font-semibold text-white">
            Coreframe Compute Labs Private Limited
          </strong>
          , a company registered in Bengaluru, Karnataka, India. It rents full
          Windows desktops running on NVIDIA RTX 5080 graphics cards, streamed
          to whatever laptop you already own and billed by the minute. Architects,
          interior designers, visualisation studios, 3D artists and simulation
          engineers use it to get workstation-class hardware for the hours they
          actually need it, instead of buying a machine that sits idle most of
          the month.
        </p>

        <p className="mt-5 leading-8 text-slate-300">
          You sign in, a Windows machine starts in about two minutes, and you
          work on it as you would on a computer under your desk — open your CAD
          file, set up the scene, render, save. Project files stay on storage in
          India between sessions. When you close the session, billing stops.
        </p>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold tracking-tight">The company</h2>
          <dl className="mt-6 divide-y divide-white/[0.08] rounded-2xl border border-white/[0.08] bg-white/[0.02]">
            {COMPANY.map(([k, v]) => (
              <div key={k} className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:gap-6">
                <dt className="w-56 shrink-0 text-sm text-slate-400">{k}</dt>
                <dd className="text-sm text-slate-100">{v}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold tracking-tight">What the machine is</h2>
          <p className="mt-4 leading-8 text-slate-300">
            One node, one GPU, handed to one customer at a time. There is no
            shared graphics card and no virtualised slice of one.
          </p>
          <dl className="mt-6 divide-y divide-white/[0.08] rounded-2xl border border-white/[0.08] bg-white/[0.02]">
            {SPECS.map(([k, v]) => (
              <div key={k} className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:gap-6">
                <dt className="w-56 shrink-0 text-sm text-slate-400">{k}</dt>
                <dd className="text-sm text-slate-100">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-5 leading-8 text-slate-300">
            Each session starts from an identical clean image, so nothing you
            install during a session survives it and no trace of another
            customer&rsquo;s work is on the machine when you get it. Your files
            live on separate storage that does persist.{" "}
            <Link href="/how-to-use" className="text-cyan-300 underline underline-offset-4">
              How a session works
            </Link>
            .
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold tracking-tight">What it is not</h2>
          <ul className="mt-6 space-y-4">
            <li className="flex gap-3 leading-8 text-slate-300">
              <span className="mt-3.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400/70" />
              <span>
                <strong className="text-white">Not a render farm.</strong> A farm
                takes a submitted job and returns frames. This is an interactive
                machine you drive yourself.
              </span>
            </li>
            <li className="flex gap-3 leading-8 text-slate-300">
              <span className="mt-3.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400/70" />
              <span>
                <strong className="text-white">Not a software licence.</strong>{" "}
                Licensed applications run on the machine, but you bring your own
                seat. We provide hardware and the install, never the licence.
              </span>
            </li>
            <li className="flex gap-3 leading-8 text-slate-300">
              <span className="mt-3.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400/70" />
              <span>
                <strong className="text-white">Not a machine-learning GPU cloud.</strong>{" "}
                It is a Windows desktop for graphics and simulation work, not a
                Linux container for training models.
              </span>
            </li>
          </ul>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold tracking-tight">
            Companies we are not
          </h2>
          <p className="mt-4 leading-8 text-slate-300">
            Several unrelated businesses use a similar name. For the avoidance of
            doubt, Coreframe Cloud is Coreframe Compute Labs Private Limited, CIN
            U63119KA2026PTC220789, Bengaluru. It has no connection to:
          </p>
          <ul className="mt-6 space-y-3">
            {CONFUSED_WITH.map(([name, what]) => (
              <li key={name} className="flex gap-3 leading-7 text-slate-400">
                <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-white/20" />
                <span>
                  <strong className="font-medium text-slate-200">{name}</strong> — {what}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {hourly ? (
          <section className="mt-14">
            <h2 className="text-2xl font-semibold tracking-tight">What it costs</h2>
            <p className="mt-4 leading-8 text-slate-300">
              Ad-hoc sessions are{" "}
              <strong className="font-semibold text-white">{hourly}</strong>, with
              18% GST already included in that figure.{" "}
              {billingSentence(card)}
              {planFrom
                ? ` Studios that render every week take a committed monthly plan instead, from ${planFrom} a month, which bills extra hours below the ad-hoc rate.`
                : ""}
            </p>
            <p className="mt-4 leading-8 text-slate-300">
              Prices on this page are read from the same rate card the billing
              system charges from, so they cannot drift from what you are
              actually charged.{" "}
              <Link href="/#pricing" className="text-cyan-300 underline underline-offset-4">
                Full pricing
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
          <h2 className="text-lg font-semibold">Try it on your own file</h2>
          <p className="mt-3 leading-7 text-slate-300">
            We will not tell you how fast your scenes will render — that depends
            entirely on your scenes. Take the heaviest file you have and run it
            on one of our machines instead.
          </p>
          <Link
            href="/signup"
            className="mt-5 inline-block rounded-lg bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-300"
          >
            Start free
          </Link>
        </section>
      </main>
    </div>
  );
}
