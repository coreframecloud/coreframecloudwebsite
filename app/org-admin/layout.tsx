import type { Metadata } from "next";

/**
 * Signed-in screens. Client components cannot export metadata, so this layout
 * does it: without it the page inherited the homepage title and description
 * and was indexable, which put an empty account shell in search results.
 */
export const metadata: Metadata = {
  title: "Your account",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
