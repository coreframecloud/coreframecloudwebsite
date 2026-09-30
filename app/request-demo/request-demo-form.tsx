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

    // eslint-disable-next-line react-hooks/set-state-in-effect
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
    <div className="mt-10 grid gap-6 md:mt-12 md:grid-cols-[1.15fr_0.85fr] md:gap-8">
      <div className="rounded-cf border border-rule bg-paper-2 p-5 sm:p-6 md:p-8">
        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <label htmlFor="rd-email" className="text-[13px] font-medium text-ink">
              Work email
            </label>
            <Input
              id="rd-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 rounded-cf border-rule bg-paper text-base text-ink placeholder:text-ink-3 md:text-sm"
              placeholder="you@studio.com"
            />
          </div>

          <div className="grid gap-1.5">
            <label htmlFor="rd-mobile" className="text-[13px] font-medium text-ink">
              Mobile number
            </label>
            <Input
              id="rd-mobile"
              type="tel"
              inputMode="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="h-11 rounded-cf border-rule bg-paper text-base text-ink placeholder:text-ink-3 md:text-sm"
              placeholder="98765 43210"
            />
          </div>

          <div className="grid gap-1.5">
            <label htmlFor="rd-workload" className="text-[13px] font-medium text-ink">
              What do you run?
            </label>
            <select
              id="rd-workload"
              value={workload}
              onChange={(e) => setWorkload(e.target.value)}
              className="h-11 w-full rounded-cf border border-rule bg-paper px-3 text-base text-ink outline-none focus:border-blue md:text-sm"
            >
              <option>RTX / 3D Rendering</option>
              <option>AI / Linux Workloads</option>
            </select>
          </div>

          <div className="grid gap-1.5">
            <label htmlFor="rd-gpu" className="text-[13px] font-medium text-ink">
              Selected GPU <span className="text-ink-3">(optional)</span>
            </label>
            <Input
              id="rd-gpu"
              value={gpu}
              onChange={(e) => setGpu(e.target.value)}
              className="h-11 rounded-cf border-rule bg-paper text-base text-ink placeholder:text-ink-3 md:text-sm"
              placeholder="RTX 5090"
            />
          </div>

          <Button
            onClick={handleWhatsAppSubmit}
            className="cf-btn-primary mt-1 min-h-11 w-full sm:w-auto sm:justify-self-start"
          >
            Send on WhatsApp
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        <div className="rounded-cf border border-rule bg-paper-2 p-5 sm:p-6">
          <p className="cf-eyebrow">WhatsApp</p>
          <div className="mt-2 text-xl font-semibold break-words text-ink">
            Send the scene and the deadline.
          </div>
          <a
            href="https://wa.me/916366889488?text=Hi%20Coreframe%20Cloud%2C%20I%20want%20to%20reserve%20GPU%20access."
            target="_blank"
            rel="noreferrer"
            className="mt-5 block"
          >
            <Button
              variant="outline"
              className="cf-btn-secondary min-h-11 w-full sm:w-auto"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Connect on WhatsApp
            </Button>
          </a>
        </div>

        <div className="rounded-cf border border-rule bg-paper-2 p-5 sm:p-6">
          <p className="cf-eyebrow">Email</p>
          <div className="mt-2 text-xl font-semibold break-words text-ink">
            admin@coreframecloud.com
          </div>
          <a href="mailto:admin@coreframecloud.com" className="mt-5 block">
            <Button
              variant="outline"
              className="cf-btn-secondary min-h-11 w-full sm:w-auto"
            >
              <Mail className="mr-2 h-4 w-4" />
              Email us
            </Button>
          </a>
        </div>

        <div className="rounded-cf border border-rule bg-paper-2 p-5 text-sm leading-7 text-ink-2 sm:p-6">
          No availability for now. Use this form to reserve priority access
          and share your workload category.
        </div>
      </div>
    </div>
  );
}
