import { Card, CardContent } from "@/components/ui/card";
import { HardDrive, MonitorSmartphone, ShieldCheck, Workflow } from "lucide-react";

const cards = [
  {
    icon: MonitorSmartphone,
    title: "GPU Workstations",
    text: "Hourly RTX-based Windows environments for 3D rendering, Revit, CAD, and D5.",
  },
  {
    icon: Workflow,
    title: "AI Compute Nodes",
    text: "Monthly Linux GPU plans for inference, training, and simulation workloads.",
  },
  {
    icon: HardDrive,
    title: "Project Storage",
    text: "More sensible storage profiles for active projects, assets, and output delivery.",
  },
  {
    icon: ShieldCheck,
    title: "Managed Rollout",
    text: "Sizing, onboarding, access control, and custom infrastructure planning.",
  },
];

export function SolutionsSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16 md:py-20">
      <div className="max-w-3xl">
        <div className="text-sm font-medium uppercase tracking-[0.25em] text-cyan-300">
          Core Offerings
        </div>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">
          Simple, card-led infrastructure options.
        </h2>
        <p className="mt-4 text-base leading-7 text-slate-300 md:text-lg">
          Keep the homepage focused. Go deeper on solutions and workloads through
          dedicated pages when needed.
        </p>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ icon: Icon, title, text }) => (
          <Card key={title} className="rounded-[1.6rem] border-white/10 bg-white/5">
            <CardContent className="p-6">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 ring-1 ring-cyan-400/20">
                <Icon className="h-5 w-5 text-cyan-200" />
              </div>
              <h3 className="text-xl font-semibold text-white">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">{text}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
