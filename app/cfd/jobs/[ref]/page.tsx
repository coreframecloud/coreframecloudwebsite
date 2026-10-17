import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import CfdJobPage from "./job-page";

/**
 * /cfd/jobs/<ref> — the customer's CFD job page (16 Oct 2026).
 *
 * Replaces the API-served page at control.coreframecloud.com/api/cfd-jobs/<ref>/view
 * (which now redirects here; ?classic=1 keeps it for a while). Everything is
 * rendered in the browser from the same JSON endpoints; see lib/cfd-job.ts.
 *
 * The job token arrives in the #fragment (#t=…). The inline script below runs
 * while the HTML is parsed — before hydration and before any analytics tag
 * (all of them load afterInteractive or later) — keeps the token in this
 * origin's localStorage for this job and removes it from the address bar, so
 * page_view, Clarity and the Meta pixel only ever see /cfd/jobs/<ref>.
 * Old-style ?token= links get the same treatment.
 *
 * No-store, noindex and no-referrer come from next.config.ts (/cfd/jobs/:path*).
 */

export const metadata: Metadata = {
  title: "Your CFD job",
  description: "Status, quote, payment and results for your Coreframe CFD job.",
  robots: { index: false, follow: false, nocache: true },
};

const TOKEN_SCRIPT = `(function(){try{
var m=location.pathname.match(/^\\/cfd\\/jobs\\/([A-Za-z0-9_-]{1,64})\\/?$/);if(!m)return;
var h=new URLSearchParams(location.hash.replace(/^#/,"")),q=new URLSearchParams(location.search);
var t=h.get("t")||q.get("token");if(!t)return;
window.__cfJobToken={ref:m[1],t:t};
try{localStorage.setItem("cf_cfd_job_token:"+m[1],JSON.stringify({t:t,at:Date.now()}))}catch(e){}
q.delete("token");var s=q.toString();
history.replaceState(history.state,"",location.pathname+(s?"?"+s:""));
}catch(e){}})();`;

export default async function Page({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(ref)) notFound();
  // The CSP nonce (proxy.ts): without it this inline script would not run.
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  return (
    <>
      <script nonce={nonce} dangerouslySetInnerHTML={{ __html: TOKEN_SCRIPT }} />
      <CfdJobPage refId={ref} />
    </>
  );
}
