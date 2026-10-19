import type { Metadata } from "next";
import VideoView, { videoMetadata } from "@/app/video-animation-rendering/view";

// /video-animation-rendering for a visitor outside India: proxy.ts rewrites
// to this path, so the browser (and the canonical) stay on the public URL.
// A direct hit on /usd/... is redirected by proxy.ts.
export const metadata: Metadata = videoMetadata;

export default function VideoPageUsd() {
  return <VideoView currency="USD" />;
}
