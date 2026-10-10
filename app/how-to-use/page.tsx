import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { NODE } from "@/lib/node-spec";

export const metadata: Metadata = {
  title: "How to use Coreframe — GPU workstations for 3D rendering",
  description:
    "Set up Coreframe in ten minutes: sign up with email and mobile, add credit, install Coreframe Connect, launch a Windows RTX workstation, and work with your files on persistent NAS storage. Billed per minute of streaming.",
  alternates: { canonical: "/how-to-use" },
};

/**
 * The page a new customer reads before their first session, and the page an AI
 * answer engine quotes when someone asks how this works.
 *
 * Written question-first: each H2 is a question a real person types, so an
 * assistant retrieving this file finds an answer already shaped like an answer.
 * Everything it claims must stay true of the product — this is the page people
 * will hold us to.
 *
 * STEPS and FAQS feed both the visible page and the HowTo / FAQPage JSON-LD, so
 * the structured data cannot drift from the copy. Edit the array, not the
 * markup.
 */

const STEPS = [
  {
    title: "1. Create an account.",
    body: "Sign up with your email address. Choose Individual if you're a freelancer or working on your own projects, or Business if you're GST-registered and need invoices in the company's name. A business account also asks for your registered name and GSTIN, which then appear on every tax invoice.",
  },
  {
    title: "2. Confirm your mobile number.",
    body: "We send a one-time code to your mobile on WhatsApp. Indian regulations (CERT-In) require a verified contact number for anyone renting compute, so this comes before a workstation can start. Any country code works, and there are no ID documents to upload.",
  },
  {
    title: "3. Add credit.",
    body: "Top up your wallet from the website or the app by card, UPI or netbanking. International cards work too. New customers get an intro offer on their first top-up, and the current terms are on the Pricing page. Pay-as-you-go has no setup fee and no monthly minimum. Business accounts can be invoiced monthly instead of prepaying.",
  },
  {
    title: "4. Install Coreframe Connect.",
    body: "Connect is the Windows client. It handles the private network link and the stream, so there's nothing else to set up. Download it from your account in Chrome (Edge blocks the file outright), then run the installer and sign in. Windows will warn you about it because the installer isn't code-signed yet. The Installing on Windows section below shows the two clicks that get past the warning.",
  },
  {
    title: "5. Press Connect.",
    body: `Pick your machine and press Connect. A workstation is prepared for you and the desktop appears in about two minutes, streamed at ${NODE.stream}. Billing doesn't start until the stream does, and we never charge for provisioning time or failed connections.`,
  },
  {
    title: "6. Work, then end the session.",
    body: "You get a full Windows desktop with the professional applications already installed. Your storage is mapped as drive N:, labelled Coreframe Datalake. Save project files there and nowhere else. When you're done, end the session from Connect. Billing stops right then, and everything on N: stays where you left it.",
  },
];

const FAQS = [
  {
    q: "What is Coreframe?",
    a: `Coreframe rents Windows GPU workstations by the minute, hosted in India. You stream a real ${NODE.gpu} desktop to the laptop you already own and use it like a workstation under your desk, for D5 Render, Lumion, Enscape, Revit, 3ds Max, Blender, CFD work or anything else that needs a GPU. You drive the machine yourself. There's no job queue, because it isn't a render farm.`,
  },
  {
    q: "How is Coreframe billed?",
    a: "Per minute, and only while the stream is running. Billing starts when the remote desktop appears and stops when you end the session. We don't charge for provisioning time, failed connections or uploads. Prices include GST, and you get a tax invoice for every payment.",
  },
  {
    q: "Do I need my own software licences?",
    a: "For commercial applications, yes. D5 Render, Lumion, Enscape, V-Ray, Revit, AutoCAD, 3ds Max and the like are licensed to you, not the machine, so you install them and sign in with your own subscription. Free software is already installed: Blender, Twinmotion, Unreal Engine, the Autodesk viewers and the usual utilities.",
  },
  {
    q: "Can I install my own software on the workstation?",
    a: "We install the applications for you. Your session runs as a standard Windows user, which is how we can promise the machine goes back to a clean image before the next customer, with nothing you or anyone else ran surviving the reset. Portable software that doesn't need an installer will run. If you need an application we don't carry, email admin@coreframecloud.com. We add free software to the standard image, usually the same day. Licensed software from Autodesk, Chaos or Lumion needs your own account even to download, so we arrange a short setup session with you. After that it's on every workstation you launch.",
  },
  {
    q: "Where exactly do I save my files?",
    a: "On drive N:, labelled Coreframe Datalake. It's mapped for you before the desktop appears, and it's the only place that survives the session. The Desktop, Documents, Downloads and the whole C: drive are wiped when you finish, along with anything you installed. If your project uses linked assets (D5 Render, Twinmotion and 3ds Max all do), keep the whole project folder on N:, not just the scene file. Otherwise the links break as soon as the textures point somewhere that no longer exists. The easiest habit is to Save As to N: right at the start, so every later save lands in the right place.",
  },
  {
    q: "Why is the workstation wiped between sessions?",
    a: "So every customer starts from an identical, clean machine and nothing from anyone else's work can reach them. If your projects are under NDA, that's what you want. The previous session can't leave files, credentials or browser history behind for you to find, and yours can't leave anything for the next person.",
  },
  {
    q: "What internet speed do I need?",
    a: "About 20 Mbps is comfortable at 1080p, and around 50 Mbps shows the 4K stream at its best. A steady connection matters more than raw bandwidth. Streaming is more sensitive to latency and jitter than to throughput, so a wired connection or 5 GHz Wi-Fi beats a quicker link that drops packets.",
  },
  {
    q: "Can my whole studio use one account?",
    a: "No. Each person needs their own account, because the sign-in and contact record are per person. A business account holds the whole team under one organisation, with a shared wallet and a shared drive, so you get one bill and one place to manage seats while everyone signs in as themselves.",
  },
  {
    q: "Where are the machines located?",
    a: `In ${NODE.location}. That keeps latency low for Indian users, and it means your data and your invoices stay within Indian jurisdiction.`,
  },
  {
    q: "How do I get my files onto the workstation?",
    a: "Upload them to your Coreframe storage from the app or the website before the session, and they'll be on the mapped drive when the desktop appears. You can also download straight into the session from cloud storage you already use.",
  },
];

