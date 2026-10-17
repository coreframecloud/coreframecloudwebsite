"use client";

import { clearReturnPath, peekReturnPath, rememberReturnPath, safeReturnPath } from "@/lib/return-path";
import { goAfterSignIn, signOutThisSession } from "@/lib/session-cookie";
import { useState, useEffect, useRef } from "react";
import {
  COUNTRIES,
  INDIA,
  INDIAN_MOBILE_HINT,
  fetchCountries,
  fetchIndianGstStates,
  fetchIpCountry,
  ipMismatchMessage,
  validateGstin,
  validatePhone,
  type Country,
  type GstState,
} from "@/lib/validation";
import { goToGoogleSignIn, readAttribution } from "@/lib/attribution";
import { markPendingSignup, trackSignupIfNew } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OtpInput } from "@/components/ui/otp-input";
// CheckCircle went with the password tab's "signed in" state.
import { Loader2, Mail, ArrowRight, Check, LogIn, UserPlus } from "lucide-react";
import { API_BASE } from "@/lib/api-base";

const API = API_BASE;

type Tab = "link" | "code";
type LinkStep = "email" | "details" | "sent";
type CodeStep = "email" | "code" | "done";

// ── Google icon ────────────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

// ── Shared field ───────────────────────────────────────────────────────────────
function Field({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    // content-start: in a two-column row the taller cell (help text) must not
    // stretch this grid, or the shorter cell's input slides down out of line.
    <div className="grid content-start gap-1.5">
      <label className="text-[13px] font-medium text-ink">{label}</label>
      {children}
    </div>
  );
}

function GoogleBlock({ api, below = false }: { api: string; below?: boolean }) {
  return (
    <>
      <div className={`flex items-center gap-3 ${below ? "my-5" : "mb-5"}`}>
        <div className="h-px flex-1 bg-rule" />
        <span className="text-xs text-ink-3">or</span>
        <div className="h-px flex-1 bg-rule" />
      </div>
      <a
        href={`${api}/auth/google`}
        onClick={(e) => goToGoogleSignIn(e, api)}
        className="flex min-h-11 w-full items-center justify-center gap-3 rounded-cf border border-rule-strong bg-paper py-3 text-sm font-medium text-ink shadow-[0_1px_2px_rgba(16,17,19,0.06)] transition hover:bg-paper-2"
      >
        <GoogleIcon />
        Continue with Google
      </a>
    </>
  );
}

/* The field style of the WhatsApp-code step (/verify), so the two screens read
   as one flow: 44px and 16px type on a phone (iOS zooms anything smaller),
   a quiet border, and a soft blue ring on focus instead of a hard outline.
   rule-strong, not rule: the borders stay as visible as the 11 Oct fix made
   them. No w-full in the shared part, so a select that needs a fixed width
   (the dial code) does not end up carrying two competing widths. */
const fieldBase =
  "h-11 min-w-0 rounded-cf border border-rule-strong bg-paper px-3 text-base text-ink outline-none transition placeholder:text-ink-3 focus:border-blue focus:ring-2 focus:ring-blue/20 focus-visible:border-blue focus-visible:ring-2 focus-visible:ring-blue/20 md:h-10 md:text-sm";
const inputCls = `${fieldBase} w-full`;
const selectCls = `${fieldBase} w-full cursor-pointer`;

// ── Card header ────────────────────────────────────────────────────────────────
// The same header the WhatsApp-code step (/verify) uses: a tinted round icon,
// a small eyebrow, the Poppins heading and one line under it, all inside the
// card and left-aligned, so sign-up and the step after it look like one flow.
function CardHeader({
  icon,
  eyebrow,
  title,
  sub,
  compact = false,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  sub?: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "mb-5" : "mb-6"}>
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-blue/10 text-blue">
        {icon}
      </div>
      <p className="cf-eyebrow mb-2">{eyebrow}</p>
      <h1 className="font-display text-[27px] leading-[1.14] tracking-[-0.01em] text-ink sm:text-[32px]">
        {title}
      </h1>
      {sub && <p className="mt-2 text-[15px] leading-6 break-words text-ink-2">{sub}</p>}
    </div>
  );
}

