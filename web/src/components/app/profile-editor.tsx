"use client";

import { useActionState, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import { useFormStatus } from "react-dom";
import type { UserProfileRow } from "@freeborn/shared";
import {
  dealBreakerOptions,
  genderOptions,
  interestOptions,
  lifestyleOptions,
  profilePrompts,
  relationshipGoalOptions,
} from "@freeborn/shared";
import { saveProfileEdit } from "@/lib/discover/actions";
import { DateOfBirthField } from "@/components/onboarding/date-of-birth-field";
import { SelectMenu } from "@/components/onboarding/select-menu";

type ProfileEditState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
} | null;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      className="magic-button w-full rounded-2xl bg-[var(--color-pearl)] px-5 py-4 text-sm font-extrabold text-[var(--color-ink)] transition hover:bg-white disabled:cursor-wait disabled:opacity-60"
    >
      {pending ? "Saving profile…" : "Save profile"}
    </button>
  );
}

const fieldClass =
  "mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3.5 text-sm font-semibold text-[var(--color-pearl)] outline-none transition placeholder:text-white/30 hover:border-white/18 focus:border-[var(--color-gold-500)] focus:bg-white/[0.055] focus:shadow-[0_0_0_3px_rgba(217,167,82,0.12)]";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-2 text-xs font-semibold leading-5 text-[var(--color-danger)]">{message}</p>;
}

function FormSection({ label, title, body, children }: { label: string; title: string; body: string; children: ReactNode }) {
  return (
    <section className="rounded-[32px] border border-white/5 bg-white/[0.015] p-6 sm:p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--color-gold-500)]/10 text-[11px] font-black text-[var(--color-gold-300)] ring-1 ring-[var(--color-gold-500)]/20">
            {label}
          </span>
          <h3 className="text-xl font-bold tracking-tight text-[var(--color-pearl)]">{title}</h3>
        </div>
        <p className="mt-3 text-[15px] font-medium leading-relaxed text-[var(--color-mist)]">{body}</p>
      </div>
      {children}
    </section>
  );
}

function TextField({ label, name, defaultValue, error, placeholder, maxLength, inputMode, className = "" }: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  error?: string;
  placeholder?: string;
  maxLength?: number;
  inputMode?: "numeric" | "text";
  className?: string;
}) {
  return (
    <div className="group space-y-2.5">
      <label className="px-1 text-[13px] font-bold uppercase tracking-wider text-[var(--color-sand)]">
        {label}
      </label>
      <input
        name={name}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        maxLength={maxLength}
        inputMode={inputMode}
        className={`min-h-[52px] w-full rounded-2xl border bg-white/[0.03] px-5 py-3.5 text-[15px] font-medium text-[var(--color-pearl)] outline-none transition-all placeholder:text-[var(--color-ash)] focus:bg-white/[0.06] ${
          error
            ? "border-[var(--color-danger)] shadow-[0_0_20px_-5px_rgba(255,107,122,0.2)]"
            : "border-white/10 hover:border-white/20 focus:border-[var(--color-gold-500)] focus:shadow-[0_0_20px_-10px_rgba(217,167,82,0.3)]"
        } ${className}`}
      />
      <FieldError message={error} />
    </div>
  );
}

function HiddenStableFields({ profile }: { profile: UserProfileRow }) {
  return (
    <>
      {(profile.show_gender ?? []).map((gender) => <input key={`show-${gender}`} type="hidden" name="show_gender" value={gender} />)}
    </>
  );
}

