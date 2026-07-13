import { createSupabaseServerClient } from "@/lib/supabase/server";
import { TrustModelEngine } from "./decision-engine";

export class TrustHistoryService {
  static async checkRateLimit(userId: string): Promise<{
    allowed: boolean;
    totalFailed: number;
    recentCount: number;
    inCooldown: boolean;
    cooldownUntil: string | null;
    error?: string;
  }> {
    const supabase = await createSupabaseServerClient();
    const { data: limitRow } = await supabase
      .from("verification_rate_limits")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle<{ failed_attempts_window: number; total_failed_attempts: number; cooldown_until: string | null }>();

    const now = new Date();
    if (limitRow?.cooldown_until && new Date(limitRow.cooldown_until) > now) {
      return {
        allowed: false,
        totalFailed: limitRow.total_failed_attempts ?? 0,
        recentCount: limitRow.failed_attempts_window ?? 0,
        inCooldown: true,
        cooldownUntil: limitRow.cooldown_until,
        error: `You have reached the temporary verification attempt limit. To keep accounts secure against automated attempts, please wait until ${new Date(limitRow.cooldown_until).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} before trying again.`,
      };
    }

    const { count } = await supabase
      .from("verification_selfie_checks")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "failed")
      .gte("created_at", new Date(now.getTime() - 60 * 60 * 1000).toISOString());

    const recentCount = Math.max(limitRow?.failed_attempts_window ?? 0, count ?? 0);
    if (recentCount >= 5) {
      const cooldownUntil = new Date(now.getTime() + 30 * 60 * 1000).toISOString();
      await supabase.from("verification_rate_limits").upsert({
        user_id: userId,
        failed_attempts_window: recentCount,
        total_failed_attempts: Math.max(limitRow?.total_failed_attempts ?? 0, recentCount),
        cooldown_until: cooldownUntil,
        last_attempt_at: now.toISOString(),
        updated_at: now.toISOString(),
      });
      return {
        allowed: false,
        totalFailed: Math.max(limitRow?.total_failed_attempts ?? 0, recentCount),
        recentCount,
        inCooldown: true,
        cooldownUntil,
        error: `You have reached the temporary verification attempt limit. To keep accounts secure against automated attempts, please wait 30 minutes before trying again.`,
      };
    }

    return {
      allowed: true,
      totalFailed: limitRow?.total_failed_attempts ?? recentCount,
      recentCount,
      inCooldown: false,
      cooldownUntil: null,
    };
  }

  static async recordAttempt(userId: string, approved: boolean, recentCount: number, totalFailed: number): Promise<void> {
    const supabase = await createSupabaseServerClient();
    if (!approved) {
      const newWindow = recentCount + 1;
      const newTotal = totalFailed + 1;
      const cooldownUntil = newWindow >= 5 ? new Date(Date.now() + 30 * 60 * 1000).toISOString() : null;
      await supabase.from("verification_rate_limits").upsert({
        user_id: userId,
        failed_attempts_window: newWindow,
        total_failed_attempts: newTotal,
        cooldown_until: cooldownUntil,
        last_attempt_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const { data: th } = await supabase.from("user_trust_history").select("verification_failures, verification_attempts").eq("user_id", userId).maybeSingle<{ verification_failures: number; verification_attempts: number }>();
      await supabase.from("user_trust_history").upsert({
        user_id: userId,
        verification_failures: (th?.verification_failures ?? 0) + 1,
        verification_attempts: (th?.verification_attempts ?? 0) + 1,
        cooldown_state: newWindow >= 5,
        cooldown_until: cooldownUntil,
        updated_at: new Date().toISOString(),
      });
    } else {
      await supabase.from("verification_rate_limits").upsert({
        user_id: userId,
        failed_attempts_window: 0,
        total_failed_attempts: totalFailed,
        cooldown_until: null,
        last_attempt_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const { data: th } = await supabase.from("user_trust_history").select("verification_successes, verification_attempts").eq("user_id", userId).maybeSingle<{ verification_successes: number; verification_attempts: number }>();
      await supabase.from("user_trust_history").upsert({
        user_id: userId,
        verification_successes: (th?.verification_successes ?? 0) + 1,
        verification_attempts: (th?.verification_attempts ?? 0) + 1,
        cooldown_state: false,
        cooldown_until: null,
        last_verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
  }

  static async updateTrustScore(userId: string, inputs: Parameters<typeof TrustModelEngine.computeTrustScore>[0]): Promise<number> {
    const supabase = await createSupabaseServerClient();
    const score = TrustModelEngine.computeTrustScore(inputs);
    await supabase.from("user_trust_history").upsert({
      user_id: userId,
      trust_score: score,
      updated_at: new Date().toISOString(),
    });
    return score;
  }
}
