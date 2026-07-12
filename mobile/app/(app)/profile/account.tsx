import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { colors } from "@freeborn/shared";
import { DetailScreenShell } from "@/components/ui/detail-screen-shell";
import { SurfaceCard } from "@/components/ui/surface-card";
import { SectionHeader } from "@/components/ui/section-header";
import { NavCard } from "@/components/ui/nav-card";
import { SettingsSkeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useProfileData, humanize } from "@/hooks/use-profile-data";

function InfoRow({ label, value, caption, accent }: { label: string; value: string; caption?: string; accent?: "success" | "gold" | "muted" }) {
  return (
    <View style={styles.infoRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={[styles.infoValue, accent === "success" && styles.successText, accent === "gold" && styles.goldText]}>{value}</Text>
        {caption ? <Text style={styles.infoCaption}>{caption}</Text> : null}
      </View>
    </View>
  );
}

export default function AccountScreen() {
  const { user, signOut } = useAuth();
  const { profile, loading } = useProfileData();

  if (loading) {
    return (
      <DetailScreenShell title="Account Status" subtitle="Private account details">
        <SettingsSkeleton />
      </DetailScreenShell>
    );
  }

  return (
    <DetailScreenShell title="Account Status" subtitle="Private account details">
      <SurfaceCard gap={0}>
        <View style={styles.padding}>
          <SectionHeader eyebrow="Account" title="Only you can see this" body="These details are used for access and status, never discovery." />
        </View>
        <InfoRow label="Email" value={user?.email ?? "Not available"} caption="Only you can see this" />
        <InfoRow label="Verification" value={profile?.is_verified ? "Verified" : "Not verified yet"} accent={profile?.is_verified ? "success" : "gold"} />
        <InfoRow label="Profile status" value={humanize(profile?.profile_status)} />
        <InfoRow label="Discoverability" value={profile?.discoverable ? "Visible" : "Hidden"} accent={profile?.discoverable ? "success" : "muted"} />
        <InfoRow label="Member since" value={profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "—"} />
        <InfoRow label="Last active" value={profile?.last_active_at ? new Date(profile.last_active_at).toLocaleDateString() : "—"} />
        <View style={styles.padding}>
          <Pressable onPress={signOut} style={styles.signOutBtn}>
            <Text style={styles.signOutText}>Sign out</Text>
          </Pressable>
        </View>
      </SurfaceCard>

      <SurfaceCard gap={6} noPadding style={styles.navCards}>
        <View style={styles.padding}>
          <Text style={styles.navSectionEyebrow}>Settings</Text>
        </View>
        <NavCard icon="⚙" title="Discovery Settings" subtitle="Age range, distance, gender filters" accent="violet" onPress={() => router.push("/(app)/settings/discovery")} />
        <NavCard icon="♼" title="Notifications" subtitle="Match alerts, message alerts" accent="teal" onPress={() => router.push("/(app)/settings/notifications")} />
        <NavCard icon="⛑" title="Privacy & Safety" subtitle="Block, report, data controls" accent="gold" onPress={() => router.push("/(app)/settings/privacy-safety")} />
        <NavCard icon="⚙" title="All Settings" subtitle="Account, preferences, subscription, support" accent="violet" onPress={() => router.push("/(app)/settings")} />
      </SurfaceCard>
    </DetailScreenShell>
  );
}

const styles = StyleSheet.create({
  loadingBox: { alignItems: "center", gap: 12, paddingVertical: 32 },
  loadingText: { color: colors.mist, fontSize: 13, fontWeight: "700" },
  padding: { paddingHorizontal: 20, paddingTop: 0, paddingBottom: 4 },
  infoRow: { borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.05)", paddingVertical: 14, paddingHorizontal: 20, gap: 2 },
  infoLabel: { color: colors.mist, fontSize: 12, fontWeight: "800" },
  infoValue: { color: colors.pearl, fontSize: 12, fontWeight: "900", flex: 1 },
  infoCaption: { color: colors.ash, fontSize: 10, fontWeight: "600", marginTop: 1 },
  successText: { color: colors.success },
  goldText: { color: colors.gold300 },
  signOutBtn: { borderRadius: 20, borderWidth: 1, borderColor: "rgba(255,107,122,0.20)", backgroundColor: "rgba(255,107,122,0.06)", paddingVertical: 14, alignItems: "center" },
  signOutText: { color: colors.danger, fontSize: 13, fontWeight: "900" },
  navCards: { padding: 0 },
  navSectionEyebrow: { color: colors.sand, fontSize: 10, fontWeight: "900", textTransform: "uppercase", letterSpacing: 2.4 },
});
