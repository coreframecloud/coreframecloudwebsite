import Image from "next/image";
import Link from "next/link";
import { NODE } from "@/lib/node-spec";
import { hoursLabel, type IntroOffer, type LadderRanges, introMoreGpusNote, introPrice } from "@/lib/rate-card";
import type { Currency } from "@/lib/money";
import { Reveal } from "@/components/home/redesign/reveal";
import { ParallaxBg } from "@/components/home/redesign/depth";
import { StreamDiagram } from "@/components/visuals/diagrams";
import { Marquee } from "@/components/motion/marquee";
import { PREINSTALLED } from "@/lib/software-catalogue";
import { SOFTWARE_DIRECTORY } from "@/lib/software-facts";
import { visiblePosts } from "@/lib/blog";

/** Creative apps from the live software catalogue (lib/software-catalogue). */
const MARQUEE_APPS = PREINSTALLED.filter((s) => s.category === "3D & rendering" || s.category === "Images & textures").map(
  (s) => s.name,
);

/**
 * Dark band: what you get, as facts only. A real Blender screenshot from a
 * session sits behind at low opacity. The one speed multiple carries its
 * source on the same line, or it does not appear at all.
 */
export function FactsBand({ currency = "INR", ladder = null }: { currency?: Currency; ladder?: LadderRanges | null }) {
  const usdView = currency === "USD";
  // The GPU ladder from the live rate card (owner, 21 Oct 2026): one GPU
  // today, a range once more profiles are public. Never a typed GPU name.
  const many = (ladder?.count ?? 0) > 1;
  const facts = [
    ladder
      ? { k: ladder.gpu, v: many ? "Your choice of GPU, a whole card each" : "A whole card, not a shared slice of one" }
      : { k: "A dedicated GPU", v: "A whole card, not a shared slice of one" },
    ladder
      ? { k: `${ladder.vram} VRAM`, v: "What decides whether your scene fits" }
      : { k: "Workstation-class VRAM", v: "What decides whether your scene fits" },
    ladder ? { k: `${ladder.cpu} · ${ladder.ram} RAM`, v: "Big scenes and a lot open at once" } : { k: "Workstation CPU and RAM", v: "Big scenes and a lot open at once" },
    { k: NODE.stream, v: "Streamed to the laptop you own" },
    usdView
      ? { k: "Hosted in India", v: "Billed in US dollars" }
      : { k: "Hosted in India", v: "Close to you, billed in rupees" },
    usdView
      ? { k: "No GST", v: "Charged per minute, nothing to cancel" }
      : { k: "GST included", v: "Charged per minute, nothing to cancel" },
  ];
  return (
    <section className="relative isolate overflow-hidden bg-night py-24 text-white sm:py-28">
      <ParallaxBg src="/home/blender-optix.webp" className="opacity-[0.16]" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-night via-night/60 to-night" />
      <div className="cfh-wrap grid gap-14 lg:grid-cols-[0.9fr_1.1fr]">
        <Reveal>
          <h2 className="cfh-h2">What&rsquo;s in the box</h2>
          <p className="mt-4 max-w-[26rem] text-[17px] leading-[1.6] text-white/85">
            Read off the hardware, not rounded up. Every GPU on offer, with its price, is on the pricing page.
          </p>
          <p className="mt-8 max-w-[28rem] text-[14px] leading-[1.6] text-white/75">
            In Blender Cycles our base node&rsquo;s RTX 5080 scores about 3× an RTX 4060: medians of 9,138 vs 3,182
            on Blender Open Data 4.5.0, read 20 Sep 2026 (opendata.blender.org). D5, Lumion and
            Enscape are different renderers and may not scale the same way.
          </p>
        </Reveal>
        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2">
          {facts.map((f, i) => (
            <Reveal key={f.k} delay={0.05 * i} className="bg-night/90 p-6">
              <p className="font-heading text-[19px] font-medium">{f.k}</p>
              <p className="mt-1.5 text-[14px] text-white/75">{f.v}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Who it's for: one quiet row, the software each kind of user opens. Each
 * application is a link to its own page (SEO plan, 22 Oct 2026): the
 * homepage is the most-linked page on the site and until now sent no link to
 * the /software pages, which is where the non-brand searches land.
 */
export function BuiltFor() {
  const rows: { who: string; apps: [string, string][] }[] = [
    {
      who: "Interior designers",
      apps: [
        ["D5 Render", "/d5-render-cloud-workstation"],
        ["Lumion", "/lumion-cloud-gpu"],
      ],
    },
    {
      who: "Architects",
      apps: [
        ["Twinmotion", "/software/twinmotion-cloud-workstation"],
        ["Enscape", "/enscape-cloud-gpu"],
        ["Revit", "/software/revit-cloud-workstation"],
      ],
    },
    {
      who: "3D visualisers",
      apps: [
        ["Blender", "/software/blender-cloud-workstation"],
        ["3ds Max", "/software/3ds-max-cloud-workstation"],
      ],
    },
    {
      who: "Motion designers",
      apps: [
        ["After Effects", "/software/after-effects-premiere-cloud-workstation"],
        ["Premiere Pro", "/software/after-effects-premiere-cloud-workstation"],
      ],
    },
  ];
  return (
    <section className="cfh-wrap py-24 sm:py-28">
      <Reveal className="max-w-[40rem]">
        <h2 className="cfh-h2">Built for the people who wait on renders</h2>
        <p className="mt-4 text-[17px] leading-[1.6] text-ink-2">
          Open the tools you already use, on a machine that doesn&rsquo;t make you wait.
        </p>
      </Reveal>
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {rows.map((r, i) => (
          <Reveal key={r.who} delay={0.06 * i} className="rounded-2xl border border-rule p-6">
            <p className="font-heading text-[18px] font-medium">{r.who}</p>
            <p className="mt-2 text-[14px] leading-[1.55] text-ink-2">
              {r.apps.map(([label, href], j) => (
                <span key={label}>
                  {j > 0 ? " · " : ""}
                  <Link href={href} className="underline decoration-rule underline-offset-4 transition hover:text-ink hover:decoration-ink">
                    {label}
                  </Link>
                </span>
              ))}
            </p>
          </Reveal>
        ))}
      </div>
      <Reveal className="mt-10">
        <p className="text-[11.5px] font-semibold tracking-[0.12em] text-ink-2 uppercase">Preinstalled on every workstation</p>
        <Marquee items={MARQUEE_APPS} label="Preinstalled on every workstation" className="mt-4 font-heading text-[17px] text-ink sm:text-[19px]" />
      </Reveal>
      {/* The full directory, one line, quiet: every application page on the site. */}
      <Reveal className="mt-8">
        <p className="text-[14px] leading-[1.7] text-ink-2">
          <span className="text-ink-3">Also on a Coreframe workstation: </span>
          {SOFTWARE_DIRECTORY.filter((s) => !["d5-render-cloud-workstation", "lumion-cloud-gpu", "enscape-cloud-gpu", "twinmotion-cloud-workstation", "revit-cloud-workstation", "blender-cloud-workstation", "3ds-max-cloud-workstation", "after-effects-premiere-cloud-workstation"].some((slug) => s.href.endsWith(slug))).map((s, j) => (
            <span key={s.href}>
              {j > 0 ? " · " : ""}
              <Link href={s.href} className="underline decoration-rule underline-offset-4 transition hover:text-ink hover:decoration-ink">
                {s.short}
              </Link>
            </span>
          ))}
          {" · "}
          <Link href="/apps" className="underline decoration-rule underline-offset-4 transition hover:text-ink hover:decoration-ink">
            everything preinstalled
          </Link>
        </p>
      </Reveal>
    </section>
  );
}

/**
 * The three newest posts (SEO plan, 22 Oct 2026). Blog posts had 2-5
 * internal links each and the homepage none; a post that answers a question
 * people type ("can my laptop run D5 Render") deserves a link from the page
 * every crawler starts on. Renders nothing until there is a post to show.
 */
export function LatestPosts() {
  const posts = visiblePosts()
    .slice()
    .sort((a, b) => new Date(b.datePublished).getTime() - new Date(a.datePublished).getTime())
    .slice(0, 3);
  if (!posts.length) return null;
  return (
    <section className="cfh-wrap pb-24 sm:pb-28">
      <Reveal className="max-w-[40rem]">
        <h2 className="cfh-h2">From the blog</h2>
        <p className="mt-4 text-[17px] leading-[1.6] text-ink-2">
          What needs a GPU, what it costs to rent one, and full sessions on a cloud workstation.
        </p>
      </Reveal>
      <ul className="mt-10 grid gap-4 sm:grid-cols-3">
        {posts.map((p, i) => (
          <li key={p.slug}>
            <Reveal delay={0.06 * i} className="h-full rounded-2xl border border-rule p-6">
              <p className="text-[11.5px] font-semibold tracking-[0.12em] text-ink-2 uppercase">{p.eyebrow}</p>
              <Link href={`/blog/${p.slug}`} className="mt-3 block font-heading text-[18px] leading-[1.3] font-medium text-ink hover:underline">
                {p.title}
              </Link>
              <p className="mt-3 text-[14px] leading-[1.55] text-ink-2">{p.description}</p>
            </Reveal>
          </li>
        ))}
      </ul>
      <Reveal className="mt-8">
        <Link href="/blog" className="cfh-link text-ink">
          All posts <span aria-hidden>↗</span>
        </Link>
      </Reveal>
    </section>
  );
}

/**
 * The offer, on our own Blender render of a calendar (top up on the 1st, use
 * by the 30th) at partial opacity. Every figure comes from the live rate card;
 * a missing value removes its line rather than showing a stale one.
 */
export function OfferBand({
  adhocRate,
  intro,
  currency = "INR",
}: {
  adhocRate?: string;
  /** In the page's currency (introOfferFor), or null when none is published. */
  intro: IntroOffer | null;
  currency?: Currency;
}) {
  return (
    <section className="cfh-wrap pb-24 sm:pb-28">
      <Reveal className="relative isolate overflow-hidden rounded-[32px] bg-night px-7 py-14 text-white sm:px-14 sm:py-20">
        <Image
          src="/home/calendar.webp"
          alt=""
          fill
          sizes="(max-width: 1180px) 100vw, 1180px"
          className="-z-20 object-cover object-[50%_65%] opacity-40"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-night via-night/75 to-night/20" />
        <div className="max-w-[34rem]">
          <h2 className="cfh-h2">Start with one top-up</h2>
          {intro ? (
            <p className="mt-5 font-heading text-[28px] font-medium sm:text-[34px]">
              {introPrice(intro)} = {hoursLabel(intro.hours)}
              {intro.gpuName ? <span className="text-white/75"> on the {intro.gpuName}</span> : null}
            </p>
          ) : null}
          <ul className="mt-5 space-y-2 text-[16px] leading-[1.55] text-white/85">
            {intro && introMoreGpusNote(intro) ? <li>{cap(introMoreGpusNote(intro).trim().replace(/^\(|\)$/g, ""))}.</li> : null}
            {intro?.validityDays ? <li>Use it within {intro.validityDays} days.</li> : null}
            {adhocRate ? (
              <li>
                {intro ? "After that, " : ""}
                {adhocRate} an hour, {currency === "USD" ? "no GST" : "GST included"}, charged per minute.
              </li>
            ) : null}
            <li>Sign up with your email and a WhatsApp code. No monthly plan.</li>
          </ul>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/signup" className="cfh-pill-light">
              Sign up
            </Link>
            <Link href="/pricing" className="cfh-pill-ghost">
              Full pricing
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/**
 * "What is Coreframe?" (owner, 30 Oct 2026: answer-engine optimisation).
 * Buyers ask assistants for a "virtual workstation with a GPU on the cloud",
 * so the home page states what Coreframe is in the few plain sentences an
 * answer would quote whole. Facts only; the price is the live "from" rate in
 * the page's own currency, and the sentence drops it when there is none.
 */
export function WhatIsCoreframe({ fromRate, currency = "INR" }: { fromRate?: string; currency?: Currency }) {
  const price = fromRate ? ` from ${fromRate} an hour${currency === "USD" ? "" : " including GST"}` : "";
  return (
    <section className="cfh-wrap pt-16 sm:pt-20" aria-labelledby="what-is-coreframe">
      <Reveal className="max-w-[46rem]">
        <h2 id="what-is-coreframe" className="cfh-h2">What is Coreframe?</h2>
        <p className="mt-5 text-[17px] leading-[1.65] text-ink-2">
          Coreframe Cloud is a ready-to-work cloud virtual workstation: a full Windows desktop with a
          dedicated NVIDIA RTX GPU and design software such as D5 Render, Blender, Twinmotion and
          Unreal Engine already installed, streamed to your own PC through the Coreframe Connect app.
          It is ready in four clicks and billed per minute{price}, and the files you upload stay
          between sessions. All infrastructure and data are in India, run by a Bengaluru company that
          also offers CFD for ducts, pipes and HVAC rooms, and Studio concept images from a floor plan.
        </p>
        <p className="mt-5 text-[14px] leading-[1.6] text-ink-2">
          <Link
            href="/virtual-workstation-vs-gpu-server"
            className="underline decoration-rule underline-offset-4 transition hover:text-ink hover:decoration-ink"
          >
            How a ready-to-work workstation differs from a bare GPU server, and common questions
          </Link>
        </p>
      </Reveal>
    </section>
  );
}

/** How it works in three steps, carried by the stream diagram. */
export function HowItWorks() {
  const steps = ["Sign up with email and mobile", "Top up by UPI or card", "Pick a GPU and launch it from the app"];
  return (
    <section className="cfh-wrap pb-24 sm:pb-28">
      <Reveal className="grid items-center gap-10 rounded-[32px] bg-tint-blue p-7 sm:p-12 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <h2 className="cfh-h2">Three steps. Then it feels local.</h2>
          <ol data-cf-steps="" className="mt-7 space-y-3">
            {steps.map((t, i) => (
              <li key={t} className="flex items-center gap-4 text-[16px] text-ink">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink font-heading text-[15px] text-white">{i + 1}</span>
                {t}
              </li>
            ))}
          </ol>
        </div>
        <div className="min-w-0 rounded-[24px] bg-paper p-5 sm:p-7">
          <StreamDiagram />
        </div>
      </Reveal>
    </section>
  );
}

/** "or about 18 hours ..." -> "Or about 18 hours ...". */
function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
