import type { VerificationPose } from "./poses";

export type GeminiSelfieAnalysis = {
  face_count: number;
  face_visible: boolean;
  eyes_visible: boolean;
  lighting_score: number;
  image_quality_score: number;
  pose_match_score: number;
  gesture_detected: boolean;
  head_direction_match: boolean;
  confidence: number;
  genuine_selfie: boolean;
  recommendations: string[];
};

export type VerificationDecision = "APPROVED" | "RETRY_REQUIRED" | "MANUAL_REVIEW_RESERVED";

export type VerificationDecisionResult = {
  decision: VerificationDecision;
  score: number;
  summary: string;
  userFeedback: string[];
  checks: Record<string, boolean>;
  analysis: GeminiSelfieAnalysis;
};

type DecisionOptions = {
  pose: VerificationPose;
  allowManualReview?: boolean;
};

export const verificationDecisionThresholds = {
  lighting_score: 0.72,
  image_quality_score: 0.72,
  pose_match_score: 0.78,
  confidence: 0.75,
  manual_review_margin: 0.06,
} as const;

function asBoolean(value: unknown, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0) {
  const parsed = typeof value === "number" ? value : typeof value === "string" ? Number(value) : fallback;
  if (!Number.isFinite(parsed)) return fallback;
  // Gemini may return either 0-1 or 0-100. Normalize to 0-1.
  return parsed > 1 ? Math.max(0, Math.min(1, parsed / 100)) : Math.max(0, Math.min(1, parsed));
}

function asInteger(value: unknown, fallback = 0) {
  const parsed = typeof value === "number" ? value : typeof value === "string" ? Number(value) : fallback;
  return Number.isFinite(parsed) ? Math.max(0, Math.round(parsed)) : fallback;
}

function asStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

export function normalizeGeminiSelfieAnalysis(raw: Record<string, unknown>): GeminiSelfieAnalysis {
  return {
    face_count: asInteger(raw.face_count),
    face_visible: asBoolean(raw.face_visible),
    eyes_visible: asBoolean(raw.eyes_visible),
    lighting_score: asNumber(raw.lighting_score),
    image_quality_score: asNumber(raw.image_quality_score),
    pose_match_score: asNumber(raw.pose_match_score),
    gesture_detected: asBoolean(raw.gesture_detected),
    head_direction_match: asBoolean(raw.head_direction_match),
    confidence: asNumber(raw.confidence),
    genuine_selfie: raw.genuine_selfie === undefined ? true : asBoolean(raw.genuine_selfie),
    recommendations: asStringArray(raw.recommendations),
  };
}

function isNearThreshold(value: number, threshold: number) {
  return value >= threshold - verificationDecisionThresholds.manual_review_margin;
}

export class VerificationDecisionEngine {
  static evaluate(analysis: GeminiSelfieAnalysis, options: DecisionOptions): VerificationDecisionResult {
    const { pose, allowManualReview = false } = options;
    const t = verificationDecisionThresholds;
    const checks = {
      one_face: analysis.face_count === 1,
      face_clearly_visible: analysis.face_visible,
      eyes_visible: analysis.eyes_visible,
      good_lighting: analysis.lighting_score >= t.lighting_score,
      good_image_quality: analysis.image_quality_score >= t.image_quality_score,
      pose_matches_illustration: analysis.pose_match_score >= t.pose_match_score,
      required_hand_gesture_exists: !pose.requiresHandGesture || analysis.gesture_detected,
      head_direction_matches: analysis.head_direction_match,
      genuine_selfie: analysis.genuine_selfie,
      confidence_high_enough: analysis.confidence >= t.confidence,
    };

    const feedback: string[] = [];
    if (!checks.one_face) feedback.push("Use a selfie with only you in the frame.");
    if (!checks.face_clearly_visible) feedback.push("Move your face into clear view without sunglasses, masks, or heavy shadows.");
    if (!checks.eyes_visible) feedback.push("Make sure both eyes are visible and open.");
    if (!checks.good_lighting) feedback.push("Try brighter, even lighting facing a window or soft lamp.");
    if (!checks.good_image_quality) feedback.push("Use a sharper photo without blur, screenshots, or heavy filters.");
    if (!checks.pose_matches_illustration) feedback.push("Match the shown pose more closely before trying again.");
    if (!checks.required_hand_gesture_exists) feedback.push("Make the requested hand gesture clearly visible beside your face.");
    if (!checks.head_direction_matches) feedback.push("Turn your head in the same direction as the illustration.");
    if (!checks.genuine_selfie) feedback.push("Upload a fresh selfie rather than a screenshot, group photo, or edited image.");
    if (!checks.confidence_high_enough) feedback.push("Try again with a clearer, more direct selfie so the review can be confident.");

    const score = Math.round(
      ((analysis.lighting_score + analysis.image_quality_score + analysis.pose_match_score + analysis.confidence) / 4) * 100,
    );

    const allPassed = Object.values(checks).every(Boolean);
    if (allPassed) {
      return {
        decision: "APPROVED",
        score,
        summary: "Selfie verification approved by Freeborn's backend policy checks.",
        userFeedback: [],
        checks,
        analysis,
      };
    }

    const hardFailures =
      !checks.one_face ||
      !checks.face_clearly_visible ||
      !checks.eyes_visible ||
      !checks.required_hand_gesture_exists ||
      !checks.genuine_selfie;

    const eligibleForFutureManualReview =
      allowManualReview &&
      !hardFailures &&
      isNearThreshold(analysis.lighting_score, t.lighting_score) &&
      isNearThreshold(analysis.image_quality_score, t.image_quality_score) &&
      isNearThreshold(analysis.pose_match_score, t.pose_match_score) &&
      isNearThreshold(analysis.confidence, t.confidence);

    if (eligibleForFutureManualReview) {
      return {
        decision: "MANUAL_REVIEW_RESERVED",
        score,
        summary: "This result is close to approval and is reserved for future manual review.",
        userFeedback: ["This was close. For now, please retry with brighter lighting and a clearer pose."],
        checks,
        analysis,
      };
    }

    const combinedFeedback = [...new Set([...feedback, ...analysis.recommendations])].slice(0, 6);
    return {
      decision: "RETRY_REQUIRED",
      score,
      summary: "Selfie verification needs another try.",
      userFeedback: combinedFeedback.length ? combinedFeedback : ["Try again with a clear, well-lit selfie that matches the illustration."],
      checks,
      analysis,
    };
  }
}
