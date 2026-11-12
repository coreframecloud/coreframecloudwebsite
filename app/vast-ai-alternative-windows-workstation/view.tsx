import type { Metadata } from "next";
import Link from "next/link";
import type { Currency } from "@/lib/money";
import { PageByline } from "@/components/seo/page-byline";
import { Fold } from "@/components/visuals/fold";
import { BackgroundGlow } from "@/components/home/background-glow";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbList, faqPage, OG_IMAGE } from "@/lib/seo";
import { getRateCard, adhocRateHourly, billingSentence, ladderRanges } from "@/lib/rate-card";

/**
 * "Vast.ai alternative for Windows design work" (AEO plan 1 Nov 2026, A6;
 * owner approved naming Vast.ai).
 *
 * WHY. Asked for "ready-to-use Windows cloud workstations", Gemini answered
 * with Vast.ai. Vast.ai is a good product for a different job: a GPU
 * marketplace where you rent Linux containers or VMs and set them up
 * yourself. This page says what each one is, row by row, so an engine can
 * quote the difference.
 *
 * FAIR AND DATED. Every Vast.ai fact below was read on their own site and
 * docs (vast.ai, docs.vast.ai) on VAST_CHECKED; re-read them before
 * editing a row, and bump the date. No Vast.ai prices are quoted (they vary
 * by host and move hourly), no speed claims, and the page says plainly when
 * Vast.ai is the better choice. Our own price comes from the live rate card
 * in the page's currency, or is not shown.
 */
const VAST_CHECKED = "1 November 2026";
const PAGE_PATH = "/vast-ai-alternative-windows-workstation";
const LINK = "text-blue underline underline-offset-4";

export function vastAlternativeMetadata(): Metadata {
  // No price in this metadata: the same for both currency copies.
  return {
    title: { absolute: "Vast.ai Alternative for Windows Design Work | Coreframe" },
    // Description rewrite 9 Nov 2026 (AEO week): "vast.ai alternatives" at
    // 27.5. The title stays (first judged on 24 Nov); the plural phrase goes in
    // the description, a new H2 and an FAQ.
    description:
      "Vast.ai alternatives by job: for Revit, D5 or Blender, a Windows desktop with a GPU and the software installed, billed per minute. For AI, other GPU clouds.",
    keywords: [
      "Vast.ai alternative",
      "Vast.ai alternatives",
      "Vast.ai alternative Windows",
      "Windows cloud workstation",
      "ready-to-use Windows cloud workstation",
      "cloud workstation for Revit",
      "cloud workstation for 3ds Max",
    ],
    alternates: { canonical: PAGE_PATH },
    openGraph: {
      images: [OG_IMAGE],
      title: "A Vast.ai alternative for Windows design work",
      description:
        "A GPU marketplace for Linux and AI next to a ready-to-work Windows desktop: operating system, access, software, files, billing and data location.",
      url: `https://www.coreframecloud.com${PAGE_PATH}`,
      type: "article",
    },
  };
}

