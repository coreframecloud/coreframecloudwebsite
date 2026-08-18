import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

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

Start rendering from ₹399/hr (GST included) and scale based on your project needs.

This model is ideal for architects, freelancers, and studios handling variable workloads.
`,
  },
};

// Next.js 16: `params` is a Promise and MUST be awaited. Reading `.slug`
// straight off it yields undefined, every lookup misses, and every page in
// this route 404s — silently, while still being listed in the sitemap. That
// is exactly what happened to these five pages.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = pagesData[slug];

  if (!data) {
    return {
      title: "Page Not Found",
    };
  }

  return {
    title: data.title,
    description: data.description,
    alternates: {
      canonical: `/${slug}`,
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = pagesData[slug];

  // notFound() rather than a "Page not found" div: rendering the message with
  // a 200 status is a SOFT 404, and it made every made-up URL on the domain
  // look real. Cloudflare's AI crawler report showed /private-key as the most
  // crawled path with 18 "successful" requests — a secret-hunting probe being
  // told the page exists. Search and AI-answer crawlers index that junk too,
  // diluting the pages that matter. This returns a genuine 404.
  if (!data) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-20 text-white">
      <h1 className="text-3xl font-semibold">{data.title}</h1>

      <p className="mt-6 text-white/70 leading-7 whitespace-pre-line">
        {data.content}
      </p>

      {/* Internal links */}
      <div className="mt-10 text-emerald-300 space-y-2">
        <Link href="/" className="block hover:underline">
          ← Back to Home
        </Link>
        <Link href="/d5-render-cloud-workstation" className="block hover:underline">
          D5 Render Workstation →
        </Link>
      </div>
    </div>
  );
}
