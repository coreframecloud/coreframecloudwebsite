import type { Metadata } from "next";
import VideoView, { videoMetadata } from "./view";

// Visitors outside India are rewritten to /usd/video-animation-rendering by proxy.ts.
export const metadata: Metadata = videoMetadata;

export default function VideoPage() {
  return <VideoView currency="INR" />;
}
