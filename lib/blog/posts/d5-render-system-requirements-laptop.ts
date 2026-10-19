import { NODE } from "@/lib/node-spec";
import { BANDWIDTH_SENTENCE } from "@/lib/streaming-terms";
import type { BlogPost } from "../types";

const SLUG = "d5-render-system-requirements-laptop";
const IMG = `/blog/${SLUG}`;

/**
 * Written 19 Oct 2026 for the Search Console queries "d5 render requirements
 * laptop", "d5 render system requirements laptop", "d5 render size gb",
 * "d5 render amd" and "d5 download failed".
 *
 * EVERY D5 FIGURE IS QUOTED FROM D5'S OWN SITE, read on 19 Oct 2026:
 *   d5render.com/specs ............ Win 10 v1809+; GTX 1060 6GB / RX 6000 XT /
 *                                    Arc A3; D5 Lite = NVIDIA RTX, Win 10 v1909+;
 *                                    NVIDIA driver > 531.14 needs Windows 21H2+
 *   docs.d5render.com/user-guide/hardware/system-requirements-for-d5-render
 *                                    ... AMD minimum RX 6400; Win 10 21H2 recommended;
 *                                    no multi-GPU; dedicated GPU memory
 *   docs.d5render.com/user-guide/hardware/how-to-do-if-the-device-fails-d5-renders-test
 *                                    ... discrete GPUs only; dual-GPU devices that
 *                                    default to integrated fail; the fix steps;
 *                                    AMD driver 20.9.1+ from D5 3.1
 *   docs.d5render.com/getting-started/quick-start ... DX12 + DXR; recommended
 *                                    RTX 2060 or higher; C: default path; reserve
 *                                    a larger installation space
 *   d5render.com/posts/system-requirements-for-d5-render (updated 6 Aug 2025)
 *                                    ... recommended RTX 3060 (Ti), 32 GB RAM
 *   d5render.com/posts/how-to-render-d5-render-settings-shortcuts (updated
 *                                    1 Apr 2026) ... workspace drive with at
 *                                    least 40 GB free
 *   d5render.com/download ......... install D5 Launcher and D5 Render together;
 *                                    link sent by email, open it on your computer
 *
 * LEFT OUT, because D5 does not publish it: an installer size in GB, a VRAM
 * minimum, a minimum CPU. Forum posts (user-reported cache sizes, staff
 * replies) are not D5's published requirements and are not used. Re-check the
 * table before refreshing this post; D5's pages disagree with each other in
 * places and the article says so.
 */
const CHECKED = "19 October 2026";

