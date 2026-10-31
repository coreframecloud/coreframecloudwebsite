/**
 * The frames that crossfade in the homepage workstation card.
 *
 * SWAP THEM HERE, AND ONLY HERE. Each `src` can be a path under /public or a
 * full https://media.coreframecloud.com/... URL (allowed in next.config.ts).
 * Real product frames only: no personal data (emails, names, account
 * numbers) in shot. The first frame is what shows on first paint.
 *
 * Current set (31 Oct 2026, owner: "the app screenshots have to be the
 * updated ones"): Connect v1.3.12, the five screens captured for the
 * Microsoft Store listing (plans/msstore-listing-20261031/screenshots), sample
 * user, no prices on any screen, so they suit rupee and dollar visitors
 * alike. 16:9 at 2048x1152; the strip's frame is 16:9 to match.
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
  { src: "/home/connect-1312-01-sign-in.webp", width: 2048, height: 1152, caption: "Sign in with your email", alt: "The Coreframe Connect sign-in screen with an email field and a one-time code" },
  { src: "/home/connect-1312-02-choose-gpu.webp", width: 2048, height: 1152, caption: "Choose a workstation", alt: "Choose a workstation: RTX A4000, RTX A5000, RTX 5080 and RTX 6000 Ada with their VRAM, CUDA cores, vCPU and RAM" },
  { src: "/home/connect-1312-03-starting.webp", width: 2048, height: 1152, caption: "Your workstation starts", alt: "The workstation starting, each step ticking off: reserving, starting the machine, setting up Windows" },
  { src: "/home/connect-1312-04-ready.webp", width: 2048, height: 1152, caption: "Ready to stream, one click", alt: "The Ready to stream screen with the session timer and the Connect to workstation button" },
  { src: "/home/connect-1312-05-files.webp", width: 2048, height: 1152, caption: "Your project files stay", alt: "The Files page with personal files available on the workstation as the project drive" },
];
