import { redirect } from "next/navigation";

// Redirect any /download/* sub-paths back to /download
export default function DownloadCatchAll() {
  redirect("/download");
}
