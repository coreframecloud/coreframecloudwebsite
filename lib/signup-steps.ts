/**
 * The steps of sign-up, as the progress strip names them
 * (components/ui/flow-steps.tsx, 27 Nov 2026).
 *
 * A GPU customer has four: email, mobile code, first top-up, Connect download.
 * Someone who signed up from a CFD job or Studio is sent back there after the
 * mobile code, so their strip ends at "Continue" and never promises a download
 * they do not need.
 */
export const SIGNUP_STEPS = ["Email", "Mobile", "Add funds", "Download"] as const;
export const SIGNUP_STEPS_RETURN = ["Email", "Mobile", "Continue"] as const;

/** `returnPath`: the remembered post-sign-up path (lib/return-path.ts), if any. */
export function signupStepsFor(returnPath: string | null | undefined): readonly string[] {
  if (!returnPath) return SIGNUP_STEPS;
  // The GPU flow's own return paths: the payment step and the download.
  if (/^\/(my-activity|download)(?=$|[/?#])/.test(returnPath)) return SIGNUP_STEPS;
  return SIGNUP_STEPS_RETURN;
}
