import type { Metadata } from "next";
import { AdLanding } from "@/components/go/ad-landing";
import { buildFaq } from "@/components/home/explainer-faq";
import { NODE } from "@/lib/node-spec";
import type { Currency } from "@/lib/money";
import { storageTerms } from "@/lib/storage-terms";
import { GpuCards } from "@/components/go/gpu-cards";
import { IntroAltLine } from "@/components/go/intro-alt-line";
import { adhocRate, adhocRateHourly, getRateCard, introOfferFor, introOfferMoreGpus, introOfferShort, introOfferVariant, ladderRanges, publicGpus, withArticle } from "@/lib/rate-card";

/**
 * /go/gpu — the paid landing page for the GPU workstation ads (owner, 20 Oct
 * 2026: one promise, the ad's reel, one button). Paid traffic only, so noindex.
 *
 * Every line is already on the live site: the headline and lead are the
 * homepage's GPU band, the proof points its spec and billing lines, the price
 * the intro offer and ad-hoc rate from the live rate card (never typed), the
 * questions the homepage FAQ's own answers. No render-time or speed claim.
 *
 * Rendered twice like every priced page: /go/gpu in rupees and app/usd/go/gpu
 * in dollars (proxy.ts). The dollar copy plays the reel cut before its rupee
 * price card, so a visitor abroad never sees ₹ (one currency per visitor).
 */

const FAQ_PICK = ["Is this a render farm?", "Do I need to install anything?", "What internet speed do I need?"];

export async function gpuLandingMetadata(currency: Currency): Promise<Metadata> {
  const card = await getRateCard();
  const offer = introOfferFor(card, currency);
  return {
    title: "Your laptop, with a workstation-class GPU behind it",
    description: offer
      ? `A Windows GPU workstation by the minute, streamed to the laptop you own. First top-up ${introOfferShort(offer).main}${introOfferShort(offer).alt ? `, ${introOfferShort(offer).alt}` : ""}.`
      : `A Windows GPU workstation by the minute, streamed to the laptop you own.`,
    robots: { index: false, follow: false },
  };
}

export default async function GpuLandingView({ currency }: { currency: Currency }) {
  const card = await getRateCard();
  const intro = introOfferFor(card, currency);
  const hourly = adhocRateHourly(card, currency);
  const ladder = ladderRanges(card);
  const faq = buildFaq(storageTerms(card), intro, adhocRate(card, currency) ?? undefined, currency).filter((f) =>
    FAQ_PICK.includes(f.q),
  );

  // The price line, kept to one sentence (funnel audit, 22 Oct 2026: with
  // the full GPU names it ran to four lines on a phone and the button sat
  // under them). The cards below carry every GPU's name, VRAM and rate.
  const more = intro ? introOfferMoreGpus(intro).length : 0;
  // First top-up A/B (owner approved 22 Oct 2026), rupee page only: the
  // "intro500" arm's line, shown after mount to the visitors this browser
  // drew into that arm on landing (components/go/intro-alt-line.tsx). The
  // standing line above it is unchanged for everyone.
  const alt = currency === "INR" && intro ? introOfferVariant(card) : null;
  const price = intro ? (
    <>
      First top-up <b className="font-semibold">{introOfferShort(intro).main}</b>{introOfferShort(intro).alt ? `, ${introOfferShort(intro).alt}` : more ? ", more hours on the cheaper cards" : ""}
      {hourly ? <span className="text-ink-2"> · {ladder && ladder.count > 1 ? "from " : ""}{hourly} after that</span> : null}
      <IntroAltLine offer={alt} />
    </>
  ) : hourly ? (
    <>
      <b className="font-semibold">{hourly}</b>, billed by the minute
    </>
  ) : null;

  // The biggest capability on the ladder, first (owner, 22 Oct 2026). Read
  // from the rate card: the largest VRAM among the public cards.
  const maxVram = Math.max(0, ...publicGpus(card).map((g) => g.vram_gb));

  return (
    <AdLanding
      eyebrow={maxVram ? `GPU workstations · up to ${maxVram} GB of GPU memory` : "GPU workstations"}
      title={
        <>
          Your laptop, with a <span className="cfx-hl">workstation-class GPU</span> behind it.
        </>
      }
      lead={
        maxVram
          ? `Open D5, Lumion, Blender or Twinmotion on a full Windows workstation from the laptop you already own, streamed in 4K. Pick the card by the scene, ${Math.min(...publicGpus(card).map((g) => g.vram_gb))} GB to ${maxVram} GB.`
          : "Open D5, Lumion, Blender or Twinmotion on a full Windows workstation from the laptop you already own, streamed in 4K."
      }
      price={price}
      cta={{ href: "/signup", label: "Get started", event: "go_gpu_cta" }}
      ctaNote="Email, a WhatsApp code, then your first top-up. No monthly plan, no ID documents."
      trust={[
        "Signed Windows app (Coreframe Compute Labs)",
        currency === "USD" ? "Indian company, invoice in US dollars" : "Indian company, GST invoice",
        "Failed connections are never charged",
      ]}
      points={[
        "A Windows desktop with the apps installed, not a Linux box you SSH into",
        "Unreal Engine, D5 Render, Blender and Twinmotion preinstalled",
        "Billed per minute; close it and billing stops",
      ]}
      ladder={<GpuCards card={card} currency={currency} />}
      video={{
        src: currency === "USD" ? "/go/gpu-reel-usd.mp4" : "/go/gpu-reel-inr.mp4",
        poster: "/go/gpu-poster.webp",
        label: `A real session: ${withArticle(NODE.gpu)} workstation opens from a laptop, Blender renders the scene, and the render is sent to the client.`,
      }}
      faq={faq}
      viewContent={{ name: "Ad landing: GPU workstation", category: "workstation" }}
    />
  );
}
