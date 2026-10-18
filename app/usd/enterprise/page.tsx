import type { Metadata } from "next";
import EnterpriseView, { enterpriseMetadata } from "@/app/enterprise/view";

// /enterprise for a visitor outside India: proxy.ts rewrites to this path, so
// the browser (and the canonical) stay on /enterprise. A direct hit on
// /usd/enterprise is redirected by proxy.ts.
export async function generateMetadata(): Promise<Metadata> {
  return enterpriseMetadata("USD");
}

export default function EnterprisePageUsd() {
  return <EnterpriseView currency="USD" />;
}
