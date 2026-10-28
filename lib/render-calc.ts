/**
 * The render-time calculator (/tools/render-time, 28 Oct 2026): the freebie
 * behind the Instagram "comment RENDER" campaign.
 *
 * WHAT IT DOES. The visitor picks their GPU and how many frames, and either
 * types how long ONE frame takes them today or leaves it blank. We scale that
 * time by relative GPU speed to every GPU on the live rate card and price it
 * at the live per-hour rate. Every number on the page is an ESTIMATE and the
 * page says so.
 *
 * WHERE THE SPEED NUMBERS COME FROM (no other source, no guesses):
 *
 *   1. Relative speed between GPUs: Blender Open Data (opendata.blender.org),
 *      Blender 4.5.0, median benchmark score per device, OptiX for NVIDIA and
 *      Metal for Apple. Query used:
 *        https://opendata.blender.org/benchmarks/query/?compute_type=OPTIX&blender_version=4.5.0&group_by=device_name
 *        (and compute_type=METAL for the Apple chips)
 *      Read 28 Oct 2026; snapshot in plans/comment-render-20261028/data/.
 *      The score is samples per minute over Blender's three benchmark scenes,
 *      so a higher score is a proportionally faster GPU FOR CYCLES. Only
 *      devices with at least 10 submitted runs are listed (most have hundreds).
 *
 *   2. The absolute anchor when the visitor does not know their own frame
 *      time: our own measured render, Blender's 4.1 splash scene
 *      (blender-4.1-splash.blend, 600 samples, denoise on, OptiX) on our
 *      RTX 5080 workstation, second (warm) render 1:44.6, 27 Oct 2026
 *      (plans/gpu-p-vm-learnings-20261027.md, section 3). The same scene on
 *      our RTX 6000 Ada measured 1:05.3 warm, faster than Open Data's ratio
 *      predicts; we still use the Open Data ratio for every GPU, the more
 *      conservative of the two, and never the single faster run.
 *
 * WHAT IT DOES NOT KNOW. Blender Open Data measures Cycles only. Unreal and
 * Twinmotion path tracing, D5 and V-Ray GPU are also RT-core path tracers and
 * usually rank GPUs in a similar order, but we have not measured them and the
 * ratio can differ; the page says that beside the result. Scene load, first-
 * render warm-up and VRAM limits are not modelled.
 *
 * The RTX PRO 6000 has three Open Data entries (Workstation, Server, Max-Q);
 * we use the slowest, Max-Q, so the estimate never flatters our card.
 *
 * No imports, so tests/render-calc.test.ts runs it under plain node.
 */

export const BENCH_SOURCE = {
  name: "Blender Open Data",
  url: "https://opendata.blender.org/",
  version: "Blender 4.5.0",
  read: "28 Oct 2026",
} as const;

/** Our measured anchor: Blender 4.1 splash scene, 600 samples, warm render. */
export const ANCHOR = {
  gpu: "RTX 5080",
  score: 9138.2,
  seconds: 104.6,
  scene: "Blender 4.1 splash scene, 600 samples",
} as const;

export type UserGpu = { id: string; label: string; group: "Laptop" | "Desktop" | "Pro" | "Apple"; score: number; runs: number };

