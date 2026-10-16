"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { API_BASE } from "@/lib/api-base";
import { useRateCard } from "@/lib/use-rate-card";
import { cellsLabel, formatMoney, parseCurrency, usdRates, type Currency } from "@/lib/money";
import { trackConversion, trackEvent } from "@/lib/analytics";
import { CFD_CATEGORIES, DEFAULT_CFD_CATEGORY, cfdCategory, type CfdCategoryId } from "@/lib/cfd-categories";
import { CATEGORY_FIELDS } from "./categories";
import { Field, inputCls, textareaCls } from "./form-ui";

/**
 * The CFD intake form, for a signed-in account that has finished sign-up
 * (owner, 13 Oct 2026). Name, email and WhatsApp number are NOT asked: the
 * API takes them from the account the bearer token belongs to.
 *
 * Category-driven: the tabs come from lib/cfd-categories.ts and each live
 * category's inputs from app/cfd/categories/. This shell owns what
 * every job has: job name, company, notes, submitting, the geometry upload
 * and the "job received" screen.
 *
 * POST /cfd-jobs (CfdJobCreate field names), then the geometry to
 * POST /cfd-jobs/{ref}/upload with the job's token. The single-request upload
 * takes up to 80 MB; a bigger STL (up to 200 MB) goes through the chunked
 * upload on the job page, which we link to.
 */

const SINGLE_UPLOAD_MAX = 80 * 1024 * 1024;

type Validation = { status?: string; issues?: { severity: string; message: string; fix?: string }[]; message?: string };

function detailMessage(body: unknown): string | null {
  const d = (body as { detail?: unknown } | null)?.detail;
  if (typeof d === "string") return d;
  if (d && typeof d === "object" && typeof (d as { message?: unknown }).message === "string") {
    return (d as { message: string }).message;
  }
  return null;
}

