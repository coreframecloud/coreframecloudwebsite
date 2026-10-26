import type { Metadata } from "next";
import Link from "next/link";
import { preload } from "react-dom";
import { CoreframeWordmarkAtlas } from "@/components/brand/coreframe-wordmark-atlas";
import { ViewContent } from "@/components/analytics/view-content";
import { FAQ as CFD_FAQ } from "@/app/cfd/cfd-view";
import { KeepQueryLink } from "@/components/go/keep-query-link";
import { StickyCta } from "@/components/go/sticky-cta";
import { getRateCard } from "@/lib/rate-card";
import { usdRates, type Currency } from "@/lib/money";
import { CFD_EXPRESS, CFD_NORMAL_HOURS, preprocessFee } from "@/lib/cfd-prices";

/**
 * /go/cfd — the paid landing page for the CFD ads. Paid traffic only, so
 * noindex: /cfd is the page that ranks.
 *
 * Rebuilt 26 Oct 2026 like /go/gpu (owner: less text, big button, show the
 * offer and the way in; 93% of ad landings never tapped the old button).
 * In order: a real result (the sample job's pressure field through a 90°
 * water bend, with its headline numbers from the sample report: 5,294 Pa,
 * K 0.663, converged at iteration 226), the promise, the mesh-check fee in
 * big type, one big button to the job form on /cfd (#start), what you get,
 * two more result images, three of /cfd's own questions
 * (the old Friday-night reel was a problem-first story, against the
 * result-first rule). A sticky phone bar carries the
 * button whenever the hero button is out of view.
 *
 * Rendered twice: /go/cfd in rupees and app/usd/go/cfd in dollars (proxy.ts),
 * so a visitor sees one currency only.
 */

const FAQ_PICK = ["What file do you need?", "Do I need a CFD licence?", "Do I need a Coreframe account?"];
const START = "/cfd#start";

export async function cfdLandingMetadata(currency: Currency): Promise<Metadata> {
  const fee = preprocessFee(currency, usdRates(await getRateCard()));
  return {
    title: "Duct and pipe pressure drop, results within 24 hours",
    description: `Upload one STL of your duct or pipe. We check it, mesh it and quote; results within ${CFD_NORMAL_HOURS} hours of payment. Mesh check ${fee} for most models.`,
    robots: { index: false, follow: false },
  };
}

