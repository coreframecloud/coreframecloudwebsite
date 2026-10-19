"use client";

/**
 * Small shared pieces of the CFD job page.
 *
 * Type scale (DESIGN-RULES.md, ratio 1.25 on a 16 px body): 13 px fine print
 * and labels, 16 px body, 20 px card headings, 25 px the one key number,
 * the page title clamped up to 39 px. At most one yellow highlight per state:
 * the selected package's price on a quote, the lead result on results.
 */
import { useState } from "react";
import Link from "next/link";
import { type Currency } from "@/lib/money";
import { fmtDate, fromNow, money, type WalletLine } from "@/lib/cfd-job";
import { uploadGeometry, type UploadProgress } from "@/lib/cfd-upload";

export function Card({
  title,
  eyebrow,
  children,
  tone = "plain",
  id,
}: {
  title?: React.ReactNode;
  eyebrow?: string;
  children: React.ReactNode;
  tone?: "plain" | "action" | "warn";
  id?: string;
}) {
  const toneCls =
    tone === "action"
      ? "bg-paper shadow-[0_1px_2px_rgb(16_17_19/0.06),0_18px_40px_-20px_rgb(16_17_19/0.28)] ring-1 ring-rule-strong"
      : tone === "warn"
        ? "bg-tint-sand"
        : "bg-paper-2";
  return (
    <section id={id} className={`min-w-0 rounded-[24px] p-5 sm:p-7 ${toneCls}`}>
      {eyebrow ? <p className="mb-2 font-mono text-[12px] tracking-[0.14em] text-ink-3 uppercase">{eyebrow}</p> : null}
      {title ? <h2 className="font-heading text-[20px] leading-[1.3] font-medium text-ink">{title}</h2> : null}
      <div className={title ? "mt-3" : ""}>{children}</div>
    </section>
  );
}

export function Fine({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <p className={`text-[13px] leading-[1.6] text-ink-2 ${className}`}>{children}</p>;
}

/**
 * Long terms folded under a small "Details" line (owner, 19 Oct 2026: one plain
 * line per package, the convergence and terms wording one click away; nothing removed).
 */
export function Fold({ children, summary = "Details", className = "" }: { children: React.ReactNode; summary?: string; className?: string }) {
  return (
    <details className={`group text-[13px] leading-[1.6] text-ink-2 ${className}`}>
      <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-1.5 font-medium text-ink underline underline-offset-2 [&::-webkit-details-marker]:hidden">
        {summary}
        <span aria-hidden className="text-ink-3 no-underline group-open:rotate-45">+</span>
      </summary>
      <div className="mt-1 space-y-1">{children}</div>
    </details>
  );
}

export function Body({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <p className={`text-[16px] leading-[1.6] text-ink-2 ${className}`}>{children}</p>;
}

export function ErrorLine({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="text-[14px] leading-[1.55] text-[#b3261e]">
      {children}
    </p>
  );
}

/** Collapsible fine print. */
export function More({ summary, children, open }: { summary: string; children: React.ReactNode; open?: boolean }) {
  return (
    <details className="group rounded-[20px] bg-paper-2 px-5 py-4 sm:px-7" open={open}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[15px] font-medium text-ink [&::-webkit-details-marker]:hidden">
        {summary}
        <span aria-hidden className="text-ink-3 transition-transform group-open:rotate-45">
          +
        </span>
      </summary>
      <div className="mt-4 space-y-3">{children}</div>
    </details>
  );
}

export function signInHref(refId: string, kind: "login" | "signup" = "login"): string {
  return `/${kind}?next=${encodeURIComponent(`/cfd/jobs/${refId}`)}`;
}

export function SignInPrompt({ refId, email, lead }: { refId: string; email?: string; lead?: string }) {
  return (
    <p className="text-[14px] leading-[1.6] text-ink-2">
      {lead ?? "Payments come from the wallet of the account that submitted this job. "}
      <Link href={signInHref(refId)} className="font-medium text-ink underline underline-offset-2">
        Sign in
      </Link>{" "}
      with {email || "the job's email"} and you come straight back here. No account?{" "}
      <Link href={signInHref(refId, "signup")} className="underline underline-offset-2">
        Create one
      </Link>{" "}
      with that email.
    </p>
  );
}

/** "Wallet ₹12,400 usable for CFD · Top up", and the shortfall when it cannot cover `need`. */
export function WalletRow({
  wallet,
  cur,
  need,
  refId,
  email,
}: {
  wallet: WalletLine | null | "signed_out";
  cur: Currency;
  need?: number;
  refId: string;
  email?: string;
}) {
  if (wallet === "signed_out") return <SignInPrompt refId={refId} email={email} />;
  if (!wallet) return null;
  const short = need != null && need > wallet.usable ? need - wallet.usable : 0;
  return (
    <div className="text-[14px] leading-[1.6] text-ink-2">
      <p>
        <span className="font-medium text-ink">Wallet {money(wallet.usable, cur)}</span> usable for CFD ·{" "}
        <Link href="/my-activity?topup=1" className="underline underline-offset-2">
          Top up
        </Link>
      </p>
      {short > 0 ? (
        <p className="mt-1">
          Add at least {money(short, cur)} to cover this, then come back to this page.
        </p>
      ) : null}
      {wallet.bonus > 0 ? (
        <p className="mt-1 text-[13px] text-ink-3">
          Your welcome bonus of {money(wallet.bonus, cur)} is for GPU time and cannot be spent on CFD.
        </p>
      ) : null}
    </div>
  );
}

/** The result of a failed action, with what to do next (sign in, top up). */
export type ActionError = { text: string; status: number } | null;

export function ActionErrorView({ error, refId, email }: { error: ActionError; refId: string; email?: string }) {
  if (!error) return null;
  return (
    <div className="mt-3 space-y-2">
      <ErrorLine>{error.text}</ErrorLine>
      {error.status === 401 ? <SignInPrompt refId={refId} email={email} lead="" /> : null}
      {error.status === 402 ? (
        <p className="text-[14px] text-ink-2">
          <Link href="/my-activity?topup=1" className="font-medium text-ink underline underline-offset-2">
            Top up your wallet
          </Link>
          , then come back to this page and press the button again.
        </p>
      ) : null}
    </div>
  );
}

export function PrimaryButton({
  children,
  onClick,
  busy,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  busy?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy || disabled}
      className="cf-btn-primary w-full disabled:cursor-default disabled:opacity-50 sm:w-auto"
    >
      {busy ? "Working…" : children}
    </button>
  );
}

export function QuietButton({
  children,
  onClick,
  busy,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  busy?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy || disabled}
      className="cf-btn-secondary w-full disabled:cursor-default disabled:opacity-50 sm:w-auto"
    >
      {busy ? "Working…" : children}
    </button>
  );
}

