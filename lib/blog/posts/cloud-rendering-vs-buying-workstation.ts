import { NODE, replacementCostValue } from "@/lib/node-spec";
import { formatMoney } from "@/lib/money";
import { hoursLabel, rupees, type RateCardPlan } from "@/lib/rate-card";
import type { BlogContext, BlogPost, MaybeBlock } from "../types";

const SLUG = "is-cloud-rendering-cheaper-than-buying-a-workstation";
const IMG = `/blog/${SLUG}`;

/**
 * Written 19 Oct 2026 for the Search Console questions "is cloud rendering
 * cheaper than buying a render workstation", "cloud vs workstation
 * rendering", "compare prices", "pricing per month" and "gpu pay monthly"
 * (marketing-seo/gsc-questions-20261019.md).
 *
 * NOT A COPY of cost-workstation-farm-buy.ts (three-way cost, render farms)
 * or /cloud-workstation-vs-render-farm. This one is the arithmetic only: the
 * break-even as a formula the reader fills in with their OWN hardware quote,
 * what an owned hour costs at different levels of use, and when a monthly
 * plan beats pay-as-you-go. It links to the other two for the rest.
 *
 * NUMBERS. Every rate is the live rate card's, through BlogContext, in the
 * page's one currency. The only hardware figure is our own published estimate
 * (lib/node-spec.ts), labelled as ours and offered as a stand-in for the
 * reader's quote. The three-year life in the owned-hour table is an
 * assumption, stated as one; there are no utilisation statistics. No tax
 * words in the copy (owner, 19 Oct 2026: one all-in price).
 */
const HOURS = [10, 25, 40, 80, 160];
const LIFE_MONTHS = 36;

function money(ctx: BlogContext, v: number): string {
  return ctx.currency === "USD" ? formatMoney(Math.round(v * 100) / 100, "USD") : rupees(v);
}

/** A plan's monthly fee as a number in the page's currency, or null. */
function feeValue(ctx: BlogContext, p: RateCardPlan): number | null {
  const v = ctx.currency === "USD" ? p.usd_monthly_fee : p.monthly_fee_rupees;
  return v != null && v > 0 ? v : null;
}

function n(v: number): string {
  return v.toLocaleString("en-IN");
}

