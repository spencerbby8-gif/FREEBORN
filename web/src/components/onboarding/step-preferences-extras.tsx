"use client";

import { useActionState } from "react";
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
      className="inline-flex w-full items-center justify-center rounded-[22px] bg-[var(--color-pearl)] px-5 py-4 text-sm font-bold text-[var(--color-ink)] transition hover:translate-y-[-1px] hover:bg-white disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "Saving…" : "Continue"}
    </button>
  );
}

export function StepPreferencesExtras({
  draft,
  fieldErrors,
}: {
  draft: {
    deal_breakers: string[];
    occupation: string;
    education: string;
  };
  fieldErrors?: Record<string, string>;
}) {
  const [state, formAction] = useActionState(saveOnboardingPreferencesExtras, null);

  return (
    <div className="grid flex-1 gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="glass-panel premium-border rounded-[36px] p-7 sm:p-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-stone)]">
          <span className="h-2 w-2 rounded-full bg-[var(--color-accent-gold)]" />
          Preferences & extras
        </div>
        <h1 className="mt-5 font-[family-name:var(--font-display)] text-[clamp(2.4rem,4.5vw,3.6rem)] leading-[0.95] tracking-[-0.05em] text-[var(--color-pearl)]">
          The finer details.
        </h1>
        <p className="mt-4 max-w-[52ch] text-base leading-7 text-[var(--color-mist)]">
          Deal breakers keep discovery honest. Occupation and education are optional but add
          texture.
        </p>

        <form action={formAction} className="mt-8 space-y-6" noValidate>
          <ChipSelect
            label="Deal breakers"
            options={dealBreakerOptions}
            value={draft.deal_breakers}
            max={12}
            optional
            error={fieldErrors?.deal_breakers}
            hint={onboardingFieldHints.deal_breakers}
            onChange={(next) => {
              const form = document.getElementById(
                "preferences-form",
              ) as HTMLFormElement | null;
              if (!form) return;
              form
                .querySelectorAll('input[name="deal_breakers"]')
                .forEach((node) => node.remove());
              const fragment = document.createDocumentFragment();
              next.forEach((item) => {
                const input = document.createElement("input");
                input.type = "hidden";
                input.name = "deal_breakers";
                input.value = item;
                fragment.appendChild(input);
              });
              form.appendChild(fragment);
            }}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <OnboardingTextInput
              label="Occupation"
              name="occupation"
              placeholder="What do you do?"
              value={draft.occupation}
              error={fieldErrors?.occupation}
              hint={onboardingFieldHints.occupation}
              optional
            />
            <OnboardingTextInput
              label="Education"
              name="education"
              placeholder="Where did you study?"
              value={draft.education}
              error={fieldErrors?.education}
              hint={onboardingFieldHints.education}
              optional
            />
          </div>

          {draft.deal_breakers.map((value) => (
            <input key={`deal-${value}`} type="hidden" name="deal_breakers" value={value} />
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
              href="/app/onboarding?step=interests_lifestyle"
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
          Almost there
        </p>
        <ul className="mt-6 space-y-5 text-sm leading-7 text-[var(--color-pearl)]/90">
          <li className="flex gap-4">
            <span className="mt-1 h-3 w-3 flex-shrink-0 rounded-full bg-[var(--color-accent-rose)]" />
            <span>
              Deal breakers are optional but powerful. They help Freeborn skip the matches that
              would never work.
            </span>
          </li>
          <li className="flex gap-4">
            <span className="mt-1 h-3 w-3 flex-shrink-0 rounded-full bg-[var(--color-accent-blue)]" />
            <span>
              Occupation and education are optional. Share them if you&apos;d like, or skip them for
              now.
            </span>
          </li>
          <li className="flex gap-4">
            <span className="mt-1 h-3 w-3 flex-shrink-0 rounded-full bg-[var(--color-accent-gold)]" />
            <span>
              When you continue, we&apos;ll mark your profile ready and take you into the app shell.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
