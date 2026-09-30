import type { Metadata } from "next";
import Link from "next/link";
import { NODE } from "@/lib/node-spec";
import {
  BRING_YOUR_OWN_LICENCE,
  PREINSTALLED,
  type SoftwareItem,
} from "@/lib/software-catalogue";

export const metadata: Metadata = {
  title: "Preinstalled software on Coreframe GPU workstations",
  description:
    "Every Coreframe workstation ships with Blender, Twinmotion 2026.1, Unreal Engine 5.8, D5 Render, Autodesk viewers and the usual utilities ready to use. Bring your own licence for Lumion, Enscape, Revit or anything else you need.",
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
 * correct one, and the catalogue's own note on Steam says why: the session
 * account is not an administrator, so an installer that asks for administrator
 * rights cannot be run by the customer. Every mention on this page now says
 * the same thing.
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
    a: `Every workstation ships with ${preinstalledSentence}, along with the NVIDIA Studio driver and the Visual C++ and .NET runtimes. They are ready the moment the desktop appears.`,
  },
  {
    q: "Can I install my own software on a Coreframe workstation?",
    a: "Applications are installed for you rather than by you: your session runs as a standard Windows user, which is what lets us guarantee the workstation is reset to a clean image before the next customer. D5 Render, Twinmotion, Unreal Engine, Blender and the rest of the standard set are already on the machine. Revit, AutoCAD, 3ds Max, V-Ray, Lumion and Enscape are set up with you once — those vendors need your own account to download — and after that they are on every workstation you launch, running on your own licence.",
  },
  {
    q: "Does Coreframe provide licences for D5 Render, Lumion or Autodesk software?",
    a: "No. Commercial applications are licensed to you, not to the machine. You sign in with your own subscription exactly as you would on your own PC. Only free and open-source software is ready to use without a licence of your own.",
  },
  {
    q: "Does software I install stay on the workstation for next time?",
    a: "Every session starts from an identical clean image, so nothing from the previous customer — or from your own previous session — remains on the machine. Your project files are kept separately on NAS storage, which does persist between sessions. If you need a particular application every day, tell us and we add it to the standard image.",
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <section className="cf-section px-5">
        <div className="cf-col">
          <p className="cf-eyebrow mb-5">Software</p>
          <h1 className="cf-display">What is already on the machine.</h1>
          <p className="cf-lead mt-6">
            Every Coreframe workstation is a full {NODE.os} desktop with a{" "}
            {NODE.gpu} in it. A standard set of tools is installed and ready the
            moment your desktop appears, and you sign in to each one with your
            own licence. Anything free and missing, we add to the image on
            request. Licensed applications we set up with you once, because the
            vendor needs your account to download.
          </p>
        </div>
      </section>

      <div className="cf-rule" />

      <Group
        title="Ready to use, no licence needed."
        blurb="Free and open-source software on the standard image. Open it and start working."
        items={PREINSTALLED}
      />

      <div className="cf-rule" />

      <Group
        title="Your licence, our machine."
        blurb="These are licensed to you rather than to the machine. We set them up with you once — the vendor needs your own account to download — and after that they are on every workstation you launch, signed in with your subscription. We never supply licences for commercial software."
        items={BRING_YOUR_OWN_LICENCE}
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
              That is a design decision rather than a limitation. It is what
              guarantees no trace of anyone else&apos;s project can reach you,
              which matters when your work is under NDA. Keep your files on the
              NAS drive, which persists between sessions and is mapped into
              every workstation you launch.
            </p>
            <p className="cf-section-copy mt-4">
              Using the same application every day?{" "}
              <Link href="/contact" className="text-blue underline underline-offset-4">
                Tell us
              </Link>{" "}
              and we add it to the standard image, so it is waiting for you next
              time.
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
