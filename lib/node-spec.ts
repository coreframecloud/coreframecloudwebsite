/**
 * What is actually in a Coreframe workstation. One source, because it was
 * eight.
 *
 * The site claimed "64 GB ECC RAM" and a 6-core server CPU on eight pages —
 * about, compute-nodes, enterprise, d5-render, lumion, enscape and twice in
 * the software-page FAQ answers. Both halves were wrong, and wrong in the
 * flattering direction: ECC and a server CPU are server-grade claims, and the node is a
 * consumer desktop CPU with non-ECC memory.
 *
 * That is the worst kind of error on this site. The audience for a GPU
 * workstation page is exactly the audience that knows a server CPU has more than
 * six cores and that ECC is not what you get in a desktop board — so an
 * overstated spec does not read as marketing, it reads as either dishonesty or
 * not knowing your own hardware. Neither survives a trial.
 *
 * Every page now imports from here. If the fleet changes, this file changes,
 * and nothing is left behind on a page nobody remembered.
 *
 * Only put a figure here that someone has read off the machine.
 */

import { formatMoney } from "./money";

/**
 * THE GPU LADDER (owner, 21 Oct 2026). The site sells GPU workstations, and
 * which GPUs are on offer is decided by the control plane: /public/rate-card
 * lists the public profiles, and every GPU list on the site renders that
 * (`publicGpus()` in lib/rate-card.ts, <GpuLadder/>). So no page may say the
 * RTX 5080 is THE workstation any more, and no page may name a GPU the card
 * does not publish yet. Where prose needs a noun with no rate card to hand,
 * use GPU_CLASS ("a workstation-class GPU"); where a list fits, render the
 * ladder.
 *
 * `NODE` below stays as the record of the BASE node that the dated material
 * on the site was made on: the benchmark figures, the walkthrough video, the
 * app screenshots and the hardware estimate. Those describe that machine and
 * stay true. Use NODE.gpu for them only.
 */
export const GPU_CLASS = "workstation-class GPU";

export const NODE = {
  /** The base node (see above). Not "the" GPU: the ladder is the rate card. */
  gpu: "RTX 5080",
  vram: "16 GB GDDR7",
  /** 256-bit at 30 Gbps. Memory bandwidth on the card — NOT a disk figure. */
  memoryBandwidth: "960 GB/s",
  /** Non-ECC. Do not add "ECC": it is a consumer platform. */
  ram: "64 GB",
  /**
   * Owner's rule (11 Oct 2026): never name the CPU's maker or model anywhere
   * on the site. Describe it by its cores and threads only.
   */
  cpu: "8-core, 16-thread high-performance CPU",
  /** Where space is tight (spec tiles, chips). */
  cpuShort: "8 cores / 16 threads",
  /**
   * 2 × 480 GB Crucial E100 NVMe (PCIe Gen 4), shown as one figure on the
   * owner's call (11 Oct 2026). Do not say "Gen 5": it is a Gen 4 drive.
   */
  disk: "1 TB NVMe",
  stream: "4K at 60 fps",
  os: "Windows 11",
  location: "Bengaluru, India",
} as const;

/**
 * What an equivalent workstation costs to buy in India, landed.
 *
 * This is the comparison the whole pricing argument rests on, and it was
 * written eleven different ways across the site — "₹5,00,000", "₹5 lakh",
 * "five lakh", and on the landing page "four lakhs", which disagreed with
 * every other page before anyone noticed.
 *
 * Corrected to ₹6,00,000 on 30 Sep 2026: the machines cost that now.
 *
 * It is a claim about the market, not about us, so it goes stale the way
 * hardware prices do. Re-check it before a campaign, and change it HERE —
 * some pages still carry the literal in prose, and those are the ones that
 * will drift next.
 */
export const WORKSTATION_REPLACEMENT_COST = "₹6,00,000";

/**
 * The same estimate for a buyer outside India: about $6,000 (owner, 18 Oct
 * 2026). Typed once, here, beside the rupee figure; it is NOT a conversion of
 * it. Re-check both together.
 */
export const WORKSTATION_REPLACEMENT_COST_USD = 6_000;

/** The estimate as a number in `cur`, for break-even arithmetic. */
export function replacementCostValue(cur: "INR" | "USD"): number {
  return cur === "USD"
    ? WORKSTATION_REPLACEMENT_COST_USD
    : Number(WORKSTATION_REPLACEMENT_COST.replace(/[^\d]/g, ""));
}

/**
 * The estimate for a visitor shown `cur` prices, in that currency only (owner,
 * 18 Oct 2026: one currency per visitor): "₹6,00,000" or "$6,000".
 */
export function replacementCost(cur: "INR" | "USD"): string {
  return cur === "USD" ? formatMoney(WORKSTATION_REPLACEMENT_COST_USD, "USD") : WORKSTATION_REPLACEMENT_COST;
}

/** One line, for a meta description or a dense spec strip. */
export const NODE_SUMMARY =
  `${NODE.gpu} · ${NODE.vram} · ${NODE.memoryBandwidth} · ${NODE.ram} RAM · ${NODE.cpu}`;
