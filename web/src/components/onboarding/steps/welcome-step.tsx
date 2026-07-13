"use client";

import React from "react";
import { CheckIcon } from "@/components/icons";
import { StepShell } from "../step-shell";

type WelcomeStepProps = {
  stepIndex: number;
  totalSteps: number;
  onContinue: (e?: React.FormEvent) => void;
  pending?: boolean;
  saveStatus?: string;
};

export function WelcomeStep({ stepIndex, totalSteps, onContinue, pending, saveStatus }: WelcomeStepProps) {
  const cards = [
    {
      title: "One focused task per screen",
      body: "No giant forms or overwhelming questions. Take your time shaping your identity, intentions, and values step by step.",
    },
    {
      title: "Private essentials protected",
      body: "Your exact birth date, exact coordinates, email address, and account details never appear publicly on your profile.",
    },
    {
      title: "Photo-first & verified trust",
      body: "Upload, crop, and reorder photos cleanly. Verification ensures members are recognizable and real.",
    },
  ];

  return (
    <StepShell
      stepIndex={stepIndex}
      totalSteps={totalSteps}
      title="Welcome to a calmer way to build a profile."
      subtitle="Freeborn is designed for intentional relationships. Let's build your foundation without rushing you."
      onContinue={onContinue}
      continueLabel="Start onboarding"
      pending={pending}
      saveStatus={saveStatus}
      footerTip="Your progress auto-saves safely after each completed step."
    >
      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <div key={c.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 flex flex-col justify-between">
            <div>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-gold-500)]/15 text-[var(--color-gold-300)]">
                <CheckIcon size={16} />
              </div>
              <h3 className="mt-4 text-base font-black text-[var(--color-pearl)]">{c.title}</h3>
            </div>
            <p className="mt-2 text-xs leading-5 text-[var(--color-mist)]">{c.body}</p>
          </div>
        ))}
      </div>
    </StepShell>
  );
}
