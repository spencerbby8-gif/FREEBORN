"use client";

import React, { useState } from "react";
import { relationshipGoalOptions, onboardingRelationshipGoalsSchema } from "@freeborn/shared";
import { OptionCardRow } from "../option-card-row";
import { StepShell } from "../step-shell";

type RelationshipIntentStepProps = {
  stepIndex: number;
  totalSteps: number;
  initialGoals: string[];
  onBack: () => void;
  onSave: (goals: string[]) => void;
  pending?: boolean;
  saveStatus?: string;
};

export function RelationshipIntentStep({
  stepIndex,
  totalSteps,
  initialGoals,
  onBack,
  onSave,
  pending,
  saveStatus,
}: RelationshipIntentStepProps) {
  const [goals, setGoals] = useState<string[]>(initialGoals);
  const [error, setError] = useState<string | null>(null);

  const handleContinue = (e?: React.FormEvent) => {
    e?.preventDefault();
    const parsed = onboardingRelationshipGoalsSchema.safeParse(goals);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Select at least one relationship intention.");
      return;
    }
    setError(null);
    onSave(parsed.data);
  };

  return (
    <StepShell
      stepIndex={stepIndex}
      totalSteps={totalSteps}
      title="Name the kind of connection you want."
      subtitle="Pick up to three intentions. Clarity helps people know what you are open to building."
      onBack={onBack}
      onContinue={handleContinue}
      pending={pending}
      saveStatus={saveStatus}
      error={error}
      footerTip="You can be serious about what you want without sounding rigid."
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <span className="text-[13px] font-bold uppercase tracking-wider text-[var(--color-sand)]">
            Relationship intentions
          </span>
          <span className="text-[11px] font-black uppercase tracking-widest text-[var(--color-ash)]">
            {goals.length}/3
          </span>
        </div>
        <OptionCardRow
          options={relationshipGoalOptions.map((o) => ({
            value: o.value,
            label: o.label,
            caption: o.caption,
          }))}
          value={goals}
          onChange={(next) => {
            setGoals(next);
            if (error) setError(null);
          }}
          max={3}
        />
      </div>
    </StepShell>
  );
}
