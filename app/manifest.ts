import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Coreframe Cloud",
    short_name: "Coreframe",
    description:
      "D5 Render Ready Workstations with RTX GPUs in the cloud.",
    start_url: "/",
    display: "standalone",
    background_color: "#030b16",
    theme_color: "#030b16",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
