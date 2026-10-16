/**
 * Keep the API's HttpOnly session cookie in step with the site's token.
 *
 * WHY (16 Oct 2026). The site signs in with a bearer token in localStorage,
 * but pages the API serves itself — the CFD job page and its "Pay quote fee"
 * button — can only see the `cf_session` cookie on control.coreframecloud.com.
 * The API set that cookie on every sign-in, and the browser threw it away,
 * because no fetch here sent `credentials: "include"`. Every job page 401'd.
 *
 * Now: sign-in calls send credentials, and on every page load with a token the
 * header asks the API to (re)set the cookie for that same token (POST
 * /auth/session-cookie, bearer-authenticated). Once per token per tab.
 * Signing out removes it (DELETE). The cookie stays host-only on control.
 */
import { API_BASE } from "@/lib/api-base";

const SYNCED_KEY = "cf_session_cookie_synced";

/** The tail of the token: enough to tell tokens apart, useless on its own. */
function tag(token: string): string {
  return token.slice(-16);
}

export async function syncSessionCookie(token: string | null | undefined, force = false): Promise<boolean> {
  if (!token) return false;
  try {
    if (!force && sessionStorage.getItem(SYNCED_KEY) === tag(token)) return true;
  } catch {
    /* storage blocked: just sync */
  }
  try {
    const res = await fetch(`${API_BASE}/auth/session-cookie`, {
      method: "POST",
      credentials: "include",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return false;
    try {
      sessionStorage.setItem(SYNCED_KEY, tag(token));
    } catch {
      /* fine: syncs again next load */
    }
    return true;
  } catch {
    return false;
  }
}

export async function clearSessionCookie(): Promise<void> {
  try {
    sessionStorage.removeItem(SYNCED_KEY);
  } catch {
    /* nothing to clear */
  }
  try {
    await fetch(`${API_BASE}/auth/session-cookie`, { method: "DELETE", credentials: "include" });
  } catch {
    /* offline: the cookie expires with its token */
  }
}

/**
 * Navigate after sign-in. When the destination is on the API host (the CFD job
 * page), make sure the cookie for the CURRENT token is set first — /verify may
 * have swapped the token since sign-in.
 */
export async function goAfterSignIn(dest: string): Promise<void> {
  if (/^https?:\/\//.test(dest)) {
    let token: string | null = null;
    try {
      token = localStorage.getItem("cf_customer_token");
    } catch {
      /* storage blocked */
    }
    await syncSessionCookie(token, true);
  }
  window.location.href = dest;
}
