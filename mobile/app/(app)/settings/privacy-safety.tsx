import { useCallback, useEffect, useState } from "react";
import { Alert, Linking, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { colors, type BlockedUserRow, type UserProfileRow } from "@freeborn/shared";
import { DetailScreenShell } from "@/components/ui/detail-screen-shell";
import { SurfaceCard } from "@/components/ui/surface-card";
import { SectionHeader } from "@/components/ui/section-header";
import { EmptyState } from "@/components/ui/empty-state";
import { SaveActionBar } from "@/components/ui/save-action-bar";
import { SettingsSkeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { initials, humanize } from "@/hooks/use-profile-data";

export default function PrivacySafetyScreen() {
  const { user } = useAuth();
  const [blockedUsers, setBlockedUsers] = useState<BlockedUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [blocking, setBlocking] = useState(false);
  const [blockInput, setBlockInput] = useState("");
  const [notice, setNotice] = useState<{ tone: "success" | "error"; message: string } | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("blocked_users")
      .select("*")
      .eq("blocker_id", user.id)
      .order("created_at", { ascending: false });
    setBlockedUsers((data as BlockedUserRow[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const unblockUser = async (blockedId: string) => {
    if (!user) return;
    const { error } = await supabase
      .from("blocked_users")
      .delete()
      .eq("blocker_id", user.id)
      .eq("blocked_id", blockedId);
    if (error) {
      setNotice({ tone: "error", message: "Could not unblock. Please try again." });
    } else {
      setNotice({ tone: "success", message: "User unblocked. They can now see your profile in discovery." });
      await load();
    }
  };

  const confirmUnblock = (blockedId: string) => {
    Alert.alert(
      "Unblock user",
      "This person will be able to see your profile in discovery again. They will not be notified.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Unblock", onPress: () => unblockUser(blockedId) },
      ]
    );
  };

  const handleBlockUser = async () => {
    if (!user || !blockInput.trim()) return;
    setBlocking(true);
    setNotice(null);

    // Look up the user by display_name or handle (simplified)
    const { data: target } = await supabase
      .from("user_profiles")
      .select("id, display_name")
      .or(`display_name.ilike.%${blockInput.trim()}%,handle.ilike.%${blockInput.trim()}%`)
      .neq("id", user.id)
      .limit(1)
      .maybeSingle();

    if (!target) {
      setNotice({ tone: "error", message: "No profile found with that name. Check the spelling and try again." });
      setBlocking(false);
      return;
    }

    // Check if already blocked
    const alreadyBlocked = blockedUsers.some(b => b.blocked_id === target.id);
    if (alreadyBlocked) {
      setNotice({ tone: "error", message: "This user is already blocked." });
      setBlocking(false);
      return;
    }

    const { error } = await supabase.from("blocked_users").insert({
      blocker_id: user.id,
      blocked_id: target.id,
      reason: "Manual block from privacy settings",
    });

    if (error) {
      setNotice({ tone: "error", message: "Could not block user. Please try again." });
    } else {
      setNotice({ tone: "success", message: `${target.display_name ?? "User"} blocked. They can no longer see your profile.` });
      setBlockInput("");
      await load();
    }
    setBlocking(false);
  };

  const handleReport = () => {
    Alert.alert(
      "Report a concern",
      "If you experience harassment, abuse, or a safety issue, please contact our support team directly. Reports are reviewed promptly.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Contact support", onPress: () => {
          Linking.openURL("mailto:support@freeborn.app?subject=Safety%20Report%20-%20Freeborn&body=Please%20describe%20your%20concern%20below%3A%0A%0A").catch(() => {
            Alert.alert("Could not open email", "Please email support@freeborn.app directly with your safety concern.");
          });
        }},
      ]
    );
  };

  if (loading) {
    return (
      <DetailScreenShell title="Privacy & Safety" subtitle="How we protect you">
        <SettingsSkeleton />
        <SettingsSkeleton />
      </DetailScreenShell>
    );
  }

  return (
    <DetailScreenShell title="Privacy & Safety" subtitle="How we protect you">
      {/* Data privacy */}
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

      {/* Community standards */}
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

      {/* Block */}
      <SurfaceCard>
        <SectionHeader eyebrow="Block" title="Block a member" body="Blocked members cannot see your profile or send you messages. They are not notified." />
        <View style={styles.blockInputRow}>
          <TextInput
            value={blockInput}
            onChangeText={setBlockInput}
            placeholder="Enter display name or handle"
            placeholderTextColor="rgba(154,161,184,0.38)"
            style={styles.blockInput}
            autoCapitalize="none"
          />
          <Pressable onPress={blocking ? undefined : handleBlockUser} style={[styles.blockBtn, blocking && styles.blockBtnDisabled]} disabled={blocking} accessibilityRole="button" accessibilityLabel="Block user">
            <Text style={styles.blockBtnText}>
              {blocking ? "Blocking…" : "Block"}
            </Text>
          </Pressable>
        </View>

        {/* Blocked users list */}
        {blockedUsers.length > 0 ? (
          <View style={styles.blockedList}>
            <Text style={styles.blockedEyebrow}>BLOCKED MEMBERS</Text>
            {blockedUsers.map(b => (
              <View key={b.id} style={styles.blockedRow}>
                <View style={styles.blockedAvatar}>
                  <Text style={styles.blockedAvatarText}>?</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.blockedName}>Blocked user</Text>
                  <Text style={styles.blockedDate}>Blocked {new Date(b.created_at).toLocaleDateString()}</Text>
                </View>
                <Pressable onPress={() => confirmUnblock(b.blocked_id)} style={styles.unblockBtn} accessibilityRole="button" accessibilityLabel="Unblock user">
                  <Text style={styles.unblockBtnText}>Unblock</Text>
                </Pressable>
              </View>
            ))}
          </View>
        ) : null}
      </SurfaceCard>

      {/* Report */}
      <SurfaceCard>
        <SectionHeader eyebrow="Report" title="Report a concern" body="If you experience harassment, abuse, or a safety issue, contact our support team directly." />
        <Pressable onPress={handleReport} style={styles.reportBtn} accessibilityRole="button" accessibilityLabel="Contact support about a safety concern">
          <Text style={styles.reportBtnText}>Contact support about a safety concern</Text>
        </Pressable>
      </SurfaceCard>

      {notice && (
        <View style={[styles.notice, notice.tone === "success" ? styles.noticeSuccess : styles.noticeError]}>
          <Text style={styles.noticeIcon}>{notice.tone === "success" ? "✓" : "!"}</Text>
          <Text style={styles.noticeText}>{notice.message}</Text>
        </View>
      )}
    </DetailScreenShell>
  );
}

