"use client";

import { useActionState } from "react";
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
      className="inline-flex w-full items-center justify-center rounded-[22px] bg-[var(--color-pearl)] px-5 py-4 text-sm font-bold text-[var(--color-ink)] transition hover:translate-y-[-1px] hover:bg-white disabled:cursor-not-allowed disabled:opacity-70"
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

  return (
    <div className="grid flex-1 gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="glass-panel premium-border rounded-[36px] p-7 sm:p-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-stone)]">
          <span className="h-2 w-2 rounded-full bg-[var(--color-accent-gold)]" />
          Interests & lifestyle
        </div>
        <h1 className="mt-5 font-[family-name:var(--font-display)] text-[clamp(2.4rem,4.5vw,3.6rem)] leading-[0.95] tracking-[-0.05em] text-[var(--color-pearl)]">
          What lights you up?
        </h1>
        <p className="mt-4 max-w-[52ch] text-base leading-7 text-[var(--color-mist)]">
          These are the details that spark conversation and help discovery feel human.
        </p>

        <form action={formAction} className="mt-8 space-y-6" noValidate>
          <ChipSelect
            label="Interests"
            options={interestOptions}
            value={draft.interests}
            max={12}
            error={fieldErrors?.interests}
            hint={onboardingFieldHints.interests}
            onChange={(next) => {
              const form = document.getElementById(
                "interests-form",
              ) as HTMLFormElement | null;
              if (!form) return;
              form
                .querySelectorAll('input[name="interests"]')
                .forEach((node) => node.remove());
              const fragment = document.createDocumentFragment();
              next.forEach((item) => {
                const input = document.createElement("input");
                input.type = "hidden";
                input.name = "interests";
                input.value = item;
                fragment.appendChild(input);
              });
              form.appendChild(fragment);
            }}
          />

          <ChipSelect
            label="Lifestyle"
            options={lifestyleOptions}
            value={draft.lifestyle_preferences}
            max={12}
            error={fieldErrors?.lifestyle_preferences}
            hint={onboardingFieldHints.lifestyle_preferences}
            onChange={(next) => {
              const form = document.getElementById(
                "interests-form",
              ) as HTMLFormElement | null;
              if (!form) return;
              form
                .querySelectorAll('input[name="lifestyle_preferences"]')
                .forEach((node) => node.remove());
              const fragment = document.createDocumentFragment();
              next.forEach((item) => {
                const input = document.createElement("input");
                input.type = "hidden";
                input.name = "lifestyle_preferences";
                input.value = item;
                fragment.appendChild(input);
              });
              form.appendChild(fragment);
            }}
          />

          {draft.interests.map((value) => (
            <input key={`interest-${value}`} type="hidden" name="interests" value={value} />
          ))}
          {draft.lifestyle_preferences.map((value) => (
            <input key={`lifestyle-${value}`} type="hidden" name="lifestyle_preferences" value={value} />
          ))}

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
              href="/app/onboarding?step=bio_goals"
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
          Why these matter
        </p>
        <ul className="mt-6 space-y-5 text-sm leading-7 text-[var(--color-pearl)]/90">
          <li className="flex gap-4">
            <span className="mt-1 h-3 w-3 flex-shrink-0 rounded-full bg-[var(--color-accent-mint)]" />
            <span>
              Interests power conversation starters. The more specific you are, the better the
              opening messages feel.
            </span>
          </li>
          <li className="flex gap-4">
            <span className="mt-1 h-3 w-3 flex-shrink-0 rounded-full bg-[var(--color-accent-lilac)]" />
            <span>
              Lifestyle preferences help surface people whose rhythm matches yours — from early
              birds to night owls.
            </span>
          </li>
          <li className="flex gap-4">
            <span className="mt-1 h-3 w-3 flex-shrink-0 rounded-full bg-[var(--color-accent-gold)]" />
            <span>
              You can always add more later. Think of this as the opening chapter, not the whole
              book.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
