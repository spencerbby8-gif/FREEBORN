"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { genderOptions, relationshipGoalOptions } from "@freeborn/shared";
import type { DiscoveryPreferencesRow, UserProfileRow } from "@freeborn/shared";
import { saveDiscoveryPreferences } from "@/lib/discover/actions";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending} className="w-full magic-button rounded-xl bg-[var(--color-pearl)] py-3 text-sm font-bold text-[var(--color-ink)] transition hover:bg-white disabled:opacity-60">
      {pending ? "Saving…" : "Save preferences"}
    </button>
  );
}

export function DiscoveryPreferencesForm({
  prefs,
  profile,
}: {
  prefs: DiscoveryPreferencesRow | null;
  profile: UserProfileRow;
}) {
  const [state, formAction] = useActionState(saveDiscoveryPreferences, null);

  const ageMin = prefs?.age_min ?? profile.age_min_preference ?? 22;
  const ageMax = prefs?.age_max ?? profile.age_max_preference ?? 45;
  const distance = prefs?.distance_km ?? profile.max_distance_km ?? 80;
  const showGenders = prefs?.show_genders?.length ? prefs.show_genders : profile.show_gender?.length ? profile.show_gender : ["woman","man","non_binary"];
  const rel = prefs?.relationship_intents ?? profile.relationship_goals ?? ["long_term","meaningful_connection"];

  return (
    <div className="luminous-card rounded-2xl border border-white/8 bg-white/[0.035] p-6 sm:p-7">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-stone)]">Discovery preferences</p>
      <h3 className="mt-1 text-xl font-semibold text-[var(--color-pearl)]">Who you&apos;ll see</h3>

      <form action={formAction} className="mt-5 space-y-5">
        <div className="grid grid-cols-3 gap-3">
          <label className="block">
            <span className="text-xs text-[var(--color-mist)]">Min age</span>
            <input type="number" name="age_min" defaultValue={ageMin} min={18} max={80}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3 text-sm text-[var(--color-pearl)] outline-none focus:border-white/20 transition" />
          </label>
          <label className="block">
            <span className="text-xs text-[var(--color-mist)]">Max age</span>
            <input type="number" name="age_max" defaultValue={ageMax} min={18} max={99}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3 text-sm text-[var(--color-pearl)] outline-none focus:border-white/20 transition" />
          </label>
          <label className="block">
            <span className="text-xs text-[var(--color-mist)]">Distance</span>
            <input type="number" name="distance_km" defaultValue={distance} min={5} max={500}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3 text-sm text-[var(--color-pearl)] outline-none focus:border-white/20 transition" />
          </label>
        </div>

        <div>
          <p className="text-xs text-[var(--color-mist)] mb-2">Show</p>
          <div className="flex flex-wrap gap-2">
            {genderOptions.slice(0,6).map(g => (
              <label key={g.value} className="flex cursor-pointer items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-xs text-[var(--color-mist)] hover:border-white/20 transition">
                <input type="checkbox" name="show_genders" value={g.value} defaultChecked={showGenders.includes(g.value)} className="accent-[var(--color-accent-gold)]" />
                {g.label}
              </label>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs text-[var(--color-mist)] mb-2">Relationship intent</p>
          <div className="flex flex-wrap gap-2">
            {relationshipGoalOptions.map(r => (
              <label key={r.value} className="flex cursor-pointer items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-xs text-[var(--color-mist)] hover:border-white/20 transition">
                <input type="checkbox" name="relationship_intents" value={r.value} defaultChecked={rel.includes(r.value)} className="accent-[var(--color-accent-gold)]" />
                {r.label}
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-3 text-sm text-[var(--color-pearl)]/90">
          <label className="flex cursor-pointer items-center justify-between gap-3">
            <span>Verified only</span>
            <input type="checkbox" name="verified_only" defaultChecked={prefs?.verified_only ?? false} className="accent-[var(--color-accent-gold)]" />
          </label>
          <label className="flex cursor-pointer items-center justify-between gap-3">
            <span>Photos required</span>
            <input type="checkbox" name="photos_required" defaultChecked={prefs?.photos_required ?? true} className="accent-[var(--color-accent-gold)]" />
          </label>
          <label className="flex cursor-pointer items-center justify-between gap-3">
            <span>Strict deal breakers</span>
            <input type="checkbox" name="deal_breaker_strict" defaultChecked={prefs?.deal_breaker_strict ?? true} className="accent-[var(--color-accent-gold)]" />
          </label>
        </div>

        {state && !state.ok && <p className="text-sm text-red-200">{state.error}</p>}
        {state && state.ok && <p className="text-sm text-emerald-200">Preferences saved.</p>}

        <Submit />
      </form>
    </div>
  );
}
