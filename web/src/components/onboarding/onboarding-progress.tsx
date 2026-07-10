import { onboardingStepMeta, onboardingStepOrder } from "@freeborn/shared";

type OnboardingProgressProps = {
  currentIndex: number;
  total: number;
};

export function OnboardingProgress({ currentIndex, total }: OnboardingProgressProps) {
  const clampedIndex = Math.min(currentIndex, total - 1);
  const progress = total > 0 ? ((clampedIndex + 1) / total) * 100 : 0;

  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5 sm:p-6">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-stone)]">
            Step {clampedIndex + 1} of {total}
          </p>
          <p className="mt-1 text-lg font-semibold text-[var(--color-pearl)]">
            {onboardingStepMeta[clampedIndex]?.label ?? "Getting started"}
          </p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-[var(--color-stone)]">
          {Math.round(progress)}%
        </span>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/8">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[var(--color-accent-rose)] via-[var(--color-accent-gold)] to-[var(--color-accent-blue)] transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-4 flex gap-2">
        {onboardingStepOrder.map((step, index) => {
          const meta = onboardingStepMeta[index];
          const state = index < clampedIndex ? "done" : index === clampedIndex ? "active" : "upcoming";
          return (
            <div key={step} className="flex flex-1 flex-col items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold transition-all ${
                  state === "done"
                    ? "border-emerald-300/30 bg-emerald-300/12 text-emerald-200"
                    : state === "active"
                      ? "border-[var(--color-accent-gold)]/40 bg-[var(--color-accent-gold)]/12 text-[var(--color-pearl)]"
                      : "border-white/10 bg-white/[0.03] text-[var(--color-mist)]"
                }`}
              >
                {state === "done" ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20,6 9,17 4,12"/></svg>
                ) : (
                  index + 1
                )}
              </div>
              <span className={`hidden text-center text-[10px] font-semibold uppercase tracking-[0.15em] sm:block ${
                state === "active" ? "text-[var(--color-pearl)]" : state === "done" ? "text-emerald-200" : "text-[var(--color-mist)]"
              }`}>
                {meta?.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
