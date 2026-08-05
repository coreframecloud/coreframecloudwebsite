"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface DownloadInfo {
  version: string;
  sha256: string;
  filename: string;
  available: boolean;
  url?: string;
}

type Stage = "loading" | "unauthenticated" | "ready" | "unavailable" | "paused" | "error";

export default function DownloadPage() {
  const [stage, setStage] = useState<Stage>("loading");
  const [info, setInfo] = useState<DownloadInfo | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("cf_customer_token");
    // Ask the server first even without a token: while downloads are paused the
    // answer is the same for everyone, and telling a signed-out visitor to log
    // in for something that is switched off wastes their time.
    fetch("/api/download/client", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(async (res) => {
        // 503 + paused = downloads are deliberately off, not broken. Say so
        // plainly rather than showing an error the customer might retry at.
        if (res.status === 503) {
          const body = await res.json().catch(() => ({}));
          if (body?.paused) { setStage("paused"); return; }
        }
        if (res.status === 401) { setStage("unauthenticated"); return; }
        if (!res.ok) { setStage("error"); return; }
        if (!token) { setStage("unauthenticated"); return; }
        const data: DownloadInfo = await res.json();
        setInfo(data);
        setStage(data.available ? "ready" : "unavailable");
      })
      .catch(() => setStage("error"));
  }, []);

  function handleDownload() {
    if (!info?.url) return;
    setDownloading(true);
    const a = document.createElement("a");
    a.href = info.url;
    a.download = info.filename;
    a.click();
    setTimeout(() => setDownloading(false), 3000);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-24">
      <div className="w-full max-w-lg">

        {/* Header — always shown */}
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.06]">
            <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7 text-cyan-300" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">Coreframe Cloud Connect</h1>
            <p className="text-sm text-white/40">Windows desktop client</p>
          </div>
        </div>

        {/* Loading */}
        {stage === "loading" && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
            <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-cyan-400/30 border-t-cyan-400" />
            <p className="mt-4 text-sm text-white/40">Verifying your account…</p>
          </div>
        )}

        {/* Downloads paused — deliberate, not a fault */}
        {stage === "paused" && (
          <div className="rounded-2xl border border-amber-400/25 bg-amber-400/[0.06] p-8 text-center">
            <p className="text-base text-amber-100">
              Coreframe Connect downloads are paused while we finish onboarding.
            </p>
            <p className="mt-3 text-sm text-amber-200/70">
              Your account is unaffected. We will email you the moment the client is
              available — there is nothing you need to do.
            </p>
            <Link href="/contact" className="cf-btn-primary mt-6 inline-block">
              Talk to us
            </Link>
          </div>
        )}

        {/* Not logged in */}
        {stage === "unauthenticated" && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
            <p className="text-base text-white/70">
              Sign in to your Coreframe account to access the download.
            </p>
            <Link
              href={`/login?next=/download`}
              className="cf-btn-primary mt-6 inline-block"
            >
              Sign in to download
            </Link>
          </div>
        )}

        {/* Download ready */}
        {stage === "ready" && info && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8">
            {/* Version block */}
            <div className="mb-6 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-white/30">Version</p>
                <p className="mt-1 text-lg font-bold text-white">{info.version}</p>
              </div>
              <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-white/30">Platform</p>
                <p className="mt-1 text-lg font-bold text-white">Windows</p>
              </div>
            </div>

            {/* Requirements */}
            <ul className="mb-6 space-y-2 text-sm text-white/50">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400/60" />
                Windows 10 or 11 (64-bit)
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400/60" />
                Moonlight is bundled — no separate install needed
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400/60" />
                10 Mbps+ internet connection recommended
              </li>
            </ul>

            {/* Download button */}
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="cf-btn-primary w-full"
            >
              {downloading ? "Starting download…" : `Download v${info.version}`}
            </button>

            {/* SHA256 */}
            <div className="mt-4 rounded-lg border border-white/[0.06] bg-black/20 p-3">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-white/25">SHA-256 checksum</p>
              <p className="break-all font-mono text-[11px] text-white/40">{info.sha256}</p>
            </div>

            {/* SmartScreen note */}
            <p className="mt-4 text-xs leading-relaxed text-white/30">
              Windows SmartScreen may show a warning because the installer is not yet code-signed.
              Click <strong className="text-white/40">More info → Run anyway</strong> to proceed.
              This will be resolved before public launch.
            </p>
          </div>
        )}

        {/* File not yet uploaded */}
        {stage === "unavailable" && info && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
            <p className="text-base text-white/70">
              v{info.version} is being prepared. Check back shortly or{" "}
              <a href="mailto:support@coreframecloud.com" className="text-cyan-400 underline underline-offset-2">
                email us
              </a>{" "}
              for a direct link.
            </p>
          </div>
        )}

        {/* Error */}
        {stage === "error" && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.04] p-8 text-center">
            <p className="text-sm text-red-300/70">Something went wrong. Please try again or contact support.</p>
            <button onClick={() => window.location.reload()} className="cf-btn-secondary mt-4">
              Retry
            </button>
          </div>
        )}

        <p className="mt-6 text-center text-xs text-white/20">
          Access is limited to registered Coreframe customers during private beta.
        </p>
      </div>
    </main>
  );
}
