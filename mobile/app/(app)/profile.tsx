import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { colors, radii, type ProfilePhoto, type UserProfileRow } from "@freeborn/shared";
import { ScreenShell } from "@/components/ui/screen-shell";
import { SurfaceCard } from "@/components/ui/surface-card";
import { SectionHeader } from "@/components/ui/section-header";
import { EmptyState } from "@/components/ui/empty-state";
import { ProfileSkeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { emberShadow, premiumShadow } from "@/components/magic-background";

function publicPhotoUrl(path?: string | null) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const base = process.env.EXPO_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  return `${base}/storage/v1/object/public/profile-photos/${path.split("/").map(encodeURIComponent).join("/")}`;
}

function initials(name?: string | null) {
  return (name ?? "FB").split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase();
}

function ageFromBirthDate(value?: string | null) {
  if (!value) return null;
  const birth = new Date(value);
  if (Number.isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const md = today.getMonth() - birth.getMonth();
  if (md < 0 || (md === 0 && today.getDate() < birth.getDate())) age -= 1;
  return age >= 18 ? age : null;
}

function humanize(value?: string | null) {
  return (value ?? "").replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
}

function profileStrength(profile: UserProfileRow | null) {
  if (!profile) return 0;
  return Math.min(
    35 + (profile.photo_count ?? 0) * 12 + (profile.bio ? 18 : 0) +
    ((profile.interests?.length ?? 0) ? 12 : 0) + ((profile.relationship_goals?.length ?? 0) ? 10 : 0) +
    (profile.is_verified ? 8 : 0), 98,
  );
}

function StatusPill({ label, tone = "muted" }: { label: string; tone?: "success" | "gold" | "muted" }) {
  return (
    <View style={[styles.statusPill, tone === "success" && styles.statusSuccess, tone === "gold" && styles.statusGold]}>
      <View style={[styles.statusDot, tone === "success" && styles.statusDotSuccess, tone === "gold" && styles.statusDotGold]} />
      <Text style={[styles.statusText, tone === "success" && styles.statusTextSuccess, tone === "gold" && styles.statusTextGold]}>{label}</Text>
    </View>
  );
}

function TextField({ label, value, onChangeText, placeholder, multiline }: {
  label: string; value: string; onChangeText: (v: string) => void; placeholder: string; multiline?: boolean;
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="rgba(154,161,184,0.52)"
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
        style={[styles.input, multiline && styles.textarea]}
      />
    </View>
  );
}

function InfoRow({ label, value, accent }: { label: string; value: string; accent?: "success" | "gold" | "muted" }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, accent === "success" && styles.successText, accent === "gold" && styles.goldText]}>{value}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfileRow | null>(null);
  const [photos, setPhotos] = useState<ProfilePhoto[]>([]);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [occupation, setOccupation] = useState("");
  const [education, setEducation] = useState("");
  const [discoverable, setDiscoverable] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ tone: "success" | "error"; message: string } | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase.from("user_profiles").select("*").eq("id", user.id).maybeSingle<UserProfileRow>();
    const { data: ph } = await supabase.from("profile_photos").select("*").eq("user_id", user.id).order("position");
    setProfile(data ?? null);
    setPhotos((ph as ProfilePhoto[]) ?? []);
    setDisplayName(data?.display_name ?? "");
    setBio(data?.bio ?? "");
    setCity(data?.city ?? "");
    setRegion(data?.region ?? "");
    setOccupation(data?.occupation ?? "");
    setEducation(data?.education ?? "");
    setDiscoverable(data?.discoverable ?? true);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const primaryPhotoUrl = useMemo(() => {
    const primary = photos.find(p => p.is_primary) ?? photos[0];
    return publicPhotoUrl(primary?.storage_path);
  }, [photos]);

  const strength = profileStrength(profile);
  const location = [city || profile?.city, region || profile?.region].filter(Boolean).join(", ");
  const age = ageFromBirthDate(profile?.birth_date);

  const save = async () => {
    if (!user) return;
    setNotice(null);
    if (displayName.trim().length < 2) {
      setNotice({ tone: "error", message: "Use at least two characters for your display name." });
      return;
    }
    if (city.trim().length < 1) {
      setNotice({ tone: "error", message: "Add your city so discovery can stay practical." });
      return;
    }
    if (bio.trim().length < 20) {
      setNotice({ tone: "error", message: "A good bio is at least 20 characters. Add a little more of your voice." });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("user_profiles").update({
      display_name: displayName.trim(),
      bio: bio.trim(),
      city: city.trim(),
      region: region.trim() || null,
      occupation: occupation.trim() || null,
      education: education.trim() || null,
      discoverable,
      updated_at: new Date().toISOString(),
    }).eq("id", user.id);
    if (error) {
      setNotice({ tone: "error", message: "We couldn't save your profile. Please review your details and try again." });
    } else {
      setNotice({ tone: "success", message: "Profile saved. Your public preview now reflects these details." });
      await load();
    }
    setSaving(false);
  };

  return (
    <ScreenShell>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>Profile</Text>
          <Text style={styles.title}>Shape how people meet you.</Text>
        </View>
        <View style={styles.headerAvatar}>
          {primaryPhotoUrl
            ? <Image source={{ uri: primaryPhotoUrl }} style={styles.avatarImage} />
            : <Text style={styles.avatarText}>{initials(displayName || profile?.display_name)}</Text>
          }
        </View>
      </View>

      <Text style={styles.subtitle}>Express values, wellness rhythm, and long-term intent without exposing private essentials.</Text>

      {loading ? (
        <>
          <ProfileSkeleton />
          <ProfileSkeleton />
        </>
      ) : profile ? (
        <>
          {/* Overview card */}
          <SurfaceCard>
            <View style={styles.overviewTop}>
              <View style={styles.coverAvatar}>
                {primaryPhotoUrl
                  ? <Image source={{ uri: primaryPhotoUrl }} style={styles.coverImage} />
                  : <Text style={styles.coverInitials}>{initials(displayName)}</Text>
                }
              </View>
              <View style={styles.overviewInfo}>
                <View style={styles.statusRow}>
                  <StatusPill label={discoverable ? "Visible" : "Hidden"} tone={discoverable ? "success" : "muted"} />
                  <StatusPill label={profile.is_verified ? "Verified" : "Not verified yet"} tone={profile.is_verified ? "success" : "gold"} />
                </View>
                <Text style={styles.profileName}>{displayName || "Your profile"}</Text>
                <Text style={styles.profileMeta}>{location || "Location not set"}{occupation ? ` · ${occupation}` : ""}</Text>
              </View>
            </View>
            <View style={styles.strengthBox}>
              <View style={{ flex: 1 }}>
                <Text style={styles.strengthLabel}>Completeness</Text>
                <Text style={styles.strengthHint}>Fuller profiles give people a better reason to start specific.</Text>
              </View>
              <Text style={styles.strengthValue}>{strength}%</Text>
            </View>
            <View style={styles.progressTrack}>
              <LinearGradient
                colors={[colors.ember500, colors.gold300]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressFill, { width: `${strength}%` }]}
              />
            </View>
          </SurfaceCard>

          {/* Public preview card */}
          <SurfaceCard style={styles.previewCard} gap={0}>
            <View style={styles.previewPhoto}>
              {primaryPhotoUrl ? (
                <Image source={{ uri: primaryPhotoUrl }} style={styles.previewImage} resizeMode="cover" />
              ) : (
                <View style={styles.previewInitialsBox}>
                  <Text style={styles.previewInitials}>{initials(displayName)}</Text>
                  <Text style={styles.previewPhotoHint}>Add a cover photo</Text>
                </View>
              )}
              <LinearGradient colors={["transparent", "rgba(0,0,0,0.84)"]} style={styles.photoFade} />
              <View style={styles.previewOverlay}>
                <Text style={styles.previewEyebrow}>Public preview</Text>
                <Text style={styles.previewName}>{displayName || "Your name"}{age ? <Text style={styles.previewAge}> {age}</Text> : null}</Text>
                <Text style={styles.previewMeta}>{location || "Location not set"}{occupation ? ` · ${occupation}` : ""}</Text>
              </View>
            </View>
            <View style={styles.previewContent}>
              <Text style={styles.previewBio}>{profile.bio || "Your bio will appear here. A specific, warm introduction helps the right people recognize you."}</Text>
              <View style={styles.chipRow}>
                {(profile.relationship_goals ?? []).slice(0, 3).map(g => <View key={g} style={styles.goldChip}><Text style={styles.goldChipText}>{humanize(g)}</Text></View>)}
                {(profile.interests ?? []).slice(0, 4).map(i => <View key={i} style={styles.chip}><Text style={styles.chipText}>{i}</Text></View>)}
              </View>
              <View style={styles.privateNote}>
                <Text style={styles.privateNoteText}>Hidden publicly: email, full birth date, account provider details.</Text>
              </View>
            </View>
          </SurfaceCard>

          {/* Photos card */}
          <SurfaceCard>
            <SectionHeader eyebrow="Photos" title={`${photos.length} / 6 intentional photos`} body="Recent, recognizable photos help your profile feel safe and specific." />
            {photos.length ? (
              <View style={styles.photoGrid}>
                {photos.map(photo => {
                  const url = publicPhotoUrl(photo.storage_path);
                  return (
                    <View key={photo.id} style={styles.photoSlot}>
                      {url ? <Image source={{ uri: url }} style={styles.photoImage} resizeMode="cover" /> : <Text style={styles.photoText}>Preview unavailable</Text>}
                      {photo.is_primary ? <View style={styles.primaryBadge}><Text style={styles.primaryBadgeText}>Primary</Text></View> : null}
                    </View>
                  );
                })}
              </View>
            ) : (
              <EmptyState
                icon="＋"
                title="Add your first photo on web"
                body="Uploads are managed from the web profile for now. Your photos will appear here as soon as they are added."
              />
            )}
          </SurfaceCard>

          {/* Edit profile card */}
          <SurfaceCard>
            <SectionHeader eyebrow="Edit profile" title="Your story, well-told and easy to trust" body="Save changes here, then check the public preview above." />
            <TextField label="Display name" value={displayName} onChangeText={setDisplayName} placeholder="How should Freeborn introduce you?" />
            <TextField label="Bio" value={bio} onChangeText={v => setBio(v.slice(0, 500))} placeholder="Tell your story…" multiline />
            <Text style={styles.counter}>{bio.length} / 500</Text>
            <TextField label="City" value={city} onChangeText={setCity} placeholder="City" />
            <TextField label="Region" value={region} onChangeText={setRegion} placeholder="State, province, or region" />
            <TextField label="Occupation" value={occupation} onChangeText={setOccupation} placeholder="What do you do?" />
            <TextField label="Education" value={education} onChangeText={setEducation} placeholder="Where did you study?" />
          </SurfaceCard>

          {/* Privacy controls */}
          <SurfaceCard>
            <SectionHeader eyebrow="Privacy controls" title="Choose whether people can find you" body="When visibility is off, your profile stops appearing in discovery while your account stays intact." />
            <View style={styles.switchCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.switchTitle}>Visible in discovery</Text>
                <Text style={styles.switchBody}>People who match your filters can see your public profile.</Text>
              </View>
              <Switch
                value={discoverable}
                onValueChange={setDiscoverable}
                trackColor={{ false: "rgba(255,255,255,0.12)", true: colors.gold500 }}
                thumbColor={colors.pearl}
              />
            </View>
          </SurfaceCard>

          {/* Notice */}
          {notice ? (
            <View style={[styles.notice, notice.tone === "success" ? styles.noticeSuccess : styles.noticeError]}>
              <Text style={styles.noticeIcon}>{notice.tone === "success" ? "✓" : "!"}</Text>
              <Text style={styles.noticeText}>{notice.message}</Text>
            </View>
          ) : null}

          {/* Save */}
          <Pressable onPress={save} disabled={saving} style={[styles.saveBtn, saving && styles.disabledBtn]}>
            <Text style={styles.saveText}>{saving ? "Saving profile…" : "Save profile"}</Text>
          </Pressable>

          {/* Account card */}
          <SurfaceCard gap={0}>
            <View style={styles.accountPadding}>
              <SectionHeader eyebrow="Private account details" title="Only you can see this" body="These details are used for access and status, never discovery." />
            </View>
            <InfoRow label="Email" value={user?.email ?? "Not available"} />
            <InfoRow label="Verification" value={profile.is_verified ? "Verified" : "Not verified yet"} accent={profile.is_verified ? "success" : "gold"} />
            <InfoRow label="Profile status" value={humanize(profile.profile_status)} />
            <InfoRow label="Discoverability" value={discoverable ? "Visible" : "Hidden"} accent={discoverable ? "success" : "muted"} />
            <View style={styles.accountPadding}>
              <Pressable onPress={signOut} style={styles.signOutBtn}>
                <Text style={styles.signOutText}>Sign out</Text>
              </Pressable>
            </View>
          </SurfaceCard>
        </>
      ) : (
        <SurfaceCard>
          <EmptyState
            icon="!"
            title="Profile unavailable"
            body="We could not load your profile. Pull back to Discover and try again."
            action={{ label: "Go to Discover", onPress: () => router.push("/(app)") }}
          />
        </SurfaceCard>
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
  },
  eyebrow: {
    color: colors.sand,
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 2.4,
  },
  title: {
    color: colors.pearl,
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: -1.8,
    lineHeight: 34,
    marginTop: 4,
  },
  subtitle: {
    color: colors.mist,
    fontSize: 14,
    lineHeight: 22,
    marginTop: -4,
  },
  headerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginTop: 8,
  },
  avatarImage: { width: "100%", height: "100%" },
  avatarText: { color: colors.pearl, fontWeight: "900", fontSize: 14 },

  /* Overview */
  overviewTop: { flexDirection: "row", gap: 16, alignItems: "center" },
  coverAvatar: {
    width: 88,
    height: 88,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  coverImage: { width: "100%", height: "100%" },
  coverInitials: { color: colors.pearl, fontSize: 28, fontWeight: "900" },
  overviewInfo: { flex: 1, gap: 6 },
  statusRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(255,255,255,0.04)",
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  statusSuccess: { borderColor: "rgba(109,211,176,0.28)", backgroundColor: "rgba(109,211,176,0.08)" },
  statusGold: { borderColor: "rgba(246,215,154,0.24)", backgroundColor: "rgba(217,167,82,0.08)" },
  statusDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.mist },
  statusDotSuccess: { backgroundColor: colors.success },
  statusDotGold: { backgroundColor: colors.gold300 },
  statusText: { color: colors.mist, fontSize: 9, fontWeight: "900", textTransform: "uppercase", letterSpacing: 1 },
  statusTextSuccess: { color: colors.success },
  statusTextGold: { color: colors.gold300 },
  profileName: { color: colors.pearl, fontSize: 26, lineHeight: 28, fontWeight: "900", letterSpacing: -1.2 },
  profileMeta: { color: colors.mist, fontSize: 13, lineHeight: 20 },
  strengthBox: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", gap: 16 },
  strengthLabel: { color: colors.pearl, fontWeight: "800", fontSize: 14 },
  strengthHint: { color: colors.mist, marginTop: 3, fontSize: 12, lineHeight: 18, maxWidth: 230 },
  strengthValue: { color: colors.pearl, fontSize: 36, fontWeight: "900", letterSpacing: -1.8 },
  progressTrack: { height: 7, backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 999, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 999 },

  /* Preview card */
  previewCard: { padding: 0, overflow: "hidden" },
  previewPhoto: {
    height: 400,
    backgroundColor: "rgba(255,255,255,0.04)",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  previewImage: { width: "100%", height: "100%" },
  previewInitialsBox: { alignItems: "center", gap: 10 },
  previewInitials: { color: colors.pearl, fontSize: 60, fontWeight: "900", letterSpacing: -4 },
  previewPhotoHint: { color: colors.mist, fontSize: 10, textTransform: "uppercase", letterSpacing: 1.8, fontWeight: "900" },
  photoFade: { position: "absolute", left: 0, right: 0, bottom: 0, height: 190 },
  previewOverlay: { position: "absolute", left: 18, right: 18, bottom: 18 },
  previewEyebrow: { color: "rgba(255,255,255,0.56)", fontSize: 10, fontWeight: "900", textTransform: "uppercase", letterSpacing: 1.8 },
  previewName: { color: "white", fontSize: 36, lineHeight: 37, fontWeight: "900", letterSpacing: -1.8, marginTop: 6 },
  previewAge: { fontSize: 22, color: "rgba(255,255,255,0.78)" },
  previewMeta: { color: "rgba(255,255,255,0.70)", marginTop: 6, fontSize: 13, fontWeight: "700" },
  previewContent: { padding: 20, gap: 12 },
  previewBio: { color: colors.pearl, opacity: 0.92, fontSize: 14, lineHeight: 22 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  goldChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(246,215,154,0.24)",
    backgroundColor: "rgba(217,167,82,0.10)",
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  goldChipText: { color: colors.pearl, fontSize: 11, fontWeight: "900" },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(255,255,255,0.04)",
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  chipText: { color: colors.mist, fontSize: 11, fontWeight: "700" },
  privateNote: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.025)",
    padding: 12,
  },
  privateNoteText: { color: colors.mist, fontSize: 11, lineHeight: 17 },

  /* Photos */
  photoGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  photoSlot: {
    width: "31%",
    aspectRatio: 0.8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.04)",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  photoImage: { width: "100%", height: "100%" },
  photoText: { color: colors.mist, fontSize: 10, textAlign: "center", padding: 8 },
  primaryBadge: {
    position: "absolute",
    bottom: 6,
    borderRadius: 999,
    backgroundColor: colors.gold300,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  primaryBadgeText: { color: colors.ink, fontSize: 9, fontWeight: "900", textTransform: "uppercase" },

  /* Edit form */
  fieldGroup: { gap: 7 },
  label: {
    color: colors.sand,
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 1.6,
    fontWeight: "900",
  },
  input: {
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
  textarea: { minHeight: 128, lineHeight: 21 },
  counter: { alignSelf: "flex-end", color: colors.ash, fontSize: 10, fontWeight: "700", letterSpacing: 0.8 },

  /* Switch */
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

  /* Notice */
  notice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
  },
  noticeSuccess: { borderColor: "rgba(109,211,176,0.28)", backgroundColor: "rgba(109,211,176,0.08)" },
  noticeError: { borderColor: "rgba(255,107,122,0.28)", backgroundColor: "rgba(255,107,122,0.08)" },
  noticeIcon: { color: colors.pearl, fontWeight: "900", fontSize: 16 },
  noticeText: { flex: 1, color: colors.pearl, fontSize: 13, lineHeight: 20, fontWeight: "700" },

  /* Save */
  saveBtn: {
    backgroundColor: colors.pearl,
    borderRadius: 22,
    paddingVertical: 16,
    alignItems: "center",
    ...emberShadow,
  },
  disabledBtn: { opacity: 0.6 },
  saveText: { color: colors.ink, fontSize: 14, fontWeight: "900" },

  /* Account */
  accountPadding: { padding: 20, gap: 16 },
  infoRow: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 14,
  },
  infoLabel: { color: colors.mist, fontSize: 12, fontWeight: "800" },
  infoValue: { color: colors.pearl, fontSize: 12, fontWeight: "900", textAlign: "right", flex: 1 },
  successText: { color: colors.success },
  goldText: { color: colors.gold300 },
  signOutBtn: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.03)",
    paddingVertical: 14,
    alignItems: "center",
  },
  signOutText: { color: colors.mist, fontSize: 13, fontWeight: "900" },
});