/** Common GPUs, Blender Open Data 4.5.0 median score and number of runs. */
export const USER_GPUS: UserGpu[] = [
  // Laptops (most of our visitors)
  { id: "rtx3050m", label: "RTX 3050 Laptop", group: "Laptop", score: 1144.1, runs: 198 },
  { id: "rtx3060m", label: "RTX 3060 Laptop", group: "Laptop", score: 2134.2, runs: 176 },
  { id: "rtx3070m", label: "RTX 3070 Laptop", group: "Laptop", score: 2708.2, runs: 123 },
  { id: "rtx3080m", label: "RTX 3080 Laptop", group: "Laptop", score: 2857.5, runs: 53 },
  { id: "rtx4050m", label: "RTX 4050 Laptop", group: "Laptop", score: 2584.4, runs: 402 },
  { id: "rtx4060m", label: "RTX 4060 Laptop", group: "Laptop", score: 3275.9, runs: 579 },
  { id: "rtx4070m", label: "RTX 4070 Laptop", group: "Laptop", score: 3555.1, runs: 226 },
  { id: "rtx4080m", label: "RTX 4080 Laptop", group: "Laptop", score: 5430.5, runs: 87 },
  { id: "rtx4090m", label: "RTX 4090 Laptop", group: "Laptop", score: 6845.8, runs: 70 },
  { id: "rtx5050m", label: "RTX 5050 Laptop", group: "Laptop", score: 2963.4, runs: 145 },
  { id: "rtx5060m", label: "RTX 5060 Laptop", group: "Laptop", score: 3494.5, runs: 302 },
  { id: "rtx5070m", label: "RTX 5070 Laptop", group: "Laptop", score: 4020.8, runs: 234 },
  { id: "rtx5070tim", label: "RTX 5070 Ti Laptop", group: "Laptop", score: 4970.0, runs: 216 },
  { id: "rtx5080m", label: "RTX 5080 Laptop", group: "Laptop", score: 6517.4, runs: 250 },
  { id: "rtx5090m", label: "RTX 5090 Laptop", group: "Laptop", score: 7891.1, runs: 153 },
  // Desktop cards
  { id: "gtx1660s", label: "GTX 1660 SUPER", group: "Desktop", score: 748.0, runs: 112 },
  { id: "rtx2060", label: "RTX 2060", group: "Desktop", score: 1562.4, runs: 168 },
  { id: "rtx2070s", label: "RTX 2070 SUPER", group: "Desktop", score: 2223.0, runs: 104 },
  { id: "rtx2080ti", label: "RTX 2080 Ti", group: "Desktop", score: 2837.6, runs: 136 },
  { id: "rtx3050", label: "RTX 3050", group: "Desktop", score: 1344.7, runs: 145 },
  { id: "rtx3060", label: "RTX 3060", group: "Desktop", score: 2154.9, runs: 631 },
  { id: "rtx3060ti", label: "RTX 3060 Ti", group: "Desktop", score: 2764.5, runs: 232 },
  { id: "rtx3070", label: "RTX 3070", group: "Desktop", score: 3190.1, runs: 312 },
  { id: "rtx3080", label: "RTX 3080", group: "Desktop", score: 4529.2, runs: 579 },
  { id: "rtx3090", label: "RTX 3090", group: "Desktop", score: 5412.2, runs: 630 },
  { id: "rtx4060", label: "RTX 4060", group: "Desktop", score: 3181.9, runs: 439 },
  { id: "rtx4060ti", label: "RTX 4060 Ti", group: "Desktop", score: 3940.8, runs: 332 },
  { id: "rtx4070", label: "RTX 4070", group: "Desktop", score: 5219.0, runs: 262 },
  { id: "rtx4070s", label: "RTX 4070 SUPER", group: "Desktop", score: 6247.5, runs: 465 },
  { id: "rtx4080s", label: "RTX 4080 SUPER", group: "Desktop", score: 8419.2, runs: 239 },
  { id: "rtx4090", label: "RTX 4090", group: "Desktop", score: 11061.5, runs: 527 },
  { id: "rtx5060", label: "RTX 5060", group: "Desktop", score: 3680.1, runs: 373 },
  { id: "rtx5060ti", label: "RTX 5060 Ti", group: "Desktop", score: 4309.3, runs: 655 },
  { id: "rtx5070", label: "RTX 5070", group: "Desktop", score: 6173.5, runs: 914 },
  { id: "rtx5070ti", label: "RTX 5070 Ti", group: "Desktop", score: 7589.0, runs: 1415 },
  { id: "rtx5080", label: "RTX 5080", group: "Desktop", score: 9138.2, runs: 1432 },
  { id: "rtx5090", label: "RTX 5090", group: "Desktop", score: 14966.0, runs: 1555 },
  // Workstation cards
  { id: "a2000", label: "RTX A2000 12GB", group: "Pro", score: 1751.2, runs: 34 },
  { id: "rtx2000ada", label: "RTX 2000 Ada", group: "Pro", score: 2658.8, runs: 25 },
  { id: "a4000", label: "RTX A4000", group: "Pro", score: 2955.8, runs: 44 },
  { id: "rtx4000ada", label: "RTX 4000 Ada", group: "Pro", score: 4445.7, runs: 16 },
  { id: "a5000", label: "RTX A5000", group: "Pro", score: 4390.5, runs: 24 },
  // Apple (Blender only: the other renderers listed are Windows apps)
  { id: "m1pro16", label: "Apple M1 Pro (16-core GPU)", group: "Apple", score: 483.4, runs: 44 },
  { id: "m2pro19", label: "Apple M2 Pro (19-core GPU)", group: "Apple", score: 902.0, runs: 12 },
  { id: "m3pro18", label: "Apple M3 Pro (18-core GPU)", group: "Apple", score: 1756.4, runs: 30 },
  { id: "m4", label: "Apple M4 (10-core GPU)", group: "Apple", score: 1080.6, runs: 176 },
  { id: "m4pro20", label: "Apple M4 Pro (20-core GPU)", group: "Apple", score: 2568.4, runs: 123 },
  { id: "m4max40", label: "Apple M4 Max (40-core GPU)", group: "Apple", score: 5266.9, runs: 124 },
];

