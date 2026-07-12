import { useCallback, useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { colors, genderOptions, relationshipGoalOptions, type UserProfileRow, type DiscoveryPreferencesRow } from "@freeborn/shared";
import { DetailScreenShell } from "@/components/ui/detail-screen-shell";
import { SurfaceCard } from "@/components/ui/surface-card";
import { SectionHeader } from "@/components/ui/section-header";
import { SaveActionBar } from "@/components/ui/save-action-bar";
import { ToggleRow } from "@/components/ui/toggle-row";
import { SettingsSkeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { humanize } from "@/hooks/use-profile-data";

function GenderChip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.genderChip, selected && styles.genderChipActive]}
      hitSlop={4}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
    >
      <Text style={[styles.genderChipText, selected && styles.genderChipTextActive]}>{label}</Text>
    </Pressable>
  );
}

function IntentChip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.intentChip, selected && styles.intentChipActive]}
      hitSlop={4}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
    >
      <Text style={[styles.intentChipText, selected && styles.intentChipTextActive]}>{label}</Text>
    </Pressable>
  );
}

export default function DiscoverySettingsScreen() {
  const { user } = useAuth();
  const [ageMin, setAgeMin] = useState("22");
  const [ageMax, setAgeMax] = useState("45");
  const [distance, setDistance] = useState("80");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [photosRequired, setPhotosRequired] = useState(true);
  const [discoverable, setDiscoverable] = useState(true);
  const [dealBreakerStrict, setDealBreakerStrict] = useState(true);
  const [showGenders, setShowGenders] = useState<string[]>(["woman", "man", "non_binary"]);
  const [relationshipIntents, setRelationshipIntents] = useState<string[]>(["long_term", "meaningful_connection", "life_partner"]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<{ tone: "success" | "error"; message: string } | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from("user_profiles").select("*").eq("id", user.id).maybeSingle<UserProfileRow>();
    setAgeMin(String(data?.age_min_preference ?? 22));
    setAgeMax(String(data?.age_max_preference ?? 45));
    setDistance(String(data?.max_distance_km ?? 80));
    setDiscoverable(data?.discoverable ?? true);

    // Load from discovery_preferences table
    const { data: dp } = await supabase.from("discovery_preferences").select("*").eq("user_id", user.id).maybeSingle<DiscoveryPreferencesRow>();
    if (dp) {
      setVerifiedOnly(dp.verified_only);
      setPhotosRequired(dp.photos_required);
      setDealBreakerStrict(dp.deal_breaker_strict);
      if (dp.show_genders?.length > 0) setShowGenders(dp.show_genders);
      if (dp.relationship_intents?.length > 0) setRelationshipIntents(dp.relationship_intents);
      setAgeMin(String(dp.age_min));
      setAgeMax(String(dp.age_max));
      setDistance(String(dp.distance_km));
    }

    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const toggleGender = (value: string) => {
    setShowGenders(prev => prev.includes(value) ? prev.filter(g => g !== value) : [...prev, value]);
  };

  const toggleIntent = (value: string) => {
    setRelationshipIntents(prev => prev.includes(value) ? prev.filter(i => i !== value) : [...prev, value]);
  };

  const save = async () => {
    if (!user) return;
    setNotice(null);

    const minAge = Number(ageMin) || 18;
    const maxAge = Number(ageMax) || 99;
    const dist = Number(distance) || 80;

    if (minAge < 18) { setNotice({ tone: "error", message: "Minimum age must be at least 18." }); return; }
    if (maxAge < minAge) { setNotice({ tone: "error", message: "Maximum age must be at least the minimum age." }); return; }
    if (dist < 5 || dist > 500) { setNotice({ tone: "error", message: "Distance must be between 5 and 500 km." }); return; }

    setSaving(true);

    // Update user_profiles
    const { error: profileError } = await supabase.from("user_profiles").update({
      age_min_preference: minAge,
      age_max_preference: maxAge,
      max_distance_km: dist,
      discoverable,
      updated_at: new Date().toISOString(),
    }).eq("id", user.id);

    if (profileError) {
      setNotice({ tone: "error", message: "Could not save. Please try again." });
      setSaving(false);
      return;
    }

    // Upsert discovery_preferences
    const { error: dpError } = await supabase.from("discovery_preferences").upsert({
      user_id: user.id,
      age_min: minAge,
      age_max: maxAge,
      distance_km: dist,
      show_genders: showGenders,
      relationship_intents: relationshipIntents,
      deal_breaker_strict: dealBreakerStrict,
      verified_only: verifiedOnly,
      photos_required: photosRequired,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });

    if (dpError) {
      setNotice({ tone: "error", message: "Could not save discovery filters. Please try again." });
    } else {
      setNotice({ tone: "success", message: "Discovery settings saved. Your next feed will reflect these boundaries." });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <DetailScreenShell title="Discovery Settings" subtitle="Who you see">
        <SettingsSkeleton />
        <SettingsSkeleton />
        <SettingsSkeleton />
      </DetailScreenShell>
    );
  }

  return (
    <DetailScreenShell title="Discovery Settings" subtitle="Who you see">
      {/* Visibility & trust */}
      <SurfaceCard>
        <SectionHeader eyebrow="Visibility" title="Discovery status" body="When visibility is off, your profile stops appearing in discovery while your account stays intact." />
        <ToggleRow
          title="Discoverable"
          body={discoverable ? "People who match your filters can find you." : "You're hidden from discovery."}
          value={discoverable}
          onValueChange={setDiscoverable}
        />
        <ToggleRow
          title="Verified only"
          body="Only show profiles that have been verified."
          value={verifiedOnly}
          onValueChange={setVerifiedOnly}
        />
        <ToggleRow
          title="Photos required"
          body="Only show profiles with at least one photo."
          value={photosRequired}
          onValueChange={setPhotosRequired}
        />
      </SurfaceCard>

      {/* Age range */}
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
        <Text style={styles.rangeHint}>Must be 18 or older. Max range: 18–99.</Text>
      </SurfaceCard>

      {/* Distance */}
      <SurfaceCard>
        <SectionHeader eyebrow="Distance" title="Maximum distance" body="How far Freeborn should look for values-aligned people." />
        <View style={styles.distanceRow}>
          <TextInput value={distance} onChangeText={setDistance} keyboardType="number-pad" style={styles.distanceInput} />
          <Text style={styles.distanceUnit}>km</Text>
        </View>
        <Text style={styles.rangeHint}>Range: 5–500 km.</Text>
      </SurfaceCard>

      {/* Who appears: gender */}
      <SurfaceCard>
        <SectionHeader eyebrow="Who appears" title="Show genders" body="Choose which genders appear in your discovery feed." />
        <View style={styles.chipGrid}>
          {genderOptions.map(opt => (
            <GenderChip
              key={opt.value}
              label={opt.label}
              selected={showGenders.includes(opt.value)}
              onPress={() => toggleGender(opt.value)}
            />
          ))}
        </View>
        {showGenders.length === 0 && (
          <Text style={styles.chipWarning}>Select at least one gender to see profiles.</Text>
        )}
      </SurfaceCard>

      {/* Intentions */}
      <SurfaceCard>
        <SectionHeader eyebrow="Intentions" title="Relationship intents" body="Only show people looking for these relationship directions." />
        <View style={styles.chipGrid}>
          {relationshipGoalOptions.map(opt => (
            <IntentChip
              key={opt.value}
              label={opt.label}
              selected={relationshipIntents.includes(opt.value)}
              onPress={() => toggleIntent(opt.value)}
            />
          ))}
        </View>
        {relationshipIntents.length === 0 && (
          <Text style={styles.chipWarning}>Select at least one intent to see profiles.</Text>
        )}
      </SurfaceCard>

      {/* Boundaries */}
      <SurfaceCard>
        <SectionHeader eyebrow="Boundaries" title="Deal breaker enforcement" body="When strict, profiles with your deal breakers won't appear in discovery." />
        <ToggleRow
          title="Strict deal breakers"
          body={dealBreakerStrict ? "Profiles with your deal breakers are filtered out." : "Deal breakers are shown as warnings, not filters."}
          value={dealBreakerStrict}
          onValueChange={setDealBreakerStrict}
        />
      </SurfaceCard>

      <SaveActionBar onSave={save} saving={saving} notice={notice} label="Save discovery settings" />
    </DetailScreenShell>
  );
}

const styles = StyleSheet.create({
  rangeRow: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 12 },
  rangeField: { flex: 1, gap: 6 },
  rangeLabel: { color: colors.sand, fontSize: 10, fontWeight: "900", textTransform: "uppercase", letterSpacing: 1.6 },
  rangeInput: { borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", backgroundColor: "rgba(255,255,255,0.04)", color: colors.pearl, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, fontWeight: "700", textAlign: "center", minHeight: 50 },
  rangeDash: { color: colors.ash, fontSize: 18, fontWeight: "700", marginTop: 18 },
  rangeHint: { color: colors.ash, fontSize: 11, fontWeight: "700", marginTop: 8 },
  distanceRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 12 },
  distanceInput: { flex: 1, borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", backgroundColor: "rgba(255,255,255,0.04)", color: colors.pearl, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, fontWeight: "700", minHeight: 50 },
  distanceUnit: { color: colors.mist, fontSize: 14, fontWeight: "700" },
  chipGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  genderChip: { borderRadius: 999, borderWidth: 1, borderColor: "rgba(255,255,255,0.10)", backgroundColor: "rgba(255,255,255,0.04)", paddingHorizontal: 14, paddingVertical: 9, minHeight: 36, justifyContent: "center" },
  genderChipActive: { borderColor: "rgba(246,215,154,0.30)", backgroundColor: "rgba(217,167,82,0.12)" },
  genderChipText: { color: colors.mist, fontSize: 12, fontWeight: "700" },
  genderChipTextActive: { color: colors.gold300, fontWeight: "900" },
  intentChip: { borderRadius: 999, borderWidth: 1, borderColor: "rgba(255,255,255,0.10)", backgroundColor: "rgba(255,255,255,0.04)", paddingHorizontal: 14, paddingVertical: 9, minHeight: 36, justifyContent: "center" },
  intentChipActive: { borderColor: "rgba(200,185,255,0.30)", backgroundColor: "rgba(138,110,242,0.12)" },
  intentChipText: { color: colors.mist, fontSize: 12, fontWeight: "700" },
  intentChipTextActive: { color: colors.violet300, fontWeight: "900" },
  chipWarning: { color: colors.ember500, fontSize: 12, fontWeight: "700", marginTop: 8 },
});
