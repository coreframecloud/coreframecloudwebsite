import type { Metadata } from "next";
import EnterpriseView, { enterpriseMetadata } from "./view";

// Visitors outside India are rewritten to /usd/enterprise by proxy.ts.
export async function generateMetadata(): Promise<Metadata> {
  return enterpriseMetadata("INR");
}

export default function EnterprisePage() {
  return <EnterpriseView currency="INR" />;
}
