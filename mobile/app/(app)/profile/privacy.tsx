import { useCallback, useEffect, useState } from "react";
import { StyleSheet, Switch, Text, View } from "react-native";
import { colors, type UserProfileRow } from "@freeborn/shared";
import { DetailScreenShell } from "@/components/ui/detail-screen-shell";
import { SurfaceCard } from "@/components/ui/surface-card";
import { SectionHeader } from "@/components/ui/section-header";
import { SaveActionBar } from "@/components/ui/save-action-bar";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";

export default function PrivacyScreen() {
  const { user } = useAuth();
  const [discoverable, setDiscoverable] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<{ tone: "success" | "error"; message: string } | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from("user_profiles").select("*").eq("id", user.id).maybeSingle<UserProfileRow>();
    setDiscoverable(data?.discoverable ?? true);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!user) return;
    setNotice(null);
    setSaving(true);
    const { error } = await supabase.from("user_profiles").update({
      discoverable,
      updated_at: new Date().toISOString(),
    }).eq("id", user.id);
    if (error) { setNotice({ tone: "error", message: "Could not save. Please try again." }); }
    else { setNotice({ tone: "success", message: discoverable ? "You're now visible in discovery." : "You're now hidden from discovery. Your account stays intact." }); }
    setSaving(false);
  };

  return (
    <DetailScreenShell title="Privacy & Visibility" subtitle="Control how people find you">
      {loading ? null : (
        <>
          <SurfaceCard>
            <SectionHeader eyebrow="Visibility" title="Discovery status" body="When visibility is off, your profile stops appearing in discovery while your account stays intact." />
            <View style={styles.switchCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.switchTitle}>Visible in discovery</Text>
                <Text style={styles.switchBody}>
                  {discoverable ? "People who match your filters can see your public profile." : "Your profile is hidden. You can still browse and message existing matches."}
                </Text>
              </View>
              <Switch
                value={discoverable}
                onValueChange={setDiscoverable}
                trackColor={{ false: "rgba(255,255,255,0.12)", true: colors.gold500 }}
                thumbColor={colors.pearl}
              />
            </View>
          </SurfaceCard>

          <SurfaceCard>
            <SectionHeader eyebrow="Privacy" title="What stays hidden" body="Freeborn keeps your private essentials out of public view." />
            <View style={styles.privacyRow}>
              <Text style={styles.privacyIcon}>✓</Text>
              <Text style={styles.privacyLabel}>Email — never shown publicly</Text>
            </View>
            <View style={styles.privacyRow}>
              <Text style={styles.privacyIcon}>✓</Text>
              <Text style={styles.privacyLabel}>Full birth date — only used for age gating</Text>
            </View>
            <View style={styles.privacyRow}>
              <Text style={styles.privacyIcon}>✓</Text>
              <Text style={styles.privacyLabel}>Account provider details — never exposed</Text>
            </View>
            <View style={styles.privacyRow}>
              <Text style={styles.privacyIcon}>✓</Text>
              <Text style={styles.privacyLabel}>Last name — never shown publicly</Text>
            </View>
          </SurfaceCard>

          <SaveActionBar onSave={save} saving={saving} notice={notice} label={discoverable ? "Stay visible" : "Go hidden"} />
        </>
      )}
    </DetailScreenShell>
  );
}

const styles = StyleSheet.create({
  switchCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.025)",
    padding: 16,
  },
  switchTitle: { color: colors.pearl, fontSize: 14, fontWeight: "900" },
  switchBody: { color: colors.mist, fontSize: 12, lineHeight: 18, marginTop: 3 },
  privacyRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8 },
  privacyIcon: { color: colors.teal300, fontSize: 14, fontWeight: "900" },
  privacyLabel: { color: colors.pearl, fontSize: 13, fontWeight: "700", flex: 1 },
});
