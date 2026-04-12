const pages = {
  "d5-render-24gb-vram": {
    title: "D5 Render 24GB VRAM Cloud Workstation",
    content: "Run D5 Render on RTX A5000 with 24GB VRAM for large scenes."
  },
  "cloud-rendering-for-architects": {
    title: "Cloud Rendering for Architects",
    content: "Use RTX cloud GPUs for architectural visualization."
  },
  "d5-render-gpu-server": {
    title: "D5 Render GPU Server",
    content: "High-performance RTX GPU servers for D5 Render."
  },
};

export default function Page({ params }: any) {
  const data = pages[params.slug];

  if (!data) return <div className="p-10 text-white">Page not found</div>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-20 text-white">
      <h1 className="text-3xl font-semibold">{data.title}</h1>
      <p className="mt-6 text-white/70">{data.content}</p>
    </div>
  );
}
const pages = {
  "d5-render-cloud": {
    title: "D5 Render Cloud Workstation",
    content: "Run D5 Render on RTX GPUs in the cloud without upgrading hardware."
  },
  "d5-render-24gb-vram": {
    title: "D5 Render 24GB VRAM Cloud Workstation",
    content: "Best for large scenes and complex rendering workflows."
  },
  "d5-render-48gb-vram": {
    title: "D5 Render 48GB VRAM Cloud Workstation",
    content: "High-end RTX A6000 rendering for ultra large scenes."
  },
  "d5-render-gpu-server": {
    title: "D5 Render GPU Server",
    content: "Launch GPU servers optimized for D5 Render workloads."
  },
  "cloud-rendering-for-architects": {
    title: "Cloud Rendering for Architects",
    content: "Architectural visualization using RTX cloud workstations."
  },
  "revit-d5-render-cloud": {
    title: "Revit + D5 Render Cloud Workflow",
    content: "Move your Revit + D5 workflow to RTX cloud machines."
  },
  "rendering-vs-local-gpu": {
    title: "Cloud Rendering vs Local GPU",
    content: "Compare rendering performance between local GPUs and cloud RTX."
  },
  "fast-d5-rendering": {
    title: "How to Render Faster in D5",
    content: "Use RTX GPUs and cloud workflows to reduce render time."
  },
  "rtx-render-cloud": {
    title: "RTX Render Cloud Workstation",
    content: "RTX-based rendering for 3D workflows."
  },
  "gpu-rendering-service-india": {
    title: "GPU Rendering Service India",
    content: "Affordable cloud GPU rendering starting ₹90/hr."
  }
};
