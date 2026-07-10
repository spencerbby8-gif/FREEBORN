"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { onboardingFieldHints } from "@freeborn/shared";
import { saveOnboardingIdentity } from "@/lib/onboarding/actions";
import { OnboardingTextInput } from "./onboarding-field";
import { BirthDateField } from "./birth-date-field";

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

export function StepIdentity({
  draft
}: {
  draft: { display_name: string; birth_date: string };
}) {
  const [state, formAction] = useActionState(saveOnboardingIdentity, null);

  return (
    <div className="grid flex-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-6 sm:p-8">
        <h1 className="font-[family-name:var(--font-display)] text-[clamp(2rem,4vw,3.2rem)] leading-[0.95] tracking-[-0.05em] text-[var(--color-pearl)]">
          Let&apos;s start with the basics.
        </h1>
        <p className="mt-3 max-w-lg text-base leading-7 text-[var(--color-mist)]">
          Your display name and date of birth help create an authentic foundation. Everything saves automatically.
        </p>

        <form action={formAction} className="mt-8 space-y-5" noValidate>
          <OnboardingTextInput
            label="Display name"
            name="display_name"
            placeholder="How should Freeborn introduce you?"
            defaultValue={draft.display_name}
            error={state?.fieldErrors?.display_name}
            hint={onboardingFieldHints.display_name}
            autoComplete="nickname"
          />
          <BirthDateField
            defaultValue={draft.birth_date}
            error={state?.fieldErrors?.birth_date}
            hint={onboardingFieldHints.birth_date}
          />

          {state && !state.ok ? (
            <div className="rounded-2xl border border-red-300/20 bg-red-400/10 px-5 py-4 text-sm text-red-200" role="alert">
              {state.error}
            </div>
          ) : null}

          <SubmitButton />
        </form>
      </div>

      <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-stone)]">Why we ask</p>
        <ul className="mt-6 space-y-5 text-sm leading-7 text-[var(--color-pearl)]/90">
          <li className="flex gap-3">
            <span className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-400/20 to-amber-400/10 text-xs font-bold text-[var(--color-accent-rose)]">1</span>
            <span>A clear display name helps people feel like they&apos;re meeting a real person, not a placeholder.</span>
          </li>
          <li className="flex gap-3">
            <span className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400/20 to-emerald-400/10 text-xs font-bold text-[var(--color-accent-gold)]">2</span>
            <span>We verify age without publishing it. Your birth date stays private and is never visible on your profile.</span>
          </li>
          <li className="flex gap-3">
            <span className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-400/20 to-violet-400/10 text-xs font-bold text-[var(--color-accent-blue)]">3</span>
            <span>Progress saves automatically at every step. Leave and come back — we&apos;ll pick up right where you left off.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
