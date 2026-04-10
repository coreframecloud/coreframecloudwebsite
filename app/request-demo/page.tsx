import { BackgroundGlow } from "@/components/home/background-glow";
import { SiteFooter } from "@/components/home/site-footer";
import { SiteHeader } from "@/components/home/site-header";
import RequestDemoForm from "./request-demo-form";

export const dynamic = "force-dynamic";

export default async function RequestDemoPage({
  searchParams,
}: {
  searchParams: Promise<{ gpu?: string; type?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="min-h-screen text-white">
      <BackgroundGlow />
      <SiteHeader />

      <main className="relative mx-auto max-w-5xl px-6 pb-20 pt-20 md:pt-28">
        <div className="max-w-3xl">
          <div className="text-sm font-medium uppercase tracking-[0.25em] text-cyan-300">
            Reserve Access
          </div>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-6xl">
            Submit your intake request.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300 md:text-lg">
            Share your contact details and workload category. We’ll continue the
            discussion directly on WhatsApp.
          </p>
        </div>

        <RequestDemoForm
          initialGpu={params.gpu ?? ""}
          initialType={params.type ?? "RTX / 3D Rendering"}
        />
      </main>

      <SiteFooter />
    </div>
  );
}
