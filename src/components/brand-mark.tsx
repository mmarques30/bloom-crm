import { cn } from "@/lib/utils";

export function BrandMark({ className, showWord = true }: { className?: string; showWord?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        <StarSpark className="h-4 w-4" />
      </div>
      {showWord && (
        <div className="flex flex-col leading-none">
          <span className="font-display text-xl tracking-tight">star crm</span>
          <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">creative ops</span>
        </div>
      )}
    </div>
  );
}

export function StarSpark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M12 2c.6 4.8 2.6 6.8 7.4 7.4-4.8.6-6.8 2.6-7.4 7.4-.6-4.8-2.6-6.8-7.4-7.4C9.4 8.8 11.4 6.8 12 2Z"
        fill="currentColor"
      />
      <circle cx="19" cy="19" r="1.6" fill="currentColor" opacity=".8" />
    </svg>
  );
}
