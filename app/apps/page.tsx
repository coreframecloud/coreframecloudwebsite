import type { Metadata } from "next";
import Link from "next/link";
import {
  BRING_YOUR_OWN_LICENCE,
  PREINSTALLED,
  type SoftwareItem,
} from "@/lib/software-catalogue";

export const metadata: Metadata = {
  title: "Preinstalled software on Coreframe GPU workstations",
  description:
    "Every Coreframe workstation ships with Blender, Twinmotion, Autodesk viewers and the usual utilities ready to use. Install D5 Render, Lumion, Enscape, Revit or anything else you need with your own licence.",
  alternates: { canonical: "/apps" },
};

/**
 * The honest answer to "what's already on the machine?".
 *
 * Both lists come from lib/software-catalogue.ts, which mirrors the install
 * script that builds the node image — so this page cannot quietly promise
 * software the workstation does not have.
 */

function Group({ title, blurb, items }: { title: string; blurb: string; items: SoftwareItem[] }) {
  const categories = Array.from(new Set(items.map((i) => i.category)));
  return (
    <section className="mt-16">
      <h2 className="text-2xl font-semibold text-white">{title}</h2>
      <p className="mt-3 max-w-3xl text-white/60 leading-7">{blurb}</p>

      {categories.map((category) => (
        <div key={category} className="mt-8">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-cyan-300/70">
            {category}
          </h3>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {items
              .filter((i) => i.category === category)
              .map((item) => (
                <li
                  key={item.name}
                  className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4"
                >
                  <div className="font-medium text-white">
                    {item.vendorUrl ? (
                      <a
                        href={item.vendorUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-cyan-300"
                      >
                        {item.name}
                      </a>
                    ) : (
                      item.name
                    )}
                  </div>
                  <p className="mt-1 text-sm leading-6 text-white/50">{item.note}</p>
                </li>
              ))}
          </ul>
        </div>
      ))}
    </section>
  );
}

export default function AppsPage() {
  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What software is preinstalled on a Coreframe GPU workstation?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "Every workstation ships with Blender, Twinmotion, Autodesk DWG TrueView, Navisworks Freedom, eDrawings Viewer, GIMP, Krita, Paint.NET, 7-Zip, Chrome, Firefox, Adobe Acrobat Reader, VLC, Notepad++, Python, the NVIDIA Studio driver and the Visual C++ and .NET runtimes. They are ready the moment the desktop appears.",
        },
      },
      {
        "@type": "Question",
        name: "Can I install my own software on a Coreframe workstation?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "Yes. You have a full Windows desktop with administrator rights for the length of your session, so you can install anything you need — D5 Render, Lumion, Enscape, Revit, AutoCAD, 3ds Max, V-Ray or any other application. Software you install lasts for that session; the workstation is reset to a clean image afterwards.",
        },
      },
      {
        "@type": "Question",
        name: "Does Coreframe provide licences for D5 Render, Lumion or Autodesk software?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "No. Commercial applications are licensed to you, not to the machine. You sign in with your own subscription exactly as you would on your own PC. Only free and open-source software is preinstalled and ready to use without a licence of your own.",
        },
      },
      {
        "@type": "Question",
        name: "Does software I install stay on the workstation for next time?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "No, and that is deliberate. Every session starts from an identical clean image, so nothing from the previous customer — or from your own previous session — remains on the machine. Your project files are kept separately on NAS storage, which does persist between sessions. If you use a particular application every day, ask us and we will add it to the standard image.",
        },
      },
    ],
  };

  return (
    <main className="mx-auto max-w-5xl px-6 py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }}
      />

      <h1 className="text-3xl font-semibold text-white sm:text-4xl">
        What&apos;s already installed
      </h1>
      <p className="mt-5 max-w-3xl text-lg leading-8 text-white/70">
        Every Coreframe workstation is a full Windows machine with an RTX GPU and administrator
        rights. A standard set of tools is installed and ready the moment your desktop appears,
        and you can install anything else you need for the session.
      </p>

      <Group
        title="Ready to use, no licence needed"
        blurb="Free and open-source software we install on the standard image. Open it and start working."
        items={PREINSTALLED}
      />

      <Group
        title="Install with your own licence"
        blurb="These are licensed to you rather than to the machine, so you install them and sign in with your own subscription — the same way you would on a new PC. We never supply licences for commercial software."
        items={BRING_YOUR_OWN_LICENCE}
      />

      <section className="mt-16 rounded-2xl border border-amber-400/25 bg-amber-400/[0.06] p-6">
        <h2 className="text-lg font-semibold text-amber-100">
          The workstation resets when your session ends
        </h2>
        <p className="mt-3 leading-7 text-amber-100/80">
          Anything you install during a session — and anything left on the desktop — is wiped
          when the session ends. Every customer starts from the same clean machine.
        </p>
        <p className="mt-3 leading-7 text-amber-100/70">
          This is a deliberate design choice rather than a limitation. It is what guarantees no
          trace of anyone else&apos;s project can reach you, which matters when your work is
          under NDA. Keep your files on the NAS drive, which persists between sessions and is
          mapped into every workstation you launch.
        </p>
        <p className="mt-3 leading-7 text-amber-100/70">
          Using the same application every day?{" "}
          <Link href="/contact" className="underline underline-offset-2 hover:text-amber-50">
            Tell us
          </Link>{" "}
          and we will add it to the standard image, so it is waiting for you next time.
        </p>
      </section>

      <div className="mt-12 flex flex-wrap gap-4">
        <Link href="/how-to-use" className="cf-btn-primary">
          How to use Coreframe
        </Link>
        <Link href="/#pricing" className="cf-btn-secondary">
          See pricing
        </Link>
      </div>
    </main>
  );
}
