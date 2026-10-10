import { NODE } from "@/lib/node-spec";
import { BANDWIDTH_SENTENCE } from "@/lib/streaming-terms";
import { WALKTHROUGH_YOUTUBE_ID } from "@/components/home/landing/walkthrough-section";
import type { BlogPost } from "../types";

const SLUG = "blender-interior-render-on-cloud-rtx-5080";
const IMG = `/blog/${SLUG}`;

/**
 * Every step, setting and figure here is read off the uncut walkthrough
 * recorded on 30 Sep 2026 (marketing-20261010/walkthrough). The one render
 * time visible in that video is deliberately NOT repeated in prose: it is a
 * fact about one scene at one sample count, and printed in an article it
 * reads as a promise about the reader's scene.
 */
export const blenderInteriorRender: BlogPost = {
  slug: SLUG,
  title: "Rendering an interior in Blender on a cloud RTX 5080: the whole session",
  metaTitle: "Blender Interior Render on Cloud RTX 5080",
  description:
    "One full session: upload a .blend, launch a Windows RTX 5080 workstation, switch Cycles to OptiX, render an interior, save it and download it. Every step shown.",
  targetQueries: [
    "blender cloud gpu",
    "render blender in the cloud",
    "best cloud pc for blender",
    "blender cycles cloud rendering india",
    "blender optix rtx 5080",
  ],
  datePublished: "2026-10-10",
  draft: true,
  eyebrow: "Walkthrough · Blender",
  hero: {
    src: `${IMG}/finished-render.webp`,
    alt: "A Cycles render of a grey living room with a floating staircase, two sofas and large abstract artworks.",
    width: 1152,
    height: 645,
    caption:
      "The finished frame, rendered in Cycles on the RTX 5080 workstation and opened on the laptop it was downloaded to. Scene: the Blender 4.1 splash-screen demo file.",
  },
  answer: () =>
    `To render a Blender scene on a cloud RTX 5080, you upload the .blend to your Coreframe drive, launch a workstation from the Connect app, open Blender on the remote Windows desktop, set Cycles to use the GPU through OptiX, render, save the image back to the same drive and download it. Blender is already installed, so there is nothing to license. The recording below shows one complete session, from signing in to the bill, and this article goes through it step by step with the exact settings we used.`,
  body: (ctx) => [
    {
      type: "video",
      youtubeId: WALKTHROUGH_YOUTUBE_ID,
      title: "Coreframe Cloud: a full session, start to finish",
      caption: "One session from sign-in to the bill, condensed to 4 min 39 s. The steps below follow it in order.",
    },

    { type: "h2", text: "What you need before you start" },
    {
      type: "p",
      text: `A Windows laptop or desktop with the [Coreframe Connect app](/download) installed, a Coreframe account, and a .blend file. Connect runs on Windows 10 and 11 only at the moment, so a Mac can't reach the workstation yet. Your own machine doesn't do any rendering, so its graphics card doesn't matter. What matters is the connection: ${BANDWIDTH_SENTENCE}`,
    },
    {
      type: "p",
      text: `The scene in the recording is the Blender 4.1 splash-screen file, one of the free [demo files on blender.org](https://www.blender.org/download/demo-files/). It's a furnished living room with a staircase, glass, fabric and a lot of bounced light, which makes it a fair stand-in for an architectural interior. The file is about 290 MB.`,
    },

    { type: "h2", text: "Step 1: sign in and pick the workstation" },
    {
      type: "p",
      text: `Connect asks for your email and sends a one-time code. Once you're in, the home screen shows your wallet balance and the machines you can launch. Today that is one type: an ${NODE.gpu} with ${NODE.vram}, ${NODE.ram} of RAM and an ${NODE.cpu}, hosted in ${NODE.location}.`,
    },
    {
      type: "figure",
      src: `${IMG}/connect-pick-workstation.webp`,
      alt: "The Coreframe Connect app showing the wallet balance and one available RTX 5080 workstation with 16 GB VRAM, region India, and a Launch button.",
      width: 923,
      height: 597,
      caption: "Connect on the laptop, recorded 30 Sep 2026. The account name has been blurred.",
    },
    ctx.hourly
      ? {
          type: "p",
          text: `The card shows the rate, ${ctx.hourly} with GST included. ${ctx.billing} You can see current rates and monthly plans on the [pricing page](/pricing).`,
        }
      : { type: "p", text: `${ctx.billing} Current rates are on the [pricing page](/pricing).` },

    { type: "h2", text: "Step 2: upload the .blend before you launch" },
    {
      type: "p",
      text: `The Files tab in Connect is your persistent project drive. Upload the .blend there first, while no workstation is running and nothing is being billed. A large file over a slow uplink can take a while, and there's no reason to pay for GPU minutes while it travels.`,
    },
    {
      type: "p",
      text: `If your scene links external textures, pack them into the .blend (File, External Data, Pack Resources) or upload the texture folder alongside it with the same relative paths. A missing texture renders pink on any machine, and it's an annoying thing to find after the render has started.`,
    },

    { type: "h2", text: "Step 3: launch and wait for the desktop" },
    {
      type: "p",
      text: `Press Launch. Connect prepares a clean machine and then starts the stream, and the Windows desktop of the workstation opens in a window on your laptop. Billing starts when the stream does; the preparation before it is free.`,
    },
    {
      type: "p",
      text: `Open File Explorer on the workstation and your drive is already there as Coreframe Datalake (N:), with the .blend you uploaded. You don't have to copy anything onto the machine first.`,
    },
    {
      type: "figure",
      src: `${IMG}/file-on-workstation.webp`,
      alt: "The remote Windows desktop with File Explorer open on Coreframe Datalake (N:), showing blender-4.1-splash.blend.",
      width: 1546,
      height: 782,
      caption: "The workstation's desktop, streamed to the laptop. The uploaded file is on the N: drive.",
    },

    { type: "h2", text: "Step 4: open Blender and turn on OptiX" },
    {
      type: "p",
      text: `Blender is preinstalled (version 5.2.2 LTS in the recording). Double-click the .blend on N: to open it. Before rendering, tell Cycles to use the GPU, because a fresh Blender install starts with GPU compute switched off:`,
    },
    {
      type: "ol",
      items: [
        "Edit, Preferences, System.",
        "Under Cycles Render Devices, choose OptiX.",
        `Tick the NVIDIA GeForce ${NODE.gpu}. Leave the CPU (an AMD Ryzen 7 9700X) unticked so the GPU does the work.`,
        "Close Preferences. In the Render Properties tab, set Device to GPU Compute.",
      ],
    },
    {
      type: "figure",
      src: `${IMG}/blender-optix.webp`,
      alt: "Blender Preferences, System tab, with OptiX selected and the NVIDIA GeForce RTX 5080 ticked. Render properties show Cycles and GPU Compute.",
      width: 1546,
      height: 782,
      caption: "Preferences on the workstation: OptiX, with the RTX 5080 ticked. Render settings on the right.",
    },
    {
      type: "p",
      text: `OptiX uses the RTX card's ray-tracing cores, and it's the option to pick on any NVIDIA RTX card. CUDA also works, and it's useful as a fallback if a particular add-on or feature misbehaves under OptiX.`,
    },

    { type: "h2", text: "Step 5: check the render settings" },
    {
      type: "p",
      text: `We kept the scene's own settings. Here they are, so you can compare them with yours:`,
    },
    {
      type: "spec",
      label: "Render settings in the recording",
      rows: [
        ["Render engine", "Cycles"],
        ["Device", "GPU Compute (OptiX)"],
        ["Max samples", "600"],
        ["Noise threshold", "0.01"],
        ["Denoiser", "OpenImageDenoise, albedo and normal, on GPU"],
        ["Output", "TIFF, 16-bit, RGBA"],
      ],
    },
    {
      type: "p",
      text: `Sample count and noise threshold decide most of the render time. If you're used to cutting samples on a laptop to get a frame out at all, try your normal production settings here first and lower them only if you need to.`,
    },

    { type: "h2", text: "Step 6: render, and watch the GPU" },
    {
      type: "p",
      text: `Press F12. It's worth opening Task Manager on the workstation (Performance, then the NVIDIA GPU) while it runs. In the recording the GPU sat at 95% utilisation, and dedicated GPU memory read 7.4 GB of the 16 GB available. Task Manager counts everything using the card, so its figure is higher than the peak of about 4.7 GB that Blender shows in the render window.`,
    },
    {
      type: "figure",
      src: `${IMG}/render-complete-task-manager.webp`,
      alt: "The finished Cycles render with Windows Task Manager beside it showing the NVIDIA GeForce RTX 5080 at 95% utilisation and 7.4 of 16.0 GB dedicated memory in use.",
      width: 1546,
      height: 782,
      caption: "The render finishing, with Task Manager open on the workstation. 7.4 of 16 GB of video memory in use.",
    },
    {
      type: "p",
      text: `If you're choosing hardware, this is the number to watch for your own scenes. By Task Manager's count, this one would have been tight on an 8 GB card. If you want to know where your own scenes sit, [our VRAM guide](/vram-for-architectural-rendering) explains how to measure them.`,
    },
    {
      type: "note",
      text: `We don't quote render times. The time in the video belongs to that scene at those settings, and your scene will be different. The way to find out is to open your own file in a session and render it.`,
    },

    { type: "h2", text: "Step 7: save the image to your drive" },
    {
      type: "p",
      text: `In the render window, Image, Save As. Pick the N: drive, choose a format and save. We used TIFF at 16 bits so there's headroom for grading later; PNG or EXR work the same way. Anything saved on N: stays there after the session ends. Anything saved to the workstation's own desktop or C: drive does not, because every session starts from a clean machine.`,
    },
    {
      type: "figure",
      src: `${IMG}/save-to-nas.webp`,
      alt: "Blender's Save As Image dialog on the workstation with Coreframe Datalake (N:) selected and the file named Result-Living Room.tif.",
      width: 1546,
      height: 782,
      caption: "Saving the result to the N: drive, which persists between sessions.",
    },

    { type: "h2", text: "Step 8: download it to your laptop" },
    {
      type: "p",
      text: `Switch back to Connect on your own machine and open Files. The new image is listed next to the .blend. Tick it and download. In the recording the 16-bit TIFF was 16.6 MB.`,
    },
    {
      type: "figure",
      src: `${IMG}/connect-files-download.webp`,
      alt: "The Files tab in Coreframe Connect listing blender-4.1-splash.blend (289.5 MB) and Result-Living Room.tif (16.6 MB) with download buttons.",
      width: 923,
      height: 597,
      caption: "The same drive seen from Connect on the laptop. The render is ready to download.",
    },

    { type: "h2", text: "Step 9: close the session so billing stops" },
    {
      type: "p",
      text: `End the session from Connect. If the stream drops on its own (a Wi-Fi blip, a closed lid), Connect tells you the workstation is still running and gives you a few minutes to reconnect; ending it is a deliberate step. Once it's closed, the session shows up in My Activity on the website with its length and cost, and the GST invoices for your top-ups are on the same page.`,
    },
    {
      type: "figure",
      src: `${IMG}/session-billing.webp`,
      alt: "The Recent Sessions table on the Coreframe website showing a session on 30 Sept 2026 lasting 18 minutes, with earlier shorter sessions below it.",
      width: 725,
      height: 342,
      caption: "The recorded session in My Activity: 18 minutes from stream start to close, billed by the minute.",
    },
    {
      type: "p",
      text: `The recorded session came to 18 billed minutes, from the stream starting to the session closing. The video condenses those 18 minutes into under five, so the bill is the number to go by.`,
    },

    { type: "h2", text: "Can I keep working while it renders?" },
    {
      type: "p",
      text: `Yes. The render runs on the workstation, so your laptop is free for email, modelling or anything else. You can minimise the Connect window and come back to it. The one thing to avoid is ending the session before the image is saved to N:.`,
    },

    { type: "h2", text: "When this is the wrong tool" },
    {
      type: "p",
      text: `A rented workstation is one machine. For a finished animation of hundreds of frames, a render farm can split the frames across many machines at once, and it will often be the better choice. We've written up [where each one wins](/cloud-workstation-vs-render-farm). For stills, look development and scenes your laptop can't open at all, one machine you drive yourself is usually the simpler answer.`,
    },
    ctx.introPrice && ctx.introHours
      ? {
          type: "p",
          text: `If you want to try this with your own file, a new account's first top-up of ${ctx.introPrice} buys ${ctx.introHours} on the ${NODE.gpu}. The [Blender page](/software/blender-cloud-workstation) has the short version of this guide.`,
        }
      : {
          type: "p",
          text: `The [Blender page](/software/blender-cloud-workstation) has the short version of this guide.`,
        },
  ],
  faqs: (ctx) => [
    {
      q: "Is Blender installed on the Coreframe workstation?",
      a: "Yes. Blender is preinstalled on every workstation (5.2.2 LTS when this was recorded), and it is free and open source, so there is no licence to bring.",
    },
    {
      q: "Should I use OptiX or CUDA for Cycles on an RTX 5080?",
      a: "OptiX. It uses the card's ray-tracing cores. Select it under Edit, Preferences, System, Cycles Render Devices, tick the RTX 5080, then set Device to GPU Compute in Render Properties. CUDA is a fallback if something misbehaves under OptiX.",
    },
    {
      q: "Where do my .blend files and renders go?",
      a: `On your persistent project drive, which appears as N: on the workstation and in the Files tab of the Connect app. ${ctx.storageGb} GB is included. Files saved anywhere else on the workstation are removed when the session ends, because each session starts from a clean machine.`,
    },
    {
      q: "How long will my Blender render take?",
      a: "We don't publish render times, because they depend on your scene, sample count and resolution. Open your own .blend in a session and render it; that answers the question for your work.",
    },
    {
      q: "Can I render a Blender animation on it?",
      a: "Yes, on one GPU. For long animations a render farm that supports Cycles can spread frames across many machines at once, which a single workstation cannot do.",
    },
    ctx.hourly
      ? {
          q: "What does a Blender session cost?",
          a: `${ctx.hourly} with GST included, billed per minute while the desktop is streaming. Uploading files before you launch is not billed.`,
        }
      : null,
  ],
  related: [
    { href: "/software/blender-cloud-workstation", label: "Blender on a cloud workstation" },
    { href: "/vram-for-architectural-rendering", label: "Is 8 GB of VRAM enough?" },
    { href: "/cloud-workstation-vs-render-farm", label: "Cloud workstation vs render farm" },
    { href: "/how-to-use", label: "How a session works" },
    { href: "/pricing", label: "Pricing" },
  ],
};
