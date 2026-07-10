import { redirect } from "next/navigation";
import type { OnboardingStep, UserProfileRow } from "@freeborn/shared";
import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { StepIdentity } from "@/components/onboarding/step-identity";
import { StepAboutYou } from "@/components/onboarding/step-about-you";
import { StepBioGoals } from "@/components/onboarding/step-bio-goals";
import { StepInterestsLifestyle } from "@/components/onboarding/step-interests-lifestyle";
import { StepPreferencesExtras } from "@/components/onboarding/step-preferences-extras";
import { StepComplete } from "@/components/onboarding/step-complete";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const validSteps: OnboardingStep[] = [
  "identity",
  "about_you",
  "bio_goals",
  "interests_lifestyle",
  "preferences_extras",
  "complete",
];

function parseStep(value: string | undefined): OnboardingStep {
  if (value && (validSteps as string[]).includes(value)) {
    return value as OnboardingStep;
  }
  return "identity";
}

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const rawStep = Array.isArray(params.step) ? params.step[0] : params.step;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth?mode=sign-in");
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle<UserProfileRow>();

  if (!profile) {
    redirect("/auth?mode=sign-in");
  }

  if (profile.onboarding_stage === "profile_setup" || profile.onboarding_stage === "ready") {
    redirect("/app");
  }

  const requestedStep = parseStep(rawStep);
  const profileStep = parseStep(profile.onboarding_step);
  const step = requestedStep === profileStep ? requestedStep : profileStep;

  const draft = {
    display_name: profile.display_name ?? "",
    birth_date: profile.birth_date ?? "",
    gender: profile.gender ?? "",
    city: profile.city ?? "",
    region: profile.region ?? "",
    country_code: profile.country_code ?? "",
    bio: profile.bio ?? "",
    relationship_goals: profile.relationship_goals ?? [],
    interests: profile.interests ?? [],
    lifestyle_preferences: profile.lifestyle_preferences ?? [],
    deal_breakers: profile.deal_breakers ?? [],
    occupation: profile.occupation ?? "",
    education: profile.education ?? "",
  };

  return (
    <OnboardingShell step={step}>
      {step === "identity" ? <StepIdentity draft={draft} /> : null}
      {step === "about_you" ? <StepAboutYou draft={draft} /> : null}
      {step === "bio_goals" ? <StepBioGoals draft={draft} /> : null}
      {step === "interests_lifestyle" ? <StepInterestsLifestyle draft={draft} /> : null}
      {step === "preferences_extras" ? <StepPreferencesExtras draft={draft} /> : null}
      {step === "complete" ? <StepComplete /> : null}
    </OnboardingShell>
  );
}
