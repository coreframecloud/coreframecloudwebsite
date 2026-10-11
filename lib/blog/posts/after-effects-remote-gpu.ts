import { NODE } from "@/lib/node-spec";
import { STREAM_BANDWIDTH } from "@/lib/streaming-terms";
import type { BlogPost } from "../types";

const SLUG = "after-effects-on-a-remote-gpu";
const IMG = `/blog/${SLUG}`;

/**
 * No After Effects footage exists from our own machines yet, so the images
 * are from the Blender walkthrough and are captioned as the shared parts of
 * every session (the drive, the download, the reconnect hold). Nothing here
 * claims an export or render time.
 *
 * Owner-confirmed facts (11 Oct 2026): Creative Cloud is installed on the
 * workstation and each customer signs in with their own Adobe account; the
 * reconnect hold is 15 minutes; fonts a user installs are wiped at session
 * end. Plugin installers are deliberately not discussed.
 */
export const afterEffectsRemoteGpu: BlogPost = {
  slug: SLUG,
  title: "After Effects on a remote GPU: what works and what doesn't",
  metaTitle: "After Effects on a Remote GPU: What Works",
  description:
    "Motion graphics, heavy comps and exports work well on a rented RTX workstation. Camera originals and final colour need planning first.",
  targetQueries: [
    "after effects cloud pc",
    "after effects cloud render",
    "premiere pro cloud editing",
    "cloud pc for video editing india",
    "after effects remote gpu",
  ],
  datePublished: "2026-10-10",
  draft: false,
  eyebrow: "Guide · Video",
  hero: {
    src: `${IMG}/connect-files-download.webp`,
    alt: "The Files tab of the Coreframe Connect app listing a project file and a rendered result with download buttons.",
    width: 923,
    height: 597,
    caption:
      "The project drive in the Connect app. Footage goes up here before a session; finished exports come back down the same way. Account name blurred.",
  },
  answer: () =>
    `After Effects runs well on a remote GPU workstation for motion graphics, heavy compositions and exports, because the work happens on the remote machine and your laptop only shows a video stream of it. Two things need planning. Your footage has to be uploaded first, which is quick for a motion-graphics project and slow for hundreds of gigabytes of camera originals. And the stream is compressed video, so judge final colour on the downloaded export, not on the stream.`,
  body: (ctx) => [
    { type: "h2", text: "What a remote GPU workstation is, for an editor" },
    {
      type: "p",
      text: `It's a Windows PC in a data centre that you use through a window on your own computer. Ours is an ${NODE.gpu} with ${NODE.vram}, ${NODE.ram} of system RAM and an ${NODE.cpu}, hosted in ${NODE.location} and streamed at up to ${NODE.stream}. After Effects, Premiere Pro and Media Encoder run on it under your own Adobe account. You see the desktop, you move the mouse, and everything heavy runs on the remote machine.`,
    },
    {
      type: "p",
      text: `For video work, that means a comp rendering or an export encoding loads the workstation, and your laptop stays usable for email, a call or the next edit.`,
    },

    { type: "h2", text: "What works well" },
    { type: "h3", text: "Motion graphics and heavy comps" },
    {
      type: "p",
      text: `Projects built from vector layers, text, shapes, 3D layers and stock elements are small to upload and heavy to preview, which is the best case for a remote machine. After Effects uses the GPU for many effects and for its 3D renderer, and RAM preview uses system memory, so ${NODE.ram} gives long previews room to fit.`,
    },
    { type: "h3", text: "Exports and Media Encoder queues" },
    {
      type: "p",
      text: `Premiere Pro and Media Encoder can encode H.264 and HEVC on the NVIDIA card's hardware encoder. Queue the exports, let them run on the workstation, and download the finished files. Your laptop isn't tied up for the evening.`,
    },
    { type: "h3", text: "Short-form edits and social cuts" },
    {
      type: "p",
      text: `Edits where the source material is a few gigabytes (phone footage, screen recordings, a handful of clips) are quick to get onto the drive and comfortable to cut over the stream.`,
    },
    { type: "h3", text: "Visualisation walkthroughs" },
    {
      type: "p",
      text: `If you produce architectural walkthroughs in D5, Lumion or Twinmotion, the exported frames are already on the same workstation. Finishing them in After Effects or Premiere on that machine saves a round trip of uploads and downloads.`,
    },

    { type: "h2", text: "What needs planning" },
    { type: "h3", text: "Getting footage onto the machine" },
    {
      type: "p",
      text: `Footage travels over your own internet connection to your project drive. Your upload speed is the limit, so check that figure rather than the download speed your plan advertises. As a rough guide, 100 GB at a steady 50 Mbps upload takes about four and a half hours. Camera originals for a long-form project can be several times that.`,
    },
    {
      type: "p",
      text: `The fix is to upload before the session. The Files tab in Coreframe Connect works whether or not a workstation is running, and uploading isn't billed, so you can send footage overnight and launch in the morning. If you work with very large originals, cut with proxies on your own machine, upload only what the finish needs, and conform there.`,
    },
    {
      type: "figure",
      src: `${IMG}/save-to-nas.webp`,
      alt: "A save dialog on the remote workstation with the Coreframe Datalake (N:) drive selected.",
      width: 1546,
      height: 782,
      caption: "Saving output to the N: drive on the workstation (shown here from Blender). Anything on N: persists between sessions; the rest of the machine resets.",
    },
    { type: "h3", text: "Colour" },
    {
      type: "p",
      text: `What you see is a compressed video stream of the remote desktop. It's fine for editing, timing, motion and most grading decisions. It isn't a calibrated reference signal, and fine grain, banding and subtle colour shifts can look different through the stream than in the file. Grade on the workstation, then download the export and make final colour calls on that file on your own calibrated display.`,
    },
    { type: "h3", text: "Fonts and caches" },
    {
      type: "p",
      text: `Each session starts from a clean machine, and session accounts are standard Windows users. That has three practical effects:`,
    },
    {
      type: "ul",
      items: [
        "Fonts you install during a session are removed when it ends, along with anything else installed on the machine. Keep the project's fonts in a folder on your drive and install them for your user at the start of a session.",
        "Point the After Effects disk cache at the workstation's local drive. It's scratch space and is cleared when the session ends, so the first previews of each session are built fresh.",
      ],
    },
    {
      type: "p",
      text: `Creative Cloud is installed on the workstation; you sign in with your own Adobe account. The [After Effects and Premiere page](/software/after-effects-premiere-cloud-workstation) has the details.`,
    },
    { type: "h3", text: "Your connection" },
    {
      type: "p",
      text: `The ${NODE.stream.replace(" at ", ", ")} stream looks its best on about ${STREAM_BANDWIDTH.best4kMbps} Mbps and still holds up at ${STREAM_BANDWIDTH.workable4kMbps}; 1080p is comfortable on ${STREAM_BANDWIDTH.comfortable1080pMbps} Mbps. A wired connection, or Wi-Fi close to the router, keeps the stream steadier. Before you rely on it for client work, run a short first session and check playback, scrubbing and sound on your own network.`,
    },
    {
      type: "p",
      text: `If the connection drops mid-session, the workstation keeps running. Connect shows that the stream disconnected and holds the machine for 15 minutes so you can reconnect and carry on where you were.`,
    },
    {
      type: "figure",
      src: `${IMG}/session-held.webp`,
      alt: "Coreframe Connect showing an active workstation with a notice that the stream disconnected, the workstation is still running, and it can still be reconnected.",
      width: 923,
      height: 597,
      caption: "After a dropped stream: the workstation keeps running and Connect offers to reconnect. Recorded 30 Sep 2026; account name blurred.",
    },

    { type: "h2", text: "What a remote workstation won't do" },
    {
      type: "p",
      text: `It's one machine. If you need hundreds of After Effects frames rendered across many machines at once, a render farm that supports After Effects is built for that. And it won't replace a local edit suite for long-form work with terabytes of originals and a reference monitor; the upload and the stream are the wrong tools for that job.`,
    },

    { type: "h2", text: "A sensible first session" },
    {
      type: "ol",
      items: [
        "Install the Connect app on your Windows laptop and create an account (email and a WhatsApp code, no ID documents).",
        "Upload one real project and its footage to the Files tab before launching.",
        "Launch, sign in to Creative Cloud with your own Adobe account, and open the project from the N: drive.",
        "Scrub the timeline, run a RAM preview, and queue one export.",
        "Download the export and check it on your own screen. Then end the session so billing stops.",
      ],
    },
    ctx.hourly
      ? {
          type: "p",
          text: `${ctx.hourly} with GST included, billed per minute while you're streaming.${ctx.introPrice && ctx.introHours ? ` A new account's first top-up of ${ctx.introPrice} buys ${ctx.introHours}, enough for that test and some real work.` : ""} See [pricing](/pricing) for monthly plans.`,
        }
      : null,
  ],
  faqs: (ctx) => [
    {
      q: "Can I run After Effects on a cloud PC?",
      a: `Yes. A Coreframe workstation is a Windows desktop with an NVIDIA ${NODE.gpu} and ${NODE.ram} of RAM, and After Effects, Premiere Pro and Media Encoder run on it under your own Adobe account. You use it through the Coreframe Connect app on a Windows computer.`,
    },
    {
      q: "Does Coreframe supply an Adobe licence?",
      a: "No. Creative Cloud is installed on the workstation, and you sign in with your own Adobe account, so it runs on your own subscription.",
    },
    {
      q: "How do I get my footage onto the workstation?",
      a: "Upload it to your persistent project drive from the Files tab in the Connect app. Uploading isn't billed and works without a workstation running, so large uploads can run before the session starts.",
    },
    {
      q: "Can I colour grade over the stream?",
      a: "You can grade, but the stream is compressed video, not a reference signal. Make final colour decisions on the exported file after downloading it.",
    },
    {
      q: "What happens to my files after a session?",
      a: `Files on your project drive stay between sessions, and ${ctx.storageGb} GB is included. Everything else on the workstation is cleared when the session ends.`,
    },
  ],
  related: [
    { href: "/software/after-effects-premiere-cloud-workstation", label: "After Effects and Premiere Pro on Coreframe" },
    { href: "/cloud-workstation-vs-render-farm", label: "Cloud workstation vs render farm" },
    { href: "/how-to-use", label: "How a session works" },
    { href: "/download", label: "Download Coreframe Connect" },
    { href: "/pricing", label: "Pricing" },
  ],
};
