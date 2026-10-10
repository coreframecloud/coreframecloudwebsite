import type { Metadata } from "next";
import Link from "next/link";
import { BackgroundGlow } from "@/components/home/background-glow";
import { SpecBlock, K, B } from "@/components/home/spec-block";
import { NODE, WORKSTATION_REPLACEMENT_COST } from "@/lib/node-spec";
import {
  getRateCard,
  adhocRateHourly,
  adhocRateValue,
  billingSentence,
  getIntroOffer,
  hoursLabel,
  rupees,
} from "@/lib/rate-card";

/**
 * Renting vs buying, argued honestly and with the arithmetic shown.
 *
 * WHY THIS PAGE. The generative-engine check on 20 Sep 2026 found that the
 * queries in this space are won by comparison articles -- "best cloud rendering
 * for X", "cloud vs local GPU" -- published by vendors and ranking blogs, not by
 * the vendors being compared. Search Console has the query "cloud vs workstation
 * rendering" sitting at position 25 with nothing good to land on.
 *
 * IT HAS TO BE FAIR TO BUYING. A comparison page that finds for its own author
 * on every line is read as marketing and cited by nobody. Buying genuinely wins
 * in several cases and this page says so, with the break-even computed from the
 * live rate card rather than asserted. The section "What buying is better at"
 * is not a courtesy -- a machine you own has no per-minute cost and no network
 * dependency, and a comparison that will not say so is a strawman.
 *
 * NO RENDER TIMES, NO SPEED MULTIPLES. The hardware argument here is VRAM and
 * capital cost, both checkable.
 *
 * EVERY SPEC COMES FROM lib/node-spec AND EVERY PRICE FROM lib/rate-card.
 * The workstation figure used to be a `500000` literal in this file while
 * node-spec said six lakh -- the exact drift both modules exist to stop.
 */
export const metadata: Metadata = {
  title: "Renting a cloud GPU vs buying a workstation",
  description:
    "An honest comparison for D5 Render, Lumion and Enscape users in India: what an RTX workstation really costs to own, where renting by the minute wins, where buying wins, and the break-even in hours.",
  keywords: [
    "cloud vs workstation rendering",
    "rent GPU vs buy workstation",
    "D5 Render cloud vs local GPU",
    "cloud rendering cost India",
  ],
  alternates: { canonical: "/d5-render-vs-local-gpu" },
  openGraph: {
    title: "Renting a cloud GPU vs buying a workstation",
    description:
      "What an RTX workstation costs to own, where renting wins, where buying wins, and the break-even in hours.",
    url: "https://www.coreframecloud.com/d5-render-vs-local-gpu",
    type: "article",
  },
};

/**
 * The same figure node-spec publishes, as a number, so the arithmetic below
 * and the words above it can never disagree. Nothing is typed twice.
 */
const WORKSTATION_RUPEES = Number(WORKSTATION_REPLACEMENT_COST.replace(/[^\d]/g, ""));

/** Fixed-width padding for the monospace comparison block. */
const pad = (s: string, n: number) => s + " ".repeat(Math.max(1, n - s.length));

