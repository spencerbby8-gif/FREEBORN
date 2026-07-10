"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { onboardingFieldHints, onboardingIntro } from "@freeborn/shared";
import { saveOnboardingIdentity } from "@/lib/onboarding/actions";
import { OnboardingTextInput } from "./onboarding-field";

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

export function StepIdentity({
  draft,
  fieldErrors,
}: {
  draft: { display_name: string; birth_date: string };
  fieldErrors?: Record<string, string>;
}) {
  const [state, formAction] = useActionState(saveOnboardingIdentity, null);

  return (
    <div className="grid flex-1 gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="glass-panel premium-border rounded-[36px] p-7 sm:p-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-stone)]">
          <span className="h-2 w-2 rounded-full bg-[var(--color-accent-gold)]" />
          {onboardingIntro.eyebrow}
        </div>
        <h1 className="mt-5 font-[family-name:var(--font-display)] text-[clamp(2.6rem,5vw,4rem)] leading-[0.95] tracking-[-0.05em] text-[var(--color-pearl)]">
          {onboardingIntro.title}
        </h1>
        <p className="mt-4 max-w-[48ch] text-base leading-7 text-[var(--color-mist)]">
          {onboardingIntro.description}
        </p>

        <div className="mt-8 space-y-5">
          <form action={formAction} className="space-y-5" noValidate>
            <OnboardingTextInput
              label="Display name"
              name="display_name"
              placeholder="How should Freeborn introduce you?"
              value={draft.display_name}
              onChange={() => undefined}
              error={fieldErrors?.display_name}
              hint={onboardingFieldHints.display_name}
              autoComplete="nickname"
            />
            <OnboardingTextInput
              label="Date of birth"
              name="birth_date"
              type="date"
              value={draft.birth_date}
              onChange={() => undefined}
              error={fieldErrors?.birth_date}
              hint={onboardingFieldHints.birth_date}
              autoComplete="bday"
            />

            {state && !state.ok ? (
              <div
                className="rounded-[24px] border border-rose-300/30 bg-rose-400/10 px-5 py-4 text-sm text-rose-50"
                role="alert"
              >
                {state.error}
              </div>
            ) : null}

            <SubmitButton />
          </form>
        </div>
      </div>

      <div className="glass-panel premium-border rounded-[36px] p-7 sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-stone)]">
          Why we ask
        </p>
        <ul className="mt-6 space-y-5 text-sm leading-7 text-[var(--color-pearl)]/90">
          <li className="flex gap-4">
            <span className="mt-1 h-3 w-3 flex-shrink-0 rounded-full bg-[var(--color-accent-rose)]" />
            <span>
              A clear display name helps people feel like they&apos;re meeting a real person, not a
              placeholder.
            </span>
          </li>
          <li className="flex gap-4">
            <span className="mt-1 h-3 w-3 flex-shrink-0 rounded-full bg-[var(--color-accent-gold)]" />
            <span>
              We verify age without publishing it. Your birth date stays private and is never
              visible on your profile.
            </span>
          </li>
          <li className="flex gap-4">
            <span className="mt-1 h-3 w-3 flex-shrink-0 rounded-full bg-[var(--color-accent-blue)]" />
            <span>
              Progress saves automatically at every step. Leave and come back — we&apos;ll pick up
              right where you left off.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