export default async function CfdLandingView({ currency }: { currency: Currency }) {
  const fee = preprocessFee(currency, usdRates(await getRateCard()));
  const faq = CFD_FAQ.filter((f) => FAQ_PICK.includes(f.q));

  preload("/cfd/bend-slice-p-zoom.webp", { as: "image", fetchPriority: "high" });

  return (
    <div className="relative min-h-screen overflow-x-clip text-ink">
      <div className="cf-aurora" />
      <ViewContent name="Ad landing: CFD" category="cfd" />
      <main className="relative mx-auto w-full max-w-[1120px] px-4 pt-3 pb-28 sm:px-5 sm:pt-8 lg:px-8 lg:pb-12">
        <div className="flex items-center" aria-label="Coreframe Cloud">
          <CoreframeWordmarkAtlas iconSize={32} animated={false} />
        </div>

        <div className="mt-3 grid gap-4 lg:mt-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,480px)] lg:items-start lg:gap-14">
          {/* The result first: a real run's pressure field and its numbers. */}
          <figure className="relative overflow-hidden rounded-[20px] border border-rule bg-white shadow-[0_24px_60px_-28px_rgba(16,17,19,0.35)] lg:order-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/cfd/bend-slice-p-zoom.webp"
              alt="Static pressure through a 90° water bend, from a Coreframe CFD run"
              width={1316}
              height={889}
              className="aspect-[2/1] w-full object-contain p-1.5 sm:aspect-[16/10]"
              fetchPriority="high"
            />
            <figcaption className="flex flex-col gap-0.5 border-t border-rule bg-night px-3.5 py-2.5 text-white">
              <span className="text-[15px] font-semibold">Pressure drop 5,294 Pa · K 0.663 · converged</span>
              <span className="text-[11.5px] font-medium text-white/75">Sample job: 90° water bend at 4 m/s, from the report we send</span>
            </figcaption>
          </figure>

          <section data-cf-section="hero" className="lg:order-1">
            <h1 className="font-heading text-[clamp(30px,6vw,56px)] leading-[1.05] font-medium tracking-[-0.02em] text-ink [text-wrap:balance]">
              Your duct&apos;s pressure drop, within <span className="cfx-hl whitespace-nowrap">{CFD_NORMAL_HOURS} hours</span>.
            </h1>
            <p className="mt-2 text-[16px] leading-[1.4] text-ink-2 sm:text-[19px]">
              Upload one STL. No CFD software or licence needed.
            </p>

            <div className="mt-3 rounded-[16px] border border-rule bg-paper-2 px-4 py-3 sm:mt-5 sm:px-5 sm:py-4" data-cf-section="offer">
              <p className="text-[12px] font-semibold tracking-[0.06em] text-ink-3 uppercase">To start</p>
              <p className="font-heading text-[28px] leading-tight font-semibold text-ink sm:text-[34px]">{fee} mesh check</p>
              <p className="text-[14.5px] leading-5 text-ink-2">Then a quote. Pay for the run only if you accept it.</p>
            </div>

            <div id="cf-hero-cta" className="mt-3 sm:mt-4">
              <KeepQueryLink href={START} event="go_cfd_cta" cta="hero" className="cf-btn-go w-full sm:w-auto sm:px-12">
                Start a job <span aria-hidden>→</span>
              </KeepQueryLink>
              <p className="mt-2 text-center text-[13.5px] text-ink-3 sm:text-left">
                Express: {CFD_EXPRESS.hours} h at {CFD_EXPRESS.multiple}× the price, where your quote offers it
              </p>
            </div>
          </section>
        </div>

        <section className="mt-8 max-w-[760px]" data-cf-section="deliverables">
          <h2 className="font-heading text-[22px] leading-tight font-medium text-ink">What you get</h2>
          <ul className="mt-4 grid gap-2.5 sm:grid-cols-3">
            {["Pressure drop and loss coefficient K", "A PDF report and a 3D viewer in your browser", "The full simulation case, open format"].map((s) => (
              <li key={s} className="rounded-cf border border-rule bg-paper-2 px-4 py-3 text-[15px] leading-snug font-medium text-ink">
                {s}
              </li>
            ))}
          </ul>
        </section>

        {/* More of the same kind of result, from the sample runs on /cfd. */}
        <section className="mt-10 max-w-[760px]" data-cf-section="results">
          <h2 className="font-heading text-[22px] leading-tight font-medium text-ink">What the results look like</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              { src: "/cfd/bend-walls-p.webp", w: 1067, h: 789, cap: "Wall pressure on the whole run, as in the 3D viewer" },
              { src: "/cfd/reducer-streams.webp", w: 1079, h: 789, cap: "Streamlines coloured by speed through a reducer" },
            ].map((im) => (
              <figure key={im.src} className="overflow-hidden rounded-cf border border-rule bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={im.src} alt={im.cap} width={im.w} height={im.h} loading="lazy" className="aspect-[4/3] w-full object-contain p-2" />
                <figcaption className="border-t border-rule bg-paper-2 px-3.5 py-2 text-[13.5px] text-ink-2">{im.cap}</figcaption>
              </figure>
            ))}
          </div>
        </section>

        {faq.length ? (
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
        ) : null}

        <div className="mt-10 max-w-[760px]">
          <KeepQueryLink href={START} event="go_cfd_cta_end" cta="end" className="cf-btn-go w-full sm:w-auto sm:px-12">
            Start a job <span aria-hidden>→</span>
          </KeepQueryLink>
          <p className="mt-3 text-[12.5px] leading-5 text-ink-3">
            Indian company; your STL and results stay in India · {currency === "USD" ? "invoice in US dollars" : "GST invoice"}
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

      <StickyCta href={START} label="Start a job" offer={`${fee} mesh check`} event="go_cfd_cta_sticky" />
    </div>
  );
}
