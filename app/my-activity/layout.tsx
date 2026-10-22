import type { Metadata } from "next";
import type { ReactNode } from "react";

/**
 * A signed-in account page (the page itself is a client component, so the
 * robots rule lives here). Nothing on it is for a search index; /login
 * already carries the same rule (SEO plan, 22 Oct 2026).
 */
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
