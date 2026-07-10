"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { onboardingFieldHints, relationshipGoalOptions } from "@freeborn/shared";
import { saveOnboardingBioGoals } from "@/lib/onboarding/actions";
import { OnboardingTextarea } from "./onboarding-field";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full items-center justify-center rounded-2xl bg-[var(--color-pearl)] px-5 py-4 text-sm font-bold text-[var(--color-ink)] transition-all hover:bg-white hover:translate-y-[-1px] hover:shadow-[0_12px_30px_rgba(247,241,232,0.1)] disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "Saving…" : "Continue"}
    </button>
  );
}

export function StepBioGoals({
  draft,
  fieldErrors,
}: {
  draft: { bio: string; relationship_goals: string[] };
  fieldErrors?: Record<string, string>;
}) {
  const [state, formAction] = useActionState(saveOnboardingBioGoals, null);
  const [goals, setGoals] = useState<string[]>(draft.relationship_goals);

  const toggleGoal = (value: string) => {
    setGoals((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : current.length >= 3 ? current : [...current, value],
    );
  };

  return (
    <div className="grid flex-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-6 sm:p-8">
        <h1 className="font-[family-name:var(--font-display)] text-[clamp(2rem,4vw,3.2rem)] leading-[0.95] tracking-[-0.05em] text-[var(--color-pearl)]">
          Your voice, your intentions.
        </h1>
        <p className="mt-3 max-w-lg text-base leading-7 text-[var(--color-mist)]">
          A short bio and a few relationship goals go a long way toward the right kind of attention.
        </p>

        <form id="bio-goals-form" action={formAction} className="mt-8 space-y-6" noValidate>
          <OnboardingTextarea
            label="Short bio"
            name="bio"
            placeholder="What do you care about? What does a good Sunday look like?"
            defaultValue={draft.bio}
            error={state?.fieldErrors?.bio}
            hint={onboardingFieldHints.bio}
            rows={4}
            maxLength={500}
          />

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <label className="block text-sm font-semibold text-[var(--color-pearl)]">Relationship goals</label>
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--color-stone)]">
                {goals.length}/3
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {relationshipGoalOptions.map((option) => {
                const active = goals.includes(option.value);
                const disabled = !active && goals.length >= 3;
                return (
                  <button
                    key={option.value}
                    type="button"
                    disabled={disabled}
                    aria-pressed={active}
                    className={`rounded-2xl border px-4 py-3 text-left transition-all ${
                      active
                        ? "border-[var(--color-accent-gold)]/40 bg-[var(--color-accent-gold)]/10"
                        : disabled
                          ? "border-white/8 bg-white/[0.02] opacity-50"
                          : "border-white/8 bg-white/[0.03] hover:border-white/16"
                    }`}
                    onClick={() => toggleGoal(option.value)}
                  >
                    <p className={`text-sm font-semibold ${active ? "text-[var(--color-pearl)]" : "text-[var(--color-mist)]"}`}>
                      {option.label}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[var(--color-mist)]">{option.caption}</p>
                  </button>
                );
              })}
            </div>
            {goals.map((value) => (
              <input key={value} type="hidden" name="relationship_goals" value={value} />
            ))}
            {fieldErrors?.relationship_goals ? (
              <p className="text-xs font-medium leading-5 text-red-200" role="alert">{fieldErrors.relationship_goals}</p>
            ) : null}
          </div>

          {state && !state.ok ? (
            <div className="rounded-2xl border border-red-300/20 bg-red-400/10 px-5 py-4 text-sm text-red-200" role="alert">
              {state.error}
            </div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <a href="/app/onboarding?step=about_you" className="text-sm font-semibold text-[var(--color-stone)] transition hover:text-[var(--color-pearl)]">
              ← Back
            </a>
            <SubmitButton />
          </div>
        </form>
      </div>

      <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-stone)]">What makes a bio land</p>
        <ul className="mt-6 space-y-5 text-sm leading-7 text-[var(--color-pearl)]/90">
          <li className="flex gap-3">
            <span className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400/20 to-emerald-400/10 text-xs font-bold text-[var(--color-accent-gold)]">1</span>
            <span>Lead with what you love, not a list of requirements. Warmth opens more doors than bullet points.</span>
          </li>
          <li className="flex gap-3">
            <span className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-400/20 to-amber-400/10 text-xs font-bold text-[var(--color-accent-rose)]">2</span>
            <span>Relationship goals shape the kind of matches Freeborn encourages. Pick the ones that genuinely reflect you.</span>
          </li>
          <li className="flex gap-3">
            <span className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-400/20 to-violet-400/10 text-xs font-bold text-[var(--color-accent-blue)]">3</span>
            <span>You can always edit later. Onboarding is about momentum, not perfection.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