export const d5RenderSystemRequirementsLaptop: BlogPost = {
  slug: SLUG,
  title: "D5 Render system requirements for a laptop, and how much space it needs",
  metaTitle: "D5 Render Requirements: Laptop, GPU, Size",
  description:
    "D5 Render's own GPU, Windows and disk-space requirements, what they mean for a laptop or AMD card, why downloads fail, and what to do if yours falls short.",
  targetQueries: [
    "d5 render system requirements laptop",
    "d5 render requirements laptop",
    "d5 render size gb",
    "d5 render amd",
    "d5 download failed",
  ],
  datePublished: "2026-10-19",
  dateModified: "2026-10-19",
  draft: false,
  eyebrow: "Guide · Hardware",
  hero: {
    src: `${IMG}/file-on-workstation.webp`,
    alt: "A remote Windows desktop with D5 Launcher, Twinmotion, 3ds Max, Revit and other application icons, and File Explorer open on the Coreframe Datalake (N:) drive.",
    width: 1546,
    height: 782,
    caption:
      "D5 Launcher on the desktop of a Coreframe RTX 5080 workstation, streamed to a laptop. Project files sit on the N: drive, which persists between sessions.",
  },
  answer: () =>
    `D5 Render needs Windows 10 (version 1809 or later) and a dedicated, ray-tracing-capable graphics card. D5's own minimum is an NVIDIA GTX 1060 6GB, an AMD Radeon RX 6000-series card or an Intel Arc A3, and it does not run on integrated graphics. So a laptop can run D5 only if it has a dedicated GPU at that level and D5 is set to use it. D5 doesn't publish an installer size, but it recommends a workspace drive with at least 40 GB free. If your laptop falls short, you can run D5 on a remote workstation and stream it to the laptop instead.`,
  body: (ctx) => [
    { type: "h2", text: "D5 Render's official system requirements" },
    {
      type: "p",
      text: `These are D5's own figures, from its website, as we read them on ${CHECKED}. D5 updates them as new versions ship, so check [D5's requirements page](https://www.d5render.com/specs) before you buy anything.`,
    },
    {
      type: "spec",
      label: `D5 Render, as published by D5 (checked ${CHECKED})`,
      rows: [
        ["Operating system", "Windows 10 v1809 or above; D5 recommends 21H2 or above"],
        ["NVIDIA (minimum)", "GTX 1060 6GB or above"],
        ["AMD (minimum)", "Radeon RX 6000 XT or above on the requirements page; RX 6400 in D5's help centre"],
        ["Intel (minimum)", "Arc A3 or above"],
        ["Integrated graphics", "Not supported. D5 runs on a discrete GPU only"],
        ["Graphics API", "DirectX 12 with DXR (hardware ray tracing)"],
        ["Recommended GPU", "RTX 2060 or higher (Quick Start guide); RTX 3060 (Ti) (D5's requirements article)"],
        ["Recommended RAM", "32 GB (D5's requirements article)"],
        ["Free space", "At least 40 GB on the workspace drive (D5's rendering-settings guide)"],
        ["Driver note", "With an NVIDIA driver above 531.14, Windows must be 21H2 or above"],
      ],
    },
    {
      type: "note",
      text: "D5's pages don't all say the same thing. The AMD minimum is RX 6000 XT on [the requirements page](https://www.d5render.com/specs) and RX 6400 in [the help centre](https://docs.d5render.com/user-guide/hardware/system-requirements-for-d5-render); the recommended NVIDIA card is an RTX 2060 in [the Quick Start guide](https://docs.d5render.com/getting-started/quick-start) and an RTX 3060 (Ti) in [D5's requirements article](https://www.d5render.com/posts/system-requirements-for-d5-render). We've quoted each with its source rather than pick one.",
    },
    {
      type: "p",
      text: "D5 publishes no minimum for video memory (VRAM), but its pages say VRAM decides how well complex scenes are handled, and D5 says it primarily uses the card's dedicated memory. The minimum gets the program open. Whether your project runs smoothly depends on how much of the card it fills, which [our VRAM guide](/vram-for-architectural-rendering) explains.",
    },

    { type: "h2", text: "Can a laptop run D5 Render?" },
    {
      type: "p",
      text: "Only one with a dedicated graphics card. D5 states that it supports discrete GPUs, not integrated ones, so a thin laptop with Intel Iris or AMD Radeon integrated graphics alone is below D5's minimum, whatever its processor.",
    },
    {
      type: "p",
      text: "Many laptops have both: an integrated chip for battery life and a dedicated card for heavy work. D5 says a device with two graphics cards will fail its hardware check if it defaults to the integrated one. Its help centre suggests the fix:",
    },
    {
      type: "ol",
      items: [
        "Set the dedicated GPU as the high-performance default for D5 in Windows' graphics settings (or your laptop maker's graphics switcher).",
        "If D5 still picks the wrong card, disable the integrated graphics in Device Manager.",
        "Update the graphics driver from the card maker's website, and update Windows at the same time.",
        "Restart and run D5 again.",
      ],
    },
    {
      type: "p",
      text: "To see what your laptop has, open Task Manager (Ctrl+Shift+Esc), go to Performance, and look for an NVIDIA, AMD Radeon RX or Intel Arc entry with its Dedicated GPU memory. We've written up that check, and what to do with the answer, in [can your laptop run D5 Render or Lumion](/blog/can-my-laptop-run-d5-render-or-lumion).",
    },

    { type: "h2", text: "Does D5 Render work on AMD graphics?" },
    {
      type: "p",
      text: "Yes, on recent Radeon cards. D5 lists the Radeon RX 6000 series and newer (RX 6000 XT on its requirements page, RX 6400 in its help centre) because D5 needs hardware ray tracing through DirectX 12, which older Radeon cards don't have. From D5 3.1, D5's help centre says the AMD driver must be version 20.9.1 or later. A laptop with integrated Radeon graphics only is a different case: that's integrated graphics, which D5 doesn't support.",
    },

    { type: "h2", text: "How big is D5 Render? (size in GB)" },
    {
      type: "p",
      text: `D5 doesn't publish the size of the installer on its download or requirements pages (as of ${CHECKED}). What it does say is about space to work in. Its rendering-settings guide recommends putting the D5 workspace on a drive with at least 40 GB free, because the local cache grows as you pull models and materials from the asset library. Its Quick Start guide says D5 installs to the C: drive by default, that you can choose another path, and that you should reserve a larger installation space.`,
    },
    {
      type: "p",
      text: "In practice that means the program itself is the small part. Plan for the 40 GB, then add room for your own projects. On a laptop with a small, nearly full C: drive, choose a workspace on a larger drive when you install.",
    },
    {
      type: "p",
      text: "D5 Lite, the lighter edition, has its own requirement on the same page: an NVIDIA RTX series GPU and Windows 10 v1909 or later.",
    },

    { type: "h2", text: "D5 download failed: what to check" },
    {
      type: "p",
      text: "D5 is installed through the D5 Launcher. D5's download page says to install the launcher and D5 Render together, and that the download link is sent by email and should be opened on your computer. If the download or install fails, these are the usual things to rule out:",
    },
    {
      type: "ul",
      items: [
        "Free space on the drive you chose for the workspace, measured against D5's 40 GB recommendation.",
        "That you opened the emailed link on the Windows computer you're installing on, not on your phone.",
        "A firewall, antivirus or office network blocking the launcher's download. Try another network if you can.",
        "Windows and the graphics driver, both brought up to date. D5's minimum is Windows 10 v1809, and newer NVIDIA drivers need 21H2 or later.",
        "If it still fails, D5's technical support is linked from its download page.",
      ],
    },
    {
      type: "p",
      text: "A download that finishes but won't launch is usually the hardware check, not the download. That points back to the GPU sections above.",
    },

    { type: "h2", text: "If your laptop doesn't meet them: D5 on a cloud RTX 5080" },
    {
      type: "p",
      text: `When the laptop is below D5's minimum, or meets it but can't hold your project, the alternative to buying new hardware is to run D5 on a remote workstation and stream it. A Coreframe workstation is a Windows desktop with an ${NODE.gpu} (${NODE.vram}), ${NODE.ram} of RAM and an ${NODE.cpu}, hosted in ${NODE.location}. That's above the cards D5 lists as recommended, and it has the dedicated GPU D5 checks for, with no integrated chip to pick by mistake.`,
    },
    {
      type: "p",
      text: `D5 Render is preinstalled; you sign in with your own D5 account. Your project files live on a drive that persists between sessions, so the 40 GB of workspace and your assets aren't on your laptop at all. You connect from the Coreframe Connect app, which runs on Windows laptops (not Mac yet). ${BANDWIDTH_SENTENCE}`,
    },
    ctx.hourly
      ? {
          type: "p",
          text: `It costs ${ctx.hourly}, billed per minute while the desktop is streaming, so you pay for the hours you render and nothing in between. More on the setup is on [D5 Render on a cloud RTX 5080](/d5-render-cloud-workstation).`,
        }
      : {
          type: "p",
          text: "It's billed per minute while the desktop is streaming. More on the setup is on [D5 Render on a cloud RTX 5080](/d5-render-cloud-workstation), and current rates on the [pricing page](/pricing).",
        },
  ],
  faqs: (ctx) => [
    {
      q: "Can I run D5 Render on a laptop with integrated graphics?",
      a: "No. D5 supports discrete graphics cards only, not integrated graphics. A laptop needs a dedicated GPU at or above D5's minimum: an NVIDIA GTX 1060 6GB, an AMD Radeon RX 6000-series card or an Intel Arc A3.",
    },
    {
      q: "What is the minimum GPU for D5 Render?",
      a: `As published by D5 on ${CHECKED}: NVIDIA GTX 1060 6GB, AMD Radeon RX 6000 XT (RX 6400 in D5's help centre) or Intel Arc A3, on Windows 10 v1809 or later. D5 recommends an RTX 2060 or RTX 3060 (Ti) or better, depending on the page.`,
    },
    {
      q: "Does D5 Render work with AMD graphics cards?",
      a: "Yes, with Radeon RX 6000-series cards and newer, which have the hardware ray tracing D5 needs. D5's help centre says that from D5 3.1 the AMD driver must be 20.9.1 or later.",
    },
    {
      q: "How many GB is D5 Render?",
      a: "D5 doesn't publish the installer size. It recommends a workspace drive with at least 40 GB free, because the asset cache grows as you use the library, so plan for that plus your projects.",
    },
    {
      q: "Does D5 Render run on a Mac?",
      a: "D5's requirements list Windows 10 or later only. Coreframe's Connect app is Windows only too for now, so a remote workstation doesn't help on a Mac yet.",
    },
    ctx.hourly
      ? {
          q: "What can I do if my laptop can't run D5?",
          a: `Run D5 on a remote workstation and stream it to the laptop. A Coreframe workstation has an ${NODE.gpu} with ${NODE.vram} and D5 preinstalled, for ${ctx.hourly} billed per minute; you sign in with your own D5 account.`,
        }
      : null,
  ],
  related: [
    { href: "/d5-render-cloud-workstation", label: "D5 Render on a cloud RTX 5080" },
    { href: "/blog/can-my-laptop-run-d5-render-or-lumion", label: "Can your laptop run D5 Render or Lumion?" },
    { href: "/vram-for-architectural-rendering", label: "Is 8 GB of VRAM enough?" },
    { href: "/d5-render-vs-local-gpu", label: "Renting a workstation vs buying one" },
    { href: "/pricing", label: "Pricing" },
  ],
};
