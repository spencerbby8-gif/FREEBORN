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
    <section className="rounded-[22px] border border-white/8 bg-white/[0.025] p-4 sm:p-5">
      <div className="mb-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--color-stone)]">{label}</p>
        <p className="mt-1 text-sm leading-6 text-[var(--color-mist)]">{body}</p>
      </div>
      {children}
    </section>
  );
}

const inputClass =
  "mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3.5 text-sm font-semibold text-[var(--color-pearl)] outline-none transition placeholder:text-white/30 hover:border-white/18 focus:border-[var(--color-gold-500)] focus:bg-white/[0.055] focus:shadow-[0_0_0_3px_rgba(217,167,82,0.12)]";

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
    <div id="discovery" className="luminous-card rounded-[28px] border border-white/10 bg-white/[0.035] p-6 sm:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.20em] text-[var(--color-stone)]">Profile settings</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[var(--color-pearl)]">Discovery settings</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--color-mist)]">
            Set who appears in your room. These boundaries shape your next feed without exposing private essentials or turning values into a checklist.
          </p>
        </div>
        <span className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] ${profile.discoverable ? "border-[rgba(109,211,176,0.28)] bg-[rgba(109,211,176,0.10)] text-[var(--color-success)]" : "border-white/10 bg-white/[0.04] text-[var(--color-mist)]"}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {profile.discoverable ? "Visible in discovery" : "Hidden from discovery"}
        </span>
      </div>

      <form action={formAction} className="mt-6 space-y-5">
        <SettingGroup
          label="Visibility and trust"
          body="Verified-only narrows the room. Photos-required keeps the feed recognizable. Your own discoverability is controlled in Edit Profile."
        >
          <div className="space-y-3">
            <ToggleRow name="verified_only" label="Verified profiles only" body="Show only members with earned verification status." defaultChecked={prefs?.verified_only ?? false} />
            <ToggleRow name="photos_required" label="Require profile photos" body="Hide profiles that do not yet have public photos." defaultChecked={prefs?.photos_required ?? true} />
          </div>
        </SettingGroup>

        <SettingGroup label="Age and distance" body="Keep the basics realistic enough to become a real meeting.">
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="block">
              <span className="text-xs font-semibold text-[var(--color-mist)]">Min age</span>
              <input type="number" name="age_min" defaultValue={ageMin} min={18} max={80} className={inputClass} />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-[var(--color-mist)]">Max age</span>
              <input type="number" name="age_max" defaultValue={ageMax} min={18} max={99} className={inputClass} />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-[var(--color-mist)]">Distance km</span>
              <input type="number" name="distance_km" defaultValue={distance} min={5} max={500} className={inputClass} />
            </label>
          </div>
          <p className="mt-3 text-xs leading-5 text-[var(--color-mist)]">Age must start at 18+. Distance can be 5–500 km.</p>
        </SettingGroup>

        <SettingGroup label="Who appears" body="Choose the gender identities you want included in discovery.">
          <div className="flex flex-wrap gap-2">
            {genderOptions.slice(0, 7).map((gender) => (
              <CheckPill key={gender.value} name="show_genders" value={gender.value} label={gender.label} defaultChecked={showGenders.includes(gender.value)} />
            ))}
          </div>
        </SettingGroup>

        <SettingGroup label="Intentions" body="Prioritize profiles whose relationship direction overlaps with yours.">
          <div className="grid gap-2 sm:grid-cols-2">
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

        <SettingGroup label="Boundaries" body="Strict deal breakers skip profiles that conflict with the non-negotiables you selected.">
          <ToggleRow name="deal_breaker_strict" label="Use strict deal breakers" body="Keep deal breakers active while building your feed." defaultChecked={prefs?.deal_breaker_strict ?? true} />
        </SettingGroup>

        {state && !state.ok ? (
          <div className="rounded-2xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 px-4 py-3 text-sm text-red-100" role="alert">
            <p className="font-semibold">Check your filters.</p>
            <p className="mt-1 text-red-100/80">{state.error}</p>
          </div>
        ) : null}

        {state && state.ok ? (
          <div className="rounded-2xl border border-[var(--color-success)]/30 bg-[var(--color-success)]/10 px-4 py-3 text-sm text-emerald-100" role="status">
            <p className="font-semibold">Discovery settings saved.</p>
            <p className="mt-1 text-emerald-100/80">Your next feed will reflect these boundaries. <Link href="/app" className="font-bold underline decoration-emerald-100/30 underline-offset-2">Return to Discover</Link>.</p>
          </div>
        ) : null}

        <Submit />
      </form>
    </div>
  );
}
