import type { Metadata } from "next";
import { BackgroundGlow } from "@/components/home/background-glow";
import RequestDemoForm from "./request-demo-form";

export const metadata: Metadata = {
  title: "Contact Coreframe — Request Access or a Demo",
  description:
    "Tell us your workload and how to reach you. We reply on WhatsApp, usually the same day, to set up GPU workstation access or a demo.",
  alternates: { canonical: "/request-demo" },
};

export default function RequestDemoPage() {
  return (
    <div className="min-h-screen text-ink">
      <BackgroundGlow />

      <main className="relative mx-auto max-w-5xl px-6 pb-20 pt-20 md:pt-28">
        <div className="max-w-3xl">
          <div className="text-sm font-medium uppercase tracking-[0.25em] text-blue">
            Reserve Access
          </div>
          <h1 className="cf-display mt-3">
            Submit your intake request.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-ink-2 md:text-lg">
            Share your contact details and workload category. We’ll continue the
            discussion directly on WhatsApp.
          </p>
        </div>

        <RequestDemoForm />
      </main>
    </div>
  );
}
