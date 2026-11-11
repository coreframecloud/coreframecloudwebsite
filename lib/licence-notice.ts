/**
 * Bring-your-own-licence clarity (gpu-product-1110, item 3; owner, 11 Nov 2026).
 *
 * ONE place for the wording, so the site, My Activity and Connect say the same
 * thing. The strings are the API contract's S1 / S2 / R, word for word: the
 * control plane serves the same text in GET /customer/gpu-extras `licence`.
 * Change them there and here together, never one alone.
 *
 * Hidden unless NEXT_PUBLIC_LICENCE_NOTICE is "1" at build time. The variable
 * is written out literally so Next inlines it into server and client bundles;
 * with it unset every page renders exactly as before.
 */

export const LICENCE_NOTICE_ON = process.env.NEXT_PUBLIC_LICENCE_NOTICE === "1";

/** S1: the full statement, wherever a customer picks or starts a GPU. */
export const LICENCE_STATEMENT =
  "Preinstalled: Blender, Unreal Engine, Twinmotion and D5 Render. Blender needs no licence; for Unreal Engine, Twinmotion and D5 Render you sign in with your own Epic Games or D5 account. Licences for commercial software, such as V-Ray, Lumion, Enscape, Adobe and Autodesk apps, are your own.";

/** S2: the short form, where space is tight. */
export const LICENCE_SHORT =
  "Blender, Unreal Engine, Twinmotion and D5 Render are preinstalled. Commercial software runs on your own licence.";

/** R: the reminder before a session ends. */
export const LICENCE_END_REMINDER =
  "Before you end: sign out of licensed apps (Lumion, V-Ray, Adobe, Autodesk and others) so you can use the licence on another computer.";

export const LICENCE_HELP_PATH = "/help/software-licences";
export const LICENCE_HELP_LINK_TEXT = "How to sign out of common apps";
