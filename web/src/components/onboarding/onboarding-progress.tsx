"use client";

import { onboardingStepMeta, onboardingStepOrder } from "@freeborn/shared";
import { CheckIcon } from "@/components/icons";

type OnboardingProgressProps = {
  currentIndex: number;
  total: number;
};

export function OnboardingProgress({ currentIndex, total }: OnboardingProgressProps) {
  const clampedIndex = Math.min(currentIndex, total - 1);
  const allDone = currentIndex >= total;
  const progress = allDone ? 100 : total > 0 ? ((clampedIndex + 1) / total) * 100 : 0;

  return (
    <div className="surface rounded-2xl border border-white/8 bg-white/[0.03] p-5 sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--color-stone)]">
            {allDone ? "Complete" : `Step ${clampedIndex + 1} of ${total}`}
          </p>
          <p className="mt-1 text-lg font-semibold text-[var(--color-pearl)]">
            {allDone ? "All set" : (onboardingStepMeta[clampedIndex]?.label ?? "Getting started")}
          </p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-[var(--color-stone)]">
          {Math.round(progress)}%
        </span>
      </div>

      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${progress}%`, background: "var(--gradient-ember)" }}
        />
      </div>

      <div className="mt-4 flex gap-2">
        {onboardingStepOrder.map((step, index) => {
          const meta = onboardingStepMeta[index];
          const state = allDone || index < clampedIndex ? "done" : index === clampedIndex ? "active" : "upcoming";
          return (
            <div key={step} className="flex flex-1 flex-col items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold transition-all duration-300 ${
                  state === "done"
                    ? "border-[var(--color-success)]/40 bg-[var(--color-success)]/15 text-[var(--color-success)]"
                    : state === "active"
                      ? "border-[var(--color-gold-500)]/50 bg-[var(--color-gold-500)]/15 text-[var(--color-pearl)]"
                      : "border-white/10 bg-white/[0.03] text-[var(--color-mist)]"
                }`}
              >
                {state === "done" ? <CheckIcon size={13} /> : index + 1}
              </div>
              <span
                className={`hidden text-center text-[10px] font-semibold uppercase tracking-[0.15em] sm:block ${
                  state === "active"
                    ? "text-[var(--color-pearl)]"
                    : state === "done"
                      ? "text-[var(--color-success)]"
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
  );
}
