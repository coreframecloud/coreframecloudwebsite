/**
 * "The wallet just changed": fired by a page that has re-read GET /me/wallet
 * (My activity, after a top-up or when the tab regains focus) with the fresh
 * status as `detail`. The site header listens and updates its wallet pill, so
 * the two never disagree on screen.
 */
export const WALLET_CHANGED_EVENT = "cf:wallet-changed";

export function announceWallet(wallet: unknown) {
  if (typeof window === "undefined" || !wallet) return;
  window.dispatchEvent(new CustomEvent(WALLET_CHANGED_EVENT, { detail: wallet }));
}
