import { InPageLink } from "@/components/ui/in-page-link";
import Link from "next/link";

export function WorkflowSection() {
  return (
    <section className="border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-20">

        <h2 className="text-3xl font-semibold text-white">
          How it works
        </h2>

        <p className="mt-4 text-white/70">
          Launch → Upload → Render → Download → Shutdown
        </p>

        <div className="mt-10 grid lg:grid-cols-4 gap-6 text-white/70">

          <div>Launch workstation</div>
          <div>Upload project</div>
          <div>Render in D5</div>
          <div>Download results</div>

        </div>

        {/* 🔥 INTERNAL LINK (NEW) */}
        <div className="mt-10">
          <Link href="/d5-render" className="text-emerald-300 hover:underline">
            See full D5 workflow →
          </Link>
        </div>

        <div className="mt-8 text-sm text-white/60">
          Files are securely transferred to the provisioned machine and removed when the session ends.
        </div>

        <div className="mt-6">
          <InPageLink targetId="reserve-access" className="cf-btn-primary">
            Reserve Access
          </InPageLink>
        </div>

      </div>
    </section>
  );
}
