/**
 * On-demand cache invalidation for the rate card.
 *
 * WHY. Prices are fetched with `revalidate: 3600`, so the site was designed to
 * follow a change in the admin Rate Card panel "within the hour, without a
 * redeploy". On 19 Aug 2026 that failed in the worst way: the ad-hoc rate was
 * set to ₹299, the API served ₹299 correctly, and every page went on showing
 * ₹399 — with the committed tiers derived from ₹399 — for hours. The homepage,
 * the enterprise page, all four SEO landing pages and llms.txt were all wrong
 * together, so nothing looked like a bug; it looked like the change had not
 * been made.
 *
 * An hour is also too long to be waiting for a price to become true. Between
 * the change and the refresh the site quotes a number billing does not charge,
 * which is the one thing the whole rate-card architecture exists to prevent.
 *
 * So the control plane now tells the site the moment a rate or plan changes,
 * and the hour becomes the backstop for a missed webhook rather than the
 * mechanism.
 *
 * SECURITY. A shared secret in the Authorization header, compared in constant
 * time. The endpoint only invalidates a cache — the worst a forged call can do
 * is make the site re-fetch its own rate card — but an unauthenticated endpoint
 * that triggers work is a free way to hammer the control plane, and a 401 that
 * leaks timing is a free way to guess the secret one byte at a time.
 *
 * If REVALIDATE_SECRET is unset the route refuses everything rather than
 * defaulting open. A missing secret means the environment is misconfigured, and
 * "no secret configured" must never read as "no secret required".
 */

import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { RATE_CARD_TAG } from "@/lib/rate-card";

export const dynamic = "force-dynamic";

/** Constant-time compare. Returns false on length mismatch without leaking it. */
function secretMatches(provided: string, expected: string): boolean {
  if (provided.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < provided.length; i++) {
    diff |= provided.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

export async function POST(req: NextRequest) {
  const expected = process.env.REVALIDATE_SECRET ?? "";
  if (!expected) {
    console.error(
      "[revalidate] REVALIDATE_SECRET is not set — refusing. Set it in the " +
        "Vercel environment and on the control plane, or price changes will " +
        "sit behind the one-hour cache.",
    );
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const auth = req.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!secretMatches(token, expected)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // `{ expire: 0 }`, NOT the recommended `"max"` profile.
  //
  // `"max"` gives stale-while-revalidate: the tag is marked stale and the NEXT
  // visitor is still served the old value while fresh data loads behind them.
  // For a blog post that is ideal. For a price it is the exact failure being
  // fixed — one more person is quoted a number billing does not charge, and on
  // a low-traffic site "one more visitor" can be an hour away.
  //
  // `expire: 0` expires it immediately, so the first request after a price
  // change blocks on a single fetch of the rate card and everyone sees the new
  // figure. One slow request per price change is a fair trade.
  //
  // `updateTag` would be the idiomatic way to say this, but Next 16 restricts
  // it to Server Actions and this has to be a Route Handler to be callable by
  // the control plane.
  revalidateTag(RATE_CARD_TAG, { expire: 0 });

  // Logged deliberately. A price change that silently fails to reach the site
  // is exactly the incident this route was written for, so both halves — the
  // control plane calling, and the site accepting — leave a trace.
  console.log(`[revalidate] rate card invalidated (tag=${RATE_CARD_TAG})`);

  return NextResponse.json({ revalidated: true, tag: RATE_CARD_TAG });
}
