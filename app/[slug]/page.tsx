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
