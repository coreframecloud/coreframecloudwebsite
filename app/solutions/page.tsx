import type { Metadata } from "next";
import { PageByline } from "@/components/seo/page-byline";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbList } from "@/lib/seo";
import Link from "next/link";
import { OfferingsStrip } from "@/components/home/redesign/offerings";
import { NODE } from "@/lib/node-spec";
import { HardDrive, MonitorSmartphone, ShieldCheck, Workflow } from "lucide-react";
import { GenImage } from "@/components/visuals/media";
import { StreamDiagram, TeamStorageDiagram } from "@/components/visuals/diagrams";

export const metadata: Metadata = {
  title: "GPU Workstations and Storage for Studios",
  description:
    "How Coreframe fits a design studio: remote Windows RTX workstations, centralised rendering and shared project storage, hosted in India and billed in INR.",
  alternates: { canonical: "/solutions" },
};

/**
 * THREE CLAIMS CAME OFF THIS PAGE ON 30 SEP 2026, and none of them should
 * have shipped:
 *
 *   "Hosted in Tier III / Tier IV data center environments"
 *   "Enterprise-grade physical security and controlled access"
 *   "High-availability infrastructure designed for operational continuity"
 *
 * Nobody here has an Uptime Institute certificate to point at, "enterprise-
 * grade" means nothing a customer can check, and we publish no uptime figure,
 * so the third sentence promised something we do not measure. They are replaced
 * below by facts a customer can verify in their first session: where the
 * hardware is, what reaches it, and what happens to the disk when they log off.
 *
 * The spec comes from lib/node-spec. It is not typed here, and it never should
 * be -- eight pages once claimed server-grade memory and a server-grade CPU
 * this fleet has never had.
 */

const solutions = [
  { icon: MonitorSmartphone, title: "A workstation each.", text: `A full ${NODE.os} desktop with a workstation-class GPU, on the laptop you already have.` },
  { icon: Workflow, title: "Nobody queues.", text: "Renders run on our machines, so laptops stay free and everyone renders at once." },
  { icon: HardDrive, title: "One set of files.", text: "Everyone opens the same project from shared storage. No pen drives." },
  { icon: ShieldCheck, title: "Set up once, with you.", text: "Your software and who gets access, set up once for every machine." },
];

/** Checkable in the first session. */
const trustItems = ["Everything stays in Bengaluru", `Streamed at ${NODE.stream}, not over RDP`, "A clean machine for every session"];

export default function SolutionsPage() {
  // No GPU is named here (owner, 21 Oct 2026): the GPUs on offer, with VRAM,
  // vCPU and RAM, are the live ladder on /pricing.
  const spec = [
    "Your choice of GPU: see pricing",
    NODE.disk,
    NODE.os,
    NODE.location,
  ];
  return (
    <div className="min-h-screen text-ink">
      <JsonLd data={breadcrumbList([{ name: "Solutions", path: "/solutions" }])} />

      <main className="relative">
        <section className="cf-section px-5 cf-pagehero">
          <div className="cf-wide grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="min-w-0">
              <p className="cf-eyebrow mb-5">Solutions</p>
              <h1 className="cf-display">One machine can render. Everything queues behind it.</h1>
              <p className="cf-lead mt-6">Rent machines by the minute, so everyone gets one when the deadline needs it.</p>
              <PageByline path="/solutions" className="mt-4 opacity-75" />
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/signup" className="cf-btn-primary">Sign up</Link>
                <Link href="/enterprise" className="cf-btn-secondary">Team plans</Link>
              </div>
            </div>
            <GenImage
              src="/visuals/gen-studio-team-day.webp"
              alt="A small design studio working together at shared desks"
              width={1000}
              height={1286}
              sizes="(max-width: 1024px) 100vw, 420px"
              parallax
              priority
            />
          </div>
        </section>

        <section className="cf-section px-5">
          <div className="cf-wide">
            <h2 className="cf-section-title">Four things. No long contract.</h2>
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {solutions.map(({ icon: Icon, title, text }) => (
                <div key={title} className="cf-card cfh-lift">
                  <Icon className="h-6 w-6 text-blue" strokeWidth={1.6} aria-hidden />
                  <h3 className="mt-4 font-heading text-[18px] font-medium text-ink">{title}</h3>
                  <p className="mt-1.5 text-[14.5px] leading-6 text-ink-2">{text}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-2">
              <div className="rounded-[24px] bg-tint-blue p-6">
                <p className="mb-3 text-[13px] font-semibold tracking-[0.06em] text-ink-2 uppercase">The whole team, one storage</p>
                <TeamStorageDiagram />
              </div>
              <div className="rounded-[24px] bg-tint-mint p-6">
                <p className="mb-3 text-[13px] font-semibold tracking-[0.06em] text-ink-2 uppercase">Runs here, you see it there</p>
                <StreamDiagram />
              </div>
            </div>
          </div>
        </section>

        <section className="cf-section px-5 pt-0">
          <div className="cf-wide grid gap-10 lg:grid-cols-2">
            <div>
              <h2 className="cf-section-title">Every seat is the same machine.</h2>
              <ul className="mt-6 flex flex-wrap gap-2.5">
                {spec.map((x) => (
                  <li key={x} className="rounded-full bg-tint-blue px-3.5 py-2 text-[14px] text-ink">{x}</li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="cf-section-title">Things you can check yourself.</h2>
              <ul className="mt-6 flex flex-wrap gap-2.5">
                {trustItems.map((x) => (
                  <li key={x} className="rounded-full bg-tint-mint px-3.5 py-2 text-[14px] text-ink">{x}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* The studio-team page sells the workstations; the other two services
            are one line each, so a visitor here sees everything we do. */}
        <section className="cf-section px-5 pt-0">
          <div className="cf-wide">
            <h2 className="cf-section-title">Everything Coreframe does.</h2>
            <div className="mt-6">
              <OfferingsStrip location="solutions_services" />
            </div>
          </div>
        </section>

        <section className="cf-section px-5 pt-0">
          <div className="cf-wide">
            <div className="rounded-[32px] bg-night px-7 py-12 text-white sm:px-14">
              <h2 className="font-heading text-[28px] font-medium sm:text-[36px]">Start with one seat.</h2>
              <p className="mt-3 max-w-lg text-white/70">Put one person on it for a week and watch the queue disappear.</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/signup" className="cfh-pill-light">Sign up</Link>
                <Link href="/enterprise" className="cfh-pill-ghost">Team plans</Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
