import type { CSSProperties, ReactNode } from "react";
import type { Currency } from "@/lib/money";

/**
 * "What is Coreframe?" at a glance (owner, 31 Oct 2026: "too much to read;
 * people should get it at a glance"). A packed bubble cluster, one short fact
 * per circle, sized by importance: the core idea biggest, the price the one
 * yellow fill. Every fact is a phrase from the full answer below it; nothing
 * new is claimed here.
 *
 * Pure HTML + CSS (globals.css, "At-a-glance bubbles"): real, selectable,
 * crawlable text, no chart library, no images. Each bubble carries two
 * positions, worked out with a small circle packer so nothing touches:
 *   phones / tablets  a tall cluster (container 100 x 116.5, units = % width)
 *   lg and up         a wide cluster (container 100 x 44)
 * x/y are the centre, d the diameter, all in % of the container's width.
 */
type Spot = { x: number; y: number; d: number };
type Bubble = {
  key: string;
  tone: "core" | "hl" | "ink" | "deep" | "tint" | "line" | "paper" | "outline";
  size: "xl" | "md" | "sm";
  m: Spot;
  w: Spot;
  body: ReactNode;
};

export function AtAGlance({ fromRate, currency = "INR" }: { fromRate?: string; currency?: Currency }) {
  // fromRate is the page's live "from" price ("from ₹99" / "$1.49"), or none.
  const rate = fromRate?.replace(/^from /, "");
  const priceBody = rate ? (
    <>
      <strong className="cf-bubble-big">
        {fromRate?.startsWith("from ") ? "From " : ""}
        {rate}/hr
      </strong>
      <span className="cf-bubble-sub">
        {currency === "USD" ? "billed " : "incl. GST, billed "}
        <span className="whitespace-nowrap">per minute</span>
      </span>
    </>
  ) : (
    <>
      <strong className="cf-bubble-big">Per minute</strong>
      <span className="cf-bubble-sub">billing, nothing to cancel</span>
    </>
  );

  const bubbles: Bubble[] = [
    {
      key: "core",
      tone: "core",
      size: "xl",
      m: { x: 50, y: 39.3, d: 52 },
      w: { x: 52.75, y: 22, d: 30 },
      body: (
        <>
          Your GPU workstation, <span className="whitespace-nowrap">ready to work</span>
        </>
      ),
    },
    { key: "price", tone: "hl", size: "md", m: { x: 45.4, y: 84.2, d: 36 }, w: { x: 28.65, y: 11.5, d: 21 }, body: priceBody },
    {
      key: "software",
      tone: "tint",
      size: "md",
      m: { x: 80.7, y: 72.6, d: 36 },
      w: { x: 29.05, y: 33.5, d: 21 },
      body: (
        <>
          D5 · Blender · Twinmotion · Unreal <span className="cf-bubble-sub">installed</span>
        </>
      ),
    },
    { key: "windows", tone: "ink", size: "sm", m: { x: 17.8, y: 65, d: 28 }, w: { x: 12.45, y: 22.5, d: 16.5 }, body: "Full Windows desktop" },
    { key: "gpu", tone: "deep", size: "sm", m: { x: 14.2, y: 95.8, d: 28 }, w: { x: 72.55, y: 35.8, d: 16.5 }, body: <>Dedicated <span className="whitespace-nowrap">RTX GPU</span></> },
    {
      key: "india",
      tone: "outline",
      size: "sm",
      m: { x: 15.3, y: 15, d: 30 },
      w: { x: 73.55, y: 9, d: 17.5 },
      body: "All infrastructure and data in India",
    },
    { key: "files", tone: "paper", size: "sm", m: { x: 86.5, y: 21.1, d: 27 }, w: { x: 84.25, y: 22.9, d: 16 }, body: "Files stay between sessions" },
    { key: "clicks", tone: "line", size: "sm", m: { x: 71.3, y: 103.5, d: 26 }, w: { x: 90.95, y: 7.8, d: 15.5 }, body: <>Ready in <span className="whitespace-nowrap">4 clicks</span></> },
  ];

  return (
    <ul className="cf-bubbles" aria-label="Coreframe at a glance">
      {bubbles.map((b, i) => (
        <li
          key={b.key}
          className={`cf-bubble cf-bubble--${b.tone} cf-bubble--${b.size}`}
          style={
            {
              "--i": i,
              "--mx": b.m.x,
              "--my": b.m.y,
              "--md": b.m.d,
              "--wx": b.w.x,
              "--wy": b.w.y,
              "--wd": b.w.d,
            } as CSSProperties
          }
        >
          <span className="cf-bubble-in">{b.body}</span>
        </li>
      ))}
    </ul>
  );
}
