import { NextRequest, NextResponse } from "next/server";
import {
  DOWNLOADS_ENABLED,
  INSTALLER_SIGNED,
  fetchMacRelease,
  fetchRelease,
  releaseUrl,
  type MacFile,
} from "@/lib/client-release";

// The feed parsing, the kill switch and the signed flag live in
// lib/client-release.ts, shared with the short links under app/download/
// (/download/mac/apple-silicon, /download/mac/intel, /download/windows). This route only
// shapes the JSON the download page reads.

function macFileJson(file: MacFile | null) {
  return file ? { filename: file.filename, size: file.size, url: releaseUrl(file.filename) } : null;
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

  // NO BEARER HERE ANY MORE (security review 17 Oct 2026). The website's
  // session is an HttpOnly cookie on control.coreframecloud.com, which this
  // server never sees; the download page checks it with the API itself. This
  // route only describes the public release feed (the installer is served
  // publicly from /releases/; using Connect is what needs an account).
  // ?platform=mac answers from latest-mac.yml; anything else is Windows, as
  // it always was, so existing callers are unchanged.
  if (req.nextUrl.searchParams.get("platform") === "mac") {
    const mac = await fetchMacRelease();
    if (!mac) return NextResponse.json({ platform: "mac", available: false });
    return NextResponse.json({
      platform: "mac",
      version: mac.version,
      releaseDate: mac.releaseDate,
      available: true,
      arm64: macFileJson(mac.arm64),
      x64: macFileJson(mac.x64),
    });
  }

  const release = await fetchRelease();

  if (!release) {
    // The feed is unreachable or malformed. Say nothing about a version we
    // cannot stand behind rather than serving a stale number next to a
    // checksum that may no longer match the file.
    return NextResponse.json({
      platform: "windows",
      available: false,
      signed: INSTALLER_SIGNED,
    });
  }

  return NextResponse.json({
    platform: "windows",
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
