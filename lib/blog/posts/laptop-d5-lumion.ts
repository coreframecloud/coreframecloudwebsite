import { NODE } from "@/lib/node-spec";
import { BANDWIDTH_SENTENCE } from "@/lib/streaming-terms";
import type { BlogPost } from "../types";

const SLUG = "can-my-laptop-run-d5-render-or-lumion";
const IMG = `/blog/${SLUG}`;

/**
 * Vendor figures are the ones /vram-for-architectural-rendering read on
 * 2 Oct 2026 (Enscape 4 GB minimum, 8 GB recommended, 12 GB for VR; D5 a
 * GTX 1060 6 GB model floor and no VRAM figure). Lumion's own numbers are
 * deliberately not restated: we have not read them on a dated page, and a
 * wrong system-requirements figure is exactly what this article argues
 * against. Re-check all of them before publishing if this sits as a draft
 * for long.
 */
const VENDOR_CHECKED = "2 October 2026";

export const laptopD5Lumion: BlogPost = {
  slug: SLUG,
  title: "Can your laptop run D5 Render or Lumion? What actually needs a GPU",
  metaTitle: "Can Your Laptop Run D5 Render or Lumion?",
  description:
    "D5, Lumion and Enscape need a dedicated GPU with enough video memory; modelling mostly doesn't. How to check your laptop, and what to do if it falls short.",
  targetQueries: [
    "can my laptop run d5 render",
    "lumion slow on laptop",
    "d5 render laptop requirements",
    "lumion system requirements laptop",
    "laptop for architecture rendering india",
  ],
  datePublished: "2026-10-10",
  draft: false,
  eyebrow: "Guide · Hardware",
  hero: {
    src: `${IMG}/render-complete-task-manager.webp`,
    alt: "An interior rendering in Blender with Windows Task Manager open beside it, showing an NVIDIA GeForce RTX 5080 at 95% utilisation and 7.4 of 16 GB dedicated GPU memory in use.",
    width: 1546,
    height: 782,
    caption:
      "Task Manager on a Coreframe workstation during a Cycles render: 7.4 of 16 GB of video memory in use. This panel is the quickest way to see what your own scenes need.",
  },
  answer: () =>
    `Most laptops can model in SketchUp, Revit or Rhino, but D5 Render, Lumion, Enscape and Twinmotion are real-time renderers that do almost all their work on the graphics card. They need a dedicated GPU with enough video memory (VRAM), and a thin laptop with integrated graphics, or a 4 GB card, will either refuse to run them or slow to a crawl once the scene gets real. Open Task Manager, go to Performance, and look for a dedicated NVIDIA or AMD GPU and its memory. If there isn't one, or it has 4 GB or less, rendering on that laptop will fight you.`,
  body: (ctx) => [
    { type: "h2", text: "Which parts of the job need a GPU?" },
    {
      type: "p",
      text: `Architectural work splits in two. Modelling and documentation in SketchUp, Revit, ArchiCAD or Rhino is mostly single-threaded CPU work with a light viewport, and a reasonable laptop copes. Visualisation is different. D5, Lumion, Enscape and Twinmotion draw the whole scene on the GPU many times a second, with lighting, reflections and vegetation, and every texture and every tree has to sit in the card's own memory while they do.`,
    },
    {
      type: "p",
      text: `That's why the same laptop that handles a 40 MB Revit model without complaint can stutter the moment you link it into D5. The model hasn't changed. The work moved from the CPU to the GPU.`,
    },
    {
      type: "table",
      head: ["Task", "Where the work happens", "Laptop with integrated graphics"],
      rows: [
        ["Modelling (SketchUp, Revit, Rhino)", "Mostly CPU", "Usually fine for small and mid-size models"],
        ["Drawings, sheets, documentation", "CPU", "Fine"],
        ["Real-time rendering (D5, Lumion, Enscape, Twinmotion)", "GPU and VRAM", "Often won't start, or runs too slowly to work in"],
        ["Offline rendering (V-Ray GPU, Cycles, Corona)", "GPU or CPU, depending on the engine", "Works on CPU, slowly; GPU modes need a capable card"],
        ["Video export of a walkthrough", "GPU encoder and CPU", "Slow, and the laptop is unusable while it runs"],
      ],
    },

    { type: "h2", text: "What do D5, Lumion and Enscape say they need?" },
    {
      type: "p",
      text: `Less than you'd hope. As of ${VENDOR_CHECKED}, Enscape publishes 4 GB of VRAM as its minimum, 8 GB as recommended and 12 GB for VR. D5 publishes a GPU model as its floor (a GTX 1060 6 GB) and no VRAM figure at all, while saying that video memory determines how well complex scenes are handled. Lumion publishes its own requirements on its website, and its support pages warn that many cloud desktops can't run Lumion at all. The usual reason is a data-centre GPU without a full Windows display driver.`,
    },
    {
      type: "p",
      text: `A vendor minimum tells you whether the application will open. It says very little about whether your project will. A single furnished room and a site model with landscaping are different jobs on the same software, and the second needs far more memory. [Our VRAM guide](/vram-for-architectural-rendering) goes through what fills the card and how to measure it.`,
    },

    { type: "h2", text: "How do I check what my laptop has?" },
    {
      type: "p",
      text: `On Windows it takes two minutes, and you don't need to install anything:`,
    },
    {
      type: "ol",
      items: [
        "Press Ctrl+Shift+Esc to open Task Manager and go to the Performance tab.",
        "Look at the GPU entries on the left. If you only see one, and it says Intel or AMD Radeon Graphics (no model number like RTX 4060), you have integrated graphics only.",
        "If there's an NVIDIA or a discrete AMD entry, click it and read Dedicated GPU memory. That is your VRAM.",
        "Now open your heaviest project in your renderer, orbit the view and start a render, and watch that number. If it sits near the top, you've found your limit.",
      ],
    },
    {
      type: "p",
      text: `The hero image of this article is that same panel on one of our workstations during a Blender render of a furnished interior. Task Manager showed 7.4 GB of the card's 16 GB in use. On a laptop with an 8 GB card, that one room would already be close to the edge, by the same count.`,
    },
    {
      type: "note",
      text: `On a gaming laptop, check while plugged in. Many laptops cut GPU power sharply on battery, so the same card can behave like a much smaller one until you connect the charger.`,
    },

    { type: "h2", text: "What happens when a scene doesn't fit?" },
    {
      type: "p",
      text: `It doesn't fail gracefully. When the scene needs more VRAM than the card has, the application either spills into system memory over the PCIe bus, which is far slower and feels like the machine has frozen, or it refuses to load the scene and reports an out-of-memory error. That's how a project can open fine on Monday and crash on Thursday, after someone adds the landscape.`,
    },
    {
      type: "p",
      text: `Heat is the other limit on a laptop. A thin machine can hold full GPU power for a few minutes, then throttles to protect itself. Short previews look fine and a long 4K walkthrough export takes far longer than the first minute suggested.`,
    },

    { type: "h2", text: "My laptop falls short. What are my options?" },
    {
      type: "p",
      text: `There are four, and the right one depends on how often you render.`,
    },
    { type: "h3", text: "1. Make the scene lighter" },
    {
      type: "p",
      text: `Use 2K textures instead of 4K, swap high-poly trees for proxies, hide what the camera can't see and split big sites into separate scenes. This is free and worth doing anyway. It stops working when the client wants the full site, with the landscaping, in one shot.`,
    },
    { type: "h3", text: "2. Buy a desktop or a workstation laptop" },
    {
      type: "p",
      text: `If you render most days, owning the hardware is usually cheaper over time. By our own estimate a desktop in the same class as our workstations (an ${NODE.gpu} with ${NODE.ram} of RAM) costs about ${ctx.replacementCost}${ctx.currency === "USD" ? "" : " in India"}. Our [rent-or-buy page](/d5-render-vs-local-gpu) works out the break-even, and [this cost comparison](/blog/cloud-workstation-vs-render-farm-vs-buying-cost-india) adds render farms to the picture.`,
    },
    { type: "h3", text: "3. Rent a cloud workstation for the heavy days" },
    {
      type: "p",
      text: `A cloud workstation is a full Windows desktop with a capable GPU, running in a data centre and streamed to your laptop. You keep modelling on the laptop, and when it's time to render, you open the same project on the remote machine. Ours is an ${NODE.gpu} with ${NODE.vram}, ${NODE.ram} of RAM and an ${NODE.cpu}, hosted in ${NODE.location}. D5 Render, Blender and Twinmotion come preinstalled; Lumion and other licensed tools run with your own licence.${ctx.hourly ? ` It costs ${ctx.hourly} ${ctx.taxIncl}, billed by the minute.` : ""}`,
    },
    {
      type: "figure",
      src: `${IMG}/file-on-workstation.webp`,
      alt: "A remote Windows desktop with D5 Launcher, Twinmotion, 3ds Max, Revit and other application icons, and File Explorer open on the Coreframe Datalake (N:) drive.",
      width: 1546,
      height: 782,
      caption: "A Coreframe workstation's desktop as it appears on your laptop. Project files sit on the N: drive, which persists between sessions.",
    },
    {
      type: "p",
      text: `Two things decide whether this works for you. The first is your connection: ${BANDWIDTH_SENTENCE} The second is your laptop's operating system. The Connect app is Windows only today, so a MacBook can't use it yet.`,
    },
    { type: "h3", text: "4. Skip the renderer for early concepts" },
    {
      type: "p",
      text: `For a first look at a furnished room from a floor plan, before anyone has modelled anything, an AI tool can be enough. Our own [Coreframe Studio](/floor-plan-to-render) reads a DXF plan and produces an interior image in the browser, with no GPU on your side. It's a concept tool. It won't replace a D5 or Lumion scene for client presentation, where every material and fitting has to be the one you specified.`,
    },
    {
      type: "figure",
      src: `${IMG}/studio-living-room.webp`,
      alt: "An AI-generated image of a furnished living room with a white sofa, a jute rug, a lounge chair and a window onto a garden.",
      width: 1000,
      height: 1250,
      caption: "Generated with Coreframe Studio from a floor plan. This is an AI image, not a D5, Lumion or GPU-workstation render.",
    },

    { type: "h2", text: "What should I look for if I'm buying a laptop for rendering?" },
    {
      type: "p",
      text: `If you're shopping anyway, put the money into the GPU's memory before anything else. A current NVIDIA RTX card with 8 GB is a sensible floor for real-time work on single buildings, and more is better if you do site context, vegetation or VR. Then check that the laptop's GPU runs at a reasonable power limit (the same chip in a thin laptop can be much weaker than in a thick one), get 32 GB of system RAM, and plan to render plugged in.`,
    },
    {
      type: "p",
      text: `And be honest about how often you'll render. If heavy rendering is a few days a month around deadlines, a modest laptop for modelling plus a rented machine for those days can cost less than a top-end laptop that spends most of its life doing email.`,
    },
  ],
  faqs: (ctx) => [
    {
      q: "Can I run D5 Render on a laptop without a dedicated GPU?",
      a: "D5 publishes a GTX 1060 6 GB as its minimum GPU, so a laptop with only integrated graphics is below what D5 supports. It may open small scenes, but real projects will be slow or fail to load.",
    },
    {
      q: "Is 8 GB of VRAM enough for Lumion or D5?",
      a: "For a single building at 1080p it is often workable. Site context, vegetation, 4K textures and VR push past it. The reliable test is to open your heaviest project and watch Dedicated GPU memory in Task Manager.",
    },
    {
      q: "Why is Lumion slow on my laptop?",
      a: "Usually because the scene does not fit in the GPU's memory, or the laptop is throttling its GPU on battery or under heat. Plug in, check dedicated GPU memory in Task Manager, and lighten the scene if it is near the limit.",
    },
    {
      q: "Can I use a cloud workstation for D5 or Lumion from my laptop?",
      a: `Yes, on a Windows laptop. A Coreframe workstation is a Windows desktop with an ${NODE.gpu} streamed to your laptop through the Connect app. D5 is preinstalled and you sign in with your own D5 account; Lumion runs with your own licence.`,
    },
    {
      q: "Does it work on a Mac?",
      a: "Not yet. The Coreframe Connect app is Windows only for now.",
    },
    ctx.introPrice && ctx.introHours
      ? {
          q: "How can I test my own project on one?",
          a: `Sign up with an email and a WhatsApp code, with no ID documents. A new account's first top-up of ${ctx.introPrice} buys ${ctx.introHours} on the ${NODE.gpu}, one per customer.`,
        }
      : null,
  ],
  related: [
    { href: "/vram-for-architectural-rendering", label: "Is 8 GB of VRAM enough?" },
    { href: "/d5-render-cloud-workstation", label: "D5 Render on a cloud RTX 5080" },
    { href: "/lumion-cloud-gpu", label: "Lumion on a cloud RTX 5080" },
    { href: "/enscape-cloud-gpu", label: "Enscape on a cloud RTX 5080" },
    { href: "/d5-render-vs-local-gpu", label: "Renting a workstation vs buying one" },
    { href: "/pricing", label: "Pricing" },
  ],
};
