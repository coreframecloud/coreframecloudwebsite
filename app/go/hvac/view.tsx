import type { Metadata } from "next";
import Link from "next/link";
import { CoreframeWordmarkAtlas } from "@/components/brand/coreframe-wordmark-atlas";
import { ViewContent } from "@/components/analytics/view-content";
import { KeepQueryLink } from "@/components/go/keep-query-link";
import { StickyCta } from "@/components/go/sticky-cta";
import { getRateCard } from "@/lib/rate-card";
import { usdRates, type Currency } from "@/lib/money";
import { CFD_EXPRESS, CFD_NORMAL_HOURS, expressFromAmount, hvacRoomFromAmount, preprocessFee } from "@/lib/cfd-prices";
import { CLINIC_CASE } from "@/lib/cfd-pages";
import { ROOMS_DELIVERS } from "@/lib/cfd-rooms";

/**
 * /go/hvac — the paid landing page for HVAC room airflow (owner, 26 Oct 2026: "on CFD we only
 * show ducts and pipes; we also have HVAC"). Paid traffic only, so noindex: /cfd/room-airflow-hvac
 * is the page that ranks. Same pattern as /go/gpu and /go/cfd: a real result first, the promise,
 * the "from" prices in big type, one big button, what you enter and get, two more result images,
 * three questions, a sticky phone bar.
 *
 * Honest about scope, word for word with /cfd/room-airflow-hvac: the SERVICE is one box-shaped
 * room described on a form (steady state). The clinic floor in the hero is our own indicative run
 * on a real building model (the case study), labelled as such. "From" prices are live quotes for
 * a small room (lib/cfd-prices.ts HVAC_ROOM_FROM; Express as for every steady run).
 *
 * Rendered twice: /go/hvac in rupees and app/usd/go/hvac in dollars (proxy.ts).
 */

const START = "/cfd#start";
const IMG = "/cfd/projects/clinic-floor-hvac";

export async function hvacLandingMetadata(currency: Currency): Promise<Metadata> {
  const from = hvacRoomFromAmount(currency);
  return {
    title: "Room airflow and comfort for HVAC designs | Coreframe CFD",
    description: `Describe a room on a form; get air speed, temperature, PMV/PPD and ADPI maps in a PDF. No CFD licence. From ${from} for a small room.`,
    robots: { index: false, follow: false },
    openGraph: {
      title: "See where a room is draughty, before it's built",
      description: "Room airflow and comfort for HVAC designs: ADPI, PMV/PPD and air-speed maps in a PDF. No CFD licence.",
      url: "https://www.coreframecloud.com/go/hvac",
      siteName: "Coreframe Cloud",
      type: "website",
      images: [{ url: `https://www.coreframecloud.com${IMG}/og-ankle-air-speed.jpg`, width: 1200, height: 630,
                 alt: "Air speed at ankle height across a 100-room clinic floor" }],
    },
    twitter: { card: "summary_large_image", images: [`https://www.coreframecloud.com${IMG}/og-ankle-air-speed.jpg`] },
  };
}

