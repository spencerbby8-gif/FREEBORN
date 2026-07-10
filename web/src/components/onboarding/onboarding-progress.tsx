import { onboardingStepMeta, onboardingStepOrder } from "@freeborn/shared";

type OnboardingProgressProps = {
  currentIndex: number;
  total: number;
};

export function OnboardingProgress({ currentIndex, total }: OnboardingProgressProps) {
  const clampedIndex = Math.min(currentIndex, total - 1);
  const progress = total > 0 ? ((clampedIndex + 1) / total) * 100 : 0;

  return (
    <div className="glass-panel premium-border rounded-[32px] p-6 sm:p-8">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-stone)]">
              Step {clampedIndex + 1} of {total}
            </p>
            <p className="mt-2 text-lg font-semibold text-[var(--color-pearl)]">
              {onboardingStepMeta[clampedIndex]?.label ?? "Onboarding"}
            </p>
          </div>
          <span className="rounded-full border border-white/12 bg-white/6 px-3 py-1.5 text-xs font-semibold text-[var(--color-stone)]">
            {Math.round(progress)}% complete
          </span>
        </div>

        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/8">
          <div
            className="h-full rounded-full bg-[var(--gradient-hero)] transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="grid grid-cols-5 gap-2">
          {onboardingStepOrder.map((step, index) => {
            const meta = onboardingStepMeta[index];
            const state =
              index < clampedIndex ? "done" : index === clampedIndex ? "active" : "upcoming";
            return (
              <div key={step} className="flex flex-col items-center gap-2">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full border text-xs font-bold transition ${
                    state === "done"
                      ? "border-emerald-300/40 bg-emerald-300/15 text-emerald-50"
                      : state === "active"
                        ? "border-[var(--color-accent-gold)] bg-[var(--color-accent-gold)]/15 text-[var(--color-pearl)]"
                        : "border-white/10 bg-white/4 text-[var(--color-mist)]"
                  }`}
                >
                  {state === "done" ? "✓" : index + 1}
                </div>
                <span
                  className={`hidden text-center text-[11px] font-semibold uppercase tracking-[0.18em] sm:block ${
                    state === "active"
                      ? "text-[var(--color-pearl)]"
                      : state === "done"
                        ? "text-emerald-100"
                        : "text-[var(--color-mist)]"
                  }`}
                >
                  {meta?.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
