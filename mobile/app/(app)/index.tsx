import { useCallback, useEffect, useState } from "react";
import { Animated, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { colors, radii, type DiscoveryCandidate, type ProfilePhoto, type UserProfileRow } from "@freeborn/shared";
import { ScreenShell } from "@/components/ui/screen-shell";
import { SurfaceCard } from "@/components/ui/surface-card";
import { EmptyState } from "@/components/ui/empty-state";
import { DiscoverSkeleton } from "@/components/ui/skeleton";
import { Wordmark } from "@/components/wordmark";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { emberShadow, premiumShadow } from "@/components/magic-background";

function publicPhotoUrl(path?: string | null) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const base = process.env.EXPO_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  return `${base}/storage/v1/object/public/profile-photos/${path.split("/").map(encodeURIComponent).join("/")}`;
}

export default function DiscoverScreen() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfileRow | null>(null);
  const [candidates, setCandidates] = useState<DiscoveryCandidate[]>([]);
  const [photos, setPhotos] = useState<Record<string, ProfilePhoto[]>>({});
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [matchedName, setMatchedName] = useState<string | null>(null);
  const [cardFade] = useState(new Animated.Value(1));

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

  const animateCardIn = () => {
    cardFade.setValue(0.5);
    Animated.timing(cardFade, { toValue: 1, duration: 280, useNativeDriver: true }).start();
  };

  const swipe = async (action: "like" | "pass" | "superlike") => {
    const current = candidates[index];
    if (!current || !user || acting) return;
    setActing(true);
    const { error } = await supabase.from("user_swipes").upsert({
      liker_id: user.id, liked_id: current.id, action,
    }, { onConflict: "liker_id,liked_id" });
    if (!error && (action === "like" || action === "superlike")) {
      const { data: m } = await supabase.from("user_matches").select("id")
        .or(`and(user_a.eq.${user.id},user_b.eq.${current.id}),and(user_a.eq.${current.id},user_b.eq.${user.id})`)
        .maybeSingle();
      if (m) { setMatchedName(current.display_name ?? "Someone thoughtful"); setTimeout(() => setMatchedName(null), 2200); }
    }
    animateCardIn();
    setIndex(i => i + 1);
    setActing(false);
  };

  const current = candidates[index];
  const currentPhoto = current
    ? (photos[current.id] ?? []).find((photo) => photo.is_primary) ?? (photos[current.id] ?? [])[0]
    : null;
  const currentPhotoUrl = publicPhotoUrl(currentPhoto?.storage_path);

  const firstName = profile?.display_name?.split(" ")[0];

  return (
    <ScreenShell>
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
        Read values, wellness rhythm, and long-term intent before deciding.
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
            action={{ label: "Refresh discovery", onPress: load }}
            secondaryAction={{ label: "Tune preferences", onPress: () => router.push("/(app)/profile") }}
            safetyCue="Your preferences and privacy are still active"
          />
        </SurfaceCard>
      ) : (
        <Animated.View style={{ opacity: cardFade }}>
          <SurfaceCard style={styles.card} gap={0}>
            {/* Photo area */}
            <View style={styles.photoBox}>
              {currentPhotoUrl ? (
                <Image source={{ uri: currentPhotoUrl }} style={styles.profilePhoto} resizeMode="cover" />
              ) : (
                <View style={styles.initialsContainer}>
                  <Text style={styles.initials}>{(current.display_name ?? "FB").slice(0, 2).toUpperCase()}</Text>
                  <Text style={styles.noPhotoText}>No public photo yet</Text>
                </View>
              )}
              {/* Bottom gradient overlay */}
              <View style={styles.photoFade} />

              {/* Verified badge — only show when verified */}
              {current.is_verified && (
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>✓ Verified</Text>
                </View>
              )}

              {/* Name overlay at photo bottom */}
              <View style={styles.nameOverlay}>
                <Text style={styles.name}>
                  {current.display_name ?? "Freeborn member"}
                  {current.age ? <Text style={styles.age}>  {current.age}</Text> : null}
                </Text>
                <Text style={styles.locationLine}>
                  {[current.city, current.region].filter(Boolean).join(", ") || "Nearby"}
                  {current.occupation ? ` · ${current.occupation}` : ""}
                </Text>
              </View>
            </View>

            {/* Info section */}
            <View style={styles.infoSection}>
              <Text style={styles.bio} numberOfLines={4}>
                {current.bio ?? "This member has not added a bio yet. Look for their interests and intentions before deciding."}
              </Text>

              {/* Chips */}
              <View style={styles.chips}>
                {(current.relationship_goals ?? []).slice(0, 2).map(g => (
                  <View key={g} style={styles.goldChip}>
                    <Text style={styles.goldChipText}>{g.replace(/_/g, " ")}</Text>
                  </View>
                ))}
                {(current.interests ?? []).slice(0, 4).map(i => (
                  <View key={i} style={styles.chip}>
                    <Text style={styles.chipText}>{i}</Text>
                  </View>
                ))}
              </View>

              {/* Match banner */}
              {matchedName && (
                <View style={styles.matchBanner}>
                  <Text style={styles.matchEyebrow}>It's a match</Text>
                  <Text style={styles.matchBody}>You and {matchedName} liked each other.</Text>
                  <Text style={styles.matchHint}>Start from something specific in their profile.</Text>
                </View>
              )}

              {/* Actions */}
              <View style={styles.actions}>
                <Pressable
                  disabled={acting}
                  onPress={() => swipe("pass")}
                  style={({ pressed }) => [styles.actionBtn, styles.passBtn, pressed && styles.actionPressed]}
                >
                  <Text style={styles.passIcon}>✕</Text>
                  <Text style={styles.actionLabel}>Pass</Text>
                </Pressable>
                <Pressable
                  disabled={acting}
                  onPress={() => swipe("superlike")}
                  style={({ pressed }) => [styles.actionBtn, styles.superBtn, pressed && styles.actionPressed]}
                >
                  <Text style={styles.superIcon}>★</Text>
                  <Text style={[styles.actionLabel, { color: colors.violet300 }]}>Spark</Text>
                </Pressable>
                <Pressable
                  disabled={acting}
                  onPress={() => swipe("like")}
                  style={({ pressed }) => [styles.actionBtn, styles.likeBtn, pressed && styles.actionPressed]}
                >
                  <Text style={styles.likeIcon}>♥</Text>
                  <Text style={[styles.actionLabel, { color: colors.ink }]}>{acting ? "…" : "Like"}</Text>
                </Pressable>
              </View>
              <Text style={styles.remaining}>{Math.max(candidates.length - index - 1, 0)} remaining</Text>
            </View>
          </SurfaceCard>
        </Animated.View>
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
  card: { padding: 0, overflow: "hidden" },
  emptyCard: { padding: 0 },
  photoBox: {
    height: 320,
    backgroundColor: "rgba(255,133,120,0.06)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
  },
  profilePhoto: { width: "100%", height: "100%" },
  initialsContainer: {
    width: 120,
    minHeight: 100,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.06)",
    justifyContent: "center",
    alignItems: "center",
    padding: 14,
  },
  initials: {
    color: colors.pearl,
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: -1,
  },
  noPhotoText: {
    color: colors.mist,
    fontSize: 11,
    fontWeight: "700",
    marginTop: 8,
    textAlign: "center",
  },
  photoFade: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 180,
    backgroundColor: "rgba(9,16,28,0.5)",
  },
  verifiedBadge: {
    position: "absolute",
    right: 14,
    top: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.35)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  verifiedText: {
    color: colors.pearl,
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  nameOverlay: {
    position: "absolute",
    left: 18,
    right: 18,
    bottom: 16,
  },
  name: {
    color: "white",
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -1.2,
    lineHeight: 30,
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  age: { color: "rgba(255,255,255,0.80)", fontSize: 20, fontWeight: "700" },
  locationLine: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 4,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  infoSection: { padding: 20, gap: 12 },
  bio: {
    color: colors.pearl,
    opacity: 0.92,
    fontSize: 14,
    lineHeight: 22,
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  goldChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(246,215,154,0.28)",
    backgroundColor: "rgba(217,167,82,0.12)",
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  goldChipText: { color: colors.pearl, fontSize: 11, fontWeight: "900" },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  chipText: { color: colors.mist, fontSize: 11, fontWeight: "700" },
  matchBanner: {
    backgroundColor: "rgba(241,201,122,0.10)",
    borderWidth: 1,
    borderColor: "rgba(241,201,122,0.28)",
    borderRadius: 20,
    padding: 16,
  },
  matchEyebrow: {
    color: colors.gold300,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 1.8,
    fontSize: 10,
  },
  matchBody: { color: colors.pearl, marginTop: 6, fontWeight: "800", fontSize: 16 },
  matchHint: { color: colors.mist, marginTop: 4, fontSize: 12, lineHeight: 18 },
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
  remaining: {
    textAlign: "center",
    color: colors.ash,
    fontSize: 10,
    marginTop: 6,
    textTransform: "uppercase",
    letterSpacing: 1.6,
  },
});
