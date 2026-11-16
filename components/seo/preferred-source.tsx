import { GoogleIcon } from "@/components/brand/contact-icons";

/**
 * "Add Coreframe as a preferred source on Google" (owner, 16 Nov 2026).
 *
 * Google lets a reader pick sources they want to see more of in Top Stories;
 * this opens that preference page for our domain. Quiet on purpose: one at
 * the end of every blog post and one in the footer, never a page CTA.
 * A plain <a> (an external URL), new tab, rel="noopener".
 */
export const PREFERRED_SOURCE_URL = "https://www.google.com/preferences/source?q=coreframecloud.com";
const LABEL = "Add Coreframe as a preferred source on Google";

/** The outlined pill at the end of a blog post. */
export function PreferredSourceButton({ className = "" }: { className?: string }) {
  return (
    <a
      href={PREFERRED_SOURCE_URL}
      target="_blank"
      rel="noopener"
      className={`inline-flex min-h-11 items-center gap-2.5 rounded-full border border-rule-strong px-5 py-2.5 text-left text-[14px] leading-5 font-medium text-ink-2 transition-colors hover:bg-paper-2 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-ink ${className}`}
    >
      <GoogleIcon className="h-4 w-4" />
      <span>{LABEL}</span>
    </a>
  );
}

/** The footer line, styled like the footer's other contact links. */
export function PreferredSourceFooterLink() {
  return (
    <a
      href={PREFERRED_SOURCE_URL}
      target="_blank"
      rel="noopener"
      className="flex min-h-11 max-w-[17rem] items-start gap-2 py-1.5 text-[13.5px] leading-5 text-ink-2 transition hover:text-ink"
    >
      <GoogleIcon className="mt-0.5 h-[15px] w-[15px]" />
      <span>{LABEL}</span>
    </a>
  );
}
