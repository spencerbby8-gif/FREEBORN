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
    <div className="surface relative overflow-hidden rounded-[32px] border border-white/5 bg-white/[0.02] p-6 shadow-[var(--shadow-raised)] sm:p-8">
      <div className="flex items-center justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-6 w-12 items-center justify-center rounded-full bg-white/5 text-[11px] font-bold tracking-wider text-[var(--color-sand)]">
              {allDone ? "100%" : `${Math.round(progress)}%`}
            </span>
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[var(--color-ash)]">
              {allDone ? "Registration complete" : `Step ${clampedIndex + 1} of ${total}`}
            </span>
          </div>
          <h2 className="mt-2 text-xl font-bold text-[var(--color-pearl)]">
            {allDone ? "Welcome to Freeborn" : (onboardingStepMeta[clampedIndex]?.label ?? "Getting started")}
          </h2>
        </div>
        
        <div className="hidden items-center gap-1.5 sm:flex">
          {onboardingStepOrder.map((step, index) => {
            const state = allDone || index < clampedIndex ? "done" : index === clampedIndex ? "active" : "upcoming";
            return (
              <div 
                key={step} 
                className={`h-2 w-2 rounded-full transition-all duration-500 ${
                  state === "done" 
                    ? "bg-[var(--color-success)] shadow-[0_0_8px_rgba(109,211,176,0.4)]" 
                    : state === "active" 
                      ? "bg-[var(--color-gold-500)] shadow-[0_0_8px_rgba(217,167,82,0.4)]" 
                      : "bg-white/10"
                }`}
              />
            );
          })}
        </div>
      </div>

      <div className="mt-6 h-1 w-full overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
          style={{ width: `${progress}%`, background: "var(--gradient-ember)" }}
        />
      </div>
    </div>
  );
}
