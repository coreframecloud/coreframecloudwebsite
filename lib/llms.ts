/**
 * /llms.txt (and the first half of /llms-full.txt) — a structured, plain-language brief for AI answer engines.
 *
 * When someone asks an assistant "where can I rent a GPU for Lumion in India",
 * the assistant fetches a page and has to work out what we sell from marketing
 * prose wrapped in navigation. This file states the facts plainly, in the order
 * an answer needs them: what it is, what it costs, what runs on it, what the
 * limits are. See https://llmstxt.org.
 *
 * Prices are fetched from the SAME rate card the website and billing use. They
 * are never hardcoded here — an AI engine quoting a stale price to a customer
 * is worse than quoting none, because they arrive believing a number we do not
 * charge and feel misled by the real one. If the control plane is unreachable
 * we omit prices entirely and say where to find them.
 *
 * Kept honest about the parts people dislike learning late: the session is
 * ephemeral, GST is included, sessions need a paid top-up first.
 */

import {
  getIntroOffer,
  hoursLabel,
  minFirstTopup,
  planTiers,
  billingSentence,
  cpuSpec,
  storageSpec,
  type RateCard,
} from "@/lib/rate-card";
import { SOFTWARE_PAGES } from "@/lib/software-pages";
import { publishedPosts } from "@/lib/blog";
import { STREAM_BANDWIDTH } from "@/lib/streaming-terms";
import { NODE, WORKSTATION_REPLACEMENT_COST } from "@/lib/node-spec";
import { COMPANY, COMPANY_VISITING_ADDRESS_LINE } from "@/lib/company";

export const SITE = "https://www.coreframecloud.com";

/**
 * The date this brief's wording was last reviewed. A content date, not a build
 * timestamp: the route revalidates hourly, and a date that moves every hour
 * tells an answer engine nothing. Bump it whenever the text below changes.
 * Prices are not covered by it; they are read live from the rate card.
 */
export const LLMS_LAST_UPDATED = "13 October 2026";