export function ProfileEditor({ profile }: { profile: UserProfileRow }) {
  const [state, formAction] = useActionState<ProfileEditState, FormData>(saveProfileEdit, null);
  const fieldErrors = state?.fieldErrors ?? {};
  const [birthDate, setBirthDate] = useState(profile.birth_date ?? "");
  const [gender, setGender] = useState(profile.gender ?? "");
  const [interests, setInterests] = useState<string[]>(profile.interests ?? []);
  const [lifestyle, setLifestyle] = useState<string[]>(profile.lifestyle_preferences ?? []);
  const [dealBreakers, setDealBreakers] = useState<string[]>(profile.deal_breakers ?? []);
  const [bio, setBio] = useState(profile.bio ?? "");
  const [goals, setGoals] = useState<string[]>(profile.relationship_goals ?? []);
  const [prompts, setPrompts] = useState<{ prompt: string; answer: string }[]>(
    Array.isArray(profile.prompt_answers) ? profile.prompt_answers.slice(0, 3) : [],
  );

  const toggle = (setter: Dispatch<SetStateAction<string[]>>, value: string, max = 99) => {
    setter((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : current.length < max ? [...current, value] : current,
    );
  };

  return (
    <div className="luminous-card rounded-[40px] border border-white/10 bg-white/[0.02] p-8 shadow-[var(--shadow-card-lg)] sm:p-12">
      <header className="mb-12">
        <div className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.25em] text-[var(--color-sand)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--color- gold-500)] shadow-[0_0_10px_rgba(217,167,82,0.6)]" />
          Profile Editor
        </div>
        <h2 
          className="mt-6 text-[clamp(2rem,6vw,2.75rem)] leading-[0.95] tracking-tight text-[var(--color-pearl)]"
          style={{ fontFamily: "var(--font-display)", fontVariationSettings: "'opsz' 144, 'wght' 450" }}
        >
          Your story, well-told.
        </h2>
        <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-[var(--color-mist)]">
          Share enough to be remembered. Values, daily rhythm, and clear intentions give others a doorway into conversation.
        </p>
      </header>

      <form action={formAction} className="space-y-10">
        <HiddenStableFields profile={profile} />

        <FormSection label="01" title="Public Identity" body="These details shape the first impression people see in discovery.">
          <div className="grid gap-6 sm:grid-cols-2">
            <TextField label="Display Name" name="display_name" defaultValue={profile.display_name} error={fieldErrors.display_name} placeholder="How should we introduce you?" />
            <div>
              <SelectMenu
                label="Gender Identity"
                value={gender}
                onChange={setGender}
                options={genderOptions.map((option) => ({ value: option.value, label: option.label }))}
                placeholder="Select gender"
                error={fieldErrors.gender}
              />
              <input type="hidden" name="gender" value={gender} />
            </div>
            <TextField label="Height (cm)" name="height_cm" defaultValue={profile.height_cm} error={fieldErrors.height_cm} inputMode="numeric" placeholder="Optional" />
          </div>
        </FormSection>

        <FormSection label="02" title="Birth Date" body="Used for age verification only. Your full birthday remains private.">
          <DateOfBirthField
            label="When were you born?"
            value={birthDate}
            onChange={setBirthDate}
            error={fieldErrors.birth_date}
          />
          <input type="hidden" name="birth_date" value={birthDate} />
        </FormSection>

        <FormSection label="03" title="Location & Context" body="Keep it practical enough for discovery to feel real.">
          <div className="grid gap-6 sm:grid-cols-2">
            <TextField label="City" name="city" defaultValue={profile.city} error={fieldErrors.city} placeholder="City name" />
            <TextField label="Region" name="region" defaultValue={profile.region} error={fieldErrors.region} placeholder="State or Province" />
            <TextField label="Country Code" name="country_code" defaultValue={profile.country_code} error={fieldErrors.country_code} maxLength={2} className="uppercase" placeholder="US" />
            <TextField label="Occupation" name="occupation" defaultValue={profile.occupation} error={fieldErrors.occupation} placeholder="What do you do?" />
            <TextField label="Education" name="education" defaultValue={profile.education} error={fieldErrors.education} placeholder="Where did you study?" />
          </div>
        </FormSection>

        <FormSection label="04" title="Bio & Intentions" body="A specific voice gives people something real to respond to.">
          <div className="group space-y-2.5">
            <div className="flex items-center justify-between gap-3 px-1">
              <label className="text-[13px] font-bold uppercase tracking-wider text-[var(--color-sand)]">Bio</label>
              <span className="text-[11px] font-bold text-[var(--color-ash)] uppercase tracking-widest">{bio.length} / 500</span>
            </div>
            <textarea
              name="bio"
              value={bio}
              onChange={(event) => setBio(event.target.value.slice(0, 500))}
              maxLength={500}
              rows={5}
              placeholder="What do you care about? What does a good Sunday look like?"
              className="min-h-[140px] w-full rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-[15px] font-medium leading-relaxed text-[var(--color-pearl)] outline-none transition-all placeholder:text-[var(--color-ash)] focus:border-[var(--color-gold-500)] focus:bg-white/[0.06] focus:shadow-[0_0_20px_-10px_rgba(217,167,82,0.3)] resize-none"
            />
            <FieldError message={fieldErrors.bio} />
          </div>

          <div className="mt-10">
            <div className="mb-4 flex items-center justify-between gap-3 px-1">
              <p className="text-[13px] font-bold uppercase tracking-wider text-[var(--color-sand)]">Relationship Goals</p>
              <p className="text-[11px] font-bold text-[var(--color-ash)] uppercase tracking-widest">{goals.length}/3</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {relationshipGoalOptions.map((option) => {
                const active = goals.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => toggle(setGoals, option.value, 3)}
                    className={`flex flex-col rounded-3xl border p-5 text-left transition-all active:scale-[0.98] ${active ? "border-[var(--color-gold-500)] bg-[var(--color-gold-500)]/10 shadow-[0_0_20px_-5px_rgba(217,167,82,0.2)]" : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"}`}
                  >
                    <span className={`text-[15px] font-bold ${active ? "text-[var(--color-pearl)]" : "text-[var(--color-sand)]"}`}>{option.label}</span>
                    <span className="mt-1.5 text-[13px] font-medium leading-relaxed text-[var(--color-mist)]">{option.caption}</span>
                  </button>
                );
              })}
            </div>
            <FieldError message={fieldErrors.relationship_goals} />
            {goals.map((goal) => <input key={goal} type="hidden" name="relationship_goals" value={goal} />)}
          </div>
        </FormSection>

        <FormSection label="05" title="Shared Values" body="Specific tags help surface people who fit your rhythm and standards.">
          <div className="space-y-8">
            <ChipGroup label={`Interests (${interests.length}/12)`} options={[...interestOptions]} value={interests} onToggle={(value) => toggle(setInterests, value, 12)} error={fieldErrors.interests} />
            {interests.map((interest) => <input key={interest} type="hidden" name="interests" value={interest} />)}

            <ChipGroup label={`Lifestyle (${lifestyle.length}/12)`} options={[...lifestyleOptions]} value={lifestyle} onToggle={(value) => toggle(setLifestyle, value, 12)} error={fieldErrors.lifestyle_preferences} />
            {lifestyle.map((item) => <input key={item} type="hidden" name="lifestyle_preferences" value={item} />)}
          </div>
        </FormSection>

        <FormSection label="06" title="Boundaries & Prompts" body="Deal breakers protect your time. Prompts provide deep conversation starters.">
          <div className="space-y-10">
            <ChipGroup label={`Non-Negotiables (${dealBreakers.length}/12)`} options={[...dealBreakerOptions]} value={dealBreakers} onToggle={(value) => toggle(setDealBreakers, value, 12)} error={fieldErrors.deal_breakers} soft />
            {dealBreakers.map((item) => <input key={item} type="hidden" name="deal_breakers" value={item} />)}

            <div className="space-y-6">
              <div className="flex items-center justify-between gap-3 px-1">
                <p className="text-[13px] font-bold uppercase tracking-wider text-[var(--color-sand)]">Profile Prompts</p>
                <p className="text-[11px] font-bold text-[var(--color-ash)] uppercase tracking-widest">3 Required</p>
              </div>
              <div className="grid gap-6">
                {[0, 1, 2].map((index) => {
                  const promptAnswer = prompts[index] ?? { prompt: "", answer: "" };
                  return (
                    <div key={index} className="rounded-[32px] border border-white/5 bg-white/[0.02] p-6 shadow-inner">
                      <SelectMenu
                        label={`Question ${index + 1}`}
                        value={promptAnswer.prompt}
                        onChange={(value) => {
                          setPrompts((current) => {
                            const next = [...current];
                            next[index] = { ...(next[index] ?? { answer: "" }), prompt: value, answer: next[index]?.answer ?? "" };
                            return next;
                          });
                        }}
                        options={profilePrompts.map((prompt) => ({ value: prompt, label: prompt }))}
                        placeholder="Choose a starting point…"
                      />
                      <div className="mt-4">
                        <textarea
                          value={promptAnswer.answer}
                          onChange={(event) => {
                            const value = event.target.value;
                            setPrompts((current) => {
                              const next = [...current];
                              next[index] = { ...(next[index] ?? { prompt: "" }), answer: value.slice(0, 280) };
                              return next;
                            });
                          }}
                          placeholder="Your thoughtful response…"
                          className="min-h-[100px] w-full rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-[15px] font-medium leading-relaxed text-[var(--color-pearl)] outline-none transition-all placeholder:text-[var(--color-ash)] focus:border-[var(--color-gold-500)] focus:bg-white/[0.06] resize-none"
                          rows={3}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <input type="hidden" name="prompt_answers" value={JSON.stringify(prompts.filter((prompt) => prompt.prompt && prompt.answer.length >= 8))} />
          <FieldError message={fieldErrors.prompt_answers} />
        </FormSection>

        {state && !state.ok ? (
          <div className="rounded-3xl border border-[var(--color-danger)]/20 bg-[var(--color-danger)]/5 p-6 text-[15px] font-bold text-red-200 animate-scale-in" role="alert">
            <p>We couldn&apos;t save your profile.</p>
            <p className="mt-2 text-[13px] font-medium text-red-200/60">{state.error ?? "Please review the highlighted fields and try again."}</p>
          </div>
        ) : null}

        {state && state.ok ? (
          <div className="rounded-3xl border border-[var(--color-teal-500)]/20 bg-[var(--color-teal-500)]/5 p-6 text-[15px] font-bold text-[var(--color-teal-300)] animate-scale-in" role="status">
            <p>Profile updated successfully.</p>
            <p className="mt-2 text-[13px] font-medium text-[var(--color-teal-300)]/60">Your changes are now live in the community room.</p>
          </div>
        ) : null}

        <div className="pt-6">
          <SubmitButton />
        </div>
      </form>
    </div>
  );
}

function ChipGroup({ label, options, value, onToggle, error, soft }: {
  label: string;
  options: string[];
  value: string[];
  onToggle: (value: string) => void;
  error?: string;
  soft?: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 px-1">
        <p className="text-[13px] font-bold uppercase tracking-wider text-[var(--color-sand)]">{label}</p>
        <p className="text-[11px] font-bold text-[var(--color-ash)] uppercase tracking-widest">Tap to select</p>
      </div>
      <div className="max-h-56 overflow-auto rounded-[32px] border border-white/5 bg-white/[0.015] p-5 shadow-inner">
        <div className="flex flex-wrap gap-2.5">
          {options.map((option) => {
            const active = value.includes(option);
            return (
              <button
                key={option}
                type="button"
                onClick={() => onToggle(option)}
                className={`h-[42px] rounded-full border px-5 text-[13px] font-bold transition-all active:scale-95 ${
                  active
                    ? soft
                      ? "border-red-500/30 bg-red-500/10 text-red-200 shadow-[0_0_15px_rgba(239,94,94,0.15)]"
                      : "border-[var(--color-gold-500)] bg-[var(--color-gold-500)]/15 text-[var(--color-pearl)] shadow-[0_0_15px_rgba(217,167,82,0.2)]"
                    : "border-white/10 bg-white/[0.03] text-[var(--color-sand)] hover:border-white/20 hover:bg-white/[0.06] hover:text-[var(--color-pearl)]"
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>
      <FieldError message={error} />
    </div>
  );
}
