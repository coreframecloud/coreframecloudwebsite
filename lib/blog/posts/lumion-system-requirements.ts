import { BANDWIDTH_SENTENCE } from "@/lib/streaming-terms";
import type { BlogContext, BlogPost, MaybeBlock } from "../types";

const SLUG = "lumion-system-requirements";
const IMG = `/blog/${SLUG}`;

/**
 * Written 11 Nov 2026 (content quick wins, owner-approved): "{app} system
 * requirements" is our best non-brand search pattern (the D5 post), and
 * "lumion workstation" ranks 10.8 with nothing specific behind it.
 * Same format as d5-render-system-requirements-laptop.ts.
 *
 * EVERY LUMION FIGURE IS QUOTED FROM LUMION'S OWN SITE, read 11 Nov 2026:
 *   lumion.com/product/system-requirements ... Lumion Pro tiers: Minimum
 *       (G3DMark 8,000+, 6 GB VRAM, 16 GB RAM, CPUMark 2,200+ single thread,
 *       12 GB trial / 105 GB full free disk, "simple projects", not recommended
 *       for new purchases); Recommended (14,000+, 10 GB, 32 GB RAM, 2,600+,
 *       SATA3 SSD or NVMe); High-end (22,000+, 16 GB, 64 GB RAM, 3,000+).
 *       4K rasterisation and 1080p ray tracing need at least 8 GB VRAM.
 *       Windows 10 2004+ (build 19041) or Windows 11 24H2+ (build 26100).
 *       Online while running. Mac: not officially supported (Boot Camp route).
 *       Virtual PCs: "Lumion 9.0 and newer are supported on some virtual PC and
 *       remote desktop platforms"; many cloud desktops don't meet the specs.
 *       Built-in benchmark in the trial.
 *   support.lumion.com "Which graphics card do you need for Lumion 2026?" ...
 *       dedicated NVIDIA / AMD / Intel (Arc A580 or B580 and better) card, not
 *       onboard graphics; drivers NVIDIA 591.86+, AMD 26.1.1+, Intel 101.8509+;
 *       ray tracing needs a card that supports it, rasterisation otherwise.
 *   support.lumion.com "What file space do I need..." (article 4413804109202)
 *       ... Lumion 2026 full: 46.4 GB download, 115 GB installed; trial 11.8 GB;
 *       keep at least 30 GB (preferably 50 GB+) free on C: after installing.
 *
 * NOT CLAIMED: a G3DMark score for our cards (we haven't measured one; the
 * post says to run Lumion's own benchmark), that Lumion is preinstalled (it
 * is the customer's licence, lib/software-fit on software-pages-1111), or
 * any render speed. Card per tier is picked from the live rate card by the
 * VRAM and RAM lines Lumion publishes.
 */
const CHECKED = "11 November 2026";
const REQ_URL = "https://lumion.com/product/system-requirements";
const GPU_URL =
  "https://support.lumion.com/knowledge-base/api/v2/help-center/en-us/articles/which-graphics-card-do-you-need-for-lumion-2026";
const SPACE_URL = "https://support.lumion.com/knowledge-base/api/v2/help_center/en-us/articles/4413804109202";

/** Lumion Pro's three tiers, as published (VRAM GB, RAM GB). */
const TIERS = [
  { name: "Minimum", vram: 6, ram: 16, g3d: "8,000", use: "simple projects" },
  { name: "Recommended", vram: 10, ram: 32, g3d: "14,000", use: "complex projects: a large detailed home, a city section" },
  { name: "High-end", vram: 16, ram: 64, g3d: "22,000", use: "ultra-complex projects: a detailed city, an airport, a stadium" },
] as const;

