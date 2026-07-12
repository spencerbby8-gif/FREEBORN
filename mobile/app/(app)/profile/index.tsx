import { useCallback, useEffect, useMemo, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { colors, type ProfilePhoto, type UserProfileRow } from "@freeborn/shared";
import { ScreenShell } from "@/components/ui/screen-shell";
import { SurfaceCard } from "@/components/ui/surface-card";
import { NavCard } from "@/components/ui/nav-card";
import { ProfileSkeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { publicPhotoUrl, initials, ageFromBirthDate, humanize, profileStrength } from "@/hooks/use-profile-data";

function StatusPill({ label, tone = "muted" }: { label: string; tone?: "success" | "gold" | "muted" }) {
  return (
    <View style={[styles.statusPill, tone === "success" && styles.statusSuccess, tone === "gold" && styles.statusGold]}>
      <View style={[styles.statusDot, tone === "success" && styles.statusDotSuccess, tone === "gold" && styles.statusDotGold]} />
      <Text style={[styles.statusText, tone === "success" && styles.statusTextSuccess, tone === "gold" && styles.statusTextGold]}>{label}</Text>
    </View>
  );
}

export default function ProfileHub() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfileRow | null>(null);
  const [photos, setPhotos] = useState<ProfilePhoto[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase.from("user_profiles").select("*").eq("id", user.id).maybeSingle<UserProfileRow>();
    const { data: ph } = await supabase.from("profile_photos").select("*").eq("user_id", user.id).order("position");
    setProfile(data ?? null);
    setPhotos((ph as ProfilePhoto[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const primaryPhotoUrl = useMemo(() => {
    const primary = photos.find(p => p.is_primary) ?? photos[0];
    return publicPhotoUrl(primary?.storage_path);
  }, [photos]);

  const strength = profileStrength(profile);
  const age = ageFromBirthDate(profile?.birth_date);
  const location = [profile?.city, profile?.region].filter(Boolean).join(", ");

  if (loading) {
    return (
      <ScreenShell>
        <ProfileSkeleton />
      </ScreenShell>
    );
  }

  if (!profile) {
    return (
      <ScreenShell>
        <SurfaceCard>
          <Text style={styles.emptyTitle}>Profile unavailable</Text>
          <Text style={styles.emptyBody}>We could not load your profile.</Text>
          <Pressable onPress={load} style={styles.retryBtn}>
            <Text style={styles.retryBtnText}>Try again</Text>
          </Pressable>
        </SurfaceCard>
      </ScreenShell>
    );
  }

  const needsImprovement = strength < 70;
  const editLabel = needsImprovement ? "Improve profile" : "Edit profile";

  return (
    <ScreenShell>
      {/* Hero section */}
      <View style={styles.hero}>
        <View style={styles.heroPhotoContainer}>
          {primaryPhotoUrl ? (
            <Image source={{ uri: primaryPhotoUrl }} style={styles.heroPhoto} resizeMode="cover" />
          ) : (
            <View style={styles.heroInitialsBox}>
              <Text style={styles.heroInitials}>{initials(profile.display_name)}</Text>
            </View>
          )}
          <LinearGradient colors={["transparent", "rgba(9,16,28,0.92)"]} style={styles.heroFade} />
          <View style={styles.heroOverlay}>
            <Text style={styles.heroName}>{profile.display_name ?? "Your profile"}{age ? <Text style={styles.heroAge}> {age}</Text> : null}</Text>
            <Text style={styles.heroLocation}>{location || "Location not set"}{profile.occupation ? ` · ${profile.occupation}` : ""}</Text>
            <View style={styles.heroStatusRow}>
              <StatusPill label={profile.discoverable ? "Visible" : "Hidden"} tone={profile.discoverable ? "success" : "muted"} />
              <StatusPill label={profile.is_verified ? "Verified" : "Not verified yet"} tone={profile.is_verified ? "success" : "gold"} />
            </View>
          </View>
        </View>

        {/* Completion bar */}
        <View style={styles.completionRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.completionLabel}>Profile strength</Text>
            <Text style={styles.completionHint}>{needsImprovement ? "Fuller profiles give people a better reason to start specific." : "Your profile looks strong."}</Text>
          </View>
          <Text style={styles.completionValue}>{strength}%</Text>
        </View>
        <View style={styles.progressTrack}>
          <LinearGradient
            colors={[colors.ember500, colors.gold300]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: `${strength}%` }]}
          />
        </View>
      </View>

      {/* Primary actions */}
      <View style={styles.primaryActions}>
        <Pressable style={({ pressed }) => [styles.primaryBtn, pressed && styles.primaryBtnPressed]} onPress={() => router.push("/(app)/profile/edit")} accessibilityRole="button" accessibilityLabel={editLabel}>
          <Text style={styles.primaryBtnIcon}>✎</Text>
          <Text style={styles.primaryBtnLabel}>{editLabel}</Text>
        </Pressable>
        <Pressable style={({ pressed }) => [styles.primaryBtn, pressed && styles.primaryBtnPressed]} onPress={() => router.push("/(app)/profile/preview")} accessibilityRole="button" accessibilityLabel="Preview profile">
          <Text style={styles.primaryBtnIcon}>◉</Text>
          <Text style={styles.primaryBtnLabel}>Preview</Text>
        </Pressable>
        <Pressable style={({ pressed }) => [styles.primaryBtn, pressed && styles.primaryBtnPressed]} onPress={() => router.push("/(app)/profile/photos")} accessibilityRole="button" accessibilityLabel="Manage photos">
          <Text style={styles.primaryBtnIcon}>▣</Text>
          <Text style={styles.primaryBtnLabel}>Photos</Text>
        </Pressable>
      </View>

      {/* Navigation cards */}
      <SurfaceCard gap={6} noPadding style={styles.navCards}>
        <View style={styles.navPadding}>
          <Text style={styles.navSectionEyebrow}>Your profile</Text>
        </View>
        <NavCard icon="✎" title="About Me" subtitle="Name, bio, location, occupation" accent="gold" onPress={() => router.push("/(app)/profile/about")} />
        <NavCard icon="◈" title="Intent" subtitle={humanize(profile.relationship_goals?.[0]) || "Not set"} count={profile.relationship_goals?.length ?? 0} accent="ember" onPress={() => router.push("/(app)/profile/intent")} />
        <NavCard icon="✦" title="Values" subtitle="What you stand for" count={profile.values?.length ?? 0} accent="gold" onPress={() => router.push("/(app)/profile/values")} />
        <NavCard icon="◐" title="Lifestyle" subtitle="Daily rhythms and choices" count={profile.lifestyle_preferences?.length ?? 0} accent="teal" onPress={() => router.push("/(app)/profile/lifestyle")} />
        <NavCard icon="☆" title="Interests" subtitle="What lights you up" count={profile.interests?.length ?? 0} accent="violet" onPress={() => router.push("/(app)/profile/interests")} />
        <NavCard icon="❝" title="Prompts" subtitle="Show your voice" count={profile.prompt_answers?.length ?? 0} accent="teal" onPress={() => router.push("/(app)/profile/prompts")} />
        <NavCard icon="⊘" title="Dealbreakers" subtitle="Your non-negotiables" count={profile.deal_breakers?.length ?? 0} accent="ember" onPress={() => router.push("/(app)/profile/dealbreakers")} />
      </SurfaceCard>

      {/* Settings & account */}
      <SurfaceCard gap={6} noPadding style={styles.navCards}>
        <View style={styles.navPadding}>
          <Text style={styles.navSectionEyebrow}>Settings</Text>
        </View>
        <NavCard icon="◉" title="Privacy & Visibility" subtitle={profile.discoverable ? "Visible in discovery" : "Hidden from discovery"} accent="teal" onPress={() => router.push("/(app)/profile/privacy")} />
        <NavCard icon="☤" title="Account Status" subtitle={humanize(profile.profile_status)} accent="gold" onPress={() => router.push("/(app)/profile/account")} />
        <NavCard icon="⚙" title="Settings" subtitle="Discovery, notifications, app preferences" accent="violet" onPress={() => router.push("/(app)/settings")} />
      </SurfaceCard>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  hero: { gap: 12 },
  heroPhotoContainer: { height: 200, borderRadius: 28, overflow: "hidden", backgroundColor: "rgba(255,255,255,0.04)", position: "relative" },
  heroPhoto: { width: "100%", height: "100%" },
  heroInitialsBox: { width: "100%", height: "100%", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.04)" },
  heroInitials: { color: colors.pearl, fontSize: 48, fontWeight: "900", letterSpacing: -2 },
  heroFade: { position: "absolute", left: 0, right: 0, bottom: 0, height: 130 },
  heroOverlay: { position: "absolute", left: 18, right: 18, bottom: 16, gap: 6 },
  heroName: { color: "white", fontSize: 26, fontWeight: "900", letterSpacing: -1.2, lineHeight: 28, textShadowColor: "rgba(0,0,0,0.5)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
  heroAge: { color: "rgba(255,255,255,0.78)", fontSize: 20, fontWeight: "700" },
  heroLocation: { color: "rgba(255,255,255,0.70)", fontSize: 13, fontWeight: "700" },
  heroStatusRow: { flexDirection: "row", gap: 6, marginTop: 4 },
  statusPill: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 999, borderWidth: 1, borderColor: "rgba(255,255,255,0.10)", backgroundColor: "rgba(0,0,0,0.25)", paddingHorizontal: 9, paddingVertical: 5 },
  statusSuccess: { borderColor: "rgba(109,211,176,0.28)", backgroundColor: "rgba(109,211,176,0.10)" },
  statusGold: { borderColor: "rgba(246,215,154,0.24)", backgroundColor: "rgba(217,167,82,0.10)" },
  statusDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.mist },
  statusDotSuccess: { backgroundColor: colors.success },
  statusDotGold: { backgroundColor: colors.gold300 },
  statusText: { color: colors.mist, fontSize: 9, fontWeight: "900", textTransform: "uppercase", letterSpacing: 1 },
  statusTextSuccess: { color: colors.success },
  statusTextGold: { color: colors.gold300 },
  completionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", gap: 16 },
  completionLabel: { color: colors.pearl, fontWeight: "800", fontSize: 14 },
  completionHint: { color: colors.mist, marginTop: 3, fontSize: 12, lineHeight: 18, maxWidth: 230 },
  completionValue: { color: colors.pearl, fontSize: 32, fontWeight: "900", letterSpacing: -1.6 },
  progressTrack: { height: 6, backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 999, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 999 },
  primaryActions: { flexDirection: "row", gap: 10 },
  primaryBtn: { flex: 1, borderRadius: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.10)", backgroundColor: "rgba(255,255,255,0.04)", paddingVertical: 14, alignItems: "center", gap: 6, minHeight: 54 },
  primaryBtnPressed: { opacity: 0.85, backgroundColor: "rgba(255,255,255,0.08)" },
  primaryBtnIcon: { color: colors.gold300, fontSize: 18, fontWeight: "700" },
  primaryBtnLabel: { color: colors.pearl, fontSize: 12, fontWeight: "900", letterSpacing: 0.2 },
  navCards: { padding: 0 },
  navPadding: { paddingHorizontal: 18, paddingTop: 16, paddingBottom: 4 },
  navSectionEyebrow: { color: colors.sand, fontSize: 10, fontWeight: "900", textTransform: "uppercase", letterSpacing: 2.4 },
  emptyTitle: { color: colors.pearl, fontSize: 20, fontWeight: "900", textAlign: "center" },
  emptyBody: { color: colors.mist, fontSize: 14, lineHeight: 22, marginTop: 8, textAlign: "center" },
  retryBtn: { marginTop: 16, borderRadius: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.10)", backgroundColor: "rgba(255,255,255,0.05)", paddingVertical: 14, paddingHorizontal: 32, alignItems: "center" },
  retryBtnText: { color: colors.pearl, fontSize: 14, fontWeight: "900" },
});
