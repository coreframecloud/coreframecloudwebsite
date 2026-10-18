import type { Metadata } from "next";
import SignupView, { signupMetadata } from "@/app/signup/view";

// /signup for a visitor outside India: proxy.ts rewrites to this path, so the
// browser (and the canonical) stay on the public URL. A direct hit on
// /usd/signup is redirected by proxy.ts.
export async function generateMetadata(): Promise<Metadata> {
  return signupMetadata("USD");
}

export default function SignupPageUsd() {
  return <SignupView currency="USD" />;
}
