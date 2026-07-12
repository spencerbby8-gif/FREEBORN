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
    <section id="privacy" className="luminous-card scroll-mt-8 rounded-[32px] border border-white/5 bg-white/[0.02] p-8 shadow-[var(--shadow-raised)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[var(--color-ash)]">Privacy Control</p>
          <h2 className="mt-2 text-xl font-bold tracking-tight text-[var(--color-pearl)]">Profile Visibility</h2>
        </div>
        <span className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-widest ${discoverable ? "border-[var(--color-teal-500)]/30 bg-[var(--color-teal-500)]/10 text-[var(--color-teal-300)]" : "border-white/10 bg-white/5 text-[var(--color-ash)]"}`}>
          <span className={`h-1 w-1 rounded-full ${discoverable ? "bg-current shadow-[0_0_8px_currentColor]" : "bg-current"}`} />
          {discoverable ? "Visible" : "Hidden"}
        </span>
      </div>

      <p className="mt-4 text-[14px] font-medium leading-relaxed text-[var(--color-mist)]">
        When visibility is off, you stop appearing in discovery. Your matches and messages stay intact.
      </p>

      <form action={formAction} className="mt-8 space-y-6">
        <input type="hidden" name="discoverable" value={String(discoverable)} />
        <button
          type="button"
          role="switch"
          aria-checked={discoverable}
          onClick={() => setDiscoverable((value) => !value)}
          className="group flex w-full items-center justify-between gap-4 rounded-[24px] border border-white/5 bg-white/[0.02] p-5 text-left transition-all hover:bg-white/[0.04] active:scale-[0.98]"
        >
          <div className="min-w-0">
            <span className="block text-[15px] font-bold text-[var(--color-pearl)]">Discoverable Mode</span>
            <span className="mt-1 block text-[13px] font-medium leading-snug text-[var(--color-mist)]">Show my profile to intentional people.</span>
          </div>
          <div className={`relative h-7 w-12 shrink-0 rounded-full transition-all duration-300 ${discoverable ? "bg-[var(--color-gold-500)] shadow-[0_0_15px_rgba(217,167,82,0.4)]" : "bg-white/10"}`}>
            <div className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-lg transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${discoverable ? "left-6" : "left-1"}`} />
          </div>
        </button>

        {state && !state.ok && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-[14px] font-bold text-red-200 animate-scale-in">
            {state.error ?? "Failed to update visibility."}
          </div>
        )}

        {state && state.ok && (
          <div className="rounded-2xl border border-[var(--color-teal-500)]/20 bg-[var(--color-teal-500)]/5 p-4 text-[14px] font-bold text-[var(--color-teal-300)] animate-scale-in">
            Visibility updated successfully.
          </div>
        )}

        <SubmitButton />
      </form>
    </section>
  );
}
  );
}
