"use server";

import { readFile } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { getBaseUrl } from "@/lib/auth/url";
import { getVerificationPose } from "@/lib/verification/poses";
import { normalizeGeminiSelfieAnalysis, VerificationDecisionEngine } from "@/lib/verification/decision-engine";
import {
  onboardingBioSchema,
  onboardingBirthDateSchema,
  onboardingCitySchema,
  onboardingCountryCodeSchema,
  onboardingDealBreakersSchema,
  onboardingDisplayNameSchema,
  onboardingGenderSchema,
  onboardingInterestsSchema,
  onboardingLifestyleSchema,
  onboardingOccupationSchema,
  onboardingRegionSchema,
  onboardingRelationshipGoalsSchema,
  onboardingValuesSchema,
  profileHeightSchema,
  profilePromptsSchema,
} from "@freeborn/shared";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ProfileSectionState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  savedAt?: string;
} | null;

export type VerificationRequestState = {
  ok: boolean;
  error?: string;
  status?: "sent" | "approved";
} | null;

export type SelfieVerificationState = {
  ok: boolean;
  status?: "approved" | "failed" | "error";
  score?: number;
  summary?: string;
  feedback?: string[];
  checks?: Record<string, boolean>;
  error?: string;
} | null;

function mapFieldErrors(issues: Array<{ path: PropertyKey[]; message: string }>) {
  const errors: Record<string, string> = {};
  for (const issue of issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !errors[key]) errors[key] = issue.message;
  }
  return errors;
}

function normalizeOptional(value: string | undefined | null) {
  const trimmed = (value ?? "").trim();
  return trimmed ? trimmed : null;
}

function extensionForMime(type: string) {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  return "jpg";
}

function parseGeminiJson(text: string): Record<string, unknown> {
  const cleaned = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  return JSON.parse(cleaned) as Record<string, unknown>;
}

async function requireUser() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function requestVerification(_prev: VerificationRequestState, _formData: FormData): Promise<VerificationRequestState> {
  void _prev;
  void _formData;
  const { supabase, user } = await requireUser();
  if (!user?.email) return { ok: false, error: "Sign in with an email address to request verification." };

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("is_verified")
    .eq("id", user.id)
    .maybeSingle<{ is_verified: boolean }>();

  if (profile?.is_verified) return { ok: true, status: "approved" };

  const { error } = await supabase.auth.resend({
    type: "signup",
    email: user.email,
    options: {
      emailRedirectTo: `${getBaseUrl()}/auth/complete?intent=verify&next=/app/profile/verification`,
    },
  });

  if (error) return { ok: false, error: error.message };
  revalidatePath("/app/profile/verification");
  return { ok: true, status: "sent" };
}

