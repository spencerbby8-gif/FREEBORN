import { useCallback, useEffect, useState } from "react";
import { StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { colors, type UserProfileRow } from "@freeborn/shared";
import { DetailScreenShell } from "@/components/ui/detail-screen-shell";
import { SurfaceCard } from "@/components/ui/surface-card";
import { SectionHeader } from "@/components/ui/section-header";
import { SaveActionBar } from "@/components/ui/save-action-bar";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";

export default function DiscoverySettingsScreen() {
  const { user } = useAuth();
  const [ageMin, setAgeMin] = useState("18");
  const [ageMax, setAgeMax] = useState("55");
  const [distance, setDistance] = useState("50");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [photosRequired, setPhotosRequired] = useState(false);
  const [discoverable, setDiscoverable] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<{ tone: "success" | "error"; message: string } | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from("user_profiles").select("*").eq("id", user.id).maybeSingle<UserProfileRow>();
    setAgeMin(String(data?.age_min_preference ?? 18));
    setAgeMax(String(data?.age_max_preference ?? 55));
    setDistance(String(data?.max_distance_km ?? 50));
    setDiscoverable(data?.discoverable ?? true);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!user) return;
    setNotice(null);
    setSaving(true);
    const { error } = await supabase.from("user_profiles").update({
      age_min_preference: Number(ageMin) || 18,
      age_max_preference: Number(ageMax) || 55,
      max_distance_km: Number(distance) || 50,
      discoverable,
      updated_at: new Date().toISOString(),
    }).eq("id", user.id);
    if (error) { setNotice({ tone: "error", message: "Could not save. Please try again." }); }
    else { setNotice({ tone: "success", message: "Discovery settings saved. Your next feed will reflect these boundaries." }); }
    setSaving(false);
  };

  return (
    <DetailScreenShell title="Discovery Settings" subtitle="Who you see">
      {loading ? null : (
        <>
          <SurfaceCard>
            <SectionHeader eyebrow="Visibility" title="Discovery status" />
            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.switchTitle}>Discoverable</Text>
                <Text style={styles.switchBody}>{discoverable ? "People who match your filters can find you." : "You're hidden from discovery."}</Text>
              </View>
              <Switch value={discoverable} onValueChange={setDiscoverable} trackColor={{ false: "rgba(255,255,255,0.12)", true: colors.gold500 }} thumbColor={colors.pearl} />
            </View>
          </SurfaceCard>

          <SurfaceCard>
            <SectionHeader eyebrow="Preferences" title="Age range" body="Only people within this range will appear in your discovery feed." />
            <View style={styles.rangeRow}>
              <View style={styles.rangeField}>
                <Text style={styles.rangeLabel}>Min age</Text>
                <TextInput value={ageMin} onChangeText={setAgeMin} keyboardType="number-pad" style={styles.rangeInput} />
              </View>
              <Text style={styles.rangeDash}>—</Text>
              <View style={styles.rangeField}>
                <Text style={styles.rangeLabel}>Max age</Text>
                <TextInput value={ageMax} onChangeText={setAgeMax} keyboardType="number-pad" style={styles.rangeInput} />
              </View>
            </View>
          </SurfaceCard>

          <SurfaceCard>
            <SectionHeader eyebrow="Distance" title="Maximum distance" body="How far Freeborn should look for values-aligned people." />
            <View style={styles.distanceRow}>
              <TextInput value={distance} onChangeText={setDistance} keyboardType="number-pad" style={styles.distanceInput} />
              <Text style={styles.distanceUnit}>km</Text>
            </View>
          </SurfaceCard>

          <SurfaceCard>
            <SectionHeader eyebrow="Filters" title="Quality filters" />
            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.switchTitle}>Verified only</Text>
                <Text style={styles.switchBody}>Only show profiles that have been verified.</Text>
              </View>
              <Switch value={verifiedOnly} onValueChange={setVerifiedOnly} trackColor={{ false: "rgba(255,255,255,0.12)", true: colors.gold500 }} thumbColor={colors.pearl} />
            </View>
            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.switchTitle}>Photos required</Text>
                <Text style={styles.switchBody}>Only show profiles with at least one photo.</Text>
              </View>
              <Switch value={photosRequired} onValueChange={setPhotosRequired} trackColor={{ false: "rgba(255,255,255,0.12)", true: colors.gold500 }} thumbColor={colors.pearl} />
            </View>
          </SurfaceCard>

          <SaveActionBar onSave={save} saving={saving} notice={notice} label="Save discovery settings" />
        </>
      )}
    </DetailScreenShell>
  );
}

const styles = StyleSheet.create({
  switchRow: { flexDirection: "row", alignItems: "center", gap: 14, borderRadius: 22, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", backgroundColor: "rgba(255,255,255,0.025)", padding: 16 },
  switchTitle: { color: colors.pearl, fontSize: 14, fontWeight: "900" },
  switchBody: { color: colors.mist, fontSize: 12, lineHeight: 18, marginTop: 3 },
  rangeRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  rangeField: { flex: 1, gap: 6 },
  rangeLabel: { color: colors.sand, fontSize: 10, fontWeight: "900", textTransform: "uppercase", letterSpacing: 1.6 },
  rangeInput: { borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", backgroundColor: "rgba(255,255,255,0.04)", color: colors.pearl, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, fontWeight: "700", textAlign: "center" },
  rangeDash: { color: colors.ash, fontSize: 18, fontWeight: "700", marginTop: 18 },
  distanceRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  distanceInput: { flex: 1, borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", backgroundColor: "rgba(255,255,255,0.04)", color: colors.pearl, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, fontWeight: "700" },
  distanceUnit: { color: colors.mist, fontSize: 14, fontWeight: "700" },
});
