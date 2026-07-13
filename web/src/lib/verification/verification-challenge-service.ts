import { createSupabaseServerClient } from "@/lib/supabase/server";
import { generateVerificationChallenge, getVerificationPose, posesForGender, verificationGenderFromProfileGender, type VerificationChallenge, type VerificationPose } from "./poses";

export class VerificationChallengeService {
  static async assignChallenge(userId: string, poseId?: string): Promise<{ ok: boolean; challenge?: VerificationChallenge; error?: string }> {
    const supabase = await createSupabaseServerClient();
    const { data: profile } = await supabase.from("user_profiles").select("gender").eq("id", userId).maybeSingle<{ gender: string }>();

    let pose: VerificationPose | null = poseId ? getVerificationPose(poseId) : null;
    if (!pose) {
      const gender = verificationGenderFromProfileGender(profile?.gender);
      const poses = posesForGender(gender);
      pose = poses[Math.floor(Math.random() * poses.length)] ?? getVerificationPose("female-01-open-palm");
    }

    if (!pose) return { ok: false, error: "Pose challenge not available." };

    const challenge = generateVerificationChallenge(pose);
    await supabase.from("verification_challenges").insert({
      user_id: userId,
      pose_id: pose.id,
      gesture: challenge.gesture,
      head_direction: challenge.headDirection,
      expression_cue: challenge.expressionCue,
      challenge_token: challenge.challengeToken,
      challenge_payload: challenge,
      status: "active",
      expires_at: challenge.expiresAt,
    });

    return { ok: true, challenge };
  }

  static async verifyToken(userId: string, challengeToken: string): Promise<{ ok: boolean; challenge?: VerificationChallenge; error?: string }> {
    const supabase = await createSupabaseServerClient();
    const { data: chalRow } = await supabase
      .from("verification_challenges")
      .select("*")
      .eq("challenge_token", challengeToken)
      .eq("user_id", userId)
      .maybeSingle<{
        id: string;
        pose_id: string;
        gesture: string;
        head_direction: string;
        expression_cue: string;
        challenge_payload: VerificationChallenge;
        status: string;
        expires_at: string;
      }>();

    if (!chalRow || chalRow.status !== "active" || new Date(chalRow.expires_at) < new Date()) {
      if (chalRow && chalRow.status === "active") {
        await supabase.from("verification_challenges").update({ status: "expired" }).eq("challenge_token", challengeToken);
      }
      return {
        ok: false,
        error: "Your verification challenge expired or is no longer active. Please request a fresh challenge and try again.",
      };
    }

    await supabase.from("verification_challenges").update({ status: "consumed" }).eq("challenge_token", challengeToken);
    return { ok: true, challenge: chalRow.challenge_payload };
  }
}
