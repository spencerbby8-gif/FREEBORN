"use client";

import { premiumOnboardingStepMeta } from "@freeborn/shared";
import { CheckIcon } from "@/components/icons";

type OnboardingProgressProps = {
  currentIndex: number;
  total: number;
};

export function OnboardingProgress({ currentIndex, total }: OnboardingProgressProps) {
  const clampedIndex = Math.min(Math.max(currentIndex, 0), total - 1);
  const progress = total > 1 ? (clampedIndex / (total - 1)) * 100 : 100;
  const meta = premiumOnboardingStepMeta[clampedIndex];

  return (
    <div className="surface relative overflow-hidden rounded-[28px] border border-white/5 bg-white/[0.02] p-4 shadow-[var(--shadow-raised)] sm:rounded-[32px] sm:p-6">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex h-6 items-center justify-center rounded-full bg-white/5 px-3 text-[11px] font-black tracking-wider text-[var(--color-sand)]">
              {Math.round(progress)}%
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.24em] text-[var(--color-ash)] sm:text-[11px]">
              Step {clampedIndex + 1} of {total}
            </span>
            <span className="hidden h-1 w-1 rounded-full bg-white/20 sm:block" />
            <span className="hidden text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-mist)] sm:block">
              Autosave on
            </span>
          </div>
          <h2 className="mt-2 truncate text-lg font-black text-[var(--color-pearl)] sm:text-xl">
            {meta?.label ?? "Onboarding"}
          </h2>
        </div>

        <div className="hidden items-center gap-1.5 md:flex">
          {premiumOnboardingStepMeta.map((step, index) => {
            const state = index < clampedIndex ? "done" : index === clampedIndex ? "active" : "upcoming";
            return (
              <div key={step.step} className="group relative">
                <div
                  className={`h-2.5 rounded-full transition-all duration-500 ${
                    state === "done"
                      ? "w-6 bg-[var(--color-success)] shadow-[0_0_12px_rgba(109,211,176,0.35)]"
                      : state === "active"
                        ? "w-8 bg-[var(--color-gold-500)] shadow-[0_0_12px_rgba(217,167,82,0.4)]"
                        : "w-2.5 bg-white/10"
                  }`}
                />
                {state === "done" ? <CheckIcon size={10} className="absolute left-2 top-0.5 text-[var(--color-ink)]" strokeWidth={3} /> : null}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${progress}%`, background: "var(--gradient-ember)" }}
        />
      </div>
      <p className="mt-3 line-clamp-2 text-xs leading-5 text-[var(--color-mist)] sm:text-[13px]">
        {meta?.description}
      </p>
    </div>
  );
}
