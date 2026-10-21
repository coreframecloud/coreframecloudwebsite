import type { Metadata } from "next";
import { AdLanding } from "@/components/go/ad-landing";
import { buildFaq } from "@/components/home/explainer-faq";
import { NODE } from "@/lib/node-spec";
import type { Currency } from "@/lib/money";
import { storageTerms } from "@/lib/storage-terms";
import { adhocRate, adhocRateHourly, getRateCard, hoursLabel, introOfferFor, introMoreGpusNote, introPrice, ladderRanges, withArticle } from "@/lib/rate-card";

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
      ? `A Windows GPU workstation by the minute, streamed to the laptop you own. First top-up: ${introPrice(offer)} = ${hoursLabel(offer.hours)}.`
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

  const price = intro ? (
    <>
      First top-up: <b className="font-semibold">{introPrice(intro)} = {hoursLabel(intro.hours)}</b>
      {intro.gpuName ? ` of ${intro.gpuName}` : ""}{introMoreGpusNote(intro)}
      {hourly ? <span className="text-ink-2"> · {ladder && ladder.count > 1 ? "from " : ""}{hourly} after that</span> : null}
    </>
  ) : hourly ? (
    <>
      <b className="font-semibold">{hourly}</b>, billed by the minute
    </>
  ) : null;

  return (
    <AdLanding
      eyebrow="GPU workstations"
      title={
        <>
          Your laptop, with a <span className="cfx-hl">workstation-class GPU</span> behind it.
        </>
      }
      lead="Open D5, Lumion, Blender or Twinmotion on a full Windows workstation from the laptop you already own, streamed in 4K."
      price={price}
      cta={{ href: "/signup", label: "Get started", event: "go_gpu_cta" }}
      ctaNote="Sign up with your email and a WhatsApp code. No monthly plan."
      points={[
        // The GPU ladder as ranges from the live rate card (owner, 21 Oct 2026).
        ladder ? `${ladder.gpu} · ${ladder.vram} VRAM · ${ladder.cpu} · ${ladder.ram} RAM` : "A dedicated GPU, a whole card to yourself",
        "Unreal Engine, D5 Render, Blender and Twinmotion preinstalled",
        "Billed per minute; close it and billing stops",
      ]}
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
