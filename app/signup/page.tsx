import type { Metadata } from "next";
import { BackgroundGlow } from "@/components/home/background-glow";
import SignupForm from "./signup-form";

export const metadata: Metadata = {
  title: "Create Account",
  description:
    "Create your Coreframe Cloud account and get access to GPU workstations on demand.",
  alternates: {
    canonical: "/signup",
  },
};

export default function SignupPage() {
  return (
    <div className="relative min-h-screen text-white">
      <BackgroundGlow />

      <main className="relative mx-auto max-w-5xl px-6 pb-24 pt-20 md:pt-28">
        <div className="max-w-2xl">
          <div className="text-sm font-medium uppercase tracking-[0.25em] text-cyan-300">
            Get Started
          </div>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
            Create your account.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-8 text-slate-300">
            GPU workstations on demand — pay by the hour, cancel anytime.
            No hardware, no long-term commitment.
          </p>
        </div>

        <SignupForm />
      </main>
    </div>
  );
}
