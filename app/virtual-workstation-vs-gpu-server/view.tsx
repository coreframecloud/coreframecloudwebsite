import type { Currency } from "@/lib/money";
import { StreamDiagram } from "@/components/visuals/diagrams";
import { PageByline } from "@/components/seo/page-byline";
import { GenImage } from "@/components/visuals/media";
import type { Metadata } from "next";
import Link from "next/link";
import { Fold } from "@/components/visuals/fold";
import { BackgroundGlow } from "@/components/home/background-glow";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbList, faqPage, OG_IMAGE } from "@/lib/seo";
import { getRateCard, adhocRateHourly, billingSentence, ladderRanges } from "@/lib/rate-card";

/**
 * "Ready-to-work cloud virtual workstation vs a bare GPU server" -- added
 * 30 Oct 2026 (owner decision: answer-engine optimisation).
 *
 * WHY. Buyers ask assistants for a "virtual workstation with a GPU on the
 * cloud" or a "cloud workstation", and the answers they get are lists of GPU
 * clouds that rent a bare Linux server by the hour. What Coreframe sells is
 * different in kind: a Windows desktop that is ready to work, with the design
 * software installed and the files kept. Nothing on the site said so in a way
 * an answer engine could lift, so this page does.
 *
 * HONESTY. A bare GPU server is the better tool for headless work (AI
 * training, inference, containers, scripted batch jobs), and the page says so.
 * No provider is named and no competitor price is quoted: the comparison is
 * between two kinds of product, not two companies. No speed claims. Our own
 * price comes from the live rate card in the page's currency, or is not shown.
 */
export function workstationVsServerMetadata(): Metadata {
  // No price in this metadata: the same for both currency copies.
  return {
    title: "Cloud Virtual Workstation vs GPU Server",
    description:
      "A bare GPU server gives you Linux and a terminal. A ready-to-work cloud virtual workstation gives you Windows, a GPU and your design software, billed per minute.",
    keywords: [
      "cloud virtual workstation",
      "virtual workstation with GPU",
      "cloud workstation India",
      "virtual workstation vs GPU server",
      "GPU server vs cloud workstation",
      "rent virtual workstation India",
    ],
    alternates: { canonical: "/virtual-workstation-vs-gpu-server" },
    openGraph: {
      images: [OG_IMAGE],
      title: "Ready-to-work cloud virtual workstation vs a bare GPU server",
      description:
        "What you get on each: operating system, drivers, software, files, billing and setup time, and when a bare GPU server is the better fit.",
      url: "https://www.coreframecloud.com/virtual-workstation-vs-gpu-server",
      type: "article",
    },
  };
}

const PAGE_PATH = "/virtual-workstation-vs-gpu-server";
const LINK = "text-blue underline underline-offset-4";

