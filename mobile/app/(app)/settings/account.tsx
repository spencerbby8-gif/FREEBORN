import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, type UserProfileRow } from "@freeborn/shared";
import { DetailScreenShell } from "@/components/ui/detail-screen-shell";
import { SurfaceCard } from "@/components/ui/surface-card";
import { SectionHeader } from "@/components/ui/section-header";
import { useAuth } from "@/hooks/use-auth";
import { useProfileData, humanize } from "@/hooks/use-profile-data";

function InfoRow({ label, value, accent }: { label: string; value: string; accent?: "success" | "gold" | "muted" }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, accent === "success" && styles.successText, accent === "gold" && styles.goldText]}>{value}</Text>
    </View>
  );
}

export default function AccountSettingsScreen() {
  const { user, signOut } = useAuth();
  const { profile } = useProfileData();

  return (
    <DetailScreenShell title="Account" subtitle="Manage your access">
      <SurfaceCard gap={0}>
        <View style={styles.padding}>
          <SectionHeader eyebrow="Private details" title="Only you can see this" body="These are used for access and status, never discovery." />
        </View>
        <InfoRow label="Email" value={user?.email ?? "Not available"} />
        <InfoRow label="Auth providers" value={(profile?.auth_providers ?? []).join(", ") || "Email"} />
        <InfoRow label="Verification" value={profile?.is_verified ? "Verified" : "Not verified yet"} accent={profile?.is_verified ? "success" : "gold"} />
        <InfoRow label="Profile status" value={humanize(profile?.profile_status)} />
        <InfoRow label="Onboarding" value={humanize(profile?.onboarding_stage)} />
        <InfoRow label="Member since" value={profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "—"} />
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
  padding: { paddingHorizontal: 0 },
  infoRow: { borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.05)", paddingVertical: 14, flexDirection: "row", justifyContent: "space-between", gap: 14 },
  infoLabel: { color: colors.mist, fontSize: 12, fontWeight: "800" },
  infoValue: { color: colors.pearl, fontSize: 12, fontWeight: "900", textAlign: "right", flex: 1 },
  successText: { color: colors.success },
  goldText: { color: colors.gold300 },
  signOutBtn: { borderRadius: 20, borderWidth: 1, borderColor: "rgba(255,107,122,0.20)", backgroundColor: "rgba(255,107,122,0.06)", paddingVertical: 14, alignItems: "center" },
  signOutText: { color: colors.danger, fontSize: 13, fontWeight: "900" },
});
