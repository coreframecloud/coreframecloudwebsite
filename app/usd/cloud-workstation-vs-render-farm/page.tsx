import type { Metadata } from "next";
import WorkstationVsFarmView, { workstationVsFarmMetadata } from "@/app/cloud-workstation-vs-render-farm/view";

// /cloud-workstation-vs-render-farm for a visitor outside India: proxy.ts rewrites to this path, so the
// browser still shows /cloud-workstation-vs-render-farm (and canonical stays /cloud-workstation-vs-render-farm). A direct hit on
// /usd/cloud-workstation-vs-render-farm is redirected by proxy.ts.
export const metadata: Metadata = workstationVsFarmMetadata();

export default function PageUsd() {
  return <WorkstationVsFarmView currency="USD" />;
}
