import Link from "next/link";
import Image from "next/image";
import type { CSSProperties } from "react";
import { Reveal } from "@/components/home/redesign/reveal";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { OFFERINGS, type Offering, type OfferingStatus } from "@/lib/offerings";
import { ShellFurnished } from "@/components/visuals/studio-compare";
import { cellsLabel, formatMoney, usdRates, type Currency } from "@/lib/money";
import { CFD_PREPROCESS_INR } from "@/lib/cfd-prices";
import { FREE_PREVIEWS_PER_DAY, studioPrices } from "@/lib/studio-prices";
import { ladderLead, ladderRanges, type LadderRanges, type RateCard } from "@/lib/rate-card";

/**
 * The price lines on the hero cards and the bands, in ONE currency: the
 * visitor's (owner, 18 Oct 2026; proxy.ts picks the copy). Every figure from
 * its usual source: the CFD pre-processing fee from lib/cfd-prices (rupees)
 * or the rate card's `usd` block, Studio from studioPrices().
 */
export type OfferingPrices = {
  currency: Currency;
  /** "₹599 incl. GST" / "$15, no GST" */
  cfdFee: string;
  /** "₹1,499" / "$39", over `cfdCells` */
  cfdLargeFee: string;
  cfdCells: string;
  studio: { extraPreview: string; edit: string; k2: string; k4: string };
  /** The GPU ladder as ranges (owner, 21 Oct 2026), or null without a rate card. */
  ladder: LadderRanges | null;
  /** The lineup and its lowest live price in `currency` (owner, 24 Oct 2026). */
  lineup: ReturnType<typeof ladderLead>;
};

/** The first-top-up offer, short: introOfferShort() in the page's currency. */
export type IntroShort = { main: string; alt: string | null; bare: string };

/** "from ₹99/hour" -> "From ₹99/hour". */
function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function offeringPrices(card: RateCard | null, currency: Currency): OfferingPrices {
  const usd = usdRates(card);
  const sp = studioPrices(card);
  const st = currency === "USD" ? sp.usd : sp.inr;
  const m = (n: number) => formatMoney(n, currency);
  return {
    currency,
    cfdFee:
      m(currency === "USD" ? usd.cfd_quote_fee_small : CFD_PREPROCESS_INR.small),
    cfdLargeFee: m(currency === "USD" ? usd.cfd_quote_fee_large : CFD_PREPROCESS_INR.large),
    cfdCells: cellsLabel(currency === "USD" ? usd.cfd_quote_fee_small_max_cells : CFD_PREPROCESS_INR.smallMaxCells),
    studio: { extraPreview: m(st.extraPreview), edit: m(st.edit), k2: m(st.k2), k4: m(st.k4) },
    ladder: ladderRanges(card),
    lineup: ladderLead(card, currency),
  };
}

/**
 * The three services as equals: three cards in the hero, then one band each
 * under it, in the same order (GPU workstations, CFD, Studio). Everything is
 * read from lib/offerings.ts.
 */

type BadgeStatus = OfferingStatus | "Coming soon";

const BADGE: Record<BadgeStatus, string> = {
  Live: "bg-[#15803d] text-white",
  New: "bg-[#2f6be0] text-white",
  "Opening soon": "bg-[#ffd166] text-ink",
  "Coming soon": "bg-[#ffd166] text-ink",
};

