/**
 * "You don't buy the machine. You borrow it, by the minute."
 *
 * This section exists because of one specific piece of customer feedback: people
 * did not understand what the product was. Everything else on the page — specs,
 * price, benefits — is wasted on someone who has not yet grasped that they are
 * renting a real Windows desktop rather than submitting a job to a render farm.
 *
 * So it comes immediately after the hero, before any benefit, and it is three
 * short steps rather than a paragraph.
 */

import Link from "next/link";

const STEPS = [
  {
    n: "1",
    title: "Install Coreframe Connect",
    body: "A small Windows app. Sign in with your email — the same account your whole team uses.",
    link: { href: "/download", label: "Download Connect" },
  },
  {
    n: "2",
    title: "Launch a workstation",
    body: "One click. A machine with an RTX 5080 starts up, with your software already installed, and appears on your screen in under a minute.",
    link: null,
  },
  {
    n: "3",
    title: "Work, then close it",
    body: "Model, render, present. When you close the session, billing stops. Your project files stay where you left them.",
    link: { href: "/how-to-use", label: "Full walkthrough" },
  },
] as const;

export function HowItWorksSection() {
  return (
    <section id="how" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-20 sm:px-6 lg:px-8">
      <p className="cf-eyebrow">The whole idea, in three steps</p>
      <h2 className="cf-section-title mt-4 max-w-3xl">
        You don&apos;t buy the machine.
        <br />
        <span className="bg-gradient-to-r from-blue to-blue bg-clip-text text-transparent">
          You borrow it, by the minute.
        </span>
      </h2>
      <p className="mt-5 max-w-2xl text-base leading-7 text-ink-2">
        That&apos;s it. There&apos;s no complicated part. The workstation is real
        hardware in a data centre; you see its screen on your laptop and use it
        exactly as if it were under your desk.
      </p>

      <ol className="mt-12 grid gap-5 md:grid-cols-3">
        {STEPS.map((s) => (
          <li
            key={s.n}
            className="rounded-cf border border-rule bg-paper-2 p-7 transition hover:border-blue/25"
          >
            <span
              aria-hidden
              className="flex h-10 w-10 items-center justify-center rounded-cf border border-blue/25 bg-blue/10 text-base font-bold text-blue"
            >
              {s.n}
            </span>
            <h3 className="mt-5 text-xl font-semibold text-ink">{s.title}</h3>
            <p className="mt-2.5 text-[15px] leading-7 text-ink-2">{s.body}</p>
            {s.link ? (
              <Link
                href={s.link.href}
                className="mt-4 inline-block text-[15px] font-semibold text-blue transition hover:text-blue"
              >
                {s.link.label} →
              </Link>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}
