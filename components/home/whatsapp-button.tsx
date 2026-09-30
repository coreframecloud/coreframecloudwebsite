"use client";

import { WhatsAppIcon } from "@/components/brand/contact-icons";
import { COMPANY } from "@/lib/company";

/**
 * The floating WhatsApp button.
 *
 * It used to be a ~230px pill with a label, pinned bottom-right at every
 * width. On a 390px screen that is well over half the column, and a screenshot
 * of the landing page showed it parked squarely on top of the old-way/new-way
 * copy -- the one block on the page whose entire job is to be read.
 *
 * So: a circle on a phone, the pill only from `sm:` up where there is room for
 * it beside the content rather than on top of it.
 *
 * The infinite `animate-ping` is gone too. A permanently pulsing element next
 * to body copy competes with reading, and it repaints forever on a device that
 * is paying for the battery.
 *
 * `bottom-[max(1.5rem,env(safe-area-inset-bottom))]` keeps it clear of the iOS
 * home indicator, which otherwise overlaps a bottom-pinned control.
 */
/* The fill is #0d8040, not WhatsApp's #25D366. White on #25D366 is 1.98:1 --
 * it fails the 4.5 floor for the label AND the 3:1 floor for the glyph, which
 * is why a white-on-bright-green button always looks slightly smeared. #0d8040
 * is the same hue, reads unmistakably as WhatsApp, and carries white at
 * 5.03:1. */
export function WhatsAppButton() {
  return (
    <a
      href={`${COMPANY.whatsapp}?text=${encodeURIComponent(
        "Hi Coreframe, I want to ask about a GPU workstation.",
      )}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with Coreframe on WhatsApp"
      className="fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#0d8040] text-white shadow-lg transition hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink sm:right-6 sm:bottom-6 sm:h-auto sm:w-auto sm:gap-2.5 sm:rounded-full sm:px-5 sm:py-3.5"
    >
      <WhatsAppIcon className="h-7 w-7 sm:h-5 sm:w-5" />
      <span className="hidden text-sm font-semibold sm:inline">WhatsApp us</span>
    </a>
  );
}
