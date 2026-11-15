"use client";

import { API_BASE } from "@/lib/api-base";
import { flush as flushWebEvents, track as trackWebEvent } from "@/lib/web-events";
import { apiFetch, isSignedIn } from "@/lib/session";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BANDWIDTH_SHORT } from "@/lib/streaming-terms";
import { ChosenGpuNote } from "@/components/go/chosen-gpu-note";
import { MacHelp, formatMacSize } from "@/components/download/mac-help";

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

// The Mac answer from /api/download/client?platform=mac (latest-mac.yml).
// Two DMGs per release, one per chip; both are Developer ID signed and
// notarized, so there is no checksum or Gatekeeper walkthrough to show.
interface MacFile {
  filename: string;
  size: number | null;
  url: string;
}
interface MacInfo {
  version?: string;
  releaseDate?: string | null;
  available: boolean;
  arm64?: MacFile | null;
  x64?: MacFile | null;
}

type Platform = "mac" | "windows";
type Chip = "arm64" | "x64";

// Mac or not, from the browser. iPadOS also says "Macintosh" in its user agent
// but has touch points, and cannot install a .dmg, so it is not a Mac here.
// Anything that is not a Mac gets the Windows build first, as before.
function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "windows";
  const uaData = (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData;
  const platform = uaData?.platform || navigator.platform || "";
  const isMac = /mac/i.test(platform) || /Macintosh|Mac OS X/.test(navigator.userAgent);
  if (isMac && navigator.maxTouchPoints > 1) return "windows";
  return isMac ? "mac" : "windows";
}

// Which chip, if the browser can tell. NEVER a default (15 Nov 2026): a
// customer on Brave/Intel got the Apple silicon DMG because this returned null
// and the page then assumed arm64, and macOS said "this application is not
// supported on this Mac". So:
//  - Chromium's high-entropy hint ("arm" / "x86") is trusted when offered.
//  - Otherwise (Safari, Firefox, Brave refuses the hint) the WebGL renderer is
//    read as a hint only: "Apple M..." means Apple silicon, "Intel" / "AMD"
//    means an Intel Mac. Many browsers mask it ("Apple GPU"); then nothing.
//  - Nothing either way: no chip is picked and the button waits for one.
// The "Not sure?" helper is always shown beside the choice.
async function detectChip(): Promise<Chip | null> {
  const uaData = (navigator as Navigator & {
    userAgentData?: { getHighEntropyValues?: (hints: string[]) => Promise<{ architecture?: string }> };
  }).userAgentData;
  if (uaData?.getHighEntropyValues) {
    try {
      const { architecture } = await uaData.getHighEntropyValues(["architecture"]);
      if (architecture === "arm") return "arm64";
      if (architecture === "x86") return "x64";
    } catch {
      /* hint refused: try the renderer */
    }
  }
  return chipFromWebGl();
}

function chipFromWebGl(): Chip | null {
  try {
    const gl = document.createElement("canvas").getContext("webgl");
    if (!gl) return null;
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = String(
      ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER),
    );
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    if (/Apple M\d/i.test(renderer)) return "arm64";
    if (/Intel|AMD|Radeon/i.test(renderer)) return "x64";
  } catch {
    /* no WebGL: no hint */
  }
  return null;
}

// Decimal megabytes with one decimal, the way Finder's Get Info shows size
// (271.7 MB), so it matches the "Trouble opening" help a customer checks against.
const formatSize = formatMacSize;

const CHIP_LABEL: Record<Chip, string> = { arm64: "Apple silicon", x64: "Intel" };

type Stage = "loading" | "unauthenticated" | "ready" | "paused" | "error";

// What the primary button started, kept until the page is left (15 Nov 2026).
// A customer on Chrome/macOS clicked Download five times: the file is
// cross-origin, so Chrome ignores the download attribute and drops it into its
// download bubble without a word, and the old 3 s "Starting download" flash
// then put the button back as if nothing had happened. Now the button is
// replaced by what to look for and what to do next, and a plain link is the
// deliberate retry.
interface Started {
  platform: Platform;
  chip: Chip;
  filename: string;
  size: number | null;
  url: string;
  version?: string;
}

// The props both download events carry: platform as mac-arm64 / mac-x64 /
// windows, the release version.
function eventProps(s: Pick<Started, "platform" | "chip" | "version">) {
  return {
    platform: s.platform === "mac" ? `mac-${s.chip}` : "windows",
    version: s.version ?? undefined,
  };
}

