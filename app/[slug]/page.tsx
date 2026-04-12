import type { Metadata } from "next";

type PageData = {
  title: string;
  description: string;
  content: string;
};

const pagesData: Record<string, PageData> = {
  "d5-render-cloud-workstation": {
    title: "D5 Render Cloud Workstation (RTX GPU for Architects)",
    description:
      "Run D5 Render on RTX GPUs in the cloud with ready-to-use workstations.",
    content: `
D5 Render Cloud Workstation is designed for architects and 3D designers who need high-performance rendering without investing in expensive GPUs.

Launch a fully configured Windows workstation with RTX GPU, WDDM enabled, and start rendering in under 2 minutes.

Choose VRAM from 16GB to 48GB depending on scene complexity. Upload files, render, download output, and terminate the session.

This eliminates hardware costs, improves rendering speed, and allows flexible scaling for different project sizes.
`,
  },

  "cloud-rendering-for-architects": {
    title: "Cloud Rendering for Architects (Faster D5 Workflows)",
    description:
      "How architects use cloud GPUs for faster rendering workflows.",
    content: `
Cloud rendering allows architects to offload heavy rendering workloads to RTX-powered machines.

Instead of relying on local GPUs, you can launch cloud workstations on demand and render large scenes faster.

This improves productivity, reduces hardware limitations, and enables teams to scale rendering capacity instantly.

For Revit + D5 workflows, cloud rendering provides a clean separation between design and rendering tasks.
`,
  },

  "d5-render-vs-local-gpu": {
    title: "D5 Render Cloud vs Local GPU (Performance Comparison)",
    description:
      "Compare cloud rendering vs local GPU for D5 Render workflows.",
    content: `
Local GPUs are limited by VRAM and hardware constraints.

Cloud GPUs allow you to choose configurations based on project needs, improving performance for large scenes.

Cloud rendering reduces hardware costs, eliminates maintenance, and allows flexible usage based on workload.
`,
  },

  "revit-d5-cloud-workflow": {
    title: "Revit + D5 Render Cloud Workflow",
    description:
      "Optimize Revit to D5 workflows using cloud GPUs.",
    content: `
Revit and D5 Render workflows benefit significantly from cloud rendering.

Design locally in Revit and offload rendering to RTX-powered cloud workstations.

This improves rendering speed and ensures stable performance for large models.
`,
  },

  "gpu-rendering-service-india": {
    title: "GPU Rendering Service India (RTX Cloud Workstations)",
    description:
      "Affordable GPU rendering services in India for architects.",
    content: `
GPU rendering services allow users to access high-performance RTX GPUs without upfront investment.

Start rendering from ₹90/hr and scale based on your project needs.

This model is ideal for architects, freelancers, and studios handling variable workloads.
`,
  },
};

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const data = pagesData[params.slug];

  if (!data) {
    return {
      title: "Page Not Found",
    };
  }

  return {
    title: data.title,
    description: data.description,
    alternates: {
      canonical: `/${params.slug}`,
    },
  };
}

export default function Page({
  params,
}: {
  params: { slug: string };
}) {
  const data = pagesData[params.slug];

  if (!data) {
    return <div className="p-10 text-white">Page not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-20 text-white">
      <h1 className="text-3xl font-semibold">{data.title}</h1>

      <p className="mt-6 text-white/70 leading-7 whitespace-pre-line">
        {data.content}
      </p>

      {/* Internal links */}
      <div className="mt-10 text-emerald-300 space-y-2">
        <a href="/" className="block hover:underline">
          ← Back to Home
        </a>
        <a href="/d5-render" className="block hover:underline">
          D5 Render Workstation →
        </a>
      </div>
    </div>
  );
}
