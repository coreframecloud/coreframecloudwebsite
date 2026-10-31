import { Bricolage_Grotesque } from "next/font/google";

/**
 * The bubble face (owner, 31 Oct 2026): Bricolage Grotesque, SIL OFL 1.1,
 * chosen over Manrope and Sora in a side-by-side
 * (plans/aeo-bubbles-20261031/fonts-*). Used by the home "at a glance"
 * bubbles and the hero GPU-memory counter; only the pages that render them
 * load it. Exposes --font-bubble.
 */
export const bubbleFont = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-bubble",
  display: "swap",
});