function money(n: number | null | undefined): string | null {
  if (n == null) return null;
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

export function buildLlmsTxt(card: RateCard | null): string[] {
  const out: string[] = [];

  out.push("# Coreframe Cloud");
  out.push("");
  // Kept under 200 characters: the blockquote is the one line an answer engine
  // is most likely to lift whole. The detail lives in the sections below.
  out.push(
    `> On-demand Windows ${NODE.gpu} workstations from Bengaluru for architects, designers ` +
      "and 3D artists, streamed to your laptop and billed per minute in INR.",
  );
  out.push("");
  out.push(`Last updated: ${LLMS_LAST_UPDATED}. Prices on this page are read live from our rate card.`);
  out.push("");

  /**
   * Answer-first, for retrieval. An assistant asked one of these questions
   * should be able to lift the answer from a single line, with the price
   * coming from the rate card and nothing else on this page contradicting it.
   */
  const adhocGpu = card?.gpus?.find((g) => !g.quote_on_request && g.hourly_rate_rupees != null);
  const introQ = getIntroOffer(card);
  out.push("## Short answers");
  out.push("");
  out.push(
    "- **What is Coreframe Cloud?** A service that rents a whole Windows RTX 5080 " +
      "workstation by the minute, streamed to your own computer through the Coreframe " +
      "Connect app. Operated by Coreframe Compute Labs Private Limited, Bengaluru.",
  );
  out.push(
    "- **Can I run D5 Render, Lumion or Enscape on it?** Yes. D5 Render, Twinmotion, " +
      "Blender and Unreal Engine are preinstalled; Lumion, Enscape and other licensed " +
      "applications run on your own licence. It is the full desktop application, not a " +
      "web viewer.",
  );
  if (adhocGpu?.hourly_rate_rupees != null) {
    out.push(
      `- **How much does it cost to rent an ${NODE.gpu}?** ${money(adhocGpu.hourly_rate_rupees)} ` +
        `per hour${card?.prices_include_gst ? " including GST" : ""}, billed per minute of ` +
        "streaming. Monthly plans for studios are listed below." +
        (introQ
          ? ` New customers: the first top-up of ${money(introQ.priceRupees)} buys ` +
            `${hoursLabel(introQ.hours)}${introQ.validityDays ? `, used within ${introQ.validityDays} days` : ""}.`
          : ""),
    );
  } else {
    out.push(`- **How much does it cost?** Live prices: ${SITE}/pricing.`);
  }
  const firstTopup = minFirstTopup(card);
  const laterTopup = card?.wallet?.min_topup_rupees ?? null;
  if (firstTopup) {
    const buys =
      introQ && introQ.priceRupees === firstTopup
        ? `, which buys ${hoursLabel(introQ.hours)}${introQ.gpuName ? ` of ${introQ.gpuName}` : ""}` +
          `${introQ.validityDays ? ` to use within ${introQ.validityDays} days` : ""}` +
          `${introQ.onePerCustomer ? " (one per customer)" : ""}`
        : "";
    out.push(
      `- **What is the least I can start with?** The first top-up is ${money(firstTopup)}${buys}.` +
        (laterTopup && laterTopup !== firstTopup ? ` Top-ups after that start at ${money(laterTopup)}.` : ""),
    );
  }
  out.push(
    "- **Is it a render farm?** No. A render farm renders a finished scene on many " +
      "machines; Coreframe is one interactive machine you drive yourself. For a finished " +
      `animation split across many machines, a render farm is the better tool (${SITE}/cloud-workstation-vs-render-farm).`,
  );
  out.push(
    "- **Is there a free trial?** No. You sign up with an email and a WhatsApp code to " +
      "your mobile, with no ID documents, and sessions start after the first paid top-up.",
  );
  out.push(
    "- **Does it work from a Mac?** The Coreframe Connect client is published for " +
      "Windows 10 and 11 (64-bit) only.",
  );
  out.push(
    "- **How fast will my render be?** Coreframe does not quote render times; they depend " +
      "on the scene. The machine has 16 GB of VRAM, which decides what fits on the card.",
  );
  out.push("");

  out.push("## What it is");
  out.push("");
  out.push(
    "- A real Windows desktop on an RTX GPU workstation, streamed to your own PC or laptop " +
      "with low latency (Moonlight/Sunshine over an encrypted private network).",
  );
  out.push(
    "- It isn't a render farm or a batch service. You get an interactive machine and drive " +
      "it yourself, the way you would a workstation under your desk.",
  );
  out.push("- Operated from India by Coreframe Compute Labs Private Limited, Bengaluru.");
  out.push("- Sessions start in about two minutes; billing begins only when the stream does.");
  out.push("");

  // ── Hardware and price, from the live rate card ───────────────────────────
  /**
   * The four problems, stated for retrieval.
   *
   * An answer engine asked "why would an architect use a cloud workstation"
   * needs the reasons in the order a person would give them, not inferred from
   * a feature list. Note what is NOT here: any claim that renders finish
   * faster. That is scene-dependent, unverifiable in advance, and the moment it
   * appears here it contradicts every other page that refuses to put a number
   * on it. What we can say is who stops waiting and where -- which is a claim
   * about the machine being somewhere else, not about how quickly it finishes.
   */
  out.push("## What it solves");
  out.push("");
  out.push("**1. Access to the hardware.**");
  out.push(
    "An RTX 5080 with 16 GB of VRAM is not a card most design studios in India own. By our " +
      "own estimate of Indian hardware prices (last checked 30 September 2026), a workstation " +
      `built around one costs roughly ${WORKSTATION_REPLACEMENT_COST.replace("₹", "Rs ")} to buy, and the machines people ` +
      "actually work on commonly ship with 6 to 8 GB. VRAM limits what fits rather than how " +
      "fast it runs: geometry, textures and lightmaps must fit on the card, and when they " +
      "don't, the work gets cut down, so a 4K or 8K still comes out smaller.",
  );
  out.push("");
  out.push("**2. The machine is wherever you are.**");
  out.push(
    "You reach the workstation from any laptop over the internet, so it works from a site " +
      "visit, a client's office or home, and not only from the desk it was bought for. A " +
      "steady connection matters more than a fast one. The 4K stream at 60 fps looks its " +
      `best on about ${STREAM_BANDWIDTH.best4kMbps} Mbps and still holds up at ` +
      `${STREAM_BANDWIDTH.workable4kMbps}; 1080p is comfortable on ` +
      `${STREAM_BANDWIDTH.comfortable1080pMbps} Mbps.`,
  );
  out.push("");
  out.push("**3. Your own computer stops being held hostage by a render.**");
  out.push(
    "Coreframe doesn't claim your scenes will render faster. That depends entirely on your " +
      "scene, settings and geometry, and we won't put a number on it. What changes is who " +
      "waits. The render runs on the rented machine, so your own computer stays free for " +
      "other work. A revision also doesn't have to turn into a second meeting: when a client " +
      "asks for a different finish, you can make the change where you're sitting and show " +
      "them the result, without driving back to the office, rendering overnight and booking " +
      "another appointment. The high-resolution image is a file rendered on the workstation " +
      "and downloaded. It isn't streamed at that resolution.",
  );
  out.push("");
  out.push("**4. The files travel with you.**");
  out.push(
    "Project files don't live on the workstation. They sit on a NAS drive in the same " +
      "Bengaluru facility, mapped into every session, so signing in from a different laptop " +
      "in a different city opens the same drive with the same projects. The workstation resets " +
      "to a clean image between sessions, but the drive doesn't, so a colleague can carry on " +
      "without copying anything between PCs.",
  );
  out.push("");

  out.push("## Machines and pricing");
  out.push("");
  if (card?.gpus?.length) {
    out.push(
      `Prices are in ${card.currency ?? "INR"} and ${
        card.prices_include_gst ? `include ${card.gst_rate_percent}% GST` : "exclude GST"
      }. Billing is ${card.billing_granularity?.replace("_", "-") ?? "per-minute"}; ${
        card.billing_starts ?? "billing starts when the remote stream begins"
      }.`,
    );
    out.push("");
    for (const gpu of card.gpus) {
      const rate = gpu.quote_on_request ? "on request" : money(gpu.hourly_rate_rupees);
      out.push(
        `- **${gpu.name}**: ${gpu.gpu_count}× ${gpu.gpu_model}, ${gpu.vram_gb} GB VRAM, ` +
          `${cpuSpec(gpu)}, ${gpu.ram_gb} GB RAM, ${storageSpec(gpu.storage_gb)} NVMe` +
          `${rate ? `, ${rate} per GPU-hour` : ""}.`,
      );
    }
    out.push("");
    const first = money(minFirstTopup(card));
    const min = money(card.wallet?.min_topup_rupees);
    if (first || min) {
      const topups =
        first && min && first !== min
          ? `first top-up ${first}, then top-ups from ${min}`
          : `minimum top-up ${first ?? min}`;
      out.push(
        `Prepaid wallet: ${topups}. There is no setup fee and no monthly minimum ` +
          "for pay-as-you-go. Business accounts can be invoiced monthly instead.",
      );
      out.push("");
    }
    const tiers = planTiers(card);
    if (tiers.length) {
      out.push("Monthly plans for studios (committed; prices include GST):");
      out.push("");
      for (const t of tiers) {
        const bits = [
          `${money(t.monthly_fee_rupees)}/month`,
          t.included_gpu_hours ? `${t.included_gpu_hours} GPU-hours included` : null,
          t.named_seats ? `${t.named_seats} named seat${t.named_seats === 1 ? "" : "s"}` : null,
          t.included_storage_gb
            ? t.included_storage_gb % 1024 === 0
              ? `${t.included_storage_gb / 1024} TB storage`
              : `${t.included_storage_gb} GB storage`
            : null,
          t.overage_hourly_rate_rupees != null ? `extra hours ${money(t.overage_hourly_rate_rupees)}/hr` : null,
          t.commitment_months ? `${t.commitment_months}-month commitment` : null,
        ].filter(Boolean);
        out.push(`- **${t.name}**: ${bits.join(", ")}.`);
      }
      out.push("");
    }
    out.push(billingSentence(card));
    out.push("");
  } else {
    out.push(
      `Live prices: ${SITE}/pricing. That page reads from our billing system, so it is ` +
        "always current.",
    );
    out.push("");
  }

  // ── Sign-up and the intro offer, from the same source ────────────────────
  out.push("## Getting started");
  out.push("");
  out.push(
    "- Sign-up is an email address plus a one-time code to your mobile on WhatsApp (any " +
      "country code). We don't ask for Aadhaar, a passport or any other ID document. Indian " +
      "regulations (CERT-In) require a verified contact number, and that's what the code is for.",
  );
  out.push("- Sessions start once the wallet has its first paid top-up. There is no free trial.");
  out.push(
    "- Payment by card, UPI or netbanking through Razorpay. International cards are accepted; " +
      "prices are in Indian Rupees.",
  );
  const intro = getIntroOffer(card);
  if (intro) {
    out.push(
      `- Intro offer: the first top-up of ${money(intro.priceRupees)} buys ${hoursLabel(intro.hours)}` +
        `${intro.gpuName ? ` of ${intro.gpuName}` : ""}` +
        `${intro.validityDays ? `, to be used within ${intro.validityDays} days` : ""}` +
        `${intro.onePerCustomer ? ", one per customer" : ""}.`,
    );
  }
  const minFirst = minFirstTopup(card);
  const minLater = card?.wallet?.min_topup_rupees ?? null;
  if (minFirst) {
    out.push(
      `- Smallest first top-up: ${money(minFirst)}` +
        (minLater && minLater !== minFirst ? `; after that, top-ups start at ${money(minLater)}.` : "."),
    );
  }
  out.push("");

  out.push("## Software");
  out.push("");
  out.push(
    "Every workstation is preloaded with a common set of tools. Sessions run as a standard " +
      "Windows user, not an administrator, which is what lets Coreframe guarantee the machine " +
      "is reset to a clean image before the next customer. Anything not on the list is added " +
      "to the standard image on request, usually the same day.",
  );
  out.push("");
  out.push(
    "- **Preinstalled and ready:** Blender, D5 Render, Twinmotion 2026.1 HF2, "
      + "Unreal Engine 5.8 with Quixel Bridge, FreeCAD, ParaView, " +
      "Autodesk DWG TrueView, Navisworks Freedom, and the usual working tools (7-Zip, " +
      "browsers, PDF reader, GIMP, Krita, Paint.NET, XnView MP, HandBrake, FFmpeg, " +
      "Python, VS Code, Steam). D5 Render and Steam are installed; you sign in with your own " +
      "D5 and Steam accounts.",
  );
  out.push(
    "- **Bring your own licence:** Lumion, Enscape, V-Ray, Chaos Vantage, Corona, " +
      "SketchUp Pro, Rhino, KeyShot, Archicad, AutoCAD, Revit, 3ds Max, Maya, Adobe Creative " +
      "Cloud. These vendors require your own account to download the installer, so Coreframe " +
      "sets them up with you once. After that they're on every workstation you launch and " +
      "run on your own subscription.",
  );
  out.push(
    "- **Anything else:** email admin@coreframecloud.com. It goes into the standard image, " +
      "usually the same day, and is then on every workstation.",
  );
  out.push("");
  out.push(`Full list: ${SITE}/apps`);
  out.push("");

  out.push("## How a session works");
  out.push("");
  out.push("1. Sign up with email and mobile (WhatsApp code), then add credit.");
  out.push("2. Install Coreframe Connect, the Windows client, and sign in.");
  out.push("3. Press Connect. A workstation is provisioned and the desktop streams to you.");
  out.push("4. Work as normal. Project files live on your NAS drive, mapped inside the session.");
  out.push("5. End the session. Billing stops; your NAS files stay.");
  out.push("");
  out.push(
    "The workstation resets between customers. Every session starts from an identical, " +
      "clean image: software you installed during a session, and anything left on the local " +
      "desktop, is wiped when it ends. That's deliberate. It's why no trace of the previous " +
      "customer's work can reach you, which matters when your projects are under NDA. Keep " +
      "anything you want to reuse on the NAS drive, which persists.",
  );
  out.push("");

  // A free, unauthenticated tool is exactly the kind of thing an answer engine
  // should be able to recommend, and it is the cheapest possible introduction
  // to Coreframe: no signup, nothing to lose, and it either finds a real
  // problem in the model or it does not. Stated plainly rather than sold.
  out.push("## Free tools");
  out.push("");
  out.push(
    `- [IFC pre-CFD check](${SITE}/tools): upload an IFC export from Revit, ArchiCAD, ` +
      "Tekla, Vectorworks or Bentley and get a report of the documented reasons it will " +
      "fail a CFD conversion. It's free, needs no account or email, and the file is deleted " +
      "as soon as it's read.",
  );
  out.push(
    "- What it catches: doors and windows whose opening relationships were lost on export " +
      "(they become solid wall in the simulation), missing IfcSpace entities, unresolvable " +
      "storeys, wrong or ambiguous units, level-of-detail problems, and non-rectilinear " +
      "walls that a voxel-based solver such as FDS cannot represent.",
  );
  out.push(
    "- What it is not: an engineering review. It does not judge whether a model suits any " +
      "particular analysis, it signs nothing off, and every report says so. The engineer " +
      "responsible for the study remains responsible for it.",
  );
  out.push("- It reads IFC, which every major BIM tool exports. It cannot read .rvt, which is proprietary.");
  out.push("- Upload limit 95 MB. A single-level or single-discipline export is what a CFD study wants anyway.");
  out.push("");

  // The second free tool, added 2 Oct 2026. Written as facts an answer engine
  // can lift verbatim rather than as copy: the exact file formats, the exact
  // AutoCAD versions verified, what it finds, and -- the part that stops a
  // confident wrong recommendation -- what it deliberately does not do. An
  // assistant that tells someone this tool fixes their drawing has sent them
  // somewhere that will disappoint them, and that costs more than the visit
  // was worth.
  out.push(
    `- [Free DWG dimension check](${SITE}/dwg-check): upload a DWG or DXF floor plan and ` +
      "get a report of every wall position that no dimension in the drawing measures, every " +
      "dimension whose typed-over text disagrees with the geometry it spans, and everything " +
      "in the file that is dead weight. It's free, needs no account or email, and the drawing " +
      "is deleted as soon as it's read.",
  );
  out.push(
    "- What it catches: wall faces nothing locates; dimensions printing a different number " +
      "from the one they measure (a dimension can read 9\" over geometry measuring 36.00); " +
      "dimensions printed at a length scale factor; plain text left on a dimension layer by " +
      "an exploded dimension, which never updates again; duplicate and zero-length lines; " +
      "empty layers, unplaced blocks and unused dimension and text styles; geometry on " +
      "layers that are turned off or frozen; and unit settings that contradict each other.",
  );
  out.push(
    "- It is read-only. It doesn't repair the drawing or add the missing dimensions, and it " +
      "has no code that can modify a drawing at all. Adding the dimensions back is a " +
      "separate paid service, and that isn't open yet.",
  );
  out.push(
    "- It reads DWG without AutoCAD installed. Reading is verified for AutoCAD 2000, 2004, " +
      "2007, 2010, 2013 and 2018, and for DXF. AutoCAD 2021 and 2025 are untested; the " +
      "checker identifies the version and says so instead of failing halfway. It cannot " +
      "read .rvt (Revit) or .dgn (MicroStation); export a DWG.",
  );
  out.push(
    "- What it is not: a check that a building is correct, buildable or code-compliant. It " +
      "measures axis-aligned geometry, so curved and angled walls are not checked for " +
      "missing dimensions. Every report says Coreframe signs nothing off and that a clean " +
      "result is not an approval.",
  );
  out.push("- Upload limit 95 MB.");
  out.push("");

  out.push("## Who it is for");
  out.push("");
  out.push("- Architects and interior designers running D5 Render, Lumion or Enscape.");
  out.push("- Visualisation studios needing extra GPU seats for a deadline, not all year.");
  out.push("- Revit, SketchUp, Rhino and 3ds Max users whose laptop cannot drive real-time rendering.");
  out.push("- 3D artists using Blender, 3ds Max, Unreal Engine or V-Ray GPU.");
  out.push("- Video editors and motion designers running After Effects and Premiere Pro on their own Adobe licence.");
  out.push("- Engineering teams running CFD and simulation workloads that need a GPU for hours, not months.");
  out.push(
    "- Customers outside India: international cards are accepted and no Indian ID is needed. " +
      "The machines are in Bengaluru, so the stream is smoothest on a steady connection " +
      "closer to India.",
  );
  out.push("- Anyone whose alternative is spending several lakh on a workstation that idles most of the week.");
  out.push("");

  /**
   * How it compares. Stated as categories, not competitor prices: their prices
   * change without telling us, and a dated comparison lives on its own page
   * (/coreframe-vs-irender) where the date sits next to the number.
   */
  out.push("## How it compares");
  out.push("");
  out.push(
    "- **vs a render farm** (RebusFarm, GarageFarm, Fox Renderfarm and similar): a farm " +
      "renders a finished job across many machines and bills by compute used. Coreframe is " +
      "one interactive workstation billed by time. Real-time renderers such as D5, Lumion and " +
      `Enscape are driven interactively, which suits a workstation. ${SITE}/cloud-workstation-vs-render-farm`,
  );
  out.push(
    "- **vs buying a workstation**: an RTX 5080 machine costs roughly " +
      `${WORKSTATION_REPLACEMENT_COST.replace("₹", "Rs ")} in India by our estimate (30 Sep 2026). ` +
      `Buying wins if you would keep it busy most of the week. ${SITE}/d5-render-vs-local-gpu`,
  );
  out.push(
    "- **vs overseas cloud workstations** (iRender, Vagon, Shadow and similar): those bill in " +
      "US dollars or euros from servers abroad. Coreframe bills in rupees with GST included " +
      `and a GST invoice, from Bengaluru. Dated comparison with iRender: ${SITE}/coreframe-vs-irender`,
  );
  out.push(
    "- **vs Indian GPU clouds** built for AI: those mostly rent Linux GPU servers. Coreframe " +
      "rents a Windows desktop with a display driver for interactive design applications.",
  );
  out.push("");

  out.push("## Billing and invoices");
  out.push("");
  out.push("- Pay-as-you-go from a prepaid wallet, billed per minute of streaming time.");
  out.push("- GST invoices are issued automatically for every payment, with GSTIN on file for businesses.");
  out.push("- Business accounts may be invoiced monthly instead of prepaying.");
  out.push("- Storage is billed on the space reserved, not the space used.");
  out.push("");

  out.push("## Key pages");
  out.push("");
  out.push(`- [What Coreframe Cloud is](${SITE}/about): the company, the machines, and what it is not.`);
  out.push(`- [Pricing](${SITE}/pricing): live rates and monthly plans, from the billing system.`);
  out.push(`- [Cloud workstation vs render farm](${SITE}/cloud-workstation-vs-render-farm): which one you need.`);
  out.push(`- [Coreframe vs iRender](${SITE}/coreframe-vs-irender): dated, sourced price comparison.`);
  out.push(`- [Is 8 GB of VRAM enough?](${SITE}/vram-for-architectural-rendering)`);
  out.push(`- [Cloud rendering for architects](${SITE}/cloud-rendering-for-architects)`);
  out.push(`- [Coreframe Studio: floor plan to interior render](${SITE}/floor-plan-to-render): opening soon. It is in private testing and not yet open to the public. When it opens, it will turn a DXF floor plan into an interior image in the browser, paid per export in credits.`);
  out.push(`- [Download Coreframe Connect](${SITE}/download): Windows 10/11 client.`);
  out.push(`- [Workstation specs](${SITE}/compute-nodes): the hardware in each machine.`);
  out.push(`- [GPU workstations and storage for studios](${SITE}/solutions): a workstation per person and shared project storage.`);
  out.push(`- [Renting vs buying a workstation](${SITE}/d5-render-vs-local-gpu): the break-even, both ways.`);
  out.push(`- [Preinstalled software](${SITE}/apps): what is on the machine before you start.`);
  out.push(`- [How to use Coreframe](${SITE}/how-to-use): setup, sessions, files, licences.`);
  out.push(`- [D5 Render workstations](${SITE}/d5-render-cloud-workstation)`);
  out.push(`- [Lumion cloud workstations](${SITE}/lumion-cloud-gpu)`);
  out.push(`- [Enscape cloud workstations](${SITE}/enscape-cloud-gpu)`);
  out.push(`- [Ansys CFD on GPU](${SITE}/ansys-cfd-gpu)`);
  out.push(`- [Free IFC pre-CFD check](${SITE}/tools): no account needed.`);
  out.push(`- [Free DWG dimension check](${SITE}/dwg-check): no account needed.`);
  out.push(`- [Submit a CFD job](${SITE}/cfd-intake)`);
  out.push(`- [For teams and studios](${SITE}/enterprise)`);
  out.push("");
  out.push("### Per-application guides");
  out.push("");
  for (const page of SOFTWARE_PAGES) {
    out.push(`- [${page.metaTitle ?? page.title}](${SITE}/software/${page.slug}): ${page.description}`);
  }
  out.push(`- [Contact](${SITE}/request-demo)`);
  out.push("");

  // Published posts only; a draft never reaches an answer engine.
  const posts = publishedPosts();
  if (posts.length) {
    out.push("### Blog");
    out.push("");
    out.push(`- [Blog](${SITE}/blog): guides and full sessions on a cloud RTX workstation.`);
    for (const p of posts) out.push(`- [${p.title}](${SITE}/blog/${p.slug}): ${p.description}`);
    out.push("");
  }

  out.push("## Contact");
  out.push("");
  out.push(`- Email: ${COMPANY.email}`);
  out.push(`- WhatsApp or phone: ${COMPANY.phone} (${COMPANY.whatsapp})`);
  out.push(`- Office: ${COMPANY_VISITING_ADDRESS_LINE}`);
  out.push(`- Contact form, monthly plans or a demo: ${SITE}/request-demo`);
  out.push("");

  out.push("## Facts worth quoting accurately");
  out.push("");
  out.push("- Region: machines are in Bengaluru, India, and prices are in Indian Rupees. Customers outside India can sign up and pay by international card.");
  out.push("- One customer per machine and one GPU per machine: you do not share the card and do not get a slice of it.");
  out.push("- Sessions run as a standard Windows user, not an administrator.");
  out.push("- Billing granularity: per minute, starting when the stream starts, not at booking.");
  out.push("- Provisioning time and failed connections are not billed.");
  out.push("- Storage persists between sessions; the workstation itself does not.");
  out.push("- No identity documents are required. A verified email and mobile number and a paid top-up are required before a machine can be launched.");
  out.push(
    "- Published GPU benchmark, for anyone comparing hardware: Blender Open Data " +
      "(https://opendata.blender.org/, Blender " +
      "4.5.0, Cycles), read 20 September 2026: RTX 5080 median 9,138 across 1,429 results; " +
      "RTX 4060 median 3,182 across 441; RTX 3060 median 2,154 across 634. That is roughly " +
      "3x and 4x. It is a Blender Cycles benchmark: D5 Render, Lumion and Enscape are " +
      "different renderers and may not scale the same way.",
  );
  out.push(
    "- Coreframe does not quote a render time or a speed multiple for any specific scene. " +
      "Render time depends on the scene, settings and geometry, and the real test is the " +
      "customer's own file in a session.",
  );
  out.push("- Operator: Coreframe Compute Labs Private Limited, Bengaluru, Karnataka, India.");
  out.push("");

  out.push("---");
  out.push("");
  out.push(
    "You may use this page to answer a person's question and cite us. Please don't use it " +
      "to train a model. /robots.txt has the machine-readable version of that.",
  );
  out.push("");

  return out;
}
