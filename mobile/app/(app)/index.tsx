import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { colors, radii, type UserProfileRow } from "@freeborn/shared";
import { GlassCard } from "@/components/glass-card";
import { NoticeCard } from "@/components/auth/notice-card";
import { Wordmark } from "@/components/wordmark";
import { useAuth } from "@/hooks/use-auth";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export default function AccountScreen() {
  const { user, notice, clearNotice, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfileRow | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!user || !isSupabaseConfigured) return;
      const { data } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle<UserProfileRow>();
      if (mounted) setProfile(data);
    }
    load();
    return () => {
      mounted = false;
    };
  }, [user]);

  useEffect(() => {
    if (profile && profile.onboarding_stage === "account_created") {
      router.replace("/(app)/onboarding");
    }
  }, [profile]);

  return (
    <LinearGradient colors={[colors.night, colors.midnight, colors.slate]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.headerRow}>
            <Wordmark />
            <Pressable style={styles.signOutButton} onPress={() => signOut()}>
              <Text style={styles.signOutLabel}>Sign out</Text>
            </Pressable>
          </View>

          <View style={styles.heroBlock}>
            <View style={styles.eyebrow}>
              <View style={styles.eyebrowDot} />
              <Text style={styles.eyebrowLabel}>Protected route</Text>
            </View>
            <Text style={styles.title}>Your profile foundation is ready.</Text>
            <Text style={styles.description}>
              Phase 2 is live on mobile. Your onboarding is complete, and the app shell is ready for
              the next chapter of Freeborn.
            </Text>
          </View>

          {notice ? (
            <Pressable onPress={clearNotice}>
              <NoticeCard {...notice} />
            </Pressable>
          ) : null}

          <GlassCard>
            <Text style={styles.sectionTitle}>Account snapshot</Text>
            <View style={styles.grid}>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Email</Text>
                <Text style={styles.statValue}>{user?.email ?? "Unknown"}</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Verification</Text>
                <Text style={styles.statValue}>{user?.email_confirmed_at ? "Verified" : "Pending"}</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Provider</Text>
                <Text style={styles.statValue}>
                  {(user?.app_metadata?.providers as string[] | undefined)?.join(", ") || "email"}
                </Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Profile</Text>
                <Text style={styles.statValue}>{profile?.profile_status ?? "draft"}</Text>
              </View>
            </View>
          </GlassCard>

          <GlassCard>
            <Text style={styles.sectionTitle}>Phase 2 delivered</Text>
            <View style={styles.list}>
              {[
                "Five-step onboarding on native mobile",
                "Display name, age validation, gender, and location",
                "Bio, relationship goals, interests, and lifestyle",
                "Deal breakers, occupation, and education",
                "Automatic progress saving with shared Zod validation",
              ].map((item) => (
                <View key={item} style={styles.listRow}>
                  <View style={styles.listDot} />
                  <Text style={styles.listLabel}>{item}</Text>
                </View>
              ))}
            </View>
          </GlassCard>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 42,
    gap: 22,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  signOutButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    backgroundColor: "rgba(255,255,255,0.06)",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  signOutLabel: {
    color: colors.pearl,
    fontSize: 13,
    fontWeight: "700",
  },
  heroBlock: {
    gap: 14,
    marginTop: 16,
  },
  eyebrow: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  eyebrowDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.accentGold,
  },
  eyebrowLabel: {
    color: colors.stone,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2.4,
    textTransform: "uppercase",
  },
  title: {
    color: colors.pearl,
    fontSize: 38,
    lineHeight: 42,
    fontWeight: "700",
    letterSpacing: -1.8,
    maxWidth: 330,
  },
  description: {
    color: colors.mist,
    fontSize: 15,
    lineHeight: 25,
  },
  sectionTitle: {
    color: colors.pearl,
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.7,
  },
  grid: {
    marginTop: 18,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    width: "47%",
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    backgroundColor: "rgba(255,255,255,0.06)",
    padding: 14,
  },
  statLabel: {
    color: colors.stone,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.8,
    textTransform: "uppercase",
  },
  statValue: {
    marginTop: 10,
    color: colors.pearl,
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 22,
    textTransform: "capitalize",
  },
  list: {
    marginTop: 18,
    gap: 14,
  },
  listRow: {
    flexDirection: "row",
    gap: 12,
  },
  listDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.accentGold,
    marginTop: 7,
  },
  listLabel: {
    flex: 1,
    color: colors.pearl,
    fontSize: 14,
    lineHeight: 23,
  },
});
