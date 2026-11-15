/**
 * The Coreframe Connect release feed, read in one place.
 *
 * The installer, its checksum and its version all come from the release feed
 * nginx serves out of /home/coreframe/releases on the control server. That is
 * the same latest.yml electron-updater reads, so the download page, the short
 * links (/download/mac/apple-silicon, /download/mac/intel, /download/windows) and the in-app
 * auto-updater can never disagree about what the current build is.
 *
 * This replaced three hand-edited Vercel env vars (CLIENT_VERSION,
 * CLIENT_SHA256, CLIENT_DOWNLOAD_URL). They drifted: 0.3.1 shipped to the
 * server while the page still advertised 0.3.0's checksum, and
 * CLIENT_DOWNLOAD_URL had never been set at all -- so the page had spent its
 * whole life rendering "is being prepared" with no download button, and pilot
 * users were emailed direct links instead. Do not reintroduce them.
 *
 * Server-only: used by app/api/download/client/route.ts and the short-link
 * route handlers under app/download/.
 */
export const RELEASES_BASE = "https://control.coreframecloud.com/releases/";

// Kill switch. Downloads stay OFF until sign-up (email + mobile) and live payments
// are proven end to end -- handing out the installer before then means someone
// could install Connect and reach a half-finished onboarding.
//
// This is the REAL gate: the page is client-side and anyone can call the
// routes directly, so turning off the UI alone would not stop a download. Set
// DOWNLOADS_ENABLED=true in the Vercel environment to turn it back on.
export const DOWNLOADS_ENABLED = process.env.DOWNLOADS_ENABLED === "true";

// Flip to "true" in Vercel env once the code-signing certificate is issued and
// a signed build is published. The download page shows the full
// SmartScreen/UAC walkthrough while this is false, and drops it when true --
// no code change needed on signing day, just the env var + redeploy.
// 17 Oct 2026: Connect 1.0.0 is the first build signed with the SSL.com certificate
// (Coreframe Compute Labs Private Limited), so signed is now the default; set
// INSTALLER_SIGNED=false in Vercel only if an unsigned build is ever published again.
export const INSTALLER_SIGNED = process.env.INSTALLER_SIGNED !== "false";

export type Release = {
  version: string;
  filename: string;
  sha256: string;
  size: number | null;
  releaseDate: string | null;
};

// latest.yml is small and rigidly shaped by electron-builder, so it is read
// with regexes rather than pulling in a YAML parser. `path:` and `version:` sit
// at column 0; `size:` is nested under `files:` and is therefore matched with
// leading whitespace allowed.
function parseLatestYml(text: string): Omit<Release, "sha256"> | null {
  const version = text.match(/^version:\s*(.+?)\s*$/m)?.[1];
  const filename = text.match(/^path:\s*(.+?)\s*$/m)?.[1];
  if (!version || !filename) return null;

  const size = text.match(/^\s*size:\s*(\d+)\s*$/m)?.[1];
  const releaseDate = text.match(/^releaseDate:\s*'?([^'\n]+?)'?\s*$/m)?.[1];

  return {
    version,
    filename,
    size: size ? Number(size) : null,
    releaseDate: releaseDate ?? null,
  };
}

// latest-mac.yml (electron-builder, mac target) lists every file under
// `files:` as `- url:` with its own `sha512:` and `size:`; the column-0 `path:`
// points at a .zip (what electron-updater uses), never at the .dmg a person
// should download. So the DMGs are found in the list by arch suffix. There is
// no .sha256 sidecar for the Mac files: the DMGs are Developer ID signed and
// notarized, and macOS checks that on open.
export type MacFile = { filename: string; size: number | null };
export type MacRelease = {
  version: string;
  releaseDate: string | null;
  arm64: MacFile | null;
  x64: MacFile | null;
};

function parseLatestMacYml(text: string): MacRelease | null {
  const version = text.match(/^version:\s*(.+?)\s*$/m)?.[1];
  if (!version) return null;
  const releaseDate = text.match(/^releaseDate:\s*'?([^'\n]+?)'?\s*$/m)?.[1] ?? null;

  // One entry per "- url:" line; its size is the first `size:` before the
  // next entry (or before the column-0 keys that follow the list).
  const entries: MacFile[] = [];
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const url = lines[i].match(/^\s*-\s*url:\s*'?(.+?)'?\s*$/)?.[1];
    if (!url) continue;
    let size: number | null = null;
    for (let j = i + 1; j < lines.length; j++) {
      if (/^\s*-\s*url:/.test(lines[j]) || /^\S/.test(lines[j])) break;
      const m = lines[j].match(/^\s*size:\s*(\d+)\s*$/);
      if (m) { size = Number(m[1]); break; }
    }
    entries.push({ filename: url, size });
  }

  const dmg = (arch: "arm64" | "x64") =>
    entries.find((e) => e.filename.endsWith(`-${arch}.dmg`)) ?? null;
  const arm64 = dmg("arm64");
  const x64 = dmg("x64");
  if (!arm64 && !x64) return null;
  return { version, releaseDate, arm64, x64 };
}

export function releaseUrl(filename: string): string {
  return RELEASES_BASE + encodeURIComponent(filename);
}

export async function fetchMacRelease(): Promise<MacRelease | null> {
  try {
    const res = await fetch(RELEASES_BASE + "latest-mac.yml", { cache: "no-store" });
    if (!res.ok) return null;
    return parseLatestMacYml(await res.text());
  } catch {
    return null;
  }
}

export async function fetchRelease(): Promise<Release | null> {
  try {
    const ymlRes = await fetch(RELEASES_BASE + "latest.yml", { cache: "no-store" });
    if (!ymlRes.ok) return null;

    const parsed = parseLatestYml(await ymlRes.text());
    if (!parsed) return null;

    // The .sha256 file is what a human verifies against with
    // `certutil -hashfile ... SHA256`. It is NOT the sha512 in latest.yml,
    // which electron-updater checks on its own. Both describe the same file.
    const shaRes = await fetch(releaseUrl(parsed.filename) + ".sha256", { cache: "no-store" });
    if (!shaRes.ok) return null;

    const sha256 = (await shaRes.text()).trim().split(/\s+/)[0];
    if (!/^[0-9a-f]{64}$/.test(sha256)) return null;

    return { ...parsed, sha256 };
  } catch {
    return null;
  }
}

/** Which file a short link stands for. */
export type ClientTarget = "mac-arm64" | "mac-x64" | "windows";

/**
 * The current file URL for a short link, or null when downloads are paused or
 * the feed has no such file (the caller then sends the visitor to /download,
 * which explains either case).
 */
export async function currentFileUrl(target: ClientTarget): Promise<string | null> {
  if (!DOWNLOADS_ENABLED) return null;
  if (target === "windows") {
    // Same answer as the page: no valid checksum, no link.
    const release = await fetchRelease();
    return release ? releaseUrl(release.filename) : null;
  }
  const mac = await fetchMacRelease();
  const file = mac?.[target === "mac-arm64" ? "arm64" : "x64"];
  return file ? releaseUrl(file.filename) : null;
}
