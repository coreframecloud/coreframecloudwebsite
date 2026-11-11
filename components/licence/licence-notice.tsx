import Link from "next/link";
import {
  LICENCE_HELP_LINK_TEXT,
  LICENCE_HELP_PATH,
  LICENCE_NOTICE_ON,
  LICENCE_SHORT,
  LICENCE_STATEMENT,
} from "@/lib/licence-notice";

/**
 * The licence statement (lib/licence-notice.ts) with the link to the sign-out
 * help page. Renders nothing unless NEXT_PUBLIC_LICENCE_NOTICE=1, so a page
 * that includes it is unchanged with the flag off.
 *
 * No hooks: usable from server pages (the GPU ladder) and client ones.
 * `text` overrides the wording (My Activity passes what the API sent, which is
 * the same S1); `force` shows it whatever the site flag says (My Activity,
 * where the API's own flag decides), and then the link appears only while
 * the help page exists (site flag on).
 */
export function LicenceNotice({
  variant = "full",
  text,
  force = false,
  className = "",
}: {
  variant?: "full" | "short";
  text?: string;
  force?: boolean;
  className?: string;
}) {
  if (!LICENCE_NOTICE_ON && !force) return null;
  const body = text ?? (variant === "short" ? LICENCE_SHORT : LICENCE_STATEMENT);
  return (
    <div data-licence-notice="" className={`rounded-[16px] border border-rule bg-paper-2 px-4 py-3 sm:px-5 ${className}`}>
      <p className="text-[14px] leading-6 break-words text-ink-2">{body}</p>
      {LICENCE_NOTICE_ON ? (
        <Link
          href={LICENCE_HELP_PATH}
          className="inline-flex min-h-[44px] items-center text-[14px] text-blue underline underline-offset-4"
        >
          {LICENCE_HELP_LINK_TEXT}
        </Link>
      ) : null}
    </div>
  );
}
