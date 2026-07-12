import { useCallback } from "react";
import * as Haptics from "expo-haptics";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { type UserProfileRow } from "@freeborn/shared";

/**
 * Provides haptic feedback methods that respect the user's preference.
 * The preference is cached in memory after first load to avoid DB reads on every tap.
 */
let _hapticEnabled: boolean | null = null;

async function isHapticEnabled(userId: string): Promise<boolean> {
  if (_hapticEnabled != null) return _hapticEnabled;
  const { data } = await supabase
    .from("user_profiles")
    .select("haptic_feedback")
    .eq("id", userId)
    .maybeSingle<UserProfileRow>();
  _hapticEnabled = data?.haptic_feedback ?? true;
  return _hapticEnabled;
}

export function setHapticCached(value: boolean) {
  _hapticEnabled = value;
}

export function useHaptics() {
  const { user } = useAuth();

  const fire = useCallback(
    async (type: "light" | "medium" | "heavy" | "success" | "warning" | "error") => {
      if (!user) return;
      const enabled = await isHapticEnabled(user.id);
      if (!enabled) return;
      switch (type) {
        case "light":
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case "medium":
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case "heavy":
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        case "success":
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case "warning":
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
        case "error":
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
      }
    },
    [user],
  );

  return {
    light: useCallback(() => fire("light"), [fire]),
    medium: useCallback(() => fire("medium"), [fire]),
    heavy: useCallback(() => fire("heavy"), [fire]),
    success: useCallback(() => fire("success"), [fire]),
    warning: useCallback(() => fire("warning"), [fire]),
    error: useCallback(() => fire("error"), [fire]),
  };
}
