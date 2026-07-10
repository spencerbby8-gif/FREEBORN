"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { dealBreakerOptions, onboardingFieldHints } from "@freeborn/shared";
import { saveOnboardingPreferencesExtras } from "@/lib/onboarding/actions";
import { OnboardingTextInput } from "./onboarding-field";
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

export function StepPreferencesExtras({
  draft
}: {
  draft: { deal_breakers: string[]; occupation: string; education: string };
}) {
  const [state, formAction] = useActionState(saveOnboardingPreferencesExtras, null);
  const [dealBreakers, setDealBreakers] = useState<string[]>(draft.deal_breakers);

  return (
    <div className="grid flex-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-6 sm:p-8">
        <h1 className="font-[family-name:var(--font-display)] text-[clamp(2rem,4vw,3.2rem)] leading-[0.95] tracking-[-0.05em] text-[var(--color-pearl)]">
          The finer details.
        </h1>
        <p className="mt-3 max-w-lg text-base leading-7 text-[var(--color-mist)]">
          Deal breakers keep discovery honest. Occupation and education are optional but add texture.
        </p>

        <form action={formAction} className="mt-8 space-y-6" noValidate>
          <ChipSelect
            label="Deal breakers"
            options={dealBreakerOptions}
            value={dealBreakers}
            max={12}
            optional
            error={state?.fieldErrors?.deal_breakers}
            hint={onboardingFieldHints.deal_breakers}
            onChange={setDealBreakers}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <OnboardingTextInput
              label="Occupation"
              name="occupation"
              placeholder="What do you do?"
              defaultValue={draft.occupation}
              error={state?.fieldErrors?.occupation}
              hint={onboardingFieldHints.occupation}
              optional
            />
            <OnboardingTextInput
              label="Education"
              name="education"
              placeholder="Where did you study?"
              defaultValue={draft.education}
              error={state?.fieldErrors?.education}
              hint={onboardingFieldHints.education}
              optional
            />
          </div>

          {dealBreakers.map((value) => (
            <input key={`deal-${value}`} type="hidden" name="deal_breakers" value={value} />
          ))}

          {state && !state.ok ? (
            <div className="rounded-2xl border border-red-300/20 bg-red-400/10 px-5 py-4 text-sm text-red-200" role="alert">
              {state.error}
            </div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <a href="/app/onboarding?step=interests_lifestyle" className="text-sm font-semibold text-[var(--color-stone)] transition hover:text-[var(--color-pearl)]">
              ← Back
            </a>
            <SubmitButton />
          </div>
        </form>
      </div>

      <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-stone)]">Almost there</p>
        <ul className="mt-6 space-y-5 text-sm leading-7 text-[var(--color-pearl)]/90">
          <li className="flex gap-3">
            <span className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-400/20 to-amber-400/10 text-xs font-bold text-[var(--color-accent-rose)]">1</span>
            <span>Deal breakers are optional but powerful. They help Freeborn skip the matches that would never work.</span>
          </li>
          <li className="flex gap-3">
            <span className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-400/20 to-violet-400/10 text-xs font-bold text-[var(--color-accent-blue)]">2</span>
            <span>Occupation and education are optional. Share them if you&apos;d like, or skip them for now.</span>
          </li>
          <li className="flex gap-3">
            <span className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400/20 to-emerald-400/10 text-xs font-bold text-[var(--color-accent-gold)]">3</span>
            <span>When you continue, we&apos;ll mark your profile ready and take you into the app.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
