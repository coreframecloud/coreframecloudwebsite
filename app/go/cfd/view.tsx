import type { Metadata } from "next";
import { AdLanding } from "@/components/go/ad-landing";
import { FAQ as CFD_FAQ } from "@/app/cfd/cfd-view";
import { getRateCard } from "@/lib/rate-card";
import { usdRates, type Currency } from "@/lib/money";
import { CFD_EXPRESS, CFD_NORMAL_HOURS, preprocessFee } from "@/lib/cfd-prices";

/**
 * /go/cfd — the paid landing page for the CFD ads (owner, 20 Oct 2026: one
 * promise, the ad's reel, one button). Paid traffic only, so noindex: /cfd is
 * the page that ranks.
 *
 * Every line is already on the live /cfd (or the homepage's CFD band): the
 * delivery commitment "Results within 24 hours of payment.", the deliverables,
 * the mesh-check fee for most models (the lowest CFD price), Express exactly as
 * /cfd qualifies it, and three of /cfd's own questions. The one button goes to
 * the job form on /cfd (#start), carrying the UTMs.
 *
 * Rendered twice: /go/cfd in rupees and app/usd/go/cfd in dollars (proxy.ts),
 * each with its own reel, so a visitor sees one currency only.
 */

const FAQ_PICK = ["What file do you need?", "Do I need a CFD licence?", "Do I need a Coreframe account?"];

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

  return (
    <AdLanding
      eyebrow="CFD for ducts and pipes"
      title={
        <>
          Pressure drop for your duct or pipe. Results within <span className="cfx-hl whitespace-nowrap">{CFD_NORMAL_HOURS} hours</span> of payment.
        </>
      }
      lead="Upload one closed STL. We check it, mesh it on our machine and email you a quote. The solver runs on our side, so you need no CFD licence, and you pay for the run only if you accept the quote."
      price={
        <>
          Pre-processing / mesh check: <b className="font-semibold">{fee}</b> for most models.
          <span className="mt-1 block text-[13.5px] leading-5 text-ink-3">
            Express: results in {CFD_EXPRESS.hours} hours at {CFD_EXPRESS.multiple}x the price, where your quote offers it
            (smaller steady runs; not Verified).
          </span>
        </>
      }
      cta={{ href: "/cfd#start", label: "Start a job", event: "go_cfd_cta" }}
      ctaNote="A few fields and a file, from your Coreframe account. The mesh check is the only charge before you see a quote."
      trust={[
        "Indian company; your STL and results stay in India",
        currency === "USD" ? "Invoice in US dollars" : "GST invoice",
        "Pay for the run only if you accept the quote",
      ]}
      points={[
        "Pressure drop and loss coefficient, inlet to outlet",
        "A PDF report and a 3D results viewer that runs in your browser",
        "The data files: the complete simulation case, in an open format",
      ]}
      video={{
        src: currency === "USD" ? "/go/cfd-reel-usd.mp4" : "/go/cfd-reel-inr.mp4",
        poster: "/go/cfd-poster.webp",
        label: "A duct STL is uploaded, meshed and quoted; the sample report comes back converged before the Monday review.",
      }}
      faq={faq}
      viewContent={{ name: "Ad landing: CFD", category: "cfd" }}
    />
  );
}
