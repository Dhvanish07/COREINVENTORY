import { cn } from "@/lib/utils";

export function Badge({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-cyan-400/30 px-2.5 py-1 text-xs text-cyan-200",
        className
      )}
    >
      {children}
    </span>
  );
}