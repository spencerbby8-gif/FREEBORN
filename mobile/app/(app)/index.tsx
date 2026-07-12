import { useCallback, useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { colors, type DiscoveryCandidate, type ProfilePhoto, type UserProfileRow } from "@freeborn/shared";
import { ScreenShell } from "@/components/ui/screen-shell";
import { SurfaceCard } from "@/components/ui/surface-card";
import { EmptyState } from "@/components/ui/empty-state";
import { DiscoverSkeleton } from "@/components/ui/skeleton";
import { Wordmark } from "@/components/wordmark";
import { SwipeCard } from "@/components/discover/swipe-card";
import { useAuth } from "@/hooks/use-auth";
import { useHaptics } from "@/hooks/use-haptics";
import { supabase } from "@/lib/supabase";
import { emberShadow } from "@/components/magic-background";

function publicPhotoUrl(path?: string | null) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const base = process.env.EXPO_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  return `${base}/storage/v1/object/public/profile-photos/${path.split("/").map(encodeURIComponent).join("/")}`;
}

export default function DiscoverScreen() {
  const { user } = useAuth();
  const haptics = useHaptics();
  const [profile, setProfile] = useState<UserProfileRow | null>(null);
  const [candidates, setCandidates] = useState<DiscoveryCandidate[]>([]);
  const [photos, setPhotos] = useState<Record<string, ProfilePhoto[]>>({});
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [acting, setActing] = useState(false);
  const [matchedName, setMatchedName] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data: p } = await supabase.from("user_profiles").select("*").eq("id", user.id).maybeSingle<UserProfileRow>();
    setProfile(p ?? null);
    if (p?.onboarding_stage === "account_created") { router.replace("/(app)/onboarding"); return; }
    const { data } = await supabase.rpc("discover_candidates", { p_user: user.id, p_limit: 24, p_offset: 0 });
    const cands = (data as DiscoveryCandidate[]) ?? [];
    setCandidates(cands);
    setIndex(0);
    const ids = cands.map(c => c.id);
    if (ids.length) {
      const { data: ph } = await supabase.from("profile_photos").select("*").in("user_id", ids).order("position");
      const map: Record<string, ProfilePhoto[]> = {};
      (ph as ProfilePhoto[] ?? []).forEach(pp => { (map[pp.user_id] ||= []).push(pp); });
      setPhotos(map);
    } else { setPhotos({}); }
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const swipe = useCallback(async (action: "like" | "pass" | "superlike") => {
    const current = candidates[index];
    if (!current || !user || acting) return;
    setActing(true);

    // Haptic feedback based on action
    if (action === "like") haptics.success();
    else if (action === "superlike") haptics.warning();
    else haptics.light();

    const { error } = await supabase.from("user_swipes").upsert({
      liker_id: user.id, liked_id: current.id, action,
    }, { onConflict: "liker_id,liked_id" });
    if (!error && (action === "like" || action === "superlike")) {
      const { data: m } = await supabase.from("user_matches").select("id")
        .or(`and(user_a.eq.${user.id},user_b.eq.${current.id}),and(user_a.eq.${current.id},user_b.eq.${user.id})`)
        .maybeSingle();
      if (m) {
        haptics.success();
        setMatchedName(current.display_name ?? "Someone thoughtful");
        setTimeout(() => setMatchedName(null), 2800);
      }
    }
    setIndex(i => i + 1);
    setActing(false);
  }, [candidates, index, user, acting, haptics]);

  const handleBlockReport = useCallback((candidateId: string) => {
    if (!user) return;
    Alert.alert(
      "Safety actions",
      "What would you like to do?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Block",
          style: "destructive",
          onPress: async () => {
            await supabase.from("blocked_users").insert({
              blocker_id: user.id,
              blocked_id: candidateId,
              reason: "Blocked from discovery",
            });
            haptics.medium();
            setIndex(i => i + 1);
          },
        },
        {
          text: "Report",
          style: "destructive",
          onPress: async () => {
            Alert.alert(
              "Report a concern",
              "If you experience harassment, abuse, or a safety issue, please contact our support team directly at support@freeborn.app.",
              [{ text: "OK" }],
            );
          },
        },
      ],
    );
  }, [user, haptics]);

  const current = candidates[index];
  const currentPhoto = current
    ? (photos[current.id] ?? []).find((photo) => photo.is_primary) ?? (photos[current.id] ?? [])[0]
    : null;
  const currentPhotoUrl = current ? publicPhotoUrl(currentPhoto?.storage_path) : null;

  const firstName = profile?.display_name?.split(" ")[0];

  return (
    <ScreenShell
      onRefresh={handleRefresh}
      refreshing={refreshing}
    >
      {/* Header */}
      <View style={styles.header}>
        <Wordmark />
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>Values first</Text>
        </View>
      </View>

      <View style={styles.eyebrowRow}>
        <Text style={styles.eyebrow}>Discover</Text>
      </View>
      <Text style={styles.title}>Meet one person at a time.</Text>
      <Text style={styles.subtitle}>
        {firstName ? `Welcome back, ${firstName}. ` : "Your values-aligned feed is live. "}
        Swipe right to like, left to pass, up to spark.
      </Text>

      {loading ? (
        <DiscoverSkeleton />
      ) : !current ? (
        <SurfaceCard style={styles.emptyCard}>
          <EmptyState
            icon="✨"
            title={candidates.length === 0 ? "Finding thoughtful people" : "All caught up"}
            body={
              candidates.length === 0
                ? "We're finding values-aligned people near you. New profiles join every day."
                : "You've seen everyone for now. Check back soon."
            }
            action={{ label: "Refresh discovery", onPress: handleRefresh }}
            secondaryAction={{ label: "Tune preferences", onPress: () => router.push("/(app)/settings/discovery") }}
            safetyCue="Your preferences and privacy are still active"
          />
        </SurfaceCard>
      ) : (
        <>
          <SwipeCard
            candidate={current}
            photoUrl={currentPhotoUrl}
            matchedName={matchedName}
            onSwipe={swipe}
            onBlockReport={handleBlockReport}
          />

          {/* Action buttons */}
          <View style={styles.actions}>
            <Pressable
              disabled={acting}
              onPress={() => swipe("pass")}
              style={({ pressed }) => [styles.actionBtn, styles.passBtn, pressed && styles.actionPressed]}
              accessibilityRole="button"
              accessibilityLabel="Pass on this profile"
            >
              <Text style={styles.passIcon}>✕</Text>
              <Text style={styles.actionLabel}>Pass</Text>
            </Pressable>
            <Pressable
              disabled={acting}
              onPress={() => swipe("superlike")}
              style={({ pressed }) => [styles.actionBtn, styles.superBtn, pressed && styles.actionPressed]}
              accessibilityRole="button"
              accessibilityLabel="Spark this profile"
            >
              <Text style={styles.superIcon}>★</Text>
              <Text style={[styles.actionLabel, { color: colors.violet300 }]}>Spark</Text>
            </Pressable>
            <Pressable
              disabled={acting}
              onPress={() => swipe("like")}
              style={({ pressed }) => [styles.actionBtn, styles.likeBtn, pressed && styles.actionPressed]}
              accessibilityRole="button"
              accessibilityLabel="Like this profile"
            >
              <Text style={styles.likeIcon}>♥</Text>
              <Text style={[styles.actionLabel, { color: colors.ink }]}>{acting ? "…" : "Like"}</Text>
            </Pressable>
          </View>

          {/* Safety & remaining */}
          <View style={styles.bottomRow}>
            <Pressable
              onPress={() => handleBlockReport(current.id)}
              style={styles.safetyBtn}
              accessibilityRole="button"
              accessibilityLabel="Block or report this profile"
            >
              <Text style={styles.safetyBtnText}>⚑ Safety</Text>
            </Pressable>
            <Text style={styles.remaining}>{Math.max(candidates.length - index - 1, 0)} remaining</Text>
          </View>
        </>
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerBadge: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  headerBadgeText: {
    color: colors.sand,
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 1.8,
  },
  eyebrowRow: { marginTop: 4 },
  eyebrow: {
    color: colors.sand,
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 2.4,
  },
  title: {
    color: colors.pearl,
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: -1.6,
    lineHeight: 32,
  },
  subtitle: {
    color: colors.mist,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 2,
  },
  emptyCard: { padding: 0 },
  actions: { flexDirection: "row", gap: 10, marginTop: 6 },
  actionBtn: {
    flex: 1,
    borderRadius: 22,
    paddingVertical: 16,
    alignItems: "center",
    gap: 4,
  },
  actionPressed: { opacity: 0.85, transform: [{ scale: 0.97 }] },
  passBtn: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  passIcon: { color: colors.mist, fontSize: 18, fontWeight: "700" },
  superBtn: {
    backgroundColor: "rgba(138,110,242,0.10)",
    borderWidth: 1,
    borderColor: "rgba(138,110,242,0.24)",
  },
  superIcon: { color: colors.violet300, fontSize: 18, fontWeight: "700" },
  likeBtn: {
    backgroundColor: colors.pearl,
    ...emberShadow,
  },
  likeIcon: { color: colors.ink, fontSize: 18, fontWeight: "700" },
  actionLabel: { color: colors.mist, fontSize: 10, fontWeight: "800", letterSpacing: 0.4 },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  safetyBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  safetyBtnText: {
    color: colors.ash,
    fontSize: 11,
    fontWeight: "700",
  },
  remaining: {
    color: colors.ash,
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 1.6,
  },
});
