import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
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
          <LinearGradient
            colors={["rgba(217,167,82,0.14)", "rgba(217,167,82,0.04)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.planGradient}
          >
            <Text style={styles.planIcon}>✦</Text>
            <Text style={styles.planName}>Freeborn Free</Text>
            <Text style={styles.planPrice}>$0 / month</Text>
            <View style={styles.planDivider} />
            <View style={styles.planFeatures}>
              <View style={styles.planFeatureRow}>
                <Text style={styles.planFeatureIcon}>✓</Text>
                <Text style={styles.planFeature}>Unlimited discovery</Text>
              </View>
              <View style={styles.planFeatureRow}>
                <Text style={styles.planFeatureIcon}>✓</Text>
                <Text style={styles.planFeature}>Likes, sparks, and matches</Text>
              </View>
              <View style={styles.planFeatureRow}>
                <Text style={styles.planFeatureIcon}>✓</Text>
                <Text style={styles.planFeature}>Messaging with matches</Text>
              </View>
              <View style={styles.planFeatureRow}>
                <Text style={styles.planFeatureIcon}>✓</Text>
                <Text style={styles.planFeature}>Full profile editing</Text>
              </View>
              <View style={styles.planFeatureRow}>
                <Text style={styles.planFeatureIcon}>✓</Text>
                <Text style={styles.planFeature}>Discovery preferences</Text>
              </View>
              <View style={styles.planFeatureRow}>
                <Text style={styles.planFeatureIcon}>✓</Text>
                <Text style={styles.planFeature}>Privacy controls</Text>
              </View>
              <View style={styles.planFeatureRow}>
                <Text style={styles.planFeatureIcon}>✓</Text>
                <Text style={styles.planFeature}>Block and report</Text>
              </View>
              <View style={styles.planFeatureRow}>
                <Text style={styles.planFeatureIcon}>✓</Text>
                <Text style={styles.planFeature}>Notification preferences</Text>
              </View>
            </View>
          </LinearGradient>
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeader eyebrow="Integrity" title="No invented upgrade promise" body="Freeborn does not advertise match rates, second-date rates, or press logos it cannot prove. No paid plan is currently available or required." />
        <Text style={styles.honestNote}>If premium features are introduced, they will be transparent, optional, and clearly described here.</Text>
      </SurfaceCard>
    </DetailScreenShell>
  );
}

const styles = StyleSheet.create({
  planCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(246,215,154,0.20)",
    overflow: "hidden",
  },
  planGradient: {
    padding: 24,
    alignItems: "center",
    gap: 8,
  },
  planIcon: { fontSize: 32, color: colors.gold300 },
  planName: { color: colors.pearl, fontSize: 22, fontWeight: "900", letterSpacing: -0.6 },
  planPrice: { color: colors.gold300, fontSize: 16, fontWeight: "800" },
  planDivider: { width: "100%", height: 1, backgroundColor: "rgba(246,215,154,0.14)", marginVertical: 8 },
  planFeatures: { gap: 10, marginTop: 4, alignSelf: "stretch" },
  planFeatureRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  planFeatureIcon: { color: colors.teal300, fontSize: 13, fontWeight: "900" },
  planFeature: { color: colors.pearl, fontSize: 13, fontWeight: "700" },
  honestNote: { color: colors.mist, fontSize: 13, lineHeight: 20 },
});
