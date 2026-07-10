import { Wordmark } from "@/components/wordmark";
import { OnboardingProgress } from "./onboarding-progress";
import { onboardingStepOrder } from "@freeborn/shared";

type OnboardingShellProps = {
  step: string;
  children: React.ReactNode;
};

export function OnboardingShell({ step, children }: OnboardingShellProps) {
  const currentIndex = Math.max(
    0,
    onboardingStepOrder.findIndex((item) => item === step),
  );

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 hero-grid opacity-30" />
      <div className="orb absolute left-[8%] top-20 h-56 w-56 rounded-full bg-[rgba(255,133,120,0.16)]" />
      <div className="orb orb-alt absolute right-[10%] top-12 h-72 w-72 rounded-full bg-[rgba(140,207,255,0.15)]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1280px] flex-col px-6 py-6 sm:px-8 lg:px-10">
        <header className="glass-panel premium-border flex items-center justify-between rounded-full px-4 py-3 sm:px-6">
          <Wordmark />
          <span className="hidden rounded-full border border-white/12 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-stone)] sm:inline-flex">
            Phase 2 · Onboarding
          </span>
        </header>

        <section className="mt-8 flex flex-1 flex-col gap-8 pb-12 lg:mt-12">
          <OnboardingProgress currentIndex={currentIndex} total={onboardingStepOrder.length} />
          {children}
        </section>
      </div>
    </main>
  );
}
