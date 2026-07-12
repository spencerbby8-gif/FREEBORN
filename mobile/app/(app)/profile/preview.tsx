import { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Image, type ImageSourcePropType } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, type ProfilePhoto, type UserProfileRow } from "@freeborn/shared";
import { DetailScreenShell } from "@/components/ui/detail-screen-shell";
import { SurfaceCard } from "@/components/ui/surface-card";
import { SectionHeader } from "@/components/ui/section-header";
import { SkeletonBlock } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { publicPhotoUrl, initials, ageFromBirthDate, humanize } from "@/hooks/use-profile-data";

function ChipGroup({ items, variant = "default" }: { items: string[]; variant?: "gold" | "violet" | "teal" | "default" }) {
  if (items.length === 0) return null;
  return (
    <View style={styles.chipRow}>
      {items.map(item => {
        const chipStyle = variant === "gold" ? styles.goldChip : variant === "violet" ? styles.violetChip : variant === "teal" ? styles.tealChip : styles.chip;
        const textStyle = variant === "gold" ? styles.goldChipText : variant === "violet" ? styles.violetChipText : variant === "teal" ? styles.tealChipText : styles.chipText;
        return <View key={item} style={chipStyle}><Text style={textStyle}>{humanize(item)}</Text></View>;
      })}
    </View>
  );
}

