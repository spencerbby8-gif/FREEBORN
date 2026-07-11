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
    <section className="rounded-[24px] border border-white/8 bg-white/[0.025] p-4 sm:p-5">
      <div className="mb-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--color-stone)]">{label}</p>
        <h3 className="mt-2 text-lg font-semibold tracking-[-0.02em] text-[var(--color-pearl)]">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-[var(--color-mist)]">{body}</p>
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
    <label className="block">
      <span className="text-xs font-semibold text-[var(--color-mist)]">{label}</span>
      <input
        name={name}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        maxLength={maxLength}
        inputMode={inputMode}
        className={`${fieldClass} ${className}`}
      />
      <FieldError message={error} />
    </label>
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
    <div className="luminous-card rounded-[28px] border border-white/10 bg-white/[0.035] p-6 sm:p-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.20em] text-[var(--color-stone)]">Edit profile</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[var(--color-pearl)]">Your story, well-told and easy to trust.</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-mist)]">
            Share enough to be remembered: values, relationship direction, and the daily rhythm that matters to you. Email, full birth date, account provider details, and private medical history stay out of your public profile.
          </p>
        </div>
      </div>

      <form action={formAction} className="mt-6 space-y-5">
        <HiddenStableFields profile={profile} />

        <FormSection label="01" title="Public identity" body="These details shape the first impression people see in discovery.">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Display name" name="display_name" defaultValue={profile.display_name} error={fieldErrors.display_name} placeholder="How should Freeborn introduce you?" />
            <div>
              <SelectMenu
                label="Gender"
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

        <FormSection label="02" title="Private age gate" body="Your birth date confirms 18+ eligibility. Only your age appears publicly.">
          <DateOfBirthField
            label="Birth date"
            value={birthDate}
            onChange={setBirthDate}
            error={fieldErrors.birth_date}
            hint="We use this to confirm you're 18 or older. It's never shown publicly."
          />
          <input type="hidden" name="birth_date" value={birthDate} />
        </FormSection>

        <FormSection label="03" title="Location and context" body="Keep it practical enough for discovery to feel real.">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="City" name="city" defaultValue={profile.city} error={fieldErrors.city} placeholder="City" />
            <TextField label="Region" name="region" defaultValue={profile.region} error={fieldErrors.region} placeholder="State, province, or region" />
            <TextField label="Country code" name="country_code" defaultValue={profile.country_code} error={fieldErrors.country_code} maxLength={2} className="uppercase" placeholder="US" />
            <TextField label="Occupation" name="occupation" defaultValue={profile.occupation} error={fieldErrors.occupation} placeholder="What do you do?" />
            <TextField label="Education" name="education" defaultValue={profile.education} error={fieldErrors.education} placeholder="Where did you study?" />
          </div>
        </FormSection>

        <FormSection label="04" title="Bio and intentions" body="A specific voice gives people something real to respond to.">
          <label className="block">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-semibold text-[var(--color-mist)]">Bio</span>
              <span className="text-xs text-[var(--color-mist)]">{bio.length} / 500</span>
            </div>
            <textarea
              name="bio"
              value={bio}
              onChange={(event) => setBio(event.target.value.slice(0, 500))}
              maxLength={500}
              rows={5}
              placeholder="What do you care about? What does a good Sunday look like?"
              className={`${fieldClass} resize-none leading-7`}
            />
            <FieldError message={fieldErrors.bio} />
          </label>

          <div className="mt-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-xs font-semibold text-[var(--color-mist)]">Relationship goals</p>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--color-stone)]">{goals.length}/3</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {relationshipGoalOptions.map((option) => {
                const active = goals.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => toggle(setGoals, option.value, 3)}
                    className={`rounded-2xl border p-4 text-left transition ${active ? "border-[rgba(246,215,154,0.40)] bg-[rgba(217,167,82,0.12)]" : "border-white/10 bg-white/[0.025] hover:border-white/18 hover:bg-white/[0.045]"}`}
                  >
                    <span className="block text-sm font-bold text-[var(--color-pearl)]">{option.label}</span>
                    <span className="mt-1 block text-xs leading-5 text-[var(--color-mist)]">{option.caption}</span>
                  </button>
                );
              })}
            </div>
            <FieldError message={fieldErrors.relationship_goals} />
            {goals.map((goal) => <input key={goal} type="hidden" name="relationship_goals" value={goal} />)}
          </div>
        </FormSection>

        <FormSection label="05" title="Interests and lifestyle" body="Specific tags become better opening lines than generic small talk.">
          <div className="grid gap-5">
            <ChipGroup label={`Interests (${interests.length}/12)`} options={[...interestOptions]} value={interests} onToggle={(value) => toggle(setInterests, value, 12)} error={fieldErrors.interests} />
            {interests.map((interest) => <input key={interest} type="hidden" name="interests" value={interest} />)}

            <ChipGroup label={`Lifestyle (${lifestyle.length}/12)`} options={[...lifestyleOptions]} value={lifestyle} onToggle={(value) => toggle(setLifestyle, value, 12)} error={fieldErrors.lifestyle_preferences} />
            {lifestyle.map((item) => <input key={item} type="hidden" name="lifestyle_preferences" value={item} />)}
          </div>
        </FormSection>

        <FormSection label="06" title="Boundaries and prompts" body="Deal breakers protect your time. Prompts give people a doorway into conversation.">
          <ChipGroup label={`Deal breakers (${dealBreakers.length}/12)`} options={[...dealBreakerOptions]} value={dealBreakers} onToggle={(value) => toggle(setDealBreakers, value, 12)} error={fieldErrors.deal_breakers} soft />
          {dealBreakers.map((item) => <input key={item} type="hidden" name="deal_breakers" value={item} />)}

          <div className="mt-5 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold text-[var(--color-mist)]">Prompts</p>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--color-stone)]">Up to 3</p>
            </div>
            {[0, 1, 2].map((index) => {
              const promptAnswer = prompts[index] ?? { prompt: "", answer: "" };
              return (
                <div key={index} className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
                  <SelectMenu
                    label={`Prompt ${index + 1}`}
                    value={promptAnswer.prompt}
                    onChange={(value) => {
                      setPrompts((current) => {
                        const next = [...current];
                        next[index] = { ...(next[index] ?? { answer: "" }), prompt: value, answer: next[index]?.answer ?? "" };
                        return next;
                      });
                    }}
                    options={profilePrompts.map((prompt) => ({ value: prompt, label: prompt }))}
                    placeholder="Choose a prompt…"
                  />
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
                    placeholder="Answer in your own voice…"
                    className={`${fieldClass} min-h-[92px] resize-none leading-6`}
                    rows={3}
                  />
                </div>
              );
            })}
          </div>
          <input type="hidden" name="prompt_answers" value={JSON.stringify(prompts.filter((prompt) => prompt.prompt && prompt.answer.length >= 8))} />
          <FieldError message={fieldErrors.prompt_answers} />
        </FormSection>

        {state && !state.ok ? (
          <div className="rounded-2xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 px-4 py-3 text-sm text-red-100" role="alert">
            <p className="font-semibold">We couldn&apos;t save your profile.</p>
            <p className="mt-1 text-red-100/80">{state.error ?? "Please review the highlighted fields and try again."}</p>
          </div>
        ) : null}

        {state && state.ok ? (
          <div className="rounded-2xl border border-[var(--color-success)]/30 bg-[var(--color-success)]/10 px-4 py-3 text-sm text-emerald-100" role="status">
            <p className="font-semibold">Profile saved.</p>
            <p className="mt-1 text-emerald-100/80">Your public profile preview and discovery card will use these details.</p>
          </div>
        ) : null}

        <SubmitButton />
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
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-xs font-semibold text-[var(--color-mist)]">{label}</p>
        <p className="text-[11px] text-[var(--color-stone)]">Tap to select</p>
      </div>
      <div className="max-h-48 overflow-auto rounded-2xl border border-white/8 bg-white/[0.02] p-3">
        <div className="flex flex-wrap gap-2">
          {options.map((option) => {
            const active = value.includes(option);
            return (
              <button
                key={option}
                type="button"
                onClick={() => onToggle(option)}
                className={`min-h-9 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  active
                    ? soft
                      ? "border-rose-300/30 bg-rose-300/10 text-rose-100"
                      : "border-[rgba(246,215,154,0.40)] bg-[rgba(217,167,82,0.12)] text-[var(--color-pearl)]"
                    : "border-white/10 bg-white/[0.025] text-[var(--color-mist)] hover:border-white/18 hover:bg-white/[0.05]"
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
