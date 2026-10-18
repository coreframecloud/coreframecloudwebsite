import type { Metadata } from "next";
import SignupView, { signupMetadata } from "./view";

// Visitors outside India are rewritten to /usd/signup by proxy.ts.
export async function generateMetadata(): Promise<Metadata> {
  return signupMetadata("INR");
}

export default function SignupPage() {
  return <SignupView currency="INR" />;
}
