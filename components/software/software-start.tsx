import Link from "next/link";
import { GpuPickCards, GpuStartButton, GpuStartSticky } from "@/components/go/gpu-start";
import type { Currency } from "@/lib/money";
import { BYOL_RESET_NOTE } from "@/lib/software-fit";
import type { SoftwareStartData } from "@/lib/software-start";

/**
 * Software landing pages: price first, ONE big action, account only at Start
 * (owner, 10-11 Nov 2026). Reuses the GPU price-first flow shipped 11 Nov
 * (components/go/gpu-start.tsx, lib/gpu-start.ts) without changing it: the
 * hero, the picker, the closing panel and the phone's sticky bar all carry the
 * same "Start on <card>" button, defaulting to the card recommended for this
 * software, and the picker changes it everywhere at once.
 *
 * Every figure comes from the live rate card in the page's currency only; with
 * no rate card the price lines drop out and the button falls back to the
 * picker's default (or disappears when there is nothing to start).
 */

function priceWords(d: SoftwareStartData): string | null {
  if (!d.from) return null;
  return `${d.many ? "From " : ""}${d.from}`;
}

/** The hero's price block and the one big button. Holds #cf-hero-cta for the sticky bar. */
export function SoftwareStartHero({
  data,
  where,
  appName,
}: {
  data: SoftwareStartData;
  where: string;
  appName?: string;
}) {
  const price = priceWords(data);
  if (!data.defaultSlug) {
    // Rate card unreachable: one plain way on, still no account wall first.
    return (
      <div id="cf-hero-cta" className="mt-7">
        <Link href="/pricing" className="cf-btn-go w-full sm:w-auto sm:px-12">
          See GPUs and prices <span aria-hidden>→</span>
        </Link>
      </div>
    );
  }
  return (
    <div className="mt-6 max-w-[540px]" data-cf-section="software-price">
      {price ? (
        <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="font-heading text-[34px] leading-none font-semibold text-ink sm:text-[40px]">{price}</span>
          <span className="text-[15px] leading-5 text-ink-2">
            an hour, {data.tax}
            {data.perMinute ? ", billed per minute" : ""}
          </span>
        </p>
      ) : null}
      {data.intro ? (
        <p className="mt-2 text-[14.5px] leading-5 text-ink-2">
          First top-up {data.intro}
          {data.introGpu ? ` on the ${data.introGpu}` : ""}.
        </p>
      ) : null}
      {data.rec ? (
        <p className="mt-2 text-[14.5px] leading-5 text-ink-2">
          <span className="font-semibold text-ink">Recommended{appName ? ` for ${appName}` : ""}:</span> {data.rec.name},{" "}
          {data.rec.vram} GB VRAM
        </p>
      ) : null}
      <div id="cf-hero-cta" className="mt-4">
        <GpuStartButton gpus={data.gpus} defaultSlug={data.defaultSlug} amount={data.amount} where={`${where}_hero`} />
      </div>
      <p className="mt-2 text-[13.5px] leading-5 text-ink-3">
        No account until you press Start. <a href="#pick-a-gpu" className="underline underline-offset-4">Other GPUs</a>
      </p>
    </div>
  );
}

/** Preinstalled vs bring your own licence, and why the recommended card. */
export function SoftwareFitPanel({ data, className = "" }: { data: SoftwareStartData; className?: string }) {
  const fit = data.fit;
  if (!fit) return null;
  return (
    <section className={`cf-col ${className}`} aria-labelledby="whats-on-the-machine">
      <h2 id="whats-on-the-machine" className="cf-section-title">
        {fit.app}: what&rsquo;s installed, what you bring.
      </h2>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-[20px] border border-rule bg-paper-2 p-5">
          <p className="text-[13px] font-semibold tracking-[0.06em] text-ink-3 uppercase">Already installed</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {fit.preinstalled.map((a) => (
              <li key={a} className="rounded-full bg-tint-mint px-3 py-1 text-[14px] text-ink">
                {a}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-[20px] border border-rule bg-paper-2 p-5">
          <p className="text-[13px] font-semibold tracking-[0.06em] text-ink-3 uppercase">Bring your own licence</p>
          {fit.byol.length ? (
            <ul className="mt-3 flex flex-wrap gap-2">
              {fit.byol.map((a) => (
                <li key={a} className="rounded-full border border-rule px-3 py-1 text-[14px] text-ink">
                  {a}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-[14px] leading-5 text-ink-2">Nothing for {fit.app}.</p>
          )}
        </div>
      </div>
      <p className="mt-4 text-[15px] leading-6 break-words text-ink-2">
        {fit.licenceNote}
        {fit.byol.length ? ` ${BYOL_RESET_NOTE}` : ""}{" "}
        <Link href="/apps" className="text-ink underline underline-offset-4">
          Everything on the machine
        </Link>
        .
      </p>
      {data.rec ? (
        <div className="mt-6 rounded-[20px] bg-tint-blue p-5">
          <p className="text-[13px] font-semibold tracking-[0.06em] text-blue-ink uppercase">The GPU we recommend for {fit.app}</p>
          <p className="mt-2 font-heading text-[20px] leading-tight font-medium text-ink">
            {data.rec.name}, {data.rec.vram} GB VRAM
          </p>
          <p className="mt-1 text-[15px] leading-6 text-ink-2">{fit.gpu.why}</p>
        </div>
      ) : null}
    </section>
  );
}

/** The picker: every live card with its price; picking one changes every Start button. */
export function SoftwarePickSection({
  data,
  currency,
  where,
  title,
  footnote,
  className = "",
}: {
  data: SoftwareStartData;
  currency: Currency;
  where: string;
  title: string;
  footnote?: React.ReactNode;
  className?: string;
}) {
  if (!data.defaultSlug) return null;
  return (
    <section className={`cf-col scroll-mt-20 ${className}`} aria-labelledby="pick-a-gpu">
      <h2 id="pick-a-gpu" className="cf-section-title scroll-mt-24">
        {title}
      </h2>
      <p className="mt-3 text-[15px] leading-6 text-ink-2">
        One price per GPU-hour{currency === "USD" ? ", in US dollars" : ", in rupees"}. The recommended card is picked; tap another to change it.
      </p>
      <div className="mt-5">
        <GpuPickCards
          gpus={data.gpus}
          defaultSlug={data.defaultSlug}
          amount={data.amount}
          introHours={data.introHours}
          currency={currency}
          where={`${where}_cards`}
        />
      </div>
      {footnote ? <div className="mt-4 text-[14px] leading-6 text-ink-2">{footnote}</div> : null}
    </section>
  );
}

/** The closing action: the same button again, and the phone's sticky bar. */
export function SoftwareStartEnd({
  data,
  where,
  className = "",
}: {
  data: SoftwareStartData;
  where: string;
  className?: string;
}) {
  if (!data.defaultSlug) return null;
  const offer = data.from ? `${data.many ? "From " : ""}${data.from}/hr` : undefined;
  return (
    <>
      <div className={`cf-col ${className}`}>
        <GpuStartButton gpus={data.gpus} defaultSlug={data.defaultSlug} amount={data.amount} where={`${where}_end`} />
        <p className="mt-3 text-[14px] text-ink-3">
          No account until you press Start. New to it?{" "}
          <Link href="/how-to-use" className="underline underline-offset-4">
            How a session works
          </Link>
          .
        </p>
      </div>
      <GpuStartSticky gpus={data.gpus} defaultSlug={data.defaultSlug} amount={data.amount} offer={offer} />
    </>
  );
}
