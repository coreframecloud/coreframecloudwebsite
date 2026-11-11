"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { API_BASE } from "@/lib/api-base";
import { apiFetch } from "@/lib/session";
import { formatMoney, parseCurrency, type Currency } from "@/lib/money";
import { errorText, jsonBody, readJson } from "@/lib/team";
import {
  effectiveHourly,
  passHours,
  windowLabel,
  type BlockOffer,
  type BlockOfferPack,
  type BlockPack,
  type Booking,
} from "@/lib/block-bookings";
import { LicenceNotice } from "@/components/licence/licence-notice";
import { LICENCE_END_REMINDER } from "@/lib/licence-notice";

/**
 * My Activity: the GPU extras (gpu-product-1110, 11 Nov 2026).
 *
 * One read of GET /customer/gpu-extras feeds three optional cards: the licence
 * statement (item 3), the working disk allowance (item 1) and the day, week and
 * month passes (item 5). Each card renders only when the API returns its
 * section (each is behind its own API flag). A failed, 404 or malformed read
 * renders nothing at all, so the page is exactly as it was before.
 */

export type LicenceExtra = {
  statement: string;
  short: string;
  preinstalled: string[];
  byol_examples: string[];
  end_reminder: string;
  help_url: string;
};

type AllowanceTier = { name: string; min_paid: number; extra_working_disk_gb: number };

export type StorageAllowance = {
  basis: "lifetime" | "trailing" | string;
  window_days: number;
  paid_total: number;
  currency: string;
  tier: AllowanceTier | null;
  next_tier: (AllowanceTier & { remaining: number }) | null;
  tiers: AllowanceTier[];
  extra_working_disk_gb: number;
  applies_to: string;
  note: string;
};

export type BlockBookingsExtra = {
  terms: string[];
  packs: BlockPack[];
  offers: BlockOffer[];
  active: Booking[];
};

export type GpuExtras = {
  currency: string;
  licence: LicenceExtra | null;
  storage_allowance: StorageAllowance | null;
  block_bookings: BlockBookingsExtra | null;
  user_timer_enabled?: boolean;
  inapp_funding_warnings?: boolean;
};

/** Reads /customer/gpu-extras once signed in; null on any failure. */
async function fetchGpuExtras(): Promise<GpuExtras | null> {
  try {
    const r = await apiFetch(`${API_BASE}/customer/gpu-extras`, { cache: "no-store" });
    const body = r.ok ? ((await r.json()) as GpuExtras | null) : null;
    return body && typeof body === "object" ? body : null;
  } catch {
    return null;
  }
}

export function useGpuExtras(signedIn: boolean): { extras: GpuExtras | null; reload: () => Promise<void> } {
  const [extras, setExtras] = useState<GpuExtras | null>(null);
  const reload = useCallback(async () => {
    setExtras(await fetchGpuExtras());
  }, []);
  useEffect(() => {
    if (!signedIn) return;
    let live = true;
    fetchGpuExtras().then((x) => {
      if (live) setExtras(x);
    });
    return () => {
      live = false;
    };
  }, [signedIn]);
  return { extras, reload };
}

function localDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

/* ── Licence ─────────────────────────────────────────────────────────────── */

export function LicenceCard({ licence }: { licence: LicenceExtra | null | undefined }) {
  if (!licence || typeof licence.statement !== "string") return null;
  return (
    <section className="cf-glass p-5 sm:p-6" aria-labelledby="licence-heading">
      <h2 id="licence-heading" className="cf-eyebrow">Software and licences</h2>
      <LicenceNotice force text={licence.statement} className="mt-3" />
      {/* Sessions are ended in Connect, not here, so the reminder sits with
          the statement rather than beside an End button. */}
      <p className="mt-3 text-[14px] leading-6 text-ink-2">{licence.end_reminder || LICENCE_END_REMINDER}</p>
    </section>
  );
}

/* ── Working disk allowance ──────────────────────────────────────────────── */

