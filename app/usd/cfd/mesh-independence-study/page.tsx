import type { Metadata } from "next";
import MeshStudyView, { meshStudyMetadata } from "@/app/cfd/mesh-independence-study/view";

// /cfd/mesh-independence-study for a visitor outside India: proxy.ts rewrites
// to this path, so the browser (and the canonical) stay on the public URL.
// A direct hit on /usd/... is redirected by proxy.ts.
export const metadata: Metadata = meshStudyMetadata;

export default function MeshIndependenceStudyPageUsd() {
  return <MeshStudyView currency="USD" />;
}
