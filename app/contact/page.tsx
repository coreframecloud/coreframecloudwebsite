import { permanentRedirect } from "next/navigation";

export default function ContactPage() {
  // Permanent (308): a 307 tells search engines to keep the old URL indexed.
  permanentRedirect("/request-demo");
}