export function StatusBadge({ status, className = "" }: { status: BadgeStatus; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] leading-none font-semibold tracking-[0.1em] whitespace-nowrap uppercase ${BADGE[status]} ${className}`}
    >
      {status === "Live" ? <span className="h-1.5 w-1.5 rounded-full bg-white" aria-hidden /> : null}
      {status}
    </span>
  );
}

function ctaEvent(href: string) {
  return href.startsWith("/signup") ? "signup_click" : "offering_cta_click";
}

/**
 * One hero card. Phones: a compact row (thumbnail beside the text) so all
 * three fit on the first screen. sm and up: image on top, equal-height cards.
 */
function HeroCard({ o, introLabel, prices, i }: { o: Offering; introLabel: IntroShort | null; prices: OfferingPrices; i: number }) {
  // The GPU card leads with the lineup and its lowest live price (owner,
  // 24 Oct 2026), in place of the static line; same element, same size.
  const line =
    o.id === "gpu" && prices.lineup?.from
      ? `A Windows GPU workstation by the minute: ${prices.lineup.list}, ${prices.lineup.from}.`
      : o.line;
  return (
    <div
      data-cf-spot=""
      style={{ "--cf-i": i } as CSSProperties}
      className="cf-hero-card group relative flex min-w-0 flex-col overflow-hidden rounded-[20px] border border-white/15 bg-[#0b0d11]/70 backdrop-blur-md sm:rounded-[24px]"
    >
      <div className="grid min-w-0 grid-cols-[88px_1fr] gap-3.5 p-3.5 sm:flex sm:flex-1 sm:flex-col sm:gap-0 sm:p-0">
        <div
          className={`relative h-[88px] w-[88px] shrink-0 overflow-hidden rounded-xl sm:h-32 sm:w-full sm:rounded-none lg:h-[136px] ${
            o.image.fit === "contain" ? "bg-white" : "bg-night"
          }`}
        >
          <Image
            src={o.image.src}
            alt={o.image.alt}
            fill
            sizes="(min-width: 1024px) 380px, (min-width: 640px) 33vw, 88px"
            className={o.image.fit === "contain" ? "object-contain p-1.5 sm:p-2" : "object-cover object-center"}
          />
          <span className="absolute top-3 left-3 hidden sm:block">
            <StatusBadge status={o.status} />
          </span>
          {o.id === "studio" ? (
            <span className="absolute right-2 bottom-2 hidden rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white sm:block">
              Generated image
            </span>
          ) : null}
        </div>

        <div className="flex min-w-0 flex-1 flex-col sm:p-5">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[11.5px] font-semibold tracking-[0.12em] text-white/75 uppercase">{o.name}</p>
            <StatusBadge status={o.status} className="sm:hidden" />
          </div>
          <h2 className="mt-1.5 font-heading text-[19px] leading-[1.2] font-medium text-white sm:mt-2 sm:text-[21px] lg:text-[23px]">
            {o.headline}
          </h2>
          <p className="mt-2 hidden text-[13.5px] leading-[1.5] text-white/80 sm:block">{line}</p>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 sm:mt-auto sm:pt-4">
            <TrackedLink
              href={o.cta.href}
              event={ctaEvent(o.cta.href)}
              params={{ offering: o.id, label: o.cta.label, location: "home_hero_card" }}
              className="inline-flex min-h-10 items-center justify-center rounded-full bg-white px-4 py-2 text-[12.5px] font-semibold tracking-[0.02em] text-ink uppercase transition-colors hover:bg-[#e9ebef] sm:px-5 sm:text-[13px]"
            >
              {o.cta.label}
            </TrackedLink>
            <TrackedLink
              href={o.href}
              event="offering_cta_click"
              params={{ offering: o.id, label: "Learn more", location: "home_hero_card_more" }}
              className="hidden text-[12.5px] font-semibold tracking-[0.04em] text-white/85 uppercase hover:text-white hover:underline sm:inline-flex"
            >
              Learn more <span aria-hidden>&nbsp;→</span>
            </TrackedLink>
          </div>
          {o.id === "gpu" && introLabel ? (
            <p className="mt-2.5 text-[12.5px] text-white/80 sm:mt-3 sm:text-[13px]">
              {/* One line at every width (owner, 24 Oct 2026): the lowest live
                  price, then the offer without its GPU. The strip and the
                  card's line above carry the lineup and the cheaper-card hours. */}
              {prices.lineup?.from ? (
                <>
                  {/* "/hr" and "1st" on phones keep the line to one at 390 px. */}
                  <span className="sm:hidden">{cap(prices.lineup.from).replace(/\/hour$/, "/hr")}</span>
                  <span className="hidden sm:inline">{cap(prices.lineup.from)}</span> ·{" "}
                </>
              ) : null}
              <span className="sm:hidden">1st</span><span className="hidden sm:inline">First</span> top-up{" "}
              <span className="font-semibold text-white">{introLabel.bare}</span>
            </p>
          ) : null}
          {o.id === "cfd" ? (
            <p className="mt-2.5 text-[12.5px] text-white/80 sm:mt-3 sm:text-[13px]">
              Pre-processing <span className="font-semibold text-white">{prices.cfdFee}</span> for most models
            </p>
          ) : null}
          {o.id === "studio" ? (
            <p className="mt-2.5 text-[12.5px] text-white/80 sm:mt-3 sm:text-[13px]">
              Free previews. Edits <span className="font-semibold text-white">{prices.studio.edit}</span>, 2K download {prices.studio.k2}, 4K {prices.studio.k4}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function HeroOfferingCards({ introLabel, prices }: { introLabel: IntroShort | null; prices: OfferingPrices }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3 sm:gap-4 lg:gap-5">
      {OFFERINGS.map((o, i) => (
        <HeroCard key={o.id} o={o} introLabel={introLabel} prices={prices} i={i} />
      ))}
    </div>
  );
}

/** One theme per product (owner, 16 Oct 2026): GPU = the cinema panel, CFD =
 *  the watercolour explainer paper, Studio = warm interiors. globals.css. */
const BAND_TINT: Record<Offering["id"], string> = {
  gpu: "cf-cine",
  cfd: "cfx-panel",
  studio: "cf-warm",
};

/** The points each band lists. Facts only, the same ones the service pages carry. */
const bandPoints = (prices: OfferingPrices): Record<Offering["id"], string[]> => ({
  gpu: [
    // The GPU ladder, as ranges from the live rate card (owner, 21 Oct 2026).
    prices.ladder
      ? `${prices.lineup?.range ?? prices.ladder.gpu} · ${prices.ladder.vram} VRAM · ${prices.ladder.cpu} · ${prices.ladder.ram} RAM`
      : "A dedicated GPU, a whole card to yourself",
    "Unreal Engine, D5 Render, Blender and Twinmotion preinstalled",
    prices.currency === "USD"
      ? "Billed per minute, no GST; close it and billing stops"
      : "Billed per minute, GST included; close it and billing stops",
  ],
  cfd: [
    "Upload one closed STL of the fluid volume",
    "We check it, mesh it on our machine and email you a quote",
    "Pressure drop, loss coefficient, PDF report, 3D viewer and data files",
  ],
  studio: [
    "Built for interior designers pitching a project",
    "Walls, doors and windows read from your DXF, never invented",
    "Furnished concept images, generated in the browser",
  ],
});

const BAND_BODY: Record<Offering["id"], string> = {
  gpu: "Open D5, Lumion, Blender or Twinmotion on a full Windows workstation from the laptop you already own, streamed in 4K. Your project files stay on storage in India between sessions.",
  cfd: "Pressure drop for your duct or pipe, from one STL. The solver runs on our machines, so you need no CFD licence and your own computer stays free. You pay for the run only if you accept the quote.",
  studio:
    "Show the client the room before the project is signed. Upload a 2D DXF floor plan, pick a room and say how it should feel; Studio gives you concept images to pitch with.",
};

function BandMedia({ o }: { o: Offering }) {
  if (o.id === "studio") {
    return (
      <ShellFurnished
        className="min-w-0"
        caption="From a real DXF plan. Shell: rendered from the drawing. Furnished: a generated image."
      />
    );
  }
  return (
    <figure className="min-w-0">
      <div className={`overflow-hidden rounded-[24px] ${o.id === "cfd" ? "" : o.image.fit === "contain" ? "bg-white p-2" : "bg-night"}`}>
        <Image
          src={o.image.src}
          alt={o.image.alt}
          width={o.image.width}
          height={o.image.height}
          className={`h-auto w-full ${o.id === "cfd" ? "cfx-art" : ""}`}
          sizes="(min-width: 1024px) 540px, 100vw"
        />
      </div>
      {o.image.caption ? <figcaption className="mt-3 text-[12.5px] text-ink-3">{o.image.caption}</figcaption> : null}
    </figure>
  );
}

function OfferingBand({ o, flip, prices }: { o: Offering; flip: boolean; prices: OfferingPrices }) {
  return (
    <section id={o.id} className="scroll-mt-20" data-cf-section={`offer-${o.id}`}>
      <Reveal
        className={`grid items-center gap-10 overflow-hidden rounded-[32px] p-7 sm:p-12 lg:grid-cols-2 ${BAND_TINT[o.id]}`}
      >
        <div className={`min-w-0 ${flip ? "lg:order-2" : ""}`}>
          <div className="flex flex-wrap items-center gap-2.5">
            <p className="text-[11.5px] font-semibold tracking-[0.12em] text-ink-2 uppercase">{o.longName}</p>
            <StatusBadge status={o.status} />
          </div>
          <h2 className="cfh-h2 mt-4">{o.headline}</h2>
          <p className="mt-5 max-w-[32rem] text-[17px] leading-[1.6] text-ink-2">{BAND_BODY[o.id]}</p>
          <ul className="mt-7 space-y-3">
            {bandPoints(prices)[o.id].map((t) => (
              <li key={t} className="flex items-start gap-3 text-[15.5px] text-ink">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ink" />
                {t}
              </li>
            ))}
          </ul>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <TrackedLink
              href={o.cta.href}
              event={ctaEvent(o.cta.href)}
              params={{ offering: o.id, label: o.cta.label, location: "home_band" }}
              className="cfh-pill-dark"
            >
              {o.cta.label}
            </TrackedLink>
            <TrackedLink
              href={o.secondary.href}
              event="offering_cta_click"
              params={{ offering: o.id, label: o.secondary.label, location: "home_band_secondary" }}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-ink/25 px-6 py-3 text-[14px] font-semibold tracking-[0.02em] text-ink uppercase transition-colors hover:bg-ink/5"
            >
              {o.secondary.label}
            </TrackedLink>
          </div>
          {o.id === "cfd" ? (
            <p className="mt-6 text-[14px] text-ink-2">
              Pre-processing / mesh check {prices.cfdFee} for most models; {prices.cfdLargeFee} over {prices.cfdCells} cells.{" "}
              <Link href="/cfd/room-airflow-hvac" className="underline underline-offset-4">Rooms and HVAC airflow</Link>: live
              (steady analysis). See a{" "}
              <Link href="/cfd/projects/clinic-floor-hvac" className="underline underline-offset-4">clinic floor case study</Link>.
            </p>
          ) : null}
          {o.id === "studio" ? (
            <p className="mt-6 text-[14px] text-ink-2">
              Free previews, up to {FREE_PREVIEWS_PER_DAY} a day, then {prices.studio.extraPreview} each. Edits{" "}
              {prices.studio.edit}, 2K download {prices.studio.k2}, 4K {prices.studio.k4},{" "}
              {prices.currency === "USD" ? "no GST" : "GST included"}, paid from the same wallet as your workstation
              hours. DXF plans only.
            </p>
          ) : null}
        </div>
        <div className={`min-w-0 ${flip ? "lg:order-1" : ""}`}>
          <BandMedia o={o} />
        </div>
      </Reveal>
    </section>
  );
}

/** One band per service, same order as the hero cards. */
export function OfferingBands({ prices }: { prices: OfferingPrices }) {
  return (
    <div className="cfh-wrap space-y-6 pt-16 pb-6 sm:space-y-8 sm:pt-20">
      {OFFERINGS.map((o, i) => (
        <OfferingBand key={o.id} o={o} flip={i % 2 === 1} prices={prices} />
      ))}
    </div>
  );
}

/**
 * A compact strip of the three, for pages that describe Coreframe as a whole
 * (/about, /solutions, /pricing). Light background, plain links.
 */
export function OfferingsStrip({ location }: { location: string }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {OFFERINGS.map((o) => (
        <div key={o.id} className={`flex min-w-0 flex-col rounded-[24px] p-6 ${BAND_TINT[o.id]}`}>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[11.5px] font-semibold tracking-[0.12em] text-ink-2 uppercase">{o.name}</p>
            <StatusBadge status={o.status} />
          </div>
          <p className="mt-3 font-heading text-[20px] leading-[1.25] font-medium text-ink">{o.headline}</p>
          <p className="mt-2 text-[14.5px] leading-[1.55] text-ink-2">{o.line}</p>
          <TrackedLink
            href={o.href}
            event="offering_cta_click"
            params={{ offering: o.id, label: o.longName, location }}
            className="cfh-link mt-auto pt-5 text-ink"
          >
            {o.longName} <span aria-hidden>→</span>
          </TrackedLink>
        </div>
      ))}
    </div>
  );
}
