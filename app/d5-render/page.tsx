import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "D5 Render Cloud Workstation (RTX GPU)",
  description:
    "Run D5 Render on RTX GPUs in the cloud. Choose 16GB–48GB VRAM and render faster without upgrading hardware.",

  alternates: {
    canonical: "/d5-render",
  },
};

export default function Page() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-20 text-white">

      <h1 className="text-4xl font-semibold">
        D5 Render Cloud Workstation (RTX GPU)
      </h1>

      <p className="mt-6 text-white/70">
        Run D5 Render on RTX GPUs without upgrading your local machine.
        Launch, render, download results, and shut down.
      </p>

      <div className="mt-10 space-y-3 text-white/70">
        <div>• 16GB VRAM — RTX A4000</div>
        <div>• 20GB VRAM — RTX 4000 Ada</div>
        <div>• 24GB VRAM — RTX A5000</div>
        <div>• 48GB VRAM — RTX A6000</div>
      </div>

      <div className="mt-10 space-y-2 text-emerald-300">
        <Link href="/" className="block hover:underline">← Back to Home</Link>
        <Link href="/#pricing" className="block hover:underline">View Pricing</Link>
        <Link href="/#reserve-access" className="block hover:underline">Reserve Access</Link>
      </div>

    </div>
  );
}
