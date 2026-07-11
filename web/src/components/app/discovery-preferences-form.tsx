"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { genderOptions, relationshipGoalOptions } from "@freeborn/shared";
import type { DiscoveryPreferencesRow, UserProfileRow } from "@freeborn/shared";
import { saveDiscoveryPreferences } from "@/lib/discover/actions";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending} className="magic-button w-full rounded-xl bg-[var(--color-pearl)] py-3 text-sm font-bold text-[var(--color-ink)] transition hover:bg-white disabled:opacity-60">
      {pending ? "Saving…" : "Save preferences"}
    </button>
  );
}

function CheckPill({ name, value, label, defaultChecked }: { name: string; value: string; label: string; defaultChecked: boolean }) {
  return (
    <label className="group relative cursor-pointer">
      <input type="checkbox" name={name} value={value} defaultChecked={defaultChecked} className="check-input sr-only" />
      <span className="check-pill flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-semibold text-[var(--color-mist)] transition group-hover:border-white/20 group-hover:bg-white/[0.055]">
        <span className="check-dot h-2 w-2 rounded-full bg-white/18 transition" />
        {label}
      </span>
    </label>
  );
}

function ToggleRow({ name, label, defaultChecked }: { name: string; label: string; defaultChecked: boolean }) {
  return (
    <label className="group flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/[0.025] px-4 py-3.5 transition hover:border-white/16 hover:bg-white/[0.045]">
      <span className="text-sm font-semibold text-[var(--color-pearl)]/90">{label}</span>
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="toggle-input sr-only" />
      <span className="toggle-track relative h-6 w-11 rounded-full bg-white/12 transition">
        <span className="toggle-knob absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition" />
      </span>
    </label>
  );
}

const inputClass =
  "mt-2 w-full rounded-xl border border-white/10 bg-white/[0.035] px-3 py-3 text-sm text-[var(--color-pearl)] outline-none transition placeholder:text-white/30 hover:border-white/18 focus:border-[var(--color-gold-500)] focus:bg-white/[0.055] focus:shadow-[0_0_0_3px_rgba(217,167,82,0.12)]";

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
      <p className="mt-2 text-sm leading-6 text-[var(--color-mist)]">A calmer feed starts with clear boundaries. Tune the room without turning dating into a spreadsheet.</p>

      <form action={formAction} className="mt-5 space-y-5">
        <div className="grid grid-cols-3 gap-3">
          <label className="block">
            <span className="text-xs font-medium text-[var(--color-mist)]">Min age</span>
            <input type="number" name="age_min" defaultValue={ageMin} min={18} max={80} className={inputClass} />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-[var(--color-mist)]">Max age</span>
            <input type="number" name="age_max" defaultValue={ageMax} min={18} max={99} className={inputClass} />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-[var(--color-mist)]">Distance</span>
            <input type="number" name="distance_km" defaultValue={distance} min={5} max={500} className={inputClass} />
          </label>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium text-[var(--color-mist)]">Show</p>
          <div className="flex flex-wrap gap-2">
            {genderOptions.slice(0,6).map((gender) => (
              <CheckPill key={gender.value} name="show_genders" value={gender.value} label={gender.label} defaultChecked={showGenders.includes(gender.value)} />
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium text-[var(--color-mist)]">Relationship intent</p>
          <div className="flex flex-wrap gap-2">
            {relationshipGoalOptions.map((intent) => (
              <CheckPill key={intent.value} name="relationship_intents" value={intent.value} label={intent.label} defaultChecked={rel.includes(intent.value)} />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <ToggleRow name="verified_only" label="Verified only" defaultChecked={prefs?.verified_only ?? false} />
          <ToggleRow name="photos_required" label="Photos required" defaultChecked={prefs?.photos_required ?? true} />
          <ToggleRow name="deal_breaker_strict" label="Strict deal breakers" defaultChecked={prefs?.deal_breaker_strict ?? true} />
        </div>

        {state && !state.ok && <p className="rounded-2xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 px-4 py-3 text-sm text-red-100">{state.error}</p>}
        {state && state.ok && <p className="rounded-2xl border border-[var(--color-success)]/30 bg-[var(--color-success)]/10 px-4 py-3 text-sm text-emerald-100">Preferences saved.</p>}

        <Submit />
      </form>
    </div>
  );
}
