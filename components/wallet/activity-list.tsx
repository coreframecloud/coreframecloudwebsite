"use client";

import { useMemo, useState } from "react";
import { formatMoney, type Currency } from "@/lib/money";

/**
 * ONE list of everything that moved the wallet (owner, 16 Oct 2026).
 *
 * The page used to show three tables: Wallet history, Recent sessions and
 * Payment history. A GPU session appeared twice (its charge in the wallet
 * history, its row in sessions) and a top-up twice (its credit in the wallet
 * history, its row in payments, which only added the invoice link). Now the
 * wallet ledger is the spine, and the other two only ENRICH it:
 *   - a GPU charge gets its session's duration (the ledger note names the
 *     session id: "Session 123 · 1.5 hr @ ₹399/hr");
 *   - a top-up credit gets its GST invoice link (matched to /payments/history
 *     by amount and time; the ledger row does not carry the top-up id yet);
 *   - a session still running, or a payment still being confirmed, has no
 *     ledger line yet, so it is shown on its own with no balance.
 *
 * Ten lines at a time, no inner scroll box; "Show more" adds ten.
 */

export interface LedgerRow {
  id: number;
  at: string;
  service: string | null;
  kind: string;
  amount_rupees: number;
  balance_after: number;
  note: string | null;
  ref: string | null;
  /** Not sent yet. If the API starts returning them, they are used directly. */
  wallet_topup_id?: string | number | null;
  session_id?: string | number | null;
}

export interface SessionRow {
  id: string | number;
  status: string;
  login_time: string;
  logout_time: string | null;
  billable_minutes: number;
  billed_amount_rupees: number;
}

export interface PaymentRow {
  id: string | number;
  amount_rupees: number;
  status: string;
  paid_at: string | null;
  invoice_short_url: string | null;
  invoice_id: number | null;
  invoice_number: string | null;
  created_at: string;
}

type Cat = "gpu" | "payments" | "cfd" | "studio" | "bonus" | "other";

const FILTERS: { key: "all" | Cat; label: string }[] = [
  { key: "all", label: "All" },
  { key: "gpu", label: "GPU sessions" },
  { key: "payments", label: "Top-ups & payments" },
  { key: "cfd", label: "CFD" },
  { key: "studio", label: "Studio" },
  { key: "bonus", label: "Bonuses" },
];

const CAT_LABEL: Record<Cat, string> = {
  gpu: "GPU",
  payments: "Top-up",
  cfd: "CFD",
  studio: "Studio",
  bonus: "Bonus",
  other: "Wallet",
};

interface Item {
  key: string;
  at: number;
  cat: Cat;
  title: string;
  detail: string | null;
  /** Signed; null when nothing has moved yet (running session, pending payment). */
  amount: number | null;
  balance: number | null;
  status?: string;
  invoice?: { id: number; number: string | null } | { url: string };
}

const PAGE = 10;

function ts(s: string | null | undefined): number {
  const t = s ? Date.parse(s) : NaN;
  return Number.isFinite(t) ? t : 0;
}

function duration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}

function money(x: number, cur: Currency): string {
  if (cur === "USD") return formatMoney(Math.abs(x), "USD");
  const whole = Math.abs(x - Math.round(x)) < 0.005;
  return `₹${Math.abs(x).toLocaleString("en-IN", {
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: whole ? 0 : 2,
  })}`;
}

