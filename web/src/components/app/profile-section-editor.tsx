"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import type { UserProfileRow } from "@freeborn/shared";
import { dealBreakerOptions, genderOptions, interestOptions, lifestyleOptions, profilePrompts, relationshipGoalOptions, valueOptions } from "@freeborn/shared";
import { saveProfileSection, type ProfileSectionState } from "@/lib/profile/actions";
import { ArrowIcon, LockIcon } from "@/components/icons";
import { DateOfBirthField } from "@/components/onboarding/date-of-birth-field";
import { SelectMenu } from "@/components/onboarding/select-menu";
import { humanize } from "./profile-utils";

export type ProfileSectionId =
  | "about-me"
  | "intent"
  | "values"
  | "lifestyle"
  | "interests"
  | "prompts"
  | "dealbreakers"
  | "privacy-visibility";

const sectionMeta: Record<ProfileSectionId, { eyebrow: string; title: string; body: string; privacy: string }> = {
  "about-me": {
    eyebrow: "About Me",
    title: "The essentials people use to understand you.",
    body: "Keep this focused: public identity, age gate, location context, and one grounded introduction.",
    privacy: "Your full birth date is saved for age-gating only and is never shown publicly.",
  },
  intent: {
    eyebrow: "Intent",
    title: "Name the relationship direction you want.",
    body: "Choose up to three intentions so the right people understand your pace and seriousness.",
    privacy: "Intentions are public compatibility signals in discovery.",
  },
  values: {
    eyebrow: "Values",
    title: "Choose the values that shape compatibility.",
    body: "Keep the niche balanced and human. Select the values that genuinely affect how you build life.",
    privacy: "Values may appear on your public profile and discovery card.",
  },
  lifestyle: {
    eyebrow: "Lifestyle",
    title: "Show your everyday rhythm.",
    body: "Lifestyle cues make your profile feel specific without becoming a form stack.",
    privacy: "Lifestyle tags are public matching context.",
  },
  interests: {
    eyebrow: "Interests",
    title: "Add conversation starters.",
    body: "Interests give someone an easy, specific way to begin a thoughtful message.",
    privacy: "Interests are public and help discovery feel more personal.",
  },
  prompts: {
    eyebrow: "Prompts",
    title: "Give people something deeper to respond to.",
    body: "A few sharp answers can say more than another list of tags.",
    privacy: "Prompt answers appear on your public profile. Avoid private contact details.",
  },
  dealbreakers: {
    eyebrow: "Dealbreakers",
    title: "Protect your attention with clear boundaries.",
    body: "Choose non-negotiables that would make a match feel misaligned.",
    privacy: "Dealbreakers guide matching and may inform discovery filtering.",
  },
  "privacy-visibility": {
    eyebrow: "Privacy & Visibility",
    title: "Control whether you appear in discovery.",
    body: "Visibility is the most important privacy switch. Hidden means you will not appear in discovery.",
    privacy: "Email, full birth date, account provider, and exact coordinates remain private.",
  },
};

function SubmitButton({ hidden }: { hidden?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`${hidden ? "sr-only" : ""} magic-button inline-flex h-[52px] items-center justify-center rounded-2xl bg-[var(--color-pearl)] px-6 text-sm font-black text-[var(--color-ink)] transition hover:bg-white disabled:cursor-wait disabled:opacity-60`}
    >
      {pending ? "Saving…" : "Save changes"}
    </button>
  );
}

function Field({ label, children, error, hint }: { label: string; children: ReactNode; error?: string; hint?: string }) {
  return (
    <div className="space-y-2.5">
      <label className="px-1 text-[13px] font-black uppercase tracking-wider text-[var(--color-sand)]">{label}</label>
      {children}
      {error ? <p className="px-1 text-xs font-bold leading-5 text-[var(--color-danger)]">{error}</p> : hint ? <p className="px-1 text-xs leading-5 text-[var(--color-mist)]">{hint}</p> : null}
    </div>
  );
}

