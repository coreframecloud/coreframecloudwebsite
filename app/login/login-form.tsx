"use client";

import { useState, useEffect } from "react";
import {
  COUNTRIES,
  fetchCountries,
  validateGstin,
  validatePhone,
  type Country,
} from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// CheckCircle went with the password tab's "signed in" state.
import { Loader2, Mail, ArrowRight } from "lucide-react";

const API = "https://control.coreframecloud.com/api";

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
    <div className="grid gap-1.5">
      <label className="text-xs text-slate-400">{label}</label>
      {children}
    </div>
  );
}

const inputCls =
  "h-12 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:border-cyan-400/50 focus:ring-0";

// ── Tab button ─────────────────────────────────────────────────────────────────
function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-white/10 text-white shadow-inner"
          : "text-slate-400 hover:text-slate-200"
      }`}
    >
      {children}
    </button>
  );
}

// ── Error box ──────────────────────────────────────────────────────────────────
function ErrorBox({ msg }: { msg: string }) {
  return (
    <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
      {msg}
    </p>
  );
}

// ── Success (sent) state ────────────────────────────────────────────────────────
function SentCard({
  email,
  label,
  showCreateHint = false,
}: { email: string; label: string; showCreateHint?: boolean }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cyan-400/10 text-cyan-300">
        <Mail className="h-5 w-5" />
      </div>
      <div>
        <p className="font-semibold text-white">Check your inbox</p>
        {/* The API answers identically whether or not the account exists, so
            that an attacker cannot use this form to discover which emails are
            registered. The copy has to match that — claiming "we sent you a
            code" is a lie for an address that has never signed up, and it sent
            people hunting through spam folders for an email that was never
            generated. */}
        <p className="mt-1 text-sm text-slate-400">
          If an account exists for <span className="text-white">{email}</span>, a {label} is on
          its way. It expires in 15 minutes.
        </p>
        {/* Only on the code tab. Shown on the link tab it pointed people at
            the tab they were already using. */}
        {showCreateHint && (
          <p className="mt-2 text-xs text-slate-500">
            Nothing arrived? You may not have an account yet — use{" "}
            <b className="text-slate-300">Email me a link</b> above to create one.
          </p>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
export default function LoginForm() {
  // When opened from Coreframe Connect (?source=connect), default to "code" tab.
  // Magic-link emails open in the system browser and can't complete inside the app.
  const [tab, setTab] = useState<Tab>("link");
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("source") === "connect") setTab("code");
    fetchCountries(API).then((list) => {
      setCountries(list);
      const india = list.find((c) => c.dial_code === "91");
      if (india) setPhoneCountry(india);
    });
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
  const [phoneCountry, setPhoneCountry] = useState<Country>(COUNTRIES[0]);
  // Individual vs registered business. A business additionally verifies its
  // GSTIN — the signatory's DigiLocker proves the person, the GSTIN proves the
  // entity. Neither substitutes for the other.
  const [linkAccountType, setLinkAccountType] = useState<"b2c" | "b2b">("b2c");
  const [linkGstin, setLinkGstin] = useState("");
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
    const next = params.get("next");

    // An account still awaiting approval almost always needs to finish identity
    // verification — send them straight there rather than to an account page
    // that can only tell them they cannot do anything yet.
    const user = data.user as { status?: string } | null;
    if (user?.status === "pending_approval" && !next) {
      window.location.href = "/verify";
      return;
    }

    // Only allow relative paths (no open redirect)
    window.location.href = next && next.startsWith("/") ? next : "/my-activity";
  }

  function switchTab(t: Tab) {
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
    const phoneCheck = validatePhone(linkPhone, phoneCountry);
    if (!phoneCheck.ok) return setError(phoneCheck.error);

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
          gstin: linkAccountType === "b2b" ? linkGstin.trim().toUpperCase() : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail ?? `Error ${res.status}`);
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
        body: JSON.stringify({ email: codeEmail.trim() }),
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: codeEmail.trim(), code: codeValue.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail ?? `Error ${res.status}`);
      storeAndRedirect(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid or expired code.");
    } finally {
      setCodeLoading(false);
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="w-full max-w-[440px]">
      {/* Logo */}
      <div className="mb-8 text-center">
        <a href="/" className="inline-block text-2xl font-extrabold tracking-tight">
          <span className="text-white">CORE</span>
          <span className="text-cyan-400">FRAME</span>
        </a>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white">Sign in</h1>
        <p className="mt-1 text-sm text-slate-400">New here? Just enter your email — we'll handle the rest.</p>
      </div>

      {/* Card */}
      <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">

        {/* Google button */}
        <a
          href={`${API}/auth/google`}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/12 bg-white/6 py-3 text-sm font-medium text-white transition hover:bg-white/10"
        >
          <GoogleIcon />
          Continue with Google
        </a>

        {/* Divider */}
        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-xs text-slate-500">or</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        {/* Tab switcher.
            Only the email link can CREATE an account — the 6-digit code path
            signs in an existing one and silently does nothing for an address it
            has never seen, which is exactly how a new customer gets stuck on a
            screen saying a code was sent. So the code tab is offered only to
            people who already have an account.

            Password sign-in is gone entirely. Nothing issues a customer
            password, so the tab could only ever fail; keeping it also meant
            keeping a password surface to attack for no benefit. */}
        <div className="mb-5 flex gap-1 rounded-xl bg-white/5 p-1">
          <TabBtn active={tab === "link"} onClick={() => switchTab("link")}>
            Email me a link
          </TabBtn>
          <TabBtn active={tab === "code"} onClick={() => switchTab("code")}>
            Email me a code
          </TabBtn>
        </div>

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
                <div className="rounded-xl border border-white/8 bg-white/4 px-4 py-3">
                  <p className="text-sm font-medium text-slate-200">Sign in with a link</p>
                  <p className="mt-0.5 text-xs text-slate-400">We'll send a secure sign-in link to your email. Click it to sign in instantly.</p>
                </div>
                <Button type="submit" disabled={linkLoading} className="h-12 rounded-xl text-base font-semibold">
                  {linkLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {linkLoading ? "Checking…" : "Send sign-in link"}
                </Button>
              </form>
            )}

            {linkStep === "details" && (
              <form onSubmit={handleLinkDetailsSubmit} className="grid gap-4">
                <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/8 px-4 py-3 text-xs text-cyan-300">
                  No account found for <strong>{linkEmail}</strong> — fill in your details below to create one.
                </div>

                <Field label="What kind of account is this?">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => { setLinkAccountType("b2c"); setError(""); }}
                      className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                        linkAccountType === "b2c"
                          ? "border-cyan-400/50 bg-cyan-400/10"
                          : "border-white/10 bg-white/5 hover:border-white/20"
                      }`}
                    >
                      <span className="block text-sm font-medium text-white">Individual</span>
                      <span className="mt-0.5 block text-xs text-slate-400">
                        Freelancer or personal use
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setLinkAccountType("b2b"); setError(""); }}
                      className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                        linkAccountType === "b2b"
                          ? "border-cyan-400/50 bg-cyan-400/10"
                          : "border-white/10 bg-white/5 hover:border-white/20"
                      }`}
                    >
                      <span className="block text-sm font-medium text-white">Business</span>
                      <span className="mt-0.5 block text-xs text-slate-400">
                        GST-registered, needs invoices
                      </span>
                    </button>
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
                    <p className="mt-1 text-xs text-slate-500">
                      We verify this against the GST register. It also sets your place of
                      supply for invoices.
                    </p>
                  </Field>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Full name">
                    <Input value={linkName} onChange={(e) => { setLinkName(e.target.value); setError(""); }} className={inputCls} placeholder="Rahul Sharma" required />
                  </Field>
                  <Field label={linkAccountType === "b2b"
                    ? "Registered business name"
                    : <>Studio name <span className="text-slate-600">(optional)</span></>}>
                    <Input
                      value={linkOrg}
                      onChange={(e) => { setLinkOrg(e.target.value); setError(""); }}
                      className={inputCls}
                      placeholder={linkAccountType === "b2b" ? "Acme Design Pvt Ltd" : "Acme Studio"}
                      required={linkAccountType === "b2b"}
                    />
                  </Field>
                </div>
                {/* Required, not optional. Indian law (CERT-In Direction
                    20(3)/2022) makes us hold a validated contact number for
                    anyone renting compute, and the verification step needs one.
                    Asking here is one field; asking later means bouncing someone
                    out of verification to go and add it. */}
                <Field label="Mobile number">
                  <div className="flex gap-2">
                    <select
                      value={phoneCountry.dial_code}
                      onChange={(e) => {
                        const next = countries.find((c) => c.dial_code === e.target.value);
                        if (next) setPhoneCountry(next);
                        setError("");
                      }}
                      className={`${inputCls} w-32 shrink-0 cursor-pointer`}
                      aria-label="Country dialling code"
                    >
                      {countries.map((c) => (
                        // The option needs its OWN colours. Chrome on Windows
                        // paints the native dropdown with a white system
                        // background while <option> inherits text-white from
                        // the select above - white on white, so every row read
                        // as blank except the highlighted one, which got the
                        // system blue behind it.
                        <option
                          key={c.dial_code}
                          value={c.dial_code}
                          className="bg-slate-900 text-white"
                        >
                          +{c.dial_code} {(c.country || "").split(" ")[0]}
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
                  <p className="mt-1 text-xs text-slate-500">
                    Used for identity verification and account security. Indian regulations
                    require us to hold a verified contact number for compute rental.
                  </p>
                </Field>
                {error && <ErrorBox msg={error} />}
                <Button type="submit" disabled={linkLoading} className="h-12 rounded-xl text-base font-semibold">
                  {linkLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
                  {linkLoading ? "Creating account…" : "Create account & send link"}
                </Button>
                <button type="button" onClick={() => { setLinkStep("email"); setError(""); }} className="text-xs text-slate-500 hover:text-slate-300">
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
                  className="text-xs text-slate-500 hover:text-slate-300"
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
                <Button type="submit" disabled={codeLoading} className="h-12 rounded-xl text-base font-semibold">
                  {codeLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {codeLoading ? "Sending…" : "Send 6-digit code"}
                </Button>
                <p className="text-center text-xs text-slate-500">
                  Codes only work for accounts that already exist. New here? Use{" "}
                  <b className="text-slate-300">Email me a link</b>.
                </p>
              </form>
            )}

            {codeStep === "code" && (
              <form onSubmit={handleCodeVerify} className="grid gap-4">
                <SentCard email={codeEmail} label="6-digit code" showCreateHint />
                <Field label="Verification code">
                  <Input
                    type="text"
                    inputMode="numeric"
                    pattern="\d{6}"
                    maxLength={6}
                    value={codeValue}
                    onChange={(e) => { setCodeValue(e.target.value.replace(/\D/g, "")); setError(""); }}
                    className="h-14 rounded-xl border-white/10 bg-white/5 text-center text-2xl font-bold tracking-[0.5em] text-white placeholder:text-slate-600"
                    placeholder="000000"
                    autoComplete="one-time-code"
                    autoFocus
                  />
                </Field>
                {error && <ErrorBox msg={error} />}
                <Button type="submit" disabled={codeLoading || codeValue.length < 6} className="h-12 rounded-xl text-base font-semibold">
                  {codeLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {codeLoading ? "Verifying…" : "Sign in"}
                </Button>
                <button type="button" onClick={() => { setCodeStep("email"); setCodeValue(""); setError(""); }} className="text-xs text-slate-500 hover:text-slate-300">
                  ← Use a different email
                </button>
              </form>
            )}
          </div>
        )}

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
      <p className="mt-6 text-center text-xs leading-6 text-slate-500">
        By signing in, you agree to our{" "}
        <a href="/terms" className="text-cyan-400 hover:underline">Terms and Conditions</a>,{" "}
        <a href="/privacy-policy" className="text-cyan-400 hover:underline">Privacy Policy</a>, and{" "}
        <a href="/refunds" className="text-cyan-400 hover:underline">Refunds and chargebacks</a>.
      </p>
    </div>
  );
}
