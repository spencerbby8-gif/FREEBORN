import type { GeminiSelfieAnalysis, VerificationRiskSignals } from "./decision-engine";

export class VerificationRiskEngine {
  static computeRisk(analysis: GeminiSelfieAnalysis, signals: VerificationRiskSignals): {
    riskScore: number;
    hardRiskFailures: string[];
    riskWarnings: string[];
  } {
    const hardRiskFailures: string[] = [];
    const riskWarnings: string[] = [];
    let riskScore = 0;

    if (analysis.face_count !== 1 || signals.hasMultipleFaces) {
      hardRiskFailures.push("Multiple or zero faces detected");
      riskScore += 40;
    }
    if (!analysis.face_visible) {
      hardRiskFailures.push("Face not clearly visible");
      riskScore += 30;
    }
    if (!analysis.eyes_visible) {
      riskWarnings.push("Eyes not clearly visible");
      riskScore += 25;
    }
    if (!analysis.genuine_selfie) {
      hardRiskFailures.push("Potential non-live capture or synthetic image");
      riskScore += 45;
    }
    if (analysis.screenshot_indicators || analysis.screen_photo_indicators || signals.hasScreenshotIndicators || signals.hasScreenPhotoIndicators) {
      hardRiskFailures.push("Screenshot or screen photo indicator detected");
      riskScore += 50;
    }
    if (signals.isFreshTimestamp === false) {
      hardRiskFailures.push("Expired capture timestamp or challenge window exceeded");
      riskScore += 35;
    }
    if (signals.hasDuplicateFaceRisk) {
      hardRiskFailures.push("Duplicate face detected across multiple verified accounts");
      riskScore += 80;
    }
    if (signals.hasSyntheticOrDeepfakeIndicators || analysis.synthetic_face_likelihood >= 0.4 || analysis.deepfake_suspicion || analysis.ai_artifact_indicators) {
      hardRiskFailures.push("Synthetic face, deepfake, or AI artifact indicator detected");
      riskScore += 75;
    }

    const retries = signals.retryHistoryCount ?? 0;
    const recent = signals.recentAttemptCount ?? 0;
    riskScore += Math.min(30, retries * 5);
    riskScore += Math.min(40, recent * 10);

    riskScore = Math.max(0, Math.min(100, Math.round(riskScore)));

    return {
      riskScore,
      hardRiskFailures,
      riskWarnings,
    };
  }
}
