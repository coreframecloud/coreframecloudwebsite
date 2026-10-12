import type { Metadata } from "next";
import LoginForm from "./login-form";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your Coreframe Cloud account or create a new one. GPU workstations on demand for architects and 3D artists.",
  alternates: { canonical: "/login" },
  // A sign-in form answers no search; keep it out of the index, follow links.
  robots: { index: false, follow: true },
};

export default function LoginPage() {
  return (
    <div className="relative min-h-screen text-ink">
      <div className="cf-aurora" />
      <main className="relative flex min-h-screen items-center justify-center px-4 py-24">
        <LoginForm />
      </main>
    </div>
  );
}
