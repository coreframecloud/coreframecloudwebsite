/**
 * Sign-out and post-sign-in navigation for the cookie session (lib/session.ts).
 *
 * The API's HttpOnly cookies on control.coreframecloud.com ARE the session
 * now (security review 17 Oct 2026). Nothing here handles a token: the
 * browser carries the cookies on every call made with credentials:"include".
 */
import { API_BASE } from "@/lib/api-base";
import { adoptLegacyToken, forgetLocalSession as forgetLocal } from "@/lib/session";

export { forgetLocalSession } from "@/lib/session";

/**
 * Navigate after sign-in. The API set the cookies on the sign-in response
 * itself, so pages it serves (the CFD job page) already see the session.
 */
export async function goAfterSignIn(dest: string): Promise<void> {
  await adoptLegacyToken();
  window.location.href = dest;
}

/** Clear the API's session cookies without revoking anything (fallback only). */
export async function clearSessionCookie(): Promise<void> {
  try {
    await fetch(`${API_BASE}/auth/session-cookie`, { method: "DELETE", credentials: "include" });
  } catch {
    /* offline: the access cookie expires within 15 minutes anyway */
  }
}

/**
 * Sign out of THIS browser for real: the API revokes this session's token and
 * its refresh chain and clears both cookies. Other devices (Connect
 * mid-session) stay signed in. The legacy argument is ignored when there is
 * no old bearer left.
 */
export async function signOutThisSession(legacyToken?: string | null): Promise<void> {
  try {
    const res = await fetch(`${API_BASE}/auth/sign-out`, {
      method: "POST",
      credentials: "include",
      headers: legacyToken && legacyToken !== "cookie" ? { Authorization: `Bearer ${legacyToken}` } : {},
    });
    if (res.ok) return;
  } catch {
    /* fall through */
  }
  await clearSessionCookie();
}

/**
 * End every session on every device: this browser, other browsers, Studio and
 * Coreframe Connect. Returns false when the API refused (e.g. the session had
 * already ended).
 */
export async function signOutEverywhere(): Promise<boolean> {
  await adoptLegacyToken();
  const call = () =>
    fetch(`${API_BASE}/auth/sign-out-everywhere`, { method: "POST", credentials: "include" });
  try {
    let res = await call();
    if (res.status === 401) {
      const { renewSession } = await import("@/lib/session");
      if (await renewSession()) res = await call();
    }
    if (res.ok) forgetLocal();
    return res.ok;
  } catch {
    return false;
  }
}
