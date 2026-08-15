import type { Metadata } from "next";
import Link from "next/link";

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
 */

const STEPS = [
  {
    title: "1. Create an account",
    body: "Sign up with your email address. Choose Individual if you are a freelancer or working on personal projects, or Business if you are GST-registered and need invoices in your company's name. A business account also asks for your registered name and GSTIN, which appear on every tax invoice.",
  },
  {
    title: "2. Verify your identity",
    body: "Indian regulations require us to hold a verified subscriber record for anyone renting compute, so this step is mandatory before a workstation can start. It uses DigiLocker and takes a couple of minutes. Business accounts additionally verify the company: the GSTIN against the GST register, and control of the company bank account. The person is proved separately from the company, because neither substitutes for the other.",
  },
  {
    title: "3. Add credit, or start your free trial",
    body: "New accounts get free GPU minutes and storage to try the service — no card needed. Beyond that, top up your wallet from the app or the website. There is no setup fee and no monthly minimum on pay-as-you-go. Business accounts can be invoiced monthly instead of prepaying.",
  },
  {
    title: "4. Install Coreframe Connect",
    body: "Connect is our Windows client. It handles the secure network link and the streaming, so there is nothing else to configure. Download it from your account, run the installer, and sign in. Windows may show a warning during install while our code-signing certificate is being issued — the download page walks you through it.",
  },
  {
    title: "5. Press Connect",
    body: "Pick your machine and press Connect. A workstation is prepared for you and the desktop appears in about two minutes. Billing does not begin until the stream actually starts — provisioning time and failed connections are never charged.",
  },
  {
    title: "6. Work, then end the session",
    body: "You have a full Windows desktop with administrator rights. Your NAS drive is already mapped, so put project files there. When you are done, end the session from Connect. Billing stops at that moment and your files stay where you left them.",
  },
];

const FAQS = [
  {
    q: "What is Coreframe?",
    a: "Coreframe rents Windows GPU workstations by the minute, hosted in India. You stream a real RTX desktop to your own laptop or PC and use it exactly as you would a workstation under your desk — for D5 Render, Lumion, Enscape, Revit, 3ds Max, Blender, CFD work or anything else that needs a GPU. It is not a render farm: you drive the machine interactively rather than submitting jobs to a queue.",
  },
  {
    q: "How is Coreframe billed?",
    a: "Per minute, and only while the stream is running. Billing starts when the remote desktop appears and stops when you end the session. Provisioning time, failed connections and uploads are not charged. Prices include GST and a tax invoice is issued automatically for every payment.",
  },
  {
    q: "Do I need my own software licences?",
    a: "For commercial applications, yes. D5 Render, Lumion, Enscape, V-Ray, Revit, AutoCAD, 3ds Max and similar are licensed to you rather than to the machine, so you install them and sign in with your own subscription. Free software — Blender, Twinmotion, the Autodesk viewers and the usual utilities — is already installed and ready to use.",
  },
  {
    q: "Can I install my own software on the workstation?",
    a: "Yes. You have administrator rights for the length of your session and can install whatever you need. Anything you install lasts for that session only, because the machine is reset to a clean image afterwards. If you use an application every day, ask us to add it to the standard image.",
  },
  {
    q: "What happens to my files when the session ends?",
    a: "Files on your NAS drive persist between sessions — that is what it is for. Anything left on the workstation's own desktop or C: drive is wiped when the session ends, along with any software you installed. Save your work to the NAS drive as you go.",
  },
  {
    q: "Why is the workstation wiped between sessions?",
    a: "So that every customer starts from an identical, clean machine and no trace of anyone else's work can reach them. If your projects are under NDA, this is the property you want: the previous session cannot leave files, credentials or browser history behind for you to find, and neither can yours for the next person.",
  },
  {
    q: "What internet speed do I need?",
    a: "Around 10 Mbps is enough for a smooth session, and 25 Mbps or more is comfortable. A wired connection or 5 GHz Wi-Fi makes a bigger difference than raw bandwidth, because streaming is far more sensitive to latency and jitter than to throughput.",
  },
  {
    q: "Can my whole studio use one account?",
    a: "No — each person needs their own account, because the identity record is per person. A business account can hold the whole team under one organisation, with a shared wallet and a shared drive, so you get one bill and one place to manage seats while everyone signs in as themselves.",
  },
  {
    q: "Where are the machines located?",
    a: "In India. That keeps latency low for Indian users and means your data and your invoices stay within Indian jurisdiction.",
  },
  {
    q: "How do I get my files onto the workstation?",
    a: "Upload them to your Coreframe storage from the app or the website before the session, and they are on the mapped drive when the desktop appears. You can also download directly inside the session from cloud storage you already use.",
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
      name: s.title.replace(/^\d+\.\s*/, ""),
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
    <main className="mx-auto max-w-4xl px-6 py-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howTo) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <h1 className="text-3xl font-semibold text-white sm:text-4xl">How to use Coreframe</h1>
      <p className="mt-5 text-lg leading-8 text-white/70">
        Coreframe rents Windows GPU workstations by the minute, hosted in India. You stream a
        real RTX desktop to the computer you already own, work on it as normal, and pay only for
        the minutes you use. Here is the whole thing, start to finish.
      </p>

      <section className="mt-14">
        <h2 className="text-2xl font-semibold text-white">Getting started</h2>
        <ol className="mt-6 space-y-6">
          {STEPS.map((step) => (
            <li key={step.title} className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5">
              <h3 className="font-semibold text-white">{step.title}</h3>
              <p className="mt-2 leading-7 text-white/60">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-14 rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.05] p-6">
        <h2 className="text-xl font-semibold text-white">The one thing to know before you start</h2>
        <p className="mt-3 leading-7 text-white/70">
          The workstation resets between sessions. Software you install and files left on the
          machine&apos;s own drive are wiped when you finish; your NAS drive persists. Save your
          work there and nothing is lost.
        </p>
        <p className="mt-3 leading-7 text-white/60">
          It is what makes every session start from a clean, identical machine — no leftovers
          from the customer before you, and none of yours left for the customer after.
        </p>
      </section>

      <section className="mt-14">
        <h2 className="text-2xl font-semibold text-white">Common questions</h2>
        <div className="mt-6 space-y-6">
          {FAQS.map((faq) => (
            <div key={faq.q}>
              <h3 className="font-semibold text-white">{faq.q}</h3>
              <p className="mt-2 leading-7 text-white/60">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-14 flex flex-wrap gap-4">
        <Link href="/apps" className="cf-btn-secondary">
          See what&apos;s preinstalled
        </Link>
        <Link href="/#pricing" className="cf-btn-secondary">
          Pricing
        </Link>
        <Link href="/contact" className="cf-btn-secondary">
          Talk to us
        </Link>
      </div>
    </main>
  );
}
