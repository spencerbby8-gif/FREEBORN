import { createSupabaseServerClient } from "@/lib/supabase/server";

export type IdentityConsistencyAnalysis = {
  same_adult_in_both: boolean;
  face_shape_consistent: boolean;
  profile_photo_clear_enough: boolean;
  obvious_mismatch_signals: boolean;
  selfie_blurry_or_obstructed: boolean;
  profile_photo_blurry_or_obstructed: boolean;
  likely_same_verified_person: boolean;
  consistency_confidence: number;
  recommendations: string[];
};

export type ConsistencyDecision = "APPROVED" | "REVERIFY_REQUIRED" | "MANUAL_REVIEW_RESERVED";

export type ConsistencyDecisionResult = {
  decision: ConsistencyDecision;
  confidence: number;
  summary: string;
  failureReasons: string[];
  userFeedback: string[];
  analysis: IdentityConsistencyAnalysis;
};

function asBoolean(value: unknown, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0) {
  const parsed = typeof value === "number" ? value : typeof value === "string" ? Number(value) : fallback;
  if (!Number.isFinite(parsed)) return fallback;
  return parsed > 1 ? Math.max(0, Math.min(1, parsed / 100)) : Math.max(0, Math.min(1, parsed));
}

function asStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

export function normalizeIdentityConsistencyAnalysis(raw: Record<string, unknown>): IdentityConsistencyAnalysis {
  return {
    same_adult_in_both: asBoolean(raw.same_adult_in_both, true),
    face_shape_consistent: asBoolean(raw.face_shape_consistent, true),
    profile_photo_clear_enough: asBoolean(raw.profile_photo_clear_enough, true),
    obvious_mismatch_signals: asBoolean(raw.obvious_mismatch_signals, false),
    selfie_blurry_or_obstructed: asBoolean(raw.selfie_blurry_or_obstructed, false),
    profile_photo_blurry_or_obstructed: asBoolean(raw.profile_photo_blurry_or_obstructed, false),
    likely_same_verified_person: asBoolean(raw.likely_same_verified_person, true),
    consistency_confidence: asNumber(raw.consistency_confidence, 0.85),
    recommendations: asStringArray(raw.recommendations),
  };
}

export class VerificationRecheckEngine {
  static evaluateConsistency(
    analysis: IdentityConsistencyAnalysis,
    options?: { allowManualReview?: boolean },
  ): ConsistencyDecisionResult {
    const checks = {
      same_adult: analysis.same_adult_in_both,
      consistent_features: analysis.face_shape_consistent,
      profile_photo_clear: analysis.profile_photo_clear_enough,
      no_obvious_mismatch: !analysis.obvious_mismatch_signals,
      selfie_clear: !analysis.selfie_blurry_or_obstructed,
      profile_photo_unobstructed: !analysis.profile_photo_blurry_or_obstructed,
      likely_same_person: analysis.likely_same_verified_person,
      sufficient_confidence: analysis.consistency_confidence >= 0.72,
    };

    const failureReasons: string[] = [];
    const feedback: string[] = [];

    if (!checks.same_adult || !checks.likely_same_person || !checks.no_obvious_mismatch) {
      failureReasons.push("Identity mismatch: Profile photo appears to be a different person than the verified selfie.");
      feedback.push("We need to confirm your updated photos. Please complete a quick selfie check where your face matches the person in your public profile photos.");
    }
    if (!checks.consistent_features) {
      failureReasons.push("Facial feature inconsistency detected across verification selfie and profile photo.");
      feedback.push("Your profile photos changed enough that we need a fresh verification to keep your trust badge active.");
    }
    if (!checks.profile_photo_clear || !checks.profile_photo_unobstructed) {
      failureReasons.push("Profile photo is too blurry, filtered, or obstructed to confirm identity consistency.");
      feedback.push("Make sure your primary profile photo clearly shows your face without heavy filters or obstructions.");
    }
    if (!checks.selfie_clear) {
      failureReasons.push("Verification selfie is too blurry or obstructed for high-confidence comparison.");
      feedback.push("Please complete a quick selfie check in clear front lighting.");
    }
    if (!checks.sufficient_confidence) {
      failureReasons.push(`Low identity consistency confidence (${analysis.consistency_confidence}).`);
      feedback.push("We need to confirm your updated photos with a quick selfie check.");
    }

    const allPassed = Object.values(checks).every(Boolean);
    if (allPassed) {
      return {
        decision: "APPROVED",
        confidence: analysis.consistency_confidence,
        summary: "Identity consistency verified between verification selfie and public profile photos.",
        failureReasons: [],
        userFeedback: [],
        analysis,
      };
    }

    const hardFailures = !checks.same_adult || !checks.no_obvious_mismatch || !checks.likely_same_person;
    if (options?.allowManualReview && !hardFailures && analysis.consistency_confidence >= 0.65) {
      return {
        decision: "MANUAL_REVIEW_RESERVED",
        confidence: analysis.consistency_confidence,
        summary: "Borderline consistency result reserved for future manual review.",
        failureReasons: failureReasons.length ? failureReasons : ["Borderline consistency thresholds"],
        userFeedback: ["We need to confirm your updated photos with a quick selfie check."],
        analysis,
      };
    }

    return {
      decision: "REVERIFY_REQUIRED",
      confidence: analysis.consistency_confidence,
      summary: "Profile photo no longer matches verified selfie identity or requires confirmation.",
      failureReasons: failureReasons.length ? failureReasons : ["Identity consistency check failed"],
      userFeedback: feedback.length ? [...new Set(feedback)] : ["Your profile photos changed enough that we need a fresh verification."],
      analysis,
    };
  }
}

