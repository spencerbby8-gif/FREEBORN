"use server";

import {
  discoveryPreferencesSchema,
  onboardingAboutYouSchema,
  onboardingBioGoalsSchema,
  onboardingBioSchema,
  onboardingIdentitySchema,
  onboardingInterestsLifestyleSchema,
  onboardingInterestsSchema,
  onboardingLifestyleSchema,
  onboardingLocationSchema,
  onboardingPreferencesExtrasSchema,
  onboardingPremiumIdentitySchema,
  onboardingProfileSchema,
  onboardingRelationshipGoalsSchema,
  onboardingValuesSchema,
} from "@freeborn/shared";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function normalizeOptional(value: string | undefined | null) {
  if (value === undefined || value === null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeStringArray(value: string[] | undefined | null) {
  if (!value) return [];
  return value.map((item) => item.trim()).filter(Boolean);
}

export type OnboardingActionResponse = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

function mapFieldErrors(issues: Array<{ path: PropertyKey[]; message: string }>) {
  const errors: Record<string, string> = {};
  for (const issue of issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !(key in errors)) {
      errors[key] = issue.message;
    }
  }
  return errors;
}

export async function saveOnboardingIdentity(
  _: OnboardingActionResponse | null,
  formData: FormData,
): Promise<OnboardingActionResponse> {
  const payload = {
    display_name: String(formData.get("display_name") ?? ""),
    birth_date: String(formData.get("birth_date") ?? ""),
  };

  const parsed = onboardingIdentitySchema.safeParse(payload);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please review the highlighted fields.",
      fieldErrors: mapFieldErrors(parsed.error.issues),
    };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You need to be signed in to continue onboarding." };
  }

  const { error } = await supabase
    .from("user_profiles")
    .update({
      display_name: parsed.data.display_name,
      birth_date: parsed.data.birth_date,
      onboarding_step: "about_you",
    })
    .eq("id", user.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

export async function saveOnboardingAboutYou(
  _: OnboardingActionResponse | null,
  formData: FormData,
): Promise<OnboardingActionResponse> {
  const payload = {
    gender: String(formData.get("gender") ?? ""),
    city: String(formData.get("city") ?? ""),
    region: normalizeOptional(String(formData.get("region") ?? "")) ?? "",
    country_code: normalizeOptional(String(formData.get("country_code") ?? "")) ?? "",
  };

  const parsed = onboardingAboutYouSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please review the highlighted fields.",
      fieldErrors: mapFieldErrors(parsed.error.issues),
    };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You need to be signed in to continue onboarding." };
  }

  const { error } = await supabase
    .from("user_profiles")
    .update({
      gender: parsed.data.gender,
      city: parsed.data.city,
      region: normalizeOptional(parsed.data.region),
      country_code: normalizeOptional(parsed.data.country_code),
      onboarding_step: "bio_goals",
    })
    .eq("id", user.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

export async function saveOnboardingBioGoals(
  _: OnboardingActionResponse | null,
  formData: FormData,
): Promise<OnboardingActionResponse> {
  const rawGoals = formData.getAll("relationship_goals");
  const payload = {
    bio: String(formData.get("bio") ?? ""),
    relationship_goals: rawGoals.map((value) => String(value)),
  };

  const parsed = onboardingBioGoalsSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please review the highlighted fields.",
      fieldErrors: mapFieldErrors(parsed.error.issues),
    };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You need to be signed in to continue onboarding." };
  }

  const { error } = await supabase
    .from("user_profiles")
    .update({
      bio: parsed.data.bio,
      relationship_goals: parsed.data.relationship_goals,
      onboarding_step: "interests_lifestyle",
    })
    .eq("id", user.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

export async function saveOnboardingInterestsLifestyle(
  _: OnboardingActionResponse | null,
  formData: FormData,
): Promise<OnboardingActionResponse> {
  const interests = normalizeStringArray(formData.getAll("interests").map(String));
  const lifestyle_preferences = normalizeStringArray(
    formData.getAll("lifestyle_preferences").map(String),
  );

  const parsed = onboardingInterestsLifestyleSchema.safeParse({
    interests,
    lifestyle_preferences,
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please review the highlighted fields.",
      fieldErrors: mapFieldErrors(parsed.error.issues),
    };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You need to be signed in to continue onboarding." };
  }

  const { error } = await supabase
    .from("user_profiles")
    .update({
      interests: parsed.data.interests,
      lifestyle_preferences: parsed.data.lifestyle_preferences,
      onboarding_step: "preferences_extras",
    })
    .eq("id", user.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

export async function saveOnboardingPreferencesExtras(
  _: OnboardingActionResponse | null,
  formData: FormData,
): Promise<OnboardingActionResponse> {
  const deal_breakers = normalizeStringArray(formData.getAll("deal_breakers").map(String));
  const occupationRaw = String(formData.get("occupation") ?? "");
  const educationRaw = String(formData.get("education") ?? "");

  const parsed = onboardingPreferencesExtrasSchema.safeParse({
    deal_breakers,
    occupation: occupationRaw,
    education: educationRaw,
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please review the highlighted fields.",
      fieldErrors: mapFieldErrors(parsed.error.issues),
    };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You need to be signed in to continue onboarding." };
  }

  const { error } = await supabase
    .from("user_profiles")
    .update({
      deal_breakers: parsed.data.deal_breakers,
      occupation: normalizeOptional(parsed.data.occupation),
      education: normalizeOptional(parsed.data.education),
      onboarding_step: "complete",
    })
    .eq("id", user.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

type PremiumStep =
  | "welcome"
  | "identity"
  | "location"
  | "intent"
  | "relationship_intent"
  | "lifestyle"
  | "values"
  | "interests"
  | "bio"
  | "photos"
  | "discovery_preferences"
  | "verification"
  | "finish";

function numberOrNull(value: FormDataEntryValue | null) {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

function boolFromForm(formData: FormData, key: string, defaultValue = false) {
  const value = formData.get(key);
  if (value == null) return defaultValue;
  return value === "true" || value === "on" || value === "1";
}

async function requireUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

const VALID_ONBOARDING_STEPS = new Set([
  "welcome",
  "identity",
  "location",
  "intent",
  "relationship_intent",
  "lifestyle",
  "values",
  "interests",
  "bio",
  "photos",
  "discovery_preferences",
  "verification",
  "finish",
  "about_you",
  "bio_goals",
  "interests_lifestyle",
  "preferences_extras",
  "complete",
]);

function validateOnboardingStep(raw: string): PremiumStep {
  const trimmed = raw.trim();
  if (!trimmed || !VALID_ONBOARDING_STEPS.has(trimmed)) {
    throw new Error(`Invalid onboarding step: "${raw}". Allowed: ${[...VALID_ONBOARDING_STEPS].join(", ")}`);
  }
  return trimmed as PremiumStep;
}

export async function savePremiumOnboardingStep(
  _: OnboardingActionResponse | null,
  formData: FormData,
): Promise<OnboardingActionResponse> {
  let step: PremiumStep;
  let nextStep: PremiumStep;
  try {
    step = validateOnboardingStep(String(formData.get("step") ?? ""));
    nextStep = validateOnboardingStep(String(formData.get("next_step") ?? String(formData.get("step") ?? "")));
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Invalid onboarding step." };
  }
  const advance = String(formData.get("advance") ?? "false") === "true";
  const onboardingStep = advance ? nextStep : step;

  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "You need to be signed in to continue onboarding." };

  if (step === "welcome" || step === "photos" || step === "verification" || step === "finish") {
    const { error } = await supabase
      .from("user_profiles")
      .update({ onboarding_step: onboardingStep })
      .eq("id", user.id);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }

  if (step === "identity") {
    const parsed = onboardingPremiumIdentitySchema.safeParse({
      display_name: String(formData.get("display_name") ?? ""),
      birth_date: String(formData.get("birth_date") ?? ""),
      gender: String(formData.get("gender") ?? ""),
    });
    if (!parsed.success) {
      return { ok: false, error: "Please review the highlighted fields.", fieldErrors: mapFieldErrors(parsed.error.issues) };
    }
    const { error } = await supabase
      .from("user_profiles")
      .update({ ...parsed.data, onboarding_step: onboardingStep })
      .eq("id", user.id);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }

  if (step === "location") {
    const parsed = onboardingLocationSchema.safeParse({
      city: String(formData.get("city") ?? ""),
      region: normalizeOptional(String(formData.get("region") ?? "")) ?? "",
      country_code: normalizeOptional(String(formData.get("country_code") ?? "")) ?? "",
      location_source: String(formData.get("location_source") ?? "manual"),
      latitude: numberOrNull(formData.get("latitude")),
      longitude: numberOrNull(formData.get("longitude")),
      accuracy_m: numberOrNull(formData.get("accuracy_m")),
    });
    if (!parsed.success) {
      return { ok: false, error: "Please review the highlighted fields.", fieldErrors: mapFieldErrors(parsed.error.issues) };
    }
    const publicLocation = {
      city: parsed.data.city,
      region: normalizeOptional(parsed.data.region),
      country_code: normalizeOptional(parsed.data.country_code),
    };
    const { error } = await supabase
      .from("user_profiles")
      .update({ ...publicLocation, onboarding_step: onboardingStep })
      .eq("id", user.id);
    if (error) return { ok: false, error: error.message };

    const { error: locationError } = await supabase.from("user_private_locations").upsert({
      user_id: user.id,
      latitude: parsed.data.location_source === "gps" ? parsed.data.latitude : null,
      longitude: parsed.data.location_source === "gps" ? parsed.data.longitude : null,
      accuracy_m: parsed.data.location_source === "gps" ? parsed.data.accuracy_m : null,
      source: parsed.data.location_source,
      ...publicLocation,
    });
    if (locationError) return { ok: false, error: locationError.message };
    return { ok: true };
  }

  if (step === "relationship_intent" || step === "intent") {
    const parsed = onboardingRelationshipGoalsSchema.safeParse(formData.getAll("relationship_goals").map(String));
    if (!parsed.success) return { ok: false, error: "Please review the highlighted fields.", fieldErrors: { relationship_goals: parsed.error.issues[0]?.message ?? "Choose at least one intent." } };
    const { error } = await supabase
      .from("user_profiles")
      .update({ relationship_goals: parsed.data, relationship_goal: parsed.data[0] ?? null, onboarding_step: onboardingStep })
      .eq("id", user.id);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }

  if (step === "lifestyle") {
    const parsed = onboardingLifestyleSchema.safeParse(normalizeStringArray(formData.getAll("lifestyle_preferences").map(String)));
    if (!parsed.success) return { ok: false, error: "Please review the highlighted fields.", fieldErrors: { lifestyle_preferences: parsed.error.issues[0]?.message ?? "Choose at least one lifestyle cue." } };
    const { error } = await supabase
      .from("user_profiles")
      .update({ lifestyle_preferences: parsed.data, onboarding_step: onboardingStep })
      .eq("id", user.id);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }

  if (step === "values") {
    const parsed = onboardingValuesSchema.safeParse(normalizeStringArray(formData.getAll("values").map(String)));
    if (!parsed.success) return { ok: false, error: "Please review the highlighted fields.", fieldErrors: { values: parsed.error.issues[0]?.message ?? "Choose at least one value." } };
    const { error } = await supabase
      .from("user_profiles")
      .update({ values: parsed.data, onboarding_step: onboardingStep })
      .eq("id", user.id);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }

  if (step === "interests") {
    const parsed = onboardingInterestsSchema.safeParse(normalizeStringArray(formData.getAll("interests").map(String)));
    if (!parsed.success) return { ok: false, error: "Please review the highlighted fields.", fieldErrors: { interests: parsed.error.issues[0]?.message ?? "Choose at least one interest." } };
    const { error } = await supabase
      .from("user_profiles")
      .update({ interests: parsed.data, onboarding_step: onboardingStep })
      .eq("id", user.id);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }

  if (step === "bio") {
    const parsed = onboardingBioSchema.safeParse(String(formData.get("bio") ?? ""));
    if (!parsed.success) return { ok: false, error: "Please review the highlighted fields.", fieldErrors: { bio: parsed.error.issues[0]?.message ?? "Write a short bio." } };
    const occupation = String(formData.get("occupation") ?? "");
    const education = String(formData.get("education") ?? "");
    const extras = onboardingPreferencesExtrasSchema.pick({ occupation: true, education: true, deal_breakers: true }).safeParse({
      occupation,
      education,
      deal_breakers: normalizeStringArray(formData.getAll("deal_breakers").map(String)),
    });
    if (!extras.success) return { ok: false, error: "Please review the highlighted fields.", fieldErrors: mapFieldErrors(extras.error.issues) };
    const { error } = await supabase
      .from("user_profiles")
      .update({
        bio: parsed.data,
        deal_breakers: extras.data.deal_breakers,
        occupation: normalizeOptional(extras.data.occupation),
        education: normalizeOptional(extras.data.education),
        onboarding_step: onboardingStep,
      })
      .eq("id", user.id);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }

  if (step === "discovery_preferences") {
    const parsed = discoveryPreferencesSchema.safeParse({
      age_min: Number(formData.get("age_min") ?? 22),
      age_max: Number(formData.get("age_max") ?? 45),
      distance_km: Number(formData.get("distance_km") ?? 80),
      show_genders: formData.getAll("show_genders").map(String),
      relationship_intents: formData.getAll("relationship_intents").map(String),
      verified_only: boolFromForm(formData, "verified_only"),
      photos_required: boolFromForm(formData, "photos_required", true),
      deal_breaker_strict: boolFromForm(formData, "deal_breaker_strict", true),
    });
    if (!parsed.success) return { ok: false, error: "Check your discovery preferences.", fieldErrors: mapFieldErrors(parsed.error.issues) };

    const { error: prefsError } = await supabase.from("discovery_preferences").upsert({ user_id: user.id, ...parsed.data });
    if (prefsError) return { ok: false, error: prefsError.message };

    const { error } = await supabase
      .from("user_profiles")
      .update({
        show_gender: parsed.data.show_genders,
        age_min_preference: parsed.data.age_min,
        age_max_preference: parsed.data.age_max,
        max_distance_km: parsed.data.distance_km,
        onboarding_step: onboardingStep,
      })
      .eq("id", user.id);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }

  return { ok: false, error: "Unknown onboarding step." };
}

export async function completePremiumOnboarding(): Promise<OnboardingActionResponse> {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "You need to be signed in to continue." };

  const { data: profile, error: profileError } = await supabase
    .from("user_profiles")
    .select("display_name, birth_date, gender, city, region, country_code, bio, relationship_goals, values, interests, lifestyle_preferences, deal_breakers, occupation, education")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) return { ok: false, error: profileError.message };

  const parsed = onboardingProfileSchema.safeParse({
    display_name: profile?.display_name ?? "",
    birth_date: profile?.birth_date ?? "",
    gender: profile?.gender ?? "",
    city: profile?.city ?? "",
    region: profile?.region ?? "",
    country_code: profile?.country_code ?? "",
    bio: profile?.bio ?? "",
    relationship_goals: profile?.relationship_goals ?? [],
    values: profile?.values ?? [],
    interests: profile?.interests ?? [],
    lifestyle_preferences: profile?.lifestyle_preferences ?? [],
    deal_breakers: profile?.deal_breakers ?? [],
    occupation: profile?.occupation ?? "",
    education: profile?.education ?? "",
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: "Your profile still needs a few details before going live.",
      fieldErrors: mapFieldErrors(parsed.error.issues),
    };
  }

  if (!parsed.data.values.length) {
    return {
      ok: false,
      error: "Your profile still needs a few details before going live.",
      fieldErrors: { values: "Choose at least one value." },
    };
  }

  const { error } = await supabase
    .from("user_profiles")
    .update({
      onboarding_stage: "profile_setup",
      profile_status: "active",
      onboarding_step: "finish",
      onboarding_completed_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function completeOnboarding(): Promise<OnboardingActionResponse> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You need to be signed in to continue." };
  }

  const { data: profile, error: profileError } = await supabase
    .from("user_profiles")
    .select(
      "display_name, birth_date, gender, city, region, country_code, bio, relationship_goals, interests, lifestyle_preferences, deal_breakers, occupation, education",
    )
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    return { ok: false, error: profileError.message };
  }

  const parsed = onboardingProfileSchema.safeParse({
    display_name: profile?.display_name ?? "",
    birth_date: profile?.birth_date ?? "",
    gender: profile?.gender ?? "",
    city: profile?.city ?? "",
    region: profile?.region ?? "",
    country_code: profile?.country_code ?? "",
    bio: profile?.bio ?? "",
    relationship_goals: profile?.relationship_goals ?? [],
    interests: profile?.interests ?? [],
    lifestyle_preferences: profile?.lifestyle_preferences ?? [],
    deal_breakers: profile?.deal_breakers ?? [],
    occupation: profile?.occupation ?? "",
    education: profile?.education ?? "",
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: "Your profile still needs a few details before going live.",
      fieldErrors: mapFieldErrors(parsed.error.issues),
    };
  }

  const { error } = await supabase
    .from("user_profiles")
    .update({
      onboarding_stage: "profile_setup",
      profile_status: "active",
      onboarding_step: "complete",
      onboarding_completed_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
