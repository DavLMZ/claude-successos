"use client";

import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-[var(--accent)] text-[#1a1410] hover:bg-[var(--accent-soft)] disabled:opacity-50",
  secondary:
    "bg-[var(--bg-elev)] text-[var(--text)] border border-[var(--border)] hover:border-[var(--border-strong)] disabled:opacity-50",
  ghost: "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-elev)]",
};

const sizeClasses: Record<Size, string> = {
  sm: "text-xs px-2.5 py-1.5",
  md: "text-sm px-4 py-2",
  lg: "text-base px-5 py-2.5",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors disabled:cursor-not-allowed",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
