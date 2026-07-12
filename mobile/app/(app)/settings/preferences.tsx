import { StyleSheet, Switch, Text, View } from "react-native";
import { colors } from "@freeborn/shared";
import { DetailScreenShell } from "@/components/ui/detail-screen-shell";
import { SurfaceCard } from "@/components/ui/surface-card";
import { SectionHeader } from "@/components/ui/section-header";

export default function PreferencesScreen() {
  return (
    <DetailScreenShell title="App Preferences" subtitle="Customize your experience">
      <SurfaceCard>
        <SectionHeader eyebrow="Appearance" title="Display" />
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle}>Dark mode</Text>
            <Text style={styles.rowBody}>Always on. Freeborn is designed for dark surfaces.</Text>
          </View>
          <Switch value={true} disabled trackColor={{ false: "rgba(255,255,255,0.12)", true: colors.gold500 }} thumbColor={colors.pearl} />
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeader eyebrow="Language" title="Language settings" />
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle}>Language</Text>
            <Text style={styles.rowBody}>English (US)</Text>
          </View>
          <Switch value={true} disabled trackColor={{ false: "rgba(255,255,255,0.12)", true: colors.gold500 }} thumbColor={colors.pearl} />
        </View>
        <Text style={styles.hint}>Additional languages will be supported in a future update.</Text>
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeader eyebrow="Coming soon" title="More preferences" body="Haptic feedback, card animations, and notification sounds will be configurable in a future update." />
      </SurfaceCard>
    </DetailScreenShell>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 14, borderRadius: 22, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", backgroundColor: "rgba(255,255,255,0.025)", padding: 16 },
  rowTitle: { color: colors.pearl, fontSize: 14, fontWeight: "900" },
  rowBody: { color: colors.mist, fontSize: 12, lineHeight: 18, marginTop: 3 },
  hint: { color: colors.ash, fontSize: 11, marginTop: 4 },
});
