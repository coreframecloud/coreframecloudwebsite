import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://coreframecloud.com";
  const now = new Date();

  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${base}/enterprise`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/d5-render`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/lumion-cloud-gpu`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/enscape-cloud-gpu`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/cloud-rendering-for-architects`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/ansys-cfd-gpu`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/solutions`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/compute-nodes`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: `${base}/request-demo`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: `${base}/privacy-policy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terms-of-service`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/refund-policy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];
}
