import { useCallback, useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { colors, genderOptions, type UserProfileRow } from "@freeborn/shared";
import { DetailScreenShell } from "@/components/ui/detail-screen-shell";
import { SurfaceCard } from "@/components/ui/surface-card";
import { SectionHeader } from "@/components/ui/section-header";
import { SaveActionBar } from "@/components/ui/save-action-bar";
import { DetailSkeleton } from "@/components/ui/skeleton";
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
  const [bio, setBio] = useState("");
  const [displayName, setDisplayName] = useState("");
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
    setBio(data?.bio ?? "");
    setDisplayName(data?.display_name ?? "");
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!user) return;
    setNotice(null);
    if (displayName.trim().length < 2) { setNotice({ tone: "error", message: "Use at least two characters for your display name." }); return; }
    if (bio.trim().length > 0 && bio.trim().length < 20) { setNotice({ tone: "error", message: "A good bio is at least 20 characters." }); return; }
    if (city.trim().length < 1) { setNotice({ tone: "error", message: "Add your city so discovery can stay practical." }); return; }
    setSaving(true);
    const { error } = await supabase.from("user_profiles").update({
      display_name: displayName.trim(),
      bio: bio.trim() || null,
      gender: gender || null,
      city: city.trim(),
      region: region.trim() || null,
      country_code: countryCode.trim() || null,
      occupation: occupation.trim() || null,
      education: education.trim() || null,
      height_cm: heightCm ? Number(heightCm) : null,
      updated_at: new Date().toISOString(),
    }).eq("id", user.id);
    if (error) { setNotice({ tone: "error", message: "Could not save. Please try again." }); }
    else { setNotice({ tone: "success", message: "Profile saved." }); await load(); }
    setSaving(false);
  };

  if (loading) {
    return (
      <DetailScreenShell title="About Me" subtitle="Who you are and where">
        <DetailSkeleton />
        <DetailSkeleton />
        <DetailSkeleton />
        <DetailSkeleton />
      </DetailScreenShell>
    );
  }

  return (
    <DetailScreenShell title="About Me" subtitle="Who you are and where">
      <SurfaceCard>
        <SectionHeader eyebrow="Identity" title="How Freeborn introduces you" body="Display name and bio are the first things people read." />
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Display name</Text>
          <TextInput value={displayName} onChangeText={setDisplayName} placeholder="How should Freeborn introduce you?" placeholderTextColor="rgba(154,161,184,0.42)" style={styles.input} />
        </View>
        <View style={styles.fieldGroup}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Bio</Text>
            <Text style={styles.counter}>{bio.length} / 500</Text>
          </View>
          <TextInput value={bio} onChangeText={v => setBio(v.slice(0, 500))} placeholder="Tell your story… A specific, warm introduction helps the right people recognize you." placeholderTextColor="rgba(154,161,184,0.38)" multiline textAlignVertical="top" style={[styles.input, styles.textarea]} />
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeader eyebrow="Identity" title="How you describe yourself" body="Gender and height are visible on your public profile." />
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Gender</Text>
          <View style={styles.chipGrid}>
            {genderOptions.map(opt => (
              <Pressable
                key={opt.value}
                onPress={() => setGender(opt.value === gender ? "" : opt.value)}
                style={[styles.genderChip, gender === opt.value && styles.genderChipActive]}
              >
                <Text style={[styles.genderChipText, gender === opt.value && styles.genderChipTextActive]}>{opt.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Height (cm)</Text>
          <TextInput value={heightCm} onChangeText={setHeightCm} placeholder="Optional" placeholderTextColor="rgba(154,161,184,0.42)" keyboardType="number-pad" style={styles.input} />
          <Text style={styles.hint}>Height is visible on your public profile.</Text>
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

      <SaveActionBar onSave={save} saving={saving} notice={notice} label="Save profile" />
    </DetailScreenShell>
  );
}

const styles = StyleSheet.create({
  loadingBox: { alignItems: "center", gap: 12, paddingVertical: 32 },
  loadingText: { color: colors.mist, fontSize: 13, fontWeight: "700" },
  fieldGroup: { gap: 7 },
  label: { color: colors.sand, fontSize: 10, fontWeight: "900", textTransform: "uppercase", letterSpacing: 1.6 },
  labelRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  counter: { color: colors.ash, fontSize: 10, fontWeight: "700", letterSpacing: 0.8 },
  hint: { color: colors.ash, fontSize: 11, fontWeight: "600", marginTop: 2 },
  input: { minHeight: 50, borderRadius: 18, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", backgroundColor: "rgba(255,255,255,0.04)", color: colors.pearl, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, fontWeight: "700" },
  textarea: { minHeight: 128, lineHeight: 21 },
  chipGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
  genderChip: { borderRadius: 999, borderWidth: 1, borderColor: "rgba(255,255,255,0.10)", backgroundColor: "rgba(255,255,255,0.04)", paddingHorizontal: 14, paddingVertical: 9 },
  genderChipActive: { borderColor: "rgba(246,215,154,0.30)", backgroundColor: "rgba(217,167,82,0.12)" },
  genderChipText: { color: colors.mist, fontSize: 12, fontWeight: "700" },
  genderChipTextActive: { color: colors.gold300, fontWeight: "900" },
});