function PromptCard({ prompt, answer }: { prompt: string; answer: string }) {
  return (
    <View style={styles.promptCard}>
      <Text style={styles.promptQ}>{prompt}</Text>
      <Text style={styles.promptA}>{answer}</Text>
    </View>
  );
}

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

  if (loading) {
    return (
      <DetailScreenShell title="Preview" subtitle="How people see you">
        <View style={styles.skeletonCard}>
          <SkeletonBlock width="100%" height={360} style={{ borderRadius: 24 }} />
          <View style={{ padding: 20, gap: 14 }}>
            <SkeletonBlock width="80%" height={16} style={{ borderRadius: 8 }} />
            <SkeletonBlock width="60%" height={14} style={{ borderRadius: 8 }} />
            <SkeletonBlock width="100%" height={14} style={{ borderRadius: 8 }} />
            <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
              <SkeletonBlock width={72} height={28} style={{ borderRadius: 999 }} />
              <SkeletonBlock width={90} height={28} style={{ borderRadius: 999 }} />
              <SkeletonBlock width={64} height={28} style={{ borderRadius: 999 }} />
            </View>
          </View>
        </View>
      </DetailScreenShell>
    );
  }

  if (!profile) {
    return (
      <DetailScreenShell title="Preview" subtitle="How people see you">
        <SurfaceCard>
          <Text style={styles.emptyTitle}>Profile unavailable</Text>
          <Text style={styles.emptyBody}>We could not load your profile preview.</Text>
        </SurfaceCard>
      </DetailScreenShell>
    );
  }

  const bio = profile.bio || "Your bio will appear here. A specific, warm introduction helps the right people recognize you.";
  const hasContent = profile.bio || profile.relationship_goals?.length || profile.interests?.length || profile.values?.length || profile.lifestyle_preferences?.length || profile.deal_breakers?.length || profile.prompt_answers?.length;

  return (
    <DetailScreenShell title="Preview" subtitle="How people see you" scroll={false}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Card preview */}
        <View style={styles.previewCard}>
          {/* Photo section */}
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
              <View style={styles.nameRow}>
                <Text style={styles.photoName}>{profile.display_name || "Your name"}</Text>
                {age ? <Text style={styles.photoAge}> {age}</Text> : null}
                {profile.is_verified && <Text style={styles.verifiedBadge}>✓ Verified</Text>}
              </View>
              <Text style={styles.photoMeta}>{location || "Location not set"}{profile.occupation ? ` · ${profile.occupation}` : ""}</Text>
            </View>
          </View>

          {/* Card body */}
          <View style={styles.cardBody}>
            {/* Bio */}
            {bio && (
              <Text style={styles.bio}>{bio}</Text>
            )}

            {/* Relationship goals */}
            <ChipGroup items={profile.relationship_goals ?? []} variant="gold" />

            {/* Values */}
            <ChipGroup items={profile.values ?? []} variant="gold" />

            {/* Interests */}
            <ChipGroup items={profile.interests ?? []} variant="violet" />

            {/* Lifestyle */}
            <ChipGroup items={profile.lifestyle_preferences ?? []} variant="teal" />

            {/* Deal breakers */}
            <ChipGroup items={profile.deal_breakers ?? []} />

            {/* Prompts */}
            {(profile.prompt_answers ?? []).filter(p => p.answer.trim()).map((p, i) => (
              <PromptCard key={i} prompt={p.prompt} answer={p.answer} />
            ))}

            {/* Profile empty notice */}
            {!hasContent && (
              <View style={styles.emptyContent}>
                <Text style={styles.emptyContentText}>Your profile details will appear here as you add them. Start by editing your profile.</Text>
              </View>
            )}

            {/* Privacy note */}
            <View style={styles.privateNote}>
              <Text style={styles.privateNoteText}>Hidden publicly: email, full birth date, account provider details.</Text>
            </View>
          </View>
        </View>

        {/* Photo gallery preview */}
        {photos.length > 1 && (
          <View style={styles.gallerySection}>
            <Text style={styles.galleryEyebrow}>ALL PHOTOS</Text>
            <View style={styles.galleryRow}>
              {photos.map((photo, idx) => {
                const url = publicPhotoUrl(photo.storage_path);
                return (
                  <View key={photo.id} style={styles.galleryThumb}>
                    {url ? <Image source={{ uri: url }} style={styles.galleryImage} resizeMode="cover" /> : null}
                    {photo.is_primary && <View style={styles.galleryCoverBadge}><Text style={styles.galleryCoverText}>Cover</Text></View>}
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>
    </DetailScreenShell>
  );
}

const styles = StyleSheet.create({
  skeletonCard: { borderRadius: 28, borderWidth: 1, borderColor: "rgba(255,255,255,0.10)", backgroundColor: "rgba(9,16,28,0.88)", overflow: "hidden" },
  emptyTitle: { color: colors.pearl, fontSize: 20, fontWeight: "900", textAlign: "center" },
  emptyBody: { color: colors.mist, fontSize: 14, lineHeight: 22, marginTop: 8, textAlign: "center" },
  scroll: { paddingBottom: 120 },
  previewCard: { borderRadius: 28, borderWidth: 1, borderColor: "rgba(255,255,255,0.10)", backgroundColor: "rgba(9,16,28,0.88)", overflow: "hidden" },
  photoArea: { height: 360, position: "relative", backgroundColor: "rgba(255,255,255,0.04)", justifyContent: "center", alignItems: "center" },
  photo: { width: "100%", height: "100%" },
  noPhoto: { width: 120, height: 120, borderRadius: 28, backgroundColor: "rgba(255,255,255,0.06)", justifyContent: "center", alignItems: "center" },
  noPhotoInitials: { color: colors.pearl, fontSize: 40, fontWeight: "900", letterSpacing: -2 },
  photoFade: { position: "absolute", left: 0, right: 0, bottom: 0, height: 180 },
  photoOverlay: { position: "absolute", left: 18, right: 18, bottom: 16 },
  photoEyebrow: { color: "rgba(255,255,255,0.56)", fontSize: 10, fontWeight: "900", textTransform: "uppercase", letterSpacing: 1.8 },
  nameRow: { flexDirection: "row", alignItems: "baseline", gap: 0 },
  photoName: { color: "white", fontSize: 34, fontWeight: "900", letterSpacing: -1.8, lineHeight: 36, marginTop: 6 },
  photoAge: { fontSize: 20, color: "rgba(255,255,255,0.78)", fontWeight: "700" },
  verifiedBadge: { color: colors.teal300, fontSize: 11, fontWeight: "900", marginLeft: 8, borderRadius: 999, borderWidth: 1, borderColor: "rgba(166,230,220,0.30)", backgroundColor: "rgba(79,184,167,0.10)", paddingHorizontal: 8, paddingVertical: 3, overflow: "hidden" },
  photoMeta: { color: "rgba(255,255,255,0.70)", marginTop: 6, fontSize: 13, fontWeight: "700" },
  cardBody: { padding: 20, gap: 14 },
  bio: { color: colors.pearl, opacity: 0.92, fontSize: 14, lineHeight: 22 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  goldChip: { borderRadius: 999, borderWidth: 1, borderColor: "rgba(246,215,154,0.24)", backgroundColor: "rgba(217,167,82,0.10)", paddingHorizontal: 11, paddingVertical: 7 },
  goldChipText: { color: colors.pearl, fontSize: 11, fontWeight: "900" },
  violetChip: { borderRadius: 999, borderWidth: 1, borderColor: "rgba(200,185,255,0.24)", backgroundColor: "rgba(138,110,242,0.10)", paddingHorizontal: 11, paddingVertical: 7 },
  violetChipText: { color: colors.pearl, fontSize: 11, fontWeight: "900" },
  tealChip: { borderRadius: 999, borderWidth: 1, borderColor: "rgba(166,230,220,0.24)", backgroundColor: "rgba(79,184,167,0.10)", paddingHorizontal: 11, paddingVertical: 7 },
  tealChipText: { color: colors.pearl, fontSize: 11, fontWeight: "900" },
  chip: { borderRadius: 999, borderWidth: 1, borderColor: "rgba(255,255,255,0.10)", backgroundColor: "rgba(255,255,255,0.04)", paddingHorizontal: 11, paddingVertical: 7 },
  chipText: { color: colors.mist, fontSize: 11, fontWeight: "700" },
  promptCard: { borderRadius: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", backgroundColor: "rgba(255,255,255,0.03)", padding: 16, gap: 6 },
  promptQ: { color: colors.gold300, fontSize: 13, fontWeight: "800", lineHeight: 18 },
  promptA: { color: colors.pearl, fontSize: 14, fontWeight: "600", lineHeight: 20, opacity: 0.92 },
  emptyContent: { borderRadius: 18, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", backgroundColor: "rgba(255,255,255,0.025)", padding: 16 },
  emptyContentText: { color: colors.mist, fontSize: 13, lineHeight: 20 },
  privateNote: { borderRadius: 18, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", backgroundColor: "rgba(255,255,255,0.025)", padding: 12 },
  privateNoteText: { color: colors.mist, fontSize: 11, lineHeight: 17 },
  gallerySection: { marginTop: 16, gap: 10 },
  galleryEyebrow: { color: colors.sand, fontSize: 10, fontWeight: "900", textTransform: "uppercase", letterSpacing: 2.4, paddingHorizontal: 4 },
  galleryRow: { flexDirection: "row", gap: 8 },
  galleryThumb: { width: 64, height: 80, borderRadius: 14, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.10)", position: "relative" },
  galleryImage: { width: "100%", height: "100%" },
  galleryCoverBadge: { position: "absolute", bottom: 3, left: 3, borderRadius: 999, backgroundColor: colors.gold300, paddingHorizontal: 5, paddingVertical: 2 },
  galleryCoverText: { color: colors.ink, fontSize: 7, fontWeight: "900", textTransform: "uppercase" },
});
