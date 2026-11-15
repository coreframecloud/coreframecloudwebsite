import type { NextRequest } from "next/server";
import { redirectToClient } from "@/lib/client-short-link";

// /download/mac/intel: 302 to the current Intel Mac (.dmg). Public; see lib/client-short-link.ts.
export function GET(req: NextRequest) {
  return redirectToClient(req, "mac-x64");
}
