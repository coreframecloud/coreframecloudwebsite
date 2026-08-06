import { redirect } from "next/navigation";

/**
 * `/refunds` used to be a second, contradictory refund policy — it promised a
 * 14-day refund window while `/refund-policy` promised 7, and it carried the
 * old co-working address rather than the GST-registered one. Two policies means
 * a customer can always point at the more generous one, and neither is correct
 * any more: our CA has confirmed the recharge is the supply, so wallet credit
 * is not refundable at all.
 *
 * Redirecting rather than deleting keeps any existing link, screenshot or
 * payment-gateway dashboard entry pointing at the live terms.
 */
export default function RefundsRedirect() {
  redirect("/refund-policy");
}
