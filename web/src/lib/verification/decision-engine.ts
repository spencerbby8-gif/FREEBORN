import type { VerificationChallenge, VerificationPose } from "./poses";
import type { OpenCVQualityResult } from "./opencv-quality-service";
import { VerificationRiskEngine } from "./verification-risk-engine";

export type GeminiSelfieAnalysis = {
  face_count: number;
  face_visible: boolean;
  eyes_visible: boolean;
  lighting_score: number;
  image_quality_score: number;
  pose_match_score: number;
  gesture_detected: boolean;
  head_direction_match: boolean;
  expression_match: boolean;
  confidence: number;
  genuine_selfie: boolean;
  screenshot_indicators: boolean;
  screen_photo_indicators: boolean;
  edited_image_indicators: boolean;
  synthetic_face_likelihood: number;
  ai_artifact_indicators: boolean;
  deepfake_suspicion: boolean;
  unusual_facial_distortion: boolean;
  recommendations: string[];
};

export type VerificationDecision = "APPROVED" | "RETRY_REQUIRED" | "MANUAL_REVIEW_RESERVED";

export type VerificationRiskSignals = {
  retryHistoryCount?: number;
  recentAttemptCount?: number;
  isFreshTimestamp?: boolean;
  hasScreenshotIndicators?: boolean;
  hasMultipleFaces?: boolean;
  hasScreenPhotoIndicators?: boolean;
  hasEditedImageFlags?: boolean;
  hasDuplicateFaceRisk?: boolean;
  hasSyntheticOrDeepfakeIndicators?: boolean;
  priorSafetyFlagsCount?: number;
  accountAgeDays?: number;
  deviceMetadata?: Record<string, unknown>;
};

export type VerificationMethod = "SELFIE" | "GOVERNMENT_ID" | "VIDEO_LIVENESS" | "HUMAN_REVIEW";

export type VerificationEvaluationContext<M extends VerificationMethod = "SELFIE"> = {
  method: M;
  pose?: VerificationPose;
  challenge?: VerificationChallenge;
  riskSignals?: VerificationRiskSignals;
  openCVResult?: OpenCVQualityResult;
  allowManualReview?: boolean;
  userProfile?: { id: string; is_verified: boolean; created_at?: string };
};

export type VerificationDecisionResult = {
  decision: VerificationDecision;
  score: number;
  riskScore: number;
  summary: string;
  userFeedback: string[];
  failureReasons: string[];
  checks: Record<string, boolean>;
  analysis: GeminiSelfieAnalysis;
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
    expression_match: raw.expression_match === undefined ? true : asBoolean(raw.expression_match),
    confidence: asNumber(raw.confidence),
    genuine_selfie: raw.genuine_selfie === undefined ? true : asBoolean(raw.genuine_selfie),
    screenshot_indicators: asBoolean(raw.screenshot_indicators),
    screen_photo_indicators: asBoolean(raw.screen_photo_indicators),
    edited_image_indicators: asBoolean(raw.edited_image_indicators),
    synthetic_face_likelihood: asNumber(raw.synthetic_face_likelihood, 0.05),
    ai_artifact_indicators: asBoolean(raw.ai_artifact_indicators),
    deepfake_suspicion: asBoolean(raw.deepfake_suspicion),
    unusual_facial_distortion: asBoolean(raw.unusual_facial_distortion),
    recommendations: asStringArray(raw.recommendations),
  };
}

function isNearThreshold(value: number, threshold: number) {
  return value >= threshold - verificationDecisionThresholds.manual_review_margin;
}

