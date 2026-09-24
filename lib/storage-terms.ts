/**
 * What we actually give people, in one place.
 *
 * Six pages carried "Session scratch storage only, 7-day retention" while the
 * workflow diagram on the same site said "scratch cleared on session end", and
 * the D5 spec table managed both in a single line: "7-day retention, cleared
 * after session". Scratch is `ephemeral_cleanup_after_session` in the platform —
 * the 7-day claim was simply untrue, and had been on the site for weeks.
 *
 * Worse, no page mentioned persistent storage for B2C at all, while every B2C
 * account was already being given some. We were under-promising in copy and
 * over-delivering in fact, which sounds harmless until a customer plans around
 * the copy.
 *
 * So: one module, imported everywhere. Same reasoning as the rate card. These
 * should eventually come from /public/rate-card so a settings change reaches the
 * site without a deploy — until then, keep them in step with
 * `trial_storage_gb` and `b2c_storage_cap_gb` in the control plane by hand.
 */

import type { RateCard } from "@/lib/rate-card";

/**
 * Fallback only — used when the control plane is unreachable at build time.
 *
 * Kept deliberately in step with `trial_storage_gb`, `b2c_storage_cap_gb` and
 * `nas_retention_days` in the control plane. Prefer `storageTerms(card)` below,
 * which reads the live values; this exists so a page still renders something
 * true if the fetch fails, rather than rendering nothing.
 */
export type StorageTerms = {
  trialGb: number;
  paidGb: number;
  retentionDays: number;
  /** Billed minutes in a retention window that keep files alive. */
  activeMinutes: number;
};

export const STORAGE: StorageTerms = {
  trialGb: 20,
  paidGb: 50,
  retentionDays: 30,
  activeMinutes: 60,
};

/**
 * Live terms from the rate card, falling back to the constants above.
 *
 * The point of routing through here rather than reading `card.b2c_storage`
 * inline: one place decides what happens when the field is missing, so a page
 * cannot accidentally render `undefined GB` on a build where the control plane
 * was down or predates the field.
 */
export function storageTerms(card: RateCard | null): StorageTerms {
  const b = card?.b2c_storage;
  if (!b) return STORAGE;
  return {
    trialGb: b.trial_gb || STORAGE.trialGb,
    paidGb: b.paid_gb || STORAGE.paidGb,
    retentionDays: b.retention_days || STORAGE.retentionDays,
    activeMinutes: b.retention_active_minutes || STORAGE.activeMinutes,
  };
}

/** "20 GB persistent storage free, 50 GB once you add credit" — from live terms. */
export function storageShort(t: StorageTerms): string {
  return `${t.trialGb} GB persistent storage free, ${t.paidGb} GB once you add credit`;
}

/**
 * What happens to a customer's files, stated so they can rely on it.
 *
 * Until 11 Sep 2026 this returned a 30-day purge rule. Nothing in the platform
 * has ever implemented it - `nas_retention_days` is read only by
 * public_pricing.py, which publishes it - so the site described a deletion that
 * never happened, and a customer could reasonably have believed their projects
 * were already gone.
 *
 * Now it states the true rule. It takes no arguments because it no longer
 * depends on a window or a usage threshold; StorageTerms keeps those fields for
 * the GB figures, which are real.
 */
export function storageRetention(_t?: StorageTerms): string {
  return (
    "Your project files stay on your drive between sessions. We do not delete " +
    "them on a timer - they are kept while your account is active."
  );
}


/**
 * What storage costs, stated before anybody is charged for it.
 *
 * THE SITE SAID NEITHER HALF OF THIS. It advertised Rs 1999/TB/month on the
 * rate card, which only ever reached plan invoices for organisations, while a
 * prepaid customer had a hard 50 GB wall and no way to buy a fifty-first
 * gigabyte at any price. One number that did not apply to them, and one limit
 * that was never explained.
 *
 * Now: 50 GB is included, everything above it is charged daily from the wallet,
 * and both facts live here so every page says the same thing.
 */
export type StorageBilling = {
  allowanceGb: number;
  ratePerTbMonth: number;
  /** False until the control plane's storage_billing_start_date is reached. */
  active: boolean;
};

export function storageBilling(card: RateCard | null): StorageBilling {
  const rate = card?.storage_rate_rupees_per_tb_month ?? 1999;
  const b = card?.b2c_storage;
  return {
    allowanceGb: b?.paid_gb || STORAGE.paidGb,
    ratePerTbMonth: rate,
    active: Boolean(card?.storage_billing_active),
  };
}

/** One sentence for a pricing table or an FAQ answer. */
export function storageBillingShort(t: StorageBilling): string {
  return t.active
    ? `${t.allowanceGb} GB included. Above that, Rs ${t.ratePerTbMonth}/TB/month, ` +
      `charged daily from your wallet — delete what you do not need and it stops the same day.`
    : `${t.allowanceGb} GB included with every account.`;
}

/**
 * The paragraph a customer should be able to point at later.
 *
 * Written to answer the three questions people actually ask, in the order they
 * ask them: what does it cost, when does it come out, and what happens if my
 * balance runs out. The last one matters most and is the one most services
 * leave vague.
 */
export function storageBillingTerms(t: StorageBilling): string[] {
  if (!t.active) {
    return [
      `Every account includes ${t.allowanceGb} GB of persistent storage at no charge.`,
    ];
  }
  return [
    `Every account includes ${t.allowanceGb} GB of persistent storage at no charge. ` +
      `That ${t.allowanceGb} GB is yours whatever else happens on the account.`,
    `Storage above ${t.allowanceGb} GB costs Rs ${t.ratePerTbMonth} per TB per month, ` +
      `charged once a day from your wallet for that day only. Bring your storage back ` +
      `under ${t.allowanceGb} GB and the charge stops the same day — there is nothing to cancel.`,
    `If your balance cannot cover a day, nothing is deleted. We email you, new GPU ` +
      `sessions pause until it is settled, and your files stay downloadable. After 30 days ` +
      `and a final notice we remove data above the free ${t.allowanceGb} GB — never below it.`,
  ];
}
