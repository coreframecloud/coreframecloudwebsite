import Image from "next/image";
import Link from "next/link";
import { NODE } from "@/lib/node-spec";
import { hoursLabel, type IntroOffer, introPrice } from "@/lib/rate-card";
import type { Currency } from "@/lib/money";
import { Reveal } from "@/components/home/redesign/reveal";
import { ParallaxBg } from "@/components/home/redesign/depth";
import { StreamDiagram } from "@/components/visuals/diagrams";
import { Marquee } from "@/components/motion/marquee";
import { PREINSTALLED } from "@/lib/software-catalogue";

/** Creative apps from the live software catalogue (lib/software-catalogue). */
const MARQUEE_APPS = PREINSTALLED.filter((s) => s.category === "3D & rendering" || s.category === "Images & textures").map(
  (s) => s.name,
);

/**
 * Dark band: what you get, as facts only. A real Blender screenshot from a
 * session sits behind at low opacity. The one speed multiple carries its
 * source on the same line, or it does not appear at all.
 */
export function FactsBand({ currency = "INR" }: { currency?: Currency }) {
  const usdView = currency === "USD";
  const facts = [
    { k: `${NODE.gpu} · ${NODE.vram}`, v: "Current-generation graphics card" },
    { k: NODE.cpuShort, v: "High-performance CPU" },
    { k: `${NODE.ram} RAM`, v: "Big scenes and a lot open at once" },
    { k: NODE.stream, v: "Streamed to the laptop you own" },
    usdView
      ? { k: "Hosted in Bengaluru", v: "Billed in US dollars" }
      : { k: "Hosted in Bengaluru", v: "Close to you, billed in rupees" },
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
            The same machine for every customer, read off the hardware, not rounded up.
          </p>
          <p className="mt-8 max-w-[28rem] text-[14px] leading-[1.6] text-white/75">
            In Blender Cycles the RTX 5080 scores about 3× an RTX 4060: medians of 9,138 vs 3,182
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

/** Who it's for: one quiet row, the software each kind of user opens. */
export function BuiltFor() {
  const rows = [
    { who: "Interior designers", apps: "D5 Render · Lumion" },
    { who: "Architects", apps: "Twinmotion · Enscape · Revit" },
    { who: "3D visualisers", apps: "Blender · 3ds Max" },
    { who: "Motion designers", apps: "After Effects · Premiere Pro" },
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
            <p className="mt-2 text-[14px] leading-[1.55] text-ink-2">{r.apps}</p>
          </Reveal>
        ))}
      </div>
      <Reveal className="mt-10">
        <p className="text-[11.5px] font-semibold tracking-[0.12em] text-ink-2 uppercase">Preinstalled on every workstation</p>
        <Marquee items={MARQUEE_APPS} label="Preinstalled on every workstation" className="mt-4 font-heading text-[17px] text-ink sm:text-[19px]" />
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
            </p>
          ) : null}
          <ul className="mt-5 space-y-2 text-[16px] leading-[1.55] text-white/85">
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

/** How it works in three steps, carried by the stream diagram. */
export function HowItWorks() {
  const steps = ["Sign up with email and mobile", "Top up by UPI or card", "Launch the RTX 5080 from the app"];
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
