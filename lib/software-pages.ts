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

import { GPU_CLASS, NODE, replacementCost } from "./node-spec";
import type { Currency } from "./money";

export type SoftwarePage = {
  /** URL slug under / */
  slug: string;
  title: string;
  /**
   * The <title>, when `title` (which is also the H1) would run past 60
   * characters once the " | Coreframe Cloud" suffix is added. Google cuts a
   * long title at about 60, and what it cut was the application name's
   * qualifier, not the brand.
   */
  metaTitle?: string;
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
  /**
   * The whole <title>, brand included, when the "| Coreframe Cloud" suffix
   * would push it past ~60 characters (SEO review 18 Oct 2026).
   */
  absoluteTitle?: string;
  /** The H1, when it should differ from `title`. */
  h1?: string;
  /**
   * Live prices under the lead, from the rate card (never typed here):
   * "answer" = the answer-first passage plus the spec table (GPU rental page);
   * "line" = one line with the hourly rate in the visitor's currency.
   */
  livePrice?: "answer" | "line";
  /** Short sections shown open (not folded), each with an optional link. */
  callouts?: { h2: string; body: string; link?: { href: string; label: string } }[];
  /** Adds the quiet "Studio of 3 or more? Team plans" link. */
  teamPlansLink?: boolean;
  /** Visible content date, e.g. "18 October 2026". */
  lastUpdated?: string;
};

const RESET_ANSWER =
  "Every session starts from an identical clean machine, so anything you install during a session is removed when it ends. Your project files live on NAS storage, which persists between sessions. That reset is how we make sure nothing from another customer's work, or yours, is left on the machine. It matters when a project is under NDA.";

const LICENCE_BYOL =
  "You install it and sign in with your own licence, exactly as you would on a new PC. We don't supply licences for commercial software, because the licence belongs to you and not to the machine.";

/**
 * The pages, built for one display currency (owner, 18 Oct 2026: one currency
 * per visitor). The rupee build is the source copy (sitemap, llms.txt). The
 * dollar build quotes the dollar hardware estimate (replacementCost("USD"),
 * $6,000, owner 18 Oct 2026) and drops the GST and rupee claims.
 */
