import type { Metadata } from "next";
import Link from "next/link";
import { CoreframeWordmarkAtlas } from "@/components/brand/coreframe-wordmark-atlas";
import { ViewContent } from "@/components/analytics/view-content";
import { FAQ as CFD_FAQ } from "@/app/cfd/cfd-view";
import { KeepQueryLink } from "@/components/go/keep-query-link";
import { StickyCta } from "@/components/go/sticky-cta";
import { getRateCard } from "@/lib/rate-card";
import { usdRates, type Currency } from "@/lib/money";
import { CFD_EXPRESS, CFD_NORMAL_HOURS, expressFromAmount, preprocessFee } from "@/lib/cfd-prices";
import { BEND_RECORD, VERIFIED, verifiedFromAmount } from "@/lib/cfd-verified";

/**
 * /go/cfd — the paid landing page for the CFD ads. Paid traffic only, so
 * noindex: /cfd is the page that ranks.
 *
 * Rebuilt 26 Oct 2026 like /go/gpu (owner: less text, big button, show the
 * offer and the way in; 93% of ad landings never tapped the old button).
 * Owner, same day: Verified (mesh independence) is the headline, Express
 * beside it; both as "from" the smallest run (never the multiplier); the
 * mesh-check fee and 24-hour Standard as one bold line under them.
 * In order: our live Verified bend run (three meshes, 12.30 Pa ± 0.13 %),
 * "verified on three meshes", Verified and Express side by side, the fee
 * line, one big button to the job form on /cfd (#start), what you get,
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
    title: "Pressure drop, verified on three meshes | Coreframe CFD",
    description: `Upload one STL of your duct or pipe. We check it, mesh it and quote; results within ${CFD_NORMAL_HOURS} hours of payment. Mesh check ${fee} for most models.`,
    robots: { index: false, follow: false },
    // Its own share card (owner, 26 Oct 2026: a landing link sent on WhatsApp
    // showed the homepage card). No price on the image, so one card serves
    // both the ₹ and the $ copy; absolute URL so the /usd rewrite cannot break it.
    openGraph: {
      title: "Pressure drop, verified on three meshes",
      description: "Duct and pipe CFD from one STL. Express results in 1–2 hours. No CFD licence needed.",
      url: "https://www.coreframecloud.com/go/cfd",
      siteName: "Coreframe Cloud",
      type: "website",
      images: [{ url: "https://www.coreframecloud.com/og/go-cfd.jpg", width: 1200, height: 630, alt: "Mesh independence check on a 90° bend: 12.30 Pa ± 0.13 %" }],
    },
    twitter: { card: "summary_large_image", images: ["https://www.coreframecloud.com/og/go-cfd.jpg"] },
  };
}

export default async function CfdLandingView({ currency }: { currency: Currency }) {
  const fee = preprocessFee(currency, usdRates(await getRateCard()));
  const faq = CFD_FAQ.filter((f) => FAQ_PICK.includes(f.q));

    return (
    <div className="relative min-h-screen overflow-x-clip text-ink">
      <div className="cf-aurora" />
      <ViewContent name="Ad landing: CFD" category="cfd" />
      <main className="relative mx-auto w-full max-w-[1120px] px-4 pt-3 pb-28 sm:px-5 sm:pt-8 lg:px-8 lg:pb-12">
        <div className="flex items-center" aria-label="Coreframe Cloud">
          <CoreframeWordmarkAtlas iconSize={32} animated={false} />
        </div>

        <div className="mt-3 grid gap-4 lg:mt-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,480px)] lg:items-start lg:gap-14">
          {/* The proof first (owner, 26 Oct 2026: lead with Express and the
              Verified mesh-independence check). Our own live Verified run,
              lib/cfd-verified.ts BEND_RECORD: three meshes, the answer stops
              moving, quoted with its band. */}
          <figure className="rounded-[20px] bg-night px-4 py-3.5 text-white shadow-[0_24px_60px_-28px_rgba(16,17,19,0.55)] lg:order-2 lg:px-6 lg:py-5">
            <p className="text-[11.5px] font-semibold tracking-[0.08em] text-white/60 uppercase">Mesh independence check · 90° bend</p>
            <table className="mt-2 w-full text-[14px] tabular-nums">
              <tbody>
                {BEND_RECORD.meshes.map((m) => (
                  <tr key={m.level} className="border-b border-white/10 last:border-0">
                    <td className="py-1 text-white/75">{m.level}</td>
                    <td className="py-1 text-right text-white/75">{m.mcells} M cells</td>
                    <td className="py-1 text-right font-semibold">{m.dp.toFixed(3)} Pa</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <figcaption className="mt-2 text-[16px] font-semibold text-[#7ee2a8]">✓ {BEND_RECORD.verdict}</figcaption>
          </figure>

          <section data-cf-section="hero" className="lg:order-1">
            <h1 className="font-heading text-[clamp(30px,6vw,56px)] leading-[1.05] font-medium tracking-[-0.02em] text-ink [text-wrap:balance]">
              Pressure drop, <span className="cfx-hl">verified</span> on three meshes.
            </h1>
            <p className="mt-2 text-[16px] leading-[1.4] text-ink-2 sm:text-[19px]">Or Express, in {CFD_EXPRESS.hours} hours. Upload one STL; no CFD licence.</p>

            <div className="mt-3 grid grid-cols-2 gap-2.5" data-cf-section="offer">
              <div className="rounded-[16px] border border-blue/30 bg-tint-blue px-3.5 py-3">
                <p className="text-[12px] font-semibold tracking-[0.06em] text-blue-ink uppercase">{VERIFIED.name}</p>
                <p className="font-heading text-[24px] leading-tight font-semibold text-ink">
                  <span className="text-[14px] font-medium text-ink-2">from </span>{verifiedFromAmount(currency)}
                </p>
                <p className="mt-0.5 text-[12.5px] leading-4 text-ink-2">Mesh-independence check on 3 meshes · {VERIFIED.deliveryHours} h</p>
              </div>
              <div className="rounded-[16px] border border-rule bg-paper-2 px-3.5 py-3">
                <p className="text-[12px] font-semibold tracking-[0.06em] text-ink-3 uppercase">Express</p>
                <p className="font-heading text-[24px] leading-tight font-semibold text-ink">
                  <span className="text-[14px] font-medium text-ink-2">from </span>{expressFromAmount(currency)}
                </p>
                <p className="mt-0.5 text-[12.5px] leading-4 text-ink-2">Pressure drop on one mesh · {CFD_EXPRESS.hours} h</p>
              </div>
            </div>

            <p className="mt-3 text-[15px] leading-5 text-ink">
              <b className="font-semibold">Start with a {fee} mesh check.</b>{" "}
              <span className="text-ink-2">Standard results within {CFD_NORMAL_HOURS} hours.</span>
            </p>

            <div id="cf-hero-cta" className="mt-3 sm:mt-4">
              <KeepQueryLink href={START} event="go_cfd_cta" cta="hero" className="cf-btn-go w-full sm:w-auto sm:px-12">
                Start a job <span aria-hidden>→</span>
              </KeepQueryLink>
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
              { src: "/cfd/bend-slice-p-zoom.webp", w: 1316, h: 889, cap: "Pressure through a 90° water bend: 5,294 Pa, converged" },
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

      <StickyCta href={START} label="Start a job" offer={`Verified from ${verifiedFromAmount(currency)}`} event="go_cfd_cta_sticky" />
    </div>
  );
}