/**
 * After the click: a persistent "it has started" panel with the next steps for
 * the OS, then the fallback links. Plain <a href>s, not script: a normal link
 * the customer clicks is the most reliable way to get a cross-origin file, and
 * a click on it is tracked as download_fallback_click so a failing primary path
 * shows up in the numbers.
 */
function StartedPanel({
  started,
  otherChip,
}: {
  started: Started;
  otherChip: (MacFile & { chip: Chip }) | null;
}) {
  const headingRef = useRef<HTMLParagraphElement>(null);
  // Move focus here so a screen reader announces the change; the button that
  // had focus no longer exists.
  useEffect(() => headingRef.current?.focus(), []);
  const size = formatSize(started.size);
  const file = (
    <>
      <strong className="break-words text-ink">{started.filename}</strong>
      {size ? ` (${size})` : ""}
    </>
  );
  const onFallback = (chip: Chip) => () => {
    trackWebEvent("download_fallback_click", eventProps({ ...started, chip }));
    flushWebEvents();
  };
  return (
    <div role="status" aria-live="polite">
      <div className="cf-note">
        <p
          ref={headingRef}
          tabIndex={-1}
          className="flex items-center gap-2 text-base leading-6 font-semibold text-ink outline-none"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 shrink-0 text-blue" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
          Your download has started
        </p>
        <p className="mt-2 text-sm leading-6 text-ink-2">
          Check the <span aria-hidden="true">↓</span>
          <span className="sr-only">downloads</span> icon at the top right of your browser, or your
          Downloads folder, for {file}.
        </p>
        <ol className="mt-4 space-y-2 text-sm leading-6 text-ink-2">
          {started.platform === "mac" ? (
            <>
              <li><strong className="text-ink">1.</strong> Open the .dmg file.</li>
              <li>
                <strong className="text-ink">2.</strong> Drag Coreframe Cloud Connect into
                Applications.
              </li>
              <li>
                <strong className="text-ink">3.</strong> Open it from Applications and sign in with
                this account.
              </li>
              <li className="pt-1">
                If macOS says the app is not supported on this Mac, you downloaded the wrong chip
                version. Use the other link below.
              </li>
            </>
          ) : (
            <>
              <li><strong className="text-ink">1.</strong> Open the .exe file.</li>
              <li>
                <strong className="text-ink">2.</strong> Follow the installer. If Windows asks to
                allow changes, click Yes.
              </li>
              <li>
                <strong className="text-ink">3.</strong> Open Coreframe Cloud Connect and sign in
                with this account.
              </li>
            </>
          )}
        </ol>
      </div>

      {/* The deliberate retry, right under it. Real links: 24 before them,
          per the form spacing system. */}
      <div className="mt-6 space-y-1 text-center text-sm leading-6 text-ink-2">
        <p>
          Didn&apos;t start?{" "}
          <a
            href={started.url}
            onClick={onFallback(started.chip)}
            className="inline-flex min-h-[44px] items-center text-blue underline underline-offset-4"
          >
            Download directly
          </a>
        </p>
        {otherChip && (
          <p>
            {otherChip.chip === "x64" ? "Intel Mac?" : "Apple silicon Mac?"}{" "}
            <a
              href={otherChip.url}
              onClick={onFallback(otherChip.chip)}
              className="inline-flex min-h-[44px] items-center text-blue underline underline-offset-4"
            >
              {otherChip.chip === "x64"
                ? "Download the Intel version"
                : "Download the Apple silicon version"}
            </a>
          </p>
        )}
      </div>
    </div>
  );
}

