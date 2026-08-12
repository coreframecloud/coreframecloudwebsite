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

/** The retention rule, stated so a customer can predict it. */
export function storageRetention(t: StorageTerms): string {
  const hours = t.activeMinutes / 60;
  const use = hours === 1 ? "1 hour" : `${t.activeMinutes} minutes`;
  return (
    `Files are kept as long as you use at least ${use} of GPU time in any ` +
    `${t.retentionDays}-day window. After ${t.retentionDays} days without that, ` +
    `they are purged.`
  );
}
