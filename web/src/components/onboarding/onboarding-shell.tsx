import { Wordmark } from "@/components/wordmark";

export function OnboardingShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--color-night)]">
      {/* Background Elements */}
      <div className="aurora-field" />
      <div className="pointer-events-none absolute inset-0 grid-lines opacity-20" />
      <div className="orb drift absolute -left-24 -top-24 h-[500px] w-[500px] rounded-full bg-[rgba(239,94,94,0.1)] blur-[100px]" />
      <div className="orb drift-alt absolute -right-24 top-10 h-[600px] w-[600px] rounded-full bg-[rgba(138,110,242,0.1)] blur-[120px]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[800px] flex-col px-6 py-6 sm:px-8 lg:px-10">
        <header className="flex items-center justify-center py-6">
          <Wordmark size="md" />
        </header>

        <section className="flex flex-1 flex-col py-8 lg:py-12 animate-fade-in">{children}</section>
      </div>
    </main>
  );
}
