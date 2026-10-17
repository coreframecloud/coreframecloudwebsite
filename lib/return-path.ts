/**
 * Where to send someone once they have signed in AND finished sign-up.
 *
 * /login and /signup take `?next=` and honour it straight after the email code,
 * but a NEW account does not come back that way: it signs in from the magic
 * link in its inbox (a new page load, often a new tab), then goes through
 * /verify for the WhatsApp code, and both of those used to end on
 * /my-activity. So the page that sent them (e.g. /cfd) is remembered
 * here, in this browser, and taken back at the end of whichever path they
 * finish on: the code sign-in, /auth/magic or /verify.
 *
 * Relative paths only (no open redirect), and it expires, so a sign-up
 * abandoned today does not hijack an unrelated sign-in next week.
 */

const KEY = "cf_return_to";

const TTL_MS = 6 * 60 * 60 * 1000;

/**
 * A same-site path, or null. Rejects "//host" and "/\host", which browsers treat as
 * another origin. (Until 17 Oct 2026 the API's own CFD job page was also allowed; it
 * now redirects to /cfd/jobs/<ref> on this site, so no absolute URL is.)
 */
export function safeReturnPath(path: string | null | undefined): string | null {
  if (!path || typeof path !== "string") return null;
  if (!path.startsWith("/") || path.startsWith("//") || path.startsWith("/\\")) return null;
  if (path.length > 300) return null;
  // The CFD page moved from /cfd-intake to /cfd (13 Oct 2026). Sign-in links
  // and remembered paths from before the move still say /cfd-intake: accept
  // them, but store and return the new path so nobody bounces off the redirect.
  const legacy = /^\/cfd-intake(?=$|[/?#])/;
  if (legacy.test(path)) return path.replace(legacy, "/cfd");
  return path;
}

export function rememberReturnPath(path: string | null | undefined): void {
  const p = safeReturnPath(path);
  if (!p) return;
  try {
    localStorage.setItem(KEY, JSON.stringify({ p, at: Date.now() }));
  } catch {
    /* storage blocked: they land on the default page instead */
  }
}

export function peekReturnPath(): string | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as { p?: string; at?: number };
    if (!v.at || Date.now() - v.at > TTL_MS) {
      localStorage.removeItem(KEY);
      return null;
    }
    return safeReturnPath(v.p);
  } catch {
    return null;
  }
}

export function clearReturnPath(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* nothing to clear */
  }
}

/** Read and forget. */
export function takeReturnPath(): string | null {
  const p = peekReturnPath();
  clearReturnPath();
  return p;
}
