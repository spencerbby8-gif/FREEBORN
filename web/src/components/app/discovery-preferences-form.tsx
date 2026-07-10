"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { genderOptions, relationshipGoalOptions } from "@freeborn/shared";
import type { DiscoveryPreferencesRow, UserProfileRow } from "@freeborn/shared";
import { saveDiscoveryPreferences } from "@/lib/discover/actions";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending} className="w-full rounded-[18px] bg-[var(--color-pearl)] py-3 text-sm font-bold text-[var(--color-ink)] disabled:opacity-60">
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
    <div className="glass-panel premium-border rounded-[30px] p-6 sm:p-7">
      <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--color-stone)]">Discovery preferences</p>
      <h3 className="mt-1 text-xl font-semibold text-[var(--color-pearl)]">Who should find you</h3>

      <form action={formAction} className="mt-5 space-y-5">
        <div className="grid grid-cols-3 gap-3">
          <label className="block">
            <span className="text-xs text-[var(--color-mist)]">Age min</span>
            <input type="number" name="age_min" defaultValue={ageMin} min={18} max={80}
              className="mt-2 w-full rounded-2xl border border-white/14 bg-white/[0.05] px-3 py-3 text-sm text-[var(--color-pearl)]" />
          </label>
          <label className="block">
            <span className="text-xs text-[var(--color-mist)]">Age max</span>
            <input type="number" name="age_max" defaultValue={ageMax} min={18} max={99}
              className="mt-2 w-full rounded-2xl border border-white/14 bg-white/[0.05] px-3 py-3 text-sm text-[var(--color-pearl)]" />
          </label>
          <label className="block">
            <span className="text-xs text-[var(--color-mist)]">Distance km</span>
            <input type="number" name="distance_km" defaultValue={distance} min={5} max={500}
              className="mt-2 w-full rounded-2xl border border-white/14 bg-white/[0.05] px-3 py-3 text-sm text-[var(--color-pearl)]" />
          </label>
        </div>

        <div>
          <p className="text-xs text-[var(--color-mist)] mb-2">Show genders</p>
          <div className="flex flex-wrap gap-2">
            {genderOptions.slice(0,6).map(g => (
              <label key={g.value} className="flex items-center gap-2 rounded-full border border-white/14 px-3 py-2 text-xs text-[var(--color-mist)]">
                <input type="checkbox" name="show_genders" value={g.value} defaultChecked={showGenders.includes(g.value)} />
                {g.label}
              </label>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs text-[var(--color-mist)] mb-2">Relationship intent filter</p>
          <div className="flex flex-wrap gap-2">
            {relationshipGoalOptions.map(r => (
              <label key={r.value} className="flex items-center gap-2 rounded-full border border-white/14 px-3 py-2 text-xs text-[var(--color-mist)]">
                <input type="checkbox" name="relationship_intents" value={r.value} defaultChecked={rel.includes(r.value)} />
                {r.label}
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-3 text-sm text-[var(--color-pearl)]/90">
          <label className="flex items-center justify-between gap-3">
            <span>Verified only</span>
            <input type="checkbox" name="verified_only" defaultChecked={prefs?.verified_only ?? false} />
          </label>
          <label className="flex items-center justify-between gap-3">
            <span>Photos required</span>
            <input type="checkbox" name="photos_required" defaultChecked={prefs?.photos_required ?? true} />
          </label>
          <label className="flex items-center justify-between gap-3">
            <span>Strict deal breakers</span>
            <input type="checkbox" name="deal_breaker_strict" defaultChecked={prefs?.deal_breaker_strict ?? true} />
          </label>
        </div>

        {state && !state.ok && <p className="text-sm text-rose-300">{state.error}</p>}
        {state && state.ok && <p className="text-sm text-emerald-300">Preferences saved.</p>}

        <Submit />
      </form>
    </div>
  );
}
