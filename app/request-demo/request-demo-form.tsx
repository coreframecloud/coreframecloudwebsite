"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, MessageCircle } from "lucide-react";

export default function RequestDemoForm() {
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [workload, setWorkload] = useState("RTX / 3D Rendering");
  const [gpu, setGpu] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const gpuParam = params.get("gpu");
    const typeParam = params.get("type");

    if (gpuParam) setGpu(gpuParam);
    if (typeParam) setWorkload(typeParam);
  }, []);

  const handleWhatsAppSubmit = () => {
    const message = `Hi Coreframe Cloud, I would like to reserve access.

Email: ${email}
Mobile: ${mobile}
Workload: ${workload}
Selected GPU: ${gpu || "Not selected"}`;

    const url = `https://wa.me/916366889488?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="mt-12 grid gap-8 md:grid-cols-[1.15fr_0.85fr]">
      <div className="rounded-[1.8rem] border border-white/12 bg-white/6 p-6 backdrop-blur-2xl md:p-8">
        <div className="grid gap-4">
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-slate-500"
            placeholder="Work email"
          />

          <Input
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            className="h-12 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-slate-500"
            placeholder="Mobile number"
          />

          <select
            value={workload}
            onChange={(e) => setWorkload(e.target.value)}
            className="h-12 rounded-xl border border-white/10 bg-white/5 px-4 text-white outline-none"
          >
            <option className="bg-slate-900">RTX / 3D Rendering</option>
            <option className="bg-slate-900">AI / Linux Workloads</option>
          </select>

          <Input
            value={gpu}
            onChange={(e) => setGpu(e.target.value)}
            className="h-12 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-slate-500"
            placeholder="Selected GPU (optional)"
          />

          <Button
            onClick={handleWhatsAppSubmit}
            className="h-12 rounded-xl text-base"
          >
            Send on WhatsApp
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        <div className="rounded-[1.6rem] border border-white/12 bg-white/6 p-6 backdrop-blur-2xl">
          <div className="text-sm text-slate-400">WhatsApp</div>
          <div className="mt-2 text-xl font-semibold">Fastest response</div>
          <a
            href="https://wa.me/916366889488?text=Hi%20Coreframe%20Cloud%2C%20I%20want%20to%20reserve%20GPU%20access."
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-block"
          >
            <Button
              variant="outline"
              className="rounded-xl border-green-400/30 bg-green-500/10 text-green-200 hover:bg-green-500/20"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Connect on WhatsApp
            </Button>
          </a>
        </div>

        <div className="rounded-[1.6rem] border border-white/12 bg-white/6 p-6 backdrop-blur-2xl">
          <div className="text-sm text-slate-400">Email</div>
          <div className="mt-2 text-xl font-semibold">hi@coreframecloud.com</div>
          <a href="mailto:hi@coreframecloud.com" className="mt-6 inline-block">
            <Button
              variant="outline"
              className="rounded-xl border-white/12 bg-white/6 text-white hover:bg-white/10"
            >
              <Mail className="mr-2 h-4 w-4" />
              Email Us
            </Button>
          </a>
        </div>

        <div className="rounded-[1.6rem] border border-white/12 bg-white/6 p-6 text-sm leading-7 text-slate-300 backdrop-blur-2xl">
          No availability for now. Use this form to reserve priority access
          and share your workload category.
        </div>
      </div>
    </div>
  );
}
