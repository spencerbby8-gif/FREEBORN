"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import type { UserProfileRow } from "@freeborn/shared";
import { saveProfileVisibility } from "@/lib/discover/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      className="magic-button w-full rounded-2xl bg-[var(--color-pearl)] px-5 py-3.5 text-sm font-extrabold text-[var(--color-ink)] transition hover:bg-white disabled:cursor-wait disabled:opacity-60"
    >
      {pending ? "Saving visibility…" : "Save visibility"}
    </button>
  );
}

export function ProfileVisibilityForm({ profile }: { profile: UserProfileRow }) {
  const [discoverable, setDiscoverable] = useState(profile.discoverable ?? true);
  const [state, formAction] = useActionState(saveProfileVisibility, null);

  return (
    <section id="privacy" className="luminous-card scroll-mt-8 rounded-[28px] border border-white/10 bg-white/[0.035] p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.20em] text-[var(--color-stone)]">Privacy controls</p>
          <h2 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-[var(--color-pearl)]">Choose whether people can find you.</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--color-mist)]">
            When visibility is off, your profile stops appearing in discovery while your account and matches stay intact.
          </p>
        </div>
        <span className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] ${discoverable ? "border-[rgba(109,211,176,0.28)] bg-[rgba(109,211,176,0.10)] text-[var(--color-success)]" : "border-white/10 bg-white/[0.04] text-[var(--color-mist)]"}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {discoverable ? "Visible" : "Hidden"}
        </span>
      </div>

      <form action={formAction} className="mt-5 space-y-4">
        <input type="hidden" name="discoverable" value={String(discoverable)} />
        <button
          type="button"
          role="switch"
          aria-checked={discoverable}
          onClick={() => setDiscoverable((value) => !value)}
          className="flex w-full items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-4 text-left transition hover:border-white/18 hover:bg-white/[0.055]"
        >
          <span>
            <span className="block text-sm font-bold text-[var(--color-pearl)]">Visible in discovery</span>
            <span className="mt-1 block text-xs leading-5 text-[var(--color-mist)]">People who match your filters can see your public profile.</span>
          </span>
          <span className={`relative h-7 w-12 shrink-0 rounded-full transition ${discoverable ? "bg-[var(--color-gold-500)]" : "bg-white/14"}`}>
            <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-all ${discoverable ? "left-6" : "left-1"}`} />
          </span>
        </button>

        {state && !state.ok ? (
          <div className="rounded-2xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 px-4 py-3 text-sm text-red-100" role="alert">
            <p className="font-semibold">Visibility did not save.</p>
            <p className="mt-1 text-red-100/80">{state.error}</p>
          </div>
        ) : null}

        {state && state.ok ? (
          <div className="rounded-2xl border border-[var(--color-success)]/30 bg-[var(--color-success)]/10 px-4 py-3 text-sm text-emerald-100" role="status">
            {discoverable ? "Your profile is visible in discovery." : "Your profile is hidden from discovery."}
          </div>
        ) : null}

        <SubmitButton />
      </form>
    </section>
  );
}
