import { ADOPTION_STAGES, STAGE_INDEX, type AdoptionStage } from "@/lib/adoption-model";
import { cn } from "@/lib/utils";

export function AdoptionStageIndicator({
  stage,
  size = "md",
}: {
  stage: AdoptionStage;
  size?: "sm" | "md";
}) {
  const idx = STAGE_INDEX[stage];
  return (
    <div className="w-full">
      <div className="flex items-center gap-1">
        {ADOPTION_STAGES.map((s, i) => (
          <div
            key={s}
            className={cn(
              "flex-1 rounded-full",
              size === "sm" ? "h-1" : "h-1.5",
              i <= idx ? "bg-[var(--accent)]" : "bg-[var(--border)]",
            )}
            title={s}
          />
        ))}
      </div>
      {size === "md" && (
        <div className="flex items-center justify-between mt-1.5 text-[10px] text-[var(--text-dim)]">
          {ADOPTION_STAGES.map((s) => (
            <span
              key={s}
              className={cn(
                s === stage && "text-[var(--accent-soft)] font-semibold",
              )}
            >
              {s}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
