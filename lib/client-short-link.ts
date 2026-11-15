import { NextResponse, type NextRequest } from "next/server";
import { currentFileUrl, type ClientTarget } from "@/lib/client-release";

/**
 * The short links support can hand out: /download/mac, /download/mac/intel and
 * /download/windows 302 to the current file on the control server, so the
 * link never goes stale when a release ships (15 Nov 2026).
 *
 * PUBLIC, unlike the /download page. The website's session is an HttpOnly
 * cookie on control.coreframecloud.com that this server never sees (security
 * review 17 Oct 2026), so a route handler here cannot tell who is signed in.
 * The files are public on /releases/ anyway; using Connect is what needs an
 * account. Paused downloads or a missing file go to /download, which explains
 * either case.
 *
 * 302, not 301/308: the target changes with every release and must not be
 * cached by browsers or Cloudflare.
 */
export async function redirectToClient(req: NextRequest, target: ClientTarget) {
  const url = await currentFileUrl(target);
  const res = NextResponse.redirect(url ?? new URL("/download", req.url), 302);
  res.headers.set("Cache-Control", "no-store");
  return res;
}
