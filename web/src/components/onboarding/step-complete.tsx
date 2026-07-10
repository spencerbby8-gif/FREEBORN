"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { onboardingComplete } from "@freeborn/shared";
import { completeOnboarding } from "@/lib/onboarding/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full items-center justify-center rounded-[22px] bg-[var(--color-pearl)] px-5 py-4 text-sm font-bold text-[var(--color-ink)] transition hover:translate-y-[-1px] hover:bg-white disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "Finalizing…" : "Enter Freeborn"}
    </button>
  );
}

export function StepComplete({ error }: { error?: string }) {
  const [state, formAction] = useActionState(completeOnboarding, null);

  return (
    <div className="grid flex-1 gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="glass-panel premium-border rounded-[36px] p-7 sm:p-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-stone)]">
          <span className="h-2 w-2 rounded-full bg-emerald-300" />
          {onboardingComplete.eyebrow}
        </div>
        <h1 className="mt-5 font-[family-name:var(--font-display)] text-[clamp(2.6rem,5vw,4rem)] leading-[0.95] tracking-[-0.05em] text-[var(--color-pearl)]">
          {onboardingComplete.title}
        </h1>
        <p className="mt-4 max-w-[52ch] text-base leading-7 text-[var(--color-mist)]">
          {onboardingComplete.description}
        </p>

        <form action={formAction} className="mt-8" noValidate>
          {(state && !state.ok) || error ? (
            <div
              className="mb-5 rounded-[24px] border border-rose-300/30 bg-rose-400/10 px-5 py-4 text-sm text-rose-50"
              role="alert"
            >
              {state?.error ?? error}
            </div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <a
              href="/app/onboarding?step=preferences_extras"
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
          What happens next
        </p>
        <ul className="mt-6 space-y-5 text-sm leading-7 text-[var(--color-pearl)]/90">
          <li className="flex gap-4">
            <span className="mt-1 h-3 w-3 flex-shrink-0 rounded-full bg-[var(--color-accent-gold)]" />
            <span>
              Your profile is now active in the app shell. Discovery and matching arrive in the next
              phase.
            </span>
          </li>
          <li className="flex gap-4">
            <span className="mt-1 h-3 w-3 flex-shrink-0 rounded-full bg-[var(--color-accent-rose)]" />
            <span>
              You can edit any of these details from your profile whenever you want.
            </span>
          </li>
          <li className="flex gap-4">
            <span className="mt-1 h-3 w-3 flex-shrink-0 rounded-full bg-[var(--color-accent-blue)]" />
            <span>
              Freeborn is built around trust. Your details stay private until you choose to share
              them.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
