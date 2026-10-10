import type { Metadata } from "next";
import { BackgroundGlow } from "@/components/home/background-glow";
import RequestDemoForm from "./request-demo-form";

export const metadata: Metadata = {
  title: "Contact Coreframe: Monthly Plans or a Demo",
  description:
    "Tell us your workload and how to reach you. We reply on WhatsApp, usually the same day, to talk through a monthly plan or set up a demo.",
  alternates: { canonical: "/request-demo" },
};

export default function RequestDemoPage() {
  return (
    <div className="min-h-screen text-ink">
      <BackgroundGlow />

      <main className="relative">
        <section className="cf-section px-5">
          <div className="cf-col">
            <p className="cf-eyebrow">Talk to us</p>

            <h1 className="cf-display mt-3">Tell us what you need a machine for.</h1>

            <p className="cf-lead mt-5">
              All we ask for is your email, your number and the kind of work you run. The form passes
              those to WhatsApp, and we carry on the conversation there. Send us the scene, the
              deadline, or the file that won&apos;t open.
            </p>
          </div>

          <div className="cf-wide">
            <RequestDemoForm />
          </div>
        </section>
      </main>
    </div>
  );
}
