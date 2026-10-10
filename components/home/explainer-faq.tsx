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
import { hoursLabel, rupees, type IntroOffer } from "@/lib/rate-card";

type QA = { q: string; a: string };

function buildFaq(storage: StorageTerms, intro: IntroOffer | null, adhocRate?: string): QA[] {
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
      a: `On Coreframe storage in India, tied to your account — ${storage.paidGb} GB included. The workstation itself is wiped and restored to a clean image after every session, so nothing you worked on is left behind for the next person. That's also why software you install yourself only lasts for that session.`,
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
      q: "Do I need Aadhaar, a passport or any ID documents?",
      a: "No. Sign-up is your email, a one-time code to your mobile on WhatsApp, and a payment. Indian regulations (CERT-In) require us to keep a verified contact number for anyone renting compute, which is what the mobile code is for — any country code works.",
    },
    {
      q: "Can I pay from outside India?",
      a: "Yes. International cards are accepted through Razorpay, alongside UPI, netbanking and Indian cards. Prices are in rupees, and every top-up comes with an invoice.",
    },
    {
      q: "Can my whole team use one account?",
      a: "You create an organisation and invite people to it with a join code. Everyone gets their own login and their own sessions, billed to the organisation, with one GST invoice.",
    },
  ];

  if (intro) {
    items.splice(1, 0, {
      q: "Is there an offer for new customers?",
      a: `Yes — your first top-up of ${rupees(intro.priceRupees)} buys ${hoursLabel(intro.hours)}${intro.gpuName ? ` on an ${intro.gpuName}` : ""}${intro.validityDays ? `, to use within ${intro.validityDays} days` : ""}. One per customer. It is the same workstation every paying customer uses, billed per minute, so you can open your own project and judge it yourself. How much of a render that covers depends entirely on your scene, so we won't pretend to a number.`,
    });
  }

  return items;
}

export function ExplainerFaq({
  storage,
  intro,
  adhocRate,
}: {
  storage: StorageTerms;
  intro: IntroOffer | null;
  adhocRate?: string;
}) {
  const faq = buildFaq(storage, intro, adhocRate);

  return (
    <section id="faq" className="cf-wide scroll-mt-24 px-5 py-20">
      <p className="cf-eyebrow">Questions people actually ask</p>
      <h2 className="cf-section-title mt-4">Straight answers.</h2>

      {/* Full width of the container, NOT max-w-4xl. It used to be 896px
          inside a 1280px section while the pricing cards above filled the
          whole 1280 — so the FAQ read as indented, which is what it looked
          like: a column that had slipped. Each answer caps its own line
          length instead, which is where a measure actually belongs. */}
      <div className="mt-9 flex flex-col gap-3">
        {faq.map((item, i) => (
          <details
            key={item.q}
            open={i === 0}
            className="group rounded-cf border border-rule bg-paper-2 px-6 py-5 transition open:border-blue/25"
          >
            <summary className="flex cursor-pointer items-center justify-between gap-4 text-[17px] font-semibold text-ink [&::-webkit-details-marker]:hidden">
              {item.q}
              <span aria-hidden className="shrink-0 text-2xl font-light leading-none text-blue">
                <span className="group-open:hidden">+</span>
                <span className="hidden group-open:inline">−</span>
              </span>
            </summary>
            {/* The answer caps its own line length. The list now spans the full
                container so it lines up with the cards above, but a 960px line
                of prose is unreadable — a measure belongs on the text, not on
                the box around it. */}
            <p className="mt-3.5 max-w-[68ch] text-[15px] leading-7 text-ink-2">{item.a}</p>
          </details>
        ))}
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "@id": "https://www.coreframecloud.com/#faq",
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
