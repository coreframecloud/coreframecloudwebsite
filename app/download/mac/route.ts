import type { NextRequest } from "next/server";
import { redirectToClient } from "@/lib/client-short-link";

// /download/mac: 302 to the current Apple silicon Mac (.dmg). Public; see lib/client-short-link.ts.
export function GET(req: NextRequest) {
  return redirectToClient(req, "mac-arm64");
}
