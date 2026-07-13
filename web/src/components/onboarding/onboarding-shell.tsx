import React from "react";
import { Wordmark } from "@/components/wordmark";
import { LockIcon } from "@/components/icons";

export function OnboardingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] bg-[var(--color-night)] text-[var(--color-pearl)] flex flex-col justify-between selection:bg-[var(--color-gold-500)]/20 selection:text-[var(--color-gold-300)]">
      <header className="mx-auto flex w-full max-w-[760px] items-center justify-between px-4 pt-4 pb-2 sm:px-6 sm:pt-6">
        <Wordmark size="md" />
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-3.5 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-[var(--color-mist)] backdrop-blur">
          <LockIcon size={13} />
          Private onboarding
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-[760px] flex-1 flex-col justify-center px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>
      <footer className="mx-auto w-full max-w-[760px] px-4 pb-4 sm:px-6 sm:pb-6">
        <div className="border-t border-white/5 pt-4 text-center text-[11px] font-bold tracking-wider text-[var(--color-ash)] uppercase">
          Freeborn · Values before volume
        </div>
      </footer>
    </div>
  );
}
