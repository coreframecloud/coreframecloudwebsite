import type { NextRequest } from "next/server";
import { redirectToClient } from "@/lib/client-short-link";

// /download/windows: 302 to the current Windows installer (.exe). Public; see lib/client-short-link.ts.
export function GET(req: NextRequest) {
  return redirectToClient(req, "windows");
}
