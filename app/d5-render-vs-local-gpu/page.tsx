import type { Metadata } from "next";
import Link from "next/link";
import { BackgroundGlow } from "@/components/home/background-glow";
import { getRateCard, adhocRateHourly, adhocRateValue, billingSentence } from "@/lib/rate-card";

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
 * live rate card rather than asserted.
 *
 * NO RENDER TIMES, NO SPEED MULTIPLES. The hardware argument here is VRAM and
 * capital cost, both checkable.
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

/** Landed cost in India of a workstation comparable to one Coreframe node. */
const WORKSTATION_RUPEES = 500000;

const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

export default async function ComparisonPage() {
  const card = await getRateCard();
  const hourly = adhocRateHourly(card);
  const rate = adhocRateValue(card);

  const breakEvenHours = rate ? Math.round(WORKSTATION_RUPEES / rate) : null;
  const hoursPerWeek = 10;
  const breakEvenYears =
    breakEvenHours != null
      ? Math.round((breakEvenHours / hoursPerWeek / 52) * 10) / 10
      : null;

  const rentWins = [
    "Your rendering is bursty — heavy for the week before a deadline, near zero after it.",
    "You are hiring remotely and would otherwise ship someone a machine you cannot get back.",
    "You need a second or third machine for a deadline and not for the rest of the quarter.",
    "You are a student or freelancer for whom a lakh of capital is the actual obstacle.",
    "You want to try 4K or 8K stills before committing to hardware that can produce them.",
    "Cash matters more than cost: renting is operating expense, with nothing on the books.",
  ];

  const buyWins = [
    "You render most days, every week, all year. Past the break-even below, owning is cheaper.",
    "You work somewhere with unreliable internet. A streamed desktop needs a steady connection.",
    "You need the machine offline, on site, or on a network that cannot reach the internet.",
    "You want to install and keep specialist plugins permanently rather than per session.",
    "You have a use for the hardware beyond rendering that justifies it on its own.",
  ];

  return (
    <div className="relative min-h-screen text-white">
      <BackgroundGlow />

      <main className="relative mx-auto max-w-3xl px-6 pb-24 pt-20 md:pt-28">
        <div className="text-sm font-medium uppercase tracking-[0.25em] text-cyan-300">
          Comparison
        </div>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
          Renting a cloud GPU vs buying a workstation
        </h1>

        <p className="mt-8 text-lg leading-8 text-slate-200">
          The honest answer is that it depends on how many hours a year you
          actually render, and the number where it flips is calculable. This page
          shows the arithmetic rather than asserting a conclusion, and it says
          plainly where buying is the better decision.
        </p>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold tracking-tight">
            What owning actually costs
          </h2>
          <p className="mt-4 leading-8 text-slate-300">
            A workstation that renders comfortably — an RTX-class card with 16 GB
            of VRAM, 64 GB of system memory and a CPU to match — lands at roughly{" "}
            <strong className="font-semibold text-white">
              {inr(WORKSTATION_RUPEES)}
            </strong>{" "}
            in India once GST and import costs are in. That is the number to
            compare against, and it is only the first one: the machine also
            depreciates, occupies desk space and power, and is still on the books
            if a hire does not work out or a project is cancelled.
          </p>
          <p className="mt-4 leading-8 text-slate-300">
            The part people underestimate is utilisation. Visualisation work is
            bursty by nature. A studio that renders hard for four days before a
            client presentation and barely at all for the following three weeks
            has bought a machine that is idle most of its life — and idle
            hardware still costs what it cost.
          </p>
        </section>

        {hourly && breakEvenHours != null ? (
          <section className="mt-14 rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.05] p-6">
            <h2 className="text-xl font-semibold tracking-tight">
              The break-even, in hours
            </h2>
            <p className="mt-4 leading-8 text-slate-300">
              At {hourly} including GST, {inr(WORKSTATION_RUPEES)} of hardware buys{" "}
              <strong className="font-semibold text-white">
                about {breakEvenHours.toLocaleString("en-IN")} hours
              </strong>{" "}
              of rented workstation time. At {hoursPerWeek} hours of rendering a
              week — a fair figure for a small studio — that is roughly{" "}
              <strong className="font-semibold text-white">
                {breakEvenYears} years
              </strong>{" "}
              before the purchase would have been the cheaper choice, by which
              point the card is two generations old.
            </p>
            <p className="mt-4 leading-8 text-slate-300">
              Render more than that and owning starts to win on cost. Render
              less, and you are buying idle time. Both figures are computed on
              this page from the live rate card, so you are checking the
              arithmetic against the price we actually charge.
            </p>
            <p className="mt-4 text-sm leading-7 text-slate-400">
              This is a hardware cost comparison, not financial advice, and it
              ignores tax treatment, financing and resale value — all of which
              differ by business and are worth asking your accountant about.
            </p>
          </section>
        ) : null}

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          <section className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
            <h2 className="text-lg font-semibold">Renting is the better call when</h2>
            <ul className="mt-4 space-y-3">
              {rentWins.map((p) => (
                <li key={p} className="flex gap-3 text-sm leading-7 text-slate-300">
                  <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400/70" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
            <h2 className="text-lg font-semibold">Buying is the better call when</h2>
            <ul className="mt-4 space-y-3">
              {buyWins.map((p) => (
                <li key={p} className="flex gap-3 text-sm leading-7 text-slate-300">
                  <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-white/25" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold tracking-tight">
            The comparison that is not about money
          </h2>
          <p className="mt-4 leading-8 text-slate-300">
            VRAM is the one specification worth checking before anything else,
            because it is a hard ceiling rather than a speed. Geometry, textures
            and lightmaps all have to fit on the card, and when they do not, the
            work does not get slower — it gets cut down. Many laptops and entry
            desktops sold for design work ship with 6 to 8 GB. A Coreframe node
            has 16 GB of GDDR7.
          </p>
          <p className="mt-4 leading-8 text-slate-300">
            That is the difference between quietly rendering at a lower
            resolution and delivering the 4K or 8K still the client asked for.
            We do not publish render times for either option, because they depend
            on your scene, your settings and your geometry — which is also why
            the only comparison worth trusting is the one you run yourself.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold tracking-tight">
            What renting gives up
          </h2>
          <p className="mt-4 leading-8 text-slate-300">
            Three things, stated before you sign up rather than discovered in
            week two. The machine resets to a clean image between sessions, so
            anything you install does not persist — your files do, on separate
            storage, but a specialist plugin has to be reinstalled unless you are
            on a committed plan where we build it into your baseline image. You
            need a steady internet connection, with about 25 Mbps as a working
            floor. And {billingSentence(card).charAt(0).toLowerCase()}
            {billingSentence(card).slice(1)} — which is cheap for bursty work and
            relentless if you render all day, every day.
          </p>
        </section>

        <section className="mt-14 rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.05] p-6">
          <h2 className="text-lg font-semibold">Settle it with your own file</h2>
          <p className="mt-3 leading-7 text-slate-300">
            There are free minutes on the site and no card required. Open the
            project that ties up your machine all afternoon and see how a rented
            one handles it before you decide either way.
          </p>
          <Link
            href="/signup"
            className="mt-5 inline-block rounded-lg bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-300"
          >
            Start free
          </Link>
        </section>

        <nav className="mt-14 border-t border-white/[0.08] pt-8">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-white/40">
            Related
          </h2>
          <ul className="mt-4 space-y-2">
            {[
              ["/d5-render-cloud-workstation", "D5 Render on a rented RTX 5080"],
              ["/compute-nodes", "What is in one Coreframe node"],
              ["/enterprise", "Committed monthly plans for studios"],
              ["/about", "What Coreframe Cloud is"],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="text-cyan-300 hover:underline">
                  {label} →
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </main>
    </div>
  );
}