export default async function ComparisonPage() {
  const card = await getRateCard();
  const hourly = adhocRateHourly(card);
  const rate = adhocRateValue(card);
  const intro = getIntroOffer(card);

  const breakEvenHours = rate ? Math.round(WORKSTATION_RUPEES / rate) : null;
  const hoursPerWeek = 10;
  const breakEvenYears =
    breakEvenHours != null
      ? Math.round((breakEvenHours / hoursPerWeek / 52) * 10) / 10
      : null;

  /** label · what owning gives you · what renting gives you. Kept fair. */
  const rows: [string, string, string][] = [
    ["up-front cost", WORKSTATION_REPLACEMENT_COST, "nothing"],
    ["cost per hour", "none, it is yours", hourly ? `${hourly} incl. GST` : "on the rate card"],
    ["on the books", "an asset that depreciates", "an operating expense"],
    ["needs internet", "no", "yes, a steady link"],
    ["how you reach it", "it is on your desk", `Connect app, ${NODE.stream}`],
    ["a second machine", "buy a second one", "launch a second one"],
    ["who replaces it", "you do", "we do"],
    ["when work stops", "you still own it", "the billing stops"],
  ];

  const rentWins = [
    "Your rendering comes in bursts: heavy the week before a deadline, near zero after it.",
    "You're hiring remotely and would otherwise ship someone a machine you can't get back.",
    "You need a second or third machine for a deadline and not for the rest of the quarter.",
    "You're a student or a freelancer, and the up-front money is what's stopping you.",
    "You want to see a 4K still come out before you buy hardware that can produce one.",
    "Cash flow matters more to you than total cost. Renting is an operating expense, with nothing on the books.",
  ];

  const buyWins = [
    "You render most days, all year round. Past the break-even below, owning is cheaper.",
    "Your internet drops. A streamed desktop needs a steady link, and there's no way around that.",
    "You need the machine on site, or on an office network that cannot reach the internet.",
    "You run a specialist plugin you want installed once and still there next year.",
    "The hardware also earns its keep doing things other than rendering.",
  ];

  return (
    <div className="relative min-h-screen text-ink">
      <BackgroundGlow />

      <main className="relative">
        <section className="cf-section px-5">
          <div className="cf-col">
            <p className="cf-eyebrow mb-5">Comparison</p>
            <h1 className="cf-display">Rent a GPU, or buy the machine.</h1>
            <p className="cf-lead mt-6">
              It depends on how many hours a year you actually render, and you
              can work out where it tips. We do the arithmetic below where you
              can check it, and we say plainly where buying is the better
              decision.
            </p>
          </div>
        </section>

        <div className="cf-rule" />

        <section className="cf-section px-5">
          <div className="cf-wide">
            <SpecBlock label="The two options, side by side">
              {"  "}
              {pad("", 20)}
              {pad("a machine you own", 28)}
              <B>coreframe</B>
              {"\n\n"}
              {rows.map(([label, own, rent]) => (
                <span key={label}>
                  {"  "}
                  <K>{pad(label, 20)}</K>
                  {pad(own, 28)}
                  <B>{rent}</B>
                  {"\n"}
                </span>
              ))}
            </SpecBlock>
          </div>
        </section>

        <div className="cf-rule" />

        <section className="cf-section px-5">
          <div className="cf-col">
            <p className="cf-eyebrow mb-5">The capital</p>
            <h2 className="cf-section-title">What owning actually costs.</h2>
            <p className="cf-section-copy mt-4">
              A machine that renders the way a Coreframe node does (a{" "}
              {NODE.gpu} with {NODE.vram}, {NODE.ram} of system memory, a{" "}
              {NODE.cpu} and a {NODE.disk}) costs about{" "}
              <strong className="font-semibold text-ink">
                {WORKSTATION_REPLACEMENT_COST}
              </strong>{" "}
              in India once GST and import costs are in. And that&rsquo;s only
              the purchase. The machine depreciates, takes desk space and power,
              and stays on the books if a hire doesn&rsquo;t work out or a project
              gets cancelled.
            </p>
            <p className="cf-section-copy mt-4">
              The part studios underestimate is utilisation. You render hard for
              four days before a client presentation and barely at all for the
              three weeks after. The machine sits idle for most of its life, and
              you paid for those idle weeks up front.
            </p>
          </div>
        </section>

        {hourly && breakEvenHours != null ? (
          <section className="cf-section px-5 pt-0">
            <div className="cf-col">
              <div className="cf-note">
                <p className="cf-eyebrow mb-4">The break-even</p>
                <h2 className="cf-section-title">
                  {WORKSTATION_REPLACEMENT_COST} buys about{" "}
                  {breakEvenHours.toLocaleString("en-IN")} rented hours.
                </h2>
                <p className="cf-section-copy mt-4">
                  At {hourly} including GST, that&rsquo;s what the hardware money
                  buys in workstation time. At {hoursPerWeek} hours of
                  rendering a week, which is fair for a small studio, it takes
                  roughly{" "}
                  <strong className="font-semibold text-ink">
                    {breakEvenYears} years
                  </strong>{" "}
                  to get there, by which point the card is two generations old.
                </p>
                <p className="cf-section-copy mt-4">
                  Render more than that and owning starts to win on cost. Render
                  less and you&rsquo;re paying for idle time. Both figures are
                  worked out on this page from the live rate card, so you&rsquo;re
                  checking the arithmetic against the price we actually charge.
                </p>
                <p className="mt-4 text-sm leading-[1.62] text-ink-2">
                  This compares hardware costs and isn&rsquo;t financial advice. It
                  leaves out tax treatment, financing and resale value. Those
                  differ by business, so ask your accountant.
                </p>
              </div>
            </div>
          </section>
        ) : null}

        <div className="cf-rule" />

        <section className="cf-section px-5">
          <div className="cf-col">
            <p className="cf-eyebrow mb-5">The fair part</p>
            <h2 className="cf-section-title">What buying does better.</h2>
            <p className="cf-section-copy mt-4">
              A machine on your desk has no per-minute cost and no network
              dependency. It works on a site with no signal and on an office
              network that cannot reach the internet. You install a plugin once
              and it&rsquo;s still there next year. Nobody can change its price.
              Those are real advantages, and renting doesn&rsquo;t give you them.
            </p>
            <p className="cf-section-copy mt-4">
              So look at the two lists below and see which one sounds like your
              week.
            </p>
          </div>
        </section>

        <section className="cf-section px-5 pt-0">
          <div className="cf-wide grid grid-cols-1 gap-10 md:grid-cols-2">
            <div className="cf-card">
              <p className="cf-card-label">Rent</p>
              <h3 className="cf-section-title">Renting is the better call when.</h3>
              <ul className="mt-5 space-y-3.5">
                {rentWins.map((p) => (
                  <li key={p} className="flex gap-3 text-sm leading-[1.62] text-ink-2">
                    <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-blue" />
                    <span className="break-words">{p}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="cf-card">
              <p className="cf-card-label">Buy</p>
              <h3 className="cf-section-title">Buying is the better call when.</h3>
              <ul className="mt-5 space-y-3.5">
                {buyWins.map((p) => (
                  <li key={p} className="flex gap-3 text-sm leading-[1.62] text-ink-2">
                    <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-blue" />
                    <span className="break-words">{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <div className="cf-rule" />

        <section className="cf-section px-5">
          <div className="cf-col">
            <p className="cf-eyebrow mb-5">The specification that matters</p>
            <h2 className="cf-section-title">VRAM sets how big a scene can be.</h2>
            <p className="cf-section-copy mt-4">
              Check it before anything else. Geometry, textures and lightmaps
              have to fit on the card. When they don&rsquo;t, you have to cut the
              scene down, and the client gets a smaller image than the one they
              asked for. Plenty of laptops and entry
              desktops sold for design work ship with 6 to 8 GB. A Coreframe
              node has {NODE.vram}.
            </p>
            <p className="cf-section-copy mt-4">
              We don&rsquo;t publish render times or speed multiples for either
              option. They depend on your scene and your settings, so the only
              comparison worth trusting is the one you run on your own file.
            </p>
          </div>
        </section>

        <div className="cf-rule" />

        <section className="cf-section px-5">
          <div className="cf-col">
            <p className="cf-eyebrow mb-5">The other side of it</p>
            <h2 className="cf-section-title">What renting gives up.</h2>
            <p className="cf-section-copy mt-4">
              Three things you should know before you sign up. First, the
              workstation resets to a clean image between sessions. Your files
              persist on separate storage but software doesn&rsquo;t, so on a
              committed plan we build what you need into your baseline image.
            </p>
            <p className="cf-section-copy mt-4">
              Second, you need a steady connection. {NODE.stream} looks its best on
              about 50&nbsp;Mbps and still holds up at 35. 1080p is comfortable
              on 20. Steady matters more than fast.
            </p>
            <p className="cf-section-copy mt-4">
              Third, {billingSentence(card).charAt(0).toLowerCase()}
              {billingSentence(card).slice(1)} That&rsquo;s cheap when work comes
              in bursts, and it adds up fast if you render all day, every day.
            </p>
          </div>
        </section>

        <div className="cf-rule" />

        <section className="cf-section px-5">
          <div className="cf-col">
            <div className="cf-note">
              <p className="cf-eyebrow mb-4">Settle it yourself</p>
              <h2 className="cf-section-title">Open the file that ties up your machine.</h2>
              <p className="cf-section-copy mt-4">
                {intro
                  ? `Your first top-up of ${rupees(intro.priceRupees)} buys ${hoursLabel(intro.hours)}.`
                  : "Top up the wallet and launch one session."}{" "}
                Load the project that eats your afternoon and see how a rented
                workstation handles it before you decide either way.
              </p>
              <Link href="/signup" className="cf-btn-primary mt-6 w-full sm:w-auto min-h-[44px]">
                {intro ? "Get started" : "Create an account"}
              </Link>
            </div>
          </div>
        </section>

        <section className="cf-section px-5 pt-0">
          <div className="cf-col border-t border-rule pt-8">
            <p className="cf-eyebrow">Related</p>
            <ul className="mt-5 space-y-3">
              {[
                ["/d5-render-cloud-workstation", `D5 Render on a rented ${NODE.gpu}`],
                ["/compute-nodes", "What is in one Coreframe node"],
                ["/enterprise", "Committed monthly plans for studios"],
                ["/about", "What Coreframe Cloud is"],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="inline-flex min-h-[44px] items-center text-blue hover:underline"
                  >
                    {label} &rarr;
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
