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

      <main className="relative">
        <section className="cf-section px-5">
          <div className="cf-col">
            <p className="cf-eyebrow">Request access</p>

            <h1 className="cf-display mt-3">Tell us what you need a machine for.</h1>

            <p className="cf-lead mt-5">
              Your email, your number and the kind of work you run. That is the whole form. It
              hands the details to WhatsApp, where you can send the scene, the deadline and the
              file that will not open, and the conversation carries on there.
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
