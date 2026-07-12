"use client";

import Link from "next/link";
import { useActionState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { genderOptions, relationshipGoalOptions } from "@freeborn/shared";
import type { DiscoveryPreferencesRow, UserProfileRow } from "@freeborn/shared";
import { saveDiscoveryPreferences } from "@/lib/discover/actions";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      className="magic-button w-full rounded-2xl bg-[var(--color-pearl)] px-5 py-4 text-sm font-extrabold text-[var(--color-ink)] transition hover:bg-white disabled:cursor-wait disabled:opacity-60"
    >
      {pending ? "Saving settings…" : "Save discovery settings"}
    </button>
  );
}

function CheckPill({ name, value, label, caption, defaultChecked }: { name: string; value: string; label: string; caption?: string; defaultChecked: boolean }) {
  return (
    <label className="group relative cursor-pointer">
      <input type="checkbox" name={name} value={value} defaultChecked={defaultChecked} className="check-input sr-only" />
      <span className="check-pill flex min-h-11 items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-2 text-xs font-bold text-[var(--color-mist)] transition group-hover:border-white/20 group-hover:bg-white/[0.055]">
        <span className="check-dot h-2 w-2 shrink-0 rounded-full bg-white/18 transition" />
        <span>
          {label}
          {caption ? <span className="sr-only"> — {caption}</span> : null}
        </span>
      </span>
    </label>
  );
}

function ToggleRow({ name, label, body, defaultChecked }: { name: string; label: string; body: string; defaultChecked: boolean }) {
  return (
    <label className="group flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-white/8 bg-white/[0.025] px-4 py-4 transition hover:border-white/16 hover:bg-white/[0.045]">
      <span>
        <span className="block text-sm font-bold text-[var(--color-pearl)]/95">{label}</span>
        <span className="mt-1 block text-xs leading-5 text-[var(--color-mist)]">{body}</span>
      </span>
      <input type="checkbox" name={name} value="true" defaultChecked={defaultChecked} className="toggle-input sr-only" />
      <span className="toggle-track relative h-6 w-11 shrink-0 rounded-full bg-white/12 transition">
        <span className="toggle-knob absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition" />
      </span>
    </label>
  );
}

function SettingGroup({ label, body, children }: { label: string; body: string; children: ReactNode }) {
  return (
    <section className="rounded-[32px] border border-white/5 bg-white/[0.015] p-6 sm:p-8">
      <div className="mb-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[var(--color-ash)]">{label}</p>
        <p className="mt-2 text-[14px] font-medium leading-relaxed text-[var(--color-mist)]">{body}</p>
      </div>
      {children}
    </section>
  );
}

