import clsx from "clsx";
import { CoreframeAnimatedLogo } from "./coreframe-animated-logo";

type CoreframeWordmarkAnimatedProps = {
  iconSize?: number;
  className?: string;
  compact?: boolean;
  animated?: boolean;
};

export function CoreframeWordmarkAnimated({
  iconSize = 64,
  className,
  compact = false,
  animated = true,
}: CoreframeWordmarkAnimatedProps) {
  return (
    <div className={clsx("flex items-center", compact ? "gap-2.5" : "gap-4", className)}>
      <CoreframeAnimatedLogo size={iconSize} animated={animated} />

      <div className={clsx("leading-none", compact ? "pt-0.5" : "pt-1")}>
        <div className={clsx("font-semibold tracking-tight text-white", compact ? "text-xl" : "text-4xl")}>
          CoreFrame
        </div>
        <div
          className={clsx(
            "mt-1 font-medium text-transparent bg-gradient-to-r from-cyan-300 to-violet-400 bg-clip-text",
            compact ? "text-[13px] tracking-[0.30em]" : "text-xl tracking-[0.28em]"
          )}
        >
          CLOUD
        </div>
      </div>
    </div>
  );
}