export default async function VastAlternativeView({ currency }: { currency: Currency }) {
  const card = await getRateCard();
  const hourly = adhocRateHourly(card, currency);
  const ladder = ladderRanges(card);
  const usdView = currency === "USD";
  const tax = usdView ? "with no GST" : "including GST";
  const billing = billingSentence(card, currency);
  const from = ladder && ladder.count > 1 ? "from " : "";

  /** [row, Coreframe, Vast.ai] */
  const rows: [string, string, string][] = [
    [
      "What it is",
      "A ready-to-work cloud virtual workstation: a full Windows desktop with a dedicated NVIDIA RTX GPU",
      "A GPU cloud marketplace: capacity comes from many hosts, from community providers to data centres",
    ],
    [
      "Operating system",
      "Windows, set up and maintained for you",
      "Linux: Docker containers by default, or virtual machines from Ubuntu templates",
    ],
    [
      "How you connect",
      "The Coreframe Connect app for Windows or Mac streams the desktop; four clicks to launch",
      "SSH, Jupyter or a custom entrypoint (virtual machines by SSH)",
    ],
    [
      "Software",
      "D5 Render, Twinmotion, Unreal Engine and Blender preinstalled; Revit, 3ds Max, SketchUp Pro, Lumion and Enscape on your own licence",
      "The image or template you pick; you install and configure the rest",
    ],
    [
      "Your files",
      "Kept on your project drive between sessions; an optional persistent workstation keeps your own Windows disk",
      "Container storage and persistent volumes; storage is charged while an instance is stopped",
    ],
    [
      "Billing",
      usdView
        ? "Per minute from when you connect, from a prepaid wallet in US dollars; preparing the workstation is free"
        : "Per minute from when you connect, from a prepaid wallet with a GST invoice on every top-up; preparing the workstation is free",
      "Per second while an instance runs, from prepaid credits; storage and data transfer are billed separately",
    ],
    [
      "Where it runs",
      "A Tier III data centre in India; all customer data stays in India",
      "Depends on the host you pick",
    ],
    [
      "Built for",
      "Architects, interior designers, 3D artists and engineers who open design software and work in it",
      "AI training, inference and development, containers and scripted jobs",
    ],
  ];

  /** "Vast.ai alternatives" (new search, week to 6 Nov 2026): by job, no prices, no rankings. */
  const alternatives: { need: string; pick: string; href?: string; link?: string }[] = [
    {
      need: "You open design software and work in it (Revit, 3ds Max, SketchUp, D5, Lumion, Blender):",
      pick: "a ready-to-work cloud virtual workstation, a Windows desktop with the GPU, drivers and applications already there.",
      href: "/pricing",
      link: "Coreframe's GPUs and prices",
    },
    {
      need: "You want a multi-GPU Windows box and will set it up yourself:",
      pick: "a remote GPU server reached by remote desktop.",
      href: "/coreframe-vs-irender",
      link: "iRender compared",
    },
    {
      need: "You have a finished animation to render:",
      pick: "a render farm, which renders the frames across many machines.",
      href: "/cloud-workstation-vs-render-farm",
      link: "Workstation or farm?",
    },
    {
      need: "You train or serve AI models over SSH or Jupyter:",
      pick: "another GPU cloud built for AI, such as RunPod, or a large cloud provider's GPU instances. For that job Vast.ai itself is a good fit.",
    },
  ];

  const faqs: { q: string; a: string }[] = [
    {
      q: "What are the best Vast.ai alternatives?",
      a: "It depends on the job. For Windows design work (Revit, 3ds Max, D5 Render, Lumion, Blender), a ready-to-work cloud virtual workstation such as Coreframe: a Windows desktop with a GPU and the software installed, billed per minute. For finished animations, a render farm. For AI training and containers, another GPU cloud built for AI, such as RunPod.",
    },
    {
      q: "Is Coreframe a Vast.ai alternative?",
      a: "For Windows design work, yes. Vast.ai rents GPU containers and virtual machines, mostly Linux, that you reach by SSH or Jupyter and set up yourself. Coreframe rents a ready-to-work Windows desktop with a dedicated NVIDIA RTX GPU and design software installed, streamed to your own PC through the Coreframe Connect app. For AI training and containers, Vast.ai is the better fit.",
    },
    {
      q: "Can I run Revit, 3ds Max or SketchUp on Vast.ai?",
      a: "Those are Windows applications. Vast.ai's documented images are Linux containers and Ubuntu virtual machines, so you would have to find or build a Windows setup and a remote desktop yourself. On Coreframe they run on a standard Windows desktop with your own licence, signed in as on a new PC.",
    },
    {
      q: "Which is cheaper?",
      a:
        "It depends on the job. Vast.ai prices vary by host and GPU and are often low for headless compute. Coreframe charges " +
        (hourly ? `${from}${hourly} ${tax}, ` : "") +
        "per minute from when you connect, with the desktop, drivers and design software included, so no hours go on setting up a machine. Compare the hours you would spend installing and configuring as well as the hourly rate.",
    },
    {
      q: "Where is my data on Coreframe?",
      a: "In India. Coreframe's GPU workstations are hosted in a Tier III data centre in India, and all infrastructure and customer data stay in India. Customers anywhere in the world use the same workstations.",
    },
    {
      q: "Do I need a Linux or command-line background to use Coreframe?",
      a: "No. You install the Coreframe Connect app for Windows or Mac, sign in, pick a GPU and launch. The desktop appears in about two minutes. There is no SSH, no terminal and no image to build.",
    },
  ];

  return (
    <div className="relative min-h-screen text-ink">
      <BackgroundGlow />
      <JsonLd data={faqPage(faqs)} />
      <JsonLd data={breadcrumbList([{ name: "Vast.ai alternative for Windows design work", path: PAGE_PATH }])} />

      <section className="cf-section cf-pagehero px-5">
        <div className="cf-col">
          <p className="cf-eyebrow mb-5">Comparison · Vast.ai alternative</p>
          <h1 className="cf-display">A Vast.ai alternative for Windows design work.</h1>
          <p className="cf-lead mt-[22px]">
            Vast.ai rents GPU containers and virtual machines, mostly Linux, that you reach by SSH and set up yourself.
            Coreframe rents a <em>ready-to-work Windows desktop</em> with a dedicated RTX GPU and your design software
            installed: you open D5, Revit or Blender and work.
          </p>
          <PageByline path={PAGE_PATH} className="mt-4 opacity-75" />
        </div>
      </section>

      <main className="relative cf-section px-5">
        <div className="cf-col">
          <section>
            <h2 className="cf-section-title">The short answer.</h2>
            <p className="mt-4 leading-8 text-ink-2">
              If you train models or run containers from a terminal, Vast.ai is built for that. If you open design
              software and work in it, you want a ready-to-work cloud virtual workstation: Windows, the GPU, the
              drivers and the applications already there, ready in four clicks and billed per minute
              {hourly ? (
                <>
                  , <strong className="font-semibold text-ink">{from}{hourly}</strong> {tax}
                </>
              ) : null}
              .
            </p>
          </section>

          <section className="mt-14">
            <h2 className="cf-section-title">Side by side.</h2>
            {/* Rows, not a wide table: on a phone both answers stay on screen
                (a 560 px table hid the Vast.ai column off to the right). */}
            <div className="mt-6 divide-y divide-rule rounded-cf border border-rule bg-paper-2" role="table" aria-label="Coreframe and Vast.ai compared">
              <div role="row" className="hidden gap-4 px-5 py-3 text-sm font-semibold text-ink sm:grid sm:grid-cols-[9rem_1fr_1fr]">
                <span role="columnheader"><span className="sr-only">Compared</span></span>
                <span role="columnheader">Coreframe</span>
                <span role="columnheader">Vast.ai</span>
              </div>
              {rows.map(([k, ours, theirs]) => (
                <div key={k} role="row" className="grid gap-2 px-5 py-4 text-sm sm:grid-cols-[9rem_1fr_1fr] sm:gap-4">
                  <span role="rowheader" className="font-medium text-ink-2">{k}</span>
                  <span role="cell" className="text-ink">
                    <span className="font-semibold sm:hidden">Coreframe: </span>
                    {ours}
                  </span>
                  <span role="cell" className="text-ink">
                    <span className="font-semibold sm:hidden">Vast.ai: </span>
                    {theirs}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[13px] leading-5 text-ink-3">
              Vast.ai facts read from vast.ai and docs.vast.ai on {VAST_CHECKED}. Their prices vary by host, so none are
              quoted here.
            </p>
          </section>

          <Fold title="Choose Vast.ai if you train models.">
            <p className="mt-4 leading-8 text-ink-2">
              Training or fine-tuning a model, serving inference, running Docker containers or a scripted batch job
              all work best on a Linux machine you control from a terminal, with the image of your choice. Vast.ai is
              built for that, with a wide choice of GPUs and hosts and per-second billing. Coreframe has no SSH and no
              Linux image, so for that work we would point you to a GPU cloud like Vast.ai.
            </p>
          </Fold>

          <Fold title="Choose Coreframe if you open design software.">
            <p className="mt-4 leading-8 text-ink-2">
              Design work is interactive: you orbit the model, change a material and watch the render resolve. That
              needs a Windows desktop with a display driver and the application installed, not a terminal. On
              Coreframe the{" "}
              <Link href="/apps" className={LINK}>
                preinstalled software
              </Link>{" "}
              is there before you connect, licensed applications run on your own licence, your files stay on your
              project drive between sessions, and the workstation is hosted in a Tier III data centre in India.
            </p>
          </Fold>

          <section className="mt-14" aria-labelledby="alternatives">
            <h2 id="alternatives" className="cf-section-title">Vast.ai alternatives, by what you need.</h2>
            <ul className="mt-6 grid gap-3">
              {alternatives.map((a) => (
                <li key={a.need} className="rounded-cf border border-rule bg-paper-2 px-5 py-4 text-[15px] leading-7 text-ink-2">
                  <span className="font-semibold text-ink">{a.need}</span> {a.pick}
                  {a.href ? (
                    <>
                      {" "}
                      <Link href={a.href} className={LINK}>
                        {a.link}
                      </Link>
                    </>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-14">
            <h2 className="cf-section-title">What a workstation costs here.</h2>
            <p className="mt-4 leading-8 text-ink-2">
              {hourly ? (
                <>
                  <strong className="font-semibold text-ink">{from ? "From " : ""}{hourly}</strong>, {tax}.{" "}
                </>
              ) : null}
              {billing}{" "}
              <Link href="/pricing" className={LINK}>
                Every GPU and its price
              </Link>
              .
            </p>
          </section>

          <section className="mt-14">
            <h2 className="cf-section-title">Questions.</h2>
            <div className="mt-4">
              {faqs.map((f) => (
                <details key={f.q} className="group border-b border-rule">
                  <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 py-4 [&::-webkit-details-marker]:hidden">
                    <h3 className="font-semibold text-ink">{f.q}</h3>
                    <span aria-hidden className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink/[0.06] text-ink-2 transition group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="pb-5 leading-7 text-ink-2">{f.a}</p>
                </details>
              ))}
            </div>
          </section>

          <section className="mt-14 rounded-cf border border-rule p-6">
            <h2 className="cf-section-title">Open your own project on one.</h2>
            <p className="mt-3 leading-7 text-ink-2">
              The project your laptop struggles with is the best test.
            </p>
            <Link href="/signup" className="cf-btn-primary mt-6">
              Get started
            </Link>
          </section>

          <nav className="mt-14 border-t border-rule pt-8">
            <p className="cf-eyebrow mb-4">Related</p>
            <ul className="space-y-1">
              {[
                ["/virtual-workstation-vs-gpu-server", "Cloud virtual workstation vs a GPU server"],
                ["/best-cloud-workstations-for-architects", "Cloud workstations for architects and 3D artists"],
                ["/coreframe-vs-irender", "Coreframe vs iRender"],
                ["/trust", "Security and data"],
                ["/pricing", "Pricing for every GPU"],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="inline-flex min-h-[44px] items-center text-blue hover:underline">
                    {label} →
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </main>
    </div>
  );
}
