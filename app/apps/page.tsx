import { FileSyncDiagram } from "@/components/visuals/diagrams";
import { PageByline } from "@/components/seo/page-byline";
import { OwnImage } from "@/components/visuals/media";
import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbList } from "@/lib/seo";
import Link from "next/link";
import { NODE } from "@/lib/node-spec";
import {
  BRING_YOUR_OWN_LICENCE,
  FREE_TO_INSTALL,
  PREINSTALLED,
  type SoftwareItem,
} from "@/lib/software-catalogue";

export const metadata: Metadata = {
  title: "Preinstalled software on the workstations",
  description:
    "Blender, D5 Render, Twinmotion and Unreal Engine are preinstalled on every Coreframe workstation. Bring your own licence for Lumion, Enscape, Revit and more.",
  alternates: { canonical: "/apps" },
};

/**
 * The honest answer to "what's already on the machine?".
 *
 * Both lists come from lib/software-catalogue.ts, which mirrors the install
 * script that builds the node image — so this page cannot quietly promise
 * software the workstation does not have.
 *
 * THE PAGE USED TO CONTRADICT ITSELF. The visible copy said licensed apps are
 * ones "you install", the FAQ said "installed for you rather than by you", and
 * the call-out warned that anything you install is wiped. The FAQ is the
 * correct one: applications are installed for you, and every mention on
 * this page now says the same thing.
 *
 * THE FAQ IS ALSO VISIBLE. FAQPage JSON-LD describing four questions that
 * appeared nowhere on the page is both a structured-data problem and how the
 * two got out of step. One array renders both.
 */

/** Built from the catalogue, so the schema answer cannot list software the
 *  machine does not have. It used to be an eighteen-item hand-typed sentence. */
const preinstalledNames = PREINSTALLED.map((i) => i.name);
const preinstalledSentence =
  preinstalledNames.slice(0, -1).join(", ") +
  " and " +
  preinstalledNames[preinstalledNames.length - 1];

