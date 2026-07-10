"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { interestOptions, lifestyleOptions, onboardingFieldHints } from "@freeborn/shared";
import { saveOnboardingInterestsLifestyle } from "@/lib/onboarding/actions";
import { ChipSelect } from "./chip-select";

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

export function StepInterestsLifestyle({
  draft,
  fieldErrors,
}: {
  draft: { interests: string[]; lifestyle_preferences: string[] };
  fieldErrors?: Record<string, string>;
}) {
  const [state, formAction] = useActionState(saveOnboardingInterestsLifestyle, null);
  const [interests, setInterests] = useState<string[]>(draft.interests);
  const [lifestyle, setLifestyle] = useState<string[]>(draft.lifestyle_preferences);

  return (
    <div className="grid flex-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-6 sm:p-8">
        <h1 className="font-[family-name:var(--font-display)] text-[clamp(2rem,4vw,3.2rem)] leading-[0.95] tracking-[-0.05em] text-[var(--color-pearl)]">
          What lights you up?
        </h1>
        <p className="mt-3 max-w-lg text-base leading-7 text-[var(--color-mist)]">
          These are the details that spark conversation and help discovery feel human.
        </p>

        <form action={formAction} className="mt-8 space-y-6" noValidate>
          <ChipSelect
            label="Interests"
            options={interestOptions}
            value={interests}
            max={12}
            error={fieldErrors?.interests}
            hint={onboardingFieldHints.interests}
            onChange={setInterests}
          />

          <ChipSelect
            label="Lifestyle"
            options={lifestyleOptions}
            value={lifestyle}
            max={12}
            error={fieldErrors?.lifestyle_preferences}
            hint={onboardingFieldHints.lifestyle_preferences}
            onChange={setLifestyle}
          />

          {interests.map((value) => (
            <input key={`interest-${value}`} type="hidden" name="interests" value={value} />
          ))}
          {lifestyle.map((value) => (
            <input key={`lifestyle-${value}`} type="hidden" name="lifestyle_preferences" value={value} />
          ))}

          {state && !state.ok ? (
            <div className="rounded-2xl border border-red-300/20 bg-red-400/10 px-5 py-4 text-sm text-red-200" role="alert">
              {state.error}
            </div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <a href="/app/onboarding?step=bio_goals" className="text-sm font-semibold text-[var(--color-stone)] transition hover:text-[var(--color-pearl)]">
              ← Back
            </a>
            <SubmitButton />
          </div>
        </form>
      </div>

      <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-stone)]">Why these matter</p>
        <ul className="mt-6 space-y-5 text-sm leading-7 text-[var(--color-pearl)]/90">
          <li className="flex gap-3">
            <span className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400/20 to-teal-400/10 text-xs font-bold text-[var(--color-accent-mint)]">1</span>
            <span>Interests power conversation starters. The more specific you are, the better the opening messages feel.</span>
          </li>
          <li className="flex gap-3">
            <span className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-400/20 to-pink-400/10 text-xs font-bold text-[var(--color-accent-lilac)]">2</span>
            <span>Lifestyle preferences help surface people whose rhythm matches yours — from early birds to night owls.</span>
          </li>
          <li className="flex gap-3">
            <span className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400/20 to-emerald-400/10 text-xs font-bold text-[var(--color-accent-gold)]">3</span>
            <span>You can always add more later. Think of this as the opening chapter, not the whole book.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
