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
      className="inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-[var(--color-accent-rose)] to-[var(--color-accent-gold)] px-5 py-4 text-sm font-bold text-white transition-all hover:opacity-90 hover:translate-y-[-1px] hover:shadow-[0_16px_40px_rgba(255,133,120,0.2)] disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "Finalizing…" : "Enter Freeborn"}
    </button>
  );
}

export function StepComplete({ error }: { error?: string }) {
  const [state, formAction] = useActionState(completeOnboarding, null);

  return (
    <div className="grid flex-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="flex flex-col items-center rounded-2xl border border-white/8 bg-white/[0.03] p-8 sm:p-10 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400/20 to-teal-400/10">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-300">
            <polyline points="20,6 9,17 4,12"/>
          </svg>
        </div>
        <h1 className="mt-6 font-[family-name:var(--font-display)] text-[clamp(2rem,4vw,3rem)] leading-[0.95] tracking-[-0.05em] text-[var(--color-pearl)]">
          {onboardingComplete.title}
        </h1>
        <p className="mt-3 max-w-md text-base leading-7 text-[var(--color-mist)]">
          {onboardingComplete.description}
        </p>

        {profileTips.map((tip, i) => (
          <div key={tip} className="mt-4 flex items-start gap-3 rounded-xl border border-white/8 bg-white/[0.02] px-5 py-4 text-left w-full max-w-md">
            <span className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
              i === 0 ? "bg-amber-400/20 text-[var(--color-accent-gold)]" : i === 1 ? "bg-rose-400/20 text-[var(--color-accent-rose)]" : "bg-sky-400/20 text-[var(--color-accent-blue)]"
            }`}>
              {i + 1}
            </span>
            <p className="text-sm leading-6 text-[var(--color-pearl)]/90">{tip}</p>
          </div>
        ))}

        <form action={formAction} className="mt-6 w-full max-w-md" noValidate>
          {(state && !state.ok) || error ? (
            <div className="mb-4 rounded-2xl border border-red-300/20 bg-red-400/10 px-5 py-4 text-sm text-red-200" role="alert">
              {state?.error ?? error}
            </div>
          ) : null}

          <SubmitButton />
        </form>
      </div>

      <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-stone)]">What happens next</p>
        <ul className="mt-6 space-y-5 text-sm leading-7 text-[var(--color-pearl)]/90">
          <li className="flex gap-3">
            <span className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400/20 to-emerald-400/10 text-xs font-bold text-[var(--color-accent-gold)]">1</span>
            <span>Your profile is now active. Start discovering thoughtful people near you.</span>
          </li>
          <li className="flex gap-3">
            <span className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-400/20 to-amber-400/10 text-xs font-bold text-[var(--color-accent-rose)]">2</span>
            <span>You can edit any of these details from your profile whenever you want.</span>
          </li>
          <li className="flex gap-3">
            <span className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-400/20 to-violet-400/10 text-xs font-bold text-[var(--color-accent-blue)]">3</span>
            <span>Freeborn is built around trust. Your details stay private until you choose to share them.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

const profileTips = [
  "Add photos to increase your visibility — profiles with photos get 3x more connections.",
  "The more interests you add, the better your matches will be.",
  "Keep your bio updated — it's the first thing people read.",
];
