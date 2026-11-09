import type { Metadata } from "next";
import Link from "next/link";
import type { Currency } from "@/lib/money";
import { PageByline } from "@/components/seo/page-byline";
import { BackgroundGlow } from "@/components/home/background-glow";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbList, faqPage, OG_IMAGE, SITE } from "@/lib/seo";
import { getRateCard, adhocRateHourly, ladderRanges } from "@/lib/rate-card";

/**
 * "Cloud workstations for architects and 3D artists (2026)" (AEO plan
 * 1 Nov 2026, A6).
 *
 * A factual roundup BY CATEGORY: answer engines lift roundups, and they lump
 * "cloud workstation" in with GPU rental because nothing well cited says the
 * categories differ. Each category says what it is for, who it suits and one
 * or two named examples, with facts read on the provider's own site on
 * CHECKED. Coreframe is listed in its own category and nowhere claims to win
 * the others.
 *
 * RULES (owner): no cloud-gaming services and no NVIDIA services in the list;
 * no competitor prices (they move); no speed claims; facts dated. Re-read a
 * provider's site before editing its line, and bump CHECKED.
 */
const CHECKED = "1 November 2026";
const PAGE_PATH = "/best-cloud-workstations-for-architects";

export function roundupMetadata(): Metadata {
  // No price in this metadata: the same for both currency copies.
  return {
    // Snippet rewrite 9 Nov 2026 (AEO week): 163 impressions, 1 click at 8.1;
    // the searches it answers say "cloud PC for an architecture firm" and
    // "cloud computing for artists", so the snippet now uses those words.
    title: { absolute: "Cloud PCs for Architecture Firms and 3D Artists (2026)" },
    description:
      "How artists and architecture firms use cloud computing: a ready-to-work Windows workstation, a GPU server, a render farm, an AI GPU cloud or virtual desktops.",
    keywords: [
      "best cloud workstations for architects",
      "cloud workstation for architects",
      "cloud workstation for 3D artists",
      "ready-to-use Windows cloud workstation",
      "cloud virtual workstation",
      "remote GPU workstation",
      "cloud PC for architecture firm",
      "cloud computing for artists",
    ],
    alternates: { canonical: PAGE_PATH },
    openGraph: {
      images: [OG_IMAGE],
      title: "Cloud workstations for architects and 3D artists (2026)",
      description:
        "A factual roundup by category: what each kind of cloud GPU service is for, with dated examples, and where Coreframe fits.",
      url: `https://www.coreframecloud.com${PAGE_PATH}`,
      type: "article",
    },
  };
}

type Category = {
  id: string;
  name: string;
  what: string;
  suits: string;
  examples: { name: string; fact: string; href?: string }[];
};

