"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Mail, CheckCircle, ArrowRight } from "lucide-react";

const API = "https://control.coreframecloud.com/api";

type Tab = "link" | "code" | "password";
type LinkStep = "email" | "details" | "sent";
type CodeStep = "email" | "code" | "done";
type PwStep = "form" | "done";

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
function SentCard({ email, label }: { email: string; label: string }) {
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
        <p className="mt-2 text-xs text-slate-500">
          Nothing arrived? You may not have an account yet — use{" "}
          <b className="text-slate-300">Email link</b> above to create one.
        </p>
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
  }, []);

  // ── Email Link state ────────────────────────────────────────────────────────
  const [linkStep, setLinkStep] = useState<LinkStep>("email");
  const [linkEmail, setLinkEmail] = useState("");
  const [linkIsNew, setLinkIsNew] = useState(false);
  const [linkName, setLinkName] = useState("");
  const [linkOrg, setLinkOrg] = useState("");
  const [linkPhone, setLinkPhone] = useState("");
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

  // ── Password state ──────────────────────────────────────────────────────────
  const [pwStep, setPwStep] = useState<PwStep>("form");
  const [pwEmail, setPwEmail] = useState("");
  const [pwPassword, setPwPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

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
    // Only a business needs a company name — for an individual it is friction
    // for no gain, so we fall back to their own name as the workspace label.
    if (linkAccountType === "b2b" && !linkOrg.trim()) {
      return setError("Registered business name is required.");
    }
    if (linkAccountType === "b2b" && linkGstin.trim().length !== 15) {
      return setError("A GSTIN is 15 characters. You can also add it later during verification.");
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
          phone: linkPhone.trim() || undefined,
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

  // ── Password handler ────────────────────────────────────────────────────────

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!pwEmail.trim() || !pwPassword) return setError("Email and password are required.");
    setPwLoading(true);
    try {
      const res = await fetch(`${API}/auth/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: pwEmail.trim(), password: pwPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail ?? `Error ${res.status}`);
      storeAndRedirect(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid credentials.");
    } finally {
      setPwLoading(false);
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

        {/* Tab switcher */}
        <div className="mb-5 flex gap-1 rounded-xl bg-white/5 p-1">
          <TabBtn active={tab === "link"} onClick={() => switchTab("link")}>Email link</TabBtn>
          <TabBtn active={tab === "code"} onClick={() => switchTab("code")}>Email code</TabBtn>
          <TabBtn active={tab === "password"} onClick={() => switchTab("password")}>Password</TabBtn>
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
                <Field label={<>Phone <span className="text-slate-600">(optional)</span></>}>
                  <Input type="tel" value={linkPhone} onChange={(e) => { setLinkPhone(e.target.value); }} className={inputCls} placeholder="+91 98765 43210" />
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
              </form>
            )}

            {codeStep === "code" && (
              <form onSubmit={handleCodeVerify} className="grid gap-4">
                <SentCard email={codeEmail} label="6-digit code" />
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

        {/* ── PASSWORD TAB ──────────────────────────────────────────────── */}
        {tab === "password" && (
          <form onSubmit={handlePasswordSubmit} className="grid gap-4">
            <Field label="Email address">
              <Input
                type="email"
                value={pwEmail}
                onChange={(e) => { setPwEmail(e.target.value); setError(""); }}
                className={inputCls}
                placeholder="you@studio.com"
                autoComplete="email"
                autoFocus
                required
              />
            </Field>
            <Field label="Password">
              <Input
                type="password"
                value={pwPassword}
                onChange={(e) => { setPwPassword(e.target.value); setError(""); }}
                className={inputCls}
                placeholder="Your password"
                autoComplete="current-password"
                required
              />
            </Field>
            {error && <ErrorBox msg={error} />}
            <Button type="submit" disabled={pwLoading} className="h-12 rounded-xl text-base font-semibold">
              {pwLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {pwLoading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        )}

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