export function StorageAllowanceCard({ allowance }: { allowance: StorageAllowance | null | undefined }) {
  if (!allowance || typeof allowance.paid_total !== "number") return null;
  const cur: Currency = parseCurrency(allowance.currency) ?? "INR";
  const basis =
    allowance.basis === "trailing" && allowance.window_days > 0
      ? `in the last ${allowance.window_days} days`
      : "so far";
  const next = allowance.next_tier;
  return (
    <section className="cf-glass p-5 sm:p-6" aria-labelledby="allowance-heading">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2 id="allowance-heading" className="cf-eyebrow">Working disk allowance</h2>
        {allowance.tier ? (
          <span className="text-[13px] font-semibold text-ink-2">{allowance.tier.name}</span>
        ) : null}
      </div>
      <p className="mt-3 font-display text-2xl leading-tight font-bold text-ink">
        {allowance.tier
          ? `+${allowance.tier.extra_working_disk_gb} GB on the W: working disk`
          : "Standard working disk"}
      </p>
      <p className="mt-2 text-[14px] leading-6 text-ink-2">
        Top-ups paid {basis}: <span className="font-semibold text-ink tabular-nums">{formatMoney(allowance.paid_total, cur)}</span>
      </p>
      {next ? (
        <p className="mt-1 text-[14px] leading-6 text-ink-2">
          {formatMoney(next.remaining, cur)} more in top-ups reaches {next.name}: +{next.extra_working_disk_gb} GB.
        </p>
      ) : null}
      {allowance.note ? <p className="mt-3 text-[13px] leading-5 text-ink-3">{allowance.note}</p> : null}
      {allowance.applies_to ? (
        <p className="mt-1 text-[13px] leading-5 text-ink-3">On {allowance.applies_to}.</p>
      ) : null}
    </section>
  );
}

/* ── Day, week and month passes ──────────────────────────────────────────── */

type Pick = { offer: BlockOffer; pack: BlockOfferPack };

