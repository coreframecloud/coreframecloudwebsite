import clsx from "clsx";
import { CoreframeAnimatedLogo } from "./coreframe-animated-logo";

type Props = {
  iconSize?: number;
  className?: string;
  animated?: boolean;
  compact?: boolean;
};

export function CoreframeWordmarkAtlas({
  iconSize = 56,
  className,
  animated = true,
  compact = false,
}: Props) {
  return (
    <div className={clsx("flex items-center", compact ? "gap-3" : "gap-4", className)}>
      <CoreframeAnimatedLogo size={iconSize} animated={animated} />

      <div className="leading-none">
        <div
          className={clsx(
            "font-semibold uppercase tracking-[0.14em] text-white",
            compact ? "text-[20px]" : "text-[34px]"
          )}
        >
          COREFRAME
        </div>
        <div
          className={clsx(
            "mt-2 font-semibold uppercase tracking-[0.26em] text-emerald-400",
            compact ? "text-[13px]" : "text-[18px]"
          )}
        >
          CLOUD
        </div>
      </div>
    </div>
  );
}
