import { Wordmark } from "@/components/wordmark";
import { LockIcon } from "@/components/icons";

export function OnboardingShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[var(--color-night)]">
      <div className="aurora-field" />
      <div className="pointer-events-none absolute inset-0 grid-lines opacity-20" />
      <div className="orb drift absolute -left-32 -top-32 h-[620px] w-[620px] rounded-full bg-[rgba(239,94,94,0.11)] blur-[120px]" />
      <div className="orb drift-alt absolute -right-28 top-8 h-[680px] w-[680px] rounded-full bg-[rgba(138,110,242,0.12)] blur-[135px]" />
      <div className="orb drift-slow absolute bottom-[-220px] left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-[rgba(79,184,167,0.08)] blur-[120px]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1280px] flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between gap-4 py-3 sm:py-5">
          <Wordmark size="md" />
          <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-[var(--color-mist)] backdrop-blur-xl sm:flex">
            <LockIcon size={14} />
            Private onboarding
          </div>
        </header>

        <section className="flex flex-1 flex-col pb-8 pt-3 sm:pb-10 lg:pb-12">{children}</section>
      </div>
    </main>
  );
}
