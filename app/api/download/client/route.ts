import { NextRequest, NextResponse } from "next/server";

const CONTROL_API = "https://control.coreframecloud.com/api";

// Set CLIENT_DOWNLOAD_URL in your Vercel env vars (or .env.local).
// Point it at your S3 presigned URL, Google Drive direct link, or any HTTPS URL.
const DOWNLOAD_URL = process.env.CLIENT_DOWNLOAD_URL || "";

// Kill switch. Downloads stay OFF until identity verification and live payments
// are proven end to end — handing out the installer before then means someone
// could install Connect and reach a half-finished onboarding.
//
// This is the REAL gate: the page is client-side and anyone can call this route
// directly, so turning off the UI alone would not stop a download. Set
// DOWNLOADS_ENABLED=true in the Vercel environment to turn it back on.
const DOWNLOADS_ENABLED = process.env.DOWNLOADS_ENABLED === "true";
const CLIENT_VERSION = process.env.CLIENT_VERSION || "0.1.48";
const CLIENT_SHA256 = process.env.CLIENT_SHA256 || "28b0c312c93d6ace3ff6a2eb799abfc87f8a94f3909e6c4b1e0123812905f7a1";
const CLIENT_FILENAME = `Coreframe Cloud Connect Setup ${CLIENT_VERSION}.exe`;
// Flip to "true" in Vercel env once the code-signing certificate is issued and
// a signed build is published. The download page shows the full
// SmartScreen/UAC walkthrough while this is false, and drops it when true —
// no code change needed on signing day, just the env var + redeploy.
const INSTALLER_SIGNED = process.env.INSTALLER_SIGNED === "true";

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

  if (!DOWNLOAD_URL) {
    // File not yet uploaded — return metadata only so the page can show version info
    return NextResponse.json({
      version: CLIENT_VERSION,
      sha256: CLIENT_SHA256,
      filename: CLIENT_FILENAME,
      available: false,
      signed: INSTALLER_SIGNED,
    });
  }

  return NextResponse.json({
    version: CLIENT_VERSION,
    sha256: CLIENT_SHA256,
    filename: CLIENT_FILENAME,
    available: true,
    url: DOWNLOAD_URL,
    signed: INSTALLER_SIGNED,
  });
}
