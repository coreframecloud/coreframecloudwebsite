import { BackgroundGlow } from "@/components/home/background-glow";
import { SiteFooter } from "@/components/home/site-footer";
import { SiteHeader } from "@/components/home/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  HardDrive,
  Mail,
  MonitorSmartphone,
  MessageCircle,
  ShieldCheck,
  Workflow,
} from "lucide-react";

const solutions = [
  {
    icon: MonitorSmartphone,
    title: "GPU Workstations",
    text: "Remote Windows GPU environments for Revit, CAD, D5 Render, and visualization workflows.",
  },
  {
    icon: Workflow,
    title: "Render Farm",
    text: "Centralized rendering for image and video output while teams keep working on their local systems.",
  },
  {
    icon: HardDrive,
    title: "Project Storage",
    text: "Shared storage with more sensible capacity for active projects, assets, and output delivery.",
  },
  {
    icon: ShieldCheck,
    title: "Managed Deployment",
    text: "Provisioning, monitoring, access control, and environment customization based on workload needs.",
  },
];

const trustItems = [
  "Hosted in Tier III / Tier IV data center environments",
  "Enterprise-grade physical security and controlled access",
  "High-availability infrastructure designed for operational continuity",
];

export default function SolutionsPage() {
  return (
    <div className="min-h-screen text-white">
      <BackgroundGlow />
      <SiteHeader />

      <main className="relative mx-auto max-w-7xl px-6 pb-20 pt-20 md:pt-28">
        <div className="max-w-3xl">
          <div className="text-sm font-medium uppercase tracking-[0.25em] text-cyan-300">
            Solutions
          </div>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-6xl">
            GPU infrastructure designed around how teams actually work.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300 md:text-lg">
            Not every customer needs full-time VDI for every user. Coreframe Cloud
            is structured around practical delivery: remote workstations, render
            capacity, storage, and managed rollout.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {solutions.map(({ icon: Icon, title, text }) => (
            <Card
              key={title}
              className="rounded-[1.6rem] border border-white/12 bg-white/6 shadow-[0_20px_50px_rgba(0,0,0,0.22)] backdrop-blur-2xl"
            >
              <CardContent className="p-6">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 ring-1 ring-cyan-400/20">
                  <Icon className="h-5 w-5 text-cyan-200" />
                </div>
                <h2 className="text-xl font-semibold">{title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-300">{text}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-14 rounded-[2rem] border border-white/12 bg-white/6 p-8 backdrop-blur-2xl">
          <div className="max-w-3xl">
            <div className="text-sm uppercase tracking-[0.25em] text-cyan-200">
              Infrastructure Standard
            </div>
            <h2 className="mt-3 text-3xl font-semibold md:text-4xl">
              Built for stronger security, controlled access, and reliable operations.
            </h2>
            <div className="mt-6 grid gap-3">
              {trustItems.map((item) => (
                <div
                  key={item}
                  className="rounded-xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-slate-200"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-14 rounded-[2rem] border border-cyan-400/20 bg-cyan-500/10 p-8 backdrop-blur-2xl">
          <div className="max-w-3xl">
            <div className="text-sm uppercase tracking-[0.25em] text-cyan-200">
              Next step
            </div>
            <h2 className="mt-3 text-3xl font-semibold md:text-4xl">
              Start with a pilot, then scale based on usage.
            </h2>
            <p className="mt-4 text-base leading-8 text-slate-100/85">
              We can align GPU, CPU, RAM, storage, operating system, and access
              model to your exact workload.
            </p>

            <div className="mt-6 flex flex-wrap gap-4">
              <a href="/request-demo">
                <Button className="rounded-2xl px-6">
                  Talk to Us
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </a>

              <a
                href="https://wa.me/916366889488?text=Hi%20Coreframe%20Cloud%2C%20I%20want%20to%20discuss%20a%20GPU%20requirement."
                target="_blank"
                rel="noreferrer"
              >
                <Button
                  variant="outline"
                  className="rounded-2xl border-green-400/30 bg-green-500/10 text-green-200 hover:bg-green-500/20"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Connect on WhatsApp
                </Button>
              </a>

              <a href="mailto:hi@coreframecloud.com">
                <Button
                  variant="outline"
                  className="rounded-2xl border-white/15 bg-white/5 text-white hover:bg-white/10"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Email Us
                </Button>
              </a>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
