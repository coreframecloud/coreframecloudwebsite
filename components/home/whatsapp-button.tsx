"use client";

import { MessageCircle } from "lucide-react";

export function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/916366889488?text=Hi%20Coreframe%20Cloud%2C%20I%20want%20to%20discuss%20a%20GPU%20workstation%20or%20compute%20requirement."
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-50"
    >
      <div className="relative">
        <span className="absolute inset-0 animate-ping rounded-full bg-green-400 opacity-30" />
        <span className="absolute -inset-1 rounded-full bg-green-400/20 blur-md" />
        <div className="relative flex items-center gap-3 rounded-full border border-green-300/30 bg-green-500 px-5 py-3 text-white shadow-2xl shadow-green-500/30 transition duration-200 hover:scale-105 hover:bg-green-400">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-green-500">
            <MessageCircle className="h-5 w-5" />
          </div>
          <div className="pr-1">
            <div className="text-xs font-medium leading-none text-green-50/90">
              Chat with us
            </div>
            <div className="mt-1 text-sm font-semibold leading-none">
              WhatsApp
            </div>
          </div>
        </div>
      </div>
    </a>
  );
}
