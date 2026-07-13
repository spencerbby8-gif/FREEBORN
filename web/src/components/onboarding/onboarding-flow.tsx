"use client";

import React, { useState } from "react";
import { premiumOnboardingStepOrder, type PremiumOnboardingStep, type ProfilePhoto, type UserProfileRow } from "@freeborn/shared";
import { savePremiumOnboardingStep } from "@/lib/onboarding/actions";
import { WelcomeStep } from "./steps/welcome-step";
import { IdentityStep } from "./steps/identity-step";
import { LocationStep, type LocationData } from "./steps/location-step";
import { RelationshipIntentStep } from "./steps/relationship-intent-step";
import { LifestyleStep } from "./steps/lifestyle-step";
import { ValuesStep } from "./steps/values-step";
import { InterestsStep } from "./steps/interests-step";
import { BioStep, type BioData } from "./steps/bio-step";
import { PhotosStep } from "./steps/photos-step";
import { DiscoveryPreferencesStep, type DiscoveryPreferencesData } from "./steps/discovery-preferences-step";
import { VerificationStep } from "./steps/verification-step";
import { FinishStep } from "./steps/finish-step";

export type OnboardingDraft = {
  display_name: string;
  birth_date: string;
  gender: string;
  city: string;
  region: string;
  country_code: string;
  location_source: "manual" | "gps";
  latitude: number | null;
  longitude: number | null;
  accuracy_m: number | null;
  bio: string;
  relationship_goals: string[];
  values: string[];
  interests: string[];
  lifestyle_preferences: string[];
  deal_breakers: string[];
  occupation: string;
  education: string;
  age_min: number;
  age_max: number;
  distance_km: number;
  show_genders: string[];
  relationship_intents: string[];
  verified_only: boolean;
  photos_required: boolean;
  deal_breaker_strict: boolean;
};

const steps = [...premiumOnboardingStepOrder];
const TOTAL_STEPS = steps.length;

type OnboardingFlowProps = {
  initialDraft: OnboardingDraft;
  initialPhotos: ProfilePhoto[];
  initialStepIndex: number;
  maxStepIndex: number;
  isVerified: boolean;
  profile?: UserProfileRow | null;
};

