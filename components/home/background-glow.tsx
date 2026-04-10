export function BackgroundGlow() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute left-1/2 top-0 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="absolute left-[8%] top-[26rem] h-72 w-72 rounded-full bg-blue-500/8 blur-3xl" />
      <div className="absolute right-[8%] top-[10rem] h-80 w-80 rounded-full bg-indigo-500/8 blur-3xl" />
    </div>
  );
}
