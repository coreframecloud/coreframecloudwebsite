import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PayView from "./pay-view";

/**
 * /pay/<token> - the "Retry payment" / "Pay now" link in the checkout follow-up
 * email and WhatsApp (28 Oct 2026, control plane services/checkout_followup.py).
 *
 * The token is signed and expiring and names one top-up and its owner; it never
 * carries the amount. After sign-in the browser asks the API for the amount
 * (GET /payments/pay-token/<token>, owner only) and opens the normal top-up on
 * /my-activity with that amount preselected - a fresh checkout, never the old one.
 */

export const metadata: Metadata = {
  title: "Finish your top-up",
  description: "Finish adding funds to your Coreframe wallet.",
  robots: { index: false, follow: false, nocache: true },
};

export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!/^[A-Za-z0-9_.-]{10,200}$/.test(token)) notFound();
  return <PayView token={token} />;
}
