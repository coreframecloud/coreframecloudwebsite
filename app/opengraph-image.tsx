import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * The site-wide share image, 1200x630.
 *
 * Until 10 Oct 2026 the only og:image was the 512px square icon, and every page
 * that set its own `openGraph` (the D5, iRender, VRAM and all /software pages)
 * had none at all, because Next replaces the openGraph object rather than
 * merging it. A file-based image applies to every route below this segment
 * regardless, so one file fixes both.
 *
 * NO PRICE ON THE IMAGE. A share card is cached by WhatsApp, LinkedIn and
 * Slack for weeks; a rupee figure baked into a PNG is exactly the hardcoded
 * price the rate-card module exists to prevent.
 */
export const alt = "Coreframe Cloud: GPU workstations, CFD for ducts and pipes, and Studio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const logo = await readFile(join(process.cwd(), "app/icon.png"), "base64");
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#ffffff",
          padding: "72px 80px",
          color: "#101113",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <img src={`data:image/png;base64,${logo}`} width={96} height={96} alt="" />
          <div style={{ fontSize: 40, fontWeight: 700 }}>Coreframe Cloud</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.1 }}>
            GPU workstations. CFD. Studio.
          </div>
          <div style={{ fontSize: 30, color: "#5b6068" }}>
            Rent a GPU workstation by the minute, get CFD for your duct or pipe from one STL, and pre-sale
            concept images from a floor plan. Hosted in India.
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 26, color: "#2f6be0" }}>www.coreframecloud.com</div>
      </div>
    ),
    size,
  );
}