export class VerificationDecisionEngine {
  static evaluate<M extends VerificationMethod = "SELFIE">(
    methodOrAnalysis: M | GeminiSelfieAnalysis,
    analysisOrContext?: (M extends "SELFIE" ? GeminiSelfieAnalysis : Record<string, unknown>) | { pose?: VerificationPose; challenge?: VerificationChallenge; riskSignals?: VerificationRiskSignals; openCVResult?: OpenCVQualityResult; allowManualReview?: boolean; method?: M },
    maybeContext?: VerificationEvaluationContext<M> | { pose?: VerificationPose; challenge?: VerificationChallenge; riskSignals?: VerificationRiskSignals; openCVResult?: OpenCVQualityResult; allowManualReview?: boolean; method?: M },
  ): VerificationDecisionResult {
    let method: VerificationMethod = "SELFIE";
    let selfieAnalysis: GeminiSelfieAnalysis;
    let context: {
      pose?: VerificationPose;
      challenge?: VerificationChallenge;
      riskSignals?: VerificationRiskSignals;
      openCVResult?: OpenCVQualityResult;
      allowManualReview?: boolean;
    } = {};

    if (typeof methodOrAnalysis === "string") {
      method = methodOrAnalysis as VerificationMethod;
      selfieAnalysis = (analysisOrContext || {}) as GeminiSelfieAnalysis;
      context = (maybeContext || {}) as Record<string, unknown>;
    } else {
      selfieAnalysis = methodOrAnalysis as GeminiSelfieAnalysis;
      context = (analysisOrContext || {}) as Record<string, unknown>;
      if (context && "method" in context && typeof (context as Record<string, unknown>).method === "string") {
        method = (context as Record<string, unknown>).method as VerificationMethod;
      }
    }

    if (method !== "SELFIE") {
      if (method === "GOVERNMENT_ID") {
        throw new Error("GOVERNMENT_ID verification is reserved for future implementation.");
      }
      if (method === "VIDEO_LIVENESS") {
        throw new Error("VIDEO_LIVENESS verification is reserved for future implementation.");
      }
      if (method === "HUMAN_REVIEW") {
        throw new Error("HUMAN_REVIEW verification is reserved for future implementation.");
      }
    }

    const pose = context.pose || context.challenge?.pose || {
      id: "fallback",
      title: "Selfie",
      instruction: "",
      gesture: "none",
      headDirection: "straight",
      requiresHandGesture: false,
      assetPath: "",
      photoPath: null,
      gender: "male",
    };

    const t = verificationDecisionThresholds;
    const risk = context.riskSignals || {};
    const opencv = context.openCVResult;

    const riskEval = VerificationRiskEngine.computeRisk(selfieAnalysis, risk);
    let riskScore = riskEval.riskScore;

    if (opencv && !opencv.ok && opencv.rejectEarly) {
      riskScore += 25;
    }

    // Fairness Rules:
    // "Do not fail a user only because lighting is not perfect if the face is still clear."
    // "Do not fail a user only because the image is slightly soft if the face and pose are still readable."
    // "Do not fail a user only because the pose is not exact if the core gesture and identity are still sufficiently close."
    // "Use confidence ranges and combined evidence, not one brittle signal."
    const faceClearlyVisible = selfieAnalysis.face_visible && selfieAnalysis.face_count === 1;
    const coreGestureDetected = !pose.requiresHandGesture || selfieAnalysis.gesture_detected;
    const acceptablePose = selfieAnalysis.pose_match_score >= t.pose_match_score || (faceClearlyVisible && coreGestureDetected && selfieAnalysis.pose_match_score >= 0.65);
    const acceptableLighting = selfieAnalysis.lighting_score >= t.lighting_score || (faceClearlyVisible && selfieAnalysis.lighting_score >= 0.55);
    const acceptableQuality = selfieAnalysis.image_quality_score >= t.image_quality_score || (faceClearlyVisible && selfieAnalysis.image_quality_score >= 0.58);

    const checks: Record<string, boolean> = {
      one_face: selfieAnalysis.face_count === 1 && !risk.hasMultipleFaces,
      face_clearly_visible: faceClearlyVisible,
      eyes_visible: selfieAnalysis.eyes_visible || (faceClearlyVisible && selfieAnalysis.pose_match_score >= 0.85),
      good_lighting: acceptableLighting,
      good_image_quality: acceptableQuality,
      pose_matches_illustration: acceptablePose,
      required_hand_gesture_exists: coreGestureDetected,
      head_direction_matches: selfieAnalysis.head_direction_match || (faceClearlyVisible && acceptablePose),
      expression_matches: selfieAnalysis.expression_match || faceClearlyVisible,
      genuine_selfie: selfieAnalysis.genuine_selfie && !selfieAnalysis.screenshot_indicators && !selfieAnalysis.screen_photo_indicators && !selfieAnalysis.edited_image_indicators,
      confidence_high_enough: selfieAnalysis.confidence >= t.confidence || (faceClearlyVisible && acceptablePose && selfieAnalysis.confidence >= 0.68),
      fresh_capture_timestamp: risk.isFreshTimestamp !== false,
      no_screenshot_or_screen_indicators: !selfieAnalysis.screenshot_indicators && !selfieAnalysis.screen_photo_indicators && !risk.hasScreenshotIndicators && !risk.hasScreenPhotoIndicators,
      no_synthetic_or_deepfake_indicators: !selfieAnalysis.ai_artifact_indicators && !selfieAnalysis.deepfake_suspicion && !selfieAnalysis.unusual_facial_distortion && selfieAnalysis.synthetic_face_likelihood < 0.4 && !risk.hasSyntheticOrDeepfakeIndicators,
      no_duplicate_face_suspicion: !risk.hasDuplicateFaceRisk,
    };

    const feedback: string[] = [];
    const failureReasons: string[] = [...riskEval.hardRiskFailures];

    if (!checks.one_face) {
      feedback.push("Use a selfie with only you in the frame.");
      if (!failureReasons.includes("Multiple or zero faces detected")) failureReasons.push("Multiple or zero faces detected");
    }
    if (!checks.face_clearly_visible) {
      feedback.push("Move your face into clear view without sunglasses, masks, or heavy shadows.");
      if (!failureReasons.includes("Face not clearly visible")) failureReasons.push("Face not clearly visible");
    }
    if (!checks.eyes_visible) {
      feedback.push("Make sure both eyes are visible and open.");
      if (!failureReasons.includes("Eyes not clearly visible")) failureReasons.push("Eyes not clearly visible");
    }
    if (!checks.good_lighting) {
      feedback.push("Your face is a little too dark. Please try again with better light.");
      failureReasons.push(`Low lighting score (${selfieAnalysis.lighting_score})`);
    }
    if (!checks.good_image_quality) {
      feedback.push("The image is a bit blurry or soft. Please retake it in clearer focus.");
      failureReasons.push(`Low image quality score (${selfieAnalysis.image_quality_score})`);
    }
    if (!checks.pose_matches_illustration) {
      feedback.push("Match the shown pose guide more closely before trying again.");
      failureReasons.push(`Low pose match score (${selfieAnalysis.pose_match_score})`);
    }
    if (!checks.required_hand_gesture_exists) {
      feedback.push("We could not clearly see your hand. Please match the guide gesture more closely.");
      failureReasons.push("Required hand gesture not detected");
    }
    if (!checks.head_direction_matches) {
      feedback.push("Please turn your head in the same direction shown in the pose guide.");
      failureReasons.push("Head direction mismatch");
    }
    if (!checks.expression_matches) {
      feedback.push("Please match the requested facial expression cue.");
      failureReasons.push("Facial expression cue mismatch");
    }
    if (!checks.genuine_selfie || !checks.no_screenshot_or_screen_indicators) {
      feedback.push("Upload a fresh live selfie rather than a screenshot, photo of a screen, or edited image.");
      if (!failureReasons.includes("Potential non-live capture, screenshot, or edited image indicator")) failureReasons.push("Potential non-live capture, screenshot, or edited image indicator");
    }
    if (!checks.fresh_capture_timestamp) {
      feedback.push("Your verification challenge timestamp expired. Please request a fresh pose challenge.");
      if (!failureReasons.includes("Expired capture timestamp or challenge window exceeded")) failureReasons.push("Expired capture timestamp or challenge window exceeded");
    }
    if (!checks.confidence_high_enough) {
      feedback.push("We need a clearer selfie to continue.");
      failureReasons.push(`Low AI confidence score (${selfieAnalysis.confidence})`);
    }

    if (!checks.no_synthetic_or_deepfake_indicators) {
      if (!failureReasons.includes("Synthetic face, deepfake, or AI artifact indicator detected")) failureReasons.push("Synthetic face, deepfake, or AI artifact indicator detected");
    }
    if (!checks.no_duplicate_face_suspicion) {
      if (!failureReasons.includes("Duplicate face detected across multiple verified accounts")) failureReasons.push("Duplicate face detected across multiple verified accounts");
    }

    const score = Math.round(
      ((selfieAnalysis.lighting_score + selfieAnalysis.image_quality_score + selfieAnalysis.pose_match_score + selfieAnalysis.confidence) / 4) * 100,
    );

    const allPassed = Object.values(checks).every(Boolean) && riskScore < 50;
    if (allPassed) {
      return {
        decision: "APPROVED",
        score,
        riskScore,
        summary: "Selfie verification approved by Freeborn's backend policy checks.",
        userFeedback: [],
        failureReasons: [],
        checks,
        analysis: selfieAnalysis,
      };
    }

    const hardFailures =
      !checks.one_face ||
      !checks.face_clearly_visible ||
      !checks.genuine_selfie ||
      !checks.no_screenshot_or_screen_indicators ||
      !checks.fresh_capture_timestamp ||
      !checks.no_synthetic_or_deepfake_indicators ||
      riskScore >= 68;

    if (checks.no_duplicate_face_suspicion === false && !hardFailures) {
      return {
        decision: "MANUAL_REVIEW_RESERVED",
        score,
        riskScore,
        summary: "Selfie verification reserved for manual review due to duplicate face detection or ambiguous cross-account match.",
        userFeedback: ["Your verification selfie is currently under review. We will notify you right when the review is complete."],
        failureReasons: failureReasons.length ? failureReasons : ["Reserved for manual review due to duplicate face check"],
        checks,
        analysis: selfieAnalysis,
      };
    }

    const eligibleForFutureManualReview =
      context.allowManualReview &&
      !hardFailures &&
      riskScore < 60 &&
      isNearThreshold(selfieAnalysis.lighting_score, t.lighting_score) &&
      isNearThreshold(selfieAnalysis.image_quality_score, t.image_quality_score) &&
      isNearThreshold(selfieAnalysis.pose_match_score, t.pose_match_score) &&
      isNearThreshold(selfieAnalysis.confidence, t.confidence);

    if (eligibleForFutureManualReview) {
      return {
        decision: "MANUAL_REVIEW_RESERVED",
        score,
        riskScore,
        summary: "This result is close to approval and is reserved for future manual review.",
        userFeedback: ["We need a clearer selfie to continue. Please retry with better front light and match the pose guide directly."],
        failureReasons: failureReasons.length ? failureReasons : ["Marginal thresholds requiring manual review reservation"],
        checks,
        analysis: selfieAnalysis,
      };
    }

    const combinedFeedback = [...new Set([...feedback, ...selfieAnalysis.recommendations, ...(opencv?.feedback || [])])].slice(0, 6);
    return {
      decision: "RETRY_REQUIRED",
      score,
      riskScore,
      summary: "Selfie verification needs another try.",
      userFeedback: combinedFeedback.length ? combinedFeedback : ["Try again with a clear, well-lit selfie that matches the assigned pose challenge."],
      failureReasons: failureReasons.length ? failureReasons : ["Failed verification checks"],
      checks,
      analysis: selfieAnalysis,
    };
  }
}

