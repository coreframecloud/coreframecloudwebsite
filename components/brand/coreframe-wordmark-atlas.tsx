import clsx from "clsx";

type Props = {
  iconSize?: number;
  className?: string;
  animated?: boolean;
  compact?: boolean;
};

export function CoreframeWordmarkAtlas({
  iconSize = 56,
  className,
  compact = false,
}: Props) {
  const fontSize = compact ? 20 : Math.max(28, Math.round(iconSize * 0.4));

  return (
    <div
      aria-label="COREFRAME"
      className={clsx(
        "inline-flex items-center gap-0 leading-none",
        "font-semibold uppercase tracking-[0.06em]",
        className
      )}
      style={{ fontSize }}
    >
      {/* -mr compensates for trailing letter-spacing on "E" so E and F nearly touch */}
      <span className="text-white -mr-[0.06em]">CORE</span>
      <span className="text-[#2D7FF9]">FRAME</span>
    </div>
  );
}
