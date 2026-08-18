/**
 * FAQ, and the only FAQPage JSON-LD on the site.
 *
 * DUPLICATION CHECK BEFORE ADDING THIS: app/layout.tsx already emits an
 * Organization/LocalBusiness node and a Service node with its Offers. It does
 * NOT emit FAQPage, and the previous FaqSection emitted no structured data at
 * all — so this adds a new type rather than a competing copy. Do not add a
 * second Organization or a Product node here; two Organization nodes on one
 * page is a structured-data conflict and answer engines score it down.
 *
 * The first question is the important one. Customer feedback was that people did
 * not understand the concept, and the commonest wrong model is "it's a render
 * farm". If someone holds that belief, every other answer on this page is read
 * wrongly, so it is answered first and answered against our own interest — a
 * render farm genuinely is cheaper for unattended batch work, and saying so is
 * what makes the rest credible.
 */

import type { StorageTerms } from "@/lib/storage-terms";
import type { TrialTerms } from "@/lib/rate-card";

type QA = { q: string; a: string };

function buildFaq(storage: StorageTerms, trial: TrialTerms | null, adhocRate?: string): QA[] {
  const items: QA[] = [
    {
      q: "Is this a render farm?",
      a: "No. A render farm takes your finished file and returns images. Coreframe gives you the whole machine — you open D5 or Lumion, move around the viewport, adjust lighting and see it live. If all you need is unattended batch rendering, a render farm is genuinely cheaper and we'll say so.",
    },
    {
      q: "What internet speed do I need?",
      a: "About 25 Mbps with stable latency is the practical floor. Below that the experience gets frustrating and we'd rather tell you now than take your money. Trying it on the connection you'd actually use is the honest test.",
    },
    {
      q: "Where do my files live, and who can see them?",
      a: `On Coreframe storage in India, tied to your account — ${storage.trialGb} GB free, ${storage.paidGb} GB once you top up. The workstation itself is wiped and restored to a clean image after every session, so nothing you worked on is left behind for the next person. That's also why software you install yourself only lasts for that session.`,
    },
    {
      q: "Do I need to install anything?",
      a: "One small Windows app, Coreframe Connect. You download it after signing up, sign in with the same email, and launch a workstation from inside it.",
    },
    {
      q: "How am I charged?",
      a: adhocRate
        ? `${adhocRate} per hour with GST included, billed per minute — you pay for the time the machine is actually running, not for whole hours. Nothing is charged automatically; you add money to your wallet and sessions draw from it. There's no subscription running in the background.`
        : "Billed per minute of actual use, with GST included in the published rate. Nothing is charged automatically; you add money to your wallet and sessions draw from it. There's no subscription running in the background.",
    },
    {
      q: "Can my whole team use one account?",
      a: "You create an organisation and invite people to it with a join code. Everyone gets their own login and their own sessions, billed to the organisation, with one GST invoice.",
    },
  ];

  if (trial?.gpu_minutes) {
    items.splice(1, 0, {
      q: `What do I get in the free ${trial.gpu_minutes} minutes?`,
      a: `A full workstation, the same one paying customers use, for ${trial.gpu_minutes} minutes — no card required. Enough to open your own project and judge it for yourself rather than from a spec sheet. How much of a render that covers depends entirely on your scene, so we won't pretend to a number.`,
    });
  }

  return items;
}

export function ExplainerFaq({
  storage,
  trial,
  adhocRate,
}: {
  storage: StorageTerms;
  trial: TrialTerms | null;
  adhocRate?: string;
}) {
  const faq = buildFaq(storage, trial, adhocRate);

  return (
    <section id="faq" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-20 sm:px-6 lg:px-8">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">Questions people actually ask</p>
      <h2 className="cf-section-title mt-4">Straight answers.</h2>

      <div className="mt-9 flex max-w-4xl flex-col gap-3">
        {faq.map((item, i) => (
          <details
            key={item.q}
            open={i === 0}
            className="group rounded-2xl border border-white/10 bg-white/[0.035] px-6 py-5 transition open:border-cyan-300/25"
          >
            <summary className="flex cursor-pointer items-center justify-between gap-4 text-[17px] font-semibold text-white [&::-webkit-details-marker]:hidden">
              {item.q}
              <span aria-hidden className="shrink-0 text-2xl font-light leading-none text-cyan-300">
                <span className="group-open:hidden">+</span>
                <span className="hidden group-open:inline">−</span>
              </span>
            </summary>
            <p className="mt-3.5 text-[15px] leading-7 text-white/70">{item.a}</p>
          </details>
        ))}
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "@id": "https://coreframecloud.com/#faq",
            mainEntity: faq.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        }}
      />
    </section>
  );
}
