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
  getUsdIntroOffer,
  hoursLabel,
  introMoreGpusNote,
  minFirstTopup,
  planTiers,
  billingSentence,
  noConnectMinutes,
  noConnectSentence,
  adhocRateValue,
  cheapestGpu,
  gpuSpecLine,
  ladderRanges,
  publicGpus,
  storageSpec,
  usdHourlyValue,
  type RateCard,
} from "@/lib/rate-card";
import { SOFTWARE_PAGES } from "@/lib/software-pages";
import { publishedPosts } from "@/lib/blog";
import { STREAM_BANDWIDTH } from "@/lib/streaming-terms";
import { NODE, WORKSTATION_REPLACEMENT_COST } from "@/lib/node-spec";
import { COMPANY, COMPANY_VISITING_ADDRESS_LINE } from "@/lib/company";
import { ROOMS_DELIVERS, ROOMS_VALIDATION } from "@/lib/cfd-rooms";
import { formatMoney, usdRates } from "@/lib/money";
import { CFD_EXPRESS, CFD_NORMAL_HOURS, CFD_PREPROCESS_INR } from "@/lib/cfd-prices";
import { VERIFIED, VERIFIED_INR_ALL_IN, BEND_RECORD } from "@/lib/cfd-verified";
import { HVAC_PAGE, HVAC_SERVICE, CLINIC_CASE } from "@/lib/cfd-pages";
import { FREE_PREVIEWS_PER_DAY, studioPrices } from "@/lib/studio-prices";

export const SITE = "https://www.coreframecloud.com";

/**
 * The date this brief's wording was last reviewed. A content date, not a build
 * timestamp: the route revalidates hourly, and a date that moves every hour
 * tells an answer engine nothing. Bump it whenever the text below changes.
 * Prices are not covered by it; they are read live from the rate card.
 */
