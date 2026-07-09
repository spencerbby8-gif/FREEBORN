import { Stack, router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors, previewProfiles, productPillars, radii } from "@freeborn/shared";
import { GlassCard } from "@/components/glass-card";

const foundation = [
  "Web in /web with a refined public surface",
  "Mobile in /mobile with Expo-native structure",
  "Shared design language in /shared",
  "Supabase migrations in /supabase/migrations",
] as const;

export default function PreviewScreen() {
  return (
    <LinearGradient colors={[colors.midnight, colors.night]} style={styles.container}>
      <Stack.Screen options={{ title: "Preview" }} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.headerRow}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="chevron-back" size={18} color={colors.pearl} />
            </Pressable>
            <Text style={styles.headerTitle}>Inside Freeborn</Text>
            <View style={styles.headerSpacer} />
          </View>

          <Text style={styles.heroTitle}>A serious foundation for a category-level product.</Text>
          <Text style={styles.heroCopy}>
            This shell is intentionally focused on feel, structure, and platform readiness so later phases can move faster without lowering the standard.
          </Text>

          {previewProfiles.map((profile, index) => (
            <GlassCard key={profile.name} style={styles.previewCard}>
              <View style={styles.previewTopRow}>
                <View>
                  <Text style={styles.previewName}>
                    {profile.name} <Text style={styles.previewAge}>{profile.age}</Text>
                  </Text>
                  <Text style={styles.previewLocation}>{profile.location}</Text>
                </View>
                <View style={styles.previewBadge}>
                  <Text style={styles.previewBadgeLabel}>{index === 0 ? "Discovery" : "Messaging ready"}</Text>
                </View>
              </View>
              <Text style={styles.previewHeadline}>{profile.headline}</Text>
            </GlassCard>
          ))}

          <GlassCard>
            <Text style={styles.sectionTitle}>What this foundation protects</Text>
            <View style={styles.list}>
              {productPillars.map((pillar) => (
                <View key={pillar.title} style={styles.listRow}>
                  <Ionicons name="checkmark-circle" size={18} color={colors.accentGold} />
                  <View style={styles.listBody}>
                    <Text style={styles.listTitle}>{pillar.title}</Text>
                    <Text style={styles.listCopy}>{pillar.body}</Text>
                  </View>
                </View>
              ))}
            </View>
          </GlassCard>

          <GlassCard>
            <Text style={styles.sectionTitle}>Repository discipline</Text>
            <View style={styles.foundationList}>
              {foundation.map((item) => (
                <View key={item} style={styles.foundationRow}>
                  <View style={styles.foundationDot} />
                  <Text style={styles.foundationLabel}>{item}</Text>
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
    paddingTop: 12,
    paddingBottom: 40,
    gap: 18,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.lineStrong,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  headerTitle: {
    color: colors.pearl,
    fontSize: 16,
    fontWeight: "700",
  },
  headerSpacer: {
    width: 40,
  },
  heroTitle: {
    marginTop: 12,
    color: colors.pearl,
    fontSize: 36,
    lineHeight: 40,
    fontWeight: "700",
    letterSpacing: -1.8,
    maxWidth: 320,
  },
  heroCopy: {
    color: colors.mist,
    fontSize: 15,
    lineHeight: 26,
  },
  previewCard: {
    borderRadius: radii.xl,
  },
  previewTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  previewName: {
    color: colors.pearl,
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -1.1,
  },
  previewAge: {
    fontSize: 18,
    opacity: 0.82,
  },
  previewLocation: {
    marginTop: 6,
    color: colors.mist,
    fontSize: 13,
  },
  previewBadge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: "rgba(255,255,255,0.07)",
  },
  previewBadgeLabel: {
    color: colors.pearl,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  previewHeadline: {
    marginTop: 18,
    color: colors.pearl,
    fontSize: 15,
    lineHeight: 26,
  },
  sectionTitle: {
    color: colors.pearl,
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.7,
  },
  list: {
    marginTop: 18,
    gap: 16,
  },
  listRow: {
    flexDirection: "row",
    gap: 12,
  },
  listBody: {
    flex: 1,
  },
  listTitle: {
    color: colors.pearl,
    fontSize: 15,
    fontWeight: "700",
  },
  listCopy: {
    marginTop: 5,
    color: colors.mist,
    fontSize: 14,
    lineHeight: 23,
  },
  foundationList: {
    marginTop: 18,
    gap: 14,
  },
  foundationRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  foundationDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.accentGold,
  },
  foundationLabel: {
    flex: 1,
    color: colors.mist,
    fontSize: 14,
    lineHeight: 23,
  },
});
