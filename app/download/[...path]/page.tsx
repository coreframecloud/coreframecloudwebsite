import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Download Coreframe Cloud Connect — Pilot Access",
  description: "Coreframe Cloud Connect is currently available to pilot customers only.",
  robots: { index: false, follow: false },
};

export default function DownloadPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-24">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.06]">
          <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8 text-cyan-300" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
        </div>

        <h1 className="text-2xl font-semibold text-white">Coreframe Cloud Connect</h1>
        <p className="mt-2 text-sm font-medium uppercase tracking-widest text-cyan-300">
          Pilot access · Private beta
        </p>

        <p className="mt-5 text-base leading-7 text-white/60">
          The Windows client is currently available to <strong className="text-white/80">invited pilot customers</strong> only.
          We&apos;re rolling out access in batches — sign up below and we&apos;ll reach out when your slot is ready.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/signup"
            className="cf-btn-primary"
          >
            Request access
          </Link>
          <Link
            href="/"
            className="cf-btn-secondary"
          >
            Back to home
          </Link>
        </div>

        <p className="mt-8 text-xs text-white/30">
          Already a pilot customer?{" "}
          <a
            href="mailto:support@coreframecloud.com"
            className="text-white/50 underline underline-offset-2 hover:text-white/70"
          >
            Email us
          </a>{" "}
          and we&apos;ll send you the direct download link.
        </p>
      </div>
    </main>
  );
}