export function OnboardingFlow({
  initialDraft,
  initialPhotos,
  initialStepIndex,
  isVerified,
  profile,
}: OnboardingFlowProps) {
  const [stepIndex, setStepIndex] = useState(Math.min(Math.max(initialStepIndex, 0), TOTAL_STEPS - 1));
  const [draft, setDraft] = useState<OnboardingDraft>(initialDraft);
  const [photos, setPhotos] = useState<ProfilePhoto[]>(initialPhotos);
  const [pending, setPending] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string>("Ready");

  const currentStep = steps[stepIndex];
  const nextStep = steps[Math.min(stepIndex + 1, TOTAL_STEPS - 1)];

  const goToStep = (index: number) => {
    const target = Math.max(0, Math.min(index, TOTAL_STEPS - 1));
    setStepIndex(target);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => goToStep(stepIndex - 1);

  const saveAndAdvance = async (stepName: PremiumOnboardingStep, stepData?: Record<string, unknown>) => {
    setPending(true);
    setSaveStatus("Saving…");
    const fd = new FormData();
    fd.set("step", stepName);
    fd.set("next_step", nextStep);
    fd.set("advance", "true");

    if (stepName === "identity" && stepData) {
      fd.set("display_name", String(stepData.display_name ?? ""));
      fd.set("birth_date", String(stepData.birth_date ?? ""));
      fd.set("gender", String(stepData.gender ?? ""));
    } else if (stepName === "location" && stepData) {
      const loc = stepData as unknown as LocationData;
      fd.set("city", loc.city);
      fd.set("region", loc.region);
      fd.set("country_code", loc.country_code);
      fd.set("location_source", loc.location_source);
      if (loc.latitude != null) fd.set("latitude", String(loc.latitude));
      if (loc.longitude != null) fd.set("longitude", String(loc.longitude));
      if (loc.accuracy_m != null) fd.set("accuracy_m", String(loc.accuracy_m));
    } else if (stepName === "relationship_intent" && stepData) {
      const goals = stepData as unknown as string[];
      goals.forEach((g) => fd.append("relationship_goals", g));
    } else if (stepName === "lifestyle" && stepData) {
      const cues = stepData as unknown as string[];
      cues.forEach((c) => fd.append("lifestyle_preferences", c));
    } else if (stepName === "values" && stepData) {
      const vals = stepData as unknown as string[];
      vals.forEach((v) => fd.append("values", v));
    } else if (stepName === "interests" && stepData) {
      const ints = stepData as unknown as string[];
      ints.forEach((i) => fd.append("interests", i));
    } else if (stepName === "bio" && stepData) {
      const b = stepData as unknown as BioData;
      fd.set("bio", b.bio);
      fd.set("occupation", b.occupation);
      fd.set("education", b.education);
      b.deal_breakers.forEach((db) => fd.append("deal_breakers", db));
    } else if (stepName === "discovery_preferences" && stepData) {
      const p = stepData as unknown as DiscoveryPreferencesData;
      fd.set("age_min", String(p.age_min));
      fd.set("age_max", String(p.age_max));
      fd.set("distance_km", String(p.distance_km));
      fd.set("verified_only", String(p.verified_only));
      fd.set("photos_required", String(p.photos_required));
      fd.set("deal_breaker_strict", String(p.deal_breaker_strict));
      p.show_genders.forEach((g) => fd.append("show_genders", g));
      p.relationship_intents.forEach((ri) => fd.append("relationship_intents", ri));
    }

    try {
      const response = await savePremiumOnboardingStep(null, fd);
      if (!response.ok) {
        setSaveStatus("Save error");
        setPending(false);
        return;
      }
      setSaveStatus("Saved");
      goToStep(stepIndex + 1);
    } catch {
      setSaveStatus("Error");
    } finally {
      setPending(false);
    }
  };

  switch (currentStep) {
    case "welcome":
      return (
        <WelcomeStep
          stepIndex={stepIndex}
          totalSteps={TOTAL_STEPS}
          onContinue={() => saveAndAdvance("welcome")}
          pending={pending}
          saveStatus={saveStatus}
        />
      );

    case "identity":
      return (
        <IdentityStep
          stepIndex={stepIndex}
          totalSteps={TOTAL_STEPS}
          initialData={{
            display_name: draft.display_name,
            birth_date: draft.birth_date,
            gender: draft.gender,
          }}
          onBack={handleBack}
          onSave={(data) => {
            setDraft((prev) => ({ ...prev, ...data }));
            saveAndAdvance("identity", data);
          }}
          pending={pending}
          saveStatus={saveStatus}
        />
      );

    case "location":
      return (
        <LocationStep
          stepIndex={stepIndex}
          totalSteps={TOTAL_STEPS}
          initialData={{
            city: draft.city,
            region: draft.region,
            country_code: draft.country_code,
            location_source: draft.location_source,
            latitude: draft.latitude,
            longitude: draft.longitude,
            accuracy_m: draft.accuracy_m,
          }}
          onBack={handleBack}
          onSave={(data) => {
            setDraft((prev) => ({ ...prev, ...data }));
            saveAndAdvance("location", data as unknown as Record<string, unknown>);
          }}
          pending={pending}
          saveStatus={saveStatus}
        />
      );

    case "relationship_intent":
      return (
        <RelationshipIntentStep
          stepIndex={stepIndex}
          totalSteps={TOTAL_STEPS}
          initialGoals={draft.relationship_goals}
          onBack={handleBack}
          onSave={(goals) => {
            setDraft((prev) => ({ ...prev, relationship_goals: goals }));
            saveAndAdvance("relationship_intent", goals as unknown as Record<string, unknown>);
          }}
          pending={pending}
          saveStatus={saveStatus}
        />
      );

    case "lifestyle":
      return (
        <LifestyleStep
          stepIndex={stepIndex}
          totalSteps={TOTAL_STEPS}
          initialLifestyle={draft.lifestyle_preferences}
          onBack={handleBack}
          onSave={(lifestyle) => {
            setDraft((prev) => ({ ...prev, lifestyle_preferences: lifestyle }));
            saveAndAdvance("lifestyle", lifestyle as unknown as Record<string, unknown>);
          }}
          pending={pending}
          saveStatus={saveStatus}
        />
      );

    case "values":
      return (
        <ValuesStep
          stepIndex={stepIndex}
          totalSteps={TOTAL_STEPS}
          initialValues={draft.values}
          onBack={handleBack}
          onSave={(values) => {
            setDraft((prev) => ({ ...prev, values }));
            saveAndAdvance("values", values as unknown as Record<string, unknown>);
          }}
          pending={pending}
          saveStatus={saveStatus}
        />
      );

    case "interests":
      return (
        <InterestsStep
          stepIndex={stepIndex}
          totalSteps={TOTAL_STEPS}
          initialInterests={draft.interests}
          onBack={handleBack}
          onSave={(interests) => {
            setDraft((prev) => ({ ...prev, interests }));
            saveAndAdvance("interests", interests as unknown as Record<string, unknown>);
          }}
          pending={pending}
          saveStatus={saveStatus}
        />
      );

    case "bio":
      return (
        <BioStep
          stepIndex={stepIndex}
          totalSteps={TOTAL_STEPS}
          initialData={{
            bio: draft.bio,
            deal_breakers: draft.deal_breakers,
            occupation: draft.occupation,
            education: draft.education,
          }}
          onBack={handleBack}
          onSave={(data) => {
            setDraft((prev) => ({ ...prev, ...data }));
            saveAndAdvance("bio", data as unknown as Record<string, unknown>);
          }}
          pending={pending}
          saveStatus={saveStatus}
        />
      );

    case "photos":
      return (
        <PhotosStep
          stepIndex={stepIndex}
          totalSteps={TOTAL_STEPS}
          initialPhotos={photos}
          onBack={handleBack}
          onContinue={(updatedPhotos) => {
            setPhotos(updatedPhotos);
            saveAndAdvance("photos");
          }}
          pending={pending}
          saveStatus={saveStatus}
        />
      );

    case "discovery_preferences":
      return (
        <DiscoveryPreferencesStep
          stepIndex={stepIndex}
          totalSteps={TOTAL_STEPS}
          initialData={{
            age_min: draft.age_min,
            age_max: draft.age_max,
            distance_km: draft.distance_km,
            show_genders: draft.show_genders,
            relationship_intents: draft.relationship_intents,
            verified_only: draft.verified_only,
            photos_required: draft.photos_required,
            deal_breaker_strict: draft.deal_breaker_strict,
          }}
          onBack={handleBack}
          onSave={(data) => {
            setDraft((prev) => ({ ...prev, ...data }));
            saveAndAdvance("discovery_preferences", data as unknown as Record<string, unknown>);
          }}
          pending={pending}
          saveStatus={saveStatus}
        />
      );

    case "verification":
      return (
        <VerificationStep
          stepIndex={stepIndex}
          totalSteps={TOTAL_STEPS}
          profile={
            (profile ?? {
              id: "onboarding-user",
              email: "",
              display_name: draft.display_name || "New Member",
              birth_date: draft.birth_date,
              gender: draft.gender || "woman",
              city: draft.city,
              region: draft.region,
              country_code: draft.country_code,
              bio: draft.bio,
              relationship_goals: draft.relationship_goals,
              values: draft.values,
              interests: draft.interests,
              lifestyle_preferences: draft.lifestyle_preferences,
              deal_breakers: draft.deal_breakers,
              occupation: draft.occupation,
              education: draft.education,
              is_verified: isVerified,
              onboarding_stage: "profile_setup",
              profile_status: "draft",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }) as UserProfileRow
          }
          photos={photos}
          isVerified={isVerified}
          onBack={handleBack}
          onContinue={() => saveAndAdvance("verification")}
          pending={pending}
          saveStatus={saveStatus}
        />
      );

    case "finish":
      return (
        <FinishStep
          stepIndex={stepIndex}
          totalSteps={TOTAL_STEPS}
          draft={{
            display_name: draft.display_name,
            birth_date: draft.birth_date,
            gender: draft.gender,
            city: draft.city,
            region: draft.region,
            relationship_goals: draft.relationship_goals,
            lifestyle_preferences: draft.lifestyle_preferences,
            values: draft.values,
            interests: draft.interests,
            bio: draft.bio,
            photo_count: photos.length,
          }}
          onBack={handleBack}
        />
      );

    default:
      return (
        <WelcomeStep
          stepIndex={stepIndex}
          totalSteps={TOTAL_STEPS}
          onContinue={() => saveAndAdvance("welcome")}
          pending={pending}
        />
      );
  }
}
