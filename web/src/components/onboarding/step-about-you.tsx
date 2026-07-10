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
      className="inline-flex w-full items-center justify-center rounded-[22px] bg-[var(--color-pearl)] px-5 py-4 text-sm font-bold text-[var(--color-ink)] transition hover:translate-y-[-1px] hover:bg-white disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "Saving…" : "Continue"}
    </button>
  );
}

export function StepAboutYou({
  draft,
  fieldErrors,
}: {
  draft: {
    gender: string;
    city: string;
    region: string;
    country_code: string;
  };
  fieldErrors?: Record<string, string>;
}) {
  const [state, formAction] = useActionState(saveOnboardingAboutYou, null);

  return (
    <div className="grid flex-1 gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="glass-panel premium-border rounded-[36px] p-7 sm:p-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-stone)]">
          <span className="h-2 w-2 rounded-full bg-[var(--color-accent-gold)]" />
          About you
        </div>
        <h1 className="mt-5 font-[family-name:var(--font-display)] text-[clamp(2.4rem,4.5vw,3.6rem)] leading-[0.95] tracking-[-0.05em] text-[var(--color-pearl)]">
          Where you are, how you identify.
        </h1>
        <p className="mt-4 max-w-[52ch] text-base leading-7 text-[var(--color-mist)]">
          These details shape who discovers you. You can refine them any time from your profile.
        </p>

        <form action={formAction} className="mt-8 space-y-5" noValidate>
          <OnboardingSelect
            label="Gender"
            name="gender"
            value={draft.gender}
            error={fieldErrors?.gender}
            hint={onboardingFieldHints.gender}
            options={[
              { value: "", label: "Select how you identify" },
              ...genderOptions.map((option) => ({
                value: option.value,
                label: option.label,
              })),
            ]}
          />
          <OnboardingTextInput
            label="City"
            name="city"
            placeholder="Where do you live?"
            value={draft.city}
            error={fieldErrors?.city}
            hint={onboardingFieldHints.city}
            autoComplete="address-level2"
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <OnboardingTextInput
              label="Region"
              name="region"
              placeholder="State, province, or region"
              value={draft.region}
              error={fieldErrors?.region}
              hint={onboardingFieldHints.region}
              optional
              autoComplete="address-level1"
            />
            <OnboardingTextInput
              label="Country code"
              name="country_code"
              placeholder="US"
              value={draft.country_code}
              error={fieldErrors?.country_code}
              hint={onboardingFieldHints.country_code}
              optional
              autoComplete="country"
              maxLength={2}
            />
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
              href="/app/onboarding?step=identity"
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
          Discovery foundations
        </p>
        <ul className="mt-6 space-y-5 text-sm leading-7 text-[var(--color-pearl)]/90">
          <li className="flex gap-4">
            <span className="mt-1 h-3 w-3 flex-shrink-0 rounded-full bg-[var(--color-accent-lilac)]" />
            <span>
              Gender and location shape the pool of people who see your profile. Freeborn keeps this
              respectful and under your control.
            </span>
          </li>
          <li className="flex gap-4">
            <span className="mt-1 h-3 w-3 flex-shrink-0 rounded-full bg-[var(--color-accent-mint)]" />
            <span>
              Region and country are optional, but they help surface matches close enough to become
              real.
            </span>
          </li>
          <li className="flex gap-4">
            <span className="mt-1 h-3 w-3 flex-shrink-0 rounded-full bg-[var(--color-accent-rose)]" />
            <span>
              You can always edit these later. Onboarding is a starting point, not a final draft.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
