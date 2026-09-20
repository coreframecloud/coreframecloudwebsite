/**
 * Per-software landing pages.
 *
 * One page per application an architect or engineer actually searches for.
 * "Cloud GPU" is not a search anyone makes; "run Lumion without a gaming
 * laptop" is. Each entry answers that specific question rather than describing
 * our infrastructure.
 *
 * Written for two readers at once:
 *   - a person skimming for whether this solves their problem
 *   - an AI assistant retrieving a page to answer someone's question, which
 *     needs plain facts in the order an answer uses them
 *
 * Every page renders FAQPage schema from `faqs`, so an assistant finds
 * questions already paired with answers instead of inferring them from prose.
 *
 * FACTS MUST STAY TRUE. Prices live in the rate card and are never repeated
 * here; hardware and behaviour claims must match what the machines do.
 */

export type SoftwarePage = {
  /** URL slug under / */
  slug: string;
  title: string;
  description: string;
  /** One-paragraph answer to "what is this page about", used as the lead. */
  intro: string;
  /** The problem the reader arrived with, in their words. */
  problem: string;
  /** Why this specific application benefits — not generic cloud copy. */
  why: string[];
  /** Whether we preinstall it, or they bring a licence. Honesty up front. */
  licence: string;
  faqs: { q: string; a: string }[];
  /**
   * Optional long-form body, rendered between "why" and licensing.
   *
   * Added because the short form was not competitive. /software/3ds-max-cloud-workstation
   * drew 183 impressions in 90 days and zero clicks at position 24, against
   * pages running several times its length. Four bullets and three FAQs cannot
   * answer "3ds max cloud workstation rental" better than a page that actually
   * works the question through, and an answer engine has nothing to quote.
   */
  sections?: { h2: string; body: string[] }[];
  /** Related slugs for internal linking. */
  related: string[];
};

const RESET_ANSWER =
  "Every session starts from an identical clean machine, so anything you install during a session is removed when it ends. Your project files live on NAS storage, which persists between sessions. It is what guarantees no trace of another customer's work — or yours — is left on the machine, which matters when projects are under NDA.";

const LICENCE_BYOL =
  "You install it and sign in with your own licence, exactly as you would on a new PC. We do not supply licences for commercial software — it is licensed to you, not to the machine.";

