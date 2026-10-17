import type { Metadata } from "next";
import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { BackgroundGlow } from "@/components/home/background-glow";
import { COMPANY, COMPANY_ADDRESS_FULL } from "@/lib/company";

/**
 * Terms of Service for every Coreframe service: accounts and the wallet, GPU
 * workstations, CFD, Studio and the free tools.
 *
 * Rewritten 18 Oct 2026 from the June 2026 page, which covered workstation rental
 * only. Each rule here is meant to match what the platform actually does (control
 * plane, Studio and the CFD runner); if the product changes, change this page in
 * the same release.
 *
 * House rules for this page:
 * - Never name the infrastructure, solver, AI-model or other vendors that run
 *   behind the scenes. Customers get "third-party providers", not names.
 * - Never publish costs, margins or machine sizes.
 * - Prices live on /pricing and in the app. Only the few figures customers need
 *   to understand a rule are repeated here, and the pricing page wins.
 * - Refunds are stated once, on /refund-policy; personal data once, on
 *   /privacy-policy. This page points to them instead of restating them.
 *
 * Paragraph strings accept [text](/path) links, rendered by `rich()` below, so
 * the copy can stay in plain data without escaping.
 */

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms for using Coreframe Cloud: your account and wallet, GPU cloud workstations, CFD simulation, Studio and the free tools.",
  alternates: {
    canonical: "/terms-of-service",
  },
};

const LAST_UPDATED = "18 October 2026";

type Block = string | { list: string[] };
type Part = { id: string; title: string; blocks: Block[] };

