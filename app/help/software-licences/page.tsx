import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbList } from "@/lib/seo";
import { LICENCE_NOTICE_ON, LICENCE_STATEMENT } from "@/lib/licence-notice";

/**
 * How to sign out of common apps before a session ends (gpu-product-1110,
 * item 3; owner, 11 Nov 2026). Linked from the licence statement on the GPU
 * ladder, /compute-nodes, the software pages and My Activity.
 *
 * Hidden (404) unless NEXT_PUBLIC_LICENCE_NOTICE=1. No prices, so no /usd copy
 * (proxy.ts rewrites only the pages in its PAGES list). Not in the sitemap
 * yet: add it there (and to lib/page-dates.ts) when the flag goes on for good.
 *
 * Factual only: where the sign-out sits in each app today, with the note that
 * menus move between versions and a link to each vendor's own help. No claim
 * about any vendor's licence terms.
 */

export async function generateMetadata(): Promise<Metadata> {
  if (!LICENCE_NOTICE_ON) return {};
  return {
    title: "Sign out of licensed apps before you end",
    description:
      "Where the sign-out sits in Adobe, Autodesk, Chaos, Lumion, SketchUp, Rhino, Unreal Engine, Twinmotion and D5 Render, so your licence is free for your own computer.",
    alternates: { canonical: "/help/software-licences" },
  };
}

const APPS: { name: string; steps: string; vendor: { label: string; href: string } }[] = [
  {
    name: "Adobe",
    steps:
      "In the Creative Cloud desktop app, click your profile picture (top right) and choose Sign out. Or, in any Adobe app, choose Help → Sign Out.",
    vendor: { label: "Adobe Help Center", href: "https://helpx.adobe.com/" },
  },
  {
    name: "Autodesk (Revit, AutoCAD, 3ds Max)",
    steps: "Click your name at the top right of the app and choose Sign Out. Or open Autodesk Access and sign out there.",
    vendor: { label: "Autodesk support", href: "https://www.autodesk.com/support" },
  },
  {
    name: "Chaos (V-Ray, Enscape, Corona, Vantage)",
    steps:
      "Sign out of your Chaos account from the app's licence menu. Or, on the workstation, open http://localhost:30304 (the Chaos License Server) and sign out there.",
    vendor: { label: "Chaos help", href: "https://support.chaos.com/" },
  },
  {
    name: "Lumion",
    steps:
      "Sign out of your Lumion account from Lumion's account or settings menu. If you use a licence key, follow Lumion's own guide to move it to another computer before you end the session.",
    vendor: { label: "Lumion support", href: "https://support.lumion.com/" },
  },
  {
    name: "SketchUp",
    steps: "Choose Help → Sign Out (your Trimble ID).",
    vendor: { label: "SketchUp help", href: "https://help.sketchup.com/" },
  },
  {
    name: "Rhino 7 and 8",
    steps: "Choose Tools → Options → Licenses and click Logout (Cloud Zoo).",
    vendor: { label: "Rhino support", href: "https://www.rhino3d.com/support/" },
  },
  {
    name: "Unreal Engine and Twinmotion",
    steps: "In the Epic Games Launcher, click your profile (top right) and choose Sign Out.",
    vendor: { label: "Epic Games help", href: "https://www.epicgames.com/help/" },
  },
  {
    name: "D5 Render",
    steps: "Click your avatar (top right) and choose Log out.",
    vendor: { label: "D5 Render", href: "https://www.d5render.com/" },
  },
];

export default function SoftwareLicencesHelpPage() {
  if (!LICENCE_NOTICE_ON) notFound();

  return (
    <main className="text-ink">
      <JsonLd
        data={breadcrumbList([{ name: "Sign out of licensed apps", path: "/help/software-licences" }])}
      />

      <section className="cf-section cf-pagehero px-5 pb-0">
        <div className="cf-col">
          <p className="cf-eyebrow mb-5">Help</p>
          <h1 className="cf-display">Sign out of licensed apps before you end.</h1>
          <p className="cf-lead mt-[22px]">
            Your licence stays yours. Signing out on the workstation frees it for your own computer.
          </p>
        </div>
      </section>

      <section className="cf-section px-5 pb-0">
        <div className="cf-col">
          <h2 className="cf-section-title">Why sign out.</h2>
          <p className="cf-section-copy mt-4">
            When your session ends, the workstation is cleared. Many vendors still count a signed-in computer as one
            of your activations until you sign out. Signing out first frees it for your own computer.
          </p>
          <p className="cf-section-copy mt-4">
            If you have a persistent workstation, your C: drive and apps are kept. Sign out anyway if you want the
            licence free elsewhere between sessions.
          </p>
          <p className="mt-6 rounded-[16px] border border-rule bg-paper-2 px-4 py-3 text-[14px] leading-6 text-ink-2 sm:px-5">
            {LICENCE_STATEMENT}
          </p>
        </div>
      </section>

      <section className="cf-section px-5">
        <div className="cf-col">
          <h2 className="cf-section-title">Where the sign-out is.</h2>
          <p className="cf-section-copy mt-4">
            Menus move between versions. If a step does not match what you see, the vendor&apos;s own help has the
            current one.
          </p>
          <div className="mt-6 divide-y divide-rule rounded-[24px] border border-rule">
            {APPS.map((app) => (
              <details key={app.name} className="group px-5 sm:px-6">
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 font-medium text-ink [&::-webkit-details-marker]:hidden">
                  {app.name}
                  <span aria-hidden className="text-ink-3 transition group-open:rotate-45">+</span>
                </summary>
                <p className="text-[15px] leading-6 break-words text-ink-2">{app.steps}</p>
                <a
                  href={app.vendor.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mb-3 inline-flex min-h-[44px] items-center text-[14px] text-blue underline underline-offset-4"
                >
                  {app.vendor.label}
                </a>
              </details>
            ))}
          </div>
          <p className="mt-6 text-[14px] leading-6 text-ink-2">
            Using an app that is not listed?{" "}
            <Link href="/contact" className="inline-flex min-h-[44px] items-center text-ink underline underline-offset-4">
              Ask us
            </Link>
            {" "}or see{" "}
            <Link href="/apps" className="inline-flex min-h-[44px] items-center text-ink underline underline-offset-4">
              what is preinstalled
            </Link>
            .
          </p>
        </div>
      </section>
    </main>
  );
}
