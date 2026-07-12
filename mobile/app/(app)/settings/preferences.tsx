import { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, type UserProfileRow } from "@freeborn/shared";
import { DetailScreenShell } from "@/components/ui/detail-screen-shell";
import { SurfaceCard } from "@/components/ui/surface-card";
import { SectionHeader } from "@/components/ui/section-header";
import { SaveActionBar } from "@/components/ui/save-action-bar";
import { ToggleRow } from "@/components/ui/toggle-row";
import { SettingsSkeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useHaptics } from "@/hooks/use-haptics";
import { setHapticCached } from "@/hooks/use-haptics";
import { supabase } from "@/lib/supabase";

export default function PreferencesScreen() {
  const { user } = useAuth();
  const haptics = useHaptics();
  const [hapticFeedback, setHapticFeedback] = useState(true);
  const [cardAnimations, setCardAnimations] = useState(true);
  const [notificationSounds, setNotificationSounds] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<{ tone: "success" | "error"; message: string } | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from("user_profiles").select("*").eq("id", user.id).maybeSingle<UserProfileRow>();
    if (data) {
      setHapticFeedback(data.haptic_feedback ?? true);
      setCardAnimations(data.card_animations ?? true);
      setNotificationSounds(data.notification_sounds ?? true);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!user) return;
    setNotice(null);
    setSaving(true);
    const { error } = await supabase.from("user_profiles").update({
      haptic_feedback: hapticFeedback,
      card_animations: cardAnimations,
      notification_sounds: notificationSounds,
      updated_at: new Date().toISOString(),
    }).eq("id", user.id);
    if (error) {
      setNotice({ tone: "error", message: "Could not save preferences. Please try again." });
    } else {
      setHapticCached(hapticFeedback);
      haptics.success();
      setNotice({ tone: "success", message: "App preferences saved." });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <DetailScreenShell title="App Preferences" subtitle="Customize your experience">
        <SettingsSkeleton />
        <SettingsSkeleton />
        <SettingsSkeleton />
      </DetailScreenShell>
    );
  }

  return (
    <DetailScreenShell title="App Preferences" subtitle="Customize your experience">
      <SurfaceCard>
        <SectionHeader eyebrow="Appearance" title="Display" body="Freeborn is designed for dark surfaces. The visual language is intentionally cinematic." />
        <ToggleRow title="Dark mode" body="Always on. Freeborn is designed for dark surfaces." value={true} onValueChange={() => {}} disabled />
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeader eyebrow="Interactions" title="Feedback & motion" body="Control how the app responds to your touch and movement." />
        <ToggleRow title="Haptic feedback" body="Subtle vibrations on taps, swipes, and confirmations." value={hapticFeedback} onValueChange={setHapticFeedback} />
        <ToggleRow title="Card animations" body="Smooth transitions when browsing discovery cards." value={cardAnimations} onValueChange={setCardAnimations} />
        <ToggleRow title="Notification sounds" body="Play a sound when you receive notifications." value={notificationSounds} onValueChange={setNotificationSounds} />
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeader eyebrow="Language" title="Language settings" body="Freeborn is currently available in English. More languages will be supported as the community grows." />
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle}>Language</Text>
            <Text style={styles.rowBody}>English (US)</Text>
          </View>
          <View style={styles.langBadge}>
            <Text style={styles.langBadgeText}>EN</Text>
          </View>
        </View>
      </SurfaceCard>

      <SaveActionBar onSave={save} saving={saving} notice={notice} label="Save preferences" />
    </DetailScreenShell>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 14, borderRadius: 22, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", backgroundColor: "rgba(255,255,255,0.025)", padding: 16, marginTop: 12, minHeight: 56 },
  rowTitle: { color: colors.pearl, fontSize: 14, fontWeight: "900" },
  rowBody: { color: colors.mist, fontSize: 12, lineHeight: 18, marginTop: 3 },
  langBadge: { borderRadius: 999, backgroundColor: "rgba(255,255,255,0.08)", paddingHorizontal: 12, paddingVertical: 6 },
  langBadgeText: { color: colors.sand, fontSize: 11, fontWeight: "900", letterSpacing: 1 },
});
