import clsx from "clsx";
import { CoreframeLogo } from "./coreframe-logo";

type CoreframeWordmarkProps = {
  iconSize?: number;
  className?: string;
  compact?: boolean;
};

export function CoreframeWordmark({
  iconSize = 64,
  className,
  compact = false,
}: CoreframeWordmarkProps) {
  return (
    <div className={clsx("flex items-center", compact ? "gap-2" : "gap-3", className)}>
      <CoreframeLogo size={iconSize} />

      <div className={clsx("leading-none", compact ? "pt-0.5" : "pt-1")}>
        <div className={clsx("font-semibold tracking-tight text-white", compact ? "text-lg" : "text-3xl")}>
          CoreFrame
        </div>
        <div
          className={clsx(
            "mt-1 font-medium text-transparent bg-gradient-to-r from-cyan-300 to-violet-400 bg-clip-text",
            compact ? "text-[11px] tracking-[0.30em]" : "text-lg tracking-[0.28em]"
          )}
        >
          CLOUD
        </div>
      </div>
    </div>
  );
}
