"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  onboardingAboutYouSchema,
  onboardingBioGoalsSchema,
  onboardingIdentitySchema,
  onboardingInterestsLifestyleSchema,
  onboardingPreferencesExtrasSchema,
  onboardingProfileSchema,
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

  revalidatePath("/app/onboarding");
  redirect("/app/onboarding?step=about_you");
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

  revalidatePath("/app/onboarding");
  redirect("/app/onboarding?step=bio_goals");
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

  revalidatePath("/app/onboarding");
  redirect("/app/onboarding?step=interests_lifestyle");
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

  revalidatePath("/app/onboarding");
  redirect("/app/onboarding?step=preferences_extras");
}

export async function saveOnboardingPreferencesExtras(
  _: OnboardingActionResponse | null,
  formData: FormData,
): Promise<OnboardingActionResponse> {
  const deal_breakers = normalizeStringArray(
    formData.getAll("deal_breakers").map(String),
  );
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

  revalidatePath("/app/onboarding");
  redirect("/app/onboarding?step=complete");
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

  revalidatePath("/app");
  redirect("/app?status=onboarded");
}