export async function submitVerificationSelfie(_prev: SelfieVerificationState, formData: FormData): Promise<SelfieVerificationState> {
  void _prev;
  const poseId = String(formData.get("pose_id") ?? "");
  const file = formData.get("selfie") as File | null;
  const pose = getVerificationPose(poseId);

  if (!pose) return { ok: false, status: "error", error: "Choose a verification pose and try again." };
  if (!file || file.size === 0) return { ok: false, status: "error", error: "Upload a clear selfie to continue." };
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    return { ok: false, status: "error", error: "Use a JPG, PNG, or WebP selfie." };
  }
  if (file.size > 10 * 1024 * 1024) {
    return { ok: false, status: "error", error: "Choose a selfie under 10MB." };
  }

  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, status: "error", error: "Sign in required." };

  const ext = extensionForMime(file.type);
  const storagePath = `${user.id}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
  const { error: uploadError } = await supabase.storage.from("verification-selfies").upload(storagePath, file, {
    cacheControl: "0",
    upsert: false,
    contentType: file.type,
  });
  if (uploadError) return { ok: false, status: "error", error: "We could not store that selfie securely. Please try again." };

  const { data: checkRow } = await supabase
    .from("verification_selfie_checks")
    .insert({
      user_id: user.id,
      storage_path: storagePath,
      pose_id: pose.id,
      pose_asset_path: pose.assetPath,
      status: "pending",
    })
    .select("id")
    .single<{ id: string }>();

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    await supabase.from("verification_selfie_checks").update({
      status: "error",
      feedback: ["Verification review is temporarily unavailable. Please try again later."],
    }).eq("storage_path", storagePath).eq("user_id", user.id);
    return { ok: false, status: "error", error: "Verification review is temporarily unavailable. Please try again later." };
  }

  try {
    const selfieBytes = Buffer.from(await file.arrayBuffer());
    const assetPath = path.join(process.cwd(), "public", pose.assetPath.replace(/^\//, ""));
    const illustrationSvg = await readFile(assetPath, "utf8");

    const prompt = `You are Freeborn's private selfie verification analyzer. You are NOT the final approval authority. Do not approve or reject the member. Return structured JSON only with analysis fields for the backend policy engine. Compare the uploaded selfie against the selected onboarding illustration. Selected pose: ${pose.title}. Instruction: ${pose.instruction}. Required hand gesture: ${pose.requiresHandGesture ? pose.gesture : "none"}. Required head direction: ${pose.headDirection}. Illustration SVG reference: ${illustrationSvg.slice(0, 12000)}. Return JSON only with these exact keys: face_count number, face_visible boolean, eyes_visible boolean, lighting_score number 0-1, image_quality_score number 0-1, pose_match_score number 0-1, gesture_detected boolean, head_direction_match boolean, confidence number 0-1, genuine_selfie boolean, recommendations string array. Do not include approved, rejected, pass, fail, status, or final_decision. Do not include markdown.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        generationConfig: { response_mime_type: "application/json", temperature: 0.1 },
        contents: [
          {
            role: "user",
            parts: [
              { text: prompt },
              { inline_data: { mime_type: file.type, data: selfieBytes.toString("base64") } },
            ],
          },
        ],
      }),
    });

    if (!response.ok) throw new Error(`Gemini request failed: ${response.status}`);
    const payload = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
    const text = payload.candidates?.[0]?.content?.parts?.find((part) => part.text)?.text;
    if (!text) throw new Error("Gemini returned no structured result.");
    const parsed = parseGeminiJson(text);
    const analysis = normalizeGeminiSelfieAnalysis(parsed);
    const decision = VerificationDecisionEngine.evaluate(analysis, { pose });
    const approved = decision.decision === "APPROVED";
    const status = approved ? "approved" : "failed";

    await supabase.from("verification_selfie_checks").update({
      status,
      score: decision.score,
      gemini_result: { analysis, decision: decision.decision, thresholdsOwner: "VerificationDecisionEngine" },
      feedback: decision.userFeedback,
    }).eq("id", checkRow?.id ?? "").eq("user_id", user.id);

    // Public verification status is updated only after the backend policy engine approves.
    // Gemini remains an analyzer and never directly controls this public badge flag.
    if (approved) {
      await supabase.from("user_profiles").update({
        is_verified: true,
        verified_photo: true,
        updated_at: new Date().toISOString(),
      }).eq("id", user.id);
    }

    revalidatePath("/app/profile/verification");
    revalidatePath("/app/profile");
    revalidatePath("/app");
    return {
      ok: approved,
      status,
      score: decision.score,
      summary: decision.summary,
      feedback: decision.userFeedback,
      checks: decision.checks,
    };
  } catch {
    await supabase.from("verification_selfie_checks").update({
      status: "error",
      feedback: ["We could not complete the AI review. Please retry with the same pose or choose another one."],
    }).eq("id", checkRow?.id ?? "").eq("user_id", user.id);
    return {
      ok: false,
      status: "error",
      error: "We could not complete the AI review. Please retry with the same pose or choose another one.",
      feedback: ["Check your connection and upload a clear, well-lit selfie."],
    };
  }
}

