import Link from "next/link";
import { ShieldCheck, Clock, EyeOff, Gift } from "lucide-react";

/**
 * Why we verify — shown under the sign-up card.
 *
 * This exists because of what a paid campaign made visible on 19 Sep 2026.
 * 551 people clicked an ad, 161 reached this page, and nobody signed up. Two
 * things were wrong. The page was titled "Sign In" to traffic that had never
 * heard of us, and nothing on it explained why the next screen after the email
 * would ask for a government ID. Cold traffic reads an unexplained ID check as
 * a scam and leaves, which the funnel confirms: of 88 people who started
 * verification only 21 finished, and only 9 of the rest recorded an actual
 * failure. The other ~50 simply stopped.
 *
 * The answer is to say it before it is asked, not after. Every claim here is
 * one the product actually keeps — DigiLocker consent, a masked reference, the
 * trial waiting on the other side — so it can be checked against /verify and
 * /privacy-policy without either page contradicting this one.
 */

function Row({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-3">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cyan-400/10 text-cyan-300">
        {icon}
      </span>
      <span className="text-sm leading-6 text-slate-400">
        <b className="font-medium text-slate-200">{title}</b>
        <br />
        {children}
      </span>
    </li>
  );
}

export function WhyWeVerify({ trialMinutes }: { trialMinutes: number | null }) {
  return (
    <section className="mt-8 rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-6">
      <h2 className="text-sm font-semibold tracking-tight text-white">
        Why we ask for an ID check
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-400">
        Coreframe rents real GPU hardware in India, so we are required to hold a
        verified subscriber record for anyone who runs a workstation — the same
        check you complete for a bank account or a SIM. It happens once, after
        you sign in, not now.
      </p>

      <ul className="mt-5 grid gap-4">
        <Row icon={<ShieldCheck className="h-4 w-4" />} title="Through DigiLocker">
          You approve the share on the Government of India&apos;s own DigiLocker
          screen. We never see or ask for your Aadhaar number, and nothing is
          shared if you decline.
        </Row>
        <Row icon={<Clock className="h-4 w-4" />} title="About two minutes">
          On the phone linked to your Aadhaar. Once, on your first workstation —
          never again.
        </Row>
        <Row icon={<EyeOff className="h-4 w-4" />} title="We keep a masked reference">
          A masked reference and your verified name, kept to prove the check
          happened. Not your documents.
        </Row>
        {trialMinutes ? (
          <Row icon={<Gift className="h-4 w-4" />} title="Your free minutes are on the other side">
            {trialMinutes} GPU minutes and 20 GB of storage are credited once
            you are verified. No card needed.
          </Row>
        ) : null}
      </ul>

      <p className="mt-5 text-xs leading-6 text-slate-500">
        Operated by Coreframe Compute Labs Private Limited, Bengaluru. What we
        collect and how long we keep it is in our{" "}
        <Link href="/privacy-policy" className="text-cyan-400 hover:underline">
          Privacy Policy
        </Link>
        , and the full flow is described in{" "}
        <Link href="/how-to-use" className="text-cyan-400 hover:underline">
          how it works
        </Link>
        .
      </p>
    </section>
  );
}