export class TrustModelEngine {
  static computeTrustScore(inputs: {
    selfieChallengeSuccess: boolean;
    faceVisibility: boolean;
    eyeVisibility: boolean;
    poseMatchScore: number;
    profilePhotoConsistencyPassed?: boolean;
    retryHistoryCount?: number;
    cooldownCount?: number;
    accountAgeDays?: number;
    priorSafetyFlagsCount?: number;
    duplicateDetectionRisk?: boolean;
    syntheticOrDeepfakeRisk?: boolean;
  }): number {
    let score = 50; // baseline

    if (inputs.selfieChallengeSuccess) score += 20;
    if (inputs.faceVisibility) score += 10;
    if (inputs.eyeVisibility) score += 10;
    if (inputs.poseMatchScore >= 0.78) score += 10;
    if (inputs.profilePhotoConsistencyPassed) score += 20;
    if ((inputs.accountAgeDays ?? 0) > 30) score += 10;

    const retries = inputs.retryHistoryCount ?? 0;
    score -= Math.min(25, retries * 5);

    const cooldowns = inputs.cooldownCount ?? 0;
    score -= Math.min(30, cooldowns * 15);

    const safetyFlags = inputs.priorSafetyFlagsCount ?? 0;
    score -= Math.min(40, safetyFlags * 20);

    if (inputs.duplicateDetectionRisk) score -= 65;
    if (inputs.syntheticOrDeepfakeRisk) score -= 75;

    return Math.max(0, Math.min(100, Math.round(score)));
  }
}