const inputClass =
  "mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3.5 text-[15px] font-medium text-[var(--color-pearl)] outline-none transition-all placeholder:text-[var(--color-ash)] focus:border-[var(--color-gold-500)] focus:bg-white/[0.06] focus:shadow-[0_0_20px_-10px_rgba(217,167,82,0.3)]";

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
  const showGenders = prefs?.show_genders?.length
    ? prefs.show_genders
    : profile.show_gender?.length
      ? profile.show_gender
      : ["woman", "man", "non_binary"];
  const relationshipIntents = prefs?.relationship_intents?.length
    ? prefs.relationship_intents
    : profile.relationship_goals?.length
      ? profile.relationship_goals
      : ["long_term", "meaningful_connection"];

  return (
    <div id="discovery" className="luminous-card rounded-[40px] border border-white/10 bg-white/[0.02] p-8 shadow-[var(--shadow-card-lg)] sm:p-12">
      <header className="mb-12">
        <div className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.25em] text-[var(--color-sand)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-teal-500)] shadow-[0_0_10px_rgba(79,184,167,0.6)]" />
          Discovery Preferences
        </div>
        <h2 
          className="mt-6 text-[clamp(2rem,6vw,2.75rem)] leading-[0.95] tracking-tight text-[var(--color-pearl)]"
          style={{ fontFamily: "var(--font-display)", fontVariationSettings: "'opsz' 144, 'wght' 450" }}
        >
          Set your boundaries.
        </h2>
        <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-[var(--color-mist)]">
          Choose who appears in your curated room. These boundaries keep your feed intentional and aligned with your lifestyle.
        </p>
      </header>

      <form action={formAction} className="space-y-8">
        <SettingGroup
          label="Visibility & Trust"
          body="Filter by verification or photo status to ensure a recognizable and reliable community experience."
        >
          <div className="space-y-3">
            <ToggleRow name="verified_only" label="Verified Profiles Only" body="Show only members with earned verification status." defaultChecked={prefs?.verified_only ?? false} />
            <ToggleRow name="photos_required" label="Require Profile Photos" body="Hide profiles that do not yet have public photos." defaultChecked={prefs?.photos_required ?? true} />
          </div>
        </SettingGroup>

        <SettingGroup label="Age & Proximity" body="Set the practical range for your potential matches.">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="group space-y-2.5">
              <label className="px-1 text-[13px] font-bold uppercase tracking-wider text-[var(--color-sand)]">Min Age</label>
              <input type="number" name="age_min" defaultValue={ageMin} min={18} max={80} className={inputClass} />
            </div>
            <div className="group space-y-2.5">
              <label className="px-1 text-[13px] font-bold uppercase tracking-wider text-[var(--color-sand)]">Max Age</label>
              <input type="number" name="age_max" defaultValue={ageMax} min={18} max={99} className={inputClass} />
            </div>
            <div className="group space-y-2.5">
              <label className="px-1 text-[13px] font-bold uppercase tracking-wider text-[var(--color-sand)]">Distance (km)</label>
              <input type="number" name="distance_km" defaultValue={distance} min={5} max={500} className={inputClass} />
            </div>
          </div>
        </SettingGroup>

        <SettingGroup label="Who Appears" body="Select the gender identities you want to see in your discovery feed.">
          <div className="flex flex-wrap gap-3">
            {genderOptions.slice(0, 7).map((gender) => (
              <CheckPill key={gender.value} name="show_genders" value={gender.value} label={gender.label} defaultChecked={showGenders.includes(gender.value)} />
            ))}
          </div>
        </SettingGroup>

        <SettingGroup label="Relationship Intentions" body="Prioritize members whose long-term direction overlaps with yours.">
          <div className="grid gap-3 sm:grid-cols-2">
            {relationshipGoalOptions.map((intent) => (
              <CheckPill
                key={intent.value}
                name="relationship_intents"
                value={intent.value}
                label={intent.label}
                caption={intent.caption}
                defaultChecked={relationshipIntents.includes(intent.value)}
              />
            ))}
          </div>
        </SettingGroup>

        <SettingGroup label="Safety Boundaries" body="Strict deal breakers automatically skip profiles that conflict with your selected non-negotiables.">
          <ToggleRow name="deal_breaker_strict" label="Active Deal Breakers" body="Maintain your selected standards while building your feed." defaultChecked={prefs?.deal_breaker_strict ?? true} />
        </SettingGroup>

        {state && !state.ok && (
          <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-6 text-[15px] font-bold text-red-200 animate-scale-in">
            <p>Check your filters.</p>
            <p className="mt-2 text-[13px] font-medium text-red-200/60">{state.error}</p>
          </div>
        )}

        {state && state.ok && (
          <div className="rounded-3xl border border-[var(--color-teal-500)]/20 bg-[var(--color-teal-500)]/5 p-6 text-[15px] font-bold text-[var(--color-teal-300)] animate-scale-in">
            <p>Discovery settings saved.</p>
            <p className="mt-2 text-[13px] font-medium text-[var(--color-teal-300)]/60">Your next feed will reflect these boundaries.</p>
          </div>
        )}

        <div className="pt-6">
          <Submit />
        </div>
      </form>
    </div>
  );
}