export const LLMS_LAST_UPDATED = "21 October 2026";

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
    "> Three services from Bengaluru: Windows GPU workstations by the minute, CFD for " +
      "ducts and pipes from one STL, and Studio floor-plan concept images (free previews).",
  );
  out.push("");
  out.push(`Last updated: ${LLMS_LAST_UPDATED}. Prices on this page are read live from our rate card.`);
  out.push("");
  // Two currencies (owner, 15 Oct 2026). Stated once, up front, so no answer
  // quotes a rupee price to someone abroad or a dollar price to someone in India.
  const usd = usdRates(card);
  const studio = studioPrices(card);
  const usdMoney = (n: number) => formatMoney(n, "USD");
  // The dollar first-top-up offer, only while the API publishes it.
  const usdIntro = getUsdIntroOffer(card);
  out.push(
    "Currencies: accounts in India pay in Indian rupees with 18% GST included (unless a price says + GST); " +
      "accounts outside India pay in US dollars with no GST (export of services). The currency is fixed at sign-up " +
      "by the billing country. Prices below give both.",
  );
  out.push("");

  // The two "in one paragraph" blocks (SEO review 18 Oct 2026, 4): the
  // newest services, stated whole so an engine can lift either one.
  out.push("## CFD in one paragraph");
  out.push("");
  out.push(
    `Coreframe CFD (${SITE}/cfd) calculates the pressure drop and loss coefficient of a duct or pipe fitting ` +
      "(bends, reducers, transitions, valves, manifolds) from one closed STL of the fluid volume, with no CFD licence. " +
      `Pre-processing and a mesh check cost ${formatMoney(CFD_PREPROCESS_INR.small, "INR")} in India or ` +
      `${usdMoney(usd.cfd_quote_fee_small)} elsewhere for most models (${formatMoney(CFD_PREPROCESS_INR.large, "INR")} / ` +
      `${usdMoney(usd.cfd_quote_fee_large)} over 5 million cells); you then get a quote by email with three packages. ` +
      "Draft (cheaper, for comparing design options early) and Standard (the number you put in a client report) run one " +
      "wall-resolved, quality-checked mesh (Standard holds the pressure to a tighter convergence target) and are priced on the quote. Verified is a mesh-independence study, three meshes and the " +
      `grid convergence index, from ${formatMoney(VERIFIED_INR_ALL_IN.from, "INR")} in India or from ${usdMoney(VERIFIED.fromUsd)} elsewhere. ` +
      `Results come within ${CFD_NORMAL_HOURS} hours of payment, or in ${CFD_EXPRESS.hours} hours with Express at ` +
      `${CFD_EXPRESS.multiple}x the package price where the quote offers it (Draft and Standard only). You get a PDF ` +
      "report, a 3D results viewer and the case data files. Our live Verified example (17 Oct 2026): a 90° bend gave " +
      `${BEND_RECORD.meshes.map((m) => m.dp.toFixed(3)).join(" / ")} Pa on three meshes, reported as ` +
      `"${BEND_RECORD.verdict}". Rooms and HVAC airflow (steady) is a separate live job type: describe one box room and get ` +
      `${ROOMS_DELIVERS} (${SITE}${HVAC_PAGE.path}).`,
  );
  out.push("");
  out.push("## Studio in one paragraph");
  out.push("");
  out.push(
    `Coreframe Studio (${SITE}/floor-plan-to-render; app at ${SITE}/studio) turns a 2D DXF floor plan into ` +
      "interior concept renders in the browser. It reads walls, doors and windows from the drawing, you pick a room " +
      `and a camera, and it generates furnished concept images. Previews are free (${FREE_PREVIEWS_PER_DAY} a day), then ` +
      `${formatMoney(studio.inr.extraPreview, "INR")} each; an edit is ${formatMoney(studio.inr.edit, "INR")}, a 2K download ` +
      `${formatMoney(studio.inr.k2, "INR")} and a 4K download ${formatMoney(studio.inr.k4, "INR")}, GST included. Outside ` +
      `India: extra preview ${usdMoney(studio.usd.extraPreview)}, edit ${usdMoney(studio.usd.edit)}, 2K ` +
      `${usdMoney(studio.usd.k2)}, 4K ${usdMoney(studio.usd.k4)}, no GST. DXF only (no PDF, image or DWG plans yet). ` +
      "The output is concept visuals for pitching a project, not construction drawings or a 3D model.",
  );
  out.push("");

  /**
   * Answer-first, for retrieval. An assistant asked one of these questions
   * should be able to lift the answer from a single line, with the price
   * coming from the rate card and nothing else on this page contradicting it.
   */
  // The GPU ladder (owner, 21 Oct 2026): the "from" price is the cheapest
  // public GPU's, in each currency; every GPU's own rates are listed below.
  const adhocGpu = cheapestGpu(card);
  const ladder = ladderRanges(card);
  const from = ladder && ladder.count > 1 ? "from " : "";
  const usdFrom = adhocRateValue(card, "USD");
  const introQ = getIntroOffer(card);
  out.push("## Short answers");
  out.push("");
  out.push(
    "- **What is Coreframe Cloud?** A Bengaluru company with three services: (1) GPU " +
      "workstations, a whole Windows GPU workstation rented by the minute and streamed " +
      "to your own computer through the Coreframe Connect app; (2) CFD for ducts and pipes, " +
      "an automatic CFD service where you upload one STL and get a quote by email; " +
      "(3) Coreframe Studio, pre-sale concept images from a DXF floor plan (open; free previews). " +
      "Operated by Coreframe Compute Labs Private Limited, Bengaluru.",
  );
  out.push(
    `- **Can Coreframe run CFD for me?** Yes, for ducts and pipes (${SITE}/cfd). ` +
      "Upload one closed STL of the fluid volume; " +
      `pre-processing / mesh check is Rs ${CFD_PREPROCESS_INR.small} for most duct and pipe models (Rs ${CFD_PREPROCESS_INR.large.toLocaleString("en-IN")} for very large models over 5 million cells; outside India ${usdMoney(usd.cfd_quote_fee_small)} / ${usdMoney(usd.cfd_quote_fee_large)}); we mesh it ` +
      "and email a quote; accept it and get pressure drop, loss coefficient, a PDF report, a " +
      "3D viewer and the case data files, within 24 hours (Express: 1–2 hours at 3x, where offered). No CFD licence needed. It needs a Coreframe account " +
      "(the same account and wallet as GPU workstations and Studio). Rooms and HVAC airflow (steady analysis) is also live: " +
      "describe one box-shaped room, its diffusers, returns and heat loads, and get room averages (mean air speed, PMV/PPD, ADPI) " +
      `and temperature and air-speed maps in a PDF report. ${ROOMS_VALIDATION}`,
  );
  out.push(
    `- **Does Coreframe do mesh independence (grid independence) studies?** Yes: the Verified package, a ` +
      `mesh-independence study with the grid convergence index (${SITE}/cfd/mesh-independence-study). ` +
      "The same internal-flow case (pipes, ducts, fittings, manifolds; quoted meshes up to about 6 million cells) " +
      "is solved on three meshes with a refinement ratio of 1.3; the GCI follows Celik et al. (2008) with a safety " +
      "factor of 1.25, and oscillating results are judged on 1.25 x half their spread (Stern et al. 2001). The report " +
      "states, e.g., \"Mesh-independent: static pressure drop = 12.30 Pa ± 0.13 % (fine mesh)\". Results within " +
      `24 hours (no express). From Rs ${VERIFIED_INR_ALL_IN.from.toLocaleString("en-IN")} in India (about Rs ${VERIFIED_INR_ALL_IN.at2M.toLocaleString("en-IN")} at 2 million cells), from ${usdMoney(VERIFIED.fromUsd)} outside ` +
      "India, plus pre-processing / mesh check. A GCI study is verification, not validation: " +
      "mesh-independent means the mesh error is small; it does not mean the result matches experiments.",
  );
  out.push(
    `- **What is Coreframe Studio?** A browser app (${SITE}/studio; overview at ${SITE}/floor-plan-to-render). ` +
      "It turns a 2D DXF floor plan into generated interior concept images, " +
      `for interior designers pitching a project. Up to ${FREE_PREVIEWS_PER_DAY} previews a day are free, then ₹${studio.inr.extraPreview} each; a 2K download is ₹${studio.inr.k2} ` +
      `(${usdMoney(studio.usd.k2)} outside India).`,
  );
  out.push(
    "- **Can I run D5 Render, Lumion or Enscape on it?** Yes. D5 Render, Twinmotion, " +
      "Blender and Unreal Engine are preinstalled; Lumion, Enscape and other licensed " +
      "applications run on your own licence. It is the full desktop application, not a " +
      "web viewer.",
  );
  if (adhocGpu?.hourly_rate_rupees != null) {
    out.push(
      `- **How much does it cost to rent a GPU workstation?** ${from}${money(adhocGpu.hourly_rate_rupees)} ` +
        `per hour${card?.prices_include_gst ? " including GST" : ""} in India${usdFrom != null ? `, or ${from}${usdMoney(usdFrom)} per hour ` +
        "with no GST for accounts outside India" : ""}, billed per minute of ` +
        `streaming${ladder && ladder.count > 1 ? ` (${ladder.gpu}; each GPU's own rate is under "Machines and pricing")` : ""}. Team plans (monthly, for studios and firms) are listed below.` +
        (introQ
          ? ` New customers: the first top-up of ${money(introQ.price)} buys ` +
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
      introQ && introQ.price === firstTopup
        ? `, which buys ${hoursLabel(introQ.hours)}${introQ.gpuName ? ` of ${introQ.gpuName}` : ""}${introMoreGpusNote(introQ)}` +
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

  out.push("## The three services");
  out.push("");
  out.push(`1. **GPU workstations** (live): ${SITE}/pricing. Most of this page is about them.`);
  out.push(`2. **CFD for ducts and pipes** (live, launched 13 October 2026): ${SITE}/cfd. Rooms and HVAC airflow: ${SITE}${HVAC_PAGE.path}.`);
  out.push(`3. **Coreframe Studio**: ${SITE}/floor-plan-to-render (app at ${SITE}/studio).`);
  out.push("");
  out.push("## GPU workstations: what it is");
  out.push("");
  out.push(
    "- A real Windows desktop on an RTX GPU workstation, streamed to your own PC or laptop " +
      "with low latency by the Coreframe Connect app, over an encrypted private network.",
  );
  out.push(
    "- It isn't a render farm or a batch service. You get an interactive machine and drive " +
      "it yourself, the way you would a workstation under your desk.",
  );
  out.push("- Operated from India by Coreframe Compute Labs Private Limited, Bengaluru.");
  out.push("- Sessions start in about two minutes; billing starts when you connect.");
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
    "A workstation-class GPU with 16 GB or more of VRAM is not a card most design studios in India own. By our " +
      "own estimate of Indian hardware prices (last checked 30 September 2026), a workstation " +
      `built around our base node's ${NODE.gpu} costs roughly ${WORKSTATION_REPLACEMENT_COST.replace("₹", "Rs ")} to buy, and the machines people ` +
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
      }.${noConnectSentence(card) ? ` ${noConnectSentence(card)}` : ""} If a connection fails on our side, nothing is charged.`,
    );
    out.push("");
    // The public ladder, cheapest first, each GPU with its own rupee and
    // dollar rate (owner, 21 Oct 2026). Only what the card publishes.
    for (const gpu of publicGpus(card)) {
      const rate = gpu.quote_on_request ? "on request" : money(gpu.hourly_rate_rupees);
      const usdRate = usdHourlyValue(gpu, card);
      out.push(
        `- **${gpu.name}**: ${gpu.gpu_count}× ${gpu.gpu_model}, ${gpuSpecLine(gpu)}, ${storageSpec(gpu.storage_gb)} NVMe` +
          `${rate ? `, ${rate} per GPU-hour in India` : ""}${usdRate != null ? ` (${usdMoney(usdRate)} per GPU-hour outside India, no GST)` : ""}.`,
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
      out.push("Team plans, monthly for studios and firms (committed; prices include GST):");
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
    out.push(
      `Outside India the same machines are ${from}${usdMoney(usdFrom ?? usd.gpu_hourly)} per GPU-hour with no GST (each GPU's dollar rate is listed above), the first top-up is from ` +
        `${usdMoney(usd.topup_min_first)}, and team plans are priced in US dollars` +
        (tiers.length && tiers[0].usd_monthly_fee ? ` (from ${usdMoney(tiers[0].usd_monthly_fee)} a month)` : "") +
        "." +
        (usdIntro
          ? ` New accounts outside India: the first top-up of ${usdMoney(usdIntro.price)} buys ${hoursLabel(usdIntro.hours)}` +
            `${usdIntro.gpuName ? ` of ${usdIntro.gpuName}` : ""}${introMoreGpusNote(usdIntro)}, no GST.`
          : " The rupee intro offer is for accounts in India."),
    );
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
    "- Payment by card, UPI or netbanking through Razorpay. International cards are accepted. " +
      `Accounts outside India are billed in US dollars (${from}${usdMoney(usdFrom ?? usd.gpu_hourly)} per GPU-hour, first top-up from ` +
      `${usdMoney(usd.topup_min_first)}, no GST); accounts in India in rupees with GST.`,
  );
  const intro = getIntroOffer(card);
  if (intro) {
    out.push(
      `- Intro offer: the first top-up of ${money(intro.price)} buys ${hoursLabel(intro.hours)}` +
        `${intro.gpuName ? ` of ${intro.gpuName}` : ""}${introMoreGpusNote(intro)}` +
        `${intro.validityDays ? `, to be used within ${intro.validityDays} days` : ""}` +
        `${intro.onePerCustomer ? ", one per customer" : ""}.`,
    );
  }
  if (usdIntro) {
    out.push(
      `- Intro offer outside India: the first top-up of ${usdMoney(usdIntro.price)} buys ${hoursLabel(usdIntro.hours)}` +
        `${usdIntro.gpuName ? ` of ${usdIntro.gpuName}` : ""}${introMoreGpusNote(usdIntro)}, no GST` +
        `${usdIntro.validityDays ? `, to be used within ${usdIntro.validityDays} days` : ""}, one per customer.`,
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
    "- **vs buying a workstation**: a machine built around our base node's RTX 5080 costs roughly " +
      `${WORKSTATION_REPLACEMENT_COST.replace("₹", "Rs ")} in India by our estimate (30 Sep 2026). ` +
      `Buying wins if you would keep it busy most of the week. ${SITE}/d5-render-vs-local-gpu`,
  );
  out.push(
    "- **vs overseas cloud workstations** (iRender, Vagon, Shadow and similar): those bill in " +
      "US dollars or euros from servers abroad. Coreframe bills Indian customers in rupees with GST included " +
      "and a GST invoice, and customers abroad in US dollars, from Bengaluru. " +
      `Dated comparison with iRender: ${SITE}/coreframe-vs-irender`,
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
  out.push(`- [Architectural visualization](${SITE}/architectural-visualization): the hub for archviz on one Windows GPU workstation, grouped by job: real-time walkthroughs (D5 Render, Lumion, Enscape, Twinmotion, Unreal Engine), path-traced stills (V-Ray, 3ds Max, Blender), modelling and BIM (Revit, SketchUp, Rhino), and interiors from a floor plan (Coreframe Studio). D5 Render, Twinmotion, Unreal Engine and Blender are preinstalled; the rest run on your own licence.`);
  out.push(`- [Video and animation rendering](${SITE}/video-animation-rendering): After Effects, Premiere Pro and Media Encoder on your own Adobe account, Blender animation (preinstalled, Cycles with OptiX on one GPU, FFmpeg and HandBrake for image sequences), and walkthroughs from D5 Render, Lumion, Twinmotion and Unreal, on one Windows GPU workstation billed per minute; what to plan for (uploading footage, colour over the stream, fonts and caches) and where a render farm fits better.`);
  out.push(`- [Coreframe Studio: floor plan to interior render](${SITE}/floor-plan-to-render): turns a DXF floor plan into interior concept images in the browser, at ${SITE}/studio with a Coreframe account. Previews are free (up to 5 a day), then ₹10 each; edits ₹20, 2K download ₹30, 4K ₹50, GST included, from the Coreframe wallet. DXF only (no PDF, image or DWG plans yet).`);
  out.push(`- [Download Coreframe Connect](${SITE}/download): Windows 10/11 client.`);
  out.push(`- [Workstation specs](${SITE}/compute-nodes): the hardware in each machine.`);
  out.push(`- [GPU workstations and storage for studios](${SITE}/solutions): a workstation per person and shared project storage.`);
  out.push(`- [Renting vs buying a workstation](${SITE}/d5-render-vs-local-gpu): the break-even, both ways.`);
  out.push(`- [Preinstalled software](${SITE}/apps): what is on the machine before you start.`);
  out.push(`- [How to use Coreframe](${SITE}/how-to-use): setup, sessions, files, licences.`);
  out.push(`- [D5 Render workstations](${SITE}/d5-render-cloud-workstation)`);
  out.push(`- [Lumion cloud workstations](${SITE}/lumion-cloud-gpu)`);
  out.push(`- [Enscape cloud workstations](${SITE}/enscape-cloud-gpu)`);
  out.push(`- [Free IFC pre-CFD check](${SITE}/tools): no account needed.`);
  out.push(`- [Free DWG dimension check](${SITE}/dwg-check): no account needed.`);
  out.push(`- [CFD for ducts and pipes](${SITE}/cfd): a managed, automatic CFD service. Upload one closed STL of the fluid volume; the geometry is checked automatically, pre-processing / mesh check is Rs ${CFD_PREPROCESS_INR.small} for most duct and pipe models (Rs ${CFD_PREPROCESS_INR.large.toLocaleString("en-IN")} for very large models over 5 million cells; ${usdMoney(usd.cfd_quote_fee_small)} / ${usdMoney(usd.cfd_quote_fee_large)} outside India), from the Coreframe wallet: a wall-resolved mesh is built and quality-checked on our machine, and a mesh report and quote are emailed. Accept it and get a PDF report with pressure drop and loss coefficient, a 3D results viewer and the data files. No CFD licence needed.`);
  out.push(`- [CFD for rooms and HVAC airflow](${SITE}/cfd): steady analysis of one box-shaped room you describe (size, supply diffusers, returns, heat loads; no geometry file). Delivers room averages (mean air speed, PMV/PPD, ADPI) and temperature and air-speed maps in a PDF report. Two mesh choices: Draft (a medium mesh) for early design comparisons, Fine for final numbers; the quote and report state which was used. ${ROOMS_VALIDATION}`);
  out.push(`- [Mesh independence study (GCI), the Verified package](${SITE}/cfd/mesh-independence-study): the same duct or pipe case on three meshes (refinement ratio 1.3) with the grid convergence index (Celik et al. 2008, Fs 1.25). Our own live Verified run (17 Oct 2026): a 90° bend (R/D 1.5, air at 4 m/s, D 50 mm) gave 12.234 / 12.292 / 12.297 Pa on 0.25 / 0.54 / 1.21 M cells: mesh-independent, 12.30 Pa ± 0.13 %, where the band is the solver's own iteration-to-iteration change, larger than the GCI (0.08 %). A straight pipe, 72 diameters long, was mesh-independent within 0.63 %, yet its friction factor sat 4.8 % below the Haaland correlation: a turbulence-model gap that verification cannot show. From Rs ${VERIFIED_INR_ALL_IN.from.toLocaleString("en-IN")} in India, from ${usdMoney(VERIFIED.fromUsd)} elsewhere; internal flow up to about 6 M cells; within 24 hours.`);
  out.push(`- [HVAC CFD on a real clinic floor](${SITE}${CLINIC_CASE.path}): case study. An indicative, automated first-pass airflow run on the second floor of a real two-storey clinic (buildingSMART Medical-Dental Clinic, CC BY 4.0): 18,500 sq ft, 100 rooms and corridors, 90 real ceiling diffusers at their design flows, 80 return/exhaust grilles; 1.9 M cells, 3,000 iterations, 5.1 hours. Occupied rooms averaged 23.0 °C, ADPI (ASHRAE 113) 93 % with 56 of 59 rooms at 80 % or more, PMV (ISO 7730) -0.28; 15 % of the floor area had air above 0.25 m/s at ankle height, because in the small 3 x 3.5 m treatment rooms the ceiling jets hit the wall, drop and run back across the floor. Not a validated or engineering-grade result: an indicative whole-floor run, not the single-room Rooms / HVAC service.`);
  out.push(`- [HVAC simulation service](${SITE}${HVAC_SERVICE.path}): who the Rooms / HVAC steady service is for (HVAC and MEP consultants, architects, contractors, building owners), what to have ready, Draft or Fine mesh, the pre-processing / mesh check fee, the quote, results within 24 hours of payment, and its limits (one box-shaped room, steady analysis, radiation not modelled).`);
  out.push(`- [Room airflow CFD for HVAC](${SITE}${HVAC_PAGE.path}): the Rooms / HVAC steady service on its own page: inputs (one box room 1-100 m long and wide, 2-20 m high, up to 12 supply diffusers and 12 returns, heat loads, clothing and activity), outputs (${ROOMS_DELIVERS}), Draft or Fine mesh, and what ADPI does and does not tell you.`);
  out.push(`- [3BHK floor plan to 3D render: a worked example](${SITE}/floor-plan-to-render/3bhk-example): Studio on our sample 3BHK plan, step by step, with the cost of each step.`);
  out.push(`- [Team plans for studios and firms](${SITE}/enterprise): monthly plans with a shared pool of GPU workstation hours, shared storage, a login per person and one invoice; in rupees with GST in India, in US dollars elsewhere.`);
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
  out.push("- Region: machines are in Bengaluru, India. Accounts in India pay in Indian rupees with GST included; accounts outside India pay in US dollars with no GST, by international card.");
  out.push("- One customer per machine and one GPU per machine: you do not share the card and do not get a slice of it. The GPUs on offer are the ones listed under \"Machines and pricing\" above, read from the rate card; a GPU not listed there is not on sale.");
  out.push("- Sessions run as a standard Windows user, not an administrator.");
  out.push("- Billing granularity: per minute, starting when you connect (the stream starts), not at booking.");
  out.push(
    `- If you don't connect within ${noConnectMinutes(card) ?? 10} minutes of your workstation being ready, it shuts down and those minutes are charged. If a connection fails on our side, nothing is charged. Preparing the workstation is free.`,
  );
  out.push("- Storage persists between sessions; the workstation itself does not.");
  out.push("- No identity documents are required. A verified email and mobile number and a paid top-up are required before a machine can be launched.");
  out.push(
    "- Published GPU benchmark, for anyone comparing hardware: Blender Open Data " +
      "(https://opendata.blender.org/, Blender " +
      "4.5.0, Cycles), read 20 September 2026: RTX 5080 (our base node) median 9,138 across 1,429 results; " +
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
    "You may use this page to answer a person's question and cite us. /robots.txt has our " +
      "machine-readable crawl rules.",
  );
  out.push("");

  return out;
}
