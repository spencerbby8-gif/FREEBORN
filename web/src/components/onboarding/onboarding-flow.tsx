"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  type OnboardingDraft,
  dealBreakerOptions,
  genderOptions,
  interestOptions,
  lifestyleOptions,
  onboardingFieldHints,
  onboardingStepOrder,
  relationshipGoalOptions,
} from "@freeborn/shared";
import {
  onboardingAboutYouSchema,
  onboardingBioGoalsSchema,
  onboardingIdentitySchema,
  onboardingInterestsLifestyleSchema,
  onboardingPreferencesExtrasSchema,
} from "@freeborn/shared";
import {
  completeOnboarding,
  saveOnboardingAboutYou,
  saveOnboardingBioGoals,
  saveOnboardingIdentity,
  saveOnboardingInterestsLifestyle,
  saveOnboardingPreferencesExtras,
  type OnboardingActionResponse,
} from "@/lib/onboarding/actions";
import { OnboardingProgress } from "./onboarding-progress";
import { OnboardingTextInput, OnboardingTextarea } from "./onboarding-field";
import { SelectMenu } from "./select-menu";
import { DateOfBirthField } from "./date-of-birth-field";
import { ChipSelect } from "./chip-select";
import { OptionCardRow } from "./option-card-row";
import { ArrowIcon, CheckIcon } from "@/components/icons";

type Draft = OnboardingDraft;
type FieldErrors = Partial<Record<keyof Draft, string>>;
type Notice = { tone: "success" | "error"; title: string; body: string };

const stepMeta = [
  {
    key: "identity",
    title: "Let's start with the basics.",
    description: "Your name and birthday build a safe foundation. Everything saves as you go.",
    tip: "Your birthday stays private — we only use it to confirm you're 18 or older.",
  },
  {
    key: "about_you",
    title: "Where you are, how you identify.",
    description: "These details shape who discovers you. You can refine them anytime.",
    tip: "Add your region and country to surface matches close enough to become real.",
  },
  {
    key: "bio_goals",
    title: "Your voice, your intentions.",
    description: "A short, honest bio, your values, and a few goals go a long way toward the right kind of attention.",
    tip: "Lead with what you value and what you love. Warmth opens more doors than a checklist.",
  },
  {
    key: "interests_lifestyle",
    title: "What lights you up?",
    description: "These details spark conversation and help discovery feel human, especially when wellness and daily rhythm matter to you.",
    tip: "The more specific you are, the better your opening messages will feel.",
  },
  {
    key: "preferences_extras",
    title: "The finer details.",
    description: "Deal breakers keep discovery honest. The rest is optional texture.",
    tip: "Deal breakers are optional but powerful — they skip the matches that would never work, including pressure around values or health choices.",
  },
] as const;

const COMPLETE_INDEX = 5;

