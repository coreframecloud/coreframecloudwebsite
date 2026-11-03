import { KeepQueryLink } from "@/components/go/keep-query-link";

/**
 * Phones only (funnel review, 3 Nov 2026). About 9 in 10 visitors from the CFD
 * reels were on a phone, where nobody has their STL file, and none of them
 * pressed "Start a job". This gives them a step they can take on the phone:
 * make the account now, upload from the laptop later.
 */
export function PhoneLaterNote({ className = "" }: { className?: string }) {
  return (
    <p className={`text-[14px] leading-5 text-ink-2 sm:hidden ${className}`}>
      On your phone?{" "}
      <KeepQueryLink href="/signup" event="cfd_phone_later" cta="cfd phone later"
        className="font-semibold text-blue-ink underline underline-offset-2">
        Create your account now
      </KeepQueryLink>{" "}
      and upload the STL from your laptop later. Your quote waits in My Activity.
    </p>
  );
}