export function PassesCard({
  bookings,
  currency,
  onBought,
}: {
  bookings: BlockBookingsExtra | null | undefined;
  currency: string | null | undefined;
  onBought: () => void;
}) {
  const [pick, setPick] = useState<Pick | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!pick) return;
    confirmRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) setPick(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pick, busy]);

  if (!bookings || !Array.isArray(bookings.offers)) return null;
  const cur: Currency = parseCurrency(currency) ?? "INR";
  const active = (bookings.active ?? []).filter((b) => b.status === "active");
  const offers = bookings.offers.filter((o) => Array.isArray(o.packs) && o.packs.length > 0);
  const terms = bookings.terms ?? [];
  if (!offers.length && !active.length) return null;

  const buy = async () => {
    if (!pick) return;
    setBusy(true);
    setError(null);
    try {
      const res = await apiFetch(
        `${API_BASE}/gpu-bookings`,
        jsonBody("POST", { profile_slug: pick.offer.profile_slug, pack: pick.pack.key }),
      );
      const body = await readJson(res);
      if (!res.ok) {
        setError(errorText(body, "The pass could not be bought. Please try again."));
        return;
      }
      setDone(`${pick.pack.label} for ${pick.offer.profile_name} bought. It applies from your next launch.`);
      setPick(null);
      onBought();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section id="passes" className="cf-glass scroll-mt-20 p-5 sm:p-6" aria-labelledby="passes-heading">
      <h2 id="passes-heading" className="cf-eyebrow">Day, week and month passes</h2>

      {active.length ? (
        <ul className="mt-4 space-y-2">
          {active.map((b) => (
            <li key={b.id} className="cf-glass-inset flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 px-4 py-3">
              <span className="text-[14px] text-ink">
                <b className="font-semibold">{b.label}</b> · {b.profile_name}
              </span>
              <span className="text-[14px] tabular-nums text-ink-2">
                {passHours(b.hours_left)} left · until {localDateTime(b.expires_at)}
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      {done ? (
        <p className="mt-4 rounded-cf border border-blue/25 bg-blue-soft px-3 py-2 text-[13px] leading-5 break-words text-blue" role="status">
          {done}
        </p>
      ) : null}

      {offers.map((o) => (
        <div key={o.profile_slug} className="mt-5">
          <p className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <span className="font-heading text-[17px] font-medium text-ink">{o.profile_name}</span>
            <span className="text-[13px] text-ink-3">Normal rate {formatMoney(o.hourly_rate, cur)}/hr</span>
          </p>
          <ul className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {o.packs.map((p) => (
              <li key={p.key} className="cf-glass-inset flex min-w-0 items-center gap-4 px-4 py-3 sm:flex-col sm:items-stretch sm:py-4">
                <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold tracking-[0.04em] text-ink-2 uppercase">{p.label}</p>
                <p className="mt-2 flex flex-wrap items-baseline gap-x-2">
                  <span className="font-display text-2xl leading-none font-bold tabular-nums text-ink">{formatMoney(p.price, cur)}</span>
                  {p.list_price > p.price ? (
                    <s className="text-[14px] tabular-nums text-ink-3">{formatMoney(p.list_price, cur)}</s>
                  ) : null}
                </p>
                <p className="mt-2 text-[14px] leading-5 text-ink-2">
                  {passHours(p.hours)} within {windowLabel(p.window_hours)}
                </p>
                <p className="mt-1 text-[14px] leading-5 text-ink-2">
                  {effectiveHourly(p, cur)}/hr
                  {p.saving > 0 ? <span className="font-semibold text-ink"> · save {formatMoney(p.saving, cur)}</span> : null}
                </p>
                </div>
                <button
                  type="button"
                  aria-label={`Buy ${p.label} for ${o.profile_name}`}
                  className="cf-btn-secondary min-h-[44px] shrink-0 px-5 sm:mt-auto sm:w-full"
                  onClick={() => {
                    setError(null);
                    setDone(null);
                    setPick({ offer: o, pack: p });
                  }}
                >
                  Buy
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {terms.length ? (
        <ul className="mt-5 list-disc space-y-1 pl-5 text-[13px] leading-5 text-ink-2">
          {terms.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      ) : null}

      {/* Portalled to <body>: the card is a .cf-glass (backdrop-filter), which
          would otherwise become the containing block of this fixed overlay. */}
      {pick ? createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-stretch justify-center overflow-y-auto overscroll-contain bg-ink/30 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={() => !busy && setPick(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="pass-confirm-title"
        >
          {/* Form spacing system (owner, 30 Oct 2026): title → subtitle 8,
              subtitle → content 24, blocks 20, last block → buttons 24. */}
          <div
            className="cf-glass min-h-dvh w-full overflow-y-auto p-5 max-sm:rounded-none max-sm:border-0 max-sm:bg-paper max-sm:shadow-none sm:min-h-0 sm:max-h-[calc(100dvh-2rem)] sm:max-w-lg sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="pass-confirm-title" className="font-heading text-[24px] leading-8 font-medium text-ink">
              Buy a {pick.pack.label.toLowerCase()}?
            </h2>
            <p className="mt-2 text-[15px] leading-6 text-ink-2">{pick.offer.profile_name}</p>

            <div className="mt-6 flex flex-col gap-5">
              <div className="cf-glass-inset px-4 py-3">
                <p className="flex flex-wrap items-baseline gap-x-2">
                  <span className="font-display text-3xl font-bold tabular-nums text-ink">{formatMoney(pick.pack.price, cur)}</span>
                  {pick.pack.list_price > pick.pack.price ? (
                    <s className="text-[15px] tabular-nums text-ink-3">{formatMoney(pick.pack.list_price, cur)}</s>
                  ) : null}
                </p>
                <p className="mt-1 text-[14px] leading-5 text-ink-2">
                  {passHours(pick.pack.hours)} to use within {windowLabel(pick.pack.window_hours)} of buying · paid from your wallet now
                </p>
              </div>
              {terms.length ? (
                <ul className="list-disc space-y-1 pl-5 text-[14px] leading-6 text-ink-2">
                  {terms.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              ) : null}
            </div>

            {error ? (
              <p className="mt-1 rounded-cf border border-destructive/30 bg-destructive/5 px-3 py-2 text-[13px] leading-5 break-words text-destructive" role="alert">
                {error}
              </p>
            ) : null}

            <div className="mt-6 flex flex-col gap-2 sm:flex-row-reverse">
              <button
                ref={confirmRef}
                type="button"
                className="cf-btn-primary min-h-[44px] w-full sm:w-auto"
                disabled={busy}
                onClick={() => void buy()}
              >
                {busy ? "Buying…" : `Buy for ${formatMoney(pick.pack.price, cur)}`}
              </button>
              <button
                type="button"
                className="cf-btn-secondary min-h-[44px] w-full sm:w-auto"
                disabled={busy}
                onClick={() => setPick(null)}
              >
                Not now
              </button>
            </div>
          </div>
        </div>,
        document.body,
      ) : null}
    </section>
  );
}