export default function DownloadPage() {
  const [stage, setStage] = useState<Stage>("loading");
  const [info, setInfo] = useState<DownloadInfo | null>(null);
  const [mac, setMac] = useState<MacInfo | null>(null);
  const [platform, setPlatform] = useState<Platform>("windows");
  const [chip, setChip] = useState<Chip | null>(null);
  const [started, setStarted] = useState<Started | null>(null);

  useEffect(() => {
    // Ask the server first even when signed out: while downloads are paused the
    // answer is the same for everyone, and telling a signed-out visitor to log
    // in for something that is switched off wastes their time. Signed in or
    // not is the API's answer for the session cookie (lib/session.ts).
    const signedIn = isSignedIn()
      ? apiFetch(`${API_BASE}/me`).then((r) => r.ok).catch(() => false)
      : Promise.resolve(false);
    // The Mac feed is fetched alongside; if it fails the Windows download still
    // works and the Mac side simply reads as "being prepared".
    const macInfo: Promise<MacInfo> = fetch("/api/download/client?platform=mac")
      .then((r) => (r.ok ? r.json() : { available: false }))
      .catch(() => ({ available: false }));
    fetch("/api/download/client")
      .then(async (res) => {
        const token = await signedIn;
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
        setMac(await macInfo);
        // OS detection happens here, on the client and only once there is a
        // download to show: the server render cannot see the browser.
        const detected = detectPlatform();
        if (detected === "mac") {
          const c = await detectChip();
          if (c) setChip(c);
        }
        setPlatform(detected);
        setStage("ready");
      })
      .catch(() => setStage("error"));
  }, []);

  const macAvailable = Boolean(mac?.available && (mac.arm64 || mac.x64));
  const macFile = mac?.available && chip ? (mac[chip] ?? null) : null;
  const winReady = Boolean(info?.available && info.url);
  const current = platform === "mac" ? macAvailable : winReady;
  const other: Platform = platform === "mac" ? "windows" : "mac";

  // The panel belongs to the OS it was started for: "Also on Windows" after a
  // Mac download shows the Windows button as normal.
  const startedHere = started?.platform === platform ? started : null;
  const otherChipFile: (MacFile & { chip: Chip }) | null = (() => {
    if (!startedHere || startedHere.platform !== "mac" || !mac?.available) return null;
    const c: Chip = startedHere.chip === "arm64" ? "x64" : "arm64";
    const f = mac[c];
    return f ? { ...f, chip: c } : null;
  })();

  function handleDownload() {
    // One click, one download: the button is gone once this runs, and the
    // "Download directly" link is the deliberate retry.
    if (startedHere) return;
    const file =
      platform === "mac"
        ? macFile && { filename: macFile.filename, size: macFile.size, url: macFile.url, version: mac?.version }
        : info?.url && info.filename
          ? { filename: info.filename, size: info.size ?? null, url: info.url, version: info.version }
          : null;
    if (!file) return;
    // A Mac download needs a chip the customer chose or the browser told us.
    if (platform === "mac" && !chip) return;
    const s: Started = { platform, chip: chip ?? "x64", ...file };
    trackWebEvent("download_click", eventProps(s));
    flushWebEvents();
    setStarted(s);
    // Cross-origin, so no download attribute (Chrome ignores it): the file is
    // served as an attachment and the browser keeps this page open.
    const a = document.createElement("a");
    a.href = file.url;
    a.rel = "noopener";
    a.click();
  }

  // The other OS, offered quietly under the card: one primary button per page.
  const alsoOn = (
    <p className="mt-6 text-center text-sm text-ink-2">
      <button
        type="button"
        onClick={() => setPlatform(other)}
        className="min-h-[44px] text-blue underline underline-offset-4"
      >
        {other === "mac" ? "Also on Mac" : "Also on Windows"}
      </button>
    </p>
  );

  return (
    <main className="cf-section px-5">
      <div className="mx-auto w-full max-w-[520px]">

        {/* The card chosen before sign-up (10 Nov 2026), when there is one. */}
        <ChosenGpuNote />

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
              The desktop app for Mac and Windows. It opens the private link to your workstation
              and streams the desktop back.
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
              Your account isn&apos;t affected, and you don&apos;t need to do anything. We&apos;ll email
              you as soon as the client is available.
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

        {/* Download ready: Mac */}
        {stage === "ready" && platform === "mac" && mac && macAvailable && (
          <div className="rounded-cf border border-rule bg-paper-2 p-6 sm:p-8">
            <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="min-w-0 rounded-cf border border-rule bg-paper p-4">
                <p className="cf-card-label">Version</p>
                <p className="text-lg leading-6 font-semibold break-words text-ink">{mac.version}</p>
              </div>
              <div className="min-w-0 rounded-cf border border-rule bg-paper p-4">
                <p className="cf-card-label">Platform</p>
                <p className="text-lg leading-6 font-semibold text-ink">Mac</p>
              </div>
            </div>

            {startedHere ? (
              <StartedPanel started={startedHere} otherChip={otherChipFile} />
            ) : (
              <>
                {/* Chip choice. Preselected only when the browser told us (see
                    detectChip); otherwise none, and the button waits for a pick.
                    Spacing follows the form system: label 8, choice 20 before
                    the list. */}
                <fieldset className="mb-5">
                  <legend className="mb-2 text-sm leading-5 text-ink-2">Your Mac&apos;s chip</legend>
                  <div className="flex flex-wrap gap-2" role="radiogroup">
                    {(["arm64", "x64"] as Chip[]).map((c) => {
                      const file = mac[c];
                      if (!file) return null;
                      const on = chip === c;
                      return (
                        <button
                          key={c}
                          type="button"
                          role="radio"
                          aria-checked={on}
                          onClick={() => setChip(c)}
                          className={`min-h-[44px] rounded-full border px-4 text-sm transition-colors ${
                            on ? "border-ink bg-ink text-white" : "border-rule-strong bg-transparent text-ink"
                          }`}
                        >
                          {c === "arm64" ? "Apple silicon (M1 and later)" : "Intel"}
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-1 text-xs leading-5 text-ink-3">
                    Not sure? Apple menu → About This Mac: &ldquo;Chip: Apple M…&rdquo; = Apple
                    silicon, &ldquo;Processor: Intel&rdquo; = Intel.
                  </p>
                </fieldset>

                <ul className="mb-6 space-y-2 text-sm leading-6 text-ink-2">
                  <li className="flex gap-2">
                    <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue" />
                    macOS 11 or later, Apple silicon or Intel
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue" />
                    Moonlight is bundled. Nothing else to install
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue" />
                    {BANDWIDTH_SHORT}
                  </li>
                </ul>

                <button
                  onClick={handleDownload}
                  disabled={!macFile}
                  className="cf-btn-go cf-btn-flash w-full disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {macFile ? "Download for Mac" : "Choose your chip first"}
                </button>
                <p className="mt-1 text-center text-xs leading-5 text-ink-3">
                  v{mac.version}
                  {chip && macFile
                    ? ` · ${CHIP_LABEL[chip]}${formatSize(macFile.size) ? ` · ${formatSize(macFile.size)}` : ""}`
                    : ""}{" "}
                  · .dmg
                </p>

                <p className="mt-5 text-sm leading-6 text-ink-2">
                  Open the .dmg and drag Coreframe Cloud Connect to Applications.
                </p>
              </>
            )}

            {/* Collapsed help, before and after the click (15 Nov 2026). */}
            <MacHelp
              sizes={{ arm64: mac.arm64?.size, x64: mac.x64?.size }}
              className="mt-6"
            />
          </div>
        )}

        {/* Download ready: Windows */}
        {stage === "ready" && platform === "windows" && info && winReady && (
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
                {BANDWIDTH_SHORT}
              </li>
            </ul>

            {/* Download button, or what happens next once it was clicked */}
            {startedHere ? (
              <StartedPanel started={startedHere} otherChip={null} />
            ) : (
              <>
                <button onClick={handleDownload} className="cf-btn-go cf-btn-flash w-full">
                  {`Download Coreframe Connect v${info.version}`}
                </button>
                <p className="mt-1 text-center text-xs leading-5 text-ink-3">
                  v{info.version} · Windows
                  {formatSize(info.size) ? ` · ${formatSize(info.size)}` : ""} · .exe
                </p>
              </>
            )}

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
                  Our installer isn&apos;t code-signed yet, so Windows can&apos;t check the publisher and
                  treats it as unknown. Windows builds that reputation as more people install it,
                  so clicking through does help us get there. We&apos;re a young company and
                  we&apos;d rather tell you that than pretend the warning isn&apos;t there. Nothing is
                  wrong with your machine or with the file, and you can check it yourself against
                  the checksum above.
                </p>
                <ol className="mt-4 space-y-3 text-sm leading-6 text-ink-2">
                  {/* Edge does NOT behave like Chrome here - it blocks the download
                      outright rather than offering Keep, observed first-hand on 30 Sep.
                      The old copy told people to do the same thing in both, which sent
                      Edge users looking for a button that is not there. */}
                  <li>
                    <strong className="text-ink">1. Use Chrome, not Edge.</strong> Edge blocks this
                    download outright and gives you no way through. Chrome lets it finish. If
                    it flags the file, open Downloads, click the three dots, then Keep.
                  </li>
                  <li>
                    <strong className="text-ink">2. SmartScreen.</strong> When you run the
                    installer and see &ldquo;Windows protected your PC&rdquo;, click{" "}
                    <strong className="text-ink">More info</strong>, then{" "}
                    <strong className="text-ink">Run anyway</strong>. It&apos;s easy to miss: the Run
                    anyway button only appears after you click More info.
                  </li>
                  <li>
                    <strong className="text-ink">3. Permission prompts.</strong> On first connect,
                    Windows asks to allow Coreframe&apos;s network component (Tailscale) and
                    firewall access. Click Yes. They set up the private encrypted link to your
                    workstation, and you only see them once.
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

        {/* File not yet uploaded for the platform being shown */}
        {stage === "ready" && !current && (
          <div className="rounded-cf border border-rule bg-paper-2 p-6 text-center sm:p-8">
            <p className="text-base leading-6 text-ink-2">
              {platform === "mac" ? "The Mac app is" : "The Windows installer is"} being prepared.
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

        {stage === "ready" && alsoOn}

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