// ── Account-type choice ─────────────────────────────────────────────────────────
function TypeCard({
  active,
  onClick,
  title,
  sub,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  sub: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex items-start gap-3 rounded-cf border px-4 py-3 text-left transition outline-none focus-visible:ring-2 focus-visible:ring-blue/30 ${
        active
          ? "border-blue bg-blue/[0.06] ring-2 ring-blue/15"
          : "border-rule-strong bg-paper hover:border-ink/30"
      }`}
    >
      <span
        aria-hidden="true"
        className={`mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border transition ${
          active ? "border-blue bg-blue text-white" : "border-rule-strong bg-paper"
        }`}
      >
        {active && <Check className="h-3 w-3" strokeWidth={3} />}
      </span>
      <span>
        <span className="block text-sm font-medium text-ink">{title}</span>
        <span className="mt-0.5 block text-xs leading-5 text-ink-2">{sub}</span>
      </span>
    </button>
  );
}

// ── Tab button ─────────────────────────────────────────────────────────────────
function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-active={active}
      aria-pressed={active}
      className="cf-segment-item"
    >
      {children}
    </button>
  );
}

// ── Error box ──────────────────────────────────────────────────────────────────
function ErrorBox({ msg }: { msg: string }) {
  return (
    <p className="rounded-cf border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm break-words text-destructive">
      {msg}
    </p>
  );
}

// ── Success (sent) state ────────────────────────────────────────────────────────
function SentCard({
  email,
  label,
  certain = false,
  expiresMinutes = 15,
}: { email: string; label: string; certain?: boolean; expiresMinutes?: number }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue/10 text-blue">
        <Mail className="h-5 w-5" />
      </div>
      <div>
        <p className="font-semibold text-ink">Check your inbox.</p>
        {/* THE HEDGE IS GONE FROM THE CODE TAB, AND SO IS THE FOOTNOTE.
            Both existed because the route used to look an unknown address up,
            find nothing and answer as though it had sent something — so the
            page could not honestly say "we sent you a code", and an 11px grey
            line had to tell people to go and press a different button instead.
            One account holder sat waiting on an inbox that was never going to
            fill, which is how this was found.

            request-login-code now CREATES the account and then sends the code,
            so after the call the account exists either way and saying so
            plainly leaks nothing an attacker did not already get. The link tab
            keeps the hedge, because that route still behaves the old way. */}
        <p className="mt-2 text-[15px] leading-6 text-ink-2">
          {certain ? (
            <>
              A {label} is on its way to{" "}
              <span className="break-all text-ink">{email}</span>. It expires in{" "}
              {expiresMinutes} minutes.
            </>
          ) : (
            <>
              If an account exists for{" "}
              <span className="break-all text-ink">{email}</span>, a {label} is on its
              way. It expires in {expiresMinutes} minutes.
            </>
          )}
        </p>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
/**
 * `variant` is the only difference between /login and /signup. The auth
 * mechanics are identical — one magic link creates an account or signs one in —
 * but the two URLs meet different people. /login is for someone who already has
 * an account. /signup is where paid traffic lands, and telling a stranger to
 * "Sign in" to a brand they met ten seconds ago in an ad is how 161 landing
 * page views produced zero signups on 19 Sep 2026. Same form, honest headline.
 */
export default function LoginForm({
  variant = "signin",
  offer,
}: {
  variant?: "signin" | "start";
  /** One line under the headline, from the live rate card. It replaces the
   *  offer box that used to sit above the card and pushed the email field
   *  below the fold. */
  offer?: string;
}) {
  const isStart = variant === "start";
  // When opened from Coreframe Connect (?source=connect), default to "code" tab.
  // Magic-link emails open in the system browser and can't complete inside the app.
  const [tab, setTab] = useState<Tab>("link");
  const [error, setError] = useState("");

  // ALREADY SIGNED IN AND LOOKING AT A SIGN-IN FORM.
  //
  // Reported after pressing Back inside the verification flow: the page behind
  // /verify is /login, and /login had nothing to say about an existing session.
  // The header knew - it was showing the avatar and "Complete verification" -
  // while the card underneath asked them to sign in again. Both true, one
  // screen, and no way forward that was not confusing.
  //
  // NOT A SILENT REDIRECT. Someone may be here deliberately to use a different
  // account, and bouncing them away would make that impossible without finding
  // a sign-out first. A banner offers the way on AND the way to switch.
  const [signedInAs, setSignedInAs] = useState<string | null>(null);
  // Where "Continue" goes for someone already signed in who arrived with ?next=.
  const [signedInNext, setSignedInNext] = useState<string | null>(null);
  // A one-line note from where they came from: signed out everywhere, or a
  // Google sign-in we refused (security review 17 Oct 2026).
  const [arrivalNote, setArrivalNote] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("source") === "connect") setTab("code");
    if (params.get("signed_out") === "everywhere") {
      setArrivalNote("You're signed out on every device. Sign in again to continue.");
    } else if (params.get("error") === "google_unverified") {
      setArrivalNote(
        "Google hasn't verified that email address, so we can't sign you in with it. Use the email option below instead.",
      );
    }
    // A new account finishes on /auth/magic or /verify, not here, so the
    // `next` it was sent with is kept for those pages (lib/return-path.ts).
    rememberReturnPath(params.get("next"));
    try {
      if (localStorage.getItem("cf_customer_token")) {
        const raw = localStorage.getItem("cf_customer_user");
        const u = raw ? (JSON.parse(raw) as { email?: string }) : null;
        setSignedInAs(u?.email ?? "your account");
        setSignedInNext(safeReturnPath(params.get("next")));
        // THE CODE HAS ALREADY BEEN SPENT. Coming back here after a successful
        // sign-in - Back from /verify, or the bfcache restoring this page -
        // used to show the code step with the consumed digits still in the
        // box, and pressing Sign in answered "Invalid or expired code".
        // Correct, and a terrible thing to show somebody who just signed in
        // successfully. Wind the form back to the start; the banner above
        // tells them what actually happened.
        setCodeStep("email");
        setCodeValue("");
        setLinkStep("email");
        setError("");
      }
    } catch {
      // A corrupt or blocked localStorage is not a reason to fail the page;
      // the form below still works.
    }
    fetchCountries(API).then((list) => {
      setCountries(list);
      const india = list.find((c) => c.iso === "IN");
      if (india) {
        setPhoneCountry(india);
        setHomeCountry(india);
      }
    });
    fetchIndianGstStates(API).then(setGstStates);
    fetchIpCountry(API).then(setIpCountry);
  }, []);

  // Safari and Chrome restore this page from the back/forward cache without
  // re-running effects, so the check above never fires on the exact navigation
  // that needed it - Back out of /verify. pageshow does.
  useEffect(() => {
    const onShow = (e: PageTransitionEvent) => {
      if (!e.persisted) return;
      try {
        if (localStorage.getItem("cf_customer_token")) window.location.reload();
      } catch {
        // storage blocked; nothing to restore from
      }
    };
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, []);

  // ── Email Link state ────────────────────────────────────────────────────────
  const [linkStep, setLinkStep] = useState<LinkStep>("email");
  const [linkEmail, setLinkEmail] = useState("");
  const [linkIsNew, setLinkIsNew] = useState(false);
  const [linkName, setLinkName] = useState("");
  const [linkOrg, setLinkOrg] = useState("");
  const [linkPhone, setLinkPhone] = useState("");
  // Country list comes from the API so the picker and the server's validator
  // are one table; COUNTRIES is the offline fallback.
  const [countries, setCountries] = useState<Country[]>(COUNTRIES);
  const [phoneCountry, setPhoneCountry] = useState<Country>(INDIA);
  // Where the customer is. Mandatory (owner, 10 Oct 2026): it decides the tax
  // on every invoice — an Indian state sets the place of supply, anywhere else
  // is a foreign customer charged IGST — so it is asked once here rather than
  // guessed later. India requires the GST state too.
  const [homeCountry, setHomeCountry] = useState<Country>(INDIA);
  const [homeState, setHomeState] = useState("");
  const [gstStates, setGstStates] = useState<GstState[]>([]);
  // Individual vs registered business. A business gives its GSTIN so its
  // invoices carry it and the place of supply is right; nothing else differs.
  const [linkAccountType, setLinkAccountType] = useState<"b2c" | "b2b">("b2c");
  const [linkGstin, setLinkGstin] = useState("");
  // Cloudflare's country for this connection. India chosen from elsewhere gets
  // one "Are you in India?" step (owner, 16 Oct 2026); never a block.
  const [ipCountry, setIpCountry] = useState<string | null>(null);
  const [askIndia, setAskIndia] = useState(false);
  // A ref, not state: the "Yes" button sets it and submits in the same click.
  const indiaConfirmed = useRef(false);
  const [linkLoading, setLinkLoading] = useState(false);

  // ── Email Code state ────────────────────────────────────────────────────────
  const [codeStep, setCodeStep] = useState<CodeStep>("email");
  const [codeEmail, setCodeEmail] = useState("");
  const [codeValue, setCodeValue] = useState("");
  const [codeLoading, setCodeLoading] = useState(false);


  function storeAndRedirect(data: { access_token: string; user: unknown }) {
    localStorage.setItem("cf_customer_token", data.access_token);
    localStorage.setItem("cf_customer_user", JSON.stringify(data.user));
    const params = new URLSearchParams(window.location.search);
    const next = safeReturnPath(params.get("next")) ?? peekReturnPath();

    // pending_approval now means only that email or mobile is unconfirmed —
    // /verify asks for exactly the step that is left (usually the WhatsApp
    // code) and then sends them on: to `next` when there is one (kept in
    // lib/return-path.ts), otherwise to add funds.
    const user = data.user as { status?: string } | null;
    if (user?.status === "pending_approval") {
      rememberReturnPath(next);
      window.location.href = "/verify";
      return;
    }

    // Relative paths, or the API's CFD job page (lib/return-path.ts) — no open redirect.
    clearReturnPath();
    void goAfterSignIn(next ?? "/my-activity");
  }

  function switchTab(t: Tab) {
    // CARRY THE ADDRESS ACROSS. linkEmail and codeEmail are separate states
    // because the two flows post different payloads, but that is an internal
    // detail — to the customer this is one email box, and it was emptying
    // itself every time they changed their mind about how to sign in. On a
    // phone that is the whole address typed again.
    //
    // Only fills an EMPTY destination: somebody who has already typed
    // something in the tab they are moving to meant to type it.
    if (t === "code" && !codeEmail.trim() && linkEmail.trim()) {
      setCodeEmail(linkEmail.trim());
    }
    if (t === "link" && !linkEmail.trim() && codeEmail.trim()) {
      setLinkEmail(codeEmail.trim());
    }
    setTab(t);
    setError("");
  }

  // ── Email Link handlers ─────────────────────────────────────────────────────

  async function handleLinkEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!linkEmail.trim()) return setError("Enter your email address.");
    setLinkLoading(true);
    try {
      const res = await fetch(`${API}/auth/request-magic-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: linkEmail.trim() }),
      });
      const data = await res.json();
      if (res.status === 422 && data.detail?.includes("full_name")) {
        // Server says new user — need details
        setLinkIsNew(true);
        setLinkStep("details");
        return;
      }
      if (!res.ok) throw new Error(data.detail ?? `Error ${res.status}`);
      setLinkStep("sent");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLinkLoading(false);
    }
  }

  async function handleLinkDetailsSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!linkName.trim()) return setError("Full name is required.");

    // Length rules per country, and India's mobile-prefix rule, live in
    // lib/validation.ts alongside the server's copy — so "10 digits" is not
    // hardcoded here and wrong the moment someone signs up from Dubai.
    if (!homeCountry) return setError("Select your country.");
    if (homeCountry.iso === "IN" && !homeState) {
      return setError("Select your state. It sets the GST on your invoices.");
    }
    const phoneCheck = validatePhone(linkPhone, phoneCountry);
    if (!phoneCheck.ok) return setError(phoneCheck.error);
    if (homeCountry.iso === "IN" && phoneCountry.dial_code !== "91") {
      return setError(INDIAN_MOBILE_HINT);
    }
    if (homeCountry.iso === "IN" && ipCountry && ipCountry !== "IN" && !indiaConfirmed.current) {
      setAskIndia(true);
      return;
    }
    setAskIndia(false);

    // A business is an entity on an invoice; its registered name is not
    // optional. For an individual the studio name stays a nicety.
    if (linkAccountType === "b2b" && !linkOrg.trim()) {
      return setError("Registered business name is required.");
    }
    if (linkAccountType === "b2b") {
      const gstinCheck = validateGstin(linkGstin);
      if (!gstinCheck.ok) return setError(gstinCheck.error);
    }
    setLinkLoading(true);
    try {
      const res = await fetch(`${API}/auth/request-magic-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: linkEmail.trim(),
          full_name: linkName.trim(),
          org_name: linkOrg.trim() || linkName.trim(),
          phone: (validatePhone(linkPhone, phoneCountry) as { value: string }).value,
          phone_country_code: phoneCountry.dial_code,
          customer_type: linkAccountType,
          // ISO-3166 alpha-2, and the GST state code for India only.
          country_code: homeCountry.iso,
          state_code: homeCountry.iso === "IN" ? homeState : undefined,
          gstin: linkAccountType === "b2b" ? linkGstin.trim().toUpperCase() : undefined,
          // Where they came from, captured on their first landing and frozen
          // since. Sent only on the call that CREATES the account — resending
          // it on every sign-in would let a later visit overwrite the record
          // of how they were introduced. undefined when there is nothing,
          // which is different from empty: the server can then tell "we
          // looked and found none" from "this client never looked".
          attribution: readAttribution() ?? undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail ?? `Error ${res.status}`);
      // NOT a conversion yet: no account exists until the link is redeemed.
      // This only lets /auth/magic recognise that redemption as a new signup.
      markPendingSignup(linkEmail);
      setLinkStep("sent");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLinkLoading(false);
    }
  }

  // ── Email Code handlers ─────────────────────────────────────────────────────

  async function handleCodeEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!codeEmail.trim()) return setError("Enter your email address.");
    setCodeLoading(true);
    try {
      const res = await fetch(`${API}/auth/request-login-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // This call CREATES the account for an unknown address, so it is a
        // sign-up door too and carries the same first-touch record. The API
        // ignores it for an existing account.
        body: JSON.stringify({
          email: codeEmail.trim(),
          attribution: readAttribution() ?? undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail ?? `Error ${res.status}`);
      }
      setCodeStep("code");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setCodeLoading(false);
    }
  }

  async function handleCodeVerify(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!/^\d{6}$/.test(codeValue.trim())) return setError("Enter the 6-digit code from your email.");
    setCodeLoading(true);
    try {
      const res = await fetch(`${API}/auth/verify-login-code`, {
        method: "POST",
        // So the browser KEEPS the HttpOnly cf_session cookie this sets on
        // control: the CFD job page there signs in with nothing else.
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: codeEmail.trim(), code: codeValue.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail ?? `Error ${res.status}`);
      trackSignupIfNew(data, "email_code");
      storeAndRedirect(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid or expired code.");
    } finally {
      setCodeLoading(false);
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="w-full max-w-lg">
      {/* Already signed in — say so, and offer both ways out. */}
      {signedInAs && (
        <div className="mb-4 rounded-cf border border-blue/25 bg-blue/10 p-5">
          <p className="text-sm text-ink">
            You are already signed in as{" "}
            <span className="font-semibold text-ink">{signedInAs}</span>.
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <a
              href={signedInNext ?? "/verify"}
              onClick={(e) => {
                // Back to the CFD job page that sent them: set the cookie for
                // this session first (lib/session-cookie.ts), then go.
                if (signedInNext && /^https?:\/\//.test(signedInNext)) {
                  e.preventDefault();
                  void goAfterSignIn(signedInNext);
                }
              }}
              className="flex h-11 w-full items-center justify-center rounded-cf bg-blue px-3 text-center text-sm font-semibold text-white transition hover:bg-blue"
            >
              Continue where you left off
            </a>
            <button
              type="button"
              onClick={() => {
                let leaving: string | null = null;
                try {
                  leaving = localStorage.getItem("cf_customer_token");
                } catch {
                  /* storage blocked */
                }
                void signOutThisSession(leaving);
                try {
                  localStorage.removeItem("cf_customer_token");
                  localStorage.removeItem("cf_customer_user");
                } catch {
                  // Nothing to clear, or storage is blocked. The form below
                  // still works and a fresh sign-in overwrites either way.
                }
                setSignedInAs(null);
              }}
              className="flex h-11 w-full items-center justify-center rounded-cf border border-rule-strong bg-transparent px-3 text-center text-sm font-semibold text-ink transition hover:border-blue/50 hover:bg-paper-2"
            >
              Use a different account
            </button>
          </div>
        </div>
      )}

      {/* Card. Same shell, padding and header as the WhatsApp-code step.
          Every pixel above the email field is a pixel someone has to scroll
          past, so the header stays compact: the field still sits well inside
          the first screen on a 390x844 phone. No wordmark: the site header
          renders one just above. */}
      {arrivalNote && (
        <p role="status" className="mb-4 w-full text-[14px] leading-6 text-ink-2">
          {arrivalNote}
        </p>
      )}

      <div className="cf-glass w-full p-5 sm:p-7 md:p-8">
        <CardHeader
          compact={isStart}
          icon={isStart ? <UserPlus className="h-5 w-5" /> : <LogIn className="h-5 w-5" />}
          eyebrow={isStart ? "Sign up" : "Your account"}
          title={isStart ? "Create your account" : "Sign in"}
          sub={
            isStart
              ? offer ?? "Enter your email and we\u2019ll send you a link."
              : "New here? Just enter your email and we\u2019ll handle the rest."
          }
        />

        {/* Google, and where it sits.
            On /login it leads, because a returning customer who used Google
            wants one tap. On /signup it follows the email field: paid traffic
            arrives to do one thing, and the fastest path to zero signups is
            making them scroll past an alternative to find the primary control. */}
        {!isStart && (
          <>
            <a
              href={`${API}/auth/google`}
              onClick={(e) => goToGoogleSignIn(e, API)}
              className="flex min-h-11 w-full items-center justify-center gap-3 rounded-cf border border-rule bg-paper py-3 text-sm font-medium text-ink transition hover:bg-paper-2"
            >
              <GoogleIcon />
              Continue with Google
            </a>
            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-rule" />
              <span className="text-xs text-ink-3">or</span>
              <div className="h-px flex-1 bg-rule" />
            </div>
          </>
        )}

        {/* Tab switcher.
            Only the email link can CREATE an account — the 6-digit code path
            signs in an existing one and silently does nothing for an address it
            has never seen, which is exactly how a new customer gets stuck on a
            screen saying a code was sent. So the code tab is offered only to
            people who already have an account.

            Password sign-in is gone entirely. Nothing issues a customer
            password, so the tab could only ever fail; keeping it also meant
            keeping a password surface to attack for no benefit. */}
        {!isStart && <div className="cf-segment mb-5 flex gap-1 p-1">
          <TabBtn active={tab === "link"} onClick={() => switchTab("link")}>
            Email me a link
          </TabBtn>
          <TabBtn active={tab === "code"} onClick={() => switchTab("code")}>
            Email me a code
          </TabBtn>
        </div>}

        {/* ── EMAIL LINK TAB ────────────────────────────────────────────── */}
        {tab === "link" && (
          <div className="grid gap-4">
            {linkStep === "email" && (
              <form onSubmit={handleLinkEmailSubmit} className="grid gap-4">
                <Field label="Email address">
                  <Input
                    type="email"
                    value={linkEmail}
                    onChange={(e) => { setLinkEmail(e.target.value); setError(""); }}
                    className={inputCls}
                    placeholder="you@studio.com"
                    autoComplete="email"
                    autoFocus
                    required
                  />
                </Field>
                {error && <ErrorBox msg={error} />}
                {isStart ? (
                  <p className="-mt-1 text-xs leading-5 text-ink-2">
                    No password needed. We&apos;ll email you a link, and your account is ready once you click it.
                  </p>
                ) : (
                  <div className="cf-glass-inset px-4 py-3">
                    <p className="text-sm font-medium text-ink">Sign in with a link.</p>
                    <p className="mt-0.5 text-xs text-ink-2">
                      We&apos;ll email you a sign-in link. Click it and you&apos;re in.
                    </p>
                  </div>
                )}
                <Button type="submit" disabled={linkLoading} className="cf-btn-primary min-h-11 w-full disabled:opacity-60">
                  {linkLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {linkLoading ? "Checking…" : isStart ? "Create my account" : "Send sign-in link"}
                </Button>
              </form>
            )}

            {linkStep === "details" && (
              <form onSubmit={handleLinkDetailsSubmit} className="grid gap-4">
                <div className="cf-glass-inset border-l-2 border-l-blue px-4 py-3 text-sm leading-6 text-ink-2">
                  No account found for <strong className="break-all font-medium text-ink">{linkEmail}</strong>. Fill in your details below and we&apos;ll create one.
                </div>

                <Field label="What kind of account is this?">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <TypeCard
                      active={linkAccountType === "b2c"}
                      onClick={() => { setLinkAccountType("b2c"); setError(""); }}
                      title="Individual"
                      sub="Freelancer or personal use"
                    />
                    <TypeCard
                      active={linkAccountType === "b2b"}
                      onClick={() => { setLinkAccountType("b2b"); setError(""); }}
                      title="Business"
                      sub="GST-registered, needs invoices"
                    />
                  </div>
                </Field>

                {linkAccountType === "b2b" && (
                  <Field label="GSTIN">
                    <Input
                      value={linkGstin}
                      onChange={(e) => { setLinkGstin(e.target.value.toUpperCase()); setError(""); }}
                      className={`${inputCls} font-mono tracking-wide`}
                      placeholder="29AAICP2912R1ZR"
                      maxLength={15}
                      required
                    />
                    <p className="mt-0.5 text-xs leading-5 text-ink-3">
                      We check this against the GST register. It has to be active, and
                      we read the registered name back from it. It also sets your place
                      of supply on every invoice.
                    </p>
                  </Field>
                )}
                <div className="grid gap-4 sm:grid-cols-2 sm:gap-3">
                  <Field label="Full name">
                    <Input value={linkName} onChange={(e) => { setLinkName(e.target.value); setError(""); }} className={inputCls} placeholder="Rahul Sharma" required />
                    <p className="mt-0.5 text-xs leading-5 text-ink-3">
                      Printed on your invoices.
                    </p>
                  </Field>
                  <Field label={linkAccountType === "b2b"
                    ? "Registered business name"
                    : <>Studio name <span className="text-ink-3">(optional)</span></>}>
                    <Input
                      value={linkOrg}
                      onChange={(e) => { setLinkOrg(e.target.value); setError(""); }}
                      className={inputCls}
                      placeholder={linkAccountType === "b2b" ? "Acme Design Pvt Ltd" : "Acme Studio"}
                      required={linkAccountType === "b2b"}
                    />
                    {linkAccountType === "b2b" && (
                      <p className="mt-0.5 text-xs leading-5 text-ink-3">
                        Exactly as it appears on your GST certificate. We match it
                        against the registered name on the GST register.
                      </p>
                    )}
                  </Field>
                </div>
                {/* Required, not optional. Indian law (CERT-In Direction
                    20(3)/2022) makes us hold a validated contact number for
                    anyone renting compute, so the number gets a one-time code
                    over WhatsApp after the email link. Any country: paid-first
                    onboarding (10 Oct 2026) is open to international
                    customers. */}
                <div className={`grid gap-4 ${homeCountry.iso === "IN" ? "sm:grid-cols-2 sm:gap-3" : ""}`}>
                  <Field label="Country">
                    <select
                      value={homeCountry.iso}
                      onChange={(e) => {
                        const next = countries.find((c) => c.iso === e.target.value);
                        if (next) {
                          setHomeCountry(next);
                          // The phone code follows the country; it can still
                          // be changed on its own for a number from elsewhere.
                          setPhoneCountry(next);
                        }
                        setAskIndia(false);
                        setError("");
                      }}
                      className={selectCls}
                      aria-label="Country"
                      required
                    >
                      {countries.map((c) => (
                        <option key={c.iso} value={c.iso} className="bg-paper text-ink">
                          {c.country}
                        </option>
                      ))}
                    </select>
                  </Field>
                  {homeCountry.iso === "IN" && (
                    <Field label="State">
                      <select
                        value={homeState}
                        onChange={(e) => { setHomeState(e.target.value); setError(""); }}
                        className={selectCls}
                        aria-label="State"
                        required
                      >
                        <option value="" className="bg-paper text-ink">Select your state</option>
                        {gstStates.map((st) => (
                          <option key={st.code} value={st.code} className="bg-paper text-ink">
                            {st.name}
                          </option>
                        ))}
                      </select>
                    </Field>
                  )}
                </div>
                <Field label="Mobile number">
                  <div className="flex gap-2">
                    <select
                      value={phoneCountry.iso}
                      onChange={(e) => {
                        const next = countries.find((c) => c.iso === e.target.value);
                        if (next) setPhoneCountry(next);
                        setError("");
                      }}
                      className={`${fieldBase} w-[112px] shrink-0 cursor-pointer sm:w-36`}
                      aria-label="Country dialling code"
                    >
                      {countries.map((c) => (
                        // The option still carries its own colours. Chrome on
                        // Windows paints the native dropdown with the system
                        // background, so an <option> that inherits whatever the
                        // select was given can end up invisible - it used to be
                        // white on white. Paper and ink, stated explicitly.
                        <option
                          key={c.iso}
                          value={c.iso}
                          className="bg-paper text-ink"
                        >
                          +{c.dial_code} {c.country}
                        </option>
                      ))}
                    </select>
                    <Input
                      type="tel"
                      inputMode="numeric"
                      value={linkPhone}
                      onChange={(e) => { setLinkPhone(e.target.value); setError(""); }}
                      className={inputCls}
                      placeholder={phoneCountry.dial_code === "91" ? "98765 43210" : "national number"}
                      autoComplete="tel-national"
                      required
                    />
                  </div>
                  <p className="mt-0.5 text-xs leading-5 text-ink-3">
                    We&apos;ll send a code on WhatsApp, because Indian regulations
                    require us to hold a verified contact number for compute rental.
                    {homeCountry.iso === "IN" && <> {INDIAN_MOBILE_HINT}</>}
                  </p>
                </Field>
                {askIndia && ipCountry && (
                  <div className="grid gap-3 rounded-cf border border-rule px-4 py-3">
                    <p className="text-sm leading-6 text-ink">{ipMismatchMessage(ipCountry)}</p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="submit"
                        className="cf-btn-primary min-h-11"
                        onClick={() => { indiaConfirmed.current = true; }}
                      >
                        Yes, I&apos;m in India
                      </Button>
                      <button
                        type="button"
                        className="inline-flex min-h-11 items-center text-[13px] text-ink-2 hover:text-ink"
                        onClick={() => { setAskIndia(false); setError("Choose the country you're in."); }}
                      >
                        No, change my country
                      </button>
                    </div>
                  </div>
                )}
                {error && <ErrorBox msg={error} />}
                <Button type="submit" disabled={linkLoading} className="cf-btn-primary min-h-11 w-full disabled:opacity-60">
                  {linkLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
                  {linkLoading ? "Creating account…" : "Create account & send link"}
                </Button>
                <button type="button" onClick={() => { setLinkStep("email"); setError(""); }} className="inline-flex min-h-11 items-center self-start text-[13px] text-ink-3 hover:text-ink-2">
                  ← Use a different email
                </button>
              </form>
            )}

            {linkStep === "sent" && (
              <div className="grid gap-4">
                <SentCard email={linkEmail} label="sign-in link" />
                <button
                  type="button"
                  onClick={() => { setLinkStep("email"); setLinkIsNew(false); setError(""); }}
                  className="inline-flex min-h-11 items-center self-start text-[13px] text-ink-3 hover:text-ink-2"
                >
                  ← Use a different email
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── EMAIL CODE TAB ────────────────────────────────────────────── */}
        {tab === "code" && (
          <div className="grid gap-4">
            {codeStep === "email" && (
              <form onSubmit={handleCodeEmailSubmit} className="grid gap-4">
                <Field label="Email address">
                  <Input
                    type="email"
                    value={codeEmail}
                    onChange={(e) => { setCodeEmail(e.target.value); setError(""); }}
                    className={inputCls}
                    placeholder="you@studio.com"
                    autoComplete="email"
                    autoFocus
                    required
                  />
                </Field>
                {error && <ErrorBox msg={error} />}
                <Button type="submit" disabled={codeLoading} className="cf-btn-primary min-h-11 w-full disabled:opacity-60">
                  {codeLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {codeLoading ? "Sending…" : "Send 6-digit code"}
                </Button>
                <p className="text-center text-xs text-ink-3">
                  Codes only work for accounts that already exist. New here? Use{" "}
                  <b className="text-ink-2">Email me a link</b>.
                </p>
              </form>
            )}

            {codeStep === "code" && (
              <form onSubmit={handleCodeVerify} className="grid gap-4">
                {/* 10, not 15: OTP_EXPIRY_MINUTES is 10 on the server and this
                    said 15, which is its own small lie to anyone who waited. */}
                <SentCard email={codeEmail} label="6-digit code" certain expiresMinutes={10} />
                <Field label="Verification code">
                  <OtpInput
                    value={codeValue}
                    onChange={(v) => { setCodeValue(v); setError(""); }}
                    autoFocus
                  />
                </Field>
                {error && <ErrorBox msg={error} />}
                <Button type="submit" disabled={codeLoading || codeValue.length < 6} className="cf-btn-primary min-h-11 w-full disabled:opacity-60">
                  {codeLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {codeLoading ? "Verifying…" : "Sign in"}
                </Button>
                <button type="button" onClick={() => { setCodeStep("email"); setCodeValue(""); setError(""); }} className="inline-flex min-h-11 items-center self-start text-[13px] text-ink-3 hover:text-ink-2">
                  ← Use a different email
                </button>
              </form>
            )}
          </div>
        )}

        {isStart && <GoogleBlock api={API} below />}

        {/* The password tab was removed here.

            Nothing in the product ever issued a customer password: accounts are
            created by magic link and signed in by link or 6-digit code. The tab
            could therefore only ever fail, while still presenting a password
            field to credential-stuffing traffic. Deleting it removes an attack
            surface that protected nothing.

            `handlePasswordSubmit` and the /auth/login call it used are gone with
            it. The admin panel has its own password login and is unaffected. */}

      </div>

      {/* Footer */}
      <p className="mt-6 text-center text-xs leading-6 text-ink-3">
        {isStart ? "By creating an account, you agree to our" : "By signing in, you agree to our"}{" "}
        <a href="/terms-of-service" className="text-blue hover:underline">Terms and Conditions</a>,{" "}
        <a href="/privacy-policy" className="text-blue hover:underline">Privacy Policy</a>, and{" "}
        <a href="/refunds" className="text-blue hover:underline">Refunds and chargebacks</a>.
      </p>
    </div>
  );
}
