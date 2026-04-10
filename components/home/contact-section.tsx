import { Button } from "@/components/ui/button";
import { Mail, MessageCircle } from "lucide-react";

export function ContactSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-20 pt-6 md:pb-28">
      <div className="grid gap-8 rounded-[2rem] border border-cyan-400/20 bg-cyan-500/8 p-8 backdrop-blur-2xl md:grid-cols-[1fr_0.9fr] md:p-10">
        <div>
          <div className="text-sm font-medium uppercase tracking-[0.25em] text-cyan-200">
            Reserve Access
          </div>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">
            Not live yet? Reserve your workload now.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-8 text-slate-100/85">
            Submit your requirement through the intake form and we’ll continue the
            conversation directly on WhatsApp.
          </p>
        </div>

        <div className="grid gap-4">
          <a href="/request-demo">
            <Button className="h-12 w-full rounded-xl text-base">
              Open Intake Form
            </Button>
          </a>

          <a
            href="https://wa.me/916366889488?text=Hi%20Coreframe%20Cloud%2C%20I%20want%20to%20reserve%20GPU%20access."
            target="_blank"
            rel="noreferrer"
          >
            <Button
              variant="outline"
              className="h-12 w-full rounded-xl border-green-400/30 bg-green-500/10 text-green-200 hover:bg-green-500/20"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Connect on WhatsApp
            </Button>
          </a>

          <a href="mailto:hi@coreframecloud.com">
            <Button
              variant="outline"
              className="h-12 w-full rounded-xl border-white/12 bg-white/6 text-white hover:bg-white/10"
            >
              <Mail className="mr-2 h-4 w-4" />
              Email Us
            </Button>
          </a>

          <div className="rounded-xl border border-white/8 bg-slate-950/30 px-4 py-3 text-xs leading-6 text-slate-400">
            Deployment and configuration can be aligned to workload type,
            performance target, and scaling preference.
          </div>
        </div>
      </div>
    </section>
  );
}
