import type { Metadata } from "next";

type PageData = {
  title: string;
  description: string;
  content: string;
};

const pagesData: Record<string, PageData> = {
  "d5-render-cloud": {
    title: "D5 Render Cloud Workstation",
    description: "Run D5 Render on RTX GPUs in the cloud.",
    content:
      "Run D5 Render on RTX GPUs in the cloud without upgrading hardware.",
  },
  "cloud-rendering-for-architects": {
    title: "Cloud Rendering for Architects",
    description: "RTX cloud GPUs for architectural workflows.",
    content:
      "Use RTX cloud GPUs for architectural visualization and large scenes.",
  },
"d5-render-cloud-workstation": {
  title: "D5 Render Cloud Workstation (RTX GPU for Architects)",
  description: "Run D5 Render on RTX GPUs in the cloud with ready-to-use workstations.",
  content: `
D5 Render Cloud Workstation is designed for architects, visualization studios, and 3D designers who need high-performance rendering without investing in expensive local GPUs.

Instead of upgrading your workstation, you can launch a fully configured Windows machine with RTX GPU, WDDM enabled, and start rendering in under 2 minutes.

This approach eliminates the need for hardware procurement, setup, driver installation, and system maintenance. You simply launch, upload your project files, render, download the output, and terminate the session.

The biggest advantage comes from VRAM flexibility. With options ranging from 16GB to 48GB VRAM, you can choose the right configuration depending on scene complexity. Large architectural scenes, high-resolution outputs, and real-time lighting workflows benefit significantly from higher VRAM.

Another important aspect is cost efficiency. Instead of locking capital into GPUs that may sit idle, cloud workstations allow you to pay only for active usage. This is especially useful for studios handling fluctuating workloads.

For teams using Revit + D5 Render workflows, this model works seamlessly. Design work can continue locally, while rendering jobs are offloaded to high-performance cloud machines.

Security is also built into the workflow. Files are transferred only to the provisioned workstation and removed when the session ends, ensuring isolation between users.

If you are currently limited by GPU memory, rendering speed, or system stability, moving to a D5 Render cloud workstation can significantly improve productivity and turnaround time.
`
},

"cloud-rendering-for-architects": {
  title: "Cloud Rendering for Architects (Faster D5 Workflows)",
  description: "How architects use cloud GPUs for faster rendering workflows.",
  content: `
Cloud rendering is becoming the standard approach for architectural visualization teams that require flexibility, speed, and scalability.

Traditional rendering setups rely heavily on local workstations. While this works for small projects, it quickly becomes a bottleneck for large-scale designs, high-resolution outputs, and tight deadlines.

With cloud rendering, architects can access high-performance RTX GPUs on demand. Instead of waiting for local machines to complete renders, jobs can be offloaded to dedicated cloud workstations.

This is particularly valuable in D5 Render workflows where real-time rendering, lighting simulations, and scene complexity demand significant GPU resources.

One of the biggest benefits is scalability. A single workstation may struggle with peak workloads, but cloud infrastructure allows you to scale up instantly. Whether it's one project or multiple concurrent renders, capacity is no longer a limitation.

Another advantage is accessibility. Teams can collaborate from different locations while accessing the same rendering infrastructure.

Cost optimization is also a key factor. Instead of purchasing multiple high-end GPUs, firms can use cloud workstations only when required, reducing overall infrastructure costs.

Cloud rendering also improves reliability. Crashes due to GPU overload, memory limits, or system instability are reduced significantly when using optimized cloud environments.

For modern architectural firms, cloud rendering is not just an alternative — it is a more efficient and scalable way to handle visualization workflows.
`
},

"d5-render-vs-local-gpu": {
  title: "D5 Render Cloud vs Local GPU (Performance Comparison)",
  description: "Compare cloud rendering vs local GPU for D5 Render workflows.",
  content: `
Choosing between a local GPU workstation and a cloud rendering setup depends on workload, budget, and flexibility requirements.

Local GPUs provide immediate access and no dependency on internet connectivity. However, they come with limitations such as fixed VRAM, high upfront cost, and lack of scalability.

Cloud workstations, on the other hand, allow you to choose GPU configurations based on project requirements. This means you are not restricted by your local hardware capabilities.

Performance differences become noticeable when working with large scenes. Cloud GPUs with higher VRAM can handle complex lighting, textures, and geometry more efficiently than mid-range local GPUs.

Another key factor is utilization. Local GPUs often remain idle when not rendering, leading to inefficient capital usage. Cloud GPUs are used only when needed, making them more cost-effective in variable workloads.

Maintenance is also a concern with local setups. Driver updates, hardware failures, and system configuration issues can disrupt workflows. Cloud environments are pre-configured and managed, reducing operational overhead.

For teams working on tight deadlines or handling multiple projects, cloud rendering offers a clear advantage in terms of speed and flexibility.

In most modern workflows, a hybrid approach works best — design locally and render in the cloud.
`
},
"revit-d5-cloud-workflow": {
  title: "Revit + D5 Render Cloud Workflow",
  description: "Optimize Revit to D5 workflows using cloud GPUs.",
  content: `
Revit and D5 Render are widely used together in architectural workflows, but rendering performance often becomes a bottleneck.

A cloud-based workflow allows teams to continue designing in Revit locally while offloading rendering tasks to high-performance RTX workstations.

The process is simple. Models are prepared locally, exported or synced to D5 Render, and then transferred to the cloud workstation for rendering.

This separation ensures that design and rendering tasks do not compete for the same system resources.

With higher VRAM configurations available in the cloud, large Revit models can be rendered without crashes or memory limitations.

This also improves iteration speed. Designers can make changes locally while renders are processed in parallel on cloud machines.

For teams working on presentations, competitions, or client deliverables, this workflow significantly reduces turnaround time.

Cloud rendering also enables consistent performance across team members, eliminating differences caused by varying local hardware capabilities.

For firms scaling their visualization capabilities, integrating cloud rendering into Revit + D5 workflows is a natural progression.
`
},

"gpu-rendering-service-india": {
  title: "GPU Rendering Service India (RTX Cloud Workstations)",
  description: "Affordable GPU rendering services in India for architects and designers.",
  content: `
GPU rendering services in India are gaining traction as more design teams move toward cloud-based infrastructure.

High-end GPUs are expensive and often underutilized. Cloud GPU services provide a more efficient way to access rendering power without heavy capital investment.

With hourly pricing models, users can start rendering from as low as ₹90/hr depending on the configuration.

This makes advanced rendering accessible to freelancers, small studios, and large firms alike.

RTX GPUs are particularly well-suited for D5 Render workflows, offering real-time rendering capabilities and improved lighting simulations.

Another important factor is deployment speed. Instead of setting up systems manually, users can launch pre-configured workstations instantly.

Data transfer workflows are also optimized, allowing users to upload project files, render, and download results without complex setup.

For the Indian market, where cost sensitivity and scalability are critical, GPU rendering services provide a practical solution.

As demand for high-quality visualization increases, cloud-based GPU rendering is becoming an essential part of the modern design stack.
`
}
};

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
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

export default function Page({ params }: { params: { slug: string } }) {
  const data = pagesData[params.slug];

  if (!data) {
    return <div className="p-10 text-white">Page not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-20 text-white">
      <h1 className="text-3xl font-semibold">{data.title}</h1>
      <p className="mt-6 text-white/70">{data.content}</p>
    </div>
  );
}