function cardTable(ctx: BlogContext): MaybeBlock[] {
  if (!ctx.gpus.length) return [];
  const rows = TIERS.map((t) => {
    const g = ctx.gpuFor(t.vram, t.ram);
    return [
      `${t.name}: ${t.vram} GB VRAM, ${t.ram} GB RAM`,
      g ? `${g.name} (${g.vramGb} GB VRAM, ${g.ramGb} GB RAM)` : "Ask us",
      g ? g.hourly : "—",
    ];
  });
  const roomy = ctx.gpuFor(24);
  return [
    {
      type: "table",
      head: ["Lumion tier asks for", "Coreframe card that meets it", `Price (${ctx.taxShort})`],
      rows,
    },
    {
      type: "p",
      text: `We match the memory lines, the ones you can check on a spec sheet. Lumion's tiers also set a G3DMark speed score, which we haven't measured on our cards, so run Lumion's built-in benchmark in your first session before you commit a deadline to it.${
        roomy ? ` For ultra-complex scenes, the ${roomy.name} (${roomy.vramGb} GB, ${roomy.hourly}) leaves more room above Lumion's 16 GB line.` : ""
      } If you're not sure how much memory your project uses, [measure it first](/vram-for-architectural-rendering).`,
    },
  ];
}

export const lumionSystemRequirements: BlogPost = {
  slug: SLUG,
  title: "Lumion system requirements 2026: PC, laptop and graphics card",
  absoluteTitle: "Lumion System Requirements 2026: PC, Laptop & Graphics Card",
  description:
    "Lumion Pro needs Windows 10 (2004+) or 11, a dedicated GPU with 6 GB VRAM at least; Lumion recommends 10 GB VRAM and 32 GB RAM, 16 GB and 64 GB for high-end.",
  targetQueries: [
    "lumion system requirements",
    "lumion 2026 system requirements",
    "lumion requirements laptop",
    "lumion graphics card requirements",
    "lumion minimum requirements",
    "lumion workstation",
    "lumion size gb",
  ],
  datePublished: "2026-11-11",
  draft: false,
  eyebrow: "Guide · Hardware",
  hero: {
    src: `${IMG}/lumion-requirements-tiers.webp`,
    alt: "Lumion Pro's three hardware tiers as published by Lumion: Minimum 6 GB VRAM and 16 GB RAM, Recommended 10 GB VRAM and 32 GB RAM, High-end 16 GB VRAM and 64 GB RAM.",
    width: 1600,
    height: 900,
    caption: `Lumion Pro's published tiers, read on ${CHECKED}. Our own summary graphic of Lumion's figures.`,
  },
  answer: () =>
    `Lumion Pro needs Windows 10 (version 2004 or later) or Windows 11 (24H2 or later), an internet connection and a dedicated graphics card: integrated graphics won't do. Lumion's minimum is a card with 6 GB of video memory (VRAM) and a G3DMark score of 8,000, with 16 GB of RAM, and it says that tier suits simple projects only. For complex projects it recommends 10 GB of VRAM, a G3DMark of 14,000 and 32 GB of RAM; for ultra-complex ones, 16 GB of VRAM, 22,000 and 64 GB. The full install takes about 115 GB of disk.`,
  body: (ctx) => [
    { type: "h2", text: "Lumion system requirements for a PC or laptop" },
    {
      type: "p",
      text: `These are Lumion's own figures for Lumion Pro, from [its system requirements page](${REQ_URL}), as we read them on ${CHECKED}. Lumion updates them with new versions, so check the page before you buy hardware.`,
    },
    {
      type: "spec",
      label: `Lumion Pro, as published by Lumion (checked ${CHECKED})`,
      rows: [
        ["Operating system", "Windows 10 v2004 (build 19041) or newer, or Windows 11 24H2 (build 26100) or newer"],
        ["Graphics card", "Dedicated NVIDIA, AMD or Intel (Arc A580 / B580 and better); not onboard graphics"],
        ["Minimum", "G3DMark 8,000+, 6 GB VRAM, 16 GB RAM (simple projects)"],
        ["Recommended", "G3DMark 14,000+, 10 GB VRAM, 32 GB RAM (complex projects)"],
        ["High-end", "G3DMark 22,000+, 16 GB VRAM, 64 GB RAM (ultra-complex projects)"],
        ["Ray tracing / 4K", "At least 8 GB VRAM for 1080p ray tracing or 4K rasterisation"],
        ["CPU (single thread)", "CPUMark 2,200+ minimum, 2,600+ recommended, 3,000+ high-end"],
        ["Disk", "105 GB free for the full version (12 GB for the trial); SSD, NVMe recommended"],
        ["Internet", "The PC must be online while Lumion runs"],
        ["Drivers (Lumion 2026)", "NVIDIA 591.86+, AMD 26.1.1+, Intel 101.8509+"],
      ],
    },
    {
      type: "note",
      text: `G3DMark is PassMark's graphics benchmark score; Lumion uses it instead of naming every card. Its example cards are a GTX 1060 or RX 580 for the minimum, an RTX 3060, RTX 2000 Ada or RX 6700 XT for recommended, and an RTX 3090, RTX A6000 or RX 6800 XT for high-end. The driver versions are from Lumion's [graphics card article for Lumion 2026](${GPU_URL}).`,
    },
    {
      type: "p",
      text: "VRAM is the line that decides whether a scene opens. A card with a high G3DMark score but too little memory will still stall or refuse a large scene, while a slower card with enough memory gets there. [Our VRAM guide](/vram-for-architectural-rendering) shows how to measure what your own project uses.",
    },

    { type: "h2", text: "Can a laptop run Lumion?" },
    {
      type: "p",
      text: "Only a laptop with a dedicated graphics card that meets the minimum. Lumion says it needs a dedicated card, not onboard (integrated) graphics, so a thin laptop with Intel Iris, Intel UHD or integrated Radeon graphics alone can't run Lumion Pro. A gaming or workstation laptop with a 6 GB card clears the minimum but sits in Lumion's \"simple projects\" tier; for the recommended tier you need a 10 GB card, which few laptops have, and 32 GB of RAM.",
    },
    {
      type: "p",
      text: "If the laptop has both an integrated chip and a dedicated card, Lumion's page says to make sure Lumion uses the intended GPU. Set the dedicated card as the high-performance GPU for Lumion in Windows' graphics settings. To see what you have, open Task Manager (Ctrl+Shift+Esc), go to Performance and read Dedicated GPU memory. We wrote up that check in [can your laptop run D5 Render or Lumion](/blog/can-my-laptop-run-d5-render-or-lumion).",
    },

    { type: "h2", text: "How big is Lumion? (download and install size)" },
    {
      type: "p",
      text: `Lumion's [file space article](${SPACE_URL}) gives the full Lumion 2026 commercial version as a 46.4 GB download and 115 GB installed; the trial is 11.8 GB. It also asks you to keep at least 30 GB, preferably 50 GB or more, free on the C: drive after installing. On a laptop with a 256 GB or 512 GB SSD, that is a large share of the disk before any project files.`,
    },

    { type: "h2", text: "Does Lumion run on a Mac?" },
    {
      type: "p",
      text: "Not officially. Lumion's requirements page says Lumion Pro is not officially supported on Mac, and describes running it through Windows with Apple's Boot Camp on a relatively new Mac with a fast GPU. Coreframe's Connect app is Windows-only for now as well, so a remote workstation doesn't help on a Mac yet.",
    },

    { type: "h2", text: "Can Lumion run on a cloud or virtual workstation?" },
    {
      type: "p",
      text: `Lumion's requirements page says Lumion 9.0 and newer are supported on some virtual PC and remote desktop platforms, and warns that many cloud desktops don't meet the requirements. So check the machine against the same table: a dedicated, display-capable GPU with enough VRAM, enough RAM and the disk space. Lumion's trial includes a benchmark that tests the GPU, GPU memory, CPU and RAM; it's the quickest way to check any machine, yours or a rented one.`,
    },

    { type: "h2", text: "Which Coreframe workstation for each Lumion tier" },
    {
      type: "p",
      text: `A Coreframe workstation is a Windows desktop with a dedicated workstation-class GPU, streamed to your laptop. You install Lumion with your own Lumion licence; we don't supply it. The cheapest card that meets each tier's memory and RAM lines, at today's prices:`,
    },
    ...cardTable(ctx),

    { type: "h2", text: "If your laptop falls short" },
    {
      type: "p",
      text: `The alternative to buying a new machine is to run Lumion on a remote workstation and stream it to the laptop you have. ${ctx.billing} Your project files stay on Coreframe storage between sessions, so the 115 GB install and your assets don't fill your laptop. You connect from the Coreframe Connect app on a Windows laptop. ${BANDWIDTH_SENTENCE}`,
    },
    ctx.hourly
      ? { type: "p", text: `Cards start at ${ctx.hourly} ${ctx.taxIncl}. More on the setup is on [Lumion on a cloud GPU](/lumion-cloud-gpu).` }
      : { type: "p", text: "More on the setup is on [Lumion on a cloud GPU](/lumion-cloud-gpu), and current rates on the [pricing page](/pricing)." },
  ],
  faqs: (ctx) => {
    const rec = ctx.gpuFor(10, 32);
    return [
      {
        q: "What are the minimum requirements for Lumion?",
        a: `Per Lumion (read ${CHECKED}): Windows 10 v2004 or newer, a dedicated graphics card with a G3DMark score of 8,000 or more and 6 GB of VRAM, 16 GB of RAM, a CPU with a single-thread CPUMark of 2,200 or more, 105 GB of free disk and an internet connection. Lumion says this tier suits simple projects only.`,
      },
      {
        q: "What graphics card do I need for Lumion?",
        a: "A dedicated card: Lumion recommends a G3DMark score of 14,000 or more with 10 GB of VRAM (examples it gives: RTX 3060, RTX 2000 Ada, RX 6700 XT), and 22,000 or more with 16 GB for ultra-complex projects (RTX 3090, RTX A6000, RX 6800 XT). Integrated graphics are not supported.",
      },
      {
        q: "How much RAM does Lumion need?",
        a: "16 GB at the minimum, 32 GB recommended for complex projects and 64 GB for Lumion's high-end tier, per Lumion's requirements page.",
      },
      {
        q: "Can I run Lumion on a laptop with integrated graphics?",
        a: "No. Lumion requires a dedicated graphics card; onboard or integrated graphics don't meet its requirements, whatever the processor.",
      },
      {
        q: "How many GB is Lumion 2026?",
        a: "Lumion lists the full Lumion 2026 version as a 46.4 GB download and 115 GB installed, and the trial as 11.8 GB. Keep at least 30 GB, preferably 50 GB or more, free on C: after installing.",
      },
      {
        q: "Does Lumion work on a Mac?",
        a: "Lumion says Lumion Pro is not officially supported on Mac; it describes running Windows through Boot Camp instead. Coreframe's Connect app is Windows-only for now too.",
      },
      rec
        ? {
            q: "Which Coreframe workstation meets Lumion's recommended specs?",
            a: `The ${rec.name}: ${rec.vramGb} GB of VRAM and ${rec.ramGb} GB of RAM, above Lumion's recommended 10 GB and 32 GB, for ${rec.hourly} ${ctx.taxIncl}, billed per minute. You install Lumion with your own licence.`,
          }
        : null,
    ];
  },
  related: [
    { href: "/lumion-cloud-gpu", label: "Lumion on a cloud GPU" },
    { href: "/blog/can-my-laptop-run-d5-render-or-lumion", label: "Can your laptop run D5 Render or Lumion?" },
    { href: "/vram-for-architectural-rendering", label: "Is 8 GB of VRAM enough?" },
    { href: "/rtx-a4000-vs-rtx-a5000", label: "RTX A4000 vs RTX A5000 for rendering" },
    { href: "/tools/render-time", label: "Render-time calculator" },
  ],
};
