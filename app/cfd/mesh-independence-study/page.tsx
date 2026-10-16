import type { Metadata } from "next";
import MeshStudyView, { meshStudyMetadata } from "./view";

// Visitors outside India are rewritten to /usd/cfd/mesh-independence-study by proxy.ts.
export const metadata: Metadata = meshStudyMetadata;

export default function MeshIndependenceStudyPage() {
  return <MeshStudyView currency="INR" />;
}
