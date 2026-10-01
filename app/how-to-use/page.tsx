import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { NODE } from "@/lib/node-spec";

export const metadata: Metadata = {
  title: "How to use Coreframe — GPU workstations for 3D rendering",
  description:
    "Set up Coreframe in ten minutes: sign up, verify your identity, install Coreframe Connect, launch a Windows RTX workstation, and work with your files on persistent NAS storage. Billed per minute of streaming.",
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
    body: "Sign up with your email address. Choose Individual if you are a freelancer or working on your own projects, or Business if you are GST-registered and need invoices in the company's name. A business account also asks for your registered name and GSTIN, which then appear on every tax invoice.",
  },
  {
    title: "2. Verify your identity.",
    body: "Indian regulations require a verified subscriber record for anyone renting compute, so this step comes before a workstation can start. It runs through DigiLocker and takes a couple of minutes. If DigiLocker will not work for you, an Indian passport can be used instead. Business accounts verify the company as well: the GSTIN against the GST register, and control of the company bank account. The person is proved separately from the company, because neither stands in for the other.",
  },
  {
    title: "3. Add credit, or start the free trial.",
    body: "New accounts get free GPU minutes and storage to try the service, with no card. After that, top up your wallet from the app or the website. There is no setup fee and no monthly minimum on pay-as-you-go. Business accounts can be invoiced monthly instead of prepaying.",
  },
  {
    title: "4. Install Coreframe Connect.",
    body: "Connect is the Windows client. It handles the private network link and the stream, so there is nothing else to set up. Download it from your account using Chrome — Edge blocks the file outright — then run the installer and sign in. Windows will warn you about it, because the installer is not code-signed yet. Installing on Windows, below, shows the two clicks that get past it.",
  },
  {
    title: "5. Press Connect.",
    body: `Pick your machine and press Connect. A workstation is prepared for you and the desktop appears in about two minutes, streamed at ${NODE.stream}. Billing does not start until the stream does. Provisioning time and failed connections are never charged.`,
  },
  {
    title: "6. Work, then end the session.",
    body: "You get a full Windows desktop with the professional applications already installed. Your storage is mapped as drive N:, labelled Coreframe Datalake. Save project files there and nowhere else. When you are done, end the session from Connect. Billing stops at that moment and everything on N: stays where you left it.",
  },
];

const FAQS = [
  {
    q: "What is Coreframe?",
    a: `Coreframe rents Windows GPU workstations by the minute, hosted in India. You stream a real ${NODE.gpu} desktop to the laptop you already own and use it as you would a workstation under your desk — D5 Render, Lumion, Enscape, Revit, 3ds Max, Blender, CFD work, anything that needs a GPU. It is not a render farm. You drive the machine yourself rather than submitting jobs to a queue.`,
  },
  {
    q: "How is Coreframe billed?",
    a: "Per minute, and only while the stream is running. Billing starts when the remote desktop appears and stops when you end the session. Provisioning time, failed connections and uploads are not charged. Prices include GST and a tax invoice is issued for every payment.",
  },
  {
    q: "Do I need my own software licences?",
    a: "For commercial applications, yes. D5 Render, Lumion, Enscape, V-Ray, Revit, AutoCAD, 3ds Max and the like are licensed to you rather than to the machine, so you install them and sign in with your own subscription. Free software — Blender, Twinmotion, Unreal Engine, the Autodesk viewers and the usual utilities — is already installed.",
  },
  {
    q: "Can I install my own software on the workstation?",
    a: "The applications are installed for you rather than by you. Your session runs as a standard Windows user, which is what lets us promise the machine is reset to a clean image before the next customer: nothing you or anyone else runs can survive it. Anything portable that does not need an installer will run. If you need an application we do not carry, email admin@coreframecloud.com. Free software we add to the standard image, usually the same day. Licensed software — Autodesk, Chaos, Lumion — needs your own account even to download, so we arrange a short setup session with you, and after that it is on every workstation you launch.",
  },
  {
    q: "Where exactly do I save my files?",
    a: "On drive N:, labelled Coreframe Datalake. It is mapped for you before the desktop appears, and it is the only place that survives the session. The Desktop, Documents, Downloads and the whole C: drive are wiped when you finish, along with anything you installed. If your project uses linked assets — D5 Render, Twinmotion and 3ds Max all do — keep the entire project folder on N: rather than only the scene file, because the links break the moment the textures sit somewhere that no longer exists. The simplest habit is Save As to N: at the very start, so every later save already lands in the right place.",
  },
  {
    q: "Why is the workstation wiped between sessions?",
    a: "So every customer starts from an identical, clean machine and no trace of anyone else's work can reach them. If your projects are under NDA, this is the property you want: the previous session cannot leave files, credentials or browser history behind for you to find, and yours cannot for the next person.",
  },
  {
    q: "What internet speed do I need?",
    a: "About 20 Mbps is comfortable at 1080p, and around 50 Mbps shows the 4K stream at its best. Steadiness matters more than raw bandwidth — a wired connection or 5 GHz Wi-Fi beats a quicker link that drops packets, because streaming is more sensitive to latency and jitter than to throughput.",
  },
  {
    q: "Can my whole studio use one account?",
    a: "No. Each person needs their own account, because the identity record is per person. A business account holds the whole team under one organisation, with a shared wallet and a shared drive, so you get one bill and one place to manage seats while everyone signs in as themselves.",
  },
  {
    q: "Where are the machines located?",
    a: `In ${NODE.location}. That keeps latency low for Indian users, and it means your data and your invoices stay within Indian jurisdiction.`,
  },
  {
    q: "How do I get my files onto the workstation?",
    a: "Upload them to your Coreframe storage from the app or the website before the session, and they are on the mapped drive when the desktop appears. You can also download straight into the session from cloud storage you already use.",
  },
];

export default function HowToUsePage() {
  const howTo = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to use Coreframe GPU workstations",
    description:
      "Sign up, verify your identity, install Coreframe Connect and launch a Windows RTX GPU workstation for 3D rendering, billed per minute.",
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
          minutes you use. Here is the whole thing, start to finish.
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
            Windows warns you about our installer and the way past it is not obvious. Two things.
            Download in Chrome rather than Edge &mdash; Edge blocks the file outright and gives you
            no way through. Then, when the blue &ldquo;Windows protected your PC&rdquo; box appears,
            click <strong className="text-ink">More info</strong>, which is a small link and easy to
            miss, and then <strong className="text-ink">Run anyway</strong>.
          </p>
          <p className="cf-section-copy mt-3">
            The warning is there because our installer is not code-signed yet, so Windows cannot
            check the publisher. That reputation builds as more people install it &mdash; so if you
            click through, you are genuinely helping us get there. We are a young company and we
            would rather say that plainly than pretend the warning is not happening. Nothing is
            wrong with your machine or with the file.
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
            <span className="font-mono font-semibold text-ink">N:</span> — labelled Coreframe
            Datalake — survives. Save your work there and nothing is lost.
          </p>
          <p className="cf-section-copy mt-3">
            That reset is what makes every session start from a clean, identical machine. No
            leftovers from the customer before you, and none of yours for the customer after.
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
