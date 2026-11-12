import type { Metadata } from "next";
import Link from "next/link";
import { PageByline } from "@/components/seo/page-byline";
import { JsonLd } from "@/components/seo/json-ld";
import { Fold } from "@/components/visuals/fold";
import { BackgroundGlow } from "@/components/home/background-glow";
import { breadcrumbList, faqPage, OG_IMAGE } from "@/lib/seo";
import { COMPANY, COMPANY_ADDRESS_FULL } from "@/lib/company";
import { NODE } from "@/lib/node-spec";

/**
 * /trust, "Security and data" (AEO plan 1 Nov 2026, A9).
 *
 * What a procurement person, and an answer engine asked "is Coreframe
 * reliable, what data centre tier", look for, using only facts that are true
 * today. The hosting line is the owner-approved one (1 Nov 2026): a Tier III
 * data centre in India. Never Tier IV, never the provider, never a city.
 *
 * NOT CLAIMED HERE, on purpose: an uptime percentage or "high availability"
 * (nothing is measured yet; a /status page comes only once it is), ISO or
 * SOC certifications (none held), "enterprise-grade" (not checkable), and
 * any split of machines by who owns them. No price, so no /usd copy: the
 * page reads the same in every country.
 */
const PATH = "/trust";

export const metadata: Metadata = {
  title: { absolute: "Security and Data: Tier III, Data in India | Coreframe" },
  description:
    "Where Coreframe cloud workstations are hosted (a Tier III data centre in India), where your data stays, how sessions are isolated, and the company facts.",
  alternates: { canonical: PATH },
  openGraph: {
    images: [OG_IMAGE],
    title: "Security and data at Coreframe Cloud",
    description:
      "Tier III data centre in India, data stays in India, one customer per GPU, a clean machine every session, signed Mac and Windows app.",
    url: `https://www.coreframecloud.com${PATH}`,
    type: "article",
  },
};

/** The facts at a glance: short label, one plain sentence. */
const FACTS: { k: string; v: string }[] = [
  { k: "Tier III data centre", v: "The GPU workstations are hosted in a Tier III data centre in India." },
  { k: "Data stays in India", v: "All infrastructure and customer data stay in India. Nothing is stored or processed abroad." },
  { k: "One customer per GPU", v: "A whole card for one customer at a time, never a shared or sliced GPU." },
  { k: "Encrypted streaming", v: `The desktop streams at ${NODE.stream} over an encrypted private network.` },
  { k: "Clean every session", v: "The workstation is wiped and restored to a clean image when a session ends." },
  { k: "Files kept, by you", v: "Project files stay on your own project drive between sessions; a persistent workstation is optional." },
  { k: "Signed Mac and Windows app", v: `The Coreframe Connect installer is signed by ${COMPANY.displayName}; the Mac app is also notarized by Apple.` },
  { k: "Per-minute billing", v: "Prepaid wallet, billed per minute, no lock-in and nothing charged automatically." },
];

const FAQS: { q: string; a: string }[] = [
  {
    q: "Where are Coreframe's workstations hosted?",
    a: "In a Tier III data centre in India. All infrastructure and customer data stay in India, and customers anywhere in the world use the same workstations.",
  },
  {
    q: "Is my data stored or processed outside India?",
    a: "No. The workstations, the control systems and your project files are all in India. Nothing is stored or processed outside India, and invoices are issued from India.",
  },
  {
    q: "Do I share a GPU with other customers?",
    a: "No. Each workstation has one GPU, and it belongs to one customer at a time. You do not get a virtualised slice of a card.",
  },
  {
    q: "What happens to the workstation after my session?",
    a: "It is wiped and restored to a clean image, so nothing from your session is left for the next person, and nothing from theirs is there for you. Your project files are not on the workstation: they sit on your project drive in India, which persists between sessions. If you choose a persistent workstation, your own Windows disk is kept for you alone until you remove it.",
  },
  {
    q: "How is the desktop streamed?",
    a: `Through the Coreframe Connect app for Windows or Mac, over an encrypted private network, at up to ${NODE.stream}. There is no browser session and no remote desktop port for you to open.`,
  },
  {
    q: "Who is the company behind Coreframe Cloud?",
    a: `${COMPANY.displayName}, a private limited company registered in India (CIN ${COMPANY.cin}, GSTIN ${COMPANY.gstin}).`,
  },
  {
    q: "What invoices do I get?",
    a: "Accounts billed in India get a GST tax invoice for every top-up. Accounts billed outside India pay in US dollars with no GST, as an export of services, and get an invoice for every top-up too.",
  },
  {
    q: "Can a team control who spends what?",
    a: "Yes. A team account can have more than one admin, every member has their own login, and each member gets a monthly spending limit when they are added. The team gets one invoice.",
  },
  {
    q: "Who can sign up?",
    a: "Anyone with a verified email address and mobile number. No identity documents are asked for, and sessions start only after a paid top-up.",
  },
];