export default async function WorkstationVsServerView({ currency }: { currency: Currency }) {
  const card = await getRateCard();
  const hourly = adhocRateHourly(card, currency);
  const ladder = ladderRanges(card);
  const usdView = currency === "USD";
  const tax = usdView ? "with no GST" : "including GST";
  const billing = billingSentence(card, currency);

  /** "16 vCPU, 64 to 128 GB of RAM and 16 to 48 GB of VRAM", from the rate card, or null. */
  const machine = ladder ? `${ladder.cpu}, ${ladder.ram} of RAM and ${ladder.vram} of VRAM` : null;

  const rows: [string, string, string][] = [
    [
      "What you get",
      "A full Windows desktop with a dedicated NVIDIA RTX GPU, streamed to your own PC through the Coreframe Connect app",
      "A server or virtual machine with a GPU attached, usually running Linux, reached over SSH or a web notebook",
    ],
    [
      "Operating system",
      "Windows, set up and maintained for you",
      "Usually a Linux image you pick; anything else you set up yourself",
    ],
    [
      "Drivers",
      "Graphics drivers installed, with DirectX and OpenGL for design applications",
      "Compute drivers are often included; a desktop and a remote-display stack usually are not",
    ],
    [
      "Software",
      "Blender, D5 Render, Twinmotion, Unreal Engine, FreeCAD and more preinstalled; Lumion, Enscape, V-Ray, Revit, AutoCAD, SketchUp Pro and Rhino on your own licence",
      "Only what is in the base image; you install and license everything else",
    ],
    [
      "Your files",
      "Uploads stay on your project drive and appear on every workstation; an optional persistent workstation keeps your own Windows disk",
      "Kept on the server's disk or a storage volume you manage, often billed separately",
    ],
    [
      "Billing",
      usdView
        ? "Per minute from when you connect, from a prepaid wallet in US dollars; preparing the workstation is free"
        : "Per minute from when you connect, from a prepaid wallet with a GST invoice on every top-up; preparing the workstation is free",
      "Usually by the hour or second while the server runs, plus storage, depending on the provider",
    ],
    [
      "Setup time",
      "Four clicks in the app, then the desktop appears in about two minutes",
      "Minutes to boot, then however long it takes you to install drivers, a remote desktop and your applications",
    ],
    [
      "Who it suits",
      "Architects, interior designers, 3D visualisers, motion designers, students and small design firms",
      "AI and machine-learning engineers, developers, and anyone running headless or scripted jobs",
    ],
  ];

  const faqs: { q: string; a: string }[] = [
    {
      q: "Where can I rent a virtual workstation with a GPU in India?",
      a:
        "Coreframe Cloud, a Bengaluru company, rents ready-to-work cloud virtual workstations: a full Windows desktop with a dedicated NVIDIA RTX GPU and design software installed, streamed to your own PC through the Coreframe Connect app. " +
        (hourly
          ? usdView
            ? `For accounts outside India prices start at ${hourly} with no GST, billed per minute, and international cards are accepted. `
            : `Prices start at ${hourly} including GST, billed per minute from a prepaid wallet, with a GST invoice on every top-up. `
          : "Billing is per minute; live prices are on the pricing page. ") +
        "All infrastructure and data are in India.",
    },
    {
      q: "What is a cloud virtual workstation?",
      a: "A powerful computer in a data centre that you use remotely as if it were on your desk. You see and control its desktop from your own laptop, while the GPU, processor and memory doing the work sit on the remote machine. A ready-to-work one, like Coreframe's, also comes with the operating system, graphics drivers and design software already set up.",
    },
    {
      q: "How is a ready-to-work workstation different from a GPU server?",
      a: "A bare GPU server is usually a Linux machine with a GPU that you reach over SSH and set up yourself: drivers, a remote desktop if you want one, and every application. A ready-to-work workstation is already a Windows desktop with the drivers and design software installed, so you connect and open your project. Coreframe also keeps your uploaded files between sessions and bills per minute from when you connect.",
    },
    {
      q: "Can I run SketchUp, Revit or AutoCAD on a cloud GPU workstation?",
      a: "Yes. A Coreframe workstation is a standard Windows desktop, so SketchUp Pro, Revit, AutoCAD, 3ds Max, Rhino, Lumion, Enscape and V-Ray run on your own licence, signed in exactly as on a new PC. Blender, D5 Render, Twinmotion and Unreal Engine are preinstalled. Each session starts from a clean machine, so software you install is removed when it ends, unless you choose a persistent workstation (available on selected GPUs), which keeps your own Windows disk between sessions.",
    },
    {
      q: "Is a virtual workstation good for interior designers and small design firms?",
      a: "Usually, when the work is rendering or heavy 3D on laptops that cannot keep up. You keep the laptops you own, pay per minute only while someone is working, and avoid buying a workstation that sits idle between projects. Team plans add a shared monthly pool of GPU hours, a login per person and one invoice, and a firm committing around 300 or more GPU hours a month can have a workstation set aside for it. If you would keep a GPU busy most of the working week, owning one can work out cheaper.",
    },
    {
      q: "How fast can I start?",
      a:
        "Sign up with an email address and a mobile number, " +
        (usdView ? "top up your wallet by card (international cards are accepted)" : "top up your wallet by UPI or card") +
        " and install the Coreframe Connect app for Windows. After that a workstation is four clicks away and its desktop appears in about two minutes. Preparing it is free; billing starts when you connect.",
    },
    {
      q: "How is it billed?",
      a:
        (hourly ? `From ${hourly} ${tax}, depending on the GPU you choose. ` : "") +
        billing +
        (usdView
          ? " You pay in US dollars from a prepaid wallet."
          : " You pay from a prepaid wallet and get a GST invoice on every top-up."),
    },
    {
      q: "When is a bare GPU server the better choice?",
      a: "For headless work: training or fine-tuning AI models, running inference, Docker containers, scripted batch jobs, or anything that needs root access, a custom Linux image or several GPUs in one machine. Coreframe workstations have no SSH and no Linux image, so for that work a GPU cloud built for AI is the better fit.",
    },
  ];

  return (
    <div className="relative min-h-screen text-ink">
      <BackgroundGlow />
      <JsonLd data={faqPage(faqs)} />
      <JsonLd data={breadcrumbList([{ name: "Virtual workstation vs GPU server", path: PAGE_PATH }])} />

      <section className="cf-section cf-pagehero px-5">
        <div className="cf-wide grid items-center gap-10 lg:grid-cols-[1.05fr_1fr]">
          <div className="min-w-0">
            <p className="cf-eyebrow mb-5">Comparison · Cloud workstations</p>
            <h1 className="cf-display">Ready-to-work cloud virtual workstation, or a bare GPU server?</h1>
            <p className="cf-lead mt-[22px]">
              A bare GPU server gives you a machine and a terminal. A ready-to-work workstation gives you a{" "}
              <em>Windows desktop</em> with the GPU, the drivers and your design software already on it.
            </p>
            <PageByline path={PAGE_PATH} className="mt-4 opacity-75" />
          </div>
          <GenImage
            src="/visuals/gen-designer-cafe-laptop-16x9.webp"
            alt="An interior designer working on a thin laptop"
            width={1600}
            height={914}
            sizes="(max-width: 1024px) 100vw, 480px"
            parallax
            priority
          />
        </div>
      </section>

      <section className="cf-section px-5 pb-0">
        <div className="cf-wide grid items-center gap-8 rounded-[28px] bg-tint-blue p-6 sm:p-10 lg:grid-cols-[0.8fr_1.2fr]">
          <h2 className="cf-section-title">A desktop, not a terminal.</h2>
          <div className="min-w-0">
            <StreamDiagram />
          </div>
        </div>
      </section>

      <main className="relative cf-section px-5">
        <div className="cf-col">
          <section className="mt-14">
            <h2 className="cf-section-title">The short answer.</h2>
            <p className="mt-4 leading-8 text-ink-2">
              If you open design software and work in it, you want a ready-to-work cloud virtual workstation. If
              you run code, containers or AI training from a terminal, you want a bare GPU server. Coreframe sells
              only the first: a full Windows desktop with a dedicated NVIDIA RTX GPU
              {machine ? ` (${machine})` : ""}, ready in four clicks, billed per minute, with all infrastructure
              and data in India.
            </p>
          </section>

          <section className="mt-14">
            <h2 className="cf-section-title">Side by side.</h2>
            <div className="mt-6 overflow-x-auto rounded-cf border border-rule bg-paper-2">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead>
                  <tr className="border-b border-rule">
                    <th className="px-4 py-3 font-semibold text-ink"></th>
                    <th className="px-4 py-3 font-semibold text-ink">Ready-to-work workstation</th>
                    <th className="px-4 py-3 font-semibold text-ink">Bare GPU server</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rule">
                  {rows.map(([k, ws, server]) => (
                    <tr key={k} className="align-top">
                      <th scope="row" className="px-4 py-3 font-medium text-ink-2">{k}</th>
                      <td className="px-4 py-3 text-ink">{ws}</td>
                      <td className="px-4 py-3 text-ink">{server}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <Fold title="Where a bare GPU server wins.">
            <p className="mt-4 leading-8 text-ink-2">
              A bare server is the right tool when nobody needs to see a screen. Training or fine-tuning a model,
              serving inference, running Docker containers or a scripted batch job all work best on a Linux
              machine you control from a terminal, with root access and the image of your choice. Several GPUs in
              one machine is also server territory. Coreframe workstations have no SSH and no Linux image, so for
              that work a GPU cloud built for AI is the better fit, and we would rather say so here.
            </p>
          </Fold>

          <Fold title="Where a ready-to-work workstation wins.">
            <p className="mt-4 leading-8 text-ink-2">
              Design work is interactive. You orbit the model, change a material and watch the render resolve,
              and that needs a desktop with a display driver and the application already installed, not a
              terminal. On a Coreframe workstation the{" "}
              <Link href="/apps" className={LINK}>
                preinstalled software
              </Link>{" "}
              is there before you connect, licensed applications such as SketchUp Pro, Revit, AutoCAD, Lumion and
              Enscape run on your own licence, and the files you upload stay on your project drive between
              sessions. Nobody on your team has to become a system administrator.
            </p>
          </Fold>

          <Fold title="How fast you can start.">
            <p className="mt-4 leading-8 text-ink-2">
              Sign up with an email address and a mobile number, top up your wallet and install the Coreframe
              Connect app for Windows. From then on a workstation is four clicks away and the desktop appears in
              about two minutes. Preparing it is free; billing starts when you connect.{" "}
              <Link href="/how-to-use" className={LINK}>
                How to use Coreframe
              </Link>{" "}
              walks through a first session.
            </p>
          </Fold>

          <Fold title="For design firms and teams.">
            <p className="mt-4 leading-8 text-ink-2">
              Team plans give a shared monthly pool of GPU hours, a login per person and one invoice. A firm that
              commits around 300 or more GPU hours a month can have a workstation set aside for it.{" "}
              <Link href="/enterprise" className={LINK}>
                Team plans
              </Link>
              .
            </p>
          </Fold>

          <section className="mt-14">
            <h2 className="cf-section-title">What a workstation costs here.</h2>
            <p className="mt-4 leading-8 text-ink-2">
              {hourly ? (
                <>
                  <strong className="font-semibold text-ink">From {hourly}</strong>, {tax}.{" "}
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
            <div className="mt-6 space-y-7">
              {faqs.map((f) => (
                <div key={f.q}>
                  <h3 className="font-semibold text-ink">{f.q}</h3>
                  <p className="mt-2 leading-7 text-ink-2">{f.a}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-14 rounded-cf border border-blue/20 bg-blue/[0.05] p-6">
            <h2 className="cf-section-title">Open your own project on one.</h2>
            <p className="mt-3 leading-7 text-ink-2">
              The project your laptop struggles with is the best test. Open it on a Coreframe workstation and see
              how it behaves.
            </p>
            <Link href="/signup" className="cf-btn-primary mt-6">
              Get started
            </Link>
          </section>

          <nav className="mt-14 border-t border-rule pt-8">
            <p className="cf-eyebrow mb-4">Related</p>
            <ul className="space-y-1">
              {[
                ["/pricing", "Pricing for every GPU"],
                ["/apps", "Preinstalled software"],
                ["/how-to-use", "How to use Coreframe"],
                ["/cloud-workstation-vs-render-farm", "Cloud workstation vs render farm"],
                ["/d5-render-vs-local-gpu", "Renting a workstation vs buying one"],
                ["/enterprise", "Team plans for design firms"],
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
