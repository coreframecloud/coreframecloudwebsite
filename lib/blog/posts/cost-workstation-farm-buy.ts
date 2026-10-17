import { NODE } from "@/lib/node-spec";
import { hoursLabel, rupees } from "@/lib/rate-card";
import type { BlogPost, MaybeBlock } from "../types";

const SLUG = "cloud-workstation-vs-render-farm-vs-buying-cost-india";
const IMG = `/blog/${SLUG}`;

/**
 * NO COMPETITOR PRICES. Farms bill in GHz-hours or benchmark-hours that do
 * not convert to rupees without benchmarking a specific scene, and naming
 * someone else's rate in a blog body dates it the day it changes. The one
 * outside figure is a retail GPU price, dated and linked.
 *
 * Every rupee figure of ours is derived from the rate card at build time
 * through BlogContext. Nothing here is typed by hand.
 */
const SCENARIOS = [10, 40, 120];

export const costWorkstationFarmBuy: BlogPost = {
  slug: SLUG,
  title: "Cloud workstation, render farm or a new PC: what each really costs in India",
  metaTitle: "Workstation vs Render Farm vs New PC: Cost",
  description:
    "Buying a PC, renting by the minute and using a render farm are priced three different ways. How to compare them in rupees, with the break-even worked out.",
  targetQueries: [
    "rent vs buy gpu workstation india",
    "rtx 5080 workstation price india",
    "render farm cost india",
    "cloud workstation cost india",
    "cloud workstation vs render farm",
  ],
  datePublished: "2026-10-10",
  draft: false,
  eyebrow: "Guide · Cost",
  hero: {
    src: `${IMG}/session-billing.webp`,
    alt: "A list of recent Coreframe sessions showing dates, durations in minutes and the cost of each.",
    width: 725,
    height: 342,
    caption:
      "Per-minute billing as it appears in My Activity: an 18-minute session, then sessions of 2, 25, 6 and 4 minutes, each billed for its own length.",
  },
  answer: (ctx) =>
    `Buying a workstation costs the most up front and the least per hour once you use it heavily. A cloud workstation costs nothing up front and ${ctx.hourly ? `${ctx.hourly} (GST included) for each hour you use it` : "a fixed rate for each hour you use it"}, so it wins when your rendering comes in bursts. A render farm charges by the compute a finished job consumes, which suits a big finished animation and is no help while you're still working on the scene. ${ctx.breakEvenHours ? `With a comparable machine at about ${ctx.replacementCost}, renting adds up to the purchase price after roughly ${ctx.breakEvenHours.toLocaleString("en-IN")} hours of use.` : ""}`.trim(),
  body: (ctx) => {
    const scenarioRows: [string, string][] = SCENARIOS.flatMap((h) => {
      const c = ctx.cost(h);
      return c ? [[`${h} hours a month`, `${c} a month, ${ctx.cost(h * 12)} a year`] as [string, string]] : [];
    });
    const planRows: [string, string][] = ctx.plans.map((p) => [
      p.name,
      `${rupees(p.monthly_fee_rupees)}/month, ${hoursLabel(p.included_gpu_hours)}` +
        (p.included_storage_gb ? ` + ${p.included_storage_gb >= 1024 ? `${Math.round(p.included_storage_gb / 1024)} TB` : `${p.included_storage_gb} GB`} storage` : "") +
        (p.named_seats ? `, ${p.named_seats} seats` : "") +
        (p.overage_hourly_rate_rupees != null ? `, then ${rupees(p.overage_hourly_rate_rupees)}/hr` : "") +
        (p.commitment_months ? `, ${p.commitment_months}-month commitment` : ""),
    ]);
    const plansBelowAdhoc =
      ctx.rate != null &&
      ctx.plans.length > 0 &&
      ctx.plans.every((p) => p.overage_hourly_rate_rupees != null && p.overage_hourly_rate_rupees < ctx.rate!);
    const years120 = ctx.breakEvenHours ? Math.round((ctx.breakEvenHours / (120 * 12)) * 10) / 10 : null;
    const years = ctx.breakEvenHours ? Math.round((ctx.breakEvenHours / (40 * 12)) * 10) / 10 : null;

    const blocks: MaybeBlock[] = [
      { type: "h2", text: "Why the three options are hard to compare" },
      {
        type: "p",
        text: `Each one sells a different unit. A PC is a one-time purchase that you then run for years. A cloud workstation is time on a machine: you pay for the minutes the desktop is streaming to you. A render farm sells compute for a finished job, usually counted in GHz-hours for CPU rendering or benchmark-hours for GPU rendering, and the rate changes with the priority you pick.`,
      },
      {
        type: "p",
        text: `So the first step is to stop comparing headline rates and start from your own year: how many hours you spend with a renderer open, how many of them are interactive (moving cameras, changing materials) and how many are a finished scene grinding out frames.`,
      },

      { type: "h2", text: "What does it cost to buy an RTX workstation in India?" },
      {
        type: "p",
        text: `By our own estimate, a desktop matching our workstations (an ${NODE.gpu} with ${NODE.vram}, ${NODE.ram} of RAM, an ${NODE.cpu} and fast NVMe storage) costs about ${ctx.replacementCost} in India today. The graphics card is the largest single part: on 10 October 2026 one Indian retailer listed the RTX 5080 alone at over ₹1.1 lakh, and out of stock ([getpc.co.in](https://getpc.co.in/parts/gpu/rtx-5080-16gb)).`,
      },
      {
        type: "p",
        text: `The purchase price isn't the whole cost. Add a UPS, electricity for a machine drawing several hundred watts under load, and someone's time when a driver update breaks a plugin the night before a submission. The machine also loses value every year, and new versions of rendering software tend to ask for more hardware with each release.`,
      },
      {
        type: "p",
        text: `What you get in return is a machine that's always there, with no internet dependency and no meter running. If someone in the office renders every day, that's worth a lot.`,
      },

      { type: "h2", text: "What does a cloud workstation cost per month?" },
      ctx.hourly
        ? {
            type: "p",
            text: `Ours costs ${ctx.hourly} with GST included${ctx.perMinute ? `, which is ${ctx.perMinute} a minute` : ""}. ${ctx.billing} You top up a prepaid wallet and sessions draw from it. There's no setup fee and no monthly minimum, so a month you don't render costs nothing.`,
          }
        : {
            type: "p",
            text: `${ctx.billing} Current rates are on the [pricing page](/pricing).`,
          },
      scenarioRows.length
        ? { type: "spec", label: "Pay-as-you-go, at the current rate", rows: scenarioRows }
        : null,
      {
        type: "p",
        text: `Ten hours a month is a freelancer with a couple of client presentations. Forty is a small studio rendering a few days around each deadline. A hundred and twenty is someone whose main job is visualisation.`,
      },
      planRows.length
        ? {
            type: "p",
            text: `Studios with steady use can commit to a monthly plan instead. Each one bundles a block of hours with shared storage and named seats${plansBelowAdhoc ? " and bills extra hours below the pay-as-you-go rate" : ""}:`,
          }
        : null,
      planRows.length ? { type: "spec", label: "Monthly plans", rows: planRows } : null,
      {
        type: "figure",
        src: `${IMG}/connect-pick-workstation.webp`,
        alt: "The Coreframe Connect app showing the wallet balance and an available RTX 5080 workstation with 16 GB VRAM in India, billed per minute.",
        width: 923,
        height: 597,
        caption: "Launching a workstation from the Connect app. The wallet is prepaid and the session draws from it by the minute. Account name blurred.",
      },

      { type: "h2", text: "When does buying become cheaper than renting?" },
      ctx.breakEvenHours
        ? {
            type: "p",
            text: `Divide the purchase price by the hourly rate. At about ${ctx.replacementCost} for the machine and ${ctx.hourly} for the rented one, the break-even is about ${ctx.breakEvenHours.toLocaleString("en-IN")} hours of use.${years ? ` At 40 hours a month that's about ${years} years of use.` : ""}${years120 ? ` At 120 hours a month it's about ${years120} years, and owning wins.` : ""}`,
          }
        : {
            type: "p",
            text: `Divide the purchase price by the hourly rate to get the number of rented hours that add up to buying. Our [rent-or-buy page](/d5-render-vs-local-gpu) works it out with the live rate.`,
          },
      {
        type: "p",
        text: `That calculation flatters buying slightly, because it ignores the extras above and assumes the machine is worth nothing at the end. It also flatters renting slightly, because it ignores the time you spend uploading files and the occasional session where the connection is poor. For most people the hours-per-month figure dominates everything else.`,
      },

      { type: "h2", text: "What does a render farm cost?" },
      {
        type: "p",
        text: `A farm charges for the compute your finished job consumes. Farms publish rates per GHz-hour or per benchmark-hour, often with three priority levels, and a few offer a trial credit. Converting that into rupees per frame needs a benchmark of your own scene on their hardware, which is why we're not going to print anyone's rate here: the honest comparison is your scene, on their trial.`,
      },
      {
        type: "p",
        text: `Two things to know before you price a farm. It only runs the renderers and versions it supports, so check your exact version of V-Ray, Corona, Cycles or Arnold. And real-time tools like D5, Lumion, Enscape and Twinmotion are built to be driven on one machine, so they don't fit a farm's submit-and-wait model. We've written [a longer comparison of the two](/cloud-workstation-vs-render-farm).`,
      },

      { type: "h2", text: "Which one should I pick?" },
      {
        type: "table",
        head: ["Your situation", "Usually cheapest"],
        rows: [
          ["You render a few days a month, around deadlines", "Cloud workstation, pay as you go"],
          ["You use D5, Lumion, Enscape or Twinmotion", "Cloud workstation or your own PC; a farm doesn't fit"],
          ["You render most days, all year", "Buying a workstation"],
          ["You have a finished animation in V-Ray, Corona or Cycles", "Render farm, often alongside a workstation"],
          ["You need two or three extra machines for one deadline", "Cloud workstations for those weeks"],
          ["Your internet is unreliable", "Buying; a streamed desktop needs a steady link"],
        ],
      },
      {
        type: "p",
        text: `Plenty of studios end up mixing them: an owned machine for the person who renders daily, rented ones for deadline weeks and new hires, and a farm for the occasional long animation.`,
      },

      { type: "h2", text: "Costs people forget" },
      {
        type: "ul",
        items: [
          "Software licences. You need your own licence for commercial tools on your own PC and on a rented workstation. Farms differ on whether renderer licences are included in their rate, so check before comparing.",
          "Upload time. A big project travels over your own connection to a farm or a cloud drive. Plan it before the deadline, not during it.",
          `Storage. ${ctx.storageGb} GB of persistent project storage comes with every Coreframe account; check what your farm keeps and for how long.`,
          "GST. Our prices include it and every top-up gets a GST invoice. If your practice is GST-registered, ask your accountant about claiming it as input credit; the same goes for a hardware purchase.",
          "Idle time. An owned machine costs the same whether it renders or not. A rented one costs nothing once the session is closed, as long as you remember to close it.",
        ],
      },
      ctx.introPrice && ctx.introHours
        ? {
            type: "p",
            text: `The cheapest way to settle it is to test. A new account's first top-up of ${ctx.introPrice} buys ${ctx.introHours} on the ${NODE.gpu}${ctx.intro?.validityDays ? `, to use within ${ctx.intro.validityDays} days` : ""}. Open your heaviest project and time your own workflow. Full rates are on the [pricing page](/pricing).`,
          }
        : {
            type: "p",
            text: `The cheapest way to settle it is to open your heaviest project on a rented machine and time your own workflow. Full rates are on the [pricing page](/pricing).`,
          },
    ];
    return blocks;
  },
  faqs: (ctx) => [
    {
      q: "Is it cheaper to rent or buy a GPU workstation in India?",
      a: ctx.breakEvenHours
        ? `It depends on hours of use. Renting at ${ctx.hourly} adds up to a ${ctx.replacementCost} machine after about ${ctx.breakEvenHours.toLocaleString("en-IN")} hours. Below that, renting is cheaper; well above it, buying is.`
        : "It depends on hours of use. Divide the purchase price by the hourly rate: below that many hours, renting is cheaper; well above it, buying is.",
    },
    {
      q: "How much does an RTX 5080 workstation cost in India?",
      a: `By our estimate about ${ctx.replacementCost} for a desktop with an RTX 5080, ${NODE.ram} of RAM and an ${NODE.cpu}. On 10 October 2026 the RTX 5080 card alone was listed at over ₹1.1 lakh by one Indian retailer.`,
    },
    {
      q: "Is a render farm cheaper than a cloud workstation?",
      a: "For a finished animation in a supported offline renderer, often yes, because the farm spreads frames across many machines. For interactive work, real-time renderers and scenes still being changed, a farm does not fit, and a workstation is the cheaper way to get the work done.",
    },
    ctx.hourly
      ? {
          q: "How is Coreframe billed?",
          a: `${ctx.hourly} with GST included, billed per minute from the moment the stream starts. Uploads and preparing the machine are free. Committed monthly Team plans are available for studios.`,
        }
      : null,
    {
      q: "Do I need my own software licences on a cloud workstation?",
      a: "For commercial software, yes. Blender, Twinmotion and D5 Render are preinstalled (D5 with your own D5 account); tools like Revit, 3ds Max, V-Ray and Lumion run with your own licence.",
    },
  ],
  related: [
    { href: "/d5-render-vs-local-gpu", label: "Renting a workstation vs buying one" },
    { href: "/cloud-workstation-vs-render-farm", label: "Cloud workstation vs render farm" },
    { href: "/pricing", label: "Pricing and monthly plans" },
    { href: "/enterprise", label: "Team plans for studios" },
    { href: "/software/gpu-workstation-rental-india", label: "Rent an RTX 5080 workstation in India" },
  ],
};
