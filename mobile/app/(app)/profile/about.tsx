import { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { colors, type UserProfileRow } from "@freeborn/shared";
import { DetailScreenShell } from "@/components/ui/detail-screen-shell";
import { SurfaceCard } from "@/components/ui/surface-card";
import { SectionHeader } from "@/components/ui/section-header";
import { SaveActionBar } from "@/components/ui/save-action-bar";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";

export default function AboutMeScreen() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfileRow | null>(null);
  const [gender, setGender] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [occupation, setOccupation] = useState("");
  const [education, setEducation] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<{ tone: "success" | "error"; message: string } | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from("user_profiles").select("*").eq("id", user.id).maybeSingle<UserProfileRow>();
    setProfile(data ?? null);
    setGender(data?.gender ?? "");
    setCity(data?.city ?? "");
    setRegion(data?.region ?? "");
    setCountryCode(data?.country_code ?? "");
    setOccupation(data?.occupation ?? "");
    setEducation(data?.education ?? "");
    setHeightCm(data?.height_cm ? String(data.height_cm) : "");
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!user) return;
    setNotice(null);
    if (city.trim().length < 1) { setNotice({ tone: "error", message: "Add your city so discovery can stay practical." }); return; }
    setSaving(true);
    const { error } = await supabase.from("user_profiles").update({
      gender: gender.trim() || null,
      city: city.trim(),
      region: region.trim() || null,
      country_code: countryCode.trim() || null,
      occupation: occupation.trim() || null,
      education: education.trim() || null,
      height_cm: heightCm ? Number(heightCm) : null,
      updated_at: new Date().toISOString(),
    }).eq("id", user.id);
    if (error) { setNotice({ tone: "error", message: "Could not save. Please try again." }); }
    else { setNotice({ tone: "success", message: "About me saved." }); await load(); }
    setSaving(false);
  };

  return (
    <DetailScreenShell title="About Me" subtitle="Who you are and where">
      {loading ? null : (
        <>
          <SurfaceCard>
            <SectionHeader eyebrow="Identity" title="How you describe yourself" body="Gender and height are visible on your public profile." />
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Gender</Text>
              <TextInput value={gender} onChangeText={setGender} placeholder="e.g. Woman, Man, Non-binary" placeholderTextColor="rgba(154,161,184,0.42)" style={styles.input} />
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Height (cm)</Text>
              <TextInput value={heightCm} onChangeText={setHeightCm} placeholder="Optional" placeholderTextColor="rgba(154,161,184,0.42)" keyboardType="number-pad" style={styles.input} />
            </View>
          </SurfaceCard>

          <SurfaceCard>
            <SectionHeader eyebrow="Location" title="Where you are" body="City is required so discovery stays practical." />
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>City</Text>
              <TextInput value={city} onChangeText={setCity} placeholder="Where do you live?" placeholderTextColor="rgba(154,161,184,0.42)" style={styles.input} />
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Region</Text>
              <TextInput value={region} onChangeText={setRegion} placeholder="State, province, or region" placeholderTextColor="rgba(154,161,184,0.42)" style={styles.input} />
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Country code</Text>
              <TextInput value={countryCode} onChangeText={v => setCountryCode(v.toUpperCase())} placeholder="US" placeholderTextColor="rgba(154,161,184,0.42)" maxLength={2} style={styles.input} />
            </View>
          </SurfaceCard>

          <SurfaceCard>
            <SectionHeader eyebrow="Context" title="What you do" body="Optional. Helps people start specific conversations." />
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Occupation</Text>
              <TextInput value={occupation} onChangeText={setOccupation} placeholder="What do you do?" placeholderTextColor="rgba(154,161,184,0.42)" style={styles.input} />
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Education</Text>
              <TextInput value={education} onChangeText={setEducation} placeholder="Where did you study?" placeholderTextColor="rgba(154,161,184,0.42)" style={styles.input} />
            </View>
          </SurfaceCard>

          <SaveActionBar onSave={save} saving={saving} notice={notice} />
        </>
      )}
    </DetailScreenShell>
  );
}

const styles = StyleSheet.create({
  fieldGroup: { gap: 7 },
  label: { color: colors.sand, fontSize: 10, fontWeight: "900", textTransform: "uppercase", letterSpacing: 1.6 },
  input: { minHeight: 50, borderRadius: 18, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", backgroundColor: "rgba(255,255,255,0.04)", color: colors.pearl, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, fontWeight: "700" },
});