const parts: Part[] = [
  {
    id: "about",
    title: "1. About these terms",
    blocks: [
      `These terms are an agreement between you and ${COMPANY.displayName} ("Coreframe", "we", "us"), a company registered in Bengaluru, India (CIN ${COMPANY.cin}). They apply to everything we offer under the Coreframe Cloud name: the website, your account and wallet, GPU cloud workstations, the Coreframe Connect desktop app, CFD simulation, Studio, and our free tools (together, the "Services").`,
      "By creating an account, signing in, submitting a job or using a free tool, you accept these terms. If you use the Services for a company or firm, you accept them on its behalf and confirm you are authorised to do so; \"you\" then means both you and that organisation.",
      "Two other pages form part of these terms: our [Refund Policy](/refund-policy) and our [Privacy Policy](/privacy-policy). If your organisation has signed a separate service agreement or monthly plan with us, that agreement takes precedence where it differs from this page.",
    ],
  },
  {
    id: "accounts",
    title: "2. Eligibility and your account",
    blocks: [
      "You must be at least 18 years old and able to enter a binding contract. The Services are meant for professional and business use.",
      "To create an account you give us your name, email address, country (and state, in India) and a mobile number, which you confirm with a one-time code sent on WhatsApp. Indian regulations (CERT-In) require us to keep a verified contact number for anyone using our compute services. You can also sign in with Google. One mobile number can belong to only one account.",
      "One Coreframe account and one wallet work across our services: the same sign-in and balance pay for workstation time, CFD jobs and Studio, and your activity appears in your account.",
      "Keep your account details accurate and your sign-in methods secure. You are responsible for everything done through your account. Accounts are personal: don't share your login. If your team needs access, each person should have their own login in an organisation (section 3). Tell us straight away at the address in section 22 if you think someone else has used your account.",
      "Your billing country decides your account currency when you sign up: Indian rupees (INR) for India, US dollars (USD) for everywhere else. The currency is fixed once set. Indian accounts need an Indian (+91) mobile number. If the payment details on an INR account point to a billing country outside India, we may pause further top-ups while we review the account, withhold promotional credit, or move the account to USD billing. Money you actually paid is always credited.",
    ],
  },
  {
    id: "teams",
    title: "3. Teams and organisations",
    blocks: [
      "You can create an organisation and invite colleagues with a join code or invitation. Each member has their own login and their own sessions. An organisation administrator can invite, approve and remove members and set the organisation's billing details, such as its GSTIN.",
      "Usage by members is billed to the organisation: either to one shared wallet held by the organisation's billing contact, or, where we have agreed it in writing, invoiced monthly. The organisation is responsible for all usage by its members.",
      "Monthly plans (shown on our [Team plans](/enterprise) page) include a set number of team logins, GPU hours and storage for a minimum term. Included hours do not carry over to the next month. Hours above the plan are charged at the plan's overage rate. The plan's details and any signed agreement govern those accounts.",
    ],
  },
  {
    id: "wallet",
    title: "4. Wallet, prices and payment",
    blocks: [
      "Our Services are prepaid. You add money to your Coreframe wallet and the Services draw from it. Nothing is charged to your card automatically, and there is no subscription running in the background (apart from a monthly plan your organisation has signed up to).",
      "Current prices, minimum and maximum top-ups, bonus credit on larger top-ups and any new-customer offer are shown on our [pricing page](/pricing) and in the app at the time you pay. We may change prices for the future; a change never affects money already in your wallet, a CFD quote already accepted or a session already running.",
      {
        list: [
          "Rupee prices include 18% GST unless they are marked \"+ GST\". US dollar prices carry no GST, because services billed outside India are an export of services.",
          "We issue a tax invoice for every top-up at the moment you pay (an invoice in US dollars for USD accounts). The top-up itself is the supply, which is why wallet money is not refundable on request. See the [Refund Policy](/refund-policy).",
          "Wallet credit is valid for one year from purchase. Your oldest credit is spent first.",
          "Promotional credit (bonus credit and any new-customer offer) is not cash, has no cash value, cannot be refunded or transferred, and may have a shorter validity and limits on what it can be spent on. These are stated with the offer. For example, the new-customer offer is for GPU workstation time only and is one per customer, and promotional credit cannot pay for CFD.",
          "Payments are processed by our payment partner. We do not store your full card number.",
          "Your wallet never goes below zero. If your balance cannot cover a charge, the Service that needs it will not start, or will stop.",
        ],
      },
      "If you think a charge is wrong, contact us before going to your bank. Duplicate and failed payments are always refunded in full. A chargeback against a legitimate charge suspends the account while we investigate.",
    ],
  },
  {
    id: "workstations",
    title: "5. GPU cloud workstations",
    blocks: [
      "A workstation is a whole remote Windows machine with a dedicated GPU (currently an RTX 5080), which you open through the Coreframe Connect desktop app. Only one session per account runs at a time, from one device.",
      {
        list: [
          "Billing is per minute, from the moment the remote stream starts, until the session ends. Part-minutes count as a full minute. Setting up the machine, and connections that never start streaming, are not charged.",
          "You need enough balance to start a session (currently at least 15 minutes of credit). We warn you when your balance is running low, and the session may end when it runs out.",
          "Sessions end automatically if the stream stops for 15 minutes, or if the Connect app loses contact with us and does not reconnect within a few minutes. You are billed only up to that point.",
        ],
      },
      "What happens to your files:",
      {
        list: [
          "Your persistent drive keeps your project files between sessions, tied to your account. Every account includes 50 GB. If you need more, ask us. We will tell you the price, and give you at least 30 days' notice, before we start charging for storage above the included amount.",
          "Everything else on the machine is temporary. At the end of every session, the workstation is wiped and restored to a clean image, including the desktop, downloads, scratch drive, caches and any software you installed yourself. Save your work to your persistent drive before you end a session.",
          "Keep your own backups of anything important. We look after storage carefully, but no storage is immune to failure.",
        ],
      },
      "Software. Some applications come preinstalled on the standard image. They are provided as is, and the vendor's own licence terms apply to your use of them. Commercial software that is licensed to you (for example, your own rendering or design subscription) stays your responsibility: you sign in with your own licence, and you must comply with its terms, including any restrictions on use in the cloud. We never supply licences for commercial software. If you install software yourself, you are responsible for having the right to use it.",
    ],
  },
  {
    id: "cfd",
    title: "6. CFD simulation",
    blocks: [
      "We run computational fluid dynamics (CFD) simulations on our own infrastructure. Today this covers internal flow in ducts, pipes and fittings (you upload one closed binary STL with its units, or give the dimensions of a straight duct), and room airflow / HVAC in one room under steady conditions (you describe the room; no file is needed).",
      "How a job works:",
      {
        list: [
          "Submitting a job is free. Before meshing, we check whether your case is in scope. If we reject it at that stage, there is no charge.",
          "Pre-processing / mesh check. We check your geometry, build the mesh and verify its quality. This is a separate fee, paid from your wallet before we start: currently ₹599 incl. GST for most models and ₹1,499 incl. GST for very large ones (over 5 million cells), or $15 / $39 for USD accounts. It is not deducted from the run price. It is refunded if pre-processing fails because of a problem on our side, or if you cancel before the mesh is delivered. It is not refunded if meshing fails because of the geometry you supplied.",
          "Quote. With the mesh you get a quote listing the packages available for your case: Quick, Standard and Verified, and for eligible cases a faster Express delivery at a higher price. A quote is valid for 7 days. A new upload, or a new quote after expiry, needs a new pre-processing fee.",
          "Nothing more is charged unless you accept a quote. When you accept, the full quoted amount is held from your wallet. When the run finishes, you are charged for what the run actually used, under the rules shown on your quote, never more than the quote, and the rest is returned to your wallet straight away. If a run fails or diverges, or cannot start, because of a problem on our side, the whole hold is returned.",
          "You can cancel until the run starts, and the whole hold comes back. Once a run has started it cannot be cancelled; if it is stopped, you are charged only for the iterations it has run.",
        ],
      },
      "Turnaround. Normal delivery is within 24 hours of payment, or the run is free: if we miss that time because of a problem on our side, we return the run charge to your wallet in full (the pre-processing fee follows its own rules above). The 24 hours does not run while we are waiting for you, for example for a corrected geometry or an answer to a question about your case. Express is typically 1 to 2 hours; that is an estimate, not a commitment, and the same 24-hour promise applies to it. Compute-time estimates on a quote are estimates, not completion times.",
      "Delivery. Results are shown on your job page, which only you can open when signed in to your account, and we email you the PDF report. Your results include the case files of the simulation, which you can download from the job page.",
      "What CFD results are, and what they are not. Please read this carefully.",
      {
        list: [
          "CFD results are numerical simulations of the geometry, fluid and boundary conditions you supply, made with simplifying models (for example, steady flow). They are only as good as those inputs. They are design guidance, not a measurement and not a certification.",
          "\"Verified\" means verification of numerical (mesh) error: we solve your case on three meshes and report the grid convergence index (GCI). Mesh-independent means the mesh error is small. It does not mean the result has been validated against experiments or matches the real system.",
          "Our reports are generated automatically, and no engineer reviews them before delivery unless we agree that in writing. A report is not a professional engineering opinion, sign-off or certified design.",
          "You are responsible for the inputs, the geometry and its units, for checking the results, for having critical values independently verified, and for every engineering, design, safety and compliance decision you make. Do not rely on a result as the sole basis for a design where failure could cause injury or significant loss.",
          "A run that does not reach its convergence target is delivered marked as provisional.",
        ],
      },
    ],
  },
  {
    id: "studio",
    title: "7. Studio (AI-generated images from floor plans)",
    blocks: [
      "Studio turns a 2D floor plan (DXF) into generated room images in your browser. You can also edit images, download them in higher resolution and, where offered, order ray-traced renders.",
      {
        list: [
          "Free previews: up to 5 a day per account. To keep the free tier fair, we also limit free previews per mobile number, per network address and per drawing. Free previews are watermarked and low resolution. After that, extra previews are charged (currently ₹10 or $0.25 each), as are edits, 2K and 4K downloads and ray-traced renders, at the prices shown on the [pricing page](/pricing) and in Studio.",
          "A paid action is charged when it starts. If it fails because of a problem on our side, the charge is returned to your wallet automatically. An image you don't like is not a failure.",
          "Images are AI-generated. Studio keeps the walls, doors and windows from your drawing, but furniture, materials, lighting and everything else the drawing doesn't show are generated, and may contain inaccuracies or things that could not be built. Studio images are for concept and marketing use. They are not renders of a final design, not measured drawings and not construction documents.",
          "You must have the right to upload every drawing and image you give Studio, and you must not use Studio to create content that breaks section 9.",
          "Plus and Pro ray-traced renders are processed for us by an outside AI service, only to produce your image. Previews, edits, 2K and 4K downloads and Standard ray-traced renders are made on our own machines.",
        ],
      },
    ],
  },
  {
    id: "free-tools",
    title: "8. Free tools",
    blocks: [
      "Our free tools, the IFC model checker and the DWG dimension checker, need no account. The file you upload is read to produce the report and then deleted. If you choose to create a share link, we keep the report (not your model) for 90 days so the link works.",
      "Free tools are provided as is, without any commitment that they are available or error-free. Their reports are automated checks to help you review your own work: we are not the engineer of record and we sign off nothing. Re-verify anything you rely on.",
    ],
  },
  {
    id: "acceptable-use",
    title: "9. Acceptable use",
    blocks: [
      "Use the Services lawfully and for legitimate professional work, such as design and visualisation, rendering, engineering, simulation and AI work. You must not use them, or let anyone else use them, to:",
      {
        list: [
          "mine cryptocurrency, or run blockchain mining or validation nodes;",
          "break the law, or store, create or share illegal content, including child sexual abuse material, or sexually explicit content;",
          "infringe anyone's copyright, trademarks or other rights, including by using software without a valid licence;",
          "attack, scan, probe or gain unauthorised access to any network, system or account (ours or anyone else's), crack passwords, or create or distribute malware;",
          "send spam, run phishing, or operate proxies or anonymising services for others;",
          "resell, rent out, sublicense or share access to the Services, or offer them to third parties as your own, without our written agreement;",
          "get around our limits, billing, metering or security, or open several accounts to claim free or promotional use more than once;",
          "copy, reverse engineer or interfere with the Services, or use automated means to access them except through features we provide for that purpose;",
          "upload content that you do not have the right to use, or that contains someone's personal data without a lawful basis.",
        ],
      },
      "We may investigate suspected misuse and, where the law requires, report it to the authorities.",
    ],
  },
  {
    id: "your-content",
    title: "10. Your content",
    blocks: [
      "Your content means the files, drawings, models, images, prompts and other material you upload, and the results we produce for you from them (reports, simulation results, case files and generated images).",
      {
        list: [
          "You own your content. Between you and us, you own the results we produce for you, to the extent the law allows. AI-generated images may not be protected by copyright in every country, and similar images may be generated for other people.",
          "You give us permission to host, copy, process and transmit your content only as needed to provide the Services to you, to keep them secure, and to comply with the law. This permission ends when your content is deleted, except for copies we must keep by law.",
          "Your content is confidential. We do not sell it, publish it or show it to other customers, and our staff access it only to run the Services, help you when you ask, or investigate misuse.",
          "We do not use your files to train or improve AI models, unless you choose to let us (for example, by ticking the \"let Coreframe learn from this file\" option in Studio, which earns wallet credit). Where you opt in, we use the file internally only.",
          "You are responsible for your content: that you have the rights to it, and that it is accurate and lawful.",
        ],
      },
    ],
  },
  {
    id: "data",
    title: "11. Storage, retention and personal data",
    blocks: [
      "We store your content in India. The one exception is Studio Plus and Pro ray-traced renders, which are processed by an outside AI service (section 7). Workstation project files, Studio projects, and CFD uploads and results are kept in your account until you delete them or your account is closed. We do not delete them on a timer. You can delete a Studio project yourself with its delete button. For anything else, or to close your account, email us and we will delete your content within 30 days, except what we must keep by law.",
      "We keep records that Indian law requires us to keep, even after you delete content or close your account, for the periods the law sets. These include tax invoices and billing records under GST law, and records of who used our compute services, when and from where, as required by the directions of CERT-In (the Indian Computer Emergency Response Team).",
      "How we handle your personal data, and your rights under India's Digital Personal Data Protection Act, 2023, are set out in our [Privacy Policy](/privacy-policy).",
    ],
  },
  {
    id: "our-ip",
    title: "12. Our intellectual property",
    blocks: [
      "The Services, our software (including the Connect app), the website, our reports and templates, and the Coreframe name and logo belong to us or our licensors. We give you a limited, non-exclusive, non-transferable right to use them while your account is active and only under these terms. You may share your reports and results as you wish. If you send us feedback or ideas, we may use them without any obligation to you.",
    ],
  },
  {
    id: "third-party",
    title: "13. Third-party software and services",
    blocks: [
      "The Services include and rely on software and services from third parties, including open-source software, AI models and infrastructure providers. Third-party software on a workstation is subject to its own licence terms. We are not responsible for third-party software, for changes its vendors make, or for websites and services we link to.",
    ],
  },
  {
    id: "availability",
    title: "14. Availability and changes to the Services",
    blocks: [
      "We work hard to keep the Services running, but we do not guarantee that they will always be available, uninterrupted or error-free, or that a workstation will be free whenever you want one. We may carry out maintenance, which we try to schedule outside working hours.",
      "If a workstation fails because of a fault on our side, we credit the affected session time back to your wallet, as set out in the [Refund Policy](/refund-policy).",
      "We may change, add or withdraw features and services. If we withdraw a paid service, we will give you reasonable notice, and any credit in your wallet stays usable on our other services.",
    ],
  },
  {
    id: "suspension",
    title: "15. Suspension and termination",
    blocks: [
      "You may stop using the Services at any time and ask us to close your account. Wallet money is not refunded when you close an account (see the [Refund Policy](/refund-policy)), so use it first.",
      "We may suspend or close your account, end a running session or refuse a job, if you break these terms, if we reasonably suspect fraud, misuse or a security risk, if a payment is reversed or charged back, or if the law or an authority requires it. Where it is reasonable and lawful, we will tell you first and give you a chance to put things right. If we close your account without any fault on your part, we will refund the unused paid balance in your wallet.",
      "After closure, you can ask us for a copy of your content for 30 days, after which we may delete it. Sections 4 (on charges already incurred), 6 (what CFD results are), 7 (what Studio images are), 10, 11, and 15 to 21 survive closure.",
    ],
  },
  {
    id: "disclaimer",
    title: "16. Disclaimers",
    blocks: [
      "Apart from what these terms expressly promise, the Services, results, reports, generated images and free tools are provided \"as is\" and \"as available\". To the extent the law allows, we give no other warranties or conditions, express or implied, including that they will be fit for a particular purpose, accurate, or meet your requirements. Nothing in these terms limits a right you have under a law that cannot be excluded by contract.",
    ],
  },
  {
    id: "liability",
    title: "17. Limitation of liability",
    blocks: [
      "To the extent the law allows:",
      {
        list: [
          "we are not liable for any indirect, incidental, special or consequential loss, or for loss of profit, revenue, business, contracts, goodwill or data, or for the cost of replacement services;",
          "we are not liable for loss caused by engineering, design, construction or business decisions made using our results, reports or images;",
          "our total liability to you for all claims arising from the Services is limited to the amount you paid us for the Services in the three months before the event giving rise to the claim; and for a claim about a particular CFD job or Studio order, to the fees you paid for that job or order (for a CFD job, including its pre-processing fee).",
        ],
      },
      "These limits do not apply to liability that cannot be limited by law, such as liability for fraud or for death or personal injury caused by negligence.",
    ],
  },
  {
    id: "indemnity",
    title: "18. Indemnity",
    blocks: [
      "You will compensate us for any claims, losses, fines and reasonable costs (including legal fees) that arise from your content, your breach of these terms or the law, or your use of software you are not licensed to use.",
    ],
  },
  {
    id: "force-majeure",
    title: "19. Events beyond our control",
    blocks: [
      "We are not responsible for delays or failures caused by events beyond our reasonable control, such as power or internet outages, failures of third-party providers, natural disasters, epidemics, war, civil unrest, government action or cyberattacks. We will do what we reasonably can to limit the impact and restore the Services.",
    ],
  },
  {
    id: "changes",
    title: "20. Changes to these terms",
    blocks: [
      "We may update these terms from time to time. The date at the top of this page shows the latest version. If a change materially affects you, we will tell you by email or in the app at least 15 days before it takes effect, except where the change is required by law or is needed urgently for security. If you keep using the Services after a change takes effect, you accept the new terms. If you do not agree, stop using the Services and ask us to close your account.",
    ],
  },
  {
    id: "law",
    title: "21. Governing law and disputes",
    blocks: [
      "These terms are governed by the laws of India. Please contact us first, and we will try to resolve any dispute informally. Subject to that, the courts at Bengaluru, Karnataka have exclusive jurisdiction.",
      "Other terms. If any part of these terms is found to be unenforceable, the rest still applies. If we do not enforce a right straight away, we have not given it up. You may not transfer your account or these terms without our written consent; we may transfer them to a company that takes over our business. These terms, together with the policies they refer to (and any signed agreement), are the whole agreement between us about the Services.",
    ],
  },
];

