"use server";

import { revalidatePath } from "next/cache";
import { swipeActionSchema, messageSendSchema, discoveryPreferencesSchema, profileEditSchema } from "@freeborn/shared";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function swipeAction(formData: FormData) {
  const payload = {
    liked_id: String(formData.get("liked_id") ?? ""),
    action: String(formData.get("action") ?? "like") as "like" | "pass" | "superlike",
    note: formData.get("note") ? String(formData.get("note")) : undefined,
  };

  const parsed = swipeActionSchema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false, error: "Invalid swipe." };
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sign in required." };

  const { error } = await supabase.from("user_swipes").upsert({
    liker_id: user.id,
    liked_id: parsed.data.liked_id,
    action: parsed.data.action,
    note: parsed.data.note ?? null,
  }, { onConflict: "liker_id,liked_id" });

  if (error) return { ok: false, error: error.message };

  // check if match created
  const { data: match } = await supabase
    .from("user_matches")
    .select("id")
    .or(`and(user_a.eq.${user.id},user_b.eq.${parsed.data.liked_id}),and(user_a.eq.${parsed.data.liked_id},user_b.eq.${user.id})`)
    .maybeSingle();

  revalidatePath("/app");
  revalidatePath("/app/matches");
  revalidatePath("/app/likes");

  return { ok: true, matched: Boolean(match), matchId: match?.id ?? null };
}

export async function sendMessage(_prev: unknown, formData: FormData) {
  const parsed = messageSendSchema.safeParse({
    match_id: String(formData.get("match_id") ?? ""),
    body: String(formData.get("body") ?? ""),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid message." };
  }
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sign in required." };

  const { error } = await supabase.from("match_messages").insert({
    match_id: parsed.data.match_id,
    sender_id: user.id,
    body: parsed.data.body,
  });
  if (error) return { ok: false, error: error.message };

  await supabase.from("user_matches").update({ last_message_at: new Date().toISOString() }).eq("id", parsed.data.match_id);

  revalidatePath(`/app/matches/${parsed.data.match_id}`);
  revalidatePath("/app/matches");
  return { ok: true };
}

export async function saveDiscoveryPreferences(_prev: unknown, formData: FormData) {
  const payload = {
    age_min: Number(formData.get("age_min")),
    age_max: Number(formData.get("age_max")),
    distance_km: Number(formData.get("distance_km")),
    show_genders: formData.getAll("show_genders").map(String),
    relationship_intents: formData.getAll("relationship_intents").map(String),
    verified_only: formData.getAll("verified_only").includes("true"),
    photos_required: formData.getAll("photos_required").includes("true"),
    deal_breaker_strict: formData.getAll("deal_breaker_strict").includes("true"),
  };
  const parsed = discoveryPreferencesSchema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false, error: "Check your filters." };
  }
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sign in required." };

  const { error } = await supabase.from("discovery_preferences").upsert({
    user_id: user.id,
    age_min: parsed.data.age_min,
    age_max: parsed.data.age_max,
    distance_km: parsed.data.distance_km,
    show_genders: parsed.data.show_genders,
    relationship_intents: parsed.data.relationship_intents,
    verified_only: parsed.data.verified_only,
    photos_required: parsed.data.photos_required,
    deal_breaker_strict: parsed.data.deal_breaker_strict,
    updated_at: new Date().toISOString(),
  });
  if (error) return { ok: false, error: error.message };

  // mirror to profile for speed
  await supabase.from("user_profiles").update({
    age_min_preference: parsed.data.age_min,
    age_max_preference: parsed.data.age_max,
    max_distance_km: parsed.data.distance_km,
    show_gender: parsed.data.show_genders,
  }).eq("id", user.id);

  revalidatePath("/app");
  revalidatePath("/app/profile");
  return { ok: true };
}

export async function saveProfileVisibility(_prev: unknown, formData: FormData) {
  const discoverable = formData.get("discoverable") === "true";
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sign in required." };

  const { error } = await supabase.from("user_profiles").update({
    discoverable,
    updated_at: new Date().toISOString(),
  }).eq("id", user.id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/app/profile");
  revalidatePath("/app");
  return { ok: true };
}

export async function saveProfileEdit(_prev: unknown, formData: FormData) {
  const getArray = (k: string) => formData.getAll(k).map(String);
  const payload = {
    display_name: String(formData.get("display_name") ?? ""),
    birth_date: String(formData.get("birth_date") ?? ""),
    gender: String(formData.get("gender") ?? ""),
    city: String(formData.get("city") ?? ""),
    region: String(formData.get("region") ?? ""),
    country_code: String(formData.get("country_code") ?? ""),
    bio: String(formData.get("bio") ?? ""),
    relationship_goals: getArray("relationship_goals"),
    interests: getArray("interests"),
    lifestyle_preferences: getArray("lifestyle_preferences"),
    deal_breakers: getArray("deal_breakers"),
    occupation: String(formData.get("occupation") ?? ""),
    education: String(formData.get("education") ?? ""),
    height_cm: formData.get("height_cm") ? Number(formData.get("height_cm")) : null,
    prompt_answers: (() => {
      try {
        const raw = formData.get("prompt_answers");
        return raw ? JSON.parse(String(raw)) : [];
      } catch { return []; }
    })(),
    show_gender: getArray("show_gender"),
    discoverable: formData.has("discoverable") ? formData.get("discoverable") === "true" : undefined,
  };

  const parsed = profileEditSchema.safeParse(payload);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    parsed.error.issues.forEach((issue) => {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    });
    return { ok: false, error: "Please review the highlighted fields and try again.", fieldErrors };
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sign in required." };

  const d = parsed.data;
  const updates: Record<string, unknown> = {
    display_name: d.display_name,
    birth_date: d.birth_date,
    gender: d.gender,
    city: d.city,
    region: d.region || null,
    country_code: d.country_code || null,
    bio: d.bio,
    relationship_goals: d.relationship_goals,
    interests: d.interests,
    lifestyle_preferences: d.lifestyle_preferences,
    deal_breakers: d.deal_breakers,
    occupation: d.occupation || null,
    education: d.education || null,
    height_cm: d.height_cm ?? null,
    prompt_answers: d.prompt_answers ?? [],
    show_gender: d.show_gender ?? [],
    updated_at: new Date().toISOString(),
  };
  if (formData.has("discoverable")) updates.discoverable = d.discoverable;

  const { error } = await supabase.from("user_profiles").update(updates).eq("id", user.id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/app/profile");
  revalidatePath("/app");
  return { ok: true };
}
