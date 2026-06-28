import type { Metadata } from "next";
import { BackgroundGlow } from "@/components/home/background-glow";
import LoginForm from "./login-form";

export const metadata: Metadata = {
  title: "Sign In — Coreframe Cloud",
  description: "Sign in to your Coreframe Cloud account or create a new one. GPU workstations on demand for architects and 3D artists.",
  alternates: { canonical: "/login" },
};

export default function LoginPage() {
  return (
    <div className="relative min-h-screen text-white">
      <BackgroundGlow />
      <main className="relative flex min-h-screen items-center justify-center px-4 py-24">
        <LoginForm />
      </main>
    </div>
  );
}
