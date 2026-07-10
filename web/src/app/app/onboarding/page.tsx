import { redirect } from "next/navigation";
import type { OnboardingStep, UserProfileRow } from "@freeborn/shared";
import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
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
  const requestedIndex = validSteps.indexOf(requestedStep);
  const profileIndex = validSteps.indexOf(profileStep);
  // People may revisit completed steps, but can never skip ahead of saved progress.
  const initialStepIndex = Math.min(requestedIndex, profileIndex);
  const maxStepIndex = profileIndex;

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
    <OnboardingShell>
      <OnboardingFlow
        initialDraft={draft}
        initialStepIndex={initialStepIndex}
        maxStepIndex={maxStepIndex}
      />
    </OnboardingShell>
  );
}
