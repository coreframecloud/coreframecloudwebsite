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
        a: "Yes. A Coreframe workstation is a full Windows machine with an RTX GPU and administrator rights, so Revit installs and runs exactly as it would on a local PC. You sign in with your own Autodesk subscription.",
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
    related: ["d5-render-cloud-workstation", "3ds-max-cloud-workstation", "enscape-cloud-workstation"],
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
      "GPU rendering in V-Ray, Corona or Chaos Vantage on hardware built for it.",
      "Your own computer stays usable while the render runs on the rented machine.",
      "Scale up for a deadline and stop paying the moment it ships.",
      "Scene files stay on persistent NAS storage between sessions.",
    ],
    licence: LICENCE_BYOL + " That includes 3ds Max itself and any renderer — V-Ray, Corona or Vantage — you sign in to with your Chaos account.",
    faqs: [
      {
        q: "Can I run 3ds Max and V-Ray on a rented cloud GPU?",
        a: "Yes. You get a full Windows desktop with an RTX GPU and administrator rights, so 3ds Max, V-Ray, Corona and Chaos Vantage install and run normally. You sign in with your own Autodesk and Chaos licences.",
      },
      {
        q: "Is this a render farm?",
        a: "No. A render farm takes a submitted job and returns frames. Coreframe gives you an interactive workstation you drive yourself, so you can set up the scene, tweak materials and render in the same session — the same way you work locally.",
      },
      { q: "What happens to my scene files after the session?", a: RESET_ANSWER },
    ],
    related: ["revit-cloud-workstation", "vray-cloud-rendering", "d5-render-cloud-workstation"],
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
    related: ["enscape-cloud-workstation", "d5-render-cloud-workstation", "revit-cloud-workstation"],
  },

  {
    slug: "enscape-cloud-workstation",
    title: "Enscape Cloud Workstation — real-time rendering without a gaming laptop",
    description:
      "Run Enscape with Revit, SketchUp, Rhino or Archicad on a rented RTX GPU workstation in India. Per-minute billing, your own Enscape licence.",
    intro:
      "Enscape is a plugin, which means its performance is entirely your machine's problem. On a rented RTX workstation the walkthrough is smooth and your own laptop never gets warm.",
    problem:
      "Enscape runs, but not at a frame rate you would show a client, and the fix is a GPU your laptop cannot take.",
    why: [
      "Real-time walkthroughs at a frame rate you can present live on a client call.",
      "Run it alongside its host — Revit, SketchUp, Rhino or Archicad — in the same session.",
      "Rent the GPU for the presentation week rather than buying one for the year.",
    ],
    licence:
      LICENCE_BYOL +
      " Enscape is a plugin, so install its host application (Revit, SketchUp, Rhino or Archicad) first, then Enscape.",
    faqs: [
      {
        q: "Can I run Enscape on a cloud workstation?",
        a: "Yes. Install your host application and Enscape during the session and sign in with your own Enscape licence. The machine has an RTX GPU, which is what Enscape needs for real-time output.",
      },
      {
        q: "Will the walkthrough be smooth over the internet?",
        a: "The rendering happens on the workstation; only video is streamed to you. On a stable connection of around 10 Mbps or better it feels like a local machine. A wired connection or 5 GHz Wi-Fi helps more than extra bandwidth.",
      },
      { q: "Does Enscape stay installed for next time?", a: RESET_ANSWER },
    ],
    related: ["sketchup-cloud-workstation", "revit-cloud-workstation", "d5-render-cloud-workstation"],
  },

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
    related: ["blender-cloud-workstation", "revit-cloud-workstation", "enscape-cloud-workstation"],
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
        a: "Yes. It is a standard Windows desktop with administrator rights, so Rhino, Grasshopper and any plugins install and run normally with your own licence.",
      },
      { q: "Do my Rhino files persist between sessions?", a: RESET_ANSWER },
    ],
    related: ["vray-cloud-rendering", "sketchup-cloud-workstation", "enscape-cloud-workstation"],
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
      "A full Windows desktop with administrator rights, not a restricted appliance.",
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