const inputClass = "min-h-[52px] w-full rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3.5 text-[15px] font-medium text-[var(--color-pearl)] outline-none transition placeholder:text-[var(--color-ash)] hover:border-white/20 focus:border-[var(--color-gold-500)] focus:bg-white/[0.06]";

function ChipPicker({ name, options, value, setValue, max, soft }: { name: string; options: readonly string[]; value: string[]; setValue: (next: string[]) => void; max: number; soft?: boolean }) {
  const toggle = (option: string) => {
    setValue(value.includes(option) ? value.filter((item) => item !== option) : value.length < max ? [...value, option] : value);
  };
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <p className="text-[12px] font-black uppercase tracking-[0.2em] text-[var(--color-ash)]">Tap to select</p>
        <p className="text-[12px] font-black uppercase tracking-[0.2em] text-[var(--color-sand)]">{value.length}/{max}</p>
      </div>
      <div className="rounded-[32px] border border-white/8 bg-white/[0.015] p-4 shadow-inner sm:p-5">
        <div className="flex max-h-[420px] flex-wrap gap-2.5 overflow-auto pr-1">
          {options.map((option) => {
            const active = value.includes(option);
            return (
              <button
                key={option}
                type="button"
                aria-pressed={active}
                onClick={() => toggle(option)}
                className={`min-h-11 rounded-full border px-4 text-sm font-bold transition active:scale-95 ${
                  active
                    ? soft
                      ? "border-red-400/30 bg-red-400/10 text-red-100"
                      : "border-[var(--color-gold-500)] bg-[var(--color-gold-500)]/15 text-[var(--color-pearl)]"
                    : "border-white/10 bg-white/[0.03] text-[var(--color-sand)] hover:border-white/20 hover:bg-white/[0.06]"
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>
      {value.map((item) => <input key={item} type="hidden" name={name} value={item} />)}
    </div>
  );
}

function IntentPicker({ value, setValue }: { value: string[]; setValue: (next: string[]) => void }) {
  const toggle = (goal: string) => {
    setValue(value.includes(goal) ? value.filter((item) => item !== goal) : value.length < 3 ? [...value, goal] : value);
  };
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {relationshipGoalOptions.map((option) => {
        const active = value.includes(option.value);
        return (
          <button key={option.value} type="button" onClick={() => toggle(option.value)} className={`rounded-3xl border p-5 text-left transition active:scale-[0.98] ${active ? "border-[var(--color-gold-500)] bg-[var(--color-gold-500)]/10" : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"}`}>
            <span className="block text-base font-black text-[var(--color-pearl)]">{option.label}</span>
            <span className="mt-1.5 block text-sm leading-6 text-[var(--color-mist)]">{option.caption}</span>
          </button>
        );
      })}
      {value.map((goal) => <input key={goal} type="hidden" name="relationship_goals" value={goal} />)}
    </div>
  );
}

function SaveState({ state, saving }: { state: ProfileSectionState; saving: boolean }) {
  if (saving) return <span className="text-[var(--color-gold-300)]">Saving…</span>;
  if (state?.ok) return <span className="text-[var(--color-teal-300)]">Saved</span>;
  if (state && !state.ok) return <span className="text-[var(--color-danger)]">Needs review</span>;
  return <span className="text-[var(--color-mist)]">Autosave ready</span>;
}

export function ProfileSectionEditor({ section, profile }: { section: ProfileSectionId; profile: UserProfileRow }) {
  const [state, action] = useActionState<ProfileSectionState, FormData>(saveProfileSection, null);
  const formRef = useRef<HTMLFormElement>(null);
  const [saving, setSaving] = useState(false);
  const [birthDate, setBirthDate] = useState(profile.birth_date ?? "");
  const [gender, setGender] = useState(profile.gender ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [goals, setGoals] = useState<string[]>(profile.relationship_goals ?? []);
  const [values, setValues] = useState<string[]>(profile.values ?? []);
  const [lifestyle, setLifestyle] = useState<string[]>(profile.lifestyle_preferences ?? []);
  const [interests, setInterests] = useState<string[]>(profile.interests ?? []);
  const [dealBreakers, setDealBreakers] = useState<string[]>(profile.deal_breakers ?? []);
  const [discoverable, setDiscoverable] = useState(profile.discoverable);
  const [prompts, setPrompts] = useState<{ prompt: string; answer: string }[]>(Array.isArray(profile.prompt_answers) ? profile.prompt_answers.slice(0, 3) : []);
  const [dirtyKey, setDirtyKey] = useState(0);
  const meta = sectionMeta[section];
  const fieldErrors = state?.fieldErrors ?? {};

  const markDirty = () => {
    setSaving(true);
    setDirtyKey((value) => value + 1);
  };

  useEffect(() => {
    if (!dirtyKey) return;
    const timer = window.setTimeout(() => {
      formRef.current?.requestSubmit();
      window.setTimeout(() => setSaving(false), 450);
    }, 850);
    return () => window.clearTimeout(timer);
  }, [dirtyKey]);

  const promptJson = useMemo(() => JSON.stringify(prompts.filter((prompt) => prompt.prompt && prompt.answer.trim().length >= 8)), [prompts]);

  return (
    <div className="mx-auto w-full max-w-[980px] space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link href="/app/profile" className="inline-flex items-center gap-2 text-sm font-bold text-[var(--color-mist)] transition hover:text-[var(--color-pearl)]"><ArrowIcon size={16} className="rotate-180" /> Profile hub</Link>
          <p className="mt-6 text-xs font-black uppercase tracking-[0.24em] text-[var(--color-sand)]">{meta.eyebrow}</p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-[clamp(2.15rem,5vw,3.8rem)] leading-[0.94] tracking-[-0.05em] text-[var(--color-pearl)]">{meta.title}</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--color-mist)] sm:text-base">{meta.body}</p>
        </div>
        <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-black uppercase tracking-widest"><SaveState state={state} saving={saving} /></div>
      </header>

      <form ref={formRef} action={action} onChange={markDirty} className="luminous-card rounded-[38px] border border-white/10 bg-white/[0.02] p-5 shadow-[var(--shadow-card-lg)] sm:p-8">
        <input type="hidden" name="section" value={section} />

        {section === "about-me" ? (
          <div className="grid gap-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Display name" error={fieldErrors.display_name}><input className={inputClass} name="display_name" defaultValue={profile.display_name ?? ""} placeholder="How should people meet you?" /></Field>
              <Field label="Gender" error={fieldErrors.gender}><SelectMenu value={gender} onChange={(value) => { setGender(value); markDirty(); }} options={genderOptions.map((option) => ({ value: option.value, label: option.label }))} placeholder="Choose gender" hideLabel /><input type="hidden" name="gender" value={gender} /></Field>
              <Field label="Height (cm)" error={fieldErrors.height_cm}><input className={inputClass} name="height_cm" defaultValue={profile.height_cm ?? ""} inputMode="numeric" placeholder="Optional" /></Field>
              <Field label="City" error={fieldErrors.city}><input className={inputClass} name="city" defaultValue={profile.city ?? ""} placeholder="City" /></Field>
              <Field label="Region" error={fieldErrors.region}><input className={inputClass} name="region" defaultValue={profile.region ?? ""} placeholder="State or region" /></Field>
              <Field label="Country code" error={fieldErrors.country_code}><input className={`${inputClass} uppercase`} name="country_code" defaultValue={profile.country_code ?? ""} maxLength={2} placeholder="US" /></Field>
              <Field label="Occupation" error={fieldErrors.occupation}><input className={inputClass} name="occupation" defaultValue={profile.occupation ?? ""} placeholder="What do you do?" /></Field>
              <Field label="Education" error={fieldErrors.education}><input className={inputClass} name="education" defaultValue={profile.education ?? ""} placeholder="Field, school, or meaningful learning" /></Field>
            </div>
            <Field label="Private birth date" error={fieldErrors.birth_date} hint="Used for age only. Your full date never appears publicly."><DateOfBirthField value={birthDate} onChange={(value) => { setBirthDate(value); markDirty(); }} /><input type="hidden" name="birth_date" value={birthDate} /></Field>
            <Field label={`Bio ${bio.length}/500`} error={fieldErrors.bio}><textarea className={`${inputClass} min-h-36 resize-none leading-7`} name="bio" value={bio} maxLength={500} onChange={(event) => setBio(event.target.value.slice(0, 500))} placeholder="What do you value? What does a good Sunday or wellness rhythm look like?" /></Field>
          </div>
        ) : null}

        {section === "intent" ? <IntentPicker value={goals} setValue={(next) => { setGoals(next); markDirty(); }} /> : null}
        {section === "values" ? <ChipPicker name="values" options={valueOptions} value={values} setValue={(next) => { setValues(next); markDirty(); }} max={8} /> : null}
        {section === "lifestyle" ? <ChipPicker name="lifestyle_preferences" options={lifestyleOptions} value={lifestyle} setValue={(next) => { setLifestyle(next); markDirty(); }} max={12} /> : null}
        {section === "interests" ? <ChipPicker name="interests" options={interestOptions} value={interests} setValue={(next) => { setInterests(next); markDirty(); }} max={12} /> : null}
        {section === "dealbreakers" ? <ChipPicker name="deal_breakers" options={dealBreakerOptions} value={dealBreakers} setValue={(next) => { setDealBreakers(next); markDirty(); }} max={12} soft /> : null}

        {section === "prompts" ? (
          <div className="space-y-5">
            {[0, 1, 2].map((index) => {
              const current = prompts[index] ?? { prompt: "", answer: "" };
              return (
                <div key={index} className="rounded-[30px] border border-white/8 bg-white/[0.02] p-5">
                  <SelectMenu label={`Prompt ${index + 1}`} value={current.prompt} onChange={(prompt) => { const next = [...prompts]; next[index] = { prompt, answer: current.answer }; setPrompts(next); markDirty(); }} options={profilePrompts.map((prompt) => ({ value: prompt, label: prompt }))} placeholder="Choose a prompt" />
                  <textarea className={`${inputClass} mt-4 min-h-28 resize-none leading-7`} value={current.answer} maxLength={280} onChange={(event) => { const next = [...prompts]; next[index] = { prompt: current.prompt, answer: event.target.value.slice(0, 280) }; setPrompts(next); markDirty(); }} placeholder="Answer with something specific and warm." />
                </div>
              );
            })}
            <input type="hidden" name="prompt_answers" value={promptJson} />
          </div>
        ) : null}

        {section === "privacy-visibility" ? (
          <div className="space-y-5">
            <Link href="/app/profile/verification" className="flex items-start gap-4 rounded-[30px] border border-[var(--color-gold-500)]/20 bg-[var(--color-gold-500)]/7 p-5 transition hover:bg-[var(--color-gold-500)]/10">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-gold-500)]/10 text-[var(--color-gold-300)]"><LockIcon size={18} /></span>
              <span>
                <span className="block text-base font-black text-[var(--color-pearl)]">Verification and trust status</span>
                <span className="mt-1 block text-sm leading-6 text-[var(--color-mist)]">See what verification means, what stays private, and the next step to complete it.</span>
              </span>
            </Link>
            <button type="button" onClick={() => { setDiscoverable(!discoverable); markDirty(); }} className={`flex w-full items-center justify-between gap-4 rounded-[30px] border p-5 text-left transition ${discoverable ? "border-[var(--color-teal-500)]/30 bg-[var(--color-teal-500)]/10" : "border-white/10 bg-white/[0.03]"}`}>
              <span>
                <span className="block text-lg font-black text-[var(--color-pearl)]">{discoverable ? "Visible in discovery" : "Hidden from discovery"}</span>
                <span className="mt-1 block text-sm leading-6 text-[var(--color-mist)]">{discoverable ? "People may see your profile when filters match." : "You will not appear in discovery while hidden."}</span>
              </span>
              <span className={`h-7 w-12 rounded-full p-1 ${discoverable ? "bg-[var(--color-teal-500)]" : "bg-white/12"}`}><span className={`block h-5 w-5 rounded-full bg-white transition ${discoverable ? "translate-x-5" : ""}`} /></span>
            </button>
            <input type="hidden" name="discoverable" value={String(discoverable)} />
          </div>
        ) : null}

        {state && !state.ok ? <div className="mt-6 rounded-3xl border border-red-400/20 bg-red-500/5 p-5 text-sm font-bold text-red-100" role="alert">{state.error ?? "We could not save this section."}</div> : null}
        {state?.ok ? <div className="mt-6 rounded-3xl border border-[var(--color-teal-500)]/20 bg-[var(--color-teal-500)]/5 p-5 text-sm font-bold text-[var(--color-teal-300)]" role="status">Section saved. Your public profile reflects the latest changes.</div> : null}

        <div className="mt-8 flex flex-col gap-4 border-t border-white/8 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3 text-xs leading-5 text-[var(--color-mist)]"><LockIcon size={16} className="mt-0.5 shrink-0 text-[var(--color-gold-300)]" /> {meta.privacy}</div>
          <SubmitButton />
        </div>
        <SubmitButton hidden />
      </form>
    </div>
  );
}

