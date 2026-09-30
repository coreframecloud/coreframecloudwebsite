"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OtpInput } from "@/components/ui/otp-input";
import { CheckCircle, Loader2, Mail, ArrowRight } from "lucide-react";

const API = "https://control.coreframecloud.com/api";

type Step = "register" | "verify" | "done";

interface FormState {
  fullName: string;
  displayName: string;
  whatsappOptIn: boolean;
  whatsappMarketingOptIn: boolean;
  orgName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export default function SignupForm() {
  const [step, setStep] = useState<Step>("register");
  const [form, setForm] = useState<FormState>({
    fullName: "",
    displayName: "",
    whatsappOptIn: true,
    // UNCHECKED, deliberately. The box above is checked because account
    // updates are what someone signing up is asking for; a pre-ticked
    // marketing box is not consent, and Meta would agree.
    whatsappMarketingOptIn: false,
    orgName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [otp, setOtp] = useState("");
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function set(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      setError("");
    };
  }

  function startCooldown(seconds = 60) {
    setResendCooldown(seconds);
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.fullName.trim()) return setError("Full name is required.");
    if (!form.orgName.trim()) return setError("Company or studio name is required.");
    if (!form.email.trim()) return setError("Email address is required.");
    // Shape only — the server is the gate, and it normalises to E.164 and
    // decides. This exists so the common typo is caught before the round trip,
    // not to duplicate the rule: 10 digits starting 6-9, however it is spaced,
    // with or without +91 / 0091 / a leading 0.
    if (!/^(?:0091|91)?0?[6-9]\d{9}$/.test(form.phone.replace(/\D/g, "")))
      return setError("Enter a 10-digit Indian mobile number (starting 6, 7, 8 or 9).");
    if (form.password.length < 8) return setError("Password must be at least 8 characters.");
    if (form.password !== form.confirmPassword) return setError("Passwords do not match.");

    setLoading(true);
    try {
      const body: Record<string, string | boolean> = {
        full_name: form.fullName.trim(),
        display_name: form.displayName.trim(),
        // Meta requires opt-in before a business may initiate a message.
        // Checked by default and saying plainly what it is for — the
        // honest version of a default, not a pre-ticked box buried in
        // terms nobody reads.
        whatsapp_opt_in: form.whatsappOptIn,
        whatsapp_marketing_opt_in: form.whatsappMarketingOptIn,
        organization_name: form.orgName.trim(),
        email: form.email.trim(),
        password: form.password,
      };
      // Always sent now. The API normalises whatever shape this is into E.164
      // and stores that, so there is nothing to pre-format here.
      body.phone_number = form.phone.trim();

      const res = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail ?? `Error ${res.status}`);

      setUserId(data.user.id);
      setStep("verify");
      startCooldown(60);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!/^\d{6}$/.test(otp.trim())) return setError("Enter the 6-digit code from your email.");

    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/verify-email-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, otp_code: otp.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail ?? `Error ${res.status}`);

