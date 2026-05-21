import { cn } from "@/lib/utils";

type Tone = "default" | "accent" | "green" | "amber" | "red" | "blue" | "muted"
  | "eleven-agents" | "eleven-creative" | "eleven-api";

const toneClasses: Record<Tone, string> = {
  default: "bg-[var(--bg-elev)] text-[var(--text)] border-[var(--border)]",
  accent: "bg-[var(--accent)]/15 text-[var(--accent-soft)] border-[var(--accent)]/30",
  green: "bg-[var(--green)]/15 text-[var(--green)] border-[var(--green)]/30",
  amber: "bg-[var(--amber)]/15 text-[var(--amber)] border-[var(--amber)]/30",
  red: "bg-[var(--red)]/15 text-[var(--red)] border-[var(--red)]/30",
  blue: "bg-[var(--blue)]/15 text-[var(--blue)] border-[var(--blue)]/30",
  muted: "bg-[var(--bg-elev)] text-[var(--text-muted)] border-[var(--border)]",
  "eleven-agents":   "bg-[var(--eleven-agents)]/15 text-[var(--eleven-agents)] border-[var(--eleven-agents)]/30",
  "eleven-creative": "bg-[var(--eleven-creative)]/15 text-[var(--eleven-creative)] border-[var(--eleven-creative)]/30",
  "eleven-api":      "bg-[var(--eleven-api)]/15 text-[var(--eleven-api)] border-[var(--eleven-api)]/30",
};

export function Badge({
  tone = "default",
  children,
  className,
}: {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
