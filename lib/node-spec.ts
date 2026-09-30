/**
 * What is actually in a Coreframe workstation. One source, because it was
 * eight.
 *
 * The site claimed "64 GB ECC RAM and a 6-core AMD EPYC" on eight pages —
 * about, compute-nodes, enterprise, d5-render, lumion, enscape and twice in
 * the software-page FAQ answers. Both halves were wrong, and wrong in the
 * flattering direction: ECC and EPYC are server-grade words, and the node is a
 * consumer Ryzen 7 with non-ECC memory.
 *
 * That is the worst kind of error on this site. The audience for a GPU
 * workstation page is exactly the audience that knows an EPYC has more than
 * six cores and that ECC is not what you get in a desktop board — so an
 * overstated spec does not read as marketing, it reads as either dishonesty or
 * not knowing your own hardware. Neither survives a trial.
 *
 * Every page now imports from here. If the fleet changes, this file changes,
 * and nothing is left behind on a page nobody remembered.
 *
 * Only put a figure here that someone has read off the machine.
 */
export const NODE = {
  gpu: "RTX 5080",
  vram: "16 GB GDDR7",
  /** 256-bit at 30 Gbps. Memory bandwidth on the card — NOT a disk figure. */
  memoryBandwidth: "960 GB/s",
  /** Non-ECC. Do not add "ECC": it is a consumer platform. */
  ram: "64 GB",
  /**
   * Every Ryzen 7 part is 8-core, so the core count is safe without pinning
   * the exact model. Add the model here once it has been read off the node.
   */
  cpu: "8-core AMD Ryzen 7",
  disk: "1 TB NVMe Gen 5",
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

/** One line, for a meta description or a dense spec strip. */
export const NODE_SUMMARY =
  `${NODE.gpu} · ${NODE.vram} · ${NODE.memoryBandwidth} · ${NODE.ram} RAM · ${NODE.cpu}`;
