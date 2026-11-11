import { BANDWIDTH_SENTENCE } from "@/lib/streaming-terms";
import type { BlogContext, BlogPost, MaybeBlock } from "../types";

const SLUG = "enscape-system-requirements";
const IMG = `/blog/${SLUG}`;

/**
 * Written 11 Nov 2026 (content quick wins, owner-approved), same format as
 * d5-render-system-requirements-laptop.ts. "enscape workstation" ranks 13.3
 * with nothing specific behind it.
 *
 * EVERY ENSCAPE FIGURE IS QUOTED FROM CHAOS'S OWN PAGES, read 11 Nov 2026:
 *   documentation.chaos.com/space/ENSCAPE/842039327/System+Requirements ...
 *       Windows 10 or higher. Dedicated GPU minimum 4 GB VRAM, Vulkan 1.2:
 *       NVIDIA GeForce GTX 10 / Quadro P series and newer, AMD Radeon RX 5000
 *       / Radeon Pro equivalent and newer, Intel Arc A310 and newer.
 *       Recommended 8 GB (e.g. RTX 3070 Ti, RX 6800). VR 12 GB (e.g. RTX 4070
 *       Ti, RX 7900 XT). Integrated GPUs supported at the minimum only (Intel
 *       13th gen+ UHD 64EU laptop / UHD 730 desktop; Ryzen 6000 Radeon 660M+,
 *       Ryzen 7000 Radeon 740M+); no VR or hardware ray tracing on them.
 *       GTX 1660 / T1000 / T2000: DLSS and HW ray tracing disabled since
 *       Enscape 4.0. No SLI; one GPU used. Latest or recommended drivers.
 *       .NET 4.5.2+, VC++ 2015-2019, Vulkan runtime. Hosts: Revit 2024-2027
 *       (not LT), SketchUp 2024-2026 (2027 beta), Rhino 7 / 8, Archicad 28-30,
 *       Vectorworks 2025-2027. macOS 14.8.1+, Apple M1-M5; no Intel Macs;
 *       Revit not on Mac. No RAM, disk or VM/cloud statement on this page.
 *   support.chaos.com/hc/en-us/articles/31808932235281 (updated 28 Oct 2026)
 *       ... 4 GB to be officially supported, 8 GB or more recommended, 12 GB
 *       for VR, "as much memory as possible" for complex scenes; full hardware
 *       ray tracing only on NVIDIA RTX, not most AMD cards; CPU matters only
 *       for the host application; fast SSD speeds loading/saving; Parallels and
 *       Boot Camp not supported on Mac.
 *
 * NOT CLAIMED: that Enscape is preinstalled (it is the customer's Chaos
 * licence, plus a host app licence), that Enscape officially supports cloud
 * desktops (Chaos's pages don't say), VR over our streaming (not tested), a
 * RAM minimum (Chaos publishes none) or any render speed.
 */
const CHECKED = "11 November 2026";
const REQ_URL = "https://documentation.chaos.com/space/ENSCAPE/842039327/System+Requirements";
const HW_URL = "https://support.chaos.com/hc/en-us/articles/31808932235281-Enscape-System-requirements-Recommended-hardware";

function cardTable(ctx: BlogContext): MaybeBlock[] {
  if (!ctx.gpus.length) return [];
  const tiers: { label: string; vram: number }[] = [
    { label: "Minimum: 4 GB VRAM", vram: 4 },
    { label: "Recommended: 8 GB VRAM", vram: 8 },
    { label: "Heavy scenes: 4K textures, site context, federated models", vram: 24 },
  ];
  const rows = tiers.map((t) => {
    const g = ctx.gpuFor(t.vram);
    return [t.label, g ? `${g.name} (${g.vramGb} GB VRAM, ${g.ramGb} GB RAM)` : "Ask us", g ? g.hourly : "—"];
  });
  return [
    { type: "table", head: ["Enscape asks for", "Coreframe card that meets it", `Price (${ctx.taxShort})`], rows },
    {
      type: "p",
      text: "Chaos's own advice for complex scenes is a GPU with as much memory as possible, so the third row is ours, not Chaos's: it's for projects that measure well above 8 GB. We haven't tested Enscape's VR mode over a streamed workstation, so we don't recommend a card for VR. Not sure where your project sits? [Measure its memory first](/vram-for-architectural-rendering).",
    },
  ];
}