export default async function CloudWorkstationsRoundupView({ currency }: { currency: Currency }) {
  const card = await getRateCard();
  const hourly = adhocRateHourly(card, currency);
  const ladder = ladderRanges(card);
  const usdView = currency === "USD";
  const from = ladder && ladder.count > 1 ? "from " : "";
  const price = hourly ? `, ${from}${hourly} ${usdView ? "with no GST" : "including GST"}` : "";

  const categories: Category[] = [
    {
      id: "ready-to-work",
      name: "Ready-to-work cloud virtual workstations",
      what: "A full Windows desktop with a dedicated GPU and the design software already installed, streamed to your own laptop. You open your project and work; nothing to set up.",
      suits: "Architects, interior designers and 3D artists who model, light and render interactively in D5, Lumion, Enscape, Twinmotion, Revit, 3ds Max or Blender.",
      examples: [
        {
          name: "Coreframe Cloud",
          fact: `Windows with an NVIDIA RTX GPU${ladder ? ` (${ladder.vram} VRAM)` : ""}; D5 Render, Twinmotion, Unreal Engine and Blender preinstalled; ready in four clicks through the Coreframe Connect app; billed per minute${price}. Hosted in a Tier III data centre in India; customers worldwide.`,
          href: "/pricing",
        },
      ],
    },
    {
      id: "remote-gpu-servers",
      name: "Remote GPU servers you configure",
      what: "A rented machine with one or more GPUs that you reach over remote desktop and set up the way you want, often with several GPUs in one box.",
      suits: "Studios that want multi-GPU machines or a lot of system RAM and are happy to install and maintain the software themselves.",
      examples: [
        {
          name: "iRender",
          fact: "Dedicated remote GPU servers, single GPU up to 8 GPUs, Windows or Ubuntu, reached by RDP, billed per minute from a prepaid deposit.",
          href: "/coreframe-vs-irender",
        },
      ],
    },
    {
      id: "render-farms",
      name: "Render farms",
      what: "You submit a finished scene, usually through a plugin in your 3D application, and the farm renders the frames across many machines. You do not get a desktop.",
      suits: "Long animations and large batches of finished frames, where nobody needs to touch the scene while it renders.",
      examples: [
        {
          name: "RebusFarm",
          fact: "A cloud render farm with plugins for 3ds Max, Cinema 4D, Maya, Blender and other applications; billed by render time.",
          href: "/cloud-workstation-vs-render-farm",
        },
      ],
    },
    {
      id: "ai-gpu-clouds",
      name: "GPU clouds built for AI",
      what: "Linux containers or virtual machines with a GPU, reached over SSH or a notebook. You pick an image and install everything yourself.",
      suits: "AI training and inference, containers and scripted jobs. Not built around a Windows design desktop.",
      examples: [
        {
          name: "Vast.ai",
          fact: "A GPU cloud marketplace; Docker containers or Ubuntu virtual machines, connected by SSH or Jupyter, billed per second.",
          href: "/vast-ai-alternative-windows-workstation",
        },
        {
          name: "RunPod",
          fact: "Calls itself an AI developer cloud: GPU pods, serverless endpoints and clusters for inference and training.",
        },
      ],
    },
    {
      id: "desktop-as-a-service",
      name: "Hyperscaler virtual desktops (DaaS)",
      what: "Cloud desktops run inside a large cloud provider's account, with GPU-enabled options, usually set up and managed by an IT team.",
      suits: "Larger firms with an IT team that already runs a cloud account and wants to manage images, networks and users itself.",
      examples: [
        {
          name: "Amazon WorkSpaces",
          fact: "Windows or Linux cloud desktops, including GPU-enabled graphics bundles, with monthly or hourly billing.",
        },
      ],
    },
  ];

  const faqs: { q: string; a: string }[] = [
    {
      q: "What is the best cloud workstation for architects?",
      a: `For interactive design work, a ready-to-work cloud virtual workstation: a Windows desktop with a dedicated GPU and the design software installed, streamed to your laptop. Coreframe Cloud is one, ready in four clicks and billed per minute${price}, hosted in a Tier III data centre in India. For finished animations, a render farm is cheaper; for AI work, a GPU cloud built for AI.`,
    },
    {
      q: "What is the difference between a cloud workstation and a render farm?",
      a: "A cloud workstation is one interactive machine you drive yourself: you model, light and render in the same session. A render farm takes a finished scene and renders its frames across many machines while you wait for the results.",
    },
    {
      q: "Can I use a GPU cloud like Vast.ai or RunPod for Revit or D5 Render?",
      a: "They are built for Linux and AI workloads, reached over SSH or a notebook. Revit, D5 Render, Lumion and Enscape are Windows applications that need a desktop and a display driver, which is what a ready-to-work cloud virtual workstation provides.",
    },
    // New searches, week to 6 Nov 2026 ("cloud computing equipment for
    // artists", "how to cloud computing for artists", "cloud pc for
    // architecture firm"), answered here because this page ranks for them.
    {
      q: "How can artists use cloud computing for 3D work?",
      a: "Rent a powerful computer in a data centre and work on it from your own laptop. For modelling, lighting and rendering, that means a cloud virtual workstation: a Windows desktop with a dedicated GPU and your 3D software, streamed to your screen, billed only while you use it. Save finished animations for a render farm, and AI training for a GPU cloud built for AI.",
    },
    {
      q: "What equipment does an artist need for cloud computing?",
      a: "Less than for a local workstation: the GPU, CPU and memory sit in the data centre. You need a laptop or PC that can play smooth video, a steady internet connection, a mouse (a pen tablet if you sculpt or paint), and the provider's client app. Coreframe's Connect app runs on Windows 10 and 11.",
    },
    {
      q: "What is the best cloud PC for an architecture firm?",
      a: `One ready-to-work cloud workstation per person who models or renders, plus shared project storage, so nobody installs drivers or software and the files stay in one place. Coreframe's team plans give a firm a shared pool of GPU workstation hours, shared storage, a login per person and one invoice; workstations are hosted in a Tier III data centre in India. A firm with its own IT team and cloud account may prefer hyperscaler virtual desktops.`,
    },
    {
      q: "Do I need an IT team to use a cloud workstation?",
      a: "Not for a ready-to-work one. With Coreframe you install one Windows app, sign in, pick a GPU and launch. Hyperscaler virtual desktops are usually set up and run by an IT team inside the firm's own cloud account.",
    },
  ];

  return (
    <div className="relative min-h-screen text-ink">
      <BackgroundGlow />
      <JsonLd data={faqPage(faqs)} />
      <JsonLd data={breadcrumbList([{ name: "Cloud workstations for architects and 3D artists", path: PAGE_PATH }])} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Kinds of cloud GPU service for architects and 3D artists",
          itemListElement: categories.map((c, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: c.name,
            url: `${SITE}${PAGE_PATH}#${c.id}`,
          })),
        }}
      />

      <section className="cf-section cf-pagehero px-5">
        <div className="cf-col">
          <p className="cf-eyebrow mb-5">Roundup · 2026</p>
          <h1 className="cf-display">Cloud workstations for architects and 3D artists.</h1>
          <p className="cf-lead mt-[22px]">
            &ldquo;Cloud GPU&rdquo; covers five different products. Only one of them is a{" "}
            <em>ready-to-work Windows desktop</em> you open your design software on. Here is what each kind is for.
          </p>
          <PageByline path={PAGE_PATH} className="mt-4 opacity-75" />
        </div>
      </section>

      <main className="relative cf-section px-5">
        <div className="cf-col">
          {/* Pick by job: the whole page in one glance. */}
          <section aria-labelledby="pick">
            <h2 id="pick" className="cf-section-title">Pick by the job.</h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                ["You model, light and render interactively", "Ready-to-work cloud virtual workstation", "#ready-to-work"],
                ["You want a multi-GPU box to set up yourself", "Remote GPU server", "#remote-gpu-servers"],
                ["You have a finished animation to render", "Render farm", "#render-farms"],
                ["You train or serve AI models", "GPU cloud built for AI", "#ai-gpu-clouds"],
                ["Your IT team runs desktops in its own cloud", "Hyperscaler virtual desktops", "#desktop-as-a-service"],
              ].map(([job, pick, href]) => (
                <li key={href}>
                  <a href={href} className="block h-full rounded-cf border border-rule bg-paper-2 px-5 py-4 transition hover:border-ink/30">
                    <span className="block text-[14px] leading-6 text-ink-2">{job}</span>
                    <span className="mt-1 block font-heading text-[17px] leading-6 font-medium text-ink">{pick} →</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>

          {categories.map((c, i) => (
            <section key={c.id} id={c.id} className="mt-14 scroll-mt-24">
              <p className="cf-eyebrow">{String(i + 1).padStart(2, "0")}</p>
              <h2 className="cf-section-title mt-2">{c.name}</h2>
              <p className="mt-4 leading-8 text-ink-2">{c.what}</p>
              <p className="mt-3 leading-7 text-ink-2">
                <span className="font-semibold text-ink">Suits: </span>
                {c.suits}
              </p>
              <ul className="mt-4 space-y-3">
                {c.examples.map((e) => (
                  <li key={e.name} className="rounded-cf border border-rule bg-paper-2 px-5 py-4">
                    <p className="font-semibold text-ink">{e.name}</p>
                    <p className="mt-1 text-[15px] leading-7 text-ink-2">{e.fact}</p>
                    {e.href ? (
                      <Link href={e.href} className="mt-1 inline-flex min-h-11 items-center text-[15px] text-blue underline underline-offset-4">
                        {e.href === "/pricing" ? "Every GPU and its price" : "How it compares"}
                      </Link>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          ))}

          <p className="mt-8 text-[13px] leading-5 text-ink-3">
            Facts about other providers were read on their own websites on {CHECKED}. Their prices change often, so none
            are quoted here. Coreframe Cloud publishes this page and is listed in its own category.
          </p>

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
            <h2 className="cf-section-title">Try the first kind on your own project.</h2>
            <p className="mt-3 leading-7 text-ink-2">Open the scene your laptop struggles with and judge it yourself.</p>
            <Link href="/signup" className="cf-btn-primary mt-6">
              Get started
            </Link>
          </section>

          <nav className="mt-14 border-t border-rule pt-8">
            <p className="cf-eyebrow mb-4">Related</p>
            <ul className="space-y-1">
              {[
                ["/virtual-workstation-vs-gpu-server", "Cloud virtual workstation vs a GPU server"],
                ["/cloud-workstation-vs-render-farm", "Cloud workstation vs render farm"],
                ["/vast-ai-alternative-windows-workstation", "Vast.ai alternatives for Windows design work"],
                ["/enterprise", "Team plans for architecture firms"],
                ["/trust", "Security and data"],
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
