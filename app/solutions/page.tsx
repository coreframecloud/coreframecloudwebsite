import type { Metadata } from "next";
import Link from "next/link";
import { BackgroundGlow } from "@/components/home/background-glow";
import { SpecBlock, K, V, C } from "@/components/home/spec-block";
import { NODE } from "@/lib/node-spec";
import {
  ArrowRight,
  HardDrive,
  Mail,
  MonitorSmartphone,
  MessageCircle,
  ShieldCheck,
  Workflow,
} from "lucide-react";

export const metadata: Metadata = {
  title: "GPU Workstations, Rendering and Project Storage for Studios",
  description:
    "How Coreframe fits a design studio: remote Windows RTX workstations, centralised rendering and shared project storage, hosted in Bengaluru and billed in INR.",
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
  {
    icon: MonitorSmartphone,
    title: "GPU workstations.",
    text: `A full ${NODE.os} desktop with a ${NODE.gpu} in it, streamed to the laptop you already have. Revit, AutoCAD, D5 Render, Lumion, Enscape — your licences, our machine.`,
  },
  {
    icon: Workflow,
    title: "Rendering off your own machine.",
    text: "The render runs on the node, not on the laptop in front of you. Your machine stays free while it works, and several people can render at the same time, each on their own workstation, instead of queueing for the one desk that can.",
  },
  {
    icon: HardDrive,
    title: "Shared project storage.",
    text: "Project files sit on NAS and persist between sessions. A designer uploads the model and whoever renders it opens the same file. The latest version is not on a pen drive or on somebody's desktop.",
  },
  {
    icon: ShieldCheck,
    title: "Set up once, with you.",
    text: "We build your licensed software, your access list and your named seats into the image once. After that every workstation your team launches is already the right machine.",
  },
];

/** Checkable in the first session. Nothing here needs a certificate to verify. */
const trustItems = [
  "Every node and every byte of storage sits in Bengaluru. Your client's drawings do not leave India.",
  `You reach the machine through the Coreframe Connect app, streamed at ${NODE.stream}. Not RDP.`,
  "The workstation resets to a clean image between customers, so no trace of one studio's project reaches the next.",
];

export default function SolutionsPage() {
  return (
    <div className="min-h-screen text-ink">
      <BackgroundGlow />

      <main className="relative">
        <section className="cf-section px-5">
          <div className="cf-col">
            <p className="cf-eyebrow mb-5">Solutions</p>
            <h1 className="cf-display">
              One machine can render. Everything queues behind it.
            </h1>
            <p className="cf-lead mt-6">
              That is the arrangement most studios are actually working around.
              Coreframe replaces it with machines you rent by the minute: a
              workstation per person when the deadline needs it, and none of
              them on your books the week after.
            </p>
          </div>
        </section>

        <div className="cf-rule" />

        <section className="cf-section px-5">
          <div className="cf-wide">
            <p className="cf-eyebrow mb-5">What we run</p>
            <h2 className="cf-section-title">Four things, and no long-term contract for any of them.</h2>
            <div className="mt-10 grid grid-cols-1 gap-9 sm:grid-cols-2">
              {solutions.map(({ icon: Icon, title, text }) => (
                <div key={title} className="cf-card">
                  <Icon className="mb-4 h-5 w-5 text-blue" aria-hidden />
                  <h3 className="text-base font-semibold tracking-[-0.01em] text-ink">{title}</h3>
                  <p className="mt-2.5 text-sm leading-[1.62] break-words text-ink-2">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="cf-rule" />

        <section className="cf-section px-5">
          <div className="cf-wide">
            <SpecBlock label="One node">
              <C># what a seat is, read off the machine</C>
              {"\n\n"}
              {"  "}<K>gpu</K>{"          "}<V>{NODE.gpu}</V> · <V>{NODE.vram}</V>{"\n"}
              {"  "}<K>bandwidth</K>{"    "}<V>{NODE.memoryBandwidth}</V> memory bandwidth on the card{"\n"}
              {"  "}<K>memory</K>{"       "}<V>{NODE.ram}</V> system RAM{"\n"}
              {"  "}<K>cpu</K>{"          "}<V>{NODE.cpu}</V>{"\n"}
              {"  "}<K>working disk</K>{" "}<V>{NODE.disk}</V>{"\n"}
              {"  "}<K>os</K>{"           "}<V>{NODE.os}</V>{"\n"}
              {"  "}<K>access</K>{"       "}Coreframe Connect app, streamed at <V>{NODE.stream}</V>{"\n"}
              {"  "}<K>location</K>{"     "}<V>{NODE.location}</V>
            </SpecBlock>
          </div>
        </section>

        <div className="cf-rule" />

        <section className="cf-section px-5">
          <div className="cf-col">
            <p className="cf-eyebrow mb-5">What you can check</p>
            <h2 className="cf-section-title">Three facts you can verify in your first session.</h2>
            <ul className="mt-8 space-y-4">
              {trustItems.map((item) => (
                <li key={item} className="border-t border-rule pt-4 text-base leading-[1.62] break-words text-ink">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <div className="cf-rule" />

        <section className="cf-section px-5">
          <div className="cf-col">
            <div className="cf-note">
              <p className="cf-eyebrow mb-4 text-blue">Next step</p>
              <h2 className="cf-section-title">Start with one seat, not with a rollout.</h2>
              <p className="cf-section-copy mt-4">
                Put one person on it for a week and see what happens to the
                queue. GPU, memory, storage, operating system and who gets
                access are all set with you before the second seat goes live.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
                <Link href="/request-demo" className="cf-btn-primary w-full sm:w-auto min-h-[44px]">
                  Talk to us
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                </Link>

                <a
                  href="https://wa.me/916366889488?text=Hi%20Coreframe%20Cloud%2C%20I%20want%20to%20discuss%20a%20GPU%20requirement."
                  target="_blank"
                  rel="noreferrer"
                  className="cf-btn-secondary w-full sm:w-auto min-h-[44px]"
                >
                  <MessageCircle className="mr-2 h-4 w-4" aria-hidden />
                  WhatsApp
                </a>

                <a
                  href="mailto:admin@coreframecloud.com"
                  className="cf-btn-secondary w-full sm:w-auto min-h-[44px]"
                >
                  <Mail className="mr-2 h-4 w-4" aria-hidden />
                  Email
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
