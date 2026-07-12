import { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { colors, type UserProfileRow } from "@freeborn/shared";
import { DetailScreenShell } from "@/components/ui/detail-screen-shell";
import { SurfaceCard } from "@/components/ui/surface-card";
import { SectionHeader } from "@/components/ui/section-header";
import { SaveActionBar } from "@/components/ui/save-action-bar";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";

export default function EditProfileScreen() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfileRow | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<{ tone: "success" | "error"; message: string } | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from("user_profiles").select("*").eq("id", user.id).maybeSingle<UserProfileRow>();
    setProfile(data ?? null);
    setDisplayName(data?.display_name ?? "");
    setBio(data?.bio ?? "");
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!user) return;
    setNotice(null);
    if (displayName.trim().length < 2) { setNotice({ tone: "error", message: "Use at least two characters for your display name." }); return; }
    if (bio.trim().length > 0 && bio.trim().length < 20) { setNotice({ tone: "error", message: "A good bio is at least 20 characters." }); return; }
    setSaving(true);
    const { error } = await supabase.from("user_profiles").update({
      display_name: displayName.trim(),
      bio: bio.trim() || null,
      updated_at: new Date().toISOString(),
    }).eq("id", user.id);
    if (error) { setNotice({ tone: "error", message: "We couldn't save your profile. Please try again." }); }
    else { setNotice({ tone: "success", message: "Profile saved." }); await load(); }
    setSaving(false);
  };

  return (
    <DetailScreenShell title="Edit Profile" subtitle="Your story, well-told">
      {loading ? null : (
        <>
          <SurfaceCard>
            <SectionHeader eyebrow="Identity" title="How Freeborn introduces you" />
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Display name</Text>
              <TextInput value={displayName} onChangeText={setDisplayName} placeholder="How should Freeborn introduce you?" placeholderTextColor="rgba(154,161,184,0.42)" style={styles.input} />
            </View>
          </SurfaceCard>

          <SurfaceCard>
            <SectionHeader eyebrow="Bio" title="Your voice" body="A specific, warm introduction helps the right people recognize you." />
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Bio</Text>
              <TextInput value={bio} onChangeText={v => setBio(v.slice(0, 500))} placeholder="Tell your story…" placeholderTextColor="rgba(154,161,184,0.42)" multiline textAlignVertical="top" style={[styles.input, styles.textarea]} />
              <Text style={styles.counter}>{bio.length} / 500</Text>
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
  textarea: { minHeight: 128, lineHeight: 21 },
  counter: { alignSelf: "flex-end", color: colors.ash, fontSize: 10, fontWeight: "700", letterSpacing: 0.8 },
});
