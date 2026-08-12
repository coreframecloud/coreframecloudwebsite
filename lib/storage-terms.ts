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

export const STORAGE = {
  trialGb: 20,
  paidGb: 50,
  retentionDays: 30,
  /** Usage in a retention window that keeps files alive. */
  activeHours: 1,
} as const;

/** One sentence, for a feature list or a bullet. */
export const STORAGE_SHORT =
  `${STORAGE.trialGb} GB persistent storage free, ${STORAGE.paidGb} GB once you add credit`;

/** The retention rule, stated so a customer can predict it. */
export const STORAGE_RETENTION =
  `Files are kept as long as you use at least ${STORAGE.activeHours} hour of GPU time ` +
  `in any ${STORAGE.retentionDays}-day window. After ${STORAGE.retentionDays} days ` +
  `without that, they are purged.`;

/**
 * Session scratch. Cleared at session end — NOT retained for 7 days.
 * Say "download before you shut down" plainly; a customer who believes
 * otherwise loses a render.
 */
export const SCRATCH_SHORT =
  "50 GB NVMe scratch for the session, cleared when the session ends — download your outputs first";

/** Both together, for the ad-hoc pricing blurb. */
export const STORAGE_ADHOC =
  `${STORAGE_SHORT}. ${SCRATCH_SHORT}.`;