function day(t: number): string {
  if (!t) return "";
  return new Date(t).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function catOf(r: LedgerRow): Cat {
  switch (r.service) {
    case "gpu":
    case "cfd":
    case "studio":
    case "bonus":
      return r.service;
    case "topup":
      return "payments";
    default:
      return "other";
  }
}

function titleOf(r: LedgerRow, cat: Cat): string {
  if (cat === "gpu") return "GPU session";
  if (cat === "payments") return "Top-up";
  if (cat === "bonus") return "Bonus credit";
  if (cat === "cfd") return r.amount_rupees >= 0 ? "CFD refund" : "CFD";
  if (cat === "studio") return r.amount_rupees >= 0 ? "Studio credit" : "Studio";
  if (r.service === "expiry" || r.kind === "expiry") return "Credit expired";
  if (r.service === "admin") return "Adjustment";
  if (r.kind.startsWith("storage")) return "Storage";
  const k = r.kind.replace(/_/g, " ");
  return k.charAt(0).toUpperCase() + k.slice(1);
}

const PAYMENT_STATE: Record<string, string> = {
  pending: "Being confirmed",
  held_for_review: "Under review",
  failed: "Not completed",
  refunded: "Refunded",
  paid: "Paid",
};

/** Build the one list. Exported for the mock screenshots only. */
export function buildActivity(
  ledger: LedgerRow[],
  sessions: SessionRow[],
  payments: PaymentRow[],
  ledgerComplete: boolean,
  cur: Currency,
): Item[] {
  const items: Item[] = [];
  const sessionById = new Map(sessions.map((s) => [String(s.id), s]));
  const usedSessions = new Set<string>();
  const usedPayments = new Set<string>();
  const paid = payments.filter((p) => p.status === "paid");

  for (const r of ledger) {
    const cat = catOf(r);
    const at = ts(r.at);
    let detail = r.note;
    let invoice: Item["invoice"];

    if (cat === "gpu") {
      const sid = r.session_id != null ? String(r.session_id) : r.note?.match(/Session (\d+)/)?.[1];
      const s = sid ? sessionById.get(sid) : undefined;
      if (sid) usedSessions.add(sid);
      const rest = r.note?.replace(/^Session \d+\s*·\s*/, "") ?? null;
      detail = s ? [duration(s.billable_minutes), rest].filter(Boolean).join(" · ") : rest;
    }

    if (cat === "payments" && r.amount_rupees > 0) {
      const p =
        (r.wallet_topup_id != null && paid.find((x) => String(x.id) === String(r.wallet_topup_id))) ||
        paid.find(
          (x) =>
            !usedPayments.has(String(x.id)) &&
            Math.abs(x.amount_rupees - r.amount_rupees) < 0.01 &&
            Math.abs(ts(x.paid_at ?? x.created_at) - at) < 30 * 60_000,
        );
      if (p) {
        usedPayments.add(String(p.id));
        if (p.invoice_id) invoice = { id: p.invoice_id, number: p.invoice_number };
        else if (p.invoice_short_url) invoice = { url: p.invoice_short_url };
      }
      // "Wallet recharge · receipt cf_…" is our bookkeeping, not the customer's.
      detail = r.note?.startsWith("Wallet recharge") ? null : r.note;
    }

    items.push({
      key: `l${r.id}`,
      at,
      cat,
      title: titleOf(r, cat),
      detail,
      amount: r.amount_rupees,
      balance: r.balance_after,
      invoice,
    });
  }

  // Only add stand-alone rows inside the window the loaded ledger covers, so
  // an older row does not appear out of place before its ledger page loads.
  const oldest = ledger.length ? Math.min(...ledger.map((r) => ts(r.at))) : 0;
  const inWindow = (t: number) => ledgerComplete || t >= oldest;

  for (const s of sessions) {
    const id = String(s.id);
    if (usedSessions.has(id)) continue;
    const at = ts(s.login_time);
    const running = ["active", "provisioning", "starting", "pending"].includes(s.status);
    if (!running && !inWindow(at)) continue;
    // Ended with nothing billed and nothing to say: skip the noise.
    if (!running && !(s.billed_amount_rupees > 0) && !(s.billable_minutes > 0)) continue;
    items.push({
      key: `s${id}`,
      at,
      cat: "gpu",
      title: "GPU session",
      detail: running
        ? "In progress · billed when it ends"
        : s.billable_minutes > 0
          ? duration(s.billable_minutes)
          : null,
      amount: running ? null : -Math.abs(s.billed_amount_rupees),
      balance: null,
      status: running ? "Running" : undefined,
    });
  }

  for (const p of payments) {
    const id = String(p.id);
    if (usedPayments.has(id) || p.status === "created") continue;
    const at = ts(p.paid_at ?? p.created_at);
    if (!inWindow(at)) continue;
    const credited = p.status === "paid";
    items.push({
      key: `p${id}`,
      at,
      cat: "payments",
      title: "Top-up",
      detail: credited ? null : `${money(p.amount_rupees, cur)} paid`,
      amount: credited ? p.amount_rupees : null,
      balance: null,
      status: credited ? undefined : PAYMENT_STATE[p.status] ?? p.status.replace(/_/g, " "),
      invoice: p.invoice_id
        ? { id: p.invoice_id, number: p.invoice_number }
        : p.invoice_short_url
          ? { url: p.invoice_short_url }
          : undefined,
    });
  }

  return items.sort((a, b) => b.at - a.at);
}

export default function ActivityList({
  ledger,
  sessions,
  payments,
  pooled,
  currency,
  moreOnServer,
  loadingMore,
  onLoadMore,
  onOpenInvoice,
}: {
  ledger: LedgerRow[];
  sessions: SessionRow[];
  payments: PaymentRow[];
  /** B2B member on the org wallet: the ledger is the org's, not shown here. */
  pooled: boolean;
  currency: Currency;
  /** The ledger request hit its limit, so older lines exist on the server. */
  moreOnServer: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
  onOpenInvoice: (invoiceId: number) => void;
}) {
  const [filter, setFilter] = useState<"all" | Cat>("all");
  const [visible, setVisible] = useState(PAGE);

  const items = useMemo(
    () => buildActivity(pooled ? [] : ledger, sessions, payments, !moreOnServer, currency),
    [ledger, sessions, payments, pooled, moreOnServer, currency],
  );
  const present = useMemo(() => new Set(items.map((i) => i.cat)), [items]);
  const chips = FILTERS.filter((f) => f.key === "all" || present.has(f.key));
  const shown = filter === "all" ? items : items.filter((i) => i.cat === filter);
  const page = shown.slice(0, visible);
  const canShowMore = shown.length > visible || moreOnServer;

  function pick(k: "all" | Cat) {
    setFilter(k);
    setVisible(PAGE);
  }

  function more() {
    const next = visible + PAGE;
    setVisible(next);
    if (moreOnServer && shown.length < next + PAGE) onLoadMore();
  }

  return (
    <section className="cf-glass overflow-hidden" aria-labelledby="activity-title">
      <div className="border-b border-rule px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 id="activity-title" className="cf-section-title">Activity.</h2>
          <p className="text-xs text-ink-3">
            Sessions, top-ups, CFD and Studio, newest first.
          </p>
        </div>
        {chips.length > 2 && (
          <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Show">
            {chips.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => pick(c.key)}
                aria-pressed={filter === c.key}
                className={`min-h-9 rounded-full border px-3 text-[13px] font-medium transition ${
                  filter === c.key
                    ? "border-ink bg-ink text-paper"
                    : "border-rule-strong bg-paper text-ink-2 hover:border-ink/40 hover:text-ink"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {pooled && (
        <p className="border-b border-rule px-4 py-3 text-xs leading-5 text-ink-2 sm:px-6">
          Your sessions are below. Your organisation&rsquo;s wallet history is in the org portal.
        </p>
      )}

      {page.length === 0 ? (
        <p className="px-4 py-8 text-sm text-ink-3 sm:px-6">
          {filter === "all" ? "Nothing yet." : "Nothing here yet."}
        </p>
      ) : (
        <ul className="divide-y divide-rule">
          {page.map((i) => (
            <li key={i.key} className="flex items-start justify-between gap-4 px-4 py-3.5 sm:px-6">
              <div className="min-w-0">
                <p className="text-[15px] leading-6 font-medium text-ink">
                  {i.title}
                  {i.status && (
                    <span className="ml-2 rounded-full border border-rule-strong bg-paper-2 px-2 py-0.5 align-[1px] text-[11px] font-medium whitespace-nowrap text-ink-2">
                      {i.status}
                    </span>
                  )}
                </p>
                <p className="mt-0.5 text-xs leading-5 text-ink-2">
                  <span className="font-mono text-[11px] tracking-[0.08em] text-ink-3 uppercase">
                    {CAT_LABEL[i.cat]}
                  </span>
                  <span className="text-ink-3"> · </span>
                  <span className="whitespace-nowrap">{day(i.at)}</span>
                  {i.detail && (
                    <>
                      <span className="text-ink-3"> · </span>
                      <span className="break-words">{i.detail}</span>
                    </>
                  )}
                </p>
                {i.invoice && (
                  <p className="mt-1 text-xs">
                    {"id" in i.invoice ? (
                      <button
                        type="button"
                        onClick={() => onOpenInvoice((i.invoice as { id: number }).id)}
                        className="font-medium break-all text-blue transition hover:text-blue-ink"
                      >
                        Invoice {(i.invoice as { number: string | null }).number ?? ""} ↗
                      </button>
                    ) : (
                      <a
                        href={i.invoice.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-blue transition hover:text-blue-ink"
                      >
                        Invoice ↗
                      </a>
                    )}
                  </p>
                )}
              </div>
              <div className="shrink-0 text-right">
                <p
                  className={`text-[15px] leading-6 font-medium whitespace-nowrap tabular-nums ${
                    i.amount != null && i.amount > 0 ? "text-[#1d6b43]" : "text-ink"
                  }`}
                >
                  {i.amount == null ? "—" : `${i.amount > 0 ? "+" : i.amount < 0 ? "−" : ""}${money(i.amount, currency)}`}
                </p>
                <p className="mt-0.5 text-xs whitespace-nowrap tabular-nums text-ink-3">
                  {i.balance != null ? `Balance ${money(i.balance, currency)}` : " "}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {(canShowMore || shown.length > PAGE) && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-rule px-4 py-3 sm:px-6">
          <p className="text-xs tabular-nums text-ink-3">
            Showing {page.length} of {shown.length}
            {moreOnServer ? "+" : ""}
          </p>
          {canShowMore && (
            <button
              type="button"
              onClick={more}
              disabled={loadingMore}
              className="cf-btn-secondary min-h-10 px-4 text-sm disabled:opacity-60"
            >
              {loadingMore ? "Loading…" : "Show more"}
            </button>
          )}
        </div>
      )}
    </section>
  );
}
