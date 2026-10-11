/**
 * The frames that crossfade in the homepage workstation card.
 *
 * SWAP THEM HERE, AND ONLY HERE. Each `src` can be a path under /public or a
 * full https://media.coreframecloud.com/... URL (allowed in next.config.ts).
 * Real product frames only: no personal data (emails, names, account
 * numbers) in shot. The first frame is what shows on first paint.
 *
 * Current set: the owner's Connect app screenshots (R2 "app screenshots",
 * 11 Oct 2026), in session order. Customer name, email, account number and
 * invoice numbers are blurred; each shot sits on a 1600x1000 canvas so the
 * 16:10 card never crops it.
 */
export type WorkstationFrame = {
  src: string;
  width: number;
  height: number;
  /** Short caption shown on the frame. */
  caption: string;
  alt: string;
};

export const WORKSTATION_FRAMES: WorkstationFrame[] = [
  { src: "/home/app-01-sign-in.webp", width: 1600, height: 1000, caption: "Sign in to Coreframe Connect", alt: "The Coreframe Connect sign-in screen" },
  { src: "/home/app-02-pick-gpu.webp", width: 1600, height: 1000, caption: "Pick the RTX 5080 and launch", alt: "The RTX 5080 workstation tile with its Launch button" },
  { src: "/home/app-03-starting.webp", width: 1600, height: 1000, caption: "Your workstation starts", alt: "The app assigning a GPU and starting the Windows session" },
  { src: "/home/app-04-preparing.webp", width: 1600, height: 1000, caption: "Ready in about 3 minutes", alt: "The app preparing the streaming desktop" },
  { src: "/home/app-05-ready.webp", width: 1600, height: 1000, caption: "Connect with one click", alt: "The Ready to stream screen with the Connect button" },
  { src: "/home/app-06-desktop.webp", width: 1600, height: 1000, caption: "Your own Windows desktop", alt: "The Windows desktop of the cloud workstation" },
  { src: "/home/app-07-files.webp", width: 1600, height: 1000, caption: "Your project files, synced", alt: "The Files tab with a Blender scene and a finished render" },
  { src: "/home/app-08-diagnostics.webp", width: 1600, height: 1000, caption: "Connection health at a glance", alt: "The Diagnostics tab showing connection and stream status" },
  { src: "/home/app-09-wallet.webp", width: 1600, height: 1000, caption: "Top up your wallet", alt: "The wallet with top-up amounts" },
  { src: "/home/app-10-invoices.webp", width: 1600, height: 1000, caption: "GST invoices, automatically", alt: "The Invoices tab listing GST invoices" },
];
