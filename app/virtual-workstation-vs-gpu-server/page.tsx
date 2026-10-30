import type { Metadata } from "next";
import WorkstationVsServerView, { workstationVsServerMetadata } from "./view";

// Visitors outside India are rewritten to /usd/virtual-workstation-vs-gpu-server by proxy.ts.
export const metadata: Metadata = workstationVsServerMetadata();

export default function Page() {
  return <WorkstationVsServerView currency="INR" />;
}
