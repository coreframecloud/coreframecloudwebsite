import type { CSSProperties, ReactNode } from "react";
import { Bricolage_Grotesque } from "next/font/google";
import type { Currency } from "@/lib/money";

// The bubbles' one face (owner, 31 Oct 2026: "creative fonts", but very
// clear in a small space). Bricolage Grotesque, SIL OFL 1.1, chosen over
// Manrope and Sora in a side-by-side (plans/aeo-bubbles-20261031/fonts-*):
// the most character, and narrow enough that every line keeps its inset.
// Loaded here, so only pages with the cluster fetch it.
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-bubble",
  display: "swap",
});

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
 *   phones / tablets  a tall cluster (container 100 x 114.5, units = % width)
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
      {fromRate?.startsWith("from ") ? <span className="cf-bubble-label">From</span> : null}{" "}
      <strong className="cf-bubble-big">{rate}/hr</strong>{" "}
      <span className="cf-bubble-label">
        {currency === "USD" ? "billed per\u00a0minute" : "incl.\u00a0GST, billed per\u00a0minute"}
      </span>
    </>
  ) : (
    <>
      <strong className="cf-bubble-big">Billed</strong>{" "}
      <span className="cf-bubble-label">per{"\u00a0"}minute, nothing to cancel</span>
    </>
  );

  const bubbles: Bubble[] = [
    {
      key: "core",
      tone: "core",
      size: "xl",
      m: { x: 32, y: 25, d: 50 },
      w: { x: 52.75, y: 22, d: 30 },
      body: (
        <>
          Your GPU workstation, ready{"\u00a0"}to{"\u00a0"}work
        </>
      ),
    },
    { key: "price", tone: "hl", size: "md", m: { x: 18.6, y: 67.1, d: 36 }, w: { x: 28.65, y: 11.5, d: 21 }, body: priceBody },
    {
      key: "software",
      tone: "tint",
      size: "md",
      m: { x: 55.6, y: 62.4, d: 36 },
      w: { x: 29.05, y: 33.5, d: 21 },
      body: (
        <>
          {/* One name per line (owner, 31 Oct 2026); the spaces keep the
              names apart for crawlers and copy-paste. */}
          <span className="cf-bubble-list">
            <span>D5{"\u00a0"}Render</span> <span>Blender</span> <span>Twinmotion</span> <span>Unreal{"\u00a0"}Engine</span>
          </span>{" "}
          <span className="cf-bubble-label">installed</span>
        </>
      ),
    },
    { key: "windows", tone: "ink", size: "sm", m: { x: 42.1, y: 92.9, d: 28 }, w: { x: 12.45, y: 22.5, d: 16.5 }, body: "Full Windows desktop" },
    { key: "gpu", tone: "deep", size: "sm", m: { x: 86, y: 75.9, d: 28 }, w: { x: 72.55, y: 35.8, d: 16.5 }, body: "Dedicated RTX\u00a0GPU" },
    {
      key: "india",
      tone: "outline",
      size: "sm",
      m: { x: 74.9, y: 31.2, d: 34 },
      w: { x: 73.55, y: 9, d: 17.5 },
      body: "All infrastructure and data in India",
    },
    { key: "files", tone: "paper", size: "sm", m: { x: 70.3, y: 100.5, d: 28 }, w: { x: 84.25, y: 22.9, d: 16 }, body: "Files stay between sessions" },
    { key: "clicks", tone: "line", size: "sm", m: { x: 14.7, y: 99.5, d: 26 }, w: { x: 90.95, y: 7.8, d: 15.5 }, body: "Ready in 4\u00a0clicks" },
  ];

  return (
    <ul className={`cf-bubbles ${bricolage.variable}`} aria-label="Coreframe at a glance">
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