      setStep("done");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError("");
    try {
      const res = await fetch(`${API}/auth/request-email-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail ?? `Error ${res.status}`);
      startCooldown(60);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not resend. Please wait and try again.");
    }
  }

  // ── Step: Register ────────────────────────────────────────────────────────

  if (step === "register") {
    return (
      <form onSubmit={handleRegister} className="mt-10 max-w-lg">
        <div className="rounded-cf border border-rule bg-paper-2 p-5 sm:p-6 md:p-8">
          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2 sm:gap-3">
              <div className="grid gap-1.5">
                {/* The name field asked for "Full name" and said nothing about
                    what happens to it, so people answered with their studio
                    name — a reasonable answer to the question as asked. Then
                    DigiLocker returned their legal name, the two shared no
                    word, and a real customer sat in manual review looking like
                    an impostor. Ask the two questions separately, and say which
                    one is checked. */}
                <label className="text-[13px] font-medium text-ink">
                  Full name <span className="text-ink-3">(as on Aadhaar)</span>
                </label>
                <Input
                  value={form.fullName}
                  onChange={set("fullName")}
                  className="h-11 rounded-cf border-rule bg-paper text-base text-ink placeholder:text-ink-3 md:text-sm"
                  placeholder="Rahul Kumar Sharma"
                  autoComplete="name"
                  required
                />
              </div>
              <div className="grid gap-1.5">
                <label className="text-[13px] font-medium text-ink">Company or studio</label>
                <Input
                  value={form.orgName}
                  onChange={set("orgName")}
                  className="h-11 rounded-cf border-rule bg-paper text-base text-ink placeholder:text-ink-3 md:text-sm"
                  placeholder="Acme Studio"
                  required
                />
              </div>
            </div>

            <div className="grid gap-1.5">
              <label className="text-[13px] font-medium text-ink">
                Studio or preferred name <span className="text-ink-3">(optional)</span>
              </label>
              <Input
                value={form.displayName}
                onChange={set("displayName")}
                className="h-11 rounded-cf border-rule bg-paper text-base text-ink placeholder:text-ink-3 md:text-sm"
                placeholder="Mark Design"
              />
              <p className="text-xs leading-5 text-ink-3">
                Your full name is checked against your Aadhaar record through DigiLocker, so
                enter it exactly as it appears there — middle or father&apos;s name included.
                This is what we&apos;ll call you instead.
              </p>
            </div>

            <div className="grid gap-1.5">
              <label className="text-[13px] font-medium text-ink">Work email</label>
              <Input
                type="email"
                value={form.email}
                onChange={set("email")}
                className="h-11 rounded-cf border-rule bg-paper text-base text-ink placeholder:text-ink-3 md:text-sm"
                placeholder="you@studio.com"
                autoComplete="email"
                required
              />
            </div>

            {/* Required, and honest about why.
                It was optional here while the other sign-in door required it,
                so most accounts arrived with no number and support had no way
                to reach anyone. It is also what CERT-In asks a cloud provider
                to hold for every subscriber. India-only because identity
                verification runs on DigiLocker — the server refuses anything
                else, so saying it here beats a 422 after the password. */}
            <div className="grid gap-1.5">
              <label className="text-[13px] font-medium text-ink">Mobile number</label>
              <Input
                type="tel"
                value={form.phone}
                onChange={set("phone")}
                className="h-11 rounded-cf border-rule bg-paper text-base text-ink placeholder:text-ink-3 md:text-sm"
                placeholder="98765 43210"
                autoComplete="tel"
                inputMode="tel"
                required
              />
              <p className="text-xs leading-5 text-ink-3">
                Indian mobile number. We send your one-time sign-in codes here.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 sm:gap-3">
              <div className="grid gap-1.5">
                <label className="text-[13px] font-medium text-ink">Password</label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={set("password")}
                  className="h-11 rounded-cf border-rule bg-paper text-base text-ink placeholder:text-ink-3 md:text-sm"
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
                  required
                />
              </div>
              <div className="grid gap-1.5">
                <label className="text-[13px] font-medium text-ink">Confirm password</label>
                <Input
                  type="password"
                  value={form.confirmPassword}
                  onChange={set("confirmPassword")}
                  className="h-11 rounded-cf border-rule bg-paper text-base text-ink placeholder:text-ink-3 md:text-sm"
                  placeholder="Repeat password"
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>

            {error && (
              <p className="rounded-cf border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm break-words text-destructive">
                {error}
              </p>
            )}

            <label className="flex cursor-pointer items-start gap-3 py-1 text-[13px] leading-5 text-ink-2">
              <input
                type="checkbox"
                checked={form.whatsappOptIn}
                onChange={(e) => setForm((prev) => ({ ...prev, whatsappOptIn: e.target.checked }))}
                className="mt-0.5 h-5 w-5 shrink-0 rounded-cf border-rule-strong bg-paper accent-blue"
              />
              <span>
                Send me account updates on WhatsApp at this number — when my account is
                approved, or if something needs fixing.
              </span>
            </label>

            <label className="flex cursor-pointer items-start gap-3 py-1 text-[13px] leading-5 text-ink-2">
              <input
                type="checkbox"
                checked={form.whatsappMarketingOptIn}
                onChange={(e) => setForm((prev) => ({ ...prev, whatsappMarketingOptIn: e.target.checked }))}
                className="mt-0.5 h-5 w-5 shrink-0 rounded-cf border-rule-strong bg-paper accent-blue"
              />
              <span>
                Also message me about new Coreframe products and offers. Unsubscribe from
                any message.
              </span>
            </label>

            <Button
              type="submit"
              disabled={loading}
              className="cf-btn-primary mt-1 min-h-11 w-full sm:w-auto sm:justify-self-start"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="mr-2 h-4 w-4" />
              )}
              {loading ? "Creating account…" : "Create account"}
            </Button>
          </div>
        </div>

        <p className="mt-5 text-sm text-ink-3">
          Already have an account?{" "}
          <a
            href="https://control.coreframecloud.com/customer/"
            className="text-blue hover:underline"
          >
            Sign in to the portal →
          </a>
        </p>
      </form>
    );
  }

  // ── Step: Verify email ────────────────────────────────────────────────────

  if (step === "verify") {
    return (
      <form onSubmit={handleVerify} className="mt-10 max-w-lg">
        <div className="rounded-cf border border-rule bg-paper-2 p-5 sm:p-6 md:p-8">
          <div className="mb-6 flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-cf bg-blue/10 text-blue">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium text-ink">Check your email.</p>
              <p className="mt-0.5 text-sm text-ink-2">
                We sent a 6-digit code to{" "}
                <span className="break-all text-ink">{form.email}</span>. It expires in 10
                minutes.
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <label className="text-[13px] font-medium text-ink">Verification code</label>
              <OtpInput
                value={otp}
                onChange={(v) => { setOtp(v); setError(""); }}
                autoFocus
              />
            </div>

            {error && (
              <p className="rounded-cf border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm break-words text-destructive">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading || otp.length < 6}
              className="cf-btn-primary mt-1 min-h-11 w-full sm:w-auto sm:justify-self-start"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {loading ? "Verifying…" : "Verify email"}
            </Button>

            <p className="text-center text-sm text-ink-3">
              Didn&apos;t receive it?{" "}
              <button
                type="button"
                onClick={handleResend}
                disabled={resendCooldown > 0}
                className="inline-flex min-h-11 items-center px-1 text-blue hover:underline disabled:cursor-not-allowed disabled:opacity-50"
              >
                Resend code{resendCooldown > 0 ? ` (${resendCooldown}s)` : ""}
              </button>
            </p>
          </div>
        </div>
      </form>
    );
  }

  // ── Step: Done ────────────────────────────────────────────────────────────

  return (
    <div className="mt-10 max-w-lg">
      <div className="rounded-cf border border-rule bg-paper-2 p-5 sm:p-6 md:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-cf bg-blue/10 text-blue">
            <CheckCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-ink">Email verified. You&apos;re in.</p>
            <p className="mt-1 text-sm text-ink-2">
              Your Coreframe account is active. We&apos;ll email you what to do
              next.
            </p>
          </div>
        </div>

        <div className="mt-6 border-t border-rule pt-6">
          <p className="text-sm text-ink-2">
            Questions? Reach us at{" "}
            <a
              href="mailto:admin@coreframecloud.com"
              className="text-blue hover:underline"
            >
              admin@coreframecloud.com
            </a>{" "}
            or on{" "}
            <a
              href="https://wa.me/916366889488"
              target="_blank"
              rel="noreferrer"
              className="text-blue hover:underline"
            >
              WhatsApp
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
