import { Cloud } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-8 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
            <Cloud className="h-4 w-4" />
          </div>
          <div>
            <div className="font-semibold">Coreframe Cloud</div>
            <div className="text-sm text-slate-400">
              GPU Infrastructure for Design, Render & Compute
            </div>
          </div>
        </div>
        <div className="text-sm text-slate-500">
          © 2026 Coreframe Cloud. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