export function AccountStatusPanel({ profile, userEmail }: { profile: UserProfileRow; userEmail?: string | null }) {
  const rows = [
    ["Email", userEmail ?? "Not available", "Only you can see this."],
    ["Verification", profile.is_verified ? "Verified" : "Not verified yet", profile.is_verified ? "Your public trust badge is active." : "Complete verification to activate the public trust badge."],
    ["Profile status", humanize(profile.profile_status), "Controls whether your account is active, paused, or hidden."],
    ["Discoverability", profile.discoverable ? "Visible in discovery" : "Hidden from discovery", "Hidden means members will not see you in discovery."],
  ];
  return (
    <div className="mx-auto w-full max-w-[860px] space-y-6">
      <Link href="/app/profile" className="inline-flex items-center gap-2 text-sm font-bold text-[var(--color-mist)] transition hover:text-[var(--color-pearl)]"><ArrowIcon size={16} className="rotate-180" /> Profile hub</Link>
      <section className="luminous-card rounded-[38px] border border-white/10 bg-white/[0.02] p-6 shadow-[var(--shadow-card-lg)] sm:p-8">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--color-sand)]">Account Status</p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-[clamp(2.2rem,5vw,3.8rem)] leading-[0.94] tracking-[-0.05em] text-[var(--color-pearl)]">Private account details.</h1>
        <div className="mt-8 grid gap-3">
          {rows.map(([label, value, body]) => (
            <div key={label} className="rounded-3xl border border-white/8 bg-white/[0.025] p-5">
              <p className="text-[11px] font-black uppercase tracking-widest text-[var(--color-ash)]">{label}</p>
              <p className="mt-2 text-lg font-black text-[var(--color-pearl)]">{value}</p>
              <p className="mt-1 text-sm leading-6 text-[var(--color-mist)]">{body}</p>
            </div>
          ))}
        </div>
        <Link href="/app/profile/verification" className="mt-8 flex h-[52px] w-full items-center justify-center rounded-2xl bg-[var(--color-pearl)] px-5 text-sm font-black text-[var(--color-ink)] transition hover:bg-white">
          {profile.is_verified ? "View verification" : "Complete verification"}
        </Link>
        <form action="/auth/signout" method="post" className="mt-3">
          <button className="h-[52px] w-full rounded-2xl border border-red-400/20 bg-red-500/5 px-5 text-sm font-black uppercase tracking-widest text-red-200 transition hover:bg-red-500/10">Sign out</button>
        </form>
      </section>
    </div>
  );
}
