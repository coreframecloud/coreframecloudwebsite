import {
  BadgeCheck,
  Building2,
  Cpu,
  DraftingCompass,
  Film,
  Gauge,
  HardDrive,
  Layers3,
  MonitorSmartphone,
  Server,
  ShieldCheck,
  Workflow,
} from "lucide-react";

export const benefits = [
  "Built for architecture and visualization workflows",
  "Ideal for render-first teams, not full VDI for everyone",
  "Premium infrastructure for client-facing deployments",
  "Start with a pilot, then scale based on usage",
];

export const solutionCards = [
  {
    icon: MonitorSmartphone,
    title: "Remote GPU Workstations",
    text: "For teams that need controlled, high-performance remote desktops for design, review, and client access.",
  },
  {
    icon: Workflow,
    title: "Render Farm Infrastructure",
    text: "For teams that want centralized rendering without moving every user into a full-time virtual desktop.",
  },
  {
    icon: HardDrive,
    title: "Shared Project Storage",
    text: "For structured project assets, result delivery, and smoother handoffs between users and render nodes.",
  },
  {
    icon: Layers3,
    title: "Managed Deployment",
    text: "For provisioning, monitoring, software setup, and ongoing support across client environments.",
  },
];

export const features = [
  {
    icon: Cpu,
    title: "GPU Workstations on Demand",
    text: "Remote GPU environments for Revit, AutoCAD, D5 Render, and visualization workflows with controlled software stacks.",
  },
  {
    icon: Server,
    title: "Centralized Render Infrastructure",
    text: "Queue-based rendering for final images and videos so teams can keep working locally while output is processed centrally.",
  },
  {
    icon: ShieldCheck,
    title: "Managed Access & Security",
    text: "Centralized user access, project storage, session control, and admin support for enterprise client environments.",
  },
  {
    icon: Gauge,
    title: "Fast Pilot Deployment",
    text: "Launch proof-of-concept GPU setups quickly for benchmarking, onboarding, and real project validation.",
  },
];

export const industries = [
  {
    icon: DraftingCompass,
    title: "Architecture Teams",
    text: "Remote GPU access for Revit, CAD, and visualization-heavy design workflows.",
  },
  {
    icon: Film,
    title: "Rendering Workflows",
    text: "Centralized rendering for high-quality images and video output without disrupting local authoring systems.",
  },
  {
    icon: Building2,
    title: "Engineering & Simulation",
    text: "GPU-backed environments for compute-heavy review, post-processing, and technical workloads.",
  },
];

export const processSteps = [
  "Understand your workflow, tools, and output requirements",
  "Design the right GPU and render setup",
  "Launch a pilot using a real project",
  "Scale based on usage, results, and business fit",
];

export const faqs = [
  {
    q: "Do you only support full-time VDI users?",
    a: "No. Coreframe Cloud is also designed for teams that mainly need centralized rendering or burst GPU access without moving every user into a virtual desktop full-time.",
  },
  {
    q: "Can this work for Revit and D5 Render workflows?",
    a: "Yes. The platform positioning and deployment model are designed around architecture and visualization workloads like Revit, CAD, and D5 Render.",
  },
  {
    q: "Can we start with a pilot before scaling?",
    a: "Yes. The recommended rollout is to begin with a focused pilot using one live project, validate performance and workflow fit, and then expand only if it makes business sense.",
  },
  {
    q: "Is this only for architecture teams?",
    a: "No. Coreframe Cloud is positioned for architecture, visualization, engineering, and other GPU-heavy professional workflows.",
  },
];

export const whyThisWorks = [
  "Designed for rendering and design workflows, not generic desktops",
  "Avoid unnecessary VDI cost with more practical hybrid setups",
  "Faster onboarding with a pilot-first deployment model",
  "Focused on workflow performance, not just infrastructure supply",
];

export const benefitIcon = BadgeCheck;