export const cloudRenderingVsBuyingWorkstation: BlogPost = {
  slug: SLUG,
  title: "Is cloud rendering cheaper than buying a render workstation?",
  metaTitle: "Is Cloud Rendering Cheaper? The Break-Even",
  description:
    "Yes, if you render fewer hours than the break-even (machine price ÷ hourly rate). Worked at today's rate, and when buying or a monthly plan wins instead.",
  targetQueries: [
    "is cloud rendering cheaper than buying a render workstation",
    "cloud vs workstation rendering",
    "cloud rendering cost per month",
    "gpu pay monthly",
    "compare cloud rendering prices",
  ],
  datePublished: "2026-10-19",
  dateModified: "2026-10-19",
  draft: false,
  eyebrow: "Guide · Cost",
  hero: {
    src: `${IMG}/session-billing.webp`,
    alt: "A list of recent Coreframe sessions showing dates, durations in minutes and the cost of each.",
    width: 725,
    height: 342,
    caption:
      "Sessions as they appear in My Activity, each billed for its own length in minutes. A rented machine costs nothing in the hours between them.",
  },
  answer: (ctx) => {
    const price = replacementCostValue(ctx.currency);
    const be = ctx.rate ? Math.round(price / ctx.rate) : null;
    return (
      "It depends on how many hours a month you actually render. Renting costs nothing when you're not using it and a fixed rate when you are; a workstation you buy costs the same whether it renders or not. " +
      "Divide the price of the machine you'd buy by the hourly rate: that's how many rented hours add up to buying it. " +
      (be && ctx.hourly
        ? `At ${ctx.hourly} for an ${NODE.gpu}, a ${ctx.replacementCost} machine (our own estimate for one like ours) equals about ${n(be)} rented hours. If you'd render far fewer hours than that over the machine's working life, renting is cheaper. If you'd render far more, buying is.`
        : "If you'd render far fewer hours than that over the machine's working life, renting is cheaper. If you'd render far more, buying is.")
    );
  },
  body: (ctx) => {
    const usd = ctx.currency === "USD";
    const price = replacementCostValue(ctx.currency);
    const rate = ctx.rate;

    const rentRows: string[][] = rate
      ? HOURS.map((h) => {
          const months = price / (rate * h);
          return [
            `${h} hours`,
            money(ctx, rate * h),
            months >= 120 ? "more than 10 years" : `about ${Math.round(months)} months`,
          ];
        })
      : [];

    const ownedRows: string[][] = rate
      ? HOURS.map((h) => {
          const perHour = price / (LIFE_MONTHS * h);
          return [`${h} hours`, money(ctx, perHour), perHour > rate ? "Renting" : "Owning"];
        })
      : [];

    const planRows: string[][] = rate
      ? ctx.plans.flatMap((p) => {
          const fee = feeValue(ctx, p);
          const overage = ctx.planOverage(p);
          if (fee == null) return [];
          return [[
            p.name,
            `${money(ctx, fee)} a month for ${hoursLabel(p.included_gpu_hours)}${overage ? `, then ${overage}/hr` : ""}${p.commitment_months ? `; ${p.commitment_months}-month commitment` : ""}`,
            `about ${Math.ceil(fee / rate)} hours a month`,
          ]];
        })
      : [];

    const firstPlan = ctx.plans.find((p) => feeValue(ctx, p) != null);
    const firstFee = firstPlan ? feeValue(ctx, firstPlan) : null;

    const blocks: MaybeBlock[] = [
      { type: "h2", text: "The break-even, as a formula you can fill in" },
      {
        type: "p",
        text: "Comparisons of cloud and workstation rendering usually go wrong because they compare a price with a rate. A workstation is one payment you spread over years. A cloud workstation is time: you pay for the minutes you use. To compare them you need one number from each side, in the same unit.",
      },
      {
        type: "spec",
        label: "Three sums, with your own figures",
        rows: [
          ["Break-even hours", "price of the machine ÷ hourly rate"],
          ["Months to break even", "break-even hours ÷ hours you render a month"],
          ["Cost of one owned hour", "price of the machine ÷ (months you keep it × hours a month)"],
        ],
      },
      {
        type: "p",
        text: `For the price, use a real quote for the machine you would actually buy, from your own supplier, in your own currency. The fair comparison is a desktop in the same class as the rented one: here, an ${NODE.gpu} with ${NODE.vram}, ${NODE.ram} of RAM and an ${NODE.cpu}. For the hours, count only the time the GPU is genuinely needed: rendering, real-time walkthroughs, look development. Modelling and drawings usually run fine on the computer you already have.`,
      },
      ctx.hourly
        ? {
            type: "p",
            text: `For the rate, ours is ${ctx.hourly}${ctx.perMinute ? `, or ${ctx.perMinute} a minute` : ""}, one all-in price. ${ctx.billing}`,
          }
        : { type: "p", text: `For the rate, current prices are on the [pricing page](/pricing). ${ctx.billing}` },

      { type: "h2", text: "A worked example at today's rate" },
      {
        type: "p",
        text: `The table below uses our own estimate of ${ctx.replacementCost} for a machine like ours${usd ? "" : " in India"}, because a worked example needs a number. Replace it with your quote: if your quote is lower, every figure in the last column gets shorter in proportion.`,
      },
      rentRows.length
        ? {
            type: "table",
            head: ["Hours you render a month", "Renting costs a month", `Until renting adds up to ${ctx.replacementCost}`],
            rows: rentRows,
          }
        : { type: "p", text: "The live rate could not be read just now, so the table is left out rather than filled with a figure we might not charge. The [pricing page](/pricing) has the current rate." },
      {
        type: "p",
        text: "Read across your own row. If the last column is longer than you would keep the machine before replacing it, renting is the cheaper way to get those hours. If it's much shorter, buying is.",
      },

      { type: "h2", text: "What an owned hour really costs" },
      {
        type: "p",
        text: `The same sum, turned around, gives the price of each hour you use a machine you own. It falls the more you use it. The table assumes you keep the machine for three years; change that to whatever your practice actually does.`,
      },
      ownedRows.length
        ? {
            type: "table",
            head: ["Hours you use it a month", `Each owned hour costs (${ctx.replacementCost} over 3 years)`, `Cheaper at ${ctx.hourly ?? "the rented rate"}`],
            rows: ownedRows,
          }
        : null,
      {
        type: "p",
        text: "That figure is the floor, not the full cost of owning. Add electricity (the machine's power draw under load in kilowatts × hours a month × your tariff), a UPS, repairs, and the hours someone spends on drivers and updates. Take off whatever the machine is worth when you sell it. The rented rate already includes the power, the hardware and its upkeep.",
      },

      { type: "h2", text: "Pay monthly or pay as you go?" },
      {
        type: "p",
        text: "If you'd rather budget a fixed amount each month than top up a wallet, a monthly plan is the other way to rent. Each plan bundles a block of GPU hours with shared storage and named seats. The sum is the same idea: divide the monthly fee by the pay-as-you-go rate to find the hours at which the plan starts to cost less.",
      },
      planRows.length
        ? {
            type: "table",
            head: ["Plan", "What it includes", "Cheaper than pay-as-you-go above"],
            rows: planRows,
          }
        : null,
      firstPlan && firstFee && rate
        ? {
            type: "p",
            text: `So a team that renders fewer than about ${Math.ceil(firstFee / rate)} hours a month in total is better off paying as it goes, and one that reliably renders more saves with ${firstPlan.name}${ctx.plansBelowAdhoc ? ", which also bills any hours over the allowance below the pay-as-you-go rate" : ""}. A plan is a commitment for its full term, so base the choice on your quiet months, not your busiest one. The plans are on the [pricing page](/pricing) and [Team plans](/enterprise).`,
          }
        : {
            type: "p",
            text: "Current plans and their allowances are on the [pricing page](/pricing) and [Team plans](/enterprise).",
          },

      { type: "h2", text: "How to compare cloud rendering prices fairly" },
      {
        type: "p",
        text: "Hourly rates from different providers aren't comparable until you line up what each hour buys. Before putting two prices side by side, check:",
      },
      {
        type: "ul",
        items: [
          `The GPU and its video memory. A cheaper hour on a card with less VRAM is no saving if your scene doesn't fit. Ours is an ${NODE.gpu} with ${NODE.vram}; [this guide](/vram-for-architectural-rendering) explains why the memory figure matters.`,
          "The billing unit. Per minute, per started hour or per block of hours give very different totals for short sessions.",
          "Whether the whole machine is yours, or a share of one.",
          "What the price includes: storage for your project files, setup fees and any monthly minimum.",
          "Whether you can drive the machine yourself or only submit finished jobs. A render farm prices a finished job, not an hour at a desktop, so it is a different comparison: see [cloud workstation vs render farm](/cloud-workstation-vs-render-farm).",
          "Where the machines are. Distance adds lag to a streamed desktop.",
        ],
      },

      { type: "h2", text: "When buying is the better deal, and when renting is" },
      {
        type: "table",
        head: ["Buying usually wins when", "Renting usually wins when"],
        rows: [
          ["Someone renders most days, all year", "Rendering comes in bursts around deadlines"],
          ["Your hours over the machine's life are well past the break-even", "Your hours are well below it, or you don't know yet"],
          ["Your internet connection is unreliable", "You need extra machines for a few weeks, or for new hires"],
          ["You want no running meter at all", "You'd rather not tie up the purchase price in hardware"],
        ],
      },
      {
        type: "p",
        text: "Many studios do both: an owned machine for the person who renders every day, and rented ones for deadline weeks. For the full picture with render farms added, see [what each option really costs](/blog/cloud-workstation-vs-render-farm-vs-buying-cost-india).",
      },
    ];
    return blocks;
  },
  faqs: (ctx) => {
    const price = replacementCostValue(ctx.currency);
    const be = ctx.rate ? Math.round(price / ctx.rate) : null;
    const firstPlan = ctx.plans.find((p) => feeValue(ctx, p) != null);
    const firstFee = firstPlan ? feeValue(ctx, firstPlan) : null;
    return [
      {
        q: "Is cloud rendering cheaper than buying a render workstation?",
        a: be
          ? `Below the break-even, yes. Divide the machine's price by the hourly rate: at ${ctx.hourly}, a ${ctx.replacementCost} workstation (our estimate) equals about ${n(be)} rented hours. If you'd use fewer hours than that before replacing the machine, renting costs less.`
          : "Below the break-even, yes. Divide the machine's price by the hourly rate; if you'd use fewer rented hours than that before replacing the machine, renting costs less.",
      },
      ctx.hourly
        ? {
            q: "How much does cloud rendering cost per month?",
            a: `It's your hours times the rate. At ${ctx.hourly}, 10 hours a month costs ${ctx.cost(10)} and 40 hours costs ${ctx.cost(40)}. A month you don't render costs nothing on pay-as-you-go.`,
          }
        : null,
      firstPlan && firstFee
        ? {
            q: "Can I pay monthly for a cloud GPU?",
            a:
              `Yes. Monthly plans start at ${ctx.planFee(firstPlan)} a month for ${hoursLabel(firstPlan.included_gpu_hours)} on ${firstPlan.name}` +
              (firstPlan.commitment_months ? `, with a ${firstPlan.commitment_months}-month commitment.` : ".") +
              (ctx.rate ? ` Below about ${Math.ceil(firstFee / ctx.rate)} hours a month, pay-as-you-go costs less.` : ""),
          }
        : null,
      {
        q: "How do I compare cloud rendering prices?",
        a: "Compare the same GPU and video memory, the billing unit (per minute or per hour), whether the machine is yours alone, and what the price includes. A render farm prices finished jobs, not hours at a desktop, so compare it separately.",
      },
      {
        q: "Is it worth buying a workstation if I render every day?",
        a: "Usually, yes. Daily use pushes your hours well past the break-even within the machine's life, and an owned hour gets cheaper the more you use it. Renting then makes sense for the extra machines you need at deadlines.",
      },
    ];
  },
  related: [
    { href: "/blog/cloud-workstation-vs-render-farm-vs-buying-cost-india", label: "Cloud workstation, render farm or a new PC: what each costs" },
    { href: "/cloud-workstation-vs-render-farm", label: "Cloud workstation vs render farm" },
    { href: "/d5-render-vs-local-gpu", label: "Renting a workstation vs buying one" },
    { href: "/pricing", label: "Pricing and monthly plans" },
    { href: "/enterprise", label: "Team plans for studios" },
  ],
};