/**
 * Open Data score for a GPU on the rate card, matched on its `gpu_model`.
 * Order matters: "RTX PRO 6000" before anything shorter. Null for a card we
 * have no score for; the page then leaves that card out rather than guess.
 */
const OUR_SCORES: { match: RegExp; score: number }[] = [
  { match: /RTX PRO 6000/i, score: 14746.0 },
  { match: /RTX 6000 Ada/i, score: 10655.3 },
  { match: /RTX 5080/i, score: 9138.2 },
  { match: /RTX A5000/i, score: 4390.5 },
  { match: /RTX A4000/i, score: 2955.8 },
];

export function ourGpuScore(gpuModel: string): number | null {
  return OUR_SCORES.find((s) => s.match.test(gpuModel))?.score ?? null;
}

export type SoftwareId = "blender" | "unreal" | "d5" | "vray";

export const SOFTWARE: { id: SoftwareId; label: string; note: string | null; appleOk: boolean }[] = [
  { id: "blender", label: "Blender Cycles", note: null, appleOk: true },
  {
    id: "unreal",
    label: "Unreal / Twinmotion path tracer",
    note: "Speed ratios come from Blender's benchmark. Unreal and Twinmotion path tracing also run on the GPU's RT cores and usually rank GPUs the same way, but we haven't measured them, so treat this as a rough guide.",
    appleOk: false,
  },
  {
    id: "d5",
    label: "D5 Render",
    note: "Speed ratios come from Blender's benchmark. D5 also renders on the GPU's RT cores and usually ranks GPUs the same way, but we haven't measured it, so treat this as a rough guide.",
    appleOk: false,
  },
  {
    id: "vray",
    label: "V-Ray GPU",
    note: "Speed ratios come from Blender's benchmark. V-Ray GPU also renders on the GPU's RT cores and usually ranks GPUs the same way, but we haven't measured it, so treat this as a rough guide.",
    appleOk: false,
  },
];

/** Minutes added to every workstation estimate: upload, open the scene, check one frame. */
export const SETUP_MINUTES = 15;

/** Seconds per frame on `fromScore` scaled to a GPU with `toScore`. */
export function scaleSeconds(seconds: number, fromScore: number, toScore: number): number {
  if (!(seconds > 0) || !(fromScore > 0) || !(toScore > 0)) return 0;
  return (seconds * fromScore) / toScore;
}

/** The anchor scene's frame time on a GPU, from our measured RTX 5080 run. */
export function anchorSecondsOn(score: number): number {
  return scaleSeconds(ANCHOR.seconds, ANCHOR.score, score);
}

/**
 * Cost of `renderSeconds` of rendering plus the setup allowance, billed per
 * minute (rounded up) at `hourly`. Rounded to the currency's smallest unit.
 */
export function costFor(renderSeconds: number, hourly: number, setupMinutes = SETUP_MINUTES): number {
  const minutes = Math.ceil(Math.max(0, renderSeconds) / 60) + setupMinutes;
  return Math.round(((minutes * hourly) / 60) * 100) / 100;
}

/** "45 s", "3 min 20 s", "2 h 05 min", "3 days 4 h". */
export function formatDuration(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  if (s < 60) return `${s} s`;
  if (s < 3600) {
    const m = Math.floor(s / 60);
    const r = s % 60;
    return r ? `${m} min ${r} s` : `${m} min`;
  }
  if (s < 86400 * 2) {
    const h = Math.floor(s / 3600);
    const m = Math.round((s % 3600) / 60);
    if (m === 60) return `${h + 1} h`;
    return m ? `${h} h ${String(m).padStart(2, "0")} min` : `${h} h`;
  }
  const d = Math.floor(s / 86400);
  const h = Math.round((s % 86400) / 3600);
  return h ? `${d} days ${h} h` : `${d} days`;
}

/** Parse "1:45", "1:45.2", "105", "2.5m"-style input into seconds; null when unusable. */
export function parseFrameTime(raw: string, unit: "s" | "min"): number | null {
  const t = raw.trim().replace(",", ".");
  if (!t) return null;
  const colon = /^(\d{1,3}):([0-5]?\d(?:\.\d+)?)$/.exec(t);
  if (colon) {
    const v = Number(colon[1]) * 60 + Number(colon[2]);
    return v > 0 ? v : null;
  }
  const n = Number(t);
  if (!Number.isFinite(n) || n <= 0) return null;
  const v = unit === "min" ? n * 60 : n;
  return v <= 86400 ? v : null;
}