/** Renders [text](href) links inside a plain paragraph string. */
function rich(text: string): ReactNode {
  const out: ReactNode[] = [];
  const re = /\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    out.push(
      <Link key={m.index} href={m[2]} className="text-blue hover:underline">
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

export default function TermsOfServicePage() {
  return (
    <>
    <section className="cf-section cf-pagehero px-5">
      <div className="cf-wide">
            <div className="cf-eyebrow">
              Legal
            </div>
            <h1 className="cf-display mt-4">
              Terms of Service
            </h1>
            <p className="mt-4 cf-eyebrow">
              Last Updated: {LAST_UPDATED} · Effective: {LAST_UPDATED}
            </p>
      </div>
    </section>
    <main className="relative min-h-screen border-b border-rule text-ink">
      <BackgroundGlow />

      <div className="relative mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="rounded-cf border border-rule bg-paper-2 border-l-2 border-l-blue px-6 py-5">
          <p className="text-base leading-7 text-ink-2">
            <span className="font-semibold">In short:</span>{" "}
            one account and one prepaid
            wallet cover workstations, CFD and Studio. You pay for what you use, at the
            prices shown before you pay. Your files and results are yours and stay
            confidential. CFD results and Studio images are tools to support your own
            professional judgement, not certified designs or construction documents.
            Don&rsquo;t misuse the machines.
          </p>
        </div>

        <nav aria-label="Contents" className="mt-10 rounded-cf border border-rule px-6 py-5">
          <p className="cf-eyebrow">Contents</p>
          <ol className="mt-3 grid gap-x-8 gap-y-1.5 text-[15px] leading-6 sm:grid-cols-2">
            {[...parts, { id: "contact", title: "22. Grievance officer and contact" }].map((p) => (
              <li key={p.id}>
                <a href={`#${p.id}`} className="text-blue hover:underline">
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

          <section id="contact" className="scroll-mt-24">
            <h2 className="cf-section-title">22. Grievance officer and contact</h2>
            <div className="mt-3 space-y-4">
              <p>
                For questions about these terms, support, or a complaint about the
                Services or about content, write to our Grievance Officer. We
                acknowledge complaints within two business days and aim to resolve them
                within 15 days.
              </p>
              <p>
                Grievance Officer, {COMPANY.displayName}
                <br />
                Email:{" "}
                <Link href={`mailto:${COMPANY.email}`} className="text-blue hover:underline">
                  {COMPANY.email}
                </Link>
                <br />
                WhatsApp:{" "}
                <Link href={COMPANY.whatsapp} target="_blank" rel="noreferrer" className="text-blue hover:underline">
                  +91 63668 89488
                </Link>
              </p>
              <p className="text-sm leading-6 text-ink-2">
                {COMPANY.legalName}
                <br />
                {COMPANY_ADDRESS_FULL}
                <br />
                GSTIN {COMPANY.gstin} · CIN {COMPANY.cin}
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
    </>
  );
}
