import { useCallback, useEffect, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View, TextInput, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { colors, radii, type UserProfileRow, type ProfilePhoto } from "@freeborn/shared";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { Wordmark } from "@/components/wordmark";

function publicPhotoUrl(path?: string | null) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const base = process.env.EXPO_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  return `${base}/storage/v1/object/public/profile-photos/${path.split("/").map(encodeURIComponent).join("/")}`;
}

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfileRow | null>(null);
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");
  const [occupation, setOccupation] = useState("");
  const [discoverable, setDiscoverable] = useState(true);
  const [saving, setSaving] = useState(false);
  const [photos, setPhotos] = useState<ProfilePhoto[]>([]);

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from("user_profiles").select("*").eq("id", user.id).maybeSingle<UserProfileRow>();
    setProfile(data ?? null);
    setBio(data?.bio ?? "");
    setCity(data?.city ?? "");
    setOccupation(data?.occupation ?? "");
    setDiscoverable(data?.discoverable ?? true);
    const { data: ph } = await supabase.from("profile_photos").select("*").eq("user_id", user.id).order("position");
    setPhotos((ph as ProfilePhoto[]) ?? []);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    await supabase.from("user_profiles").update({ bio, city, occupation, discoverable }).eq("id", user.id);
    setSaving(false);
    load();
  };

  return (
    <LinearGradient colors={[colors.night, colors.midnight, colors.slate]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <Wordmark />
            <Pressable onPress={signOut}>
              <Text style={styles.signout}>Sign out</Text>
            </Pressable>
          </View>

          <Text style={styles.title}>Your profile</Text>
          <Text style={styles.subtitle}>Make it unforgettable</Text>

          {/* Photos section */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Photos · {photos.length}/6</Text>
            <View style={styles.photoGrid}>
              {photos.map((p) => {
                const url = publicPhotoUrl(p.storage_path);
                return (
                  <View key={p.id} style={styles.photoSlot}>
                    {url ? (
                      <Image source={{ uri: url }} style={styles.photoImage} resizeMode="cover" />
                    ) : (
                      <Text style={styles.photoText}>Private</Text>
                    )}
                    {p.is_primary ? (
                      <View style={styles.primaryBadge}>
                        <Text style={styles.primaryBadgeText}>Primary</Text>
                      </View>
                    ) : null}
                  </View>
                );
              })}
              {Array.from({ length: Math.max(0, 3 - photos.length) }).map((_, i) => (
                <View key={i} style={[styles.photoSlot, { opacity: 0.4 }]}>
                  <Text style={styles.photoText}>+</Text>
                </View>
              ))}
            </View>
            <Text style={styles.hint}>Add photos from your profile on the web.</Text>
          </View>

          {/* Edit fields */}
          <View style={styles.card}>
            <Text style={styles.label}>Display name</Text>
            <Text style={styles.value}>{profile?.display_name ?? "—"}</Text>

            <Text style={styles.label}>Bio</Text>
            <TextInput value={bio} onChangeText={setBio} multiline style={styles.input} placeholder="Tell your story…" placeholderTextColor={colors.mist} />

            <Text style={styles.label}>City</Text>
            <TextInput value={city} onChangeText={setCity} style={styles.input} placeholder="City" placeholderTextColor={colors.mist} />

            <Text style={styles.label}>Occupation</Text>
            <TextInput value={occupation} onChangeText={setOccupation} style={styles.input} placeholder="What do you do?" placeholderTextColor={colors.mist} />

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Discoverable</Text>
              <Switch value={discoverable} onValueChange={setDiscoverable} trackColor={{ true: colors.accentGold }} />
            </View>

            <Pressable onPress={save} disabled={saving} style={styles.saveBtn}>
              <Text style={styles.saveText}>{saving ? "Saving…" : "Save changes"}</Text>
            </Pressable>
          </View>

          {/* Account info */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Account</Text>
            <Text style={styles.meta}>{user?.email}</Text>
            <Text style={styles.meta}>Verified: {profile?.is_verified ? "Yes" : "No"}</Text>
            <Text style={styles.meta}>Status: {profile?.profile_status}</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 120, gap: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  signout: { color: colors.mist, fontSize: 13, fontWeight: "700" },
  title: { color: colors.pearl, fontSize: 28, fontWeight: "800", letterSpacing: -1, marginTop: 8 },
  subtitle: { color: colors.mist, fontSize: 13, marginBottom: 4 },
  card: { backgroundColor: "rgba(9,16,28,0.9)", borderRadius: radii.xl, borderWidth: 1, borderColor: colors.lineStrong, padding: 16, gap: 10 },
  cardTitle: { color: colors.pearl, fontSize: 16, fontWeight: "700" },
  label: { color: colors.stone, fontSize: 11, textTransform: "uppercase", letterSpacing: 1.4, fontWeight: "700", marginTop: 6 },
  value: { color: colors.pearl, fontSize: 16, fontWeight: "700" },
  input: { backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: colors.lineStrong, borderRadius: 14, padding: 12, color: colors.pearl, fontSize: 14 },
  switchRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 },
  switchLabel: { color: colors.pearl, fontWeight: "700" },
  saveBtn: { backgroundColor: colors.pearl, borderRadius: 16, paddingVertical: 14, alignItems: "center", marginTop: 8 },
  saveText: { color: colors.ink, fontWeight: "900" },
  photoGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  photoSlot: { width: "30%", aspectRatio: 0.8, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: colors.lineStrong, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  photoImage: { width: "100%", height: "100%" },
  photoText: { color: colors.mist, fontSize: 12, fontWeight: "700" },
  primaryBadge: { position: "absolute", bottom: 6, borderRadius: 999, backgroundColor: colors.accentGold, paddingHorizontal: 7, paddingVertical: 3 },
  primaryBadgeText: { color: colors.ink, fontSize: 9, fontWeight: "900", textTransform: "uppercase" },
  hint: { color: colors.mist, fontSize: 12 },
  meta: { color: colors.mist, fontSize: 13, marginTop: 2 },
});
