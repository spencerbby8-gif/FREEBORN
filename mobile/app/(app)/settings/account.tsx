import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, type UserProfileRow } from "@freeborn/shared";
import { DetailScreenShell } from "@/components/ui/detail-screen-shell";
import { SurfaceCard } from "@/components/ui/surface-card";
import { SectionHeader } from "@/components/ui/section-header";
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

export default function AccountSettingsScreen() {
  const { user, signOut } = useAuth();
  const { profile, loading } = useProfileData();

  if (loading) {
    return (
      <DetailScreenShell title="Account" subtitle="Manage your access">
        <SettingsSkeleton />
      </DetailScreenShell>
    );
  }

  return (
    <DetailScreenShell title="Account" subtitle="Manage your access">
      <SurfaceCard gap={0}>
        <View style={styles.padding}>
          <SectionHeader eyebrow="Private details" title="Only you can see this" body="These are used for access and status, never discovery." />
        </View>
        <InfoRow label="Email" value={user?.email ?? "Not available"} caption="Only you can see this" />
        <InfoRow label="Verification" value={profile?.is_verified ? "Verified" : "Not verified yet"} accent={profile?.is_verified ? "success" : "gold"} />
        <InfoRow label="Profile status" value={humanize(profile?.profile_status)} />
        <InfoRow label="Onboarding" value={humanize(profile?.onboarding_stage)} />
        <InfoRow label="Member since" value={profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "—"} />
        <InfoRow label="Last active" value={profile?.last_active_at ? new Date(profile.last_active_at).toLocaleDateString() : "—"} />
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeader eyebrow="Session" title="Sign out" body="This will end your current session. You can sign back in anytime." />
        <Pressable onPress={signOut} style={styles.signOutBtn}>
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>
      </SurfaceCard>
    </DetailScreenShell>
  );
}

const styles = StyleSheet.create({
  loadingBox: { alignItems: "center", gap: 12, paddingVertical: 32 },
  loadingText: { color: colors.mist, fontSize: 13, fontWeight: "700" },
  padding: { paddingHorizontal: 0 },
  infoRow: { borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.05)", paddingVertical: 14, paddingHorizontal: 0, gap: 2 },
  infoLabel: { color: colors.mist, fontSize: 12, fontWeight: "800" },
  infoValue: { color: colors.pearl, fontSize: 12, fontWeight: "900", flex: 1 },
  infoCaption: { color: colors.ash, fontSize: 10, fontWeight: "600", marginTop: 1 },
  successText: { color: colors.success },
  goldText: { color: colors.gold300 },
  signOutBtn: { borderRadius: 20, borderWidth: 1, borderColor: "rgba(255,107,122,0.20)", backgroundColor: "rgba(255,107,122,0.06)", paddingVertical: 14, alignItems: "center" },
  signOutText: { color: colors.danger, fontSize: 13, fontWeight: "900" },
});
