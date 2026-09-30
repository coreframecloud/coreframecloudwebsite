import { NextRequest, NextResponse } from "next/server";

const CONTROL_API = "https://control.coreframecloud.com/api";

// The installer, its checksum and its version all come from ONE place: the
// release feed nginx serves out of /home/coreframe/releases on the control
// server. That is the same latest.yml electron-updater reads, so the download
// page and the in-app auto-updater can never disagree about what the current
// build is.
//
// This replaced three hand-edited Vercel env vars (CLIENT_VERSION,
// CLIENT_SHA256, CLIENT_DOWNLOAD_URL). They drifted: 0.3.1 shipped to the
// server while the page still advertised 0.3.0's checksum, and
// CLIENT_DOWNLOAD_URL had never been set at all -- so the page had spent its
// whole life rendering "is being prepared" with no download button, and pilot
// users were emailed direct links instead. Do not reintroduce them.
const RELEASES_BASE = "https://control.coreframecloud.com/releases/";

// Kill switch. Downloads stay OFF until identity verification and live payments
// are proven end to end -- handing out the installer before then means someone
// could install Connect and reach a half-finished onboarding.
//
// This is the REAL gate: the page is client-side and anyone can call this route
// directly, so turning off the UI alone would not stop a download. Set
// DOWNLOADS_ENABLED=true in the Vercel environment to turn it back on.
const DOWNLOADS_ENABLED = process.env.DOWNLOADS_ENABLED === "true";

// Flip to "true" in Vercel env once the code-signing certificate is issued and
// a signed build is published. The download page shows the full
// SmartScreen/UAC walkthrough while this is false, and drops it when true --
// no code change needed on signing day, just the env var + redeploy.
const INSTALLER_SIGNED = process.env.INSTALLER_SIGNED === "true";

type Release = {
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

function releaseUrl(filename: string): string {
  return RELEASES_BASE + encodeURIComponent(filename);
}

async function fetchRelease(): Promise<Release | null> {
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

export async function GET(req: NextRequest) {
  // Checked before authentication: there is nothing to authorise while the
  // whole feature is off, and answering identically to everyone gives away
  // nothing about who is or is not a customer.
  if (!DOWNLOADS_ENABLED) {
    return NextResponse.json(
      {
        available: false,
        paused: true,
        message:
          "Coreframe Connect downloads are paused while we finish onboarding. " +
          "Your account is unaffected — we will email you as soon as it is available.",
      },
      { status: 503 },
    );
  }

  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";

  if (!token) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // Verify token against control plane
  const meRes = await fetch(`${CONTROL_API}/me`, {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 0 },
  });

  if (!meRes.ok) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const release = await fetchRelease();

  if (!release) {
    // The feed is unreachable or malformed. Say nothing about a version we
    // cannot stand behind rather than serving a stale number next to a
    // checksum that may no longer match the file.
    return NextResponse.json({
      available: false,
      signed: INSTALLER_SIGNED,
    });
  }

  return NextResponse.json({
    version: release.version,
    sha256: release.sha256,
    filename: release.filename,
    size: release.size,
    releaseDate: release.releaseDate,
    available: true,
    url: releaseUrl(release.filename),
    signed: INSTALLER_SIGNED,
  });
}
