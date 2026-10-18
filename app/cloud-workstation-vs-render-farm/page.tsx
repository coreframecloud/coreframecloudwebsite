import type { Metadata } from "next";
import WorkstationVsFarmView, { workstationVsFarmMetadata } from "./view";

// Visitors outside India are rewritten to /usd/cloud-workstation-vs-render-farm by proxy.ts.
export const metadata: Metadata = workstationVsFarmMetadata();

export default function Page() {
  return <WorkstationVsFarmView currency="INR" />;
}