const faqs = [
  {
    q: "What software is preinstalled on a Coreframe GPU workstation?",
    a: `Every workstation ships with ${preinstalledSentence}, ready the moment the desktop appears. Everything else you install yourself, with your own licence where the software needs one.`,
  },
  {
    q: "Can I install my own software on a Coreframe workstation?",
    a: "Yes. D5 Render, Twinmotion, Unreal Engine and Blender are already on the machine. Revit, AutoCAD, 3ds Max, V-Ray, Lumion, Enscape and the rest you install from your own vendor account and sign in with your own licence, exactly as on a new PC. Each session starts from a clean machine, so software you install is removed when it ends, unless you choose a persistent workstation (available on selected GPUs), which keeps your own Windows disk between sessions.",
  },
  {
    q: "Does Coreframe provide licences for D5 Render, Lumion or Autodesk software?",
    a: "No. Commercial applications are licensed to you, and the licence doesn't come with the machine. You sign in with your own subscription, the same as on your own PC. Only free and open-source software is ready to use without a licence of your own.",
  },
  {
    q: "Does software I install stay on the workstation for next time?",
    a: "Not on an hourly session. Every session starts from an identical clean image, so nothing from the previous customer, or from your own last session, is left on the machine. A persistent workstation (available on selected GPUs) keeps your own Windows disk, with your installed software, between sessions. Your project files are kept separately on your project drive, which always persists.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

function Group({ title, blurb, items }: { title: string; blurb: string; items: SoftwareItem[] }) {
  const categories = Array.from(new Set(items.map((i) => i.category)));
  return (
    <section className="cf-section px-5">
      <div className="cf-wide">
        <h2 className="cf-section-title">{title}</h2>
        <p className="cf-section-copy mt-4 max-w-[680px]">{blurb}</p>

        {categories.map((category) => (
          <div key={category} className="mt-10">
            <p className="cf-card-label">{category}</p>
            <ul className="mt-4 grid grid-cols-1 gap-7 sm:grid-cols-2">
              {items
                .filter((i) => i.category === category)
                .map((item) => (
                  <li key={item.name} className="cf-card">
                    <div className="font-semibold break-words text-ink">
                      {item.vendorUrl ? (
                        <a
                          href={item.vendorUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-[44px] items-center hover:text-blue"
                        >
                          {item.name}
                        </a>
                      ) : (
                        <span className="inline-flex min-h-[44px] items-center">{item.name}</span>
                      )}
                    </div>
                    <p className="mt-1 text-sm leading-[1.62] break-words text-ink-2">{item.note}</p>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function AppsPage() {
  return (
    <main className="text-ink">
      <JsonLd data={breadcrumbList([{ name: "Preinstalled software", path: "/apps" }])} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <section className="cf-section px-5 cf-pagehero">
        <div className="cf-wide grid items-center gap-10 lg:grid-cols-[1.05fr_1fr]">
          <div className="min-w-0">
          <p className="cf-eyebrow mb-5">Software</p>
          <h1 className="cf-display">What&apos;s already on the machine.</h1>
          <p className="cf-lead mt-6">
            A full Windows desktop ({NODE.os}) with Blender, D5 Render, Twinmotion and Unreal Engine already installed. Install anything else with your own licence.
          </p>
          <PageByline path="/apps" className="mt-4 opacity-75" />
        </div>
          <OwnImage src="/blog/blender-interior-render-on-cloud-rtx-5080/file-on-workstation.webp" alt="Blender ready on a Coreframe workstation" width={923} height={597} caption="Blender, D5, Twinmotion and Unreal Engine come installed." sizes="(max-width: 1024px) 100vw, 480px" />
        </div>
      </section>
      <section className="cf-section px-5 pb-0">
        <div className="cf-wide grid items-center gap-8 rounded-[28px] bg-tint-blue p-6 sm:p-10 lg:grid-cols-[0.8fr_1.2fr]">
          <h2 className="cf-section-title">Your files and the apps, on one machine.</h2>
          <div className="min-w-0"><FileSyncDiagram /></div>
        </div>
      </section>

      <div className="cf-rule" />

      <Group
        title="Ready to use, no licence needed."
        blurb="On every workstation the moment the desktop appears. Open it and start working; D5 and Twinmotion sign in with your own free or paid account."
        items={PREINSTALLED}
      />

      <div className="cf-rule" />

      <Group
        title="Your licence, our machine."
        blurb="These are licensed to you, and the licence stays yours. Install them from your own vendor account and sign in with your subscription, as on a new PC. Each session starts from a clean machine, so software you install is removed when it ends, unless you choose a persistent workstation (available on selected GPUs), which keeps your own Windows disk between sessions. We never supply licences for commercial software."
        items={BRING_YOUR_OWN_LICENCE}
      />

      <div className="cf-rule" />

      <Group
        title="Free tools you can add."
        blurb="Not on the image, but free to install in a session when you need them. Like anything you install, they go when the session ends unless you keep a persistent workstation."
        items={FREE_TO_INSTALL}
      />

      <div className="cf-rule" />

      <section className="cf-section px-5">
        <div className="cf-col">
          <div className="cf-note">
            <p className="cf-eyebrow mb-4 text-blue">Read this before you start</p>
            <h2 className="cf-section-title">The workstation resets when your session ends.</h2>
            <p className="cf-section-copy mt-4">
              Anything left on the desktop is wiped when the session ends. Every
              customer starts from the same clean machine.
            </p>
            <p className="cf-section-copy mt-4">
              We built it that way on purpose. It means nothing from anyone
              else&apos;s project can reach you, which matters when your work is
              under NDA. Keep your files on the
              NAS drive, which persists between sessions and is mapped into
              every workstation you launch.
            </p>
            <p className="cf-section-copy mt-4">
              Using the same application every day? A persistent workstation (available on
              selected GPUs) keeps your own Windows disk, with your installed software, between
              sessions.{" "}
              <Link href="/contact" className="text-blue underline underline-offset-4">
                Ask us
              </Link>{" "}
              which cards offer it.
            </p>
          </div>
        </div>
      </section>

      <div className="cf-rule" />

      <section className="cf-section px-5">
        <div className="cf-col">
          <p className="cf-eyebrow mb-5">Questions</p>
          <h2 className="cf-section-title">What people ask about the software.</h2>
          <dl className="mt-10 divide-y divide-rule border-y border-rule">
            {faqs.map((f) => (
              <div key={f.q} className="py-6">
                <dt className="text-lg font-semibold tracking-[-0.02em] break-words text-ink">{f.q}</dt>
                <dd className="mt-2.5 text-base leading-[1.62] break-words text-ink-2">{f.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="cf-section px-5 pt-0">
        <div className="cf-col flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:gap-4">
          <Link href="/how-to-use" className="cf-btn-primary w-full sm:w-auto min-h-[44px]">
            How to use Coreframe
          </Link>
          <Link href="/pricing" className="cf-btn-secondary w-full sm:w-auto min-h-[44px]">
            See pricing
          </Link>
        </div>
      </section>
    </main>
  );
}
