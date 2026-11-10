/**
 * Phones only (funnel review, 3 Nov 2026). About 9 in 10 visitors from the CFD
 * reels were on a phone, where nobody has their STL file.
 *
 * 10 Nov 2026 (owner: one big call to action per landing page; form first,
 * account at payment): this used to be a second call to action, "Create your
 * account now", which competed with the page's one action and asked for the
 * account first. It is now a plain line: the price needs no account, so the
 * useful step is to open the page where the STL is.
 */
export function PhoneLaterNote({ className = "" }: { className?: string }) {
  return (
    <p className={`text-[14px] leading-5 text-ink-2 sm:hidden ${className}`}>
      On your phone? Open this page on the computer that has your STL. You see the price before you sign up.
    </p>
  );
}
