import { StyleSheet, Switch, Text, View } from "react-native";
import { colors } from "@freeborn/shared";
import { DetailScreenShell } from "@/components/ui/detail-screen-shell";
import { SurfaceCard } from "@/components/ui/surface-card";
import { SectionHeader } from "@/components/ui/section-header";

export default function NotificationsScreen() {
  return (
    <DetailScreenShell title="Notifications" subtitle="Choose what alerts you">
      <SurfaceCard>
        <SectionHeader eyebrow="Matches" title="Match alerts" body="Get notified when someone likes you back." />
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle}>New matches</Text>
            <Text style={styles.rowBody}>When a like becomes mutual.</Text>
          </View>
          <Switch value={true} disabled trackColor={{ false: "rgba(255,255,255,0.12)", true: colors.gold500 }} thumbColor={colors.pearl} />
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeader eyebrow="Messages" title="Message alerts" body="Know when someone reaches out." />
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle}>New messages</Text>
            <Text style={styles.rowBody}>When a match sends you a message.</Text>
          </View>
          <Switch value={true} disabled trackColor={{ false: "rgba(255,255,255,0.12)", true: colors.gold500 }} thumbColor={colors.pearl} />
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeader eyebrow="Profile" title="Profile activity" />
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle}>New likes</Text>
            <Text style={styles.rowBody}>When someone likes your profile.</Text>
          </View>
          <Switch value={true} disabled trackColor={{ false: "rgba(255,255,255,0.12)", true: colors.gold500 }} thumbColor={colors.pearl} />
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeader eyebrow="Coming soon" title="More control" body="Notification preferences will be configurable in a future update. Currently, all important alerts are enabled." />
      </SurfaceCard>
    </DetailScreenShell>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 14, borderRadius: 22, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", backgroundColor: "rgba(255,255,255,0.025)", padding: 16 },
  rowTitle: { color: colors.pearl, fontSize: 14, fontWeight: "900" },
  rowBody: { color: colors.mist, fontSize: 12, lineHeight: 18, marginTop: 3 },
});
