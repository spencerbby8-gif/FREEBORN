import { StyleSheet, Text, View } from "react-native";
import { colors } from "@freeborn/shared";
import { DetailScreenShell } from "@/components/ui/detail-screen-shell";
import { SurfaceCard } from "@/components/ui/surface-card";
import { SectionHeader } from "@/components/ui/section-header";

export default function PrivacySafetyScreen() {
  return (
    <DetailScreenShell title="Privacy & Safety" subtitle="How we protect you">
      <SurfaceCard>
        <SectionHeader eyebrow="Data" title="Your data" body="Freeborn keeps your private essentials out of public view at all times." />
        <View style={styles.row}>
          <Text style={styles.rowIcon}>✓</Text>
          <Text style={styles.rowLabel}>Email is never shown publicly</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowIcon}>✓</Text>
          <Text style={styles.rowLabel}>Full birth date is only used for age gating</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowIcon}>✓</Text>
          <Text style={styles.rowLabel}>Account providers are never exposed</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowIcon}>✓</Text>
          <Text style={styles.rowLabel}>Last name is never shown publicly</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowIcon}>✓</Text>
          <Text style={styles.rowLabel}>You control your discoverability at all times</Text>
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeader eyebrow="Safety" title="Community standards" body="Freeborn rewards attention, patience, and long-term clarity over impulse." />
        <View style={styles.safetyItem}>
          <Text style={styles.safetyTitle}>Honor health autonomy</Text>
          <Text style={styles.safetyBody}>Members should be free to make informed choices about their bodies, homes, food, family, and care without coercion or ridicule.</Text>
        </View>
        <View style={styles.safetyItem}>
          <Text style={styles.safetyTitle}>Be recognizable and real</Text>
          <Text style={styles.safetyBody}>Use recent photos, honest details, and a bio that sounds like you.</Text>
        </View>
        <View style={styles.safetyItem}>
          <Text style={styles.safetyTitle}>Move toward commitment with care</Text>
          <Text style={styles.safetyBody}>Pass respectfully, like intentionally, and open with something specific.</Text>
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeader eyebrow="Coming soon" title="Block & report" body="The ability to block or report members will be available in a future update. If you have a safety concern now, please contact support." />
      </SurfaceCard>
    </DetailScreenShell>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8 },
  rowIcon: { color: colors.teal300, fontSize: 14, fontWeight: "900" },
  rowLabel: { color: colors.pearl, fontSize: 13, fontWeight: "700", flex: 1 },
  safetyItem: { gap: 4, paddingVertical: 6 },
  safetyTitle: { color: colors.pearl, fontSize: 14, fontWeight: "900" },
  safetyBody: { color: colors.mist, fontSize: 13, lineHeight: 20 },
});
