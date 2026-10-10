import Link from "next/link";
import type { ReactNode } from "react";
import { getVisiblePost } from "@/lib/blog";

const LINK = /\[([^\]]+)\]\(([^)\s]+)\)/g;

/**
 * Renders a string with [label](href) links and nothing else.
 *
 * Deliberately tiny: articles are typed TS modules, and this is the one piece
 * of markup they need inside a sentence. Site-relative links go through
 * next/link; absolute ones open in a new tab without a referrer handle.
 */
export function RichText({ text }: { text: string }) {
  const out: ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(LINK)) {
    const [whole, label, href] = m;
    const at = m.index ?? 0;
    if (at > last) out.push(text.slice(last, at));
    last = at + whole.length;
    // A link to another post that is not on this build (a draft, on the
    // production deployment) becomes plain text instead of a 404.
    const blogSlug = href.match(/^\/blog\/([^/#?]+)/)?.[1];
    if (blogSlug && !getVisiblePost(blogSlug)) {
      out.push(label);
      continue;
    }
    out.push(
      href.startsWith("/") ? (
        <Link key={at} href={href} className="text-blue underline underline-offset-4 hover:text-blue-ink">
          {label}
        </Link>
      ) : (
        <a
          key={at}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue underline underline-offset-4 hover:text-blue-ink"
        >
          {label}
        </a>
      ),
    );
  }
  if (last < text.length) out.push(text.slice(last));
  return <>{out}</>;
}

/** The same string with the link markup removed, for JSON-LD and word counts. */
export function plainText(text: string): string {
  return text.replace(LINK, "$1");
}
