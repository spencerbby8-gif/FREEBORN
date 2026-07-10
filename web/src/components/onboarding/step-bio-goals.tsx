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
      className="inline-flex w-full items-center justify-center rounded-[22px] bg-[var(--color-pearl)] px-5 py-4 text-sm font-bold text-[var(--color-ink)] transition hover:translate-y-[-1px] hover:bg-white disabled:cursor-not-allowed disabled:opacity-70"
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
        : current.length >= 3
          ? current
          : [...current, value],
    );
  };

  return (
    <div className="grid flex-1 gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="glass-panel premium-border rounded-[36px] p-7 sm:p-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-stone)]">
          <span className="h-2 w-2 rounded-full bg-[var(--color-accent-gold)]" />
          Bio & goals
        </div>
        <h1 className="mt-5 font-[family-name:var(--font-display)] text-[clamp(2.4rem,4.5vw,3.6rem)] leading-[0.95] tracking-[-0.05em] text-[var(--color-pearl)]">
          Your voice, your intentions.
        </h1>
        <p className="mt-4 max-w-[52ch] text-base leading-7 text-[var(--color-mist)]">
          A short bio and a few relationship goals go a long way toward the right kind of
          attention.
        </p>

        <form id="bio-goals-form" action={formAction} className="mt-8 space-y-6" noValidate>
          <OnboardingTextarea
            label="Short bio"
            name="bio"
            placeholder="What do you care about? What does a good Sunday look like?"
            value={draft.bio}
            error={fieldErrors?.bio}
            hint={onboardingFieldHints.bio}
            rows={5}
            maxLength={500}
          />

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <label className="block text-sm font-semibold text-[var(--color-pearl)]">
                Relationship goals
              </label>
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-stone)]">
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
                    className={`rounded-[22px] border px-4 py-3 text-left transition ${
                      active
                        ? "border-[var(--color-accent-gold)] bg-[var(--color-accent-gold)]/15"
                        : disabled
                          ? "border-white/10 bg-white/3 opacity-60"
                          : "border-white/12 bg-white/5 hover:border-white/20"
                    }`}
                    onClick={() => toggleGoal(option.value)}
                  >
                    <p
                      className={`text-sm font-semibold ${
                        active ? "text-[var(--color-pearl)]" : "text-[var(--color-mist)]"
                      }`}
                    >
                      {option.label}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[var(--color-mist)]">
                      {option.caption}
                    </p>
                  </button>
                );
              })}
            </div>
            {goals.map((value) => (
              <input key={value} type="hidden" name="relationship_goals" value={value} />
            ))}
            {fieldErrors?.relationship_goals ? (
              <p className="text-xs font-medium leading-5 text-rose-200" role="alert">
                {fieldErrors.relationship_goals}
              </p>
            ) : null}
            <p className="text-xs leading-5 text-[var(--color-mist)]">
              {onboardingFieldHints.relationship_goals}
            </p>
          </div>

          {state && !state.ok ? (
            <div
              className="rounded-[24px] border border-rose-300/30 bg-rose-400/10 px-5 py-4 text-sm text-rose-50"
              role="alert"
            >
              {state.error}
            </div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <a
              href="/app/onboarding?step=about_you"
              className="text-sm font-semibold text-[var(--color-stone)] transition hover:text-[var(--color-pearl)]"
            >
              ← Back
            </a>
            <SubmitButton />
          </div>
        </form>
      </div>

      <div className="glass-panel premium-border rounded-[36px] p-7 sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-stone)]">
          What makes a bio land
        </p>
        <ul className="mt-6 space-y-5 text-sm leading-7 text-[var(--color-pearl)]/90">
          <li className="flex gap-4">
            <span className="mt-1 h-3 w-3 flex-shrink-0 rounded-full bg-[var(--color-accent-gold)]" />
            <span>
              Lead with what you love, not a list of requirements. Warmth opens more doors than
              bullet points.
            </span>
          </li>
          <li className="flex gap-4">
            <span className="mt-1 h-3 w-3 flex-shrink-0 rounded-full bg-[var(--color-accent-rose)]" />
            <span>
              Relationship goals shape the kind of matches Freeborn encourages. Pick the ones that
              genuinely reflect you.
            </span>
          </li>
          <li className="flex gap-4">
            <span className="mt-1 h-3 w-3 flex-shrink-0 rounded-full bg-[var(--color-accent-blue)]" />
            <span>
              You can always edit later. Onboarding is about momentum, not perfection.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