function buildSoftwarePages(cur: Currency): SoftwarePage[] {
  const usd = cur === "USD";
  const machineCost = replacementCost(cur);
  return [
  {
    slug: "revit-cloud-workstation",
    title: "Revit Cloud Workstation — run Revit on a rented RTX GPU",
    metaTitle: "Revit Cloud Workstation, rented RTX GPU",
    teamPlansLink: true,
    lastUpdated: "22 October 2026",
    description:
      "Run Autodesk Revit on a Windows GPU workstation in India, billed per minute. Bring your Autodesk licence, open large models, and render without buying hardware.",
    intro:
      `Revit is hard on underpowered machines. Big federated models crawl, views take seconds to regenerate, and a render ties up the only computer you have. A Coreframe workstation gives you a ${GPU_CLASS} and workstation RAM for as long as you need it, billed by the minute.`,
    problem:
      "Your laptop copes with small models but stalls on the coordinated one the whole team works in. And buying a workstation for the two weeks a year you need one doesn't add up.",
    why: [
      "Large models open and move around on hardware sized for them.",
      "Rendering runs on the rented machine, so your own computer stays free to keep working.",
      "Link Revit with Enscape, Twinmotion or D5 Render in the same session. They're all ordinary Windows applications on your desktop.",
      "Pay for the deadline week and nothing else.",
    ],
    licence: LICENCE_BYOL + " Install Revit from your own Autodesk account at manage.autodesk.com, which is what ties the install to your seat.",
    faqs: [
      {
        q: "Can I run Autodesk Revit on a cloud GPU workstation?",
        a: "Yes. A Coreframe workstation is a full Windows machine with an RTX GPU, and Revit runs exactly as it would on a local PC. Autodesk only lets you download the installer from your own account, so we set it up with you once in a short session where you sign in. After that, Revit is on every workstation you launch, running on your own subscription.",
      },
      {
        q: "Does Coreframe provide a Revit licence?",
        a: "No. Autodesk licences are issued to a named user, so you bring your own and sign in during the session. We provide the machine and you provide the licence.",
      },
      {
        q: "Will my Revit files be there next time?",
        a: RESET_ANSWER,
      },
      {
        q: "How much does it cost to run Revit on Coreframe?",
        a: "You pay per minute of streaming time at the published GPU-hour rate. There's no setup fee and no monthly minimum, and we don't bill for provisioning time or failed connections.",
      },
    ],
    related: ["enscape-cloud-gpu", "cloud-rendering-for-architects", "3ds-max-cloud-workstation", "twinmotion-cloud-workstation", "sketchup-cloud-workstation"],
  },

  {
    slug: "3ds-max-cloud-workstation",
    title: "3ds Max Cloud Workstation — GPU rendering by the hour",
    metaTitle: "3ds Max Cloud Workstation by the hour",
    // 19 Oct 2026: "3ds max cloud rendering (service)" and "cloud rendering
    // for 3ds max" (~64 impressions, no clicks) lead the title now. Was
    // "3ds Max Cloud Workstation & Rendering, RTX 5080 | Coreframe".
    absoluteTitle: "3ds Max Cloud Rendering on a GPU Workstation | Coreframe",
    callouts: [
      {
        h2: "3ds Max cloud rendering: workstation or render farm?",
        body: "A render farm takes a finished scene and renders its frames on many machines; you submit and wait. A cloud workstation is one machine you drive yourself: you model, light, tweak materials and render in the same session. For look development and stills, a workstation fits; for a long animation split across many machines, a farm does.",
        link: { href: "/cloud-workstation-vs-render-farm", label: "Cloud workstation vs render farm" },
      },
    ],
    teamPlansLink: true,
    lastUpdated: "22 October 2026",
    description:
      "3ds Max cloud rendering on a rented GPU workstation: V-Ray GPU and Chaos Vantage on a workstation-class RTX card, your own licence, billed per minute.",
    intro:
      "3ds Max with V-Ray or Corona is the classic case for renting a GPU, because the work comes in bursts. You need serious hardware for a few days before a deadline and almost none for the rest of the month.",
    problem:
      `Rendering ties up your workstation for hours, and the machine that would do it comfortably lands at about ${machineCost} and sits idle most of the year.`,
    why: [
      "V-Ray GPU and Chaos Vantage render on the graphics card, which is what this hardware is for. Corona is a CPU renderer, so read the note below before you assume it gets faster.",
      "Your own computer stays usable while the render runs on the rented machine.",
      "Rent for the deadline and stop paying once it ships.",
      "Scene files stay on persistent NAS storage between sessions.",
    ],
    licence: LICENCE_BYOL + " That covers 3ds Max itself and whichever renderer you sign in to with your Chaos account: V-Ray, Corona or Vantage.",
    sections: [
      {
        h2: "Which renderer you use changes the answer.",
        body: [
          "What we'd recommend for 3ds Max depends on what you render with. It's worth getting this right, because the wrong assumption costs you money.",
          `V-Ray GPU and Chaos Vantage do their work on the graphics card. Those are the cases a rented ${GPU_CLASS} is built for: VRAM is the ceiling on how much scene fits, and every Coreframe GPU has far more than the 6 to 8 GB in most laptops and entry desktops sold for design work. When a GPU render fails or forces you to cut texture resolution, VRAM is almost always why.`,
          `Corona is a CPU renderer. So is V-Ray's CPU engine, which many studios still use for final frames. A Coreframe node has a high-performance desktop CPU (the vCPU count is on the pricing page). That's a sensible CPU for driving a viewport and a GPU renderer, but it isn't a render node for CPU work. If your final frames come out of Corona, a rented workstation won't change that, and we'd rather tell you here than have you find out in your first session.`,
          "Most studios are somewhere in between. They model and light interactively on the GPU in Vantage or V-Ray GPU and keep CPU final frames wherever they already run. That works well, and it's easier if you plan for it from the start.",
        ],
      },
      {
        h2: "Why studios rent for 3ds Max specifically.",
        body: [
          `Archviz work in 3ds Max comes in bursts, which makes buying hardware a poor deal. There is a week before a client presentation when the machine cannot keep up, and three weeks afterwards when it idles. A workstation that renders comfortably lands at roughly ${machineCost}${usd ? "" : " in India"}, is bought once, and is still on the books whether or not the project that justified it goes ahead.`,
          "The second reason is that rendering takes the machine away from you. A local render ties up the computer you also model on, so the afternoon is spent waiting. Run it on a rented machine and you get the afternoon back, because your own computer stays free while the render runs somewhere else.",
          `The third is hiring. A studio taking on a remote 3ds Max artist otherwise has to ship them a workstation, buy a laptop that cannot really cope, or hope they own something adequate. A rented machine they reach from their own laptop is a monthly line item instead of ${machineCost} of hardware, and it stops cleanly if the arrangement does not.`,
        ],
      },
      {
        h2: "What the session is actually like.",
        body: [
          `You get a full Windows desktop (${NODE.os}). You install 3ds Max and your renderer with your own Autodesk and Chaos accounts, open your scene from persistent storage and get on with it. The viewport, material editor and render setup all work the same as on a machine under your desk.`,
          "The machine resets to a clean image when the session ends. That's how we can promise nothing from another studio's work is on it when you get it. Your scene files don't live on that machine. They sit on storage that persists between sessions, so a session you open on Friday picks up where Monday's stopped, with nothing copied around. On a committed monthly plan we build your applications into the baseline image on your nodes, so they are already there when you sign in.",
          "Billing runs per minute from when you connect. Preparing the machine and uploads are free. If you don't connect within 10 minutes of your workstation being ready, it shuts down and those 10 minutes are charged; if a connection fails on our side, nothing is charged.",
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
        a: "No. A render farm takes a submitted job and sends back frames. Coreframe gives you an interactive workstation you drive yourself, so you can set up the scene, tweak materials and render in the same session, just as you would locally.",
      },
      { q: "What happens to my scene files after the session?", a: RESET_ANSWER },
      {
        q: "Will Corona render faster on a Coreframe workstation?",
        a: `Probably not, and it's better to know that now. Corona is a CPU renderer, and a Coreframe node has a high-performance desktop CPU, not a render-node CPU. That's enough to drive the application and a GPU renderer, but it isn't a CPU render node, so if your final frames come out of Corona the machine won't change that. It helps with V-Ray GPU and Chaos Vantage, which render on the graphics card.`,
      },
      {
        q: "How much VRAM do I need for 3ds Max GPU rendering?",
        a: `VRAM sets a limit on what fits. Geometry, textures and lightmaps all have to fit on the card, and when they don't, a GPU render fails or you have to cut texture resolution. Every Coreframe GPU has far more than the 6 to 8 GB in many laptops and entry desktops sold for design work. We can't predict how your particular scene will behave, so open it in a session and watch the VRAM meter.`,
      },
      {
        q: "Do I need to reinstall 3ds Max every session?",
        a: "On ad-hoc hourly sessions, yes, because the machine resets to a clean image each time and the setup time is billed like any other minute. On a committed monthly plan we build your applications into the baseline image on your nodes, so they are there when you sign in. If you tell us what you use before your first session, we install it beforehand so your first hours test your real workflow instead of paying for setup.",
      },
    ],
    related: ["architectural-visualization", "vray-cloud-rendering", "cloud-workstation-vs-render-farm", "revit-cloud-workstation", "sketchup-cloud-workstation"],
  },

  {
    slug: "sketchup-cloud-workstation",
    title: "SketchUp Cloud Workstation with GPU rendering",
    metaTitle: "SketchUp Cloud Workstation, GPU rendering",
    description:
      "Run SketchUp Pro with Enscape, V-Ray or D5 Render on a rented Windows RTX workstation in India. Per-minute billing, bring your own licence.",
    intro:
      "SketchUp itself is light, but the renderer attached to it is heavy. Enscape, V-Ray and D5 all want a real GPU, and that's where a modelling laptop gives up.",
    problem:
      "SketchUp runs fine until you hit Render. Then the machine that models comfortably can't produce the walkthrough the client asked for.",
    why: [
      "Real-time rendering in Enscape or D5 at a frame rate that makes navigation usable.",
      "Model and render in one session, with no exporting between machines.",
      "Plugins behave as they do at home, because this is ordinary Windows and not a browser tool.",
    ],
    licence: LICENCE_BYOL + " SketchUp Pro signs in with your Trimble account.",
    faqs: [
      {
        q: "Can I use SketchUp with Enscape on a cloud GPU workstation?",
        a: "Yes. Install SketchUp Pro and Enscape during your session and sign in with your own licences. Because Enscape is a plugin, install its host application first.",
      },
      {
        q: "Is a cloud workstation fast enough for real-time rendering?",
        a: `Yes. The rendering happens on the workstation's GPU and only the resulting video comes back to you, streamed at ${NODE.stream} through the Coreframe Connect app. So what your own laptop can do makes almost no difference to the image. A steady connection matters more than a fast one, and latency matters more than bandwidth.`,
      },
      { q: "Do my models persist between sessions?", a: RESET_ANSWER },
    ],
    related: ["architectural-visualization", "enscape-cloud-gpu", "d5-render-cloud-workstation", "revit-cloud-workstation", "vray-cloud-rendering", "twinmotion-cloud-workstation"],
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
    metaTitle: "Blender Cloud GPU Workstation for Cycles",
    description:
      "Run Blender with Cycles GPU rendering on a rented RTX workstation in India, billed per minute. Blender is preinstalled, so no licence is needed.",
    intro:
      "Blender is free, so the GPU is the only thing between you and a fast Cycles render. You can rent one by the minute instead of buying it, and Blender is already installed on every Coreframe workstation.",
    problem:
      "Cycles renders take all night on your laptop, and you can't justify a GPU upgrade for occasional work.",
    why: [
      "Blender is preinstalled and ready, with nothing to license or configure.",
      "Cycles GPU rendering on an RTX card, with the VRAM that heavy scenes need.",
      "Keep working on your own machine while the render runs on the rented one.",
      "It's free and open source, so there's no licence to bring.",
    ],
    licence:
      "None needed. Blender is free and open source, and we install it on every workstation, so you can open it and start working.",
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
    related: ["video-animation-rendering", "cloud-workstation-vs-render-farm", "d5-render-cloud-workstation", "3ds-max-cloud-workstation", "twinmotion-cloud-workstation"],
  },

  {
    slug: "twinmotion-cloud-workstation",
    title: "Twinmotion Cloud Workstation for architects",
    metaTitle: "Twinmotion Cloud Workstation, by the minute",
    // 19 Oct 2026: "twinmotion workstation" (29 impressions, no clicks) leads
    // the <title>. Was "Twinmotion Cloud Workstation, RTX 5080 | Coreframe Cloud".
    absoluteTitle: "Twinmotion Cloud Workstation, by the Minute | Coreframe",
    description:
      "Rent a Twinmotion workstation by the minute: a workstation-class RTX GPU with Twinmotion preinstalled, streamed to your own computer.",
    intro:
      "Twinmotion is preinstalled on every Coreframe workstation, and its free tier covers most individual users. All you rent is the GPU workstation that makes it run properly, by the minute.",
    livePrice: "line",
    lastUpdated: "22 October 2026",
    problem:
      "Twinmotion looks great in demos and stutters on your own laptop, especially with vegetation and reflections turned up.",
    why: [
      "Preinstalled, so you can be rendering minutes after signing up.",
      "Datasmith imports from Revit, SketchUp, Rhino and Archicad.",
      "Real-time navigation at a presentable frame rate.",
      "The free tier covers most individual users, so there's often no software cost at all.",
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
    related: ["architectural-visualization", "unreal-engine-cloud-workstation", "blender-cloud-workstation", "revit-cloud-workstation", "vray-cloud-rendering"],
  },

  {
    slug: "vray-cloud-rendering",
    title: "V-Ray Cloud Rendering on a rented GPU workstation",
    metaTitle: "V-Ray Cloud Rendering on a rented RTX GPU",
    description:
      "Run Chaos V-Ray GPU rendering on a rented RTX workstation in India, billed per minute. Works with 3ds Max, SketchUp, Rhino and Revit. Bring your Chaos licence.",
    intro:
      `V-Ray GPU wants VRAM and CUDA cores. Owning them means a machine at about ${machineCost} sitting on the books all year for work that keeps it busy a few weeks of the year. Renting gets you the same card for just those weeks.`,
    problem:
      "V-Ray GPU renders outlast your working day on a card that was never meant for production rendering.",
    why: [
      "V-Ray GPU rendering on an RTX card with production-grade VRAM.",
      "Works with whichever host you use: 3ds Max, SketchUp, Rhino or Revit.",
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
    related: ["architectural-visualization", "3ds-max-cloud-workstation", "sketchup-cloud-workstation", "rhino-cloud-workstation"],
  },

  {
    slug: "rhino-cloud-workstation",
    title: "Rhino Cloud Workstation — Rhino and Grasshopper on a rented GPU",
    metaTitle: "Rhino & Grasshopper Cloud Workstation",
    description:
      "Run Rhino with Grasshopper, V-Ray or Enscape on a rented RTX GPU workstation in India. Per-minute billing, your own Rhino licence.",
    intro:
      "Rhino models fine on modest hardware until the geometry gets heavy or you attach a renderer. A rented RTX workstation handles both, and you don't have to buy anything.",
    problem:
      "Heavy NURBS models and Grasshopper definitions bring your laptop to a halt, and the renderer needs a GPU you don't have.",
    why: [
      "Headroom for dense geometry and complex Grasshopper definitions.",
      "Attach V-Ray or Enscape in the same session for GPU rendering.",
      "Rent for one project instead of buying a machine you'll keep for years.",
    ],
    licence: LICENCE_BYOL + " Rhino uses your own licence key.",
    lastUpdated: "22 October 2026",
    /**
     * Grasshopper (owner, 19 Oct 2026, page 4 of "build pages 1-4"): a section
     * here, not a page of its own. This page is already "Rhino & Grasshopper
     * Cloud Workstation"; a separate Grasshopper page would have one fact of
     * its own (it ships with Rhino 8) and would compete with this one for the
     * same searches. Nothing claimed beyond what this page already says:
     * Rhino is bring-your-own-licence, and Grasshopper comes with it.
     */
    callouts: [
      {
        h2: "Grasshopper comes with Rhino 8.",
        body:
          "Grasshopper ships with Rhino 8, so there is nothing extra to license or buy from us: once Rhino is on the workstation under your own licence key, type Grasshopper at the command line and it opens, the same as at your desk. Coreframe supplies the machine, never the Rhino licence.",
      },
    ],
    sections: [
      {
        h2: "Running Grasshopper definitions on the workstation.",
        body: [
          `Grasshopper solves a definition on the CPU, so a heavy one works with the workstation's CPU and RAM. The GPU draws the Rhino viewport and runs the renderer you attach, such as V-Ray or Enscape, in the same session.`,
          "Keep your .gh definitions and the files they read in your project folder on persistent storage, so they are there the next time you launch.",
        ],
      },
    ],
    faqs: [
      {
        q: "Is Grasshopper included?",
        a: "Grasshopper ships with Rhino 8, so it comes with your own Rhino licence: there is nothing extra to buy from us or to install separately. Coreframe supplies the workstation, not the Rhino licence.",
      },
      {
        q: "Can I run Rhino and Grasshopper on a cloud workstation?",
        a: "Yes. It is a standard Windows desktop, and Rhino, Grasshopper and plugins run normally with your own licence. We set them up with you once, so you aren't reinstalling them every session."
      },
      { q: "Do my Rhino files persist between sessions?", a: RESET_ANSWER },
    ],
    related: ["vray-cloud-rendering", "sketchup-cloud-workstation", "revit-cloud-workstation"],
  },

  /**
   * Added 10 Oct 2026 for video editors, who are a real customer group with no
   * page: "after effects cloud render" and "premiere pro cloud editing" were
   * owned by render-farm blogs. Written to be honest about the two things that
   * decide whether this works for video -- getting footage onto the machine,
   * and judging colour through a compressed stream -- because a video editor
   * who discovers either in a paid session will not come back.
   * No render or export times anywhere: they depend on the project.
   */
  {
    slug: "after-effects-premiere-cloud-workstation",
    title: "After Effects and Premiere Pro on a rented RTX workstation",
    metaTitle: "After Effects & Premiere Cloud Workstation",
    description:
      "Run Adobe After Effects and Premiere Pro on a Windows GPU workstation in India, billed per minute. Your own Adobe licence; files persist.",
    intro:
      `Coreframe rents a full Windows desktop (${NODE.os}) with a dedicated NVIDIA RTX GPU and workstation RAM, streamed to the laptop you already own and billed by the minute. After Effects and Premiere Pro run on it with your own Adobe account, so a heavy comp or an export runs there while your own machine stays free.`,
    problem:
      "After Effects previews crawl and Premiere exports tie up your laptop for the evening, and a machine that copes costs far more than the few weeks a year you really need it.",
    why: [
      "Both applications use the GPU for playback, effects and encoding, and a workstation-class RTX GPU has the VRAM for them to work in.",
      "Workstation RAM, which After Effects uses for RAM preview.",
      "Export and render on the rented machine while your own computer stays usable.",
      "Pay for the busy weeks only. Per-minute billing stops when you end the session.",
    ],
    licence:
      "Adobe Creative Cloud is installed on the workstation. You sign in with your own Adobe account, so it runs on your own subscription.",
    sections: [
      {
        h2: "Two things to check before you move a video project.",
        body: [
          "Footage has to reach the workstation first. Project files live on a persistent drive mapped into every session, and they get there over your own internet connection. That is easy for a motion-graphics project and slow for hundreds of gigabytes of camera originals, so work out how long your upload will take before you plan a deadline around it. Storage sizes are on the pricing page.",
          `You see the desktop through a compressed stream at up to ${NODE.stream}. It is fine for editing, timing and motion work. It is not a reference monitor, so judge final colour and fine grain on the exported file, which you download, not on the stream.`,
        ],
      },
      {
        h2: "Where it fits, and where it doesn't.",
        body: [
          "It fits motion graphics, short-form edits, After Effects comps that need more GPU or RAM than your laptop has, and exports you would rather not run on the machine you are working on.",
          "It is a single workstation that you drive yourself, not a render farm. If you need hundreds of After Effects frames spread across many machines at once, a render farm that supports After Effects is built for that. We would rather say so than sell you the wrong thing.",
        ],
      },
    ],
    faqs: [
      {
        q: "Can I run After Effects and Premiere Pro on a cloud PC in India?",
        a: `Yes. A Coreframe workstation is a full Windows desktop (${NODE.os}) with a dedicated NVIDIA RTX GPU, hosted in ${NODE.location}, and After Effects, Premiere Pro and Media Encoder run on it with your own Adobe account. You reach it through the Coreframe Connect app and it is billed per minute of streaming.`,
      },
      {
        q: "Does Coreframe provide an Adobe licence?",
        a: "No. Creative Cloud is installed on the workstation and licensed to you, so you sign in with your own Adobe account.",
      },
      {
        q: "How do I get my footage onto the workstation?",
        a: "Upload it to your persistent project drive, which is mapped into every session and stays between sessions. It travels over your own internet connection, so large camera originals take time. Plan the upload before the deadline, not during it.",
      },
      {
        q: "Can I colour grade over the stream?",
        a: `You can edit and grade, but the stream is compressed video at up to ${NODE.stream}, not a calibrated reference signal. Check final colour on the exported file after you download it.`,
      },
      { q: "What happens to my project files after a session?", a: RESET_ANSWER },
    ],
    related: ["video-animation-rendering", "cloud-workstation-vs-render-farm", "blender-cloud-workstation", "gpu-workstation-rental-india"],
  },

  {
    slug: "gpu-workstation-rental-india",
    title: "GPU Workstation Rental in India — per-minute RTX workstations",
    metaTitle: "Rent a GPU Workstation in India",
    absoluteTitle: "GPU on Rent in India, Workstations by the Minute | Coreframe",
    h1: "Rent a GPU workstation in India, by the minute",
    livePrice: "answer",
    lastUpdated: "22 October 2026",
    callouts: [
      {
        h2: "Running your own CFD software?",
        body: `Bring your own licence. A Coreframe workstation is a full Windows desktop (${NODE.os}) with a ${GPU_CLASS} and workstation RAM, so you install your CFD or simulation package and run it the way you would on a machine under your desk. If you only need the pressure drop of a duct or pipe, we can run it for you instead.`,
        link: { href: "/cfd", label: "CFD for ducts and pipes" },
      },
    ],
    description:
      usd
        ? "Rent a Windows RTX GPU workstation in India by the minute for 3D rendering, CAD and simulation. No hardware purchase, billed in US dollars, persistent NAS storage."
        : "Rent a Windows RTX GPU workstation in India by the minute for 3D rendering, CAD and simulation. No hardware purchase, GST invoices, persistent NAS storage.",
    intro:
      "Coreframe rents Windows GPU workstations by the minute from infrastructure in India. You stream a real RTX desktop to the computer you already own and pay only for the minutes you use.",
    problem:
      usd
        ? `A workstation that would handle your rendering lands at about ${machineCost}, depreciates the day it arrives, and sits idle most of the week.`
        : `A workstation that would handle your rendering lands at about ${machineCost}, depreciates the day it arrives, and sits idle most of the week. An international cloud GPU bills in dollars and comes with the latency you'd expect from a server abroad.`,
    why: [
      usd
        ? "The machines are in India, so latency is low for users in and near India. Accounts billed outside India pay in US dollars, with no GST."
        : "The machines are in India, so latency is low for Indian users, and you pay in rupees with GST invoices.",
      "Per-minute billing starts when the stream does. Provisioning is free.",
      "Persistent NAS storage for project files between sessions.",
      "A full Windows desktop where every application you need is installed for you.",
      "No setup fee and no monthly minimum on pay-as-you-go.",
    ],
    licence:
      "Free software including Blender and Twinmotion is preinstalled. For commercial applications you bring your own licence: install them and sign in with your own subscription.",
    faqs: [
      {
        q: "Where can I rent a GPU workstation in India?",
        a: "Coreframe rents Windows RTX GPU workstations by the minute, hosted in India, for 3D rendering, CAD and simulation work. You stream the desktop to your own computer and pay only for streaming time.",
      },
      // The price question is appended by the page from the live rate card
      // ("How much does a Coreframe workstation cost?"), so no figure is typed here.
      {
        q: "Can I rent an RTX GPU in India by the hour?",
        a: `Yes. Every Coreframe workstation has one dedicated NVIDIA RTX GPU, running ${NODE.os} in ${NODE.location}; the GPUs on offer, with their VRAM, vCPU and RAM, are listed with their prices on the pricing page. You rent the whole machine, not a slice of the card, and billing is per minute of streaming rather than per whole hour.`,
      },
      {
        q: "Do I need to buy software licences too?",
        a: "Free software such as Blender and Twinmotion is preinstalled. For commercial applications you bring your own licence and sign in during the session, the same as you would on a new PC.",
      },
      {
        q: "Is my data safe on a rented workstation?",
        a: RESET_ANSWER,
      },
      usd
        ? {
            q: "Do I get an invoice?",
            a: "Yes. An invoice is issued automatically for every payment, in US dollars and with no GST (export of services). Business accounts can be billed monthly instead of prepaying.",
          }
        : {
            q: "Do I get a GST invoice?",
            a: "Yes. A GST invoice is issued automatically for every payment. Business accounts can add their GSTIN so it appears on the invoice, and can be billed monthly instead of prepaying.",
          },
    ],
    related: ["d5-render-vs-local-gpu", "coreframe-vs-irender", "cloud-workstation-vs-render-farm", "d5-render-cloud-workstation", "lumion-cloud-gpu", "blender-cloud-workstation"],
  },
  {
    // Added 18 Oct 2026 (SEO review, action 15). Unreal Engine is in the
    // standard image (owner confirmed 13 Oct 2026; lib/software-catalogue.ts).
    // No render-time or frame-rate claims: they depend on the project.
    slug: "unreal-engine-cloud-workstation",
    title: "Unreal Engine Cloud Workstation — preinstalled on a rented RTX GPU",
    metaTitle: "Unreal Engine Cloud Workstation, by the minute",
    // 22 Oct 2026: the suffix made the title 64 characters; 58 with the short brand.
    absoluteTitle: "Unreal Engine Cloud Workstation by the Minute | Coreframe",
    description:
      "Unreal Engine 5.8 with Quixel Bridge, preinstalled on a Windows GPU workstation in India and billed per minute. Sign in with your Epic account.",
    intro:
      `Unreal Engine 5.8 with Quixel Bridge is preinstalled on every Coreframe workstation. You sign in with your own Epic account, open your project from persistent storage and work on a ${GPU_CLASS}, billed by the minute.`,
    problem:
      "Unreal wants a strong GPU and a lot of VRAM, and the laptop you take to client meetings has neither.",
    why: [
      "Preinstalled: no multi-gigabyte engine download before you can start.",
      "Workstation-class VRAM for Nanite geometry, Lumen lighting and high-resolution textures.",
      "Datasmith imports from Revit and SketchUp, and Twinmotion is on the same machine.",
      "Project files stay on persistent NAS storage between sessions.",
      "Rent it for the weeks a project needs it and stop paying when it ships.",
    ],
    licence:
      "Unreal Engine is preinstalled. Sign in with your own Epic account; Epic's licence terms apply to your project exactly as they would on your own PC.",
    faqs: [
      {
        q: "Is Unreal Engine preinstalled on Coreframe?",
        a: "Yes. Unreal Engine 5.8 with Quixel Bridge is part of the standard image, so it is there when your session starts. Sign in with your own Epic account.",
      },
      {
        q: "Can I bring a Revit or SketchUp model into Unreal on the workstation?",
        a: "Yes, with Datasmith, as you would locally. Install Revit or SketchUp with your own licence in the same session if you need the source application too.",
      },
      {
        q: "How fast will my Unreal project run?",
        a: `We don't quote frame rates or render times, because they depend on your project and settings. The GPUs on offer, with their VRAM, vCPU and RAM, are on the pricing page. Open your heaviest level in a session and see.`,
      },
      { q: "Do my Unreal projects persist between sessions?", a: RESET_ANSWER },
    ],
    related: ["video-animation-rendering", "twinmotion-cloud-workstation", "d5-render-cloud-workstation", "blender-cloud-workstation", "gpu-workstation-rental-india"],
    lastUpdated: "22 October 2026",
  },
  ];
}

export const SOFTWARE_PAGES: SoftwarePage[] = buildSoftwarePages("INR");
const SOFTWARE_PAGES_USD: SoftwarePage[] = buildSoftwarePages("USD");

export const SOFTWARE_PAGES_BY_SLUG: Record<string, SoftwarePage> = Object.fromEntries(
  SOFTWARE_PAGES.map((p) => [p.slug, p]),
);

const SOFTWARE_PAGES_BY_SLUG_USD: Record<string, SoftwarePage> = Object.fromEntries(
  SOFTWARE_PAGES_USD.map((p) => [p.slug, p]),
);

/** The page for `slug` in the visitor's display currency, or undefined. */
export function softwarePage(slug: string, cur: Currency): SoftwarePage | undefined {
  return (cur === "USD" ? SOFTWARE_PAGES_BY_SLUG_USD : SOFTWARE_PAGES_BY_SLUG)[slug];
}