export default async function HvacLandingView({ currency }: { currency: Currency }) {
  const fee = preprocessFee(currency, usdRates(await getRateCard()));
  const roomFrom = hvacRoomFromAmount(currency);
  const faq = [
    {
      q: "Do I need a 3D model or a CFD licence?",
      a: "No. You describe one box-shaped room on a form: its size, the supply diffusers and returns on its walls or ceiling, and the heat loads. The solver runs on our side.",
    },
    {
      q: "What do I get back?",
      a: `Where the supply air goes, how fast it moves in the occupied zone, the temperatures people sit in, and the comfort indices PMV and PPD (ISO 7730) and ADPI (ASHRAE 113). You get ${ROOMS_DELIVERS}.`,
    },
    {
      q: "Can it model a whole floor?",
      a: "Not as this service: it runs one box-shaped room at a time, steady state. The clinic floor on this page was our own run on a real building model. Talk to us about a whole floor.",
    },
  ];

  return (
    <div className="relative min-h-screen overflow-x-clip text-ink">
      <div className="cf-aurora" />
      <ViewContent name="Ad landing: HVAC" category="cfd" />
      <main className="relative mx-auto w-full max-w-[1120px] px-4 pt-3 pb-28 sm:px-5 sm:pt-8 lg:px-8 lg:pb-12">
        <div className="flex items-center" aria-label="Coreframe Cloud">
          <CoreframeWordmarkAtlas iconSize={32} animated={false} />
        </div>

        <div className="mt-3 grid gap-4 lg:mt-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,480px)] lg:items-start lg:gap-14">
          {/* The result first: air speed at ankle height on a real clinic floor (our own run). */}
          <figure className="overflow-hidden rounded-[20px] border border-rule bg-white shadow-[0_24px_60px_-28px_rgba(16,17,19,0.35)] lg:order-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${IMG}/ankle-air-speed.webp`} alt="Air speed at ankle height across a 100-room clinic floor"
                 width={1600} height={1343} className="aspect-[2/1] w-full object-cover object-top sm:aspect-[16/10]" fetchPriority="high" />
            <figcaption className="flex flex-col gap-0.5 border-t border-rule bg-night px-3.5 py-2.5 text-white">
              <span className="text-[13.5px] font-semibold leading-snug">ADPI ≥ 80 % in 56 of 59 rooms · ankle draught on 15 % of the floor</span>
              <span className="text-[11.5px] font-medium text-white/75">Our own run on a real 100-room clinic floor design</span>
            </figcaption>
          </figure>

          <section data-cf-section="hero" className="lg:order-1">
            <h1 className="font-heading text-[clamp(30px,6vw,56px)] leading-[1.05] font-medium tracking-[-0.02em] text-ink [text-wrap:balance]">
              See where a room is <span className="cfx-hl">draughty</span>, before it&apos;s built.
            </h1>
            <p className="mt-2 text-[16px] leading-[1.4] text-ink-2 sm:text-[19px]">
              Room airflow and comfort for HVAC designs. Describe the room on a form; no CFD licence.
            </p>

            <div className="mt-3 grid grid-cols-2 gap-2.5" data-cf-section="offer">
              <div className="rounded-[16px] border border-blue/30 bg-tint-blue px-3.5 py-3">
                <p className="text-[12px] font-semibold tracking-[0.06em] text-blue-ink uppercase">Room study</p>
                <p className="font-heading text-[24px] leading-tight font-semibold text-ink">
                  <span className="text-[14px] font-medium text-ink-2">from </span>{roomFrom}
                </p>
                <p className="mt-0.5 text-[12.5px] leading-4 text-ink-2">One room, maps + PDF · {CFD_NORMAL_HOURS} h</p>
              </div>
              <div className="rounded-[16px] border border-rule bg-paper-2 px-3.5 py-3">
                <p className="text-[12px] font-semibold tracking-[0.06em] text-ink-3 uppercase">Express</p>
                <p className="font-heading text-[24px] leading-tight font-semibold text-ink">
                  <span className="text-[14px] font-medium text-ink-2">from </span>{expressFromAmount(currency)}
                </p>
                <p className="mt-0.5 text-[12.5px] leading-4 text-ink-2">Same study · {CFD_EXPRESS.hours} h</p>
              </div>
            </div>

            <div id="cf-hero-cta" className="mt-3 sm:mt-4">
              <KeepQueryLink href={START} event="go_hvac_cta" cta="hero" className="cf-btn-go w-full sm:w-auto sm:px-12">
                Start a room job <span aria-hidden>→</span>
              </KeepQueryLink>
            </div>
          </section>
        </div>

        <section className="mt-8 max-w-[760px]" data-cf-section="inputs">
          <h2 className="font-heading text-[22px] leading-tight font-medium text-ink">What you enter, what you get</h2>
          <ul className="mt-4 grid gap-2.5 sm:grid-cols-3">
            {[
              "The room on a form: size, diffusers and returns, heat loads",
              "Comfort numbers: mean air speed, temperature, PMV/PPD (ISO 7730), ADPI (ASHRAE 113)",
              "Temperature and air-speed maps, in a PDF report",
            ].map((s) => (
              <li key={s} className="rounded-cf border border-rule bg-paper-2 px-4 py-3 text-[15px] leading-snug font-medium text-ink">
                {s}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10 max-w-[760px]" data-cf-section="results">
          <h2 className="font-heading text-[22px] leading-tight font-medium text-ink">What the results look like</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              { src: `${IMG}/adpi-1-1m.webp`, w: 1600, h: 1288, cap: "ADPI at seated head height (1.1 m), room by room" },
              { src: `${IMG}/temperature-1-1m.webp`, w: 1600, h: 1334, cap: "Air temperature at 1.1 m across the floor" },
            ].map((im) => (
              <figure key={im.src} className="overflow-hidden rounded-cf border border-rule bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={im.src} alt={im.cap} width={im.w} height={im.h} loading="lazy" className="aspect-[4/3] w-full object-cover" />
                <figcaption className="border-t border-rule bg-paper-2 px-3.5 py-2 text-[13.5px] text-ink-2">{im.cap}</figcaption>
              </figure>
            ))}
          </div>
          <p className="mt-3 text-[14px] text-ink-2">
            From our clinic case study.{" "}
            <Link href={CLINIC_CASE.path} className="text-blue-ink underline underline-offset-4">Read it</Link>
            {" "}· Pre-processing / mesh check {fee} for most models.
          </p>
        </section>

        <section className="mt-12 max-w-[760px]" data-cf-section="faq">
          <h2 className="font-heading text-[22px] leading-tight font-medium text-ink">Questions</h2>
          <div className="mt-4 flex flex-col gap-2.5">
            {faq.map((f) => (
              <details key={f.q} className="group rounded-cf border border-rule bg-paper-2 px-5 py-4 transition open:border-blue/25">
                <summary className="flex cursor-pointer items-center justify-between gap-4 text-[15.5px] font-semibold text-ink [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span aria-hidden className="shrink-0 text-xl font-light leading-none text-blue">
                    <span className="group-open:hidden">+</span>
                    <span className="hidden group-open:inline">−</span>
                  </span>
                </summary>
                <p className="mt-3 max-w-[68ch] text-[14.5px] leading-6 text-ink-2">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <div className="mt-10 max-w-[760px]">
          <KeepQueryLink href={START} event="go_hvac_cta_end" cta="end" className="cf-btn-go w-full sm:w-auto sm:px-12">
            Start a room job <span aria-hidden>→</span>
          </KeepQueryLink>
          <p className="mt-3 text-[12.5px] leading-5 text-ink-3">
            Indian company; your inputs and results stay in India · {currency === "USD" ? "invoice in US dollars" : "GST invoice"}
          </p>
        </div>
      </main>

      <footer className="relative border-t border-rule">
        <div className="mx-auto flex max-w-[1120px] flex-wrap items-center gap-x-5 gap-y-1 px-5 pt-5 pb-28 text-[12.5px] text-ink-3 lg:px-8 lg:pb-5">
          <span>© {new Date().getFullYear()} Coreframe Compute Labs Private Limited</span>
          <Link href="/privacy-policy" className="inline-flex min-h-11 items-center hover:text-ink">Privacy</Link>
          <Link href="/terms-of-service" className="inline-flex min-h-11 items-center hover:text-ink">Terms</Link>
          <Link href="/refund-policy" className="inline-flex min-h-11 items-center hover:text-ink">Refunds</Link>
        </div>
      </footer>

      <StickyCta href={START} label="Start a room job" offer={`Room study from ${roomFrom}`} event="go_hvac_cta_sticky" />
    </div>
  );
}
