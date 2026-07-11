import { Wordmark } from "@/components/wordmark";

export function OnboardingShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="aurora-field" />
      <div className="pointer-events-none absolute inset-0 hero-grid opacity-25" />
      <div className="orb drift absolute -left-24 -top-24 h-80 w-80 rounded-full bg-[rgba(239,94,94,0.14)] blur-[2px]" />
      <div className="orb drift-alt absolute -right-24 top-10 h-96 w-96 rounded-full bg-[rgba(138,110,242,0.13)] blur-[2px]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[760px] flex-col px-6 py-6 sm:px-8 lg:px-10">
        <header className="surface ring-pearl flex items-center justify-between rounded-full px-4 py-3 sm:px-6">
          <Wordmark />
        </header>

        <section className="flex flex-1 flex-col py-8 lg:py-10">{children}</section>
      </div>
    </main>
  );
}
