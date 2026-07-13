"use client";

import React, { useState } from "react";
import {
  discoveryPreferencesSchema,
  genderOptions,
  relationshipGoalOptions,
} from "@freeborn/shared";
import { OnboardingTextInput } from "../onboarding-field";
import { ChipSelect } from "../chip-select";
import { OptionCardRow } from "../option-card-row";
import { StepShell } from "../step-shell";

export type DiscoveryPreferencesData = {
  age_min: number;
  age_max: number;
  distance_km: number;
  show_genders: string[];
  relationship_intents: string[];
  verified_only: boolean;
  photos_required: boolean;
  deal_breaker_strict: boolean;
};

type DiscoveryPreferencesStepProps = {
  stepIndex: number;
  totalSteps: number;
  initialData: DiscoveryPreferencesData;
  onBack: () => void;
  onSave: (data: DiscoveryPreferencesData) => void;
  pending?: boolean;
  saveStatus?: string;
};

function TogglePill({
  active,
  onClick,
  label,
  body,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  body: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-2xl border p-4 text-left transition-all active:scale-[0.98] ${
        active
          ? "border-[var(--color-gold-500)] bg-[var(--color-gold-500)]/10 text-[var(--color-pearl)]"
          : "border-white/10 bg-white/[0.03] text-[var(--color-mist)] hover:bg-white/[0.06]"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-black">{label}</span>
        <span
          className={`h-5 w-9 rounded-full p-0.5 transition ${
            active ? "bg-[var(--color-gold-500)]" : "bg-white/10"
          }`}
        >
          <span
            className={`block h-4 w-4 rounded-full bg-white transition ${
              active ? "translate-x-4" : ""
            }`}
          />
        </span>
      </div>
      <p className="mt-1.5 text-xs leading-4 opacity-80">{body}</p>
    </button>
  );
}

export function DiscoveryPreferencesStep({
  stepIndex,
  totalSteps,
  initialData,
  onBack,
  onSave,
  pending,
  saveStatus,
}: DiscoveryPreferencesStepProps) {
  const [ageMin, setAgeMin] = useState(initialData.age_min);
  const [ageMax, setAgeMax] = useState(initialData.age_max);
  const [distanceKm, setDistanceKm] = useState(initialData.distance_km);
  const [showGenders, setShowGenders] = useState<string[]>(initialData.show_genders);
  const [relationshipIntents, setRelationshipIntents] = useState<string[]>(initialData.relationship_intents);
  const [verifiedOnly, setVerifiedOnly] = useState(initialData.verified_only);
  const [photosRequired, setPhotosRequired] = useState(initialData.photos_required);
  const [dealBreakerStrict, setDealBreakerStrict] = useState(initialData.deal_breaker_strict);
  const [errors, setErrors] = useState<Partial<Record<keyof DiscoveryPreferencesData, string>>>({});

  const handleContinue = (e?: React.FormEvent) => {
    e?.preventDefault();
    const payload = {
      age_min: ageMin,
      age_max: ageMax,
      distance_km: distanceKm,
      show_genders: showGenders,
      relationship_intents: relationshipIntents,
      verified_only: verifiedOnly,
      photos_required: photosRequired,
      deal_breaker_strict: dealBreakerStrict,
    };
    const parsed = discoveryPreferencesSchema.safeParse(payload);
    if (!parsed.success) {
      const nextErrors: Partial<Record<keyof DiscoveryPreferencesData, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof DiscoveryPreferencesData;
        if (!nextErrors[key]) nextErrors[key] = issue.message;
      }
      setErrors(nextErrors);
      return;
    }
    setErrors({});
    onSave(parsed.data);
  };

  return (
    <StepShell
      stepIndex={stepIndex}
      totalSteps={totalSteps}
      title="Set your discovery boundaries."
      subtitle="Tune who appears in your feed, age and distance ranges, and strictness filters."
      onBack={onBack}
      onContinue={handleContinue}
      pending={pending}
      saveStatus={saveStatus}
      footerTip="You can update discovery filters at any time from your settings or discovery screen."
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <OnboardingTextInput
          label="Min age"
          type="number"
          min={18}
          max={80}
          value={ageMin}
          error={errors.age_min}
          onChange={(e) => setAgeMin(Number(e.target.value))}
        />
        <OnboardingTextInput
          label="Max age"
          type="number"
          min={18}
          max={99}
          value={ageMax}
          error={errors.age_max}
          onChange={(e) => setAgeMax(Number(e.target.value))}
        />
        <OnboardingTextInput
          label="Max distance (km)"
          type="number"
          min={5}
          max={500}
          value={distanceKm}
          error={errors.distance_km}
          onChange={(e) => setDistanceKm(Number(e.target.value))}
        />
      </div>

      <ChipSelect
        label="Who to show me"
        options={genderOptions.slice(0, 7).map((item) => item.label)}
        value={showGenders.map((val) => genderOptions.find((g) => g.value === val)?.label ?? val)}
        error={errors.show_genders}
        onChange={(labels) =>
          setShowGenders(labels.map((l) => genderOptions.find((g) => g.label === l)?.value ?? l))
        }
      />

      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-[13px] font-bold uppercase tracking-wider text-[var(--color-sand)]">
            Relationship intentions to show
          </span>
          <span className="text-[11px] font-black uppercase tracking-widest text-[var(--color-ash)]">
            {relationshipIntents.length}/3
          </span>
        </div>
        <OptionCardRow
          options={relationshipGoalOptions.map((o) => ({
            value: o.value,
            label: o.label,
            caption: o.caption,
          }))}
          value={relationshipIntents}
          onChange={setRelationshipIntents}
          max={3}
        />
        {errors.relationship_intents ? (
          <p className="text-xs font-bold text-red-400">{errors.relationship_intents}</p>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <TogglePill
          active={verifiedOnly}
          onClick={() => setVerifiedOnly(!verifiedOnly)}
          label="Verified only"
          body="Show only verified profiles."
        />
        <TogglePill
          active={photosRequired}
          onClick={() => setPhotosRequired(!photosRequired)}
          label="Photos required"
          body="Hide profiles without photos."
        />
        <TogglePill
          active={dealBreakerStrict}
          onClick={() => setDealBreakerStrict(!dealBreakerStrict)}
          label="Strict boundaries"
          body="Strictly filter deal breakers."
        />
      </div>
    </StepShell>
  );
}