export const SOFTWARE_PAGES: SoftwarePage[] = [
  {
    slug: "revit-cloud-workstation",
    title: "Revit Cloud Workstation — run Revit on a rented RTX GPU",
    description:
      "Run Autodesk Revit on a Windows GPU workstation in India, billed per minute. Bring your Autodesk licence, open large models, and render without buying hardware.",
    intro:
      "Revit punishes underpowered machines: large federated models crawl, views take seconds to regenerate, and rendering ties up the only computer you have. A Coreframe workstation gives you an RTX GPU and 64 GB of RAM for as long as you need it, billed by the minute.",
    problem:
      "Your laptop handles small models but stalls on the coordinated one the whole team works in, and buying a workstation for the two weeks a year you need it makes no sense.",
    why: [
      "Large models open and navigate on hardware sized for them, not for a laptop chassis.",
      "Rendering runs on the rented machine, so your own computer stays free to keep working.",
      "Link Revit with Enscape, Twinmotion or D5 Render in the same session — they are all just Windows applications on your desktop.",
      "Pay for the deadline week, not the whole year.",
    ],
    licence: LICENCE_BYOL + " Install Revit from your own Autodesk account at manage.autodesk.com, which is what ties the install to your seat.",
    faqs: [
      {
        q: "Can I run Autodesk Revit on a cloud GPU workstation?",
        a: "Yes. A Coreframe workstation is a full Windows machine with an RTX GPU, and Revit runs exactly as it would on a local PC. Autodesk requires your own account to download the installer, so we set it up with you once — a short session where you sign in — and Revit is then on every workstation you launch, running on your own subscription.",
      },
      {
        q: "Does Coreframe provide a Revit licence?",
        a: "No. Autodesk licences are issued to a named user, so you bring your own and sign in during the session. We provide the machine, not the licence.",
      },
      {
        q: "Will my Revit files be there next time?",
        a: RESET_ANSWER,
      },
      {
        q: "How much does it cost to run Revit on Coreframe?",
        a: "You pay per minute of streaming time at the published GPU-hour rate — no setup fee and no monthly minimum. Provisioning time and failed connections are not billed.",
      },
    ],
    related: ["3ds-max-cloud-workstation", "twinmotion-cloud-workstation", "sketchup-cloud-workstation"],
  },

  {
    slug: "3ds-max-cloud-workstation",
    title: "3ds Max Cloud Workstation — GPU rendering by the hour",
    description:
      "Run Autodesk 3ds Max with V-Ray or Corona on a rented RTX GPU workstation in India. Per-minute billing, your own licence, no hardware purchase.",
    intro:
      "3ds Max with V-Ray or Corona is the classic case for renting a GPU: the work is bursty. You need serious hardware for a few days near a deadline and almost none for the rest of the month.",
    problem:
      "Rendering ties up your workstation for hours, and the machine that would do it comfortably costs several lakh and sits idle most of the year.",
    why: [
      "GPU rendering in V-Ray GPU or Chaos Vantage on hardware built for it. Corona is a CPU renderer — see the note below before you assume it benefits.",
      "Your own computer stays usable while the render runs on the rented machine.",
      "Scale up for a deadline and stop paying the moment it ships.",
      "Scene files stay on persistent NAS storage between sessions.",
    ],
    licence: LICENCE_BYOL + " That includes 3ds Max itself and any renderer — V-Ray, Corona or Vantage — you sign in to with your Chaos account.",
    sections: [
      {
        h2: "Which renderer you use changes the answer",
        body: [
          "3ds Max is not one workload, and the honest recommendation depends entirely on what you render with. It is worth being specific, because the wrong assumption here costs you money.",
          "V-Ray GPU and Chaos Vantage do their work on the graphics card. Those are the cases a rented RTX 5080 is built for: 16 GB of GDDR7 is the ceiling on how much scene fits, and it is a good deal more than the 6 to 8 GB in most laptops and entry desktops sold for design work. When a GPU render fails or forces you to cut texture resolution, VRAM is almost always why.",
          "Corona is a CPU renderer. So is V-Ray's CPU engine, which many studios still use for final frames. A Coreframe node has a 6-core EPYC, which is a sensible CPU for driving a viewport and a GPU renderer but is not a render node for CPU work — if Corona is where your final frames come from, a rented workstation will not speed that up, and we would rather say so here than have you find out during a trial.",
          "The mixed case is the common one: model and light interactively with the GPU in Vantage or V-Ray GPU, keep CPU final frames wherever they already live. That works well, and it is worth planning around rather than discovering.",
        ],
      },
      {
        h2: "Why studios rent for 3ds Max specifically",
        body: [
          "Archviz work in 3ds Max is bursty in a way that punishes buying. There is a week before a client presentation when the machine cannot keep up, and three weeks afterwards when it idles. A workstation that renders comfortably lands at roughly ₹5,00,000 in India, is bought once, and is still on the books whether or not the project that justified it goes ahead.",
          "The second reason is that rendering takes the machine away from you. A local render ties up the computer you also model on, so the afternoon is spent waiting. Running it on a rented machine gives the afternoon back — your own computer stays free while the render runs somewhere else.",
          "The third is hiring. A studio taking on a remote 3ds Max artist otherwise has to ship them a workstation, buy a laptop that cannot really cope, or hope they own something adequate. A rented machine they reach from their own laptop costs a few thousand rupees a month instead of five lakh of hardware, and it stops cleanly if the arrangement does not.",
        ],
      },
      {
        h2: "What the session is actually like",
        body: [
          "It is a full Windows 11 desktop, not a submission portal. You install 3ds Max and your renderer with your own Autodesk and Chaos accounts, open your scene from persistent storage, and work — viewport, material editor, render setup, all of it, the same as a machine under your desk.",
          "The machine resets to a clean image when the session ends, which is how we can promise no trace of another studio's work is on it when you get it. Your scene files are not on that machine: they sit on storage that persists between sessions, so a session opened on Friday picks up where Monday's stopped without anything being copied around. On a committed monthly plan we build your applications into the baseline image on your nodes, so they are already there when you sign in.",
          "Billing runs per minute from the moment the stream starts. Provisioning, uploads and a connection that drops are not billed.",
        ],
      },
    ],
    faqs: [
      {
        q: "Can I run 3ds Max and V-Ray on a rented cloud GPU?",
        a: "Yes. You get a full Windows desktop with an RTX GPU, and 3ds Max, V-Ray, Corona and Chaos Vantage all run normally. Autodesk and Chaos both need your own account to download, so we set these up with you once and they are on every workstation afterwards, running on your own licences.",
      },
      {
        q: "Is this a render farm?",
        a: "No. A render farm takes a submitted job and returns frames. Coreframe gives you an interactive workstation you drive yourself, so you can set up the scene, tweak materials and render in the same session — the same way you work locally.",
      },
      { q: "What happens to my scene files after the session?", a: RESET_ANSWER },
      {
        q: "Will Corona render faster on a Coreframe workstation?",
        a: "Probably not, and it is better to know that now. Corona is a CPU renderer, and a Coreframe node has a 6-core EPYC — enough to drive the application and a GPU renderer, but not a CPU render node. If your final frames come out of Corona, the machine will not change that. Where it helps is V-Ray GPU and Chaos Vantage, which render on the graphics card.",
      },
      {
        q: "How much VRAM do I need for 3ds Max GPU rendering?",
        a: "VRAM is a ceiling rather than a speed: geometry, textures and lightmaps have to fit on the card, and when they do not, a GPU render fails or forces you to cut texture resolution. A Coreframe node has 16 GB of GDDR7, against the 6 to 8 GB in many laptops and entry desktops sold for design work. We will not predict how your particular scene behaves — open it in a trial session and watch the VRAM meter.",
      },
      {
        q: "Do I need to reinstall 3ds Max every session?",
        a: "On ad-hoc hourly sessions, yes, because the machine resets to a clean image each time and the setup time is billed like any other minute. On a committed monthly plan we build your applications into the baseline image on your nodes, so they are there when you sign in. If you tell us what you use before a trial, we install it beforehand so the free minutes test your real workflow instead of paying for setup.",
      },
    ],
    related: ["revit-cloud-workstation", "vray-cloud-rendering", "sketchup-cloud-workstation"],
  },

  {
    slug: "sketchup-cloud-workstation",
    title: "SketchUp Cloud Workstation with GPU rendering",
    description:
      "Run SketchUp Pro with Enscape, V-Ray or D5 Render on a rented Windows RTX workstation in India. Per-minute billing, bring your own licence.",
    intro:
      "SketchUp itself is light; the renderer attached to it is not. Enscape, V-Ray and D5 all want a real GPU, which is where a modelling laptop gives up.",
    problem:
      "SketchUp runs fine until you hit Render, and then the machine that models comfortably cannot deliver the walkthrough the client asked for.",
    why: [
      "Real-time rendering in Enscape or D5 at a frame rate that makes navigation usable.",
      "Model and render in one session rather than exporting between machines.",
      "No plugin-compatibility surprises: it is ordinary Windows, not a browser tool.",
    ],
    licence: LICENCE_BYOL + " SketchUp Pro signs in with your Trimble account.",
    faqs: [
      {
        q: "Can I use SketchUp with Enscape on a cloud GPU workstation?",
        a: "Yes. Install SketchUp Pro and Enscape during your session and sign in with your own licences. Because Enscape is a plugin, install its host application first.",
      },
      {
        q: "Is a cloud workstation fast enough for real-time rendering?",
        a: "Yes — the rendering happens on the RTX GPU in the workstation and only the resulting video is streamed to you, so what your own laptop can do makes almost no difference. A stable 10 Mbps connection is enough; latency matters more than bandwidth.",
      },
      { q: "Do my models persist between sessions?", a: RESET_ANSWER },
    ],
    related: ["revit-cloud-workstation", "vray-cloud-rendering", "twinmotion-cloud-workstation"],
  },

  /**
   * Enscape is deliberately absent from this list. It has a fuller page of its
   * own at /enscape-cloud-gpu, and running both split the ranking signal --
   * the short one indexed at position 39.9 while the good one was unknown to
   * Google. /software/enscape-cloud-workstation 301s there in next.config.ts,
   * so the `related` links below point at pages that still exist.
   */
  {
    slug: "blender-cloud-workstation",
    title: "Blender Cloud Workstation — Cycles rendering on a rented RTX GPU",
    description:
      "Run Blender with Cycles GPU rendering on a rented RTX workstation in India, billed per minute. Blender is preinstalled — no licence needed.",
    intro:
      "Blender is free, so the only thing standing between you and a fast Cycles render is the GPU. Rent one by the minute instead of buying it. Blender is already installed on every Coreframe workstation.",
    problem:
      "Cycles renders that take all night on your laptop, and a GPU upgrade you cannot justify for occasional work.",
    why: [
      "Blender is preinstalled and ready — nothing to license, nothing to configure.",
      "Cycles GPU rendering on an RTX card, with the VRAM that heavy scenes need.",
      "Keep working on your own machine while the render runs on the rented one.",
      "Free and open source, so there is no licence to bring.",
    ],
    licence:
      "None needed. Blender is free and open source, and we install it on every workstation — open it and start working.",
    faqs: [
      {
        q: "Is Blender preinstalled on Coreframe workstations?",
        a: "Yes. Blender is free and open source, so we install it on the standard image. It is ready the moment your desktop appears, with no licence or sign-in required.",
      },
      {
        q: "Can I use Cycles GPU rendering?",
        a: "Yes. The workstation has an NVIDIA RTX GPU with the Studio driver installed, so Cycles GPU rendering works out of the box.",
      },
      { q: "Where should I keep my .blend files?", a: RESET_ANSWER },
    ],
    related: ["d5-render-cloud-workstation", "3ds-max-cloud-workstation", "twinmotion-cloud-workstation"],
  },

  {
    slug: "twinmotion-cloud-workstation",
    title: "Twinmotion Cloud Workstation for architects",
    description:
      "Run Twinmotion on a rented RTX GPU workstation in India, billed per minute. Twinmotion is preinstalled and free for most users.",
    intro:
      "Twinmotion is free for most individual users, and it is already installed on every Coreframe workstation. All you are renting is the GPU that makes it run properly.",
    problem:
      "Twinmotion looks great in demos and stutters on your actual laptop, especially with vegetation and reflections turned up.",
    why: [
      "Preinstalled, so you can be rendering minutes after signing up.",
      "Datasmith imports from Revit, SketchUp, Rhino and Archicad.",
      "Real-time navigation at a presentable frame rate.",
      "Free tier covers most individual users — often no software cost at all.",
    ],
    licence:
      "Twinmotion is preinstalled. Its free tier covers most individual users; if you have a paid seat, sign in with your Epic account.",
    faqs: [
      {
        q: "Is Twinmotion preinstalled on Coreframe?",
        a: "Yes, it is part of the standard image, so it is available as soon as your session starts. Sign in with your Epic account if you have a paid licence.",
      },
      {
        q: "Can I import a Revit model into Twinmotion on the workstation?",
        a: "Yes. Install Revit with your own Autodesk licence in the same session and use Datasmith to import, exactly as you would locally.",
      },
      { q: "Do my Twinmotion projects persist?", a: RESET_ANSWER },
    ],
    related: ["blender-cloud-workstation", "revit-cloud-workstation", "vray-cloud-rendering"],
  },

  {
    slug: "vray-cloud-rendering",
    title: "V-Ray Cloud Rendering on a rented GPU workstation",
    description:
      "Run Chaos V-Ray GPU rendering on a rented RTX workstation in India, billed per minute. Works with 3ds Max, SketchUp, Rhino and Revit. Bring your Chaos licence.",
    intro:
      "V-Ray GPU wants VRAM and CUDA cores. Renting them by the hour is considerably cheaper than owning them for a workload that is busy a few weeks a year.",
    problem:
      "V-Ray GPU renders that outlast your working day, on a card that was never specified for production rendering.",
    why: [
      "V-Ray GPU rendering on an RTX card with production-grade VRAM.",
      "Works with whichever host you use — 3ds Max, SketchUp, Rhino or Revit.",
      "Chaos Vantage in the same session for real-time look development.",
      "Your own machine stays free while the render runs.",
    ],
    licence: LICENCE_BYOL + " V-Ray signs in with your Chaos account or your own licence server.",
    faqs: [
      {
        q: "Can I run V-Ray GPU on a rented cloud workstation?",
        a: "Yes. Install V-Ray and its host application during the session and sign in with your Chaos licence. The workstation has an NVIDIA RTX GPU, which is what V-Ray GPU requires.",
      },
      {
        q: "Does Coreframe supply a V-Ray licence?",
        a: "No. V-Ray is licensed to you through your Chaos account or licence server, and that licence follows you onto the workstation.",
      },
      { q: "Is this the same as Chaos Cloud?", a: "No. Chaos Cloud is a render service you submit jobs to. Coreframe rents you an interactive workstation, so you set up and render in one place and can use any software you like on the same machine." },
    ],
    related: ["3ds-max-cloud-workstation", "sketchup-cloud-workstation", "rhino-cloud-workstation"],
  },

  {
    slug: "rhino-cloud-workstation",
    title: "Rhino Cloud Workstation — Rhino and Grasshopper on a rented GPU",
    description:
      "Run Rhino with Grasshopper, V-Ray or Enscape on a rented RTX GPU workstation in India. Per-minute billing, your own Rhino licence.",
    intro:
      "Rhino models fine on modest hardware until the geometry gets heavy or you attach a renderer. A rented RTX workstation covers both without a purchase.",
    problem:
      "Heavy NURBS models and Grasshopper definitions that bring your laptop to a halt, plus a renderer that needs a GPU you do not have.",
    why: [
      "Headroom for dense geometry and complex Grasshopper definitions.",
      "Attach V-Ray or Enscape in the same session for GPU rendering.",
      "Rent for a project rather than buying for a career.",
    ],
    licence: LICENCE_BYOL + " Rhino uses your own licence key.",
    faqs: [
      {
        q: "Can I run Rhino and Grasshopper on a cloud workstation?",
        a: "Yes. It is a standard Windows desktop, and Rhino, Grasshopper and plugins run normally with your own licence. We set them up with you once rather than you reinstalling them every session."
      },
      { q: "Do my Rhino files persist between sessions?", a: RESET_ANSWER },
    ],
    related: ["vray-cloud-rendering", "sketchup-cloud-workstation", "revit-cloud-workstation"],
  },

  {
    slug: "gpu-workstation-rental-india",
    title: "GPU Workstation Rental in India — per-minute RTX workstations",
    description:
      "Rent a Windows RTX GPU workstation in India by the minute for 3D rendering, CAD and simulation. No hardware purchase, GST invoices, persistent NAS storage.",
    intro:
      "Coreframe rents Windows GPU workstations by the minute from infrastructure in India. You stream a real RTX desktop to the computer you already own and pay only for the time the stream is running.",
    problem:
      "A workstation that would handle your rendering costs several lakh, depreciates immediately, and sits idle most of the week — and international cloud GPUs bill in dollars with latency to match.",
    why: [
      "Machines in India: low latency for Indian users, and rupee pricing with GST invoices.",
      "Per-minute billing that starts when the stream does — provisioning is free.",
      "Persistent NAS storage for project files between sessions.",
      "A full Windows desktop, not a restricted appliance — every application you need, installed for you.",
      "No setup fee and no monthly minimum on pay-as-you-go.",
    ],
    licence:
      "Free software including Blender and Twinmotion is preinstalled. Commercial applications are bring-your-own-licence — install them and sign in with your own subscription.",
    faqs: [
      {
        q: "Where can I rent a GPU workstation in India?",
        a: "Coreframe rents Windows RTX GPU workstations by the minute, hosted in India, for 3D rendering, CAD and simulation work. You stream the desktop to your own computer and pay only for streaming time.",
      },
      {
        q: "How much does it cost to rent a GPU in India?",
        a: "Coreframe charges a published per-GPU-hour rate billed by the minute, with GST included and no setup fee. Current rates are on the pricing section of the site, served directly from the billing system.",
      },
      {
        q: "Do I need to buy software licences too?",
        a: "Free software such as Blender and Twinmotion is preinstalled. For commercial applications you bring your own licence and sign in during the session, the same as you would on a new PC.",
      },
      {
        q: "Is my data safe on a rented workstation?",
        a: RESET_ANSWER,
      },
      {
        q: "Do I get a GST invoice?",
        a: "Yes. A GST invoice is issued automatically for every payment. Business accounts can add their GSTIN so it appears on the invoice, and can be billed monthly instead of prepaying.",
      },
    ],
    related: ["d5-render-cloud-workstation", "revit-cloud-workstation", "blender-cloud-workstation"],
  },
];

export const SOFTWARE_PAGES_BY_SLUG: Record<string, SoftwarePage> = Object.fromEntries(
  SOFTWARE_PAGES.map((p) => [p.slug, p]),
);
