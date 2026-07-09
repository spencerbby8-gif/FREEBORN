import { Link } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { brand, colors, productPillars, radii, spacing } from "@freeborn/shared";
import { GlassCard } from "@/components/glass-card";
import { Pill } from "@/components/pill";
import { ProfilePreviewCard } from "@/components/profile-preview-card";
import { Wordmark } from "@/components/wordmark";

const stats = [
  { value: "Intent", label: "ahead of impulse" },
  { value: "Trust", label: "built into every layer" },
  { value: "Quality", label: "over rushed shipping" },
] as const;

export default function IndexScreen() {
  return (
    <LinearGradient colors={[colors.night, colors.midnight, colors.slate]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Wordmark />

          <View style={styles.heroBlock}>
            <View style={styles.eyebrow}>
              <View style={styles.eyebrowDot} />
              <Text style={styles.eyebrowLabel}>Premium dating app foundation</Text>
            </View>
            <Text style={styles.headline}>
              First impressions should feel <Text style={styles.headlineAccent}>elevated</Text>.
            </Text>
            <Text style={styles.copy}>{brand.manifesto}</Text>
          </View>

          <View style={styles.ctaRow}>
            <Link href="/preview" asChild>
              <Pressable style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
                <Text style={styles.primaryButtonLabel}>Explore the experience</Text>
              </Pressable>
            </Link>
            <View style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonLabel}>Phase 0 only</Text>
            </View>
          </View>

          <ProfilePreviewCard />

          <View style={styles.statsRow}>
            {stats.map((stat) => (
              <GlassCard key={stat.value} style={styles.statCard}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </GlassCard>
            ))}
          </View>

          <GlassCard>
            <Text style={styles.sectionEyebrow}>Product pillars</Text>
            <View style={styles.featureStack}>
              {productPillars.map((pillar) => (
                <View key={pillar.title} style={styles.featureRow}>
                  <View style={styles.featureIcon}>
                    <Ionicons name="sparkles-outline" size={18} color={colors.pearl} />
                  </View>
                  <View style={styles.featureBody}>
                    <Text style={styles.featureTitle}>{pillar.title}</Text>
                    <Text style={styles.featureCopy}>{pillar.body}</Text>
                  </View>
                </View>
              ))}
            </View>
          </GlassCard>

          <View style={styles.pillRow}>
            <Pill label="Calm" />
            <Pill label="Premium" accent />
            <Pill label="Trustworthy" />
            <Pill label="Human" />
          </View>
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
    paddingBottom: 42,
    gap: 24,
  },
  heroBlock: {
    gap: 18,
    marginTop: 18,
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
  headline: {
    color: colors.pearl,
    fontSize: 50,
    lineHeight: 52,
    fontWeight: "700",
    letterSpacing: -2.5,
    maxWidth: 320,
  },
  headlineAccent: {
    color: colors.accentGold,
  },
  copy: {
    color: colors.mist,
    fontSize: 16,
    lineHeight: 28,
    maxWidth: 340,
  },
  ctaRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  primaryButton: {
    flex: 1,
    borderRadius: 999,
    backgroundColor: colors.pearl,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  primaryButtonLabel: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "800",
    textAlign: "center",
  },
  secondaryButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    backgroundColor: "rgba(255,255,255,0.06)",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  secondaryButtonLabel: {
    color: colors.pearl,
    fontSize: 13,
    fontWeight: "700",
  },
  statsRow: {
    gap: 12,
  },
  statCard: {
    borderRadius: radii.lg,
  },
  statValue: {
    color: colors.pearl,
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: -1,
  },
  statLabel: {
    marginTop: 6,
    color: colors.mist,
    fontSize: 14,
    lineHeight: 22,
  },
  sectionEyebrow: {
    color: colors.stone,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2.6,
    textTransform: "uppercase",
  },
  featureStack: {
    marginTop: spacing.lg,
    gap: 18,
  },
  featureRow: {
    flexDirection: "row",
    gap: 14,
  },
  featureIcon: {
    width: 42,
    height: 42,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: colors.lineStrong,
  },
  featureBody: {
    flex: 1,
  },
  featureTitle: {
    color: colors.pearl,
    fontSize: 16,
    fontWeight: "700",
  },
  featureCopy: {
    marginTop: 6,
    color: colors.mist,
    fontSize: 14,
    lineHeight: 24,
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
});
