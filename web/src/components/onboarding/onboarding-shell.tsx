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
      <div className="pointer-events-none absolute inset-0 hero-grid opacity-25" />
      <div className="orb absolute -left-20 -top-20 h-72 w-72 rounded-full bg-[rgba(255,133,120,0.12)]" />
      <div className="orb orb-alt absolute -right-20 top-10 h-80 w-80 rounded-full bg-[rgba(140,207,255,0.10)]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1280px] flex-col px-6 py-6 sm:px-8 lg:px-10">
        <header className="glass-panel premium-border flex items-center justify-between rounded-full px-4 py-3 sm:px-6">
          <Wordmark />
        </header>

        <section className="mt-6 flex flex-1 flex-col gap-6 pb-12 lg:mt-10">
          <OnboardingProgress currentIndex={currentIndex} total={onboardingStepOrder.length} />
          <div className="animate-fade-in">{children}</div>
        </section>
      </div>
    </main>
  );
}
