import { StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { colors } from "@freeborn/shared";
import { DetailScreenShell } from "@/components/ui/detail-screen-shell";
import { SurfaceCard } from "@/components/ui/surface-card";
import { NavCard } from "@/components/ui/nav-card";

export default function SettingsHub() {
  return (
    <DetailScreenShell title="Settings" subtitle="Manage your experience">
      <SurfaceCard gap={6} noPadding style={styles.section}>
        <View style={styles.sectionPadding}>
          <Text style={styles.sectionEyebrow}>Account</Text>
        </View>
        <NavCard icon="☤" title="Account" subtitle="Email, verification, sign out" accent="gold" onPress={() => router.push("/(app)/settings/account")} />
        <NavCard icon="◎" title="Profile Settings" subtitle="Visibility, verification, status" accent="teal" onPress={() => router.push("/(app)/profile/privacy")} />
      </SurfaceCard>

      <SurfaceCard gap={6} noPadding style={styles.section}>
        <View style={styles.sectionPadding}>
          <Text style={styles.sectionEyebrow}>Discovery</Text>
        </View>
        <NavCard icon="✦" title="Discovery Settings" subtitle="Age range, distance, gender, intents, deal breakers" accent="violet" onPress={() => router.push("/(app)/settings/discovery")} />
      </SurfaceCard>

      <SurfaceCard gap={6} noPadding style={styles.section}>
        <View style={styles.sectionPadding}>
          <Text style={styles.sectionEyebrow}>Communication</Text>
        </View>
        <NavCard icon="♼" title="Notifications" subtitle="Match, message, like, profile alerts" accent="ember" onPress={() => router.push("/(app)/settings/notifications")} />
      </SurfaceCard>

      <SurfaceCard gap={6} noPadding style={styles.section}>
        <View style={styles.sectionPadding}>
          <Text style={styles.sectionEyebrow}>Trust & Safety</Text>
        </View>
        <NavCard icon="⛑" title="Privacy & Safety" subtitle="Block, report, data controls" accent="teal" onPress={() => router.push("/(app)/settings/privacy-safety")} />
      </SurfaceCard>

      <SurfaceCard gap={6} noPadding style={styles.section}>
        <View style={styles.sectionPadding}>
          <Text style={styles.sectionEyebrow}>More</Text>
        </View>
        <NavCard icon="♦" title="Subscription" subtitle="Your plan" accent="gold" onPress={() => router.push("/(app)/settings/subscription")} />
        <NavCard icon="❓" title="Support" subtitle="Help, FAQ, feedback" accent="violet" onPress={() => router.push("/(app)/settings/support")} />
        <NavCard icon="⚙" title="App Preferences" subtitle="Haptic, animations, sounds, language" accent="violet" onPress={() => router.push("/(app)/settings/preferences")} />
        <NavCard icon="◉" title="About Freeborn" subtitle="Version, terms, privacy policy" accent="teal" onPress={() => router.push("/(app)/settings/about")} />
      </SurfaceCard>
    </DetailScreenShell>
  );
}

const styles = StyleSheet.create({
  section: { padding: 0 },
  sectionPadding: { paddingHorizontal: 18, paddingTop: 16, paddingBottom: 4 },
  sectionEyebrow: { color: colors.sand, fontSize: 10, fontWeight: "900", textTransform: "uppercase", letterSpacing: 2.4 },
});