export default function CfdJobForm({ token, accountEmail, onSignedOut, currency = "INR" }: {
  token: string;
  accountEmail: string | null;
  /** The API no longer accepts the session (expired, revoked, or the account is not complete). */
  onSignedOut: (reason: "signed_out" | "incomplete") => void;
  /** The page's display currency (visitor country, see proxy.ts). The
   *  ACCOUNT's wallet currency, once known, wins: it is what the fee is
   *  actually charged in. */
  currency?: Currency;
}) {
  const [walletCurrency, setWalletCurrency] = useState<Currency | null>(null);
  useEffect(() => {
    let live = true;
    fetch(`${API_BASE}/customer/me/wallet`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : null))
      .then((w: { wallet_currency?: string | null } | null) => {
        if (live) setWalletCurrency(parseCurrency(w?.wallet_currency));
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [token]);
  const feeCurrency = walletCurrency ?? currency;
  const rateCard = useRateCard(feeCurrency === "USD");
  const usd = usdRates(rateCard);
  const usdFee =
    feeCurrency === "USD"
      ? {
          small: formatMoney(usd.cfd_quote_fee_small, "USD"),
          large: formatMoney(usd.cfd_quote_fee_large, "USD"),
          cells: cellsLabel(usd.cfd_quote_fee_small_max_cells),
        }
      : null;
  const [categoryId, setCategoryId] = useState<CfdCategoryId>(DEFAULT_CFD_CATEGORY);
  const category = cfdCategory(categoryId);
  const fields = category.status === "live" ? CATEGORY_FIELDS[categoryId] : undefined;

  const [states, setStates] = useState<Partial<Record<CfdCategoryId, unknown>>>(() => {
    const init: Partial<Record<CfdCategoryId, unknown>> = {};
    for (const c of CFD_CATEGORIES) {
      const f = CATEGORY_FIELDS[c.id];
      if (c.status === "live" && f) init[c.id] = f.initial();
    }
    return init;
  });
  const catState = states[categoryId];
  const setCat = (patch: Partial<Record<string, unknown>>) =>
    setStates((s) => ({ ...s, [categoryId]: { ...(s[categoryId] as object), ...patch } }));

  const [company, setCompany] = useState("");
  const [project, setProject] = useState("");
  const [notes, setNotes] = useState("");

  const [errors, setErrors] = useState<string[]>([]);
  const [busy, setBusy] = useState<"" | "submitting" | "uploading">("");
  const [submitError, setSubmitError] = useState("");

  const [refId, setRefId] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [uploadState, setUploadState] = useState<"" | "done" | "too_big" | "failed" | "skipped">("");
  const [uploadError, setUploadError] = useState("");
  const [validation, setValidation] = useState<Validation | null>(null);

  const auth = { Authorization: `Bearer ${token}` };

  const pollValidation = (ref: string) => {
    let attempts = 0;
    const poll = async () => {
      if (attempts++ > 30) return;
      try {
        const r = await fetch(`${API_BASE}/cfd-jobs/${ref}/validation`);
        if (r.ok) {
          const data = await r.json();
          const v = (data.validation || {}) as Validation;
          if (!v.status || v.status === "pending") {
            setTimeout(poll, 2000);
          } else {
            setValidation(v);
          }
          return;
        }
      } catch {
        /* keep polling */
      }
      setTimeout(poll, 3000);
    };
    setTimeout(poll, 1500);
  };

  const upload = async (ref: string, jobToken: string | undefined, f: File) => {
    if (f.size > SINGLE_UPLOAD_MAX) {
      setUploadState("too_big");
      return;
    }
    setBusy("uploading");
    try {
      const fd = new FormData();
      fd.append("file", f);
      // The job's token AND the owner's session: either one lets the API accept the file.
      const q = jobToken ? `?token=${encodeURIComponent(jobToken)}` : "";
      const res = await fetch(`${API_BASE}/cfd-jobs/${ref}/upload${q}`, { method: "POST", body: fd, headers: auth });
      if (!res.ok) {
        let msg = "The upload did not go through.";
        try {
          msg = detailMessage(await res.json()) ?? msg;
        } catch { /* keep default */ }
        throw new Error(msg);
      }
      setUploadState("done");
      trackEvent("cfd_stl_uploaded", { location: "cfd_intake" });
      pollValidation(ref);
    } catch (err: unknown) {
      setUploadState("failed");
      setUploadError(err instanceof Error ? err.message : "The upload did not go through.");
    } finally {
      setBusy("");
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fields || !category.api) return;
    const errs: string[] = [];
    if (!project.trim()) errs.push("A job name");
    errs.push(...fields.validate(catState));
    setErrors(errs);
    if (errs.length) return;
    setSubmitError("");
    setBusy("submitting");
    try {
      const payload = {
        company: company.trim(),
        projectName: project.trim(),
        applicationType: category.api.applicationType,
        solverSoftware: category.api.solverSoftware,
        domainType: category.api.domainType,
        kpi: category.api.kpi,
        deadline: "",
        description: notes.trim() || `${category.label}, submitted from /cfd`,
        ...fields.toPayload(catState),
      };
      const res = await fetch(`${API_BASE}/cfd-jobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...auth },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        let body: unknown = null;
        try { body = await res.json(); } catch { /* no body */ }
        if (res.status === 401) {
          onSignedOut("signed_out");
          return;
        }
        const code = (body as { detail?: { code?: string } } | null)?.detail?.code;
        if (res.status === 403 && code === "account_incomplete") {
          onSignedOut("incomplete");
          return;
        }
        if (res.status === 429) throw new Error("Too many jobs in the last hour. Try again later, or WhatsApp us.");
        throw new Error(detailMessage(body) ?? "That did not send. Check the fields and try again, or WhatsApp us.");
      }
      const data = (await res.json()) as { ref_id: string; access_token?: string };
      setRefId(data.ref_id);
      if (data.access_token) {
        // The job page on this site (16 Oct 2026); the token rides in the #fragment
        // (never sent to a server; app/cfd/jobs/[ref]/page.tsx strips it on arrival).
        setJobUrl(`/cfd/jobs/${encodeURIComponent(data.ref_id)}#t=${encodeURIComponent(data.access_token)}`);
      }
      // A submitted CFD job is a lead (Meta "Lead"). No form fields go with it.
      trackConversion("generate_lead", { method: categoryId === "rooms" ? "cfd_room_job" : "cfd_duct_job", location: "cfd_intake" });
      // Its own GA4 key event too, so Google Ads can bid on CFD jobs apart from WhatsApp taps.
      trackEvent("cfd_job_submit", { location: "cfd_intake" });
      setBusy("");
      const geometry = fields.file(catState);
      if (!geometry) {
        setUploadState("skipped");
      } else {
        await upload(data.ref_id, data.access_token, geometry);
      }
    } catch (err: unknown) {
      setBusy("");
      setSubmitError(err instanceof Error ? err.message : "That did not send. Try again, or WhatsApp us.");
    }
  };

  // ── After submit ────────────────────────────────────────────────────────
  if (refId) {
    const errorsFound = (validation?.issues || []).filter((i) => i.severity === "error");
    return (
      <div className="rounded-[24px] border border-rule bg-paper-2 p-6 sm:p-8" aria-live="polite">
        <p className="cf-card-label">Job received</p>
        <p className="font-mono text-2xl font-bold tracking-widest break-words text-blue">{refId}</p>

        {busy === "uploading" && <p className="mt-4 text-[15px] text-ink-2">Uploading your STL…</p>}

        {uploadState === "done" && (
          <p className="mt-4 text-[15px] leading-6 text-ink-2">
            STL received.
            {!validation && " The geometry check is running now."}
            {validation && validation.status === "complete" && !errorsFound.length && (
              <span className="text-ink"> The geometry check passed.</span>
            )}
            {validation && errorsFound.length > 0 && (
              <span className="text-ink"> The check found something to fix: {errorsFound[0].message}</span>
            )}
          </p>
        )}
        {uploadState === "too_big" && (
          <p className="mt-4 text-[15px] leading-6 text-ink-2">
            Your STL is over 80 MB, so upload it on your job page, which takes files up to 200 MB and resumes if the
            connection drops.
          </p>
        )}
        {uploadState === "failed" && (
          <p className="mt-4 text-[15px] leading-6 text-destructive">
            {uploadError} You can upload the STL again on your job page.
          </p>
        )}
        {uploadState === "skipped" && (
          <p className="mt-4 text-[15px] leading-6 text-ink-2">
            {fields?.skippedNote ?? <>On your job page, choose &ldquo;use my dimensions&rdquo; to mesh the straight duct you described.</>}
          </p>
        )}

        <div className="mt-6 space-y-2 text-[15px] leading-6 text-ink-2">
          <p className="font-semibold text-ink">Next, on your job page:</p>
          <ol className="list-decimal space-y-1 pl-5">
            <li>{fields?.nextFirstStep ?? "Confirm which opening is the inlet (and the units, if we ask)."}</li>
            {usdFee ? (
              <li>Pay for pre-processing / mesh validation from your Coreframe wallet: {usdFee.small} for most models, {usdFee.large} for very large models (over {usdFee.cells} cells), no GST.</li>
            ) : (
            <li>Pay for pre-processing / mesh validation from your Coreframe wallet: ₹599 incl. GST for most models, ₹1,499 for very large models (over 5 million cells).</li>
            )}
            <li>We check the geometry, build a wall-resolved mesh and verify its quality, then email you the mesh report and the quote. Pre-processing is a separate charge for that work, not deducted from the run.</li>
          </ol>
        </div>

        {/* Signed in (every submission is, since 13 Oct 2026): the job page also opens with the
            session, so the link works even when the API sent no token. */}
        <a
          href={jobUrl || `/cfd/jobs/${encodeURIComponent(refId)}`}
          target="_blank"
          rel="noreferrer"
          className="cf-btn-primary mt-7"
        >
          Open your job page
        </a>
        <p className="mt-3 text-[13.5px] leading-5 text-ink-3">
          It is also listed under{" "}
          <Link href="/my-activity#cfd-jobs" className="font-medium text-ink-2 underline underline-offset-2">
            CFD jobs
          </Link>{" "}
          in your account.
        </p>
        <p className="mt-4 text-[13.5px] leading-5 text-ink-3">
          The same link is on its way to {accountEmail || "your account's email"}. Keep it private: it also opens your results.
        </p>
      </div>
    );
  }

  // ── The form ────────────────────────────────────────────────────────────
  const Fields = fields?.Fields;
  return (
    <div className="rounded-[24px] border border-rule bg-paper-2 p-5 sm:p-8">
      <div role="tablist" aria-label="CFD category" className="flex flex-wrap gap-2">
        {CFD_CATEGORIES.map((c) => {
          const selected = c.id === categoryId;
          const soon = c.status !== "live" || !CATEGORY_FIELDS[c.id];
          return (
            <button
              key={c.id}
              type="button"
              role="tab"
              id={`cfd-tab-${c.id}`}
              aria-selected={selected}
              aria-controls="cfd-tabpanel"
              aria-disabled={soon || undefined}
              onClick={() => { setCategoryId(c.id); setErrors([]); setSubmitError(""); }}
              className={`flex min-h-11 items-center gap-2 rounded-cf border px-4 text-sm transition ${
                selected
                  ? soon ? "border-rule-strong bg-paper font-semibold text-ink-2" : "border-blue bg-blue-soft font-semibold text-ink"
                  : soon ? "border-rule text-ink-3" : "border-rule text-ink-2 hover:border-rule-strong"
              }`}
            >
              {c.label}
              {soon ? <span className="rounded-full bg-ink/5 px-2 py-0.5 text-[11px] font-semibold tracking-[0.04em] text-ink-3 uppercase">Coming soon</span> : null}
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-[13.5px] leading-5 text-ink-3">{category.summary}</p>

      <div id="cfd-tabpanel" role="tabpanel" aria-labelledby={`cfd-tab-${categoryId}`} className="mt-6">
        {!Fields ? (
          <div className="rounded-cf border border-dashed border-rule bg-paper p-5">
            <p className="text-[15px] leading-6 font-semibold text-ink">{category.label} is not taking jobs yet.</p>
            {category.futureInputs?.length ? (
              <>
                <p className="mt-2 text-[14px] leading-6 text-ink-2">When it opens, the form will ask for:</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-[14px] leading-6 text-ink-2">
                  {category.futureInputs.map((f) => <li key={f}>{f}</li>)}
                </ul>
              </>
            ) : null}
          </div>
        ) : (
          <form onSubmit={submit} noValidate>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Job name" htmlFor="cf-project" hint="Anything that tells you which run this is, e.g. “AHU-2 supply duct, level 3”.">
                <input id="cf-project" className={inputCls} value={project} onChange={(e) => setProject(e.target.value)} />
              </Field>
              <Field label="Company or college (optional)" htmlFor="cf-company">
                <input id="cf-company" className={inputCls} autoComplete="organization" value={company} onChange={(e) => setCompany(e.target.value)} />
              </Field>

              <Fields state={catState} set={setCat} />

              <Field label="Anything we should know (optional)" htmlFor="cf-notes" full>
                <textarea id="cf-notes" className={textareaCls} value={notes} onChange={(e) => setNotes(e.target.value)} />
              </Field>
            </div>

            {errors.length > 0 && (
              <div role="alert" className="mt-6 rounded-cf border border-destructive/30 bg-destructive/5 p-4 text-[14px] leading-6 text-ink">
                <p className="font-semibold">Please add:</p>
                <ul className="list-disc pl-5">
                  {errors.map((e) => <li key={e}>{e}</li>)}
                </ul>
              </div>
            )}
            {submitError && (
              <p role="alert" className="mt-6 text-[14px] leading-6 text-destructive">{submitError}</p>
            )}

            <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[13px] leading-5 text-ink-3">
                Submitting as {accountEmail || "your Coreframe account"}. Nothing is charged when you submit. Pre-processing
                {usdFee
                  ? ` (${usdFee.small} for most models, ${usdFee.large} over ${usdFee.cells} cells, no GST)`
                  : " (₹599 incl. GST for most models, ₹1,499 over 5 million cells)"} is paid later, on your job page, from your Coreframe wallet. By submitting you agree to our{" "}
                <a href="/terms-of-service" className="underline underline-offset-2">terms</a>.
              </p>
              <button type="submit" disabled={busy !== ""} className="cf-btn-primary shrink-0 disabled:opacity-60">
                {busy === "submitting" ? "Sending…" : busy === "uploading" ? "Uploading…" : "Submit job"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

