import { useCallback, useEffect, useMemo, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, type ProfilePhoto, type UserProfileRow } from "@freeborn/shared";
import { DetailScreenShell } from "@/components/ui/detail-screen-shell";
import { SurfaceCard } from "@/components/ui/surface-card";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { publicPhotoUrl, initials, ageFromBirthDate, humanize } from "@/hooks/use-profile-data";

export default function PreviewScreen() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfileRow | null>(null);
  const [photos, setPhotos] = useState<ProfilePhoto[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from("user_profiles").select("*").eq("id", user.id).maybeSingle<UserProfileRow>();
    const { data: ph } = await supabase.from("profile_photos").select("*").eq("user_id", user.id).order("position");
    setProfile(data ?? null);
    setPhotos((ph as ProfilePhoto[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const primaryPhotoUrl = useMemo(() => {
    const primary = photos.find(p => p.is_primary) ?? photos[0];
    return publicPhotoUrl(primary?.storage_path);
  }, [photos]);

  const age = ageFromBirthDate(profile?.birth_date);
  const location = [profile?.city, profile?.region].filter(Boolean).join(", ");

  if (loading || !profile) return <DetailScreenShell title="Preview" subtitle="How people see you"><View /></DetailScreenShell>;

  return (
    <DetailScreenShell title="Preview" subtitle="How people see you" scroll={false}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Card preview */}
        <View style={styles.previewCard}>
          <View style={styles.photoArea}>
            {primaryPhotoUrl ? (
              <Image source={{ uri: primaryPhotoUrl }} style={styles.photo} resizeMode="cover" />
            ) : (
              <View style={styles.noPhoto}>
                <Text style={styles.noPhotoInitials}>{initials(profile.display_name)}</Text>
              </View>
            )}
            <LinearGradient colors={["transparent", "rgba(5,7,13,0.88)"]} style={styles.photoFade} />
            <View style={styles.photoOverlay}>
              <Text style={styles.photoEyebrow}>Public preview</Text>
              <Text style={styles.photoName}>{profile.display_name || "Your name"}{age ? <Text style={styles.photoAge}> {age}</Text> : null}</Text>
              <Text style={styles.photoMeta}>{location || "Location not set"}{profile.occupation ? ` · ${profile.occupation}` : ""}</Text>
            </View>
          </View>

          <View style={styles.cardBody}>
            <Text style={styles.bio}>{profile.bio || "Your bio will appear here. A specific, warm introduction helps the right people recognize you."}</Text>

            <View style={styles.chipRow}>
              {(profile.relationship_goals ?? []).slice(0, 3).map(g => <View key={g} style={styles.goldChip}><Text style={styles.goldChipText}>{humanize(g)}</Text></View>)}
              {(profile.interests ?? []).slice(0, 4).map(i => <View key={i} style={styles.chip}><Text style={styles.chipText}>{i}</Text></View>)}
            </View>

            <View style={styles.privateNote}>
              <Text style={styles.privateNoteText}>Hidden publicly: email, full birth date, account provider details.</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </DetailScreenShell>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 120 },
  previewCard: { borderRadius: 28, borderWidth: 1, borderColor: "rgba(255,255,255,0.10)", backgroundColor: "rgba(9,16,28,0.88)", overflow: "hidden" },
  photoArea: { height: 360, position: "relative", backgroundColor: "rgba(255,255,255,0.04)", justifyContent: "center", alignItems: "center" },
  photo: { width: "100%", height: "100%" },
  noPhoto: { width: 120, height: 120, borderRadius: 28, backgroundColor: "rgba(255,255,255,0.06)", justifyContent: "center", alignItems: "center" },
  noPhotoInitials: { color: colors.pearl, fontSize: 40, fontWeight: "900", letterSpacing: -2 },
  photoFade: { position: "absolute", left: 0, right: 0, bottom: 0, height: 180 },
  photoOverlay: { position: "absolute", left: 18, right: 18, bottom: 16 },
  photoEyebrow: { color: "rgba(255,255,255,0.56)", fontSize: 10, fontWeight: "900", textTransform: "uppercase", letterSpacing: 1.8 },
  photoName: { color: "white", fontSize: 34, fontWeight: "900", letterSpacing: -1.8, lineHeight: 36, marginTop: 6 },
  photoAge: { fontSize: 20, color: "rgba(255,255,255,0.78)", fontWeight: "700" },
  photoMeta: { color: "rgba(255,255,255,0.70)", marginTop: 6, fontSize: 13, fontWeight: "700" },
  cardBody: { padding: 20, gap: 14 },
  bio: { color: colors.pearl, opacity: 0.92, fontSize: 14, lineHeight: 22 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  goldChip: { borderRadius: 999, borderWidth: 1, borderColor: "rgba(246,215,154,0.24)", backgroundColor: "rgba(217,167,82,0.10)", paddingHorizontal: 11, paddingVertical: 7 },
  goldChipText: { color: colors.pearl, fontSize: 11, fontWeight: "900" },
  chip: { borderRadius: 999, borderWidth: 1, borderColor: "rgba(255,255,255,0.10)", backgroundColor: "rgba(255,255,255,0.04)", paddingHorizontal: 11, paddingVertical: 7 },
  chipText: { color: colors.mist, fontSize: 11, fontWeight: "700" },
  privateNote: { borderRadius: 18, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", backgroundColor: "rgba(255,255,255,0.025)", padding: 12 },
  privateNoteText: { color: colors.mist, fontSize: 11, lineHeight: 17 },
});
