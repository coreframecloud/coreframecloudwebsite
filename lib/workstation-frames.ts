/**
 * The frames that crossfade in the homepage workstation card.
 *
 * SWAP THEM HERE, AND ONLY HERE. Each `src` can be a path under /public or a
 * full https://media.coreframecloud.com/... URL (allowed in next.config.ts).
 * Real product frames only: no personal data (emails, names, account
 * numbers) in shot. The first frame is what shows on first paint.
 *
 * Current set: our walkthrough recording (marketing-20261010/walkthrough),
 * kept until the owner's replacements land on R2.
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
  { src: "/home/wt-launch.webp", width: 1000, height: 698, caption: "Pick the RTX 5080 and launch", alt: "The Coreframe app's RTX 5080 tile with its Launch button" },
  { src: "/home/wt-file-on-workstation.webp", width: 1280, height: 720, caption: "Your file is already on the workstation", alt: "The uploaded Blender file open on the workstation" },
  { src: "/home/wt-render-starts.webp", width: 1280, height: 720, caption: "Render on the RTX 5080", alt: "A Cycles render starting, with Task Manager showing the GPU" },
  { src: "/home/wt-rendering.webp", width: 1280, height: 720, caption: "The GPU does the work", alt: "The render resolving with the GPU near full use" },
  { src: "/home/wt-save-to-nas.webp", width: 1280, height: 720, caption: "Save to your project drive", alt: "Saving the finished render to the project drive" },
];
