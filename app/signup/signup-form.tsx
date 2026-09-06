"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, Loader2, Mail, ArrowRight } from "lucide-react";

const API = "https://control.coreframecloud.com/api";

type Step = "register" | "verify" | "done";

interface FormState {
  fullName: string;
  displayName: string;
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
      const body: Record<string, string> = {
        full_name: form.fullName.trim(),
        display_name: form.displayName.trim(),
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
        <div className="rounded-[1.8rem] border border-white/12 bg-white/6 p-6 backdrop-blur-2xl md:p-8">
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                {/* The name field asked for "Full name" and said nothing about
                    what happens to it, so people answered with their studio
                    name — a reasonable answer to the question as asked. Then
                    DigiLocker returned their legal name, the two shared no
                    word, and a real customer sat in manual review looking like
                    an impostor. Ask the two questions separately, and say which
                    one is checked. */}
                <label className="text-xs text-slate-400">
                  Full name <span className="text-slate-500">(as on Aadhaar)</span>
                </label>
                <Input
                  value={form.fullName}
                  onChange={set("fullName")}
                  className="h-12 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                  placeholder="Rahul Kumar Sharma"
                  autoComplete="name"
                  required
                />
              </div>
              <div className="grid gap-1.5">
                <label className="text-xs text-slate-400">Company / Studio</label>
                <Input
                  value={form.orgName}
                  onChange={set("orgName")}
                  className="h-12 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                  placeholder="Acme Studio"
                  required
                />
              </div>
            </div>

            <div className="grid gap-1.5">
              <label className="text-xs text-slate-400">
                Studio or preferred name <span className="text-slate-500">(optional)</span>
              </label>
              <Input
                value={form.displayName}
                onChange={set("displayName")}
                className="h-12 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                placeholder="Mark Design"
              />
              <p className="text-[11px] leading-4 text-slate-500">
                Your full name is checked against your Aadhaar record through DigiLocker, so
                enter it exactly as it appears there — middle or father&apos;s name included.
                This is what we&apos;ll call you instead.
              </p>
            </div>

            <div className="grid gap-1.5">
              <label className="text-xs text-slate-400">Work email</label>
              <Input
                type="email"
                value={form.email}
                onChange={set("email")}
                className="h-12 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-slate-500"
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
              <label className="text-xs text-slate-400">Mobile number</label>
              <Input
                type="tel"
                value={form.phone}
                onChange={set("phone")}
                className="h-12 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                placeholder="98765 43210"
                autoComplete="tel"
                inputMode="tel"
                required
              />
              <p className="text-[11px] leading-4 text-slate-500">
                Indian mobile number. We send your one-time sign-in codes here.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <label className="text-xs text-slate-400">Password</label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={set("password")}
                  className="h-12 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
                  required
                />
              </div>
              <div className="grid gap-1.5">
                <label className="text-xs text-slate-400">Confirm password</label>
                <Input
                  type="password"
                  value={form.confirmPassword}
                  onChange={set("confirmPassword")}
                  className="h-12 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                  placeholder="Repeat password"
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>

            {error && (
              <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="h-12 rounded-xl text-base font-semibold"
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

        <p className="mt-5 text-sm text-slate-500">
          Already have an account?{" "}
          <a
            href="https://control.coreframecloud.com/customer/"
            className="text-cyan-400 hover:underline"
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
        <div className="rounded-[1.8rem] border border-white/12 bg-white/6 p-6 backdrop-blur-2xl md:p-8">
          <div className="mb-6 flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cyan-400/10 text-cyan-300">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium text-white">Check your email</p>
              <p className="mt-0.5 text-sm text-slate-400">
                We sent a 6-digit code to <span className="text-white">{form.email}</span>. It expires in 10 minutes.
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <label className="text-xs text-slate-400">Verification code</label>
              <Input
                type="text"
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                value={otp}
                onChange={(e) => { setOtp(e.target.value.replace(/\D/g, "")); setError(""); }}
                className="h-14 rounded-xl border-white/10 bg-white/5 text-center text-2xl font-bold tracking-[0.5em] text-white placeholder:text-slate-600"
                placeholder="000000"
                autoComplete="one-time-code"
                autoFocus
              />
            </div>

            {error && (
              <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading || otp.length < 6}
              className="h-12 rounded-xl text-base font-semibold"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {loading ? "Verifying…" : "Verify email"}
            </Button>

            <p className="text-center text-sm text-slate-500">
              Didn&apos;t receive it?{" "}
              <button
                type="button"
                onClick={handleResend}
                disabled={resendCooldown > 0}
                className="text-cyan-400 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
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
      <div className="rounded-[1.8rem] border border-white/12 bg-white/6 p-6 backdrop-blur-2xl md:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-500/15 text-green-400">
            <CheckCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-white">Email verified — you&apos;re in.</p>
            <p className="mt-1 text-sm text-slate-400">
              Your Coreframe account is active. You&apos;ll receive an onboarding email shortly with next steps for getting started.
            </p>
          </div>
        </div>

        <div className="mt-6 border-t border-white/8 pt-6">
          <p className="text-sm text-slate-400">
            Questions? Reach us at{" "}
            <a
              href="mailto:admin@coreframecloud.com"
              className="text-cyan-400 hover:underline"
            >
              admin@coreframecloud.com
            </a>{" "}
            or on{" "}
            <a
              href="https://wa.me/916366889488"
              target="_blank"
              rel="noreferrer"
              className="text-cyan-400 hover:underline"
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
