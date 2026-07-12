import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { brand, colors } from "@freeborn/shared";
import { DetailScreenShell } from "@/components/ui/detail-screen-shell";
import { SurfaceCard } from "@/components/ui/surface-card";
import { SectionHeader } from "@/components/ui/section-header";

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

export default function AboutScreen() {
  return (
    <DetailScreenShell title="About Freeborn" subtitle="Our mission">
      {/* Brand card */}
      <View style={styles.brandCard}>
        <LinearGradient colors={[colors.ember500, colors.gold300]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.brandGradient}>
          <Text style={styles.brandIcon}>✦</Text>
          <Text style={styles.brandName}>{brand.name}</Text>
          <Text style={styles.brandTagline}>{brand.tagline}</Text>
        </LinearGradient>
      </View>

      <SurfaceCard>
        <SectionHeader eyebrow="Mission" title={brand.positioning} />
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeader eyebrow="App" title="Version information" />
        <InfoRow label="Version" value="0.1.0" />
        <InfoRow label="Build" value="2026.07" />
        <InfoRow label="Platform" value="Mobile (Expo)" />
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeader eyebrow="Legal" title="Terms & policies" body="Freeborn is committed to transparency, privacy, and trust." />
        <View style={styles.legalRow}>
          <Text style={styles.legalIcon}>📄</Text>
          <Text style={styles.legalLabel}>Terms of Service</Text>
        </View>
        <View style={styles.legalRow}>
          <Text style={styles.legalIcon}>🔒</Text>
          <Text style={styles.legalLabel}>Privacy Policy</Text>
        </View>
        <View style={styles.legalRow}>
          <Text style={styles.legalIcon}>🛡</Text>
          <Text style={styles.legalLabel}>Community Guidelines</Text>
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeader eyebrow="Manifesto" title={brand.manifesto} />
      </SurfaceCard>
    </DetailScreenShell>
  );
}

const styles = StyleSheet.create({
  brandCard: { borderRadius: 28, overflow: "hidden" },
  brandGradient: { padding: 28, alignItems: "center", gap: 8 },
  brandIcon: { fontSize: 40, color: "white" },
  brandName: { fontSize: 32, fontWeight: "900", color: "white", letterSpacing: -1.2 },
  brandTagline: { fontSize: 14, fontWeight: "800", color: "rgba(255,255,255,0.88)", letterSpacing: 2, textTransform: "uppercase" },
  infoRow: { borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.05)", paddingVertical: 14, flexDirection: "row", justifyContent: "space-between", gap: 14 },
  infoLabel: { color: colors.mist, fontSize: 12, fontWeight: "800" },
  infoValue: { color: colors.pearl, fontSize: 12, fontWeight: "900", textAlign: "right", flex: 1 },
  legalRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.05)" },
  legalIcon: { fontSize: 18 },
  legalLabel: { color: colors.pearl, fontSize: 14, fontWeight: "700", flex: 1 },
});
