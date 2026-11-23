// A fixed 4 MB block of incompressible bytes for the connection check on My
// Activity (components/my-activity/connection-check.tsx). Built once and served
// from the CDN, so a check measures the visitor's own line, not our servers.
// Seeded, not random: the same bytes every build, so the CDN copy never churns.

export const dynamic = "force-static";

const SIZE = 4 * 1024 * 1024;

function block(): Uint8Array {
  const out = new Uint8Array(SIZE);
  let x = 0x9e3779b9;
  for (let i = 0; i < SIZE; i++) {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    out[i] = x & 0xff;
  }
  return out;
}

export function GET() {
  return new Response(block() as unknown as BodyInit, {
    headers: {
      "content-type": "application/octet-stream",
      "content-length": String(SIZE),
      "cache-control": "public, max-age=86400, s-maxage=31536000, immutable",
    },
  });
}