const PHASE_WORDS: Record<UploadProgress["phase"], string> = {
  checksum: "Checking the file…",
  upload: "Uploading…",
  verify: "Verifying…",
};

/** Upload (or replace) the STL: chunked and resumable, as on the API page. */
export function UploadBox({
  refId,
  primary,
  onDone,
}: {
  refId: string;
  primary: boolean;
  onDone: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [prog, setProg] = useState<UploadProgress | null>(null);
  const [msg, setMsg] = useState<string>("");
  const [err, setErr] = useState<string>("");
  const [busy, setBusy] = useState(false);

  async function go() {
    if (!file) return;
    setBusy(true);
    setErr("");
    try {
      await uploadGeometry({ ref: refId, file, onProgress: setProg });
      setMsg("Uploaded. Checking the geometry…");
      setTimeout(onDone, 3000);
    } catch (e) {
      setErr((e as Error).message || "Upload failed");
      setProg(null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <Fine>One closed binary STL, up to 200 MB. If the connection drops, choose the same file again and the upload resumes.</Fine>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="flex min-h-11 min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-full border border-rule-strong bg-paper px-4 text-[14px] text-ink-2">
          <span className="shrink-0 font-medium text-ink">Choose file</span>
          <span className="truncate">{file ? file.name : "No file chosen"}</span>
          <input
            type="file"
            accept=".stl"
            className="sr-only"
            onChange={(e) => {
              setFile(e.target.files?.[0] ?? null);
              setMsg("");
              setErr("");
            }}
          />
        </label>
        {primary ? (
          <PrimaryButton onClick={go} busy={busy} disabled={!file}>
            Upload
          </PrimaryButton>
        ) : (
          <QuietButton onClick={go} busy={busy} disabled={!file}>
            Upload
          </QuietButton>
        )}
      </div>
      {prog ? (
        <div>
          <div className="h-1.5 overflow-hidden rounded-full bg-ink/10">
            <div
              className="h-full rounded-full bg-ink transition-[width]"
              style={{ width: `${Math.round((prog.done / Math.max(1, prog.total)) * 100)}%` }}
            />
          </div>
          <Fine className="mt-1.5">{msg || `${PHASE_WORDS[prog.phase]} ${prog.done}/${prog.total}`}</Fine>
        </div>
      ) : null}
      {err ? <ErrorLine>{err}</ErrorLine> : null}
    </div>
  );
}

/**
 * A time in the viewer's own zone ("Fri 16 Oct, 15:00 CEST") with a relative
 * hint ("in about 3 h"). The job page only renders after mount (the job is
 * fetched in the browser), so the server never renders a different zone.
 */
export function When({ iso, hint = true }: { iso: string | null | undefined; hint?: boolean }) {
  const text = fmtDate(iso);
  const rel = hint ? fromNow(iso) : "";
  return (
    <span suppressHydrationWarning>
      <time dateTime={iso ?? undefined}>{text}</time>
      {rel ? <span className="block text-[12px] text-ink-3">{rel}</span> : null}
    </span>
  );
}
