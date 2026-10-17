import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import CfdJobPage from "./job-page";

/**
 * /cfd/jobs/<ref> — the customer's CFD job page (16 Oct 2026).
 *
 * Replaces the API-served page at control.coreframecloud.com/api/cfd-jobs/<ref>/view
 * (which now redirects here). Everything is rendered in the browser from the
 * same JSON endpoints; see lib/cfd-job.ts.
 *
 * SIGN-IN ONLY (owner, 17 Oct 2026). The page opens only for the signed-in
 * account that owns the job; there is no job token. Older emails carried one in
 * the #fragment (#t=…) or as ?token=: the inline script below, which runs while
 * the HTML is parsed (before hydration and before any analytics tag), strips it
 * from the address bar WITHOUT using it, and deletes any token this browser kept
 * from those links. Such a visitor sees the sign-in prompt, never the job.
 *
 * No-store, noindex and no-referrer come from next.config.ts (/cfd/jobs/:path*).
 */

export const metadata: Metadata = {
  title: "Your CFD job",
  description: "Status, quote, payment and results for your Coreframe CFD job.",
  robots: { index: false, follow: false, nocache: true },
};

const STRIP_OLD_LINK_SCRIPT = `(function(){try{
var q=new URLSearchParams(location.search),h=location.hash,had=q.has("token")||/(^#|&)t=/.test(h);
try{for(var i=localStorage.length-1;i>=0;i--){var k=localStorage.key(i);if(k&&k.indexOf("cf_cfd_job_token:")===0)localStorage.removeItem(k)}}catch(e){}
if(!had)return;q.delete("token");var s=q.toString();
history.replaceState(history.state,"",location.pathname+(s?"?"+s:""));
}catch(e){}})();`;

export default async function Page({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(ref)) notFound();
  // The CSP nonce (proxy.ts): without it this inline script would not run.
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  return (
    <>
      <script nonce={nonce} dangerouslySetInnerHTML={{ __html: STRIP_OLD_LINK_SCRIPT }} />
      <CfdJobPage refId={ref} />
    </>
  );
}
