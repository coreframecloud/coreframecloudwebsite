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
import { hoursLabel, type IntroOffer, introPrice } from "@/lib/rate-card";
import { BANDWIDTH_SENTENCE } from "@/lib/streaming-terms";
import type { Currency } from "@/lib/money";

type QA = { q: string; a: string };

/**
 * The USD view (a visitor outside India, see proxy.ts) changes only the three
 * answers that are about money: dollar prices carry no GST, accounts billed
 * outside India pay in US dollars, and a team billed in dollars gets a dollar
 * invoice (everything is global, owner 15 Oct 2026).
 */
function buildFaq(storage: StorageTerms, intro: IntroOffer | null, adhocRate?: string, currency: Currency = "INR"): QA[] {
  const usdView = currency === "USD";
  const items: QA[] = [
    {
      q: "Is this a render farm?",
      a: "No. A render farm takes your finished file and sends back images. Coreframe gives you the whole machine: you open D5 or Lumion, move around the viewport, change the lighting and see it live. If all you need is unattended batch rendering, a render farm really is cheaper, and we'll tell you so.",
    },
    {
      q: "What internet speed do I need?",
      a: `${BANDWIDTH_SENTENCE} Stable latency matters as much as speed. On a weaker connection it gets frustrating, and we'd rather tell you now than take your money. The real test is trying it on the connection you'd actually use.`,
    },
    {
      q: "Where do my files live, and who can see them?",
      a: `On Coreframe storage in India, tied to your account, with ${storage.paidGb} GB included. After every session the workstation is wiped and restored to a clean image, so nothing you worked on is left for the next person. That's also why software you install yourself only lasts for that session.`,
    },
    {
      q: "Do I need to install anything?",
      a: "One small Windows app, Coreframe Connect. You download it after signing up, sign in with the same email, and launch a workstation from inside it.",
    },
    {
      q: "How am I charged?",
      a: usdView
        ? `${adhocRate ? `${adhocRate} per hour, billed per minute, with no GST: work billed outside India is an export of services.` : "You're billed per minute of actual use, and accounts billed outside India pay no GST (export of services)."} You pay for the minutes the machine is actually running instead of rounding up to whole hours. Nothing is charged automatically: you add money to your wallet and sessions draw from it, with no subscription running in the background.`
        : adhocRate
        ? `${adhocRate} per hour with GST included, billed per minute. You pay for the minutes the machine is actually running instead of rounding up to whole hours. Nothing is charged automatically: you add money to your wallet and sessions draw from it, with no subscription running in the background.`
        : "You're billed per minute of actual use, and GST is included in the published rate. Nothing is charged automatically: you add money to your wallet and sessions draw from it, with no subscription running in the background.",
    },
    {
      q: "Do I need Aadhaar, a passport or any ID documents?",
      a: "No. You sign up with your email, a one-time code sent to your mobile on WhatsApp, and a payment. Indian regulations (CERT-In) require us to keep a verified contact number for anyone renting compute, which is what the mobile code is for. Any country code works.",
    },
    {
      q: "Can I pay from outside India?",
      a: usdView
        ? "Yes. Your account's currency is set from your billing country when you sign up: accounts billed outside India pay in US dollars by international card through Razorpay, with no GST (export of services). Every top-up comes with an invoice in US dollars."
        : "Yes. International cards are accepted through Razorpay, alongside UPI, netbanking and Indian cards. Prices are in rupees, and every top-up comes with an invoice.",
    },
    {
      q: "Can my whole team use one account?",
      a: usdView
        ? "Yes. You create an organisation and invite people to it with a join code. Everyone gets their own login and their own sessions, billed to the organisation in US dollars, with one invoice and no GST."
        : "You create an organisation and invite people to it with a join code. Everyone gets their own login and their own sessions, billed to the organisation, with one GST invoice.",
    },
  ];

  if (intro) {
    items.splice(1, 0, {
      q: "Is there an offer for new customers?",
      a: `Yes. Your first top-up of ${introPrice(intro)}${intro.currency === "USD" ? " (no GST)" : ""} buys ${hoursLabel(intro.hours)}${intro.gpuName ? ` on an ${intro.gpuName}` : ""}${intro.validityDays ? `, to use within ${intro.validityDays} days` : ""}. It's one per customer. You get the same workstation every paying customer uses, billed per minute, so you can open your own project and judge it for yourself. How much rendering that covers depends entirely on your scene, so we won't guess at a number.`,
    });
  }

  return items;
}

export function ExplainerFaq({
  storage,
  intro,
  adhocRate,
  currency = "INR",
}: {
  storage: StorageTerms;
  intro: IntroOffer | null;
  adhocRate?: string;
  currency?: Currency;
}) {
  const faq = buildFaq(storage, intro, adhocRate, currency);

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