const LINK = "text-blue underline underline-offset-4";

export default function TrustPage() {
  return (
    <div className="relative min-h-screen text-ink">
      <BackgroundGlow />
      <JsonLd data={faqPage(FAQS)} />
      <JsonLd data={breadcrumbList([{ name: "Security and data", path: PATH }])} />

      <section className="cf-section cf-pagehero px-5">
        <div className="cf-col">
          <p className="cf-eyebrow mb-5">Security and data</p>
          <h1 className="cf-display">Where your work runs, and where your data stays.</h1>
          <p className="cf-lead mt-[22px]">
            Coreframe&rsquo;s cloud workstations are hosted in a <strong className="font-semibold text-ink">Tier III data centre in India</strong>.
            All infrastructure and customer data stay in India.
          </p>
          <PageByline path={PATH} className="mt-4 opacity-75" />
        </div>
      </section>

      <main className="relative cf-section px-5">
        <div className="cf-col">
          <section aria-labelledby="at-a-glance">
            <h2 id="at-a-glance" className="cf-section-title">At a glance.</h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {FACTS.map((f) => (
                <li key={f.k} className="rounded-cf border border-rule bg-paper-2 px-5 py-4">
                  <p className="font-heading text-[17px] leading-6 font-medium text-ink">{f.k}</p>
                  <p className="mt-1.5 text-[14px] leading-6 text-ink-2">{f.v}</p>
                </li>
              ))}
            </ul>
          </section>

          <Fold title="The company.">
            <dl className="mt-4 divide-y divide-rule rounded-cf border border-rule bg-paper-2">
              {[
                ["Brand", "Coreframe Cloud"],
                ["Legal entity", COMPANY.displayName],
                ["CIN", COMPANY.cin],
                ["GSTIN", COMPANY.gstin],
                ["Registered office", COMPANY_ADDRESS_FULL],
                ["Hosting", NODE.locationShort],
                ["Customers", "Worldwide"],
                ["Contact", `${COMPANY.email} · ${COMPANY.phone}`],
              ].map(([k, v]) => (
                <div key={k} className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:gap-6">
                  <dt className="shrink-0 text-sm text-ink-2 sm:w-44">{k}</dt>
                  <dd className="min-w-0 text-sm break-words text-ink">{v}</dd>
                </div>
              ))}
            </dl>
          </Fold>

          <Fold title="Billing, invoices and teams.">
            <p className="mt-4 leading-8 text-ink-2">
              You pay from a prepaid wallet and are billed per minute from when you connect. Nothing is charged
              automatically and there is no lock-in. Accounts billed in India get a GST tax invoice for every top-up;
              accounts billed outside India pay in US dollars with no GST and get an invoice for every top-up too.
              Team accounts can have several admins, a login per member and a monthly spending limit per member.{" "}
              <Link href="/enterprise" className={LINK}>
                Team plans
              </Link>
              .
            </p>
          </Fold>

          <Fold title="Policies.">
            <p className="mt-4 leading-8 text-ink-2">
              How we handle personal data, including breach notification under India&rsquo;s DPDP Act, is in the{" "}
              <Link href="/privacy-policy" className={LINK}>
                privacy policy
              </Link>
              . What you may run on a workstation is in the{" "}
              <Link href="/fair-use-policy" className={LINK}>
                fair use policy
              </Link>
              , and the agreement itself is the{" "}
              <Link href="/terms-of-service" className={LINK}>
                terms of service
              </Link>
              .
            </p>
          </Fold>

          <section className="mt-14">
            <h2 className="cf-section-title">Questions.</h2>
            <div className="mt-4">
              {FAQS.map((f) => (
                <details key={f.q} className="group border-b border-rule">
                  <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 py-4 [&::-webkit-details-marker]:hidden">
                    <h3 className="font-semibold text-ink">{f.q}</h3>
                    <span aria-hidden className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink/[0.06] text-ink-2 transition group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="pb-5 leading-7 text-ink-2">{f.a}</p>
                </details>
              ))}
            </div>
          </section>

          <section className="mt-14 rounded-cf border border-rule p-6">
            <h2 className="cf-section-title">Something not answered here?</h2>
            <p className="mt-3 leading-7 text-ink-2">
              Security questionnaires and procurement questions are welcome. Write to{" "}
              <a href={`mailto:${COMPANY.email}`} className={LINK}>
                {COMPANY.email}
              </a>
              .
            </p>
          </section>

          <nav className="mt-14 border-t border-rule pt-8">
            <p className="cf-eyebrow mb-4">Related</p>
            <ul className="space-y-1">
              {[
                ["/about", "What Coreframe Cloud is"],
                ["/how-to-use", "How to use Coreframe"],
                ["/virtual-workstation-vs-gpu-server", "Cloud virtual workstation vs a GPU server"],
                ["/pricing", "Pricing for every GPU"],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="inline-flex min-h-[44px] items-center text-blue hover:underline">
                    {label} →
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </main>
    </div>
  );
}
