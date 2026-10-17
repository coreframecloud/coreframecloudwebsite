/**
 * The signed-in session on www is a COOKIE, not a token (security review 17 Oct 2026).
 *
 * Before: every sign-in put a 24-hour bearer token in localStorage
 * ("cf_customer_token"), readable by every script on every page - the tag
 * manager, Clarity, the Meta pixel, any injected script.
 *
 * Now: the API sets two HttpOnly cookies on control.coreframecloud.com - a
 * 15-minute access cookie and a rotating refresh cookie - and the JSON it
 * returns carries no token. Pages call the API with `credentials: "include"`
 * (apiFetch below); on a 401 the access cookie is renewed once from the
 * refresh cookie (POST /auth/session/refresh) and the call is retried.
 *
 * What stays in localStorage is "cf_customer_user": the account's name,
 * email and status, so the header can render before the network answers. It
 * is not a credential: knowing it opens nothing.
 */
import { API_BASE } from "@/lib/api-base";

const USER_KEY = "cf_customer_user";
const LEGACY_TOKEN_KEY = "cf_customer_token";

/**
 * Sent on sign-in and adopt calls: "give this browser a cookie session, and no
 * token in the JSON". The API still answers the previous site (which does not
 * send it) with a bearer, so the API could be deployed before this site.
 */
export const SESSION_MODE_HEADERS: Record<string, string> = { "X-Coreframe-Session": "cookie" };

/** Stands in for "a token" where code only needs to know someone is signed in. */
export const COOKIE_SESSION = "cookie";

export type CachedUser = Record<string, unknown> & {
  id?: number;
  email?: string;
  full_name?: string;
  status?: string;
  role?: string;
  customer_type?: string;
};

export function cachedUser(): CachedUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as CachedUser) : null;
  } catch {
    return null;
  }
}

export function rememberUser(user: unknown): void {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    /* storage blocked: the header just renders after the network */
  }
}

/** Signed in, as far as this browser knows (the API has the final word). */
export function isSignedIn(): boolean {
  return cachedUser() !== null;
}

/** COOKIE_SESSION when signed in, else null: for code that used to read the token. */
export function sessionMarker(): string | null {
  return isSignedIn() ? COOKIE_SESSION : null;
}

let adopting: Promise<void> | null = null;

/**
 * A tab signed in before this change still holds the old bearer. Swap it for
 * a cookie session once (the API's adopt; it never extends the session) and
 * delete it, so nobody is signed out by the change.
 */
export function adoptLegacyToken(): Promise<void> {
  if (adopting) return adopting;
  adopting = (async () => {
    let old: string | null = null;
    try {
      old = localStorage.getItem(LEGACY_TOKEN_KEY);
    } catch {
      return;
    }
    if (!old) return;
    try {
      await fetch(`${API_BASE}/auth/session-cookie`, {
        method: "POST",
        credentials: "include",
        headers: { Authorization: `Bearer ${old}`, ...SESSION_MODE_HEADERS },
      });
    } catch {
      /* offline: the next page load tries again */
      adopting = null;
      return;
    }
    try {
      localStorage.removeItem(LEGACY_TOKEN_KEY);
    } catch {
      /* nothing to remove */
    }
  })();
  return adopting;
}

let renewing: Promise<boolean> | null = null;

/** Renew the 15-minute access cookie from the refresh cookie. One at a time. */
export function renewSession(): Promise<boolean> {
  if (!renewing) {
    renewing = fetch(`${API_BASE}/auth/session/refresh`, { method: "POST", credentials: "include" })
      .then((r) => r.ok)
      .catch(() => false)
      .finally(() => {
        setTimeout(() => {
          renewing = null;
        }, 0);
      });
  }
  return renewing;
}

/**
 * fetch() for the Coreframe API with the session cookie. A 401 renews the
 * access cookie once and retries; a second 401 is returned to the caller,
 * which treats it as signed out.
 */
export async function apiFetch(input: string, init: RequestInit = {}): Promise<Response> {
  await adoptLegacyToken();
  const opts: RequestInit = { ...init, credentials: "include" };
  const res = await fetch(input, opts);
  if (res.status !== 401) return res;
  if (!(await renewSession())) return res;
  return fetch(input, opts);
}

/** Forget the signed-in customer in this browser (after a sign-out). */
export function forgetLocalSession(): void {
  try {
    localStorage.removeItem(LEGACY_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {
    /* storage blocked */
  }
}
