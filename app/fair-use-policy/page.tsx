import type { Metadata } from "next";
import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { BackgroundGlow } from "@/components/home/background-glow";
import { COMPANY } from "@/lib/company";

/**
 * Fair Use Policy for GPU workstations (DRAFT, 28 Oct 2026 - for the owner's
 * review before it is linked from the sign-up boxes in production).
 *
 * Part of the Terms of Service (section 1 lists it). Every account accepts it
 * at sign-up with the "I agree to the Terms of Service and Fair Use Policy" box.
 * Same house rules as /terms-of-service: no vendor names, no costs or machine
 * sizes, plain English, and it must match what the platform actually does.
 */

export const metadata: Metadata = {
  title: "Fair Use Policy",
  description:
    "How Coreframe GPU workstations may be used: what is not allowed, fair use of shared resources, the session records we keep, and what happens if the rules are broken.",
  alternates: {
    canonical: "/fair-use-policy",
  },
};

const LAST_UPDATED = "28 October 2026";
const ABUSE_EMAIL = "support@coreframecloud.com";

type Block = string | { list: string[] };
type Part = { id: string; title: string; blocks: Block[] };

const parts: Part[] = [
  {
    id: "purpose",
    title: "1. Why this policy exists",
    blocks: [
      "Our GPU workstations are shared infrastructure. This policy keeps them fast, safe and available for every customer, and it protects the professional work our customers do on them: design and visualisation, rendering, engineering, simulation and AI.",
      "It is part of our [Terms of Service](/terms-of-service). By creating an account you agree to both. If the two ever differ, the Terms of Service win.",
    ],
  },
  {
    id: "not-allowed",
    title: "2. What is not allowed",
    blocks: [
      "You must not use a workstation, or let anyone else use it, to:",
      {
        list: [
          "Mine cryptocurrency or run any proof-of-work or similar hashing workload.",
          "Resell, sub-let or share access. Your sign-in, workstation and credentials are for you (or your organisation's named members) only.",
          "Attack, scan, probe or flood any network or system, send spam or bulk unsolicited messages, or run open proxies, VPN exits or anonymising relays for others.",
          "Create, store or share anything illegal, infringing (including pirated software, media or models), abusive, or that exploits or harms anyone.",
          "Get around billing, security or monitoring, including tampering with our session software, hiding usage or trying to reach other customers' machines or data.",
          "Run software you are not licensed to use. Vendor licence terms, including any limits on use in a hosted environment, are your responsibility.",
        ],
      },
    ],
  },
  {
    id: "resources",
    title: "3. Fair use of resources",
    blocks: [
      "Workstations are sized for professional design, rendering, simulation and AI work. Storage and network use are expected to match that kind of work.",
      "If a session harms the platform or other customers, for example by saturating the network, filling shared storage or putting a machine at risk, we may slow it down, pause it or end it, and we will tell you why.",
    ],
  },
  {
    id: "records",
    title: "4. Session records we keep",
    blocks: [
      "Indian law (CERT-In Directions, April 2022) requires us to keep records of who uses our compute and when. For every session we keep the start and end time, the IP address you connected from, the address assigned to the workstation, and your account details. We also keep the IP address and time of your sign-up.",
      "We keep these records in India for as long as the law requires. We do not look inside your files or your work to keep them. See our [Privacy Policy](/privacy-policy) for how personal data is handled.",
    ],
  },
  {
    id: "enforcement",
    title: "5. If the rules are broken",
    blocks: [
      "Depending on how serious it is, we may warn you, suspend the session or the account, or close the account. Where it is reasonable and lawful we will warn you first and give you a chance to put things right.",
      "Balance used for, or lost because of, misuse is not refunded. Where the law requires, we report misuse to the authorities and share the records in section 4.",
    ],
  },
  {
    id: "report",
    title: "6. Reporting misuse",
    blocks: [
      `If you think a Coreframe workstation is being misused, email [${ABUSE_EMAIL}](mailto:${ABUSE_EMAIL}) with what you saw, when, and any addresses involved. We look at every report.`,
    ],
  },
  {
    id: "changes",
    title: "7. Changes to this policy",
    blocks: [
      "We may update this policy as the service changes or the law requires. The date at the top shows the latest version. If a change matters to how you use the service, we will tell you by email before it takes effect.",
    ],
  },
];

function rich(text: string): ReactNode {
  const out: ReactNode[] = [];
  const re = /\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    out.push(
      <Link key={m.index} href={m[2]} className="break-words text-blue hover:underline">
        {m[1]}
      </Link>,
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out.map((n, i) => <Fragment key={i}>{n}</Fragment>);
}

function BlockView({ block }: { block: Block }) {
  if (typeof block === "string") return <p>{rich(block)}</p>;
  return (
    <ul className="list-disc space-y-2 pl-6">
      {block.list.map((item) => (
        <li key={item}>{rich(item)}</li>
      ))}
    </ul>
  );
}

export default function FairUsePolicyPage() {
  return (
    <>
      <section className="cf-section cf-pagehero px-5">
        <div className="cf-wide">
          <div className="cf-eyebrow">Legal</div>
          <h1 className="cf-display mt-4">Fair Use Policy</h1>
          <p className="mt-4 cf-eyebrow">
            Last Updated: {LAST_UPDATED} · Effective: {LAST_UPDATED}
          </p>
        </div>
      </section>
      <main className="relative min-h-screen overflow-x-hidden border-b border-rule text-ink">
        <BackgroundGlow />

        <div className="relative mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="rounded-cf border border-rule bg-paper-2 border-l-2 border-l-blue px-5 py-5 sm:px-6">
            <p className="text-base leading-7 text-ink-2">
              <span className="font-semibold">In short:</span> use the workstations for
              real professional work. No mining, no reselling or sharing access, no
              attacks or spam, nothing illegal, and no getting around billing or
              security. We keep the session records Indian law requires.
            </p>
          </div>

          <nav aria-label="Contents" className="mt-10 rounded-cf border border-rule px-5 py-5 sm:px-6">
            <p className="cf-eyebrow">Contents</p>
            <ol className="mt-3 grid gap-x-8 gap-y-1.5 text-[15px] leading-6 sm:grid-cols-2">
              {parts.map((p) => (
                <li key={p.id}>
                  <a href={`#${p.id}`} className="inline-flex min-h-11 items-center text-blue hover:underline sm:min-h-0">
                    {p.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="mt-10 space-y-10 text-base leading-8 text-ink-2">
            {parts.map((part) => (
              <section key={part.id} id={part.id} className="scroll-mt-24">
                <h2 className="cf-section-title">{part.title}</h2>
                <div className="mt-3 space-y-4">
                  {part.blocks.map((block, i) => (
                    <BlockView key={i} block={block} />
                  ))}
                </div>
              </section>
            ))}
            <p className="text-sm leading-6 text-ink-3">{COMPANY.legalName}</p>
          </div>
        </div>
      </main>
    </>
  );
}
