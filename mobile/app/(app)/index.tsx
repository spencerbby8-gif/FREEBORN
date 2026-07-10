import { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { colors, radii, type DiscoveryCandidate, type ProfilePhoto, type UserProfileRow } from "@freeborn/shared";
import { Wordmark } from "@/components/wordmark";
import { useAuth } from "@/hooks/use-auth";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

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
    if (p?.onboarding_stage === "account_created") {
      router.replace("/(app)/onboarding");
      return;
    }
    const { data } = await supabase.rpc("discover_candidates", { p_user: user.id, p_limit: 24, p_offset: 0 });
    const cands = (data as DiscoveryCandidate[]) ?? [];
    setCandidates(cands);
    setIndex(0);
    const ids = cands.map(c => c.id);
    if (ids.length) {
      const { data: ph } = await supabase.from("profile_photos").select("*").in("user_id", ids).order("position");
      const map: Record<string, ProfilePhoto[]> = {};
      (ph as ProfilePhoto[] ?? []).forEach(pp => {
        (map[pp.user_id] ||= []).push(pp);
      });
      setPhotos(map);
    } else {
      setPhotos({});
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const swipe = async (action: "like" | "pass" | "superlike") => {
    const current = candidates[index];
    if (!current || !user || acting) return;
    setActing(true);
    const { error } = await supabase.from("user_swipes").upsert({
      liker_id: user.id,
      liked_id: current.id,
      action,
    }, { onConflict: "liker_id,liked_id" });
    if (!error && (action === "like" || action === "superlike")) {
      // check match
      const { data: m } = await supabase
        .from("user_matches")
        .select("id")
        .or(`and(user_a.eq.${user.id},user_b.eq.${current.id}),and(user_a.eq.${current.id},user_b.eq.${user.id})`)
        .maybeSingle();
      if (m) {
        setMatchedName(current.display_name ?? "Someone thoughtful");
        setTimeout(() => setMatchedName(null), 2200);
      }
    }
    setIndex(i => i + 1);
    setActing(false);
  };

  const current = candidates[index];

  return (
    <LinearGradient colors={[colors.night, colors.midnight, colors.slate]} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Wordmark />
            <Pressable onPress={signOut} style={styles.signout}><Text style={styles.signoutText}>Sign out</Text></Pressable>
          </View>

          <Text style={styles.eyebrow}>Phase 3 · Discovery</Text>
          <Text style={styles.title}>Thoughtful people, nearby.</Text>
          <Text style={styles.subtitle}>
            {profile?.display_name ? `Welcome back, ${profile.display_name.split(" ")[0]}.` : "Your curated feed is live."} Swipe with intention.
          </Text>

          {loading ? (
            <View style={styles.card}><ActivityIndicator color={colors.pearl} /><Text style={styles.loadingText}>Finding thoughtful profiles…</Text></View>
          ) : !current ? (
            <View style={styles.card}>
              <Text style={styles.emptyTitle}>All caught up</Text>
              <Text style={styles.emptyBody}>You’ve seen everyone for now. Check back soon — Freeborn refreshes as new intentional profiles join.</Text>
              <Pressable onPress={load} style={styles.primaryBtn}><Text style={styles.primaryBtnText}>Refresh</Text></Pressable>
            </View>
          ) : (
            <View style={styles.card}>
              <View style={styles.photoBox}>
                <Text style={styles.initials}>{(current.display_name ?? "FB").slice(0,2).toUpperCase()}</Text>
                <View style={styles.verifiedBadge}><Text style={styles.verifiedText}>{current.is_verified ? "Verified" : "New"}</Text></View>
              </View>
              <Text style={styles.name}>{current.display_name ?? "Freeborn member"}  <Text style={styles.age}>{current.age ?? "—"}</Text></Text>
              <Text style={styles.location}>{[current.city, current.region].filter(Boolean).join(", ") || "Somewhere thoughtful"}</Text>
              <Text style={styles.bio} numberOfLines={4}>{current.bio ?? "Thoughtful, intentional, and looking for something real."}</Text>
              <View style={styles.chips}>
                {(current.relationship_goals ?? []).slice(0,2).map(g => (
                  <View key={g} style={styles.chip}><Text style={styles.chipText}>{g.replace("_"," ")}</Text></View>
                ))}
                {(current.interests ?? []).slice(0,4).map(i => (
                  <View key={i} style={[styles.chip, styles.chipSoft]}><Text style={[styles.chipText, { color: colors.mist }]}>{i}</Text></View>
                ))}
              </View>

              {matchedName && (
                <View style={styles.matchBanner}>
                  <Text style={styles.matchTitle}>It’s a match!</Text>
                  <Text style={styles.matchBody}>You and {matchedName} liked each other.</Text>
                </View>
              )}

              <View style={styles.actions}>
                <Pressable disabled={acting} onPress={() => swipe("pass")} style={[styles.actionBtn, styles.passBtn]}>
                  <Text style={styles.passText}>Pass</Text>
                </Pressable>
                <Pressable disabled={acting} onPress={() => swipe("superlike")} style={[styles.actionBtn, styles.superBtn]}>
                  <Text style={styles.superText}>Super</Text>
                </Pressable>
                <Pressable disabled={acting} onPress={() => swipe("like")} style={[styles.actionBtn, styles.likeBtn]}>
                  <Text style={styles.likeText}>{acting ? "…" : "Like"}</Text>
                </Pressable>
              </View>
              <Text style={styles.remaining}>{Math.max(candidates.length - index - 1, 0)} remaining</Text>
            </View>
          )}

          <View style={styles.statsRow}>
            <View style={styles.stat}><Text style={styles.statNum}>{profile?.photo_count ?? 0}</Text><Text style={styles.statLabel}>Photos</Text></View>
            <View style={styles.stat}><Text style={styles.statNum}>{(profile?.interests ?? []).length}</Text><Text style={styles.statLabel}>Interests</Text></View>
            <View style={styles.stat}><Text style={styles.statNum}>{profile?.is_verified ? "✓" : "—"}</Text><Text style={styles.statLabel}>Verified</Text></View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  content: { padding: 20, paddingBottom: 110, gap: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  signout: { borderRadius: 999, borderWidth: 1, borderColor: colors.lineStrong, paddingHorizontal: 14, paddingVertical: 9, backgroundColor: "rgba(255,255,255,0.05)" },
  signoutText: { color: colors.pearl, fontSize: 12, fontWeight: "700" },
  eyebrow: { color: colors.stone, fontSize: 11, textTransform: "uppercase", letterSpacing: 2.2, fontWeight: "700", marginTop: 10 },
  title: { color: colors.pearl, fontSize: 30, fontWeight: "800", letterSpacing: -1.2, marginTop: 4 },
  subtitle: { color: colors.mist, fontSize: 14, lineHeight: 22 },
  card: { borderRadius: radii.xl, borderWidth: 1, borderColor: colors.lineStrong, backgroundColor: "rgba(9,16,28,0.9)", padding: 18, minHeight: 420 },
  photoBox: { height: 270, borderRadius: 24, backgroundColor: "rgba(255,133,120,0.10)", alignItems: "center", justifyContent: "center", marginBottom: 14, overflow: "hidden" },
  initials: { color: colors.pearl, fontSize: 42, fontWeight: "800", letterSpacing: -1 },
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
  actions: { flexDirection: "row", gap: 10, marginTop: 18 },
  actionBtn: { flex: 1, borderRadius: 18, paddingVertical: 15, alignItems: "center" },
  passBtn: { backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: colors.lineStrong },
  passText: { color: colors.mist, fontWeight: "800" },
  superBtn: { backgroundColor: "rgba(140,207,255,0.10)", borderWidth: 1, borderColor: "rgba(140,207,255,0.28)" },
  superText: { color: colors.accentBlue, fontWeight: "800" },
  likeBtn: { backgroundColor: colors.pearl },
  likeText: { color: colors.ink, fontWeight: "900" },
  remaining: { textAlign: "center", color: colors.stone, fontSize: 11, marginTop: 10, textTransform: "uppercase", letterSpacing: 1.4 },
  loadingText: { color: colors.mist, marginTop: 10, textAlign: "center" },
  emptyTitle: { color: colors.pearl, fontSize: 22, fontWeight: "800" },
  emptyBody: { color: colors.mist, marginTop: 8, lineHeight: 20 },
  primaryBtn: { backgroundColor: colors.pearl, borderRadius: 18, paddingVertical: 14, alignItems: "center", marginTop: 16 },
  primaryBtnText: { color: colors.ink, fontWeight: "900" },
  matchBanner: { backgroundColor: "rgba(241,201,122,0.12)", borderWidth: 1, borderColor: "rgba(241,201,122,0.32)", borderRadius: 18, padding: 14, marginTop: 12 },
  matchTitle: { color: colors.accentGold, fontWeight: "900", textTransform: "uppercase", letterSpacing: 1.6, fontSize: 11 },
  matchBody: { color: colors.pearl, marginTop: 4, fontWeight: "700" },
  statsRow: { flexDirection: "row", gap: 12 },
  stat: { flex: 1, borderRadius: 20, borderWidth: 1, borderColor: colors.lineStrong, backgroundColor: "rgba(255,255,255,0.045)", padding: 14, alignItems: "center" },
  statNum: { color: colors.pearl, fontSize: 20, fontWeight: "800" },
  statLabel: { color: colors.stone, fontSize: 11, textTransform: "uppercase", letterSpacing: 1.2, marginTop: 4, fontWeight: "700" },
});
