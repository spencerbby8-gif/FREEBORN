import { redirect } from "next/navigation";
import type { DiscoveryPreferencesRow, ProfilePhoto, UserProfileRow } from "@freeborn/shared";
import { premiumOnboardingStepOrder, type PremiumOnboardingStep } from "@freeborn/shared";
import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const stepOrder = [...premiumOnboardingStepOrder];

function parseStep(value: string | null | undefined): PremiumOnboardingStep | null {
  if (value && (stepOrder as string[]).includes(value)) return value as PremiumOnboardingStep;
  return null;
}

function mapSavedStep(value: string | null | undefined): PremiumOnboardingStep {
  const parsed = parseStep(value);
  if (parsed) return parsed;
  switch (value) {
    case "about_you":
      return "location";
    case "bio_goals":
      return "relationship_intent";
    case "interests_lifestyle":
      return "interests";
    case "preferences_extras":
      return "bio";
    case "complete":
      return "finish";
    default:
      return "welcome";
  }
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

  if (!user) redirect("/auth?mode=sign-in");

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle<UserProfileRow>();

  if (!profile) redirect("/auth?mode=sign-in");

  if (profile.onboarding_stage === "profile_setup" || profile.onboarding_stage === "ready") {
    redirect("/app");
  }

  const { data: photos } = await supabase
    .from("profile_photos")
    .select("*")
    .eq("user_id", user.id)
    .order("position", { ascending: true });

  const { data: prefs } = await supabase
    .from("discovery_preferences")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle<DiscoveryPreferencesRow>();

  const { data: privateLocation } = await supabase
    .from("user_private_locations")
    .select("source,latitude,longitude,accuracy_m")
    .eq("user_id", user.id)
    .maybeSingle<{ source: "manual" | "gps" | null; latitude: number | null; longitude: number | null; accuracy_m: number | null }>();

  const savedStep = mapSavedStep(profile.onboarding_step);
  const requestedStep = parseStep(rawStep);
  const savedIndex = Math.max(0, stepOrder.indexOf(savedStep));
  const requestedIndex = requestedStep ? stepOrder.indexOf(requestedStep) : savedIndex;
  const initialStepIndex = Math.min(requestedIndex, Math.max(savedIndex, 0));
  const maxStepIndex = Math.max(savedIndex, 0);

  const draft = {
    display_name: profile.display_name ?? "",
    birth_date: profile.birth_date ?? "",
    gender: profile.gender ?? "",
    city: profile.city ?? "",
    region: profile.region ?? "",
    country_code: profile.country_code ?? "",
    location_source: privateLocation?.source ?? "manual",
    latitude: privateLocation?.latitude ?? null,
    longitude: privateLocation?.longitude ?? null,
    accuracy_m: privateLocation?.accuracy_m ?? null,
    bio: profile.bio ?? "",
    relationship_goals: profile.relationship_goals ?? [],
    values: profile.values ?? [],
    interests: profile.interests ?? [],
    lifestyle_preferences: profile.lifestyle_preferences ?? [],
    deal_breakers: profile.deal_breakers ?? [],
    occupation: profile.occupation ?? "",
    education: profile.education ?? "",
    age_min: prefs?.age_min ?? profile.age_min_preference ?? 22,
    age_max: prefs?.age_max ?? profile.age_max_preference ?? 45,
    distance_km: prefs?.distance_km ?? profile.max_distance_km ?? 80,
    show_genders: prefs?.show_genders?.length ? prefs.show_genders : profile.show_gender?.length ? profile.show_gender : ["woman", "man", "non_binary"],
    relationship_intents: prefs?.relationship_intents?.length ? prefs.relationship_intents : profile.relationship_goals?.length ? profile.relationship_goals : ["long_term", "meaningful_connection"],
    verified_only: prefs?.verified_only ?? false,
    photos_required: prefs?.photos_required ?? true,
    deal_breaker_strict: prefs?.deal_breaker_strict ?? true,
  };

  return (
    <OnboardingShell>
      <OnboardingFlow
        initialDraft={draft}
        initialPhotos={(photos as ProfilePhoto[]) ?? []}
        initialStepIndex={initialStepIndex}
        maxStepIndex={maxStepIndex}
        isVerified={profile.is_verified}
      />
    </OnboardingShell>
  );
}
