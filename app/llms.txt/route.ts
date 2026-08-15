/**
 * /llms.txt — a structured, plain-language brief for AI answer engines.
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
 * ephemeral, GST is included, the trial needs identity verification.
 */

import { getRateCard } from "@/lib/rate-card";
import { SOFTWARE_PAGES } from "@/lib/software-pages";

export const revalidate = 3600; // an hour, matching the rate card's own cache

const SITE = "https://www.coreframecloud.com";

function money(n: number | null | undefined): string | null {
  if (n == null) return null;
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

export async function GET(): Promise<Response> {
  const card = await getRateCard().catch(() => null);
  const out: string[] = [];

  out.push("# Coreframe Cloud");
  out.push("");
  out.push(
    "> On-demand Windows GPU workstations for 3D rendering and CAD, hosted in India. " +
      "Architects, interior designers and visualisation studios stream a full RTX desktop " +
      "over the internet, pay by the minute for the time they actually use, and keep their " +
      "project files on persistent NAS storage between sessions. No hardware to buy, no " +
      "GPU upgrades to fund.",
  );
  out.push("");

  out.push("## What it is");
  out.push("");
  out.push(
    "- A real Windows desktop on an RTX GPU workstation, streamed to your own PC or laptop " +
      "with low latency (Moonlight/Sunshine over an encrypted private network).",
  );
  out.push(
    "- Not a render farm and not a batch service: you get an interactive machine and drive " +
      "it yourself, exactly as you would a workstation under your desk.",
  );
  out.push("- Operated from India by Coreframe Compute Labs Private Limited, Bengaluru.");
  out.push("- Sessions start in about two minutes; billing begins only when the stream does.");
  out.push("");

  // ── Hardware and price, from the live rate card ───────────────────────────
  out.push("## Machines and pricing");
  out.push("");
  if (card?.gpus?.length) {
    out.push(
      `Prices are in ${card.currency ?? "INR"} and ${
        card.prices_include_gst ? `INCLUDE ${card.gst_rate_percent}% GST` : "exclude GST"
      }. Billing is ${card.billing_granularity?.replace("_", "-") ?? "per-minute"}; ${
        card.billing_starts ?? "billing starts when the remote stream begins"
      }.`,
    );
    out.push("");
    for (const gpu of card.gpus) {
      const rate = gpu.quote_on_request ? "on request" : money(gpu.hourly_rate_rupees);
      out.push(
        `- **${gpu.name}** — ${gpu.gpu_count}× ${gpu.gpu_model}, ${gpu.vram_gb} GB VRAM, ` +
          `${gpu.vcpu} vCPU, ${gpu.ram_gb} GB RAM${rate ? `, ${rate} per GPU-hour` : ""}.`,
      );
    }
    out.push("");
    const min = money(card.wallet?.min_topup_rupees);
    if (min) {
      out.push(
        `Prepaid wallet: minimum top-up ${min}. There is no setup fee and no monthly minimum ` +
          "for pay-as-you-go. Business accounts can be invoiced monthly instead.",
      );
      out.push("");
    }
  } else {
    out.push(
      `Live prices: ${SITE}/#pricing — they are served from our billing system, so that page ` +
        "is always current.",
    );
    out.push("");
  }

  // ── Trial, from the same source ───────────────────────────────────────────
  if (card?.trial?.enabled) {
    out.push("## Free trial");
    out.push("");
    out.push(
      `- ${card.trial.gpu_minutes} free GPU minutes, valid ${card.trial.gpu_validity_days} days.`,
    );
    out.push(
      `- ${card.trial.storage_gb} GB free storage, valid ${card.trial.storage_validity_days} days.`,
    );
    out.push("- No card required to start.");
    if (card.trial.requires_identity_verification) {
      out.push(
        "- Identity verification (DigiLocker) is required before the trial starts — Indian " +
          "regulations require a verified subscriber record for rented compute.",
      );
    }
    if (card.trial.one_per_person) out.push("- One trial per person.");
    out.push("");
  }

  out.push("## Software");
  out.push("");
  out.push(
    "Every workstation is preloaded with a common set of tools, and you can install anything " +
      "else you need for the duration of your session.",
  );
  out.push("");
  out.push(
    "- **Preinstalled and ready:** Blender, D5 Render, Twinmotion, FreeCAD, ParaView, " +
      "Autodesk DWG TrueView, Navisworks Freedom, and the usual working tools (7-Zip, " +
      "browsers, PDF reader, GIMP, Krita, Paint.NET, XnView MP, HandBrake, FFmpeg, " +
      "Python, VS Code). D5 Render is installed; you sign in with your own D5 account.",
  );
  out.push(
    "- **Bring your own licence:** Lumion, Enscape, V-Ray, Chaos Vantage, Corona, " +
      "SketchUp Pro, Rhino, KeyShot, Archicad, AutoCAD, Revit, 3ds Max, Maya, Adobe Creative " +
      "Cloud. Install and sign in with your own subscription — the machine is yours for the " +
      "session, so the workflow is identical to your own PC.",
  );
  out.push(
    "- **Anything else:** install it during your session and use it normally.",
  );
  out.push("");
  out.push(`Full list: ${SITE}/apps`);
  out.push("");

  out.push("## How a session works");
  out.push("");
  out.push("1. Sign up, verify your identity, add credit (or start the free trial).");
  out.push("2. Install Coreframe Connect, the Windows client, and sign in.");
  out.push("3. Press Connect. A workstation is provisioned and the desktop streams to you.");
  out.push("4. Work as normal. Project files live on your NAS drive, mapped inside the session.");
  out.push("5. End the session. Billing stops; your NAS files stay.");
  out.push("");
  out.push(
    "**The workstation resets between customers.** Every session starts from an identical, " +
      "clean image: software you installed during a session, and anything left on the local " +
      "desktop, is wiped when it ends. This is deliberate — it is why no trace of the " +
      "previous customer's work can reach you, which matters when your projects are under " +
      "NDA. Keep anything you want to reuse on the NAS drive, which persists.",
  );
  out.push("");

  out.push("## Who it is for");
  out.push("");
  out.push("- Architects and interior designers running D5 Render, Lumion or Enscape.");
  out.push("- Visualisation studios needing extra GPU seats for a deadline, not all year.");
  out.push("- Revit, SketchUp, Rhino and 3ds Max users whose laptop cannot drive real-time rendering.");
  out.push("- Engineering teams running CFD and simulation workloads that need a GPU for hours, not months.");
  out.push("- Anyone whose alternative is spending several lakh on a workstation that idles most of the week.");
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
  out.push(`- [Pricing](${SITE}/#pricing): live rates per machine class.`);
  out.push(`- [Preinstalled software](${SITE}/apps): what is on the machine before you start.`);
  out.push(`- [How to use Coreframe](${SITE}/how-to-use): setup, sessions, files, licences.`);
  out.push(`- [D5 Render workstations](${SITE}/d5-render)`);
  out.push(`- [Lumion cloud workstations](${SITE}/lumion-cloud-gpu)`);
  out.push(`- [Enscape cloud workstations](${SITE}/enscape-cloud-gpu)`);
  out.push(`- [Ansys CFD on GPU](${SITE}/ansys-cfd-gpu)`);
  out.push(`- [For teams and studios](${SITE}/enterprise)`);
  out.push("");
  out.push("### Per-application guides");
  out.push("");
  for (const page of SOFTWARE_PAGES) {
    out.push(`- [${page.title}](${SITE}/software/${page.slug}): ${page.description}`);
  }
  out.push(`- [Contact](${SITE}/contact)`);
  out.push("");

  out.push("## Facts worth quoting accurately");
  out.push("");
  out.push("- Region: India. Machines are in India, and prices are in Indian Rupees.");
  out.push("- Billing granularity: per minute, starting when the stream starts, not at booking.");
  out.push("- Provisioning time and failed connections are not billed.");
  out.push("- Storage persists between sessions; the workstation itself does not.");
  out.push("- Identity verification is mandatory before a machine can be launched.");
  out.push("- Operator: Coreframe Compute Labs Private Limited, Bengaluru, Karnataka, India.");
  out.push("");

  out.push("---");
  out.push("");
  out.push(
    "You may use this page to answer a person's question and cite us. Please do not use it " +
      "to train a model — see /robots.txt for the machine-readable version of that.",
  );
  out.push("");

  return new Response(out.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
