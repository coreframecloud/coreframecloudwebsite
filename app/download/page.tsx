"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface DownloadInfo {
  // Optional because the route omits them when the release feed on the control
  // server is unreachable: it would rather say nothing than quote a version and
  // checksum it cannot currently stand behind.
  version?: string;
  sha256?: string;
  filename?: string;
  available: boolean;
  url?: string;
  size?: number | null;
  releaseDate?: string | null;
  // False until our code-signing certificate is issued (applied for). Drives
  // the SmartScreen/UAC walkthrough below; flips via the INSTALLER_SIGNED env.
  signed?: boolean;
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
    if (info.filename) a.download = info.filename;
    a.click();
    setTimeout(() => setDownloading(false), 3000);
  }

  return (
    <main className="cf-section px-5">
      <div className="mx-auto w-full max-w-[520px]">

        {/* Header — always shown. Stacks on a phone: the icon and a 36px
            display heading will not sit side by side at 390px. */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-cf border border-rule bg-paper-2">
            <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7 text-blue" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
          </div>
          <div className="min-w-0">
            <h1 className="cf-display">Coreframe Cloud Connect</h1>
            <p className="mt-2 text-sm text-ink-2">
              The Windows client. It opens the private link to your workstation and streams the
              desktop back.
            </p>
          </div>
        </div>

        {/* Loading */}
        {stage === "loading" && (
          <div className="rounded-cf border border-rule bg-paper-2 p-6 text-center sm:p-8">
            <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-rule border-t-blue" />
            <p className="mt-4 text-sm text-ink-2">Checking your account.</p>
          </div>
        )}

        {/* Downloads paused — deliberate, not a fault */}
        {stage === "paused" && (
          <div className="cf-note">
            <p className="text-base leading-6 text-ink">
              Downloads are paused while we finish onboarding.
            </p>
            <p className="mt-3 text-sm leading-6 text-ink-2">
              Your account is unaffected. We will email you the moment the client is available.
              There is nothing for you to do.
            </p>
            <Link href="/contact" className="cf-btn-primary mt-6 min-h-[44px]">
              Talk to us
            </Link>
          </div>
        )}

        {/* Not logged in */}
        {stage === "unauthenticated" && (
          <div className="rounded-cf border border-rule bg-paper-2 p-6 text-center sm:p-8">
            <p className="text-base leading-6 text-ink-2">
              Sign in to your Coreframe account to get the download.
            </p>
            <Link
              href={`/login?next=/download`}
              className="cf-btn-primary mt-6 min-h-[44px]"
            >
              Sign in to download
            </Link>
          </div>
        )}

        {/* Download ready */}
        {stage === "ready" && info && (
          <div className="rounded-cf border border-rule bg-paper-2 p-6 sm:p-8">
            {/* Version block — one column on a phone, two from 640px. */}
            <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="min-w-0 rounded-cf border border-rule bg-paper p-4">
                <p className="cf-card-label">Version</p>
                <p className="text-lg leading-6 font-semibold break-words text-ink">{info.version}</p>
              </div>
              <div className="min-w-0 rounded-cf border border-rule bg-paper p-4">
                <p className="cf-card-label">Platform</p>
                <p className="text-lg leading-6 font-semibold text-ink">Windows</p>
              </div>
            </div>

            {/* Requirements */}
            <ul className="mb-6 space-y-2 text-sm leading-6 text-ink-2">
              <li className="flex gap-2">
                <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue" />
                Windows 10 or 11, 64-bit
              </li>
              <li className="flex gap-2">
                <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue" />
                Moonlight is bundled. Nothing else to install
              </li>
              <li className="flex gap-2">
                <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue" />
                About 20 Mbps is comfortable at 1080p, around 50 Mbps for 4K
              </li>
            </ul>

            {/* Download button */}
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="cf-btn-primary min-h-[44px] w-full"
            >
              {downloading ? "Starting download" : `Download v${info.version}`}
            </button>

            {/* SHA-256. Sixty-four characters with no break opportunity in
                them: without break-all this single line is wider than a phone
                and drags the whole page sideways. The container also scrolls,
                so a longer digest cannot reintroduce the overflow. */}
            <div className="mt-4 min-w-0 rounded-cf border border-rule bg-paper p-3">
              <p className="cf-card-label">SHA-256 checksum</p>
              <p className="overflow-x-auto font-mono text-[11px] leading-5 break-all text-ink-2">
                {info.sha256}
              </p>
            </div>

            {/* Unsigned-installer walkthrough — shown until code signing is live.
                The route returns signed:true once INSTALLER_SIGNED is set, and
                this whole block disappears without a code change. */}
            {!info.signed && (
              <div className="cf-note mt-5">
                <p className="text-base leading-6 font-semibold text-ink">
                  Windows will warn you about this installer.
                </p>
                {/* The honest version, and the ask. SmartScreen reputation really is
                    built from install volume on an unsigned binary, so "clicking through
                    helps" is a fact rather than a line - which is the only reason it is
                    worth saying. The earlier copy ("our certificate is still being
                    issued") implied it was days away and quietly aged into a promise. */}
                <p className="mt-2 text-sm leading-6 text-ink-2">
                  Our installer is not code-signed yet, so Windows cannot check the publisher and
                  treats it as unknown. That reputation builds as more people install it &mdash; so
                  if you click through, you are genuinely helping us get there. We are a young
                  company and we would rather say that plainly than pretend the warning is not
                  happening. Nothing is wrong with your machine or with the file, and you can
                  verify it yourself against the checksum above.
                </p>
                <ol className="mt-4 space-y-3 text-sm leading-6 text-ink-2">
                  {/* Edge does NOT behave like Chrome here - it blocks the download
                      outright rather than offering Keep, observed first-hand on 30 Sep.
                      The old copy told people to do the same thing in both, which sent
                      Edge users looking for a button that is not there. */}
                  <li>
                    <strong className="text-ink">1. Use Chrome, not Edge.</strong> Edge blocks this
                    download outright and gives you no way through. Chrome lets it finish &mdash; if
                    it flags the file, open Downloads, click the three dots, then Keep.
                  </li>
                  <li>
                    <strong className="text-ink">2. SmartScreen.</strong> When you run the
                    installer and see &ldquo;Windows protected your PC&rdquo;, click{" "}
                    <strong className="text-ink">More info</strong> &mdash; it is easy to miss,
                    the button only appears after that &mdash; then{" "}
                    <strong className="text-ink">Run anyway</strong>.
                  </li>
                  <li>
                    <strong className="text-ink">3. Permission prompts.</strong> On first connect,
                    Windows asks to allow Coreframe&apos;s network component (Tailscale) and
                    firewall access. Click Yes. They create the private encrypted link to your
                    workstation, and it happens once.
                  </li>
                </ol>
                {/* The two clicks, drawn. People skim an ordered list and then still
                    cannot find "More info", because in the real dialog it is a small
                    link rather than a button. */}
                <figure className="mt-5">
                  <Image
                    src="/guide/windows-install.png"
                    alt="Download in Chrome rather than Edge, then click More info and Run anyway in the Windows SmartScreen dialog."
                    width={1080}
                    height={1240}
                    className="h-auto w-full max-w-[460px] rounded-cf border border-rule"
                  />
                  <figcaption className="mt-2 text-xs leading-5 text-ink-3">
                    An illustration of the dialog, not a screenshot of your machine.
                  </figcaption>
                </figure>

                <div className="mt-4 text-xs leading-5 text-ink-2">
                  To check the file: open PowerShell in your Downloads folder and run
                  <code className="mt-2 block overflow-x-auto rounded-cf border border-rule bg-paper px-2 py-1.5 font-mono text-[11px] break-all text-ink">
                    certutil -hashfile &quot;{info.filename}&quot; SHA256
                  </code>
                  <span className="mt-2 block">
                    The output must match the checksum above. This notice goes away when the signed
                    installer ships.
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* File not yet uploaded */}
        {stage === "unavailable" && info && (
          <div className="rounded-cf border border-rule bg-paper-2 p-6 text-center sm:p-8">
            <p className="text-base leading-6 text-ink-2">
              {info.version ? `v${info.version} is` : "The Windows installer is"} being prepared.
              Check back shortly, or email{" "}
              <a
                href="mailto:support@coreframecloud.com"
                className="break-words text-blue underline underline-offset-4"
              >
                support@coreframecloud.com
              </a>{" "}
              for a direct link.
            </p>
          </div>
        )}

        {/* Error */}
        {stage === "error" && (
          <div className="rounded-cf border border-destructive/30 bg-paper-2 p-6 text-center sm:p-8">
            <p className="text-sm leading-6 text-destructive">
              Something went wrong at our end. Try again, or email support.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="cf-btn-secondary mt-4 min-h-[44px]"
            >
              Retry
            </button>
          </div>
        )}

        <p className="mt-6 text-center text-sm text-ink-3">
          The download is open to registered Coreframe customers during the private beta.
        </p>
      </div>
    </main>
  );
}
