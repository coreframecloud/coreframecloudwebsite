import { NODE } from "@/lib/node-spec";
import { BANDWIDTH_SENTENCE } from "@/lib/streaming-terms";
import type { BlogPost } from "../types";

const SLUG = "geforce-now-vs-cloud-workstation";
const IMG = `/blog/${SLUG}`;

/**
 * WHY THIS POST. GeForce NOW launched in India in July 2026 with an RTX 5080
 * class tier, and its plans are priced in the same range as an hour on our
 * workstation (research file 10 Oct 2026, §1 "Also relevant"). People who
 * search "rtx 5080 cloud india" now land on a gaming service and ask whether
 * it runs D5. Nobody answers that question; this does.
 *
 * NO GEFORCE NOW PRICES, on purpose: they change, and the point of the post
 * is what each product is, not what it costs. Statements about GeForce NOW
 * are limited to what it publicly is (a game-streaming service for supported
 * titles) and avoid feature claims we cannot check.
 */
export const geforceNowVsWorkstation: BlogPost = {
  slug: SLUG,
  title: "GeForce NOW or a cloud workstation? Why a gaming RTX 5080 won't open your D5 project",
  metaTitle: "GeForce NOW vs a Cloud Workstation",
  description:
    "GeForce NOW streams supported games. D5, Lumion, Revit and Blender need a full Windows desktop with your files and licences. How to tell the two apart.",
  targetQueries: [
    "geforce now for d5 render",
    "geforce now for work",
    "geforce now vs cloud pc",
    "rtx 5080 cloud india",
    "shadow pc india",
  ],
  datePublished: "2026-10-10",
  draft: true,
  eyebrow: "Explainer · Cloud GPUs",
  hero: {
    src: `${IMG}/file-on-workstation.webp`,
    alt: "A full Windows desktop streamed from a Coreframe workstation, with application icons including D5 Launcher, Twinmotion, Revit and 3ds Max, and a project drive open in File Explorer.",
    width: 1546,
    height: 782,
    caption:
      "What a cloud workstation gives you: a whole Windows desktop with your applications and a project drive. A game-streaming service gives you a game.",
  },
  answer: () =>
    `No, GeForce NOW can't run D5 Render, Lumion, Revit or other work software. It's NVIDIA's cloud gaming service: it streams games from a list of supported titles, and you don't get a Windows desktop, a place to keep project files, or a way to install your own applications. Its top tier uses RTX 5080-class hardware, so the GPU sounds the same as a cloud workstation's. The product around it is different. For design and rendering work you need a cloud workstation, which is a whole Windows PC with the GPU, your software, your licences and your files, streamed to your laptop.`,
  body: (ctx) => [
    { type: "h2", text: "What GeForce NOW is" },
    {
      type: "p",
      text: `GeForce NOW runs games on NVIDIA's servers and streams the picture to your screen. You link the game stores where you already own games, pick a supported title, and play. It arrived in India in July 2026, and its top tier runs on RTX 5080-class hardware. For games it's a good service. The software list is the game catalogue, though, and the session is the game, so there's no desktop to work in.`,
    },
    {
      type: "p",
      text: `That's why the question "can I run D5 on GeForce NOW" comes up, and why the answer is no. D5, Lumion, Enscape, Revit and Blender aren't games in its catalogue, and there's no way to install them yourself.`,
    },

    { type: "h2", text: "What a cloud workstation is" },
    {
      type: "p",
      text: `A cloud workstation is a remote Windows computer that you use as if it were under your desk. You see its desktop, open File Explorer, run your applications, sign in to your licences and save files to a drive that's still there next time. Ours is an ${NODE.gpu} with ${NODE.vram}, ${NODE.ram} of RAM and an ${NODE.cpu} on ${NODE.os}, hosted in ${NODE.location}. D5 Render, Blender and Twinmotion are preinstalled; licensed tools like Revit, 3ds Max and Lumion run with your own licence.`,
    },
    {
      type: "figure",
      src: `${IMG}/blender-optix.webp`,
      alt: "Blender's Preferences on a Coreframe workstation with OptiX selected and the NVIDIA GeForce RTX 5080 ticked as the Cycles render device.",
      width: 1546,
      height: 782,
      caption: "Blender on a Coreframe workstation, set to render on the RTX 5080. Ordinary Windows software, configured the way you would at your own desk.",
    },

    { type: "h2", text: "Side by side" },
    {
      type: "table",
      head: ["", "Game-streaming service", "Cloud workstation"],
      rows: [
        ["What you get", "A game, streamed", "A full Windows desktop, streamed"],
        ["Software", "Supported titles from its catalogue", "Windows applications: preinstalled ones plus your licensed tools"],
        ["Your files", "Game saves", "A persistent project drive for models, textures and renders"],
        ["Licences", "Your game-store accounts", "Your D5, Autodesk, Chaos, Adobe or other accounts"],
        ["Typical use", "Playing", "Modelling, rendering, editing, client presentations"],
        ["How it's billed", "Memberships and passes", "Time on the machine (ours: per minute)"],
      ],
    },

    { type: "h2", text: "Why the same GPU isn't the same product" },
    {
      type: "p",
      text: `A graphics card is only part of what makes rendering work possible. A real-time renderer like D5, Lumion or Enscape also needs a full Windows display driver, room on disk for asset libraries, your project files next to it, and an account it can sign in to. Professional tools often add plugins, licence servers and links to other applications, such as Revit to D5 or SketchUp to Enscape.`,
    },
    {
      type: "p",
      text: `A game-streaming service is built to start one game quickly and hand it to you. That's the right design for games and the wrong one for work, which is a pile of applications and files that have to be there together.`,
    },

    { type: "h2", text: "Other services people mix up" },
    { type: "h3", text: "AI GPU clouds" },
    {
      type: "p",
      text: `Most cloud GPU providers, in India and abroad, rent Linux servers with data-centre GPUs for training and running AI models. They're good at that. Many of those cards are compute-only and lack the Windows display driver that real-time renderers need. Lumion's own support pages warn that many cloud desktops can't run Lumion.`,
    },
    { type: "h3", text: "Cloud PC services sold abroad" },
    {
      type: "p",
      text: `Some well-known cloud PC services aren't sold in India. Shadow's professional cloud PCs, for example, were not available in India when we checked their country list on 10 October 2026 ([shadow.tech/pro](https://shadow.tech/pro/)). Check availability and where the machines are hosted before you sign up: a desktop streamed from Europe or the US will feel slower in India than one streamed from nearby.`,
    },
    { type: "h3", text: "Remote access to your own office PC" },
    {
      type: "p",
      text: `If the office already has a powerful desktop, remote-access software lets you use it from home. That costs nothing extra and is a perfectly good answer for one person. It stops working when two people need the machine at once, when the office power or internet goes down, or when you need a second machine for a deadline.`,
    },

    { type: "h2", text: "Does the stream feel different for work?" },
    {
      type: "p",
      text: `Both kinds of service send you compressed video of a screen and send your mouse and keyboard back. For a game that's the whole job. For design work the stream carries a desktop: small interface text, thin lines in a model, and a viewport you orbit for minutes at a time while you set up a camera. Ours streams at up to ${NODE.stream}, which keeps interface text readable, and the machines are in ${NODE.location}, so the round trip for users in India stays short.`,
    },
    {
      type: "p",
      text: `The stream can't stand in for a calibrated monitor, so check final colour on the image you download, on your own screen. Our [After Effects guide](/blog/after-effects-on-a-remote-gpu) goes into this for video work.`,
    },

    { type: "h2", text: "Which one should you pay for?" },
    {
      type: "p",
      text: `If you only want to play games, a game-streaming service is built for that and a workstation isn't the tool. If you need to open a D5, Lumion, Revit, 3ds Max or Blender project, render it and keep the files, you need a workstation, whether it's on your desk or in a data centre. If you do both, pay for each one for its own job. A workstation billed by the minute costs nothing in the weeks you don't use it.`,
    },

    { type: "h2", text: "How to tell whether a cloud GPU will run your software" },
    {
      type: "p",
      text: `Ask five questions before you pay for anything:`,
    },
    {
      type: "ol",
      items: [
        "Do I get a full Windows desktop, or only specific applications?",
        "Can my exact applications run on it, with my own licences? Is someone there to set them up if they need it?",
        "Is there persistent storage for my projects, and how much?",
        "Is the GPU a consumer or workstation card with a full Windows display driver?",
        "Where are the machines, and how is it billed: per minute, per hour or per month?",
      ],
    },
    {
      type: "p",
      text: `For a Coreframe workstation the answers are: a full ${NODE.os} desktop; preinstalled D5, Blender and Twinmotion plus your own licensed tools; ${ctx.storageGb} GB of persistent storage included; an ${NODE.gpu} with the standard Windows driver; hosted in ${NODE.location}${ctx.hourly ? ` and billed per minute at ${ctx.hourly} with GST included` : " and billed per minute"}.`,
    },

    { type: "h2", text: "What you need on your side" },
    {
      type: "p",
      text: `Any Windows laptop or desktop with the [Coreframe Connect app](/download) and a steady connection. ${BANDWIDTH_SENTENCE} Your own GPU doesn't matter, because nothing renders locally. Connect is Windows only today, so it won't run on a Mac yet. Sign-up takes an email and a code sent to your WhatsApp, with no ID documents, and international cards work.`,
    },
    ctx.introPrice && ctx.introHours
      ? {
          type: "p",
          text: `If you came here from a search for an RTX 5080 in the cloud, the fastest way to see the difference is to open your own project on one. A new account's first top-up of ${ctx.introPrice} buys ${ctx.introHours} on the ${NODE.gpu}. The [D5 Render](/d5-render-cloud-workstation) and [Lumion](/lumion-cloud-gpu) pages cover those two in detail.`,
        }
      : {
          type: "p",
          text: `The [D5 Render](/d5-render-cloud-workstation) and [Lumion](/lumion-cloud-gpu) pages cover those two in detail.`,
        },
  ],
  faqs: (ctx) => [
    {
      q: "Can I run D5 Render on GeForce NOW?",
      a: "No. GeForce NOW streams supported games. It does not give you a Windows desktop or let you install applications such as D5 Render, Lumion or Revit.",
    },
    {
      q: "Is GeForce NOW's RTX 5080 the same as a cloud workstation's RTX 5080?",
      a: "The GPU class can be the same. What differs is everything around it: a cloud workstation is a whole Windows computer with your software, licences and project files, while a game-streaming service runs one supported game.",
    },
    {
      q: "Can I use GeForce NOW for Blender or video editing?",
      a: "Work software that is not in its game catalogue does not run on it. For Blender, After Effects or Premiere Pro you need a cloud workstation or your own PC.",
    },
    {
      q: "Is Shadow PC available in India?",
      a: "When we checked on 10 October 2026, India was not in the country list for Shadow's professional cloud PCs. Check their site for current availability.",
    },
    {
      q: "What does Coreframe give me instead?",
      a: `A full ${NODE.os} desktop with an NVIDIA ${NODE.gpu} (${NODE.vram}) and ${NODE.ram} of RAM, hosted in ${NODE.location}, with ${ctx.storageGb} GB of persistent project storage, reached through the Coreframe Connect app${ctx.hourly ? ` and billed per minute at ${ctx.hourly} including GST` : ""}.`,
    },
  ],
  related: [
    { href: "/d5-render-cloud-workstation", label: "D5 Render on a cloud RTX 5080" },
    { href: "/lumion-cloud-gpu", label: "Lumion on a cloud RTX 5080" },
    { href: "/software/gpu-workstation-rental-india", label: "Rent an RTX 5080 workstation in India" },
    { href: "/cloud-workstation-vs-render-farm", label: "Cloud workstation vs render farm" },
    { href: "/apps", label: "What's installed on a workstation" },
  ],
};
