// node --experimental-strip-types --test tests/  (npm test)
// The short links (/download/mac, /download/mac/intel, /download/windows)
// resolve through currentFileUrl(); the feed is stubbed, nothing leaves the box.
import { test } from "node:test";
import assert from "node:assert/strict";

process.env.DOWNLOADS_ENABLED = "true";
const { currentFileUrl, RELEASES_BASE } = await import("../lib/client-release.ts");

const LATEST_MAC = `version: 1.3.20
files:
  - url: Coreframe Cloud Connect-1.3.20-arm64-mac.zip
    sha512: aaa
    size: 255000000
  - url: Coreframe Cloud Connect 1.3.20-arm64.dmg
    sha512: bbb
    size: 265123456
  - url: Coreframe Cloud Connect 1.3.20-x64.dmg
    sha512: ccc
    size: 271000000
path: Coreframe Cloud Connect-1.3.20-arm64-mac.zip
sha512: aaa
releaseDate: '2026-11-14T10:00:00.000Z'
`;
const LATEST_WIN = `version: 1.3.20
files:
  - url: Coreframe-Cloud-Connect-Setup-1.3.20.exe
    sha512: ddd
    size: 120000000
path: Coreframe-Cloud-Connect-Setup-1.3.20.exe
sha512: ddd
releaseDate: '2026-11-14T10:00:00.000Z'
`;

function stubFeed(files: Record<string, string>) {
  globalThis.fetch = (async (input: string | URL) => {
    const name = decodeURIComponent(String(input).slice(RELEASES_BASE.length));
    return name in files ? new Response(files[name]) : new Response("", { status: 404 });
  }) as typeof fetch;
}

test("mac short links point at the current DMG for each chip", async () => {
  stubFeed({ "latest-mac.yml": LATEST_MAC });
  assert.equal(
    await currentFileUrl("mac-arm64"),
    RELEASES_BASE + "Coreframe%20Cloud%20Connect%201.3.20-arm64.dmg",
  );
  assert.equal(
    await currentFileUrl("mac-x64"),
    RELEASES_BASE + "Coreframe%20Cloud%20Connect%201.3.20-x64.dmg",
  );
});

test("windows short link needs a valid checksum, like the page", async () => {
  stubFeed({ "latest.yml": LATEST_WIN });
  assert.equal(await currentFileUrl("windows"), null);
  stubFeed({
    "latest.yml": LATEST_WIN,
    "Coreframe-Cloud-Connect-Setup-1.3.20.exe.sha256": "a".repeat(64) + "  file.exe\n",
  });
  assert.equal(await currentFileUrl("windows"), RELEASES_BASE + "Coreframe-Cloud-Connect-Setup-1.3.20.exe");
});

test("an unreachable feed gives no link (the route sends people to /download)", async () => {
  stubFeed({});
  assert.equal(await currentFileUrl("mac-arm64"), null);
  assert.equal(await currentFileUrl("windows"), null);
});
