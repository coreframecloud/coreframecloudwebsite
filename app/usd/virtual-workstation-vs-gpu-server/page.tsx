import type { Metadata } from "next";
import WorkstationVsServerView, { workstationVsServerMetadata } from "@/app/virtual-workstation-vs-gpu-server/view";

// /virtual-workstation-vs-gpu-server for a visitor outside India: proxy.ts rewrites to this path, so the
// browser still shows /virtual-workstation-vs-gpu-server (and canonical stays /virtual-workstation-vs-gpu-server).
// A direct hit on /usd/virtual-workstation-vs-gpu-server is redirected by proxy.ts.
export const metadata: Metadata = workstationVsServerMetadata();

export default function PageUsd() {
  return <WorkstationVsServerView currency="USD" />;
}