export const enscapeSystemRequirements: BlogPost = {
  slug: SLUG,
  title: "Enscape system requirements 2026: graphics card, VRAM and laptops",
  absoluteTitle: "Enscape System Requirements 2026: GPU, VRAM & Laptop",
  description:
    "Enscape needs Windows 10+ and a GPU with 4 GB VRAM and Vulkan 1.2 at least; Chaos recommends 8 GB VRAM, 12 GB for VR. Full specs, laptops, Mac and hosts.",
  targetQueries: [
    "enscape system requirements",
    "enscape requirements",
    "enscape graphics card requirements",
    "enscape minimum requirements",
    "enscape laptop requirements",
    "enscape vram",
    "enscape workstation",
  ],
  datePublished: "2026-11-11",
  draft: false,
  eyebrow: "Guide · Hardware",
  hero: {
    src: `${IMG}/enscape-requirements-tiers.webp`,
    alt: "Enscape's Windows GPU tiers as published by Chaos: Minimum 4 GB VRAM with Vulkan 1.2, Recommended 8 GB, VR 12 GB.",
    width: 1600,
    height: 900,
    caption: `Enscape's published Windows GPU tiers, read on ${CHECKED}. Our own summary graphic of Chaos's figures.`,
  },
  answer: () =>
    `Enscape runs on Windows 10 or higher and needs a graphics card with at least 4 GB of video memory (VRAM) and Vulkan 1.2 support: an NVIDIA GeForce GTX 10 or Quadro P series card or newer, an AMD Radeon RX 5000 series card or newer, or an Intel Arc A310 or newer. Chaos recommends 8 GB of VRAM (for example an RTX 3070 Ti or RX 6800) and 12 GB for VR. Hardware ray tracing works in full only on NVIDIA RTX cards. Recent Intel and AMD integrated graphics can run Enscape at the minimum, but without ray tracing or VR.`,
  body: (ctx) => [
    { type: "h2", text: "Enscape system requirements for Windows" },
    {
      type: "p",
      text: `These are Chaos's own figures, from [Enscape's system requirements page](${REQ_URL}) and its [recommended hardware article](${HW_URL}), as we read them on ${CHECKED}. Chaos updates them with new Enscape versions, so check before you buy hardware.`,
    },
    {
      type: "spec",
      label: `Enscape on Windows, as published by Chaos (checked ${CHECKED})`,
      rows: [
        ["Operating system", "Windows 10 or higher"],
        ["GPU, minimum", "4 GB VRAM with Vulkan 1.2: GeForce GTX 10 / Quadro P series, Radeon RX 5000 / Radeon Pro, Intel Arc A310, or newer"],
        ["GPU, recommended", "8 GB VRAM, e.g. GeForce RTX 3070 Ti or Radeon RX 6800"],
        ["GPU, VR", "12 GB VRAM, e.g. GeForce RTX 4070 Ti or Radeon RX 7900 XT"],
        ["Integrated graphics", "Minimum only: Intel 13th gen+ (UHD 64EU laptop, UHD 730 desktop), Ryzen 6000 (660M+) or 7000 (740M+); no VR or ray tracing"],
        ["Ray tracing", "Full hardware ray tracing on NVIDIA RTX; not available on most AMD cards"],
        ["Multiple GPUs", "SLI not supported; Enscape uses one GPU"],
        ["Drivers", "The latest, or at least Chaos's recommended drivers"],
        ["Other software", ".NET Framework 4.5.2+, Visual C++ 2015–2019 Redistributable, Vulkan Runtime"],
        ["Host applications", "Revit 2024–2027 (not LT), SketchUp 2024–2026, Rhino 7 and 8, Archicad 28–30, Vectorworks 2025–2027"],
      ],
    },
    {
      type: "note",
      text: "Chaos publishes no RAM or disk-space minimum for Enscape. It says the CPU matters only for running the host application (Revit, SketchUp and so on) smoothly, and that a fast SSD speeds up loading and saving projects. Plan RAM for your host application. Since Enscape 4.0, the GTX 1660, T1000 and T2000 run without DLSS or hardware ray tracing.",
    },
    {
      type: "p",
      text: "Chaos also says, in its own words, that the more complex the scene, the more memory it needs, and recommends a GPU with as much memory as possible. The 8 GB figure is a starting point for typical projects, not a ceiling. [Our VRAM guide](/vram-for-architectural-rendering) shows how to read what your own project uses.",
    },

    { type: "h2", text: "Can a laptop run Enscape?" },
    {
      type: "p",
      text: "Many can, with limits. A laptop with a dedicated card of 4 GB or more meets the minimum, and Chaos now lists recent integrated graphics too (Intel 13th-gen UHD 64EU and newer, AMD Radeon 660M and 740M and newer), but only at the minimum tier, with no ray tracing and no VR. For the recommended 8 GB you need a gaming or workstation laptop with an 8 GB card.",
    },
    {
      type: "p",
      text: "Enscape uses one GPU. On a laptop with both an integrated chip and a dedicated card, set the dedicated card as the high-performance GPU for your host application (Revit, SketchUp, Rhino) in Windows' graphics settings, because Enscape runs inside it. Task Manager (Ctrl+Shift+Esc) → Performance shows each GPU and its Dedicated GPU memory.",
    },

    { type: "h2", text: "Enscape on a Mac" },
    {
      type: "p",
      text: "Enscape has a Mac version for Apple silicon (M1 and newer) on macOS 14.8.1 Sonoma or later; Intel Macs are not supported, and Chaos says Parallels and Boot Camp aren't either. The Mac version works with SketchUp, Rhino, Archicad and Vectorworks. Revit isn't on the Mac list, so Enscape for Revit needs Windows.",
    },

    { type: "h2", text: "Which Coreframe workstation for Enscape" },
    {
      type: "p",
      text: "A Coreframe workstation is a Windows desktop with a dedicated NVIDIA RTX GPU (so hardware ray tracing is available), streamed to your laptop. You install your host application and Enscape with your own licences; we don't supply either. Chaos's pages don't make a statement about cloud or virtual desktops, so treat your first session as the test. The cheapest card for each need, at today's prices:",
    },
    ...cardTable(ctx),

    { type: "h2", text: "If your laptop falls short" },
    {
      type: "p",
      text: `Instead of buying a new laptop for Enscape, you can run Revit, SketchUp or Rhino with Enscape on a remote workstation and stream it. ${ctx.billing} Project files stay on Coreframe storage between sessions. You connect from the Coreframe Connect app on a Windows laptop. ${BANDWIDTH_SENTENCE}`,
    },
    ctx.hourly
      ? { type: "p", text: `Cards start at ${ctx.hourly} ${ctx.taxIncl}. More on the setup is on [Enscape on a cloud GPU](/enscape-cloud-gpu).` }
      : { type: "p", text: "More on the setup is on [Enscape on a cloud GPU](/enscape-cloud-gpu), and current rates on the [pricing page](/pricing)." },
  ],
  faqs: (ctx) => {
    const rec = ctx.gpuFor(8);
    return [
      {
        q: "What are the minimum requirements for Enscape?",
        a: `Per Chaos (read ${CHECKED}): Windows 10 or higher and a GPU with at least 4 GB of VRAM and Vulkan 1.2, such as an NVIDIA GeForce GTX 10 or Quadro P series card, an AMD Radeon RX 5000 series card or an Intel Arc A310, or newer.`,
      },
      {
        q: "How much VRAM does Enscape need?",
        a: "4 GB at the minimum, 8 GB recommended and 12 GB for VR, per Chaos. Chaos also says complex scenes need more and recommends as much GPU memory as possible.",
      },
      {
        q: "What graphics card is recommended for Enscape?",
        a: "Chaos recommends a card with 8 GB of VRAM, giving the GeForce RTX 3070 Ti and Radeon RX 6800 as examples, and 12 GB for VR (RTX 4070 Ti, RX 7900 XT). Full hardware ray tracing is available on NVIDIA RTX cards.",
      },
      {
        q: "Can Enscape run on integrated graphics?",
        a: "At the minimum tier only: Chaos lists Intel 13th-gen and newer integrated graphics (UHD 64EU on laptops, UHD 730 on desktops) and AMD Ryzen 6000 (Radeon 660M+) and 7000 (740M+). Integrated graphics get no VR and no hardware ray tracing.",
      },
      {
        q: "How much RAM does Enscape need?",
        a: "Chaos doesn't publish a RAM figure for Enscape. Size RAM for your host application (Revit, SketchUp, Rhino, Archicad or Vectorworks), because Enscape runs inside it.",
      },
      {
        q: "Does Enscape work on a Mac?",
        a: "Yes, on Apple silicon Macs (M1 and newer) with macOS 14.8.1 or later, for SketchUp, Rhino, Archicad and Vectorworks. Intel Macs aren't supported, and Revit isn't on Chaos's Mac list.",
      },
      rec
        ? {
            q: "Which Coreframe workstation meets Enscape's recommended specs?",
            a: `The ${rec.name}, with ${rec.vramGb} GB of VRAM against Chaos's recommended 8 GB, for ${rec.hourly} ${ctx.taxIncl}, billed per minute. You install your host application and Enscape with your own licences.`,
          }
        : null,
    ];
  },
  related: [
    { href: "/enscape-cloud-gpu", label: "Enscape on a cloud GPU" },
    { href: "/vram-for-architectural-rendering", label: "Is 8 GB of VRAM enough?" },
    { href: "/blog/lumion-system-requirements", label: "Lumion system requirements" },
    { href: "/rtx-a4000-vs-rtx-a5000", label: "RTX A4000 vs RTX A5000 for rendering" },
    { href: "/tools/render-time", label: "Render-time calculator" },
  ],
};
