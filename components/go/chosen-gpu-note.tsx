"use client";

import { useSyncExternalStore } from "react";
import { useRateCard } from "@/lib/use-rate-card";
import { publicGpus, shortGpuName } from "@/lib/rate-card";
import { cleanSlug, readGpuChoice } from "@/lib/gpu-start";

/**
 * /download after the first payment (owner, 10 Nov 2026: straight to Connect
 * with the card the visitor chose before sign-up). ?gpu= from the payment step,
 * else this browser's saved choice (lib/gpu-start.ts). Nothing when neither.
 * No price on it: this page does not know the account's currency, and one
 * visitor sees one currency only; Connect shows the rate.
 */
export function ChosenGpuNote() {
  const card = useRateCard();
  const slug = useSyncExternalStore(
    () => () => {},
    () => cleanSlug(new URLSearchParams(window.location.search).get("gpu")) ?? readGpuChoice()?.gpu ?? null,
    () => null,
  );
  const g = slug ? publicGpus(card).find((x) => x.slug === slug) : null;
  if (!g) return null;
  return (
    <div className="mb-6 rounded-cf border border-blue/30 bg-tint-blue px-4 py-3.5">
      <p className="text-[12px] font-semibold tracking-[0.06em] text-blue-ink uppercase">Your GPU</p>
      <p className="font-heading text-[19px] font-medium text-ink">
        {shortGpuName(g.name)} · {g.vram_gb} GB
      </p>
      <p className="mt-1 text-[14px] leading-5 text-ink-2">
        Billed by the minute from your wallet. Install Connect, sign in with the same
        account and start your {shortGpuName(g.name)} from its list.
      </p>
    </div>
  );
}