export async function saveProfileSection(_prev: ProfileSectionState, formData: FormData): Promise<ProfileSectionState> {
  const section = String(formData.get("section") ?? "");
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Sign in required." };

  let updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (section === "about-me") {
    const parsed = onboardingDisplayNameSchema.safeParse(String(formData.get("display_name") ?? ""));
    const birthDate = onboardingBirthDateSchema.safeParse(String(formData.get("birth_date") ?? ""));
    const gender = onboardingGenderSchema.safeParse(String(formData.get("gender") ?? ""));
    const city = onboardingCitySchema.safeParse(String(formData.get("city") ?? ""));
    const region = onboardingRegionSchema.safeParse(String(formData.get("region") ?? ""));
    const country = onboardingCountryCodeSchema.safeParse(String(formData.get("country_code") ?? ""));
    const occupation = onboardingOccupationSchema.safeParse(String(formData.get("occupation") ?? ""));
    const education = onboardingOccupationSchema.safeParse(String(formData.get("education") ?? ""));
    const bio = onboardingBioSchema.safeParse(String(formData.get("bio") ?? ""));
    const height = formData.get("height_cm") ? profileHeightSchema.safeParse(Number(formData.get("height_cm"))) : { success: true, data: null } as const;
    const checks = { display_name: parsed, birth_date: birthDate, gender, city, region, country_code: country, occupation, education, bio, height_cm: height };
    const fieldErrors: Record<string, string> = {};
    for (const [key, result] of Object.entries(checks)) {
      if (!result.success) fieldErrors[key] = result.error.issues[0]?.message ?? "Check this field.";
    }
    if (Object.keys(fieldErrors).length) return { ok: false, error: "Please review the highlighted fields.", fieldErrors };
    updates = {
      ...updates,
      display_name: parsed.data,
      birth_date: birthDate.data,
      gender: gender.data,
      city: city.data,
      region: normalizeOptional(region.data),
      country_code: normalizeOptional(country.data),
      occupation: normalizeOptional(occupation.data),
      education: normalizeOptional(education.data),
      bio: bio.data,
      height_cm: height.data ?? null,
    };
  } else if (section === "intent") {
    const parsed = onboardingRelationshipGoalsSchema.safeParse(formData.getAll("relationship_goals").map(String));
    if (!parsed.success) return { ok: false, error: "Choose at least one relationship intent.", fieldErrors: { relationship_goals: parsed.error.issues[0]?.message ?? "Choose at least one." } };
    updates = { ...updates, relationship_goals: parsed.data, relationship_goal: parsed.data[0] ?? null };
  } else if (section === "values") {
    const parsed = onboardingValuesSchema.safeParse(formData.getAll("values").map(String));
    if (!parsed.success) return { ok: false, error: "Choose at least one value.", fieldErrors: { values: parsed.error.issues[0]?.message ?? "Choose at least one." } };
    updates = { ...updates, values: parsed.data };
  } else if (section === "lifestyle") {
    const parsed = onboardingLifestyleSchema.safeParse(formData.getAll("lifestyle_preferences").map(String));
    if (!parsed.success) return { ok: false, error: "Choose at least one lifestyle cue.", fieldErrors: { lifestyle_preferences: parsed.error.issues[0]?.message ?? "Choose at least one." } };
    updates = { ...updates, lifestyle_preferences: parsed.data };
  } else if (section === "interests") {
    const parsed = onboardingInterestsSchema.safeParse(formData.getAll("interests").map(String));
    if (!parsed.success) return { ok: false, error: "Choose at least one interest.", fieldErrors: { interests: parsed.error.issues[0]?.message ?? "Choose at least one." } };
    updates = { ...updates, interests: parsed.data };
  } else if (section === "dealbreakers") {
    const parsed = onboardingDealBreakersSchema.safeParse(formData.getAll("deal_breakers").map(String));
    if (!parsed.success) return { ok: false, error: "Pick up to 12 dealbreakers.", fieldErrors: { deal_breakers: parsed.error.issues[0]?.message ?? "Pick up to 12." } };
    updates = { ...updates, deal_breakers: parsed.data };
  } else if (section === "prompts") {
    let prompt_answers: unknown = [];
    try { prompt_answers = JSON.parse(String(formData.get("prompt_answers") ?? "[]")); } catch { prompt_answers = []; }
    const parsed = profilePromptsSchema.safeParse(prompt_answers);
    if (!parsed.success) return { ok: false, error: "Review your prompt answers.", fieldErrors: mapFieldErrors(parsed.error.issues) };
    updates = { ...updates, prompt_answers: parsed.data };
  } else if (section === "privacy-visibility") {
    updates = { ...updates, discoverable: formData.get("discoverable") === "true" };
  } else {
    return { ok: false, error: "Unknown profile section." };
  }

  const { error } = await supabase.from("user_profiles").update(updates).eq("id", user.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/app/profile");
  revalidatePath(`/app/profile/${section}`);
  revalidatePath("/app");
  return { ok: true, savedAt: new Date().toISOString() };
}