function parseCleanJson(text: string): Record<string, unknown> {
  const cleaned = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  return JSON.parse(cleaned) as Record<string, unknown>;
}

export class IdentityConsistencyService {
  static async checkDuplicateVerificationRisk(
    selfieFile: { type: string; buffer: Buffer },
    userId: string,
    apiKey: string,
  ): Promise<{ isDuplicateRisk: boolean; confidence: number }> {
    const supabase = await createSupabaseServerClient();
    const { data: recentOtherSelfies } = await supabase
      .from("verification_selfie_checks")
      .select("storage_path, user_id")
      .neq("user_id", userId)
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(3);

    if (!recentOtherSelfies || recentOtherSelfies.length === 0) {
      return { isDuplicateRisk: false, confidence: 0 };
    }

    const otherPhotos: Array<{ type: string; buffer: Buffer; path: string }> = [];
    for (const row of recentOtherSelfies) {
      const { data: blob } = await supabase.storage.from("verification-selfies").download(row.storage_path);
      if (blob) {
        const buffer = Buffer.from(await blob.arrayBuffer());
        otherPhotos.push({ type: "image/jpeg", buffer, path: row.storage_path });
      }
    }

    if (otherPhotos.length === 0) {
      return { isDuplicateRisk: false, confidence: 0 };
    }

    const prompt = `You are Freeborn's private duplicate identity detector. Compare Image 1 (current verification selfie attempt) against Images 2+ (previously verified selfies from distinct user accounts). Determine whether the exact same adult face appears in Image 1 as across any of Images 2+. Return structured JSON only with exact keys: same_person_as_other_account boolean, confidence number 0-1, recommendations string array. Do not include markdown.`;

    const parts: Array<{ text: string } | { inline_data: { mime_type: string; data: string } }> = [
      { text: prompt },
      { inline_data: { mime_type: selfieFile.type || "image/jpeg", data: selfieFile.buffer.toString("base64") } },
    ];
    for (const p of otherPhotos) {
      parts.push({ inline_data: { mime_type: p.type || "image/jpeg", data: p.buffer.toString("base64") } });
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        generationConfig: { response_mime_type: "application/json", temperature: 0.1 },
        contents: [{ role: "user", parts }],
      }),
    });

    if (!response.ok) return { isDuplicateRisk: false, confidence: 0 };
    const payload = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
    const text = payload.candidates?.[0]?.content?.parts?.find((part) => part.text)?.text;
    if (!text) return { isDuplicateRisk: false, confidence: 0 };

    const parsed = parseCleanJson(text);
    const isDuplicateRisk = typeof parsed.same_person_as_other_account === "boolean" ? parsed.same_person_as_other_account : false;
    const confidence = typeof parsed.confidence === "number" ? parsed.confidence : 0;
    return { isDuplicateRisk: isDuplicateRisk && confidence >= 0.78, confidence };
  }

  static async evaluatePhotos(
    selfieFile: { type: string; buffer: Buffer },
    profilePhotos: Array<{ type: string; buffer: Buffer; path: string }>,
    apiKey: string,
  ): Promise<ConsistencyDecisionResult> {
    if (profilePhotos.length === 0) {
      return {
        decision: "APPROVED",
        confidence: 1.0,
        summary: "No profile photos present yet.",
        failureReasons: [],
        userFeedback: [],
        analysis: normalizeIdentityConsistencyAnalysis({ same_adult_in_both: true, likely_same_verified_person: true, consistency_confidence: 1.0 }),
      };
    }

    let strongMatchCount = 0;
    let hardMismatchCount = 0;
    let bestAnalysis: IdentityConsistencyAnalysis | null = null;
    let highestConfidence = -1;

    for (const photo of profilePhotos.slice(0, 3)) {
      const prompt = `You are Freeborn's private identity consistency analyzer. You are NOT the final approval authority. Do not approve or reject the member. Return structured JSON only with analysis fields for the backend policy engine. Compare the private verification selfie (first image part) against the member's public profile photo (second image part). Analyze whether the same adult appears across both images, whether face shape and visible facial features appear consistent, whether the profile photo is clear enough for a trust decision, whether there are obvious mismatch signals, whether either image is too blurry, cropped, filtered, or obstructed, and whether the profile photo appears likely to be the same verified person. Return JSON only with these exact keys: same_adult_in_both boolean, face_shape_consistent boolean, profile_photo_clear_enough boolean, obvious_mismatch_signals boolean, selfie_blurry_or_obstructed boolean, profile_photo_blurry_or_obstructed boolean, likely_same_verified_person boolean, consistency_confidence number 0-1, recommendations string array. Do not include markdown or final decision status.`;

      const parts: Array<{ text: string } | { inline_data: { mime_type: string; data: string } }> = [
        { text: prompt },
        { inline_data: { mime_type: selfieFile.type || "image/jpeg", data: selfieFile.buffer.toString("base64") } },
        { inline_data: { mime_type: photo.type || "image/jpeg", data: photo.buffer.toString("base64") } },
      ];

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          generationConfig: { response_mime_type: "application/json", temperature: 0.1 },
          contents: [{ role: "user", parts }],
        }),
      });

      if (response.ok) {
        const payload = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
        const text = payload.candidates?.[0]?.content?.parts?.find((part) => part.text)?.text;
        if (text) {
          const parsed = parseCleanJson(text);
          const analysis = normalizeIdentityConsistencyAnalysis(parsed);
          if (analysis.consistency_confidence > highestConfidence) {
            highestConfidence = analysis.consistency_confidence;
            bestAnalysis = analysis;
          }

          const isStrong =
            analysis.same_adult_in_both &&
            analysis.likely_same_verified_person &&
            !analysis.obvious_mismatch_signals &&
            analysis.consistency_confidence >= 0.75 &&
            analysis.profile_photo_clear_enough &&
            !analysis.profile_photo_blurry_or_obstructed;

          const isHardMismatch =
            !analysis.same_adult_in_both ||
            !analysis.likely_same_verified_person ||
            analysis.obvious_mismatch_signals;

          if (isStrong) strongMatchCount++;
          if (isHardMismatch) hardMismatchCount++;
        }
      }
    }

    if (!bestAnalysis) {
      throw new Error("Gemini returned no structured result across photo comparisons.");
    }

    const n = Math.min(3, profilePhotos.length);
    const requiredMatches = n === 3 ? 2 : 1;
    const rule2Passed = strongMatchCount >= requiredMatches && hardMismatchCount === 0;

    if (rule2Passed) {
      return {
        decision: "APPROVED",
        confidence: highestConfidence,
        summary: `Identity consistency confirmed across ${strongMatchCount} of ${n} public profile photos.`,
        failureReasons: [],
        userFeedback: [],
        analysis: bestAnalysis,
      };
    }

    if (hardMismatchCount > 0) {
      return {
        decision: "REVERIFY_REQUIRED",
        confidence: bestAnalysis.consistency_confidence,
        summary: "Profile photo mismatch detected across one or more public photos.",
        failureReasons: ["Hard identity mismatch across public profile photos"],
        userFeedback: ["Your profile photos changed enough that we need a fresh verification to confirm your identity."],
        analysis: bestAnalysis,
      };
    }

    return VerificationRecheckEngine.evaluateConsistency(bestAnalysis);
  }

  static async runConsistencyCheck(
    userId: string,
    options?: { selfieCheckId?: string; selfieStoragePath?: string },
  ): Promise<{ ok: boolean; result?: ConsistencyDecisionResult; error?: string; pendingPhotos?: boolean }> {
    const supabase = await createSupabaseServerClient();
    const apiKey = process.env.GEMINI_API_KEY;

    let selfieCheckId = options?.selfieCheckId;
    let selfieStoragePath = options?.selfieStoragePath;

    if (!selfieCheckId || !selfieStoragePath) {
      const { data: approvedRow } = await supabase
        .from("verification_selfie_checks")
        .select("id, storage_path")
        .eq("user_id", userId)
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle<{ id: string; storage_path: string }>();

      if (!approvedRow) {
        return { ok: true };
      }
      selfieCheckId = approvedRow.id;
      selfieStoragePath = approvedRow.storage_path;
    }

    const { data: profilePhotos } = await supabase
      .from("profile_photos")
      .select("storage_path, position")
      .eq("user_id", userId)
      .order("position", { ascending: true })
      .limit(3);

    const photos = profilePhotos ?? [];
    if (photos.length === 0) {
      await supabase.from("user_profiles").update({
        is_verified: false,
        identity_consistency_status: "pending_photos",
        last_consistency_checked_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).eq("id", userId);

      await supabase.from("verification_audit_logs").insert({
        user_id: userId,
        attempt_id: selfieCheckId ?? null,
        event_type: "PHOTO_CHANGE_REVERIFY_REQUIRED",
        challenge_assigned: {},
        gemini_analysis: {},
        backend_decision: "PENDING_PUBLIC_PHOTO",
        internal_risk_score: 0,
        failure_reasons: ["No public profile photo present"],
        retry_count: 0,
        in_cooldown: false,
        cooldown_until: null,
        compared_photos: selfieStoragePath ? [selfieStoragePath] : [],
        consistency_confidence: 0,
        reverify_required: false,
        metadata: { timestamp: new Date().toISOString(), trigger: "pending_public_photo" },
      });

      return {
        ok: true,
        pendingPhotos: true,
        result: {
          decision: "REVERIFY_REQUIRED",
          confidence: 0,
          summary: "Please add a public photo before completing verification.",
          failureReasons: ["No public profile photos available"],
          userFeedback: ["Please add at least one public profile photo first. Once added, Freeborn confirms identity consistency and activates your trust badge."],
          analysis: normalizeIdentityConsistencyAnalysis({ same_adult_in_both: true, likely_same_verified_person: true, consistency_confidence: 0 }),
        },
      };
    }

    if (!apiKey) {
      return { ok: false, error: "Identity consistency service temporarily unavailable." };
    }

    try {
      const { data: selfieBlob } = await supabase.storage.from("verification-selfies").download(selfieStoragePath);
      if (!selfieBlob) {
        return { ok: false, error: "Verification selfie storage not accessible." };
      }
      const selfieBuffer = Buffer.from(await selfieBlob.arrayBuffer());

      const photoDataList: Array<{ type: string; buffer: Buffer; path: string }> = [];
      for (const p of photos) {
        const { data: photoBlob } = await supabase.storage.from("profile-photos").download(p.storage_path);
        if (photoBlob) {
          const buffer = Buffer.from(await photoBlob.arrayBuffer());
          const ext = p.storage_path.split(".").pop()?.toLowerCase();
          const mime = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
          photoDataList.push({ type: mime, buffer, path: p.storage_path });
        }
      }

      if (photoDataList.length === 0) {
        return { ok: false, error: "Could not read profile photo storage." };
      }

      const result = await this.evaluatePhotos({ type: "image/jpeg", buffer: selfieBuffer }, photoDataList, apiKey);
      const comparedPaths = [selfieStoragePath, ...photoDataList.map((p) => p.path)];
      const reverifyRequired = result.decision === "REVERIFY_REQUIRED";

      if (result.decision === "APPROVED") {
        await supabase.from("user_profiles").update({
          is_verified: true,
          identity_consistency_status: "approved",
          last_consistency_checked_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }).eq("id", userId);

        await supabase.from("verification_audit_logs").insert({
          user_id: userId,
          attempt_id: selfieCheckId,
          event_type: "PHOTO_CHANGE_CONSISTENCY_CHECK",
          challenge_assigned: {},
          gemini_analysis: result.analysis,
          backend_decision: result.decision,
          internal_risk_score: 0,
          failure_reasons: result.failureReasons,
          retry_count: 0,
          in_cooldown: false,
          cooldown_until: null,
          compared_photos: comparedPaths,
          consistency_confidence: result.confidence,
          reverify_required: false,
          metadata: { timestamp: new Date().toISOString(), trigger: "identity_consistency_check" },
        });

        if (selfieCheckId) {
          await supabase.from("verification_selfie_checks").update({
            identity_consistency_result: result,
          }).eq("id", selfieCheckId);
        }
      } else if (reverifyRequired) {
        await supabase.from("user_profiles").update({
          is_verified: false,
          identity_consistency_status: "mismatch_reverify_required",
          last_consistency_checked_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }).eq("id", userId);

        await supabase.from("verification_audit_logs").insert({
          user_id: userId,
          attempt_id: selfieCheckId,
          event_type: "PHOTO_CHANGE_REVERIFY_REQUIRED",
          challenge_assigned: {},
          gemini_analysis: result.analysis,
          backend_decision: result.decision,
          internal_risk_score: 85,
          failure_reasons: result.failureReasons,
          retry_count: 0,
          in_cooldown: false,
          cooldown_until: null,
          compared_photos: comparedPaths,
          consistency_confidence: result.confidence,
          reverify_required: true,
          metadata: { timestamp: new Date().toISOString(), trigger: "identity_consistency_mismatch" },
        });

        if (selfieCheckId) {
          await supabase.from("verification_selfie_checks").update({
            identity_consistency_result: result,
          }).eq("id", selfieCheckId);
        }
      }

      return { ok: true, result };
    } catch (err: unknown) {
      return { ok: false, error: (err as Error)?.message || "Consistency check failed." };
    }
  }
}