const styles = StyleSheet.create({
  loadingBox: { alignItems: "center", gap: 12, paddingVertical: 32 },
  loadingText: { color: colors.mist, fontSize: 13, fontWeight: "700" },
  row: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8 },
  rowIcon: { color: colors.teal300, fontSize: 14, fontWeight: "900" },
  rowLabel: { color: colors.pearl, fontSize: 13, fontWeight: "700", flex: 1 },
  safetyItem: { gap: 4, paddingVertical: 6 },
  safetyTitle: { color: colors.pearl, fontSize: 14, fontWeight: "900" },
  safetyBody: { color: colors.mist, fontSize: 13, lineHeight: 20 },
  blockInputRow: { flexDirection: "row", gap: 10, marginTop: 8 },
  blockInput: {
    flex: 1,
    minHeight: 50,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.04)",
    color: colors.pearl,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: "700",
  },
  blockBtn: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,107,122,0.20)",
    backgroundColor: "rgba(255,107,122,0.06)",
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  blockBtnText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: "900",
  },
  blockBtnDisabled: { opacity: 0.4 },
  blockedList: { marginTop: 16, gap: 0 },
  blockedEyebrow: { color: colors.sand, fontSize: 10, fontWeight: "900", textTransform: "uppercase", letterSpacing: 2.4, marginBottom: 8 },
  blockedRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.05)" },
  blockedAvatar: { width: 36, height: 36, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.06)", alignItems: "center", justifyContent: "center" },
  blockedAvatarText: { color: colors.mist, fontSize: 14, fontWeight: "900" },
  blockedName: { color: colors.pearl, fontSize: 13, fontWeight: "800" },
  blockedDate: { color: colors.ash, fontSize: 11, fontWeight: "700", marginTop: 2 },
  unblockBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.10)", backgroundColor: "rgba(255,255,255,0.04)", minHeight: 36, justifyContent: "center" },
  unblockBtnText: { color: colors.mist, fontSize: 12, fontWeight: "900" },
  reportBtn: { paddingVertical: 8 },
  reportBtnText: { color: colors.danger, fontSize: 13, fontWeight: "900" },
  notice: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 20, borderWidth: 1, padding: 16 },
  noticeSuccess: { borderColor: "rgba(109,211,176,0.28)", backgroundColor: "rgba(109,211,176,0.08)" },
  noticeError: { borderColor: "rgba(255,107,122,0.28)", backgroundColor: "rgba(255,107,122,0.08)" },
  noticeIcon: { color: colors.pearl, fontWeight: "900", fontSize: 16 },
  noticeText: { flex: 1, color: colors.pearl, fontSize: 13, lineHeight: 20, fontWeight: "700" },
});
