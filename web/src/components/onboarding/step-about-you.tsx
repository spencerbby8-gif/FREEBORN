"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { genderOptions, onboardingFieldHints } from "@freeborn/shared";
import { saveOnboardingAboutYou } from "@/lib/onboarding/actions";
import { OnboardingSelect, OnboardingTextInput } from "./onboarding-field";

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

export function StepAboutYou({
  draft
}: {
  draft: { gender: string; city: string; region: string; country_code: string };
}) {
  const [state, formAction] = useActionState(saveOnboardingAboutYou, null);

  return (
    <div className="grid flex-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-6 sm:p-8">
        <h1 className="font-[family-name:var(--font-display)] text-[clamp(2rem,4vw,3.2rem)] leading-[0.95] tracking-[-0.05em] text-[var(--color-pearl)]">
          Where you are, how you identify.
        </h1>
        <p className="mt-3 max-w-lg text-base leading-7 text-[var(--color-mist)]">
          These details shape who discovers you. You can refine them any time from your profile.
        </p>

        <form action={formAction} className="mt-8 space-y-5" noValidate>
          <OnboardingSelect
            label="Gender"
            name="gender"
            defaultValue={draft.gender}
            error={state?.fieldErrors?.gender}
            hint={onboardingFieldHints.gender}
            options={[
              { value: "", label: "Select how you identify" },
              ...genderOptions.map((option) => ({ value: option.value, label: option.label })),
            ]}
          />
          <OnboardingTextInput
            label="City"
            name="city"
            placeholder="Where do you live?"
            defaultValue={draft.city}
            error={state?.fieldErrors?.city}
            hint={onboardingFieldHints.city}
            autoComplete="address-level2"
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <OnboardingTextInput
              label="Region"
              name="region"
              placeholder="State, province, or region"
              defaultValue={draft.region}
              error={state?.fieldErrors?.region}
              hint={onboardingFieldHints.region}
              optional
              autoComplete="address-level1"
            />
            <OnboardingTextInput
              label="Country code"
              name="country_code"
              placeholder="US"
              defaultValue={draft.country_code}
              error={state?.fieldErrors?.country_code}
              hint={onboardingFieldHints.country_code}
              optional
              autoComplete="country"
              maxLength={2}
            />
          </div>

          {state && !state.ok ? (
            <div className="rounded-2xl border border-red-300/20 bg-red-400/10 px-5 py-4 text-sm text-red-200" role="alert">
              {state.error}
            </div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <a href="/app/onboarding?step=identity" className="text-sm font-semibold text-[var(--color-stone)] transition hover:text-[var(--color-pearl)]">
              ← Back
            </a>
            <SubmitButton />
          </div>
        </form>
      </div>

      <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-stone)]">How discovery works</p>
        <ul className="mt-6 space-y-5 text-sm leading-7 text-[var(--color-pearl)]/90">
          <li className="flex gap-3">
            <span className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-400/20 to-pink-400/10 text-xs font-bold text-[var(--color-accent-lilac)]">1</span>
            <span>Gender and location shape the pool of people who see your profile. Freeborn keeps this respectful and under your control.</span>
          </li>
          <li className="flex gap-3">
            <span className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400/20 to-teal-400/10 text-xs font-bold text-[var(--color-accent-mint)]">2</span>
            <span>Region and country are optional, but they help surface matches close enough to become real.</span>
          </li>
          <li className="flex gap-3">
            <span className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-400/20 to-amber-400/10 text-xs font-bold text-[var(--color-accent-rose)]">3</span>
            <span>You can always edit these later. Onboarding is a starting point, not a final draft.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
