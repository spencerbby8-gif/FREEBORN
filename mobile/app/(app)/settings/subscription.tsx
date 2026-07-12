import { StyleSheet, Text, View } from "react-native";
import { colors } from "@freeborn/shared";
import { DetailScreenShell } from "@/components/ui/detail-screen-shell";
import { SurfaceCard } from "@/components/ui/surface-card";
import { SectionHeader } from "@/components/ui/section-header";

export default function SubscriptionScreen() {
  return (
    <DetailScreenShell title="Subscription" subtitle="Your plan">
      <SurfaceCard>
        <SectionHeader eyebrow="Plan" title="Free access" body="The current product lets members create a profile, discover people, like, match, and message without a paid plan." />
        <View style={styles.planCard}>
          <Text style={styles.planIcon}>✦</Text>
          <Text style={styles.planName}>Freeborn Free</Text>
          <Text style={styles.planPrice}>$0 / month</Text>
          <View style={styles.planFeatures}>
            <Text style={styles.planFeature}>✓ Unlimited discovery</Text>
            <Text style={styles.planFeature}>✓ Likes, sparks, and matches</Text>
            <Text style={styles.planFeature}>✓ Messaging with matches</Text>
            <Text style={styles.planFeature}>✓ Full profile editing</Text>
            <Text style={styles.planFeature}>✓ Discovery preferences</Text>
            <Text style={styles.planFeature}>✓ Privacy controls</Text>
          </View>
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeader eyebrow="Future" title="Premium features" body="Freeborn may introduce optional premium features in the future. No paid plan is currently available or required." />
        <Text style={styles.comingSoon}>Premium features will be announced here when available.</Text>
      </SurfaceCard>
    </DetailScreenShell>
  );
}

const styles = StyleSheet.create({
  planCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(246,215,154,0.20)",
    backgroundColor: "rgba(217,167,82,0.06)",
    padding: 24,
    alignItems: "center",
    gap: 8,
  },
  planIcon: { fontSize: 32, color: colors.gold300 },
  planName: { color: colors.pearl, fontSize: 22, fontWeight: "900", letterSpacing: -0.6 },
  planPrice: { color: colors.gold300, fontSize: 16, fontWeight: "800" },
  planFeatures: { gap: 8, marginTop: 12, alignSelf: "stretch" },
  planFeature: { color: colors.pearl, fontSize: 13, fontWeight: "700" },
  comingSoon: { color: colors.mist, fontSize: 13, lineHeight: 20 },
});
