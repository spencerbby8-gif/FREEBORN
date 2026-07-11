import { useCallback, useEffect, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { colors, radii, type DiscoveryCandidate, type ProfilePhoto, type UserProfileRow } from "@freeborn/shared";
import { MagicBackground, emberShadow, premiumShadow } from "@/components/magic-background";
import { Wordmark } from "@/components/wordmark";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";

function publicPhotoUrl(path?: string | null) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const base = process.env.EXPO_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  return `${base}/storage/v1/object/public/profile-photos/${path.split("/").map(encodeURIComponent).join("/")}`;
}

export default function DiscoverScreen() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfileRow | null>(null);
  const [candidates, setCandidates] = useState<DiscoveryCandidate[]>([]);
  const [photos, setPhotos] = useState<Record<string, ProfilePhoto[]>>({});
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
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
    setIndex(i => i + 1);
    setActing(false);
  };

  const current = candidates[index];
  const currentPhoto = current
    ? (photos[current.id] ?? []).find((photo) => photo.is_primary) ?? (photos[current.id] ?? [])[0]
    : null;
  const currentPhotoUrl = publicPhotoUrl(currentPhoto?.storage_path);

  return (
    <LinearGradient colors={["#03050b", colors.night, colors.midnight, colors.slate]} style={styles.container}>
      <MagicBackground />
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Wordmark />
            <Pressable onPress={signOut} style={styles.signoutBtn}>
              <Text style={styles.signoutText}>Sign out</Text>
            </Pressable>
          </View>

          <Text style={styles.title}>Discover</Text>
          <Text style={styles.subtitle}>
            {profile?.display_name ? `Welcome back, ${profile.display_name.split(" ")[0]}.` : "Your curated feed is live."}
          </Text>

          {loading ? (
            <View style={styles.card}>
              <ActivityIndicator color={colors.pearl} size="large" />
              <Text style={styles.loadingText}>Finding thoughtful profiles…</Text>
            </View>
          ) : !current ? (
            <View style={[styles.card, styles.emptyCard]}>
              <View style={styles.emptyIcon}>
                <Text style={styles.emptyIconText}>✨</Text>
              </View>
              <Text style={styles.emptyTitle}>All caught up</Text>
              <Text style={styles.emptyBody}>
                {candidates.length === 0
                  ? "We're finding thoughtful people near you. New profiles join every day."
                  : "You've seen everyone for now. Check back soon."}
              </Text>
              <Pressable onPress={load} style={styles.primaryBtn}>
                <Text style={styles.primaryBtnText}>Refresh</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.card}>
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
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>{current.is_verified ? "Verified" : "Unverified"}</Text>
                </View>
              </View>

              {/* Info */}
              <Text style={styles.name}>
                {current.display_name ?? "Freeborn member"}
                {current.age ? <Text style={styles.age}>  {current.age}</Text> : null}
              </Text>
              <Text style={styles.location}>
                {[current.city, current.region].filter(Boolean).join(", ") || "Nearby"}
                {current.occupation ? ` · ${current.occupation}` : ""}
              </Text>
              <Text style={styles.bio} numberOfLines={4}>
                {current.bio ?? "This member has not added a bio yet. Look for their interests and intentions before deciding."}
              </Text>

              {/* Chips */}
              <View style={styles.chips}>
                {(current.relationship_goals ?? []).slice(0, 2).map(g => (
                  <View key={g} style={styles.chip}>
                    <Text style={styles.chipText}>{g.replace("_", " ")}</Text>
                  </View>
                ))}
                {(current.interests ?? []).slice(0, 4).map(i => (
                  <View key={i} style={[styles.chip, styles.chipSoft]}>
                    <Text style={[styles.chipText, { color: colors.mist }]}>{i}</Text>
                  </View>
                ))}
              </View>

              {/* Match banner */}
              {matchedName && (
                <View style={styles.matchBanner}>
                  <Text style={styles.matchTitle}>It's a match!</Text>
                  <Text style={styles.matchBody}>You and {matchedName} liked each other.</Text>
                </View>
              )}

              {/* Actions */}
              <View style={styles.actions}>
                <Pressable disabled={acting} onPress={() => swipe("pass")} style={[styles.actionBtn, styles.passBtn]}>
                  <Text style={styles.passIcon}>✕</Text>
                  <Text style={styles.actionLabel}>Pass</Text>
                </Pressable>
                <Pressable disabled={acting} onPress={() => swipe("superlike")} style={[styles.actionBtn, styles.superBtn]}>
                  <Text style={styles.superIcon}>★</Text>
                  <Text style={[styles.actionLabel, { color: colors.accentBlue }]}>Spark</Text>
                </Pressable>
                <Pressable disabled={acting} onPress={() => swipe("like")} style={[styles.actionBtn, styles.likeBtn]}>
                  <Text style={styles.likeIcon}>♥</Text>
                  <Text style={[styles.actionLabel, { color: colors.ink }]}>{acting ? "…" : "Like"}</Text>
                </Pressable>
              </View>
              <Text style={styles.remaining}>{Math.max(candidates.length - index - 1, 0)} remaining</Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  content: { padding: 20, paddingBottom: 120, gap: 14 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  signoutBtn: { borderRadius: 999, borderWidth: 1, borderColor: colors.lineStrong, paddingHorizontal: 14, paddingVertical: 9, backgroundColor: "rgba(255,255,255,0.05)" },
  signoutText: { color: colors.pearl, fontSize: 12, fontWeight: "700" },
  title: { color: colors.pearl, fontSize: 30, fontWeight: "800", letterSpacing: -1.2, marginTop: 6 },
  subtitle: { color: colors.mist, fontSize: 14, lineHeight: 22 },
  card: { borderRadius: radii.xl, borderWidth: 1, borderColor: "rgba(255,255,255,0.16)", backgroundColor: "rgba(9,16,28,0.9)", padding: 18, minHeight: 420, ...premiumShadow },
  emptyCard: { justifyContent: "center", alignItems: "center", paddingVertical: 40 },
  emptyIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: "rgba(241,201,122,0.16)", justifyContent: "center", alignItems: "center", marginBottom: 16, ...emberShadow },
  emptyIconText: { fontSize: 24 },
  emptyTitle: { color: colors.pearl, fontSize: 22, fontWeight: "800", textAlign: "center" },
  emptyBody: { color: colors.mist, marginTop: 8, lineHeight: 20, textAlign: "center", paddingHorizontal: 20 },
  photoBox: { height: 280, borderRadius: 24, backgroundColor: "rgba(255,133,120,0.08)", alignItems: "center", justifyContent: "center", marginBottom: 14, overflow: "hidden" },
  profilePhoto: { width: "100%", height: "100%" },
  initialsContainer: { width: 130, minHeight: 110, borderRadius: 28, backgroundColor: "rgba(255,255,255,0.08)", justifyContent: "center", alignItems: "center", padding: 14 },
  initials: { color: colors.pearl, fontSize: 32, fontWeight: "800", letterSpacing: -1 },
  noPhotoText: { color: colors.mist, fontSize: 11, fontWeight: "700", marginTop: 8, textAlign: "center" },
  verifiedBadge: { position: "absolute", right: 12, top: 12, backgroundColor: "rgba(255,255,255,0.10)", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: "rgba(255,255,255,0.14)" },
  verifiedText: { color: colors.pearl, fontSize: 10, fontWeight: "800", textTransform: "uppercase", letterSpacing: 1.2 },
  name: { color: colors.pearl, fontSize: 24, fontWeight: "800", letterSpacing: -0.8 },
  age: { color: colors.mist, fontWeight: "700", fontSize: 18 },
  location: { color: colors.mist, marginTop: 4, fontSize: 13 },
  bio: { color: colors.pearl, opacity: 0.92, marginTop: 10, fontSize: 14, lineHeight: 22 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  chip: { borderRadius: 999, borderWidth: 1, borderColor: colors.lineStrong, backgroundColor: "rgba(255,255,255,0.05)", paddingHorizontal: 10, paddingVertical: 6 },
  chipSoft: { backgroundColor: "rgba(255,255,255,0.033)" },
  chipText: { color: colors.pearl, fontSize: 11, fontWeight: "700", textTransform: "capitalize" },
  matchBanner: { backgroundColor: "rgba(241,201,122,0.12)", borderWidth: 1, borderColor: "rgba(241,201,122,0.32)", borderRadius: 18, padding: 14, marginTop: 12 },
  matchTitle: { color: colors.accentGold, fontWeight: "900", textTransform: "uppercase", letterSpacing: 1.6, fontSize: 11 },
  matchBody: { color: colors.pearl, marginTop: 4, fontWeight: "700" },
  actions: { flexDirection: "row", gap: 10, marginTop: 18 },
  actionBtn: { flex: 1, borderRadius: 18, paddingVertical: 14, alignItems: "center", gap: 4 },
  passBtn: { backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: colors.lineStrong },
  passIcon: { color: colors.mist, fontSize: 18, fontWeight: "700" },
  superBtn: { backgroundColor: "rgba(140,207,255,0.10)", borderWidth: 1, borderColor: "rgba(140,207,255,0.28)" },
  superIcon: { color: colors.accentBlue, fontSize: 18, fontWeight: "700" },
  likeBtn: { backgroundColor: colors.pearl, ...emberShadow },
  likeIcon: { color: colors.ink, fontSize: 18, fontWeight: "700" },
  actionLabel: { color: colors.mist, fontSize: 11, fontWeight: "600" },
  remaining: { textAlign: "center", color: colors.stone, fontSize: 11, marginTop: 10, textTransform: "uppercase", letterSpacing: 1.4 },
  loadingText: { color: colors.mist, marginTop: 14, textAlign: "center", fontSize: 14 },
  primaryBtn: { backgroundColor: colors.pearl, borderRadius: 18, paddingVertical: 14, alignItems: "center", marginTop: 20, paddingHorizontal: 40 },
  primaryBtnText: { color: colors.ink, fontWeight: "900", fontSize: 14 },
});