function Spinner() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" className="spin" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function OnboardingFlow({
  initialDraft,
  initialStepIndex,
  maxStepIndex,
}: {
  initialDraft: Draft;
  initialStepIndex: number;
  maxStepIndex: number;
}) {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(
    Math.min(initialStepIndex, maxStepIndex, COMPLETE_INDEX),
  );
  const [draft, setDraft] = useState<Draft>(initialDraft);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [notice, setNotice] = useState<Notice | null>(null);
  const [pending, setPending] = useState(false);

  const update = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const validateStep = (index: number, data: Draft): FieldErrors | null => {
    const schemas = [
      onboardingIdentitySchema,
      onboardingAboutYouSchema,
      onboardingBioGoalsSchema,
      onboardingInterestsLifestyleSchema,
      onboardingPreferencesExtrasSchema,
    ];
    const slices = [
      { display_name: data.display_name, birth_date: data.birth_date },
      {
        gender: data.gender,
        city: data.city,
        region: data.region,
        country_code: data.country_code,
      },
      { bio: data.bio, relationship_goals: data.relationship_goals },
      { interests: data.interests, lifestyle_preferences: data.lifestyle_preferences },
      {
        deal_breakers: data.deal_breakers,
        occupation: data.occupation,
        education: data.education,
      },
    ];
    const parsed = schemas[index].safeParse(slices[index]);
    if (parsed.success) return null;
    const next: FieldErrors = {};
    parsed.error.issues.forEach((issue) => {
      const key = issue.path[0];
      if (typeof key === "string" && !(key in next)) {
        next[key as keyof Draft] = issue.message;
      }
    });
    return next;
  };

  const buildFormData = (index: number, data: Draft): FormData => {
    const fd = new FormData();
    if (index === 0) {
      fd.set("display_name", data.display_name);
      fd.set("birth_date", data.birth_date);
    } else if (index === 1) {
      fd.set("gender", data.gender);
      fd.set("city", data.city);
      fd.set("region", data.region);
      fd.set("country_code", data.country_code);
    } else if (index === 2) {
      fd.set("bio", data.bio);
      data.relationship_goals.forEach((goal) => fd.append("relationship_goals", goal));
    } else if (index === 3) {
      data.interests.forEach((item) => fd.append("interests", item));
      data.lifestyle_preferences.forEach((item) => fd.append("lifestyle_preferences", item));
    } else if (index === 4) {
      data.deal_breakers.forEach((item) => fd.append("deal_breakers", item));
      fd.set("occupation", data.occupation);
      fd.set("education", data.education);
    }
    return fd;
  };

  const handleContinue = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice(null);

    const stepErrors = validateStep(stepIndex, draft);
    if (stepErrors) {
      setErrors(stepErrors);
      if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setErrors({});
    setPending(true);
    try {
      const actions = [
        saveOnboardingIdentity,
        saveOnboardingAboutYou,
        saveOnboardingBioGoals,
        saveOnboardingInterestsLifestyle,
        saveOnboardingPreferencesExtras,
      ];
      const response: OnboardingActionResponse = await actions[stepIndex](null, buildFormData(stepIndex, draft));
      if (!response.ok) {
        if (response.fieldErrors) setErrors(response.fieldErrors);
        setNotice({
          tone: "error",
          title: "We hit a snag",
          body: response.error ?? "Please review the highlighted fields and try again.",
        });
        setPending(false);
        return;
      }
      setStepIndex((current) => Math.min(current + 1, COMPLETE_INDEX));
      if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setNotice({
        tone: "error",
        title: "We hit a snag",
        body: "Something went wrong saving your progress. Please try again.",
      });
    } finally {
      setPending(false);
    }
  };

  const handleBack = () => {
    setErrors({});
    setNotice(null);
    setStepIndex((current) => Math.max(0, current - 1));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleComplete = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    try {
      const response = await completeOnboarding();
      if (!response.ok) {
        setNotice({
          tone: "error",
          title: "We couldn't finish that",
          body: response.error ?? "Please try again in a moment.",
        });
        setPending(false);
        return;
      }
      router.push("/app?status=onboarded");
      router.refresh();
    } catch {
      setNotice({
        tone: "error",
        title: "We couldn't finish that",
        body: "Something went wrong. Please try again in a moment.",
      });
      setPending(false);
    }
  };

  const isComplete = stepIndex === COMPLETE_INDEX;
  const meta = isComplete ? null : stepMeta[stepIndex];
  const canGoBack = stepIndex > 0;

  return (
    <div className="space-y-5">
      <OnboardingProgress currentIndex={stepIndex} total={onboardingStepOrder.length} />

      <div key={stepIndex} className="step-in">
        <div className="surface magic-border rounded-[28px] p-6 shadow-[0_34px_110px_-42px_rgba(239,94,94,0.72)] sm:p-8">
          {notice ? (
            <div
              role={notice.tone === "error" ? "alert" : "status"}
              className={`mb-5 flex items-start gap-3 rounded-2xl border px-4 py-3.5 ${
                notice.tone === "success"
                  ? "border-[rgba(109,211,176,0.35)] bg-[rgba(109,211,176,0.10)]"
                  : "border-[rgba(255,107,122,0.35)] bg-[rgba(255,107,122,0.10)]"
              }`}
            >
              <span
                className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full ${
                  notice.tone === "success"
                    ? "bg-[rgba(109,211,176,0.22)] text-[var(--color-success)]"
                    : "bg-[rgba(255,107,122,0.22)] text-[var(--color-danger)]"
                }`}
              >
                {notice.tone === "success" ? <CheckIcon size={14} /> : <span className="text-sm font-bold">!</span>}
              </span>
              <div>
                <p className="text-sm font-semibold text-[var(--color-pearl)]">{notice.title}</p>
                <p className="mt-0.5 text-[13px] leading-5 text-[var(--color-pearl)]/80">{notice.body}</p>
              </div>
            </div>
          ) : null}

          {!isComplete && meta ? (
            <>
              <div className="mb-7">
                <h1 className="font-[family-name:var(--font-display)] text-[clamp(1.8rem,4vw,2.6rem)] leading-[1.0] tracking-[-0.04em] text-[var(--color-pearl)]">
                  {meta.title}
                </h1>
                <p className="mt-3 max-w-xl text-[15px] leading-7 text-[var(--color-mist)]">
                  {meta.description}
                </p>
              </div>

              <form onSubmit={handleContinue} noValidate>
                <div className="space-y-5">
                  {stepIndex === 0 ? (
                    <>
                      <OnboardingTextInput
                        label="Display name"
                        name="display_name"
                        placeholder="How should Freeborn introduce you?"
                        value={draft.display_name}
                        error={errors.display_name}
                        hint={onboardingFieldHints.display_name}
                        autoComplete="nickname"
                        onChange={(event) => update("display_name", event.target.value)}
                      />
                      <DateOfBirthField
                        value={draft.birth_date}
                        error={errors.birth_date}
                        hint={onboardingFieldHints.birth_date}
                        onChange={(value) => update("birth_date", value)}
                      />
                    </>
                  ) : null}

                  {stepIndex === 1 ? (
                    <>
                      <SelectMenu
                        label="Gender"
                        value={draft.gender}
                        onChange={(value) => update("gender", value)}
                        options={genderOptions.map((option) => ({ value: option.value, label: option.label }))}
                        placeholder="Choose how you identify"
                        error={errors.gender}
                        hint={onboardingFieldHints.gender}
                      />
                      <OnboardingTextInput
                        label="City"
                        name="city"
                        placeholder="Where do you live?"
                        value={draft.city}
                        error={errors.city}
                        hint={onboardingFieldHints.city}
                        autoComplete="address-level2"
                        onChange={(event) => update("city", event.target.value)}
                      />
                      <div className="grid gap-5 sm:grid-cols-2">
                        <OnboardingTextInput
                          label="Region"
                          name="region"
                          placeholder="State, province, or region"
                          value={draft.region}
                          error={errors.region}
                          hint={onboardingFieldHints.region}
                          optional
                          autoComplete="address-level1"
                          onChange={(event) => update("region", event.target.value)}
                        />
                        <OnboardingTextInput
                          label="Country code"
                          name="country_code"
                          placeholder="US"
                          value={draft.country_code}
                          error={errors.country_code}
                          hint={onboardingFieldHints.country_code}
                          optional
                          autoComplete="country"
                          maxLength={2}
                          onChange={(event) => update("country_code", event.target.value.toUpperCase())}
                        />
                      </div>
                    </>
                  ) : null}

                  {stepIndex === 2 ? (
                    <>
                      <OnboardingTextarea
                        label="Short bio"
                        name="bio"
                        placeholder="What do you care about? What does a good Sunday look like?"
                        value={draft.bio}
                        error={errors.bio}
                        hint={onboardingFieldHints.bio}
                        rows={4}
                        maxLength={500}
                        counter={{ value: draft.bio.length, max: 500 }}
                        onChange={(event) => update("bio", event.target.value.slice(0, 500))}
                      />
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-3">
                          <label className="block text-sm font-semibold text-[var(--color-pearl)]">
                            Relationship goals
                          </label>
                          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-stone)]">
                            {draft.relationship_goals.length}/3
                          </span>
                        </div>
                        <OptionCardRow
                          options={relationshipGoalOptions.map((option) => ({
                            value: option.value,
                            label: option.label,
                            caption: option.caption,
                          }))}
                          value={draft.relationship_goals}
                          onChange={(next) => update("relationship_goals", next)}
                          max={3}
                        />
                        {errors.relationship_goals ? (
                          <p className="flex items-center gap-1.5 text-xs font-medium leading-5 text-[var(--color-danger)]" role="alert">
                            <span aria-hidden="true">●</span>
                            {errors.relationship_goals}
                          </p>
                        ) : null}
                      </div>
                    </>
                  ) : null}

                  {stepIndex === 3 ? (
                    <>
                      <ChipSelect
                        label="Interests"
                        options={interestOptions}
                        value={draft.interests}
                        max={12}
                        error={errors.interests}
                        hint={onboardingFieldHints.interests}
                        onChange={(next) => update("interests", next)}
                      />
                      <ChipSelect
                        label="Lifestyle"
                        options={lifestyleOptions}
                        value={draft.lifestyle_preferences}
                        max={12}
                        error={errors.lifestyle_preferences}
                        hint={onboardingFieldHints.lifestyle_preferences}
                        onChange={(next) => update("lifestyle_preferences", next)}
                      />
                    </>
                  ) : null}

                  {stepIndex === 4 ? (
                    <>
                      <ChipSelect
                        label="Deal breakers"
                        options={dealBreakerOptions}
                        value={draft.deal_breakers}
                        max={12}
                        optional
                        error={errors.deal_breakers}
                        hint={onboardingFieldHints.deal_breakers}
                        onChange={(next) => update("deal_breakers", next)}
                      />
                      <div className="grid gap-5 sm:grid-cols-2">
                        <OnboardingTextInput
                          label="Occupation"
                          name="occupation"
                          placeholder="What do you do?"
                          value={draft.occupation}
                          error={errors.occupation}
                          hint={onboardingFieldHints.occupation}
                          optional
                          onChange={(event) => update("occupation", event.target.value)}
                        />
                        <OnboardingTextInput
                          label="Education"
                          name="education"
                          placeholder="Where did you study?"
                          value={draft.education}
                          error={errors.education}
                          hint={onboardingFieldHints.education}
                          optional
                          onChange={(event) => update("education", event.target.value)}
                        />
                      </div>
                    </>
                  ) : null}
                </div>

                {meta.tip ? (
                  <div className="mt-6 flex items-start gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3.5">
                    <span className="mt-0.5 text-[var(--color-gold-300)]">
                      <CheckIcon size={15} />
                    </span>
                    <p className="text-[13px] leading-6 text-[var(--color-mist)]">{meta.tip}</p>
                  </div>
                ) : null}

                <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                  {canGoBack ? (
                    <button
                      type="button"
                      onClick={handleBack}
                      disabled={pending}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/[0.04] px-5 py-4 text-sm font-semibold text-[var(--color-pearl)] transition hover:bg-white/[0.08] disabled:opacity-60"
                    >
                      <ArrowIcon size={15} className="rotate-180" />
                      Back
                    </button>
                  ) : (
                    <span />
                  )}
                  <button
                    type="submit"
                    disabled={pending}
                    className="btn-shine group relative inline-flex items-center justify-center gap-2 overflow-hidden magic-button rounded-2xl bg-[var(--color-pearl)] px-7 py-4 text-sm font-bold text-[var(--color-ink)] transition-all hover:-translate-y-px hover:bg-white hover:shadow-[0_14px_34px_rgba(247,241,232,0.14)] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
                  >
                    {pending ? <Spinner /> : null}
                    {pending ? "Saving…" : "Continue"}
                    {!pending ? <ArrowIcon size={15} className="transition-transform group-hover:translate-x-0.5" /> : null}
                  </button>
                </div>
              </form>
            </>
          ) : null}

          {isComplete ? (
            <div className="flex flex-col items-center py-4 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--gradient-ember)] shadow-[var(--shadow-ember)]">
                <CheckIcon size={36} className="text-white" />
              </div>
              <h1 className="mt-6 font-[family-name:var(--font-display)] text-[clamp(1.9rem,4vw,2.6rem)] leading-[1.0] tracking-[-0.04em] text-[var(--color-pearl)]">
                Your values-forward profile is live.
              </h1>
              <p className="mt-3 max-w-md text-[15px] leading-7 text-[var(--color-mist)]">
                You&apos;re set up with a thoughtful foundation. You can refine anything from your profile later.
              </p>

              <div className="mt-7 w-full max-w-md space-y-3 text-left">
                {[
                  "Add clear, recent photos so people can recognize you with confidence.",
                  "Specific interests — from natural health to everyday rituals — give better conversation starters than generic lists.",
                  "Keep your bio current — it sets the tone before a first message.",
                ].map((tip) => (
                  <div key={tip} className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3.5">
                    <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-gold-500)]/15 text-[var(--color-gold-300)]">
                      <CheckIcon size={13} />
                    </span>
                    <p className="text-[13px] leading-6 text-[var(--color-pearl)]/90">{tip}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleComplete} className="mt-7 w-full max-w-md">
                <button
                  type="submit"
                  disabled={pending}
                  className="btn-shine group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-[var(--gradient-ember)] px-7 py-4 text-sm font-bold text-white transition-all hover:-translate-y-px hover:shadow-[0_16px_40px_rgba(239,94,94,0.25)] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
                >
                  {pending ? <Spinner /> : null}
                  {pending ? "Finalizing…" : "Enter Freeborn"}
                </button>
              </form>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