export default function HowToUsePage() {
  const howTo = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to use Coreframe GPU workstations",
    description:
      "Sign up with email and mobile, add credit, install Coreframe Connect and launch a Windows RTX GPU workstation for 3D rendering, billed per minute.",
    step: STEPS.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.title.replace(/^\d+\.\s*/, "").replace(/\.$/, ""),
      text: s.body,
    })),
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <main className="cf-section px-5">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howTo) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div className="cf-col">
        <div className="cf-eyebrow">How to use Coreframe</div>
        <h1 className="cf-display mt-3">From sign-up to your first render.</h1>
        <p className="cf-lead mt-5">
          Coreframe rents Windows GPU workstations by the minute, hosted in India. You stream a real{" "}
          {NODE.gpu} desktop to the computer you already own, work on it as normal, and pay for the
          minutes you use. Here&apos;s the whole thing, start to finish.
        </p>

        <section className="mt-14">
          <h2 className="cf-section-title">Six steps.</h2>
          <ol className="mt-8 space-y-8">
            {STEPS.map((step) => (
              <li key={step.title} className="cf-card">
                <h3 className="text-[17px] leading-6 font-semibold text-ink">{step.title}</h3>
                <p className="cf-section-copy mt-3">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Public on purpose. The same walkthrough lives on /download, but that page
            is behind sign-in, so there was no link anyone could send to a customer who
            was stuck BEFORE they got in. This one can be pasted into a WhatsApp reply. */}
        <section id="installing-on-windows" className="mt-14 scroll-mt-24">
          <h2 className="cf-section-title">Installing on Windows.</h2>
          <p className="cf-section-copy mt-3">
            Windows warns you about our installer, and the way past it isn&apos;t obvious. First,
            download in Chrome. Edge blocks the file outright and gives you no way through. Then, when the blue &ldquo;Windows protected your PC&rdquo; box appears,
            click <strong className="text-ink">More info</strong>, which is a small link and easy to
            miss, and then <strong className="text-ink">Run anyway</strong>.
          </p>
          <p className="cf-section-copy mt-3">
            The warning is there because our installer isn&apos;t code-signed yet, so Windows can&apos;t
            check the publisher. Windows builds that reputation as more people install it, so
            clicking through does help us get there. We&apos;re a young company and we&apos;d rather
            tell you that than pretend the warning isn&apos;t there. Nothing is wrong with your
            machine or with the file.
          </p>
          <figure className="mt-6">
            <Image
              src="/guide/windows-install.png"
              alt="Download in Chrome rather than Edge, then click More info and Run anyway in the Windows SmartScreen dialog."
              width={1080}
              height={1240}
              priority={false}
              className="h-auto w-full max-w-[460px] rounded-cf border border-rule"
            />
            <figcaption className="mt-2 text-xs leading-5 text-ink-3">
              An illustration of the dialog, not a screenshot of your machine.
            </figcaption>
          </figure>
        </section>

        <section id="saving-your-work" className="cf-note mt-14 scroll-mt-24">
          <h2 className="cf-section-title">Read this before your first session.</h2>
          <p className="cf-section-copy mt-3">
            The workstation resets between sessions. Software you install, and anything left on the
            Desktop, in Documents or on C:, is wiped when you finish. Only drive{" "}
            <span className="font-mono font-semibold text-ink">N:</span>, labelled Coreframe
            Datalake, survives. Save your work there and you won&apos;t lose any of it.
          </p>
          <p className="cf-section-copy mt-3">
            That reset is why every session starts on a clean, identical machine. Nothing is left
            over from the customer before you, and nothing of yours is left for the customer after.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="cf-section-title">Common questions.</h2>
          <div className="mt-8 space-y-7">
            {FAQS.map((faq) => (
              <div key={faq.q}>
                <h3 className="font-semibold break-words text-ink">{faq.q}</h3>
                <p className="mt-2 leading-7 break-words text-ink-2">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-14 flex flex-wrap gap-4">
          <Link href="/apps" className="cf-btn-secondary min-h-[44px]">
            What is preinstalled
          </Link>
          <Link href="/pricing" className="cf-btn-secondary min-h-[44px]">
            Pricing
          </Link>
          <Link href="/contact" className="cf-btn-secondary min-h-[44px]">
            Talk to us
          </Link>
        </div>
      </div>
    </main>
  );
}
