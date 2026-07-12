import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { colors, type ProfilePhoto } from "@freeborn/shared";
import { DetailScreenShell } from "@/components/ui/detail-screen-shell";
import { SurfaceCard } from "@/components/ui/surface-card";
import { SectionHeader } from "@/components/ui/section-header";
import { EmptyState } from "@/components/ui/empty-state";
import { SaveActionBar } from "@/components/ui/save-action-bar";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { publicPhotoUrl } from "@/hooks/use-profile-data";

const MAX_PHOTOS = 6;

export default function PhotosScreen() {
  const { user } = useAuth();
  const [photos, setPhotos] = useState<ProfilePhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [notice, setNotice] = useState<{
    tone: "success" | "error";
    message: string;
  } | null>(null);
  const [reorderMode, setReorderMode] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("profile_photos")
      .select("*")
      .eq("user_id", user.id)
      .order("position");
    setPhotos((data as ProfilePhoto[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const remainingSlots = useMemo(
    () => Math.max(0, MAX_PHOTOS - photos.length),
    [photos]
  );

  const pickAndUpload = useCallback(async () => {
    if (!user || photos.length >= MAX_PHOTOS) return;
    setNotice(null);

    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setNotice({
        tone: "error",
        message:
          "Photo access is needed to upload profile photos. Enable it in Settings.",
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.85,
    });

    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    setUploading(true);
    setUploadProgress("Preparing…");

    try {
      const uri = asset.uri;
      const ext = uri.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `${user.id}/${Date.now()}.${ext}`;

      setUploadProgress("Uploading…");

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from("profile-photos")
        .upload(path, {
          uri,
          type: `image/${ext === "jpg" ? "jpeg" : ext}`,
          name: path,
        } as any);

      if (uploadError) throw uploadError;

      setUploadProgress("Saving…");

      // Determine position
      const nextPosition = photos.length;

      // Insert photo record
      const isFirst = photos.length === 0;
      const { error: insertError } = await supabase
        .from("profile_photos")
        .insert({
          user_id: user.id,
          storage_path: path,
          position: nextPosition,
          is_primary: isFirst,
        });

      if (insertError) throw insertError;

      setUploadProgress(null);
      setNotice({
        tone: "success",
        message: isFirst
          ? "Photo added. Your first photo is used as the cover."
          : "Photo added.",
      });
      await load();
    } catch (err: any) {
      setNotice({
        tone: "error",
        message: "Upload failed. Please try again.",
      });
    } finally {
      setUploading(false);
      setUploadProgress(null);
    }
  }, [user, photos.length, load]);

  const takeAndUpload = useCallback(async () => {
    if (!user || photos.length >= MAX_PHOTOS) return;
    setNotice(null);

    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setNotice({
        tone: "error",
        message:
          "Camera access is needed to take profile photos. Enable it in Settings.",
      });
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.85,
    });

    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    setUploading(true);
    setUploadProgress("Preparing…");

    try {
      const uri = asset.uri;
      const ext = uri.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `${user.id}/${Date.now()}.${ext}`;

      setUploadProgress("Uploading…");

      const { error: uploadError } = await supabase.storage
        .from("profile-photos")
        .upload(path, {
          uri,
          type: `image/${ext === "jpg" ? "jpeg" : ext}`,
          name: path,
        } as any);

      if (uploadError) throw uploadError;

      setUploadProgress("Saving…");

      const nextPosition = photos.length;
      const isFirst = photos.length === 0;
      const { error: insertError } = await supabase
        .from("profile_photos")
        .insert({
          user_id: user.id,
          storage_path: path,
          position: nextPosition,
          is_primary: isFirst,
        });

      if (insertError) throw insertError;

      setUploadProgress(null);
      setNotice({
        tone: "success",
        message: isFirst
          ? "Photo added. Your first photo is used as the cover."
          : "Photo added.",
      });
      await load();
    } catch (err: any) {
      setNotice({
        tone: "error",
        message: "Upload failed. Please try again.",
      });
    } finally {
      setUploading(false);
      setUploadProgress(null);
    }
  }, [user, photos.length, load]);

  const setCoverPhoto = useCallback(
    async (photoId: string) => {
      if (!user) return;
      setNotice(null);
      // Unset all primaries EXCEPT the target first (avoids brief no-primary state)
      const { error: unsetError } = await supabase
        .from("profile_photos")
        .update({ is_primary: false })
        .eq("user_id", user.id)
        .neq("id", photoId);
      if (unsetError) {
        setNotice({ tone: "error", message: "Could not set cover photo." });
        return;
      }
      const { error: setError } = await supabase
        .from("profile_photos")
        .update({ is_primary: true })
        .eq("id", photoId);
      if (setError) {
        setNotice({ tone: "error", message: "Could not set cover photo." });
        return;
      }
      setNotice({
        tone: "success",
        message: "Cover photo updated. This photo appears first on your profile.",
      });
      await load();
    },
    [user, load]
  );

  const deletePhoto = useCallback(
    async (photoId: string) => {
      if (!user) return;
      setNotice(null);
      const photo = photos.find((p) => p.id === photoId);
      if (!photo) return;

      // Delete from storage
      if (photo.storage_path) {
        await supabase.storage
          .from("profile-photos")
          .remove([photo.storage_path]);
      }

      // Delete record
      const { error } = await supabase
        .from("profile_photos")
        .delete()
        .eq("id", photoId);

      if (error) {
        setNotice({ tone: "error", message: "Could not delete photo." });
        return;
      }

      // If deleted photo was primary, make first remaining photo primary
      const remaining = photos.filter((p) => p.id !== photoId);
      if (photo.is_primary && remaining.length > 0) {
        await supabase
          .from("profile_photos")
          .update({ is_primary: true })
          .eq("id", remaining[0].id);
      }

      setDeleteTarget(null);
      setNotice({ tone: "success", message: "Photo removed." });
      await load();
    },
    [user, photos, load]
  );

  const movePhoto = useCallback(
    async (photoId: string, direction: "up" | "down") => {
      if (!user) return;
      const idx = photos.findIndex((p) => p.id === photoId);
      if (idx < 0) return;
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= photos.length) return;

      const a = photos[idx];
      const b = photos[swapIdx];

      // Swap positions
      await supabase
        .from("profile_photos")
        .update({ position: b.position })
        .eq("id", a.id);
      await supabase
        .from("profile_photos")
        .update({ position: a.position })
        .eq("id", b.id);

      await load();
    },
    [user, photos, load]
  );

  // Confirm delete modal
  const confirmDelete = useCallback(
    (photoId: string) => {
      Alert.alert(
        "Delete photo",
        "This photo will be permanently removed. This cannot be undone.",
        [
          { text: "Cancel", style: "cancel", onPress: () => setDeleteTarget(null) },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => deletePhoto(photoId),
          },
        ]
      );
    },
    [deletePhoto]
  );

  return (
    <DetailScreenShell
      title="Photos"
      subtitle={`${photos.length} / ${MAX_PHOTOS} intentional photos`}
    >
      {loading ? (
        <SurfaceCard>
          <View style={styles.loadingBox}>
            <ActivityIndicator color={colors.gold300} size="small" />
            <Text style={styles.loadingText}>Loading gallery…</Text>
          </View>
        </SurfaceCard>
      ) : (
        <>
          {/* Guidance card */}
          <SurfaceCard>
            <SectionHeader
              eyebrow="Gallery"
              title="Your photo gallery"
              body="Recent, recognizable photos help your profile feel safe and specific. Your first photo is your cover."
            />

            {/* Photo quality guidance */}
            <View style={styles.guidanceRow}>
              <Text style={styles.guidanceIcon}>✓</Text>
              <Text style={styles.guidanceLabel}>
                Use recent photos where your face is clearly visible
              </Text>
            </View>
            <View style={styles.guidanceRow}>
              <Text style={styles.guidanceIcon}>✓</Text>
              <Text style={styles.guidanceLabel}>
                Your first photo appears as your cover in discovery
              </Text>
            </View>
            <View style={styles.guidanceRow}>
              <Text style={styles.guidanceIcon}>✓</Text>
              <Text style={styles.guidanceLabel}>
                Solo photos work best — avoid group shots as your cover
              </Text>
            </View>
          </SurfaceCard>

          {/* Upload actions */}
          {remainingSlots > 0 && (
            <View style={styles.uploadRow}>
              <Pressable
                onPress={pickAndUpload}
                disabled={uploading}
                style={[styles.uploadBtn, uploading && styles.uploadBtnDisabled]}
              >
                <Text style={styles.uploadBtnIcon}>＋</Text>
                <Text style={styles.uploadBtnLabel}>Choose photo</Text>
              </Pressable>
              <Pressable
                onPress={takeAndUpload}
                disabled={uploading}
                style={[styles.uploadBtn, uploading && styles.uploadBtnDisabled]}
              >
                <Text style={styles.uploadBtnIcon}>⦿</Text>
                <Text style={styles.uploadBtnLabel}>Take photo</Text>
              </Pressable>
            </View>
          )}

          {/* Upload progress */}
          {uploading && uploadProgress && (
            <View style={styles.progressCard}>
              <ActivityIndicator color={colors.gold300} size="small" />
              <Text style={styles.progressText}>{uploadProgress}</Text>
            </View>
          )}

          {/* Photo grid */}
          {photos.length > 0 ? (
            <SurfaceCard>
              <View style={styles.gridHeader}>
                <Text style={styles.gridHeaderEyebrow}>YOUR PHOTOS</Text>
                <Pressable onPress={() => setReorderMode(!reorderMode)}>
                  <Text style={styles.reorderToggle}>
                    {reorderMode ? "Done" : "Reorder"}
                  </Text>
                </Pressable>
              </View>
              <View style={styles.grid}>
                {photos.map((photo, idx) => {
                  const url = publicPhotoUrl(photo.storage_path);
                  return (
                    <View key={photo.id} style={styles.slot}>
                      {url ? (
                        <Image
                          source={{ uri: url }}
                          style={styles.image}
                          resizeMode="cover"
                        />
                      ) : (
                        <Text style={styles.slotText}>Unavailable</Text>
                      )}
                      {/* Cover badge */}
                      {photo.is_primary && (
                        <View style={styles.primaryBadge}>
                          <Text style={styles.primaryBadgeText}>Cover</Text>
                        </View>
                      )}
                      {/* Position label */}
                      <View style={styles.positionBadge}>
                        <Text style={styles.positionBadgeText}>
                          {idx + 1}
                        </Text>
                      </View>
                      {/* Reorder controls */}
                      {reorderMode && (
                        <View style={styles.reorderOverlay}>
                          <View style={styles.reorderBtns}>
                            <Pressable
                              onPress={() => movePhoto(photo.id, "up")}
                              disabled={idx === 0}
                              style={[
                                styles.reorderBtn,
                                idx === 0 && styles.reorderBtnDisabled,
                              ]}
                            >
                              <Text style={styles.reorderBtnGlyph}>↑</Text>
                            </Pressable>
                            <Pressable
                              onPress={() => movePhoto(photo.id, "down")}
                              disabled={idx === photos.length - 1}
                              style={[
                                styles.reorderBtn,
                                idx === photos.length - 1 &&
                                  styles.reorderBtnDisabled,
                              ]}
                            >
                              <Text style={styles.reorderBtnGlyph}>↓</Text>
                            </Pressable>
                          </View>
                          <Pressable
                            onPress={() => confirmDelete(photo.id)}
                            style={styles.deleteBtn}
                          >
                            <Text style={styles.deleteBtnText}>✕ Remove</Text>
                          </Pressable>
                          {!photo.is_primary && (
                            <Pressable
                              onPress={() => setCoverPhoto(photo.id)}
                              style={styles.coverBtn}
                            >
                              <Text style={styles.coverBtnText}>
                                Set as cover
                              </Text>
                            </Pressable>
                          )}
                        </View>
                      )}
                      {/* Tap action when not reordering */}
                      {!reorderMode && (
                        <Pressable
                          style={StyleSheet.absoluteFill}
                          onPress={() => {
                            if (!photo.is_primary) {
                              Alert.alert(
                                "Photo actions",
                                "What would you like to do with this photo?",
                                [
                                  {
                                    text: "Set as cover",
                                    onPress: () => setCoverPhoto(photo.id),
                                  },
                                  {
                                    text: "Delete",
                                    style: "destructive",
                                    onPress: () => confirmDelete(photo.id),
                                  },
                                  { text: "Cancel", style: "cancel" },
                                ]
                              );
                            } else {
                              Alert.alert(
                                "Cover photo",
                                "This is your cover photo. It appears first in discovery.",
                                [
                                  {
                                    text: "Delete",
                                    style: "destructive",
                                    onPress: () => confirmDelete(photo.id),
                                  },
                                  { text: "OK", style: "cancel" },
                                ]
                              );
                            }
                          }}
                        />
                      )}
                    </View>
                  );
                })}
                {/* Empty slots */}
                {Array.from({ length: remainingSlots }).map((_, i) => (
                  <Pressable
                    key={`empty-${i}`}
                    style={styles.slotEmpty}
                    onPress={pickAndUpload}
                    disabled={uploading}
                  >
                    <Text style={styles.addIcon}>＋</Text>
                    <Text style={styles.addLabel}>Add</Text>
                  </Pressable>
                ))}
              </View>
            </SurfaceCard>
          ) : (
            <EmptyState
              icon="▣"
              title="Add your first photo"
              body="Profiles with photos receive more thoughtful attention. Choose a clear, recent photo where you're recognizable."
              action={{ label: "Choose photo", onPress: pickAndUpload }}
              secondaryAction={{
                label: "Take photo",
                onPress: takeAndUpload,
              }}
              safetyCue="Photos are visible only when your profile is discoverable."
            />
          )}

          {/* Notice */}
          {notice && (
            <View
              style={[
                styles.notice,
                notice.tone === "success"
                  ? styles.noticeSuccess
                  : styles.noticeError,
              ]}
            >
              <Text style={styles.noticeIcon}>
                {notice.tone === "success" ? "✓" : "!"}
              </Text>
              <Text style={styles.noticeText}>{notice.message}</Text>
            </View>
          )}

          {/* Slot count hint */}
          {photos.length > 0 && (
            <Text style={styles.slotHint}>
              {remainingSlots > 0
                ? `${remainingSlots} slot${remainingSlots !== 1 ? "s" : ""} remaining`
                : "All 6 photo slots filled"}
            </Text>
          )}
        </>
      )}
    </DetailScreenShell>
  );
}

const styles = StyleSheet.create({
  loadingBox: {
    alignItems: "center",
    gap: 12,
    paddingVertical: 32,
  },
  loadingText: {
    color: colors.mist,
    fontSize: 13,
    fontWeight: "700",
  },
  guidanceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 6,
  },
  guidanceIcon: {
    color: colors.teal300,
    fontSize: 14,
    fontWeight: "900",
  },
  guidanceLabel: {
    color: colors.pearl,
    fontSize: 13,
    fontWeight: "700",
    flex: 1,
  },
  uploadRow: {
    flexDirection: "row",
    gap: 10,
  },
  uploadBtn: {
    flex: 1,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(246,215,154,0.24)",
    backgroundColor: "rgba(217,167,82,0.08)",
    paddingVertical: 16,
    alignItems: "center",
    gap: 6,
  },
  uploadBtnDisabled: {
    opacity: 0.4,
  },
  uploadBtnIcon: {
    color: colors.gold300,
    fontSize: 20,
    fontWeight: "700",
  },
  uploadBtnLabel: {
    color: colors.gold300,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.6,
  },
  progressCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(246,215,154,0.18)",
    backgroundColor: "rgba(217,167,82,0.06)",
    padding: 16,
  },
  progressText: {
    color: colors.gold300,
    fontSize: 13,
    fontWeight: "800",
  },
  gridHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  gridHeaderEyebrow: {
    color: colors.sand,
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 2.4,
  },
  reorderToggle: {
    color: colors.gold300,
    fontSize: 12,
    fontWeight: "900",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  slot: {
    width: "31%",
    aspectRatio: 0.75,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(255,255,255,0.04)",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  slotEmpty: {
    width: "31%",
    aspectRatio: 0.75,
    borderRadius: 18,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "rgba(255,255,255,0.14)",
    backgroundColor: "rgba(255,255,255,0.02)",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  slotText: {
    color: colors.mist,
    fontSize: 10,
    textAlign: "center",
    padding: 8,
  },
  addIcon: {
    color: colors.gold300,
    fontSize: 22,
    fontWeight: "700",
  },
  addLabel: {
    color: colors.mist,
    fontSize: 10,
    fontWeight: "700",
  },
  primaryBadge: {
    position: "absolute",
    top: 6,
    left: 6,
    borderRadius: 999,
    backgroundColor: colors.gold300,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  primaryBadgeText: {
    color: colors.ink,
    fontSize: 8,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  positionBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  positionBadgeText: {
    color: colors.pearl,
    fontSize: 10,
    fontWeight: "900",
  },
  reorderOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    backgroundColor: "rgba(5,7,13,0.88)",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    padding: 6,
  },
  reorderBtns: {
    flexDirection: "row",
    gap: 8,
  },
  reorderBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },
  reorderBtnDisabled: {
    opacity: 0.3,
  },
  reorderBtnGlyph: {
    color: colors.pearl,
    fontSize: 16,
    fontWeight: "900",
  },
  deleteBtn: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,107,122,0.30)",
    backgroundColor: "rgba(255,107,122,0.10)",
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  deleteBtnText: {
    color: colors.danger,
    fontSize: 10,
    fontWeight: "900",
  },
  coverBtn: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(246,215,154,0.30)",
    backgroundColor: "rgba(217,167,82,0.10)",
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  coverBtnText: {
    color: colors.gold300,
    fontSize: 10,
    fontWeight: "900",
  },
  notice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
  },
  noticeSuccess: {
    borderColor: "rgba(109,211,176,0.28)",
    backgroundColor: "rgba(109,211,176,0.08)",
  },
  noticeError: {
    borderColor: "rgba(255,107,122,0.28)",
    backgroundColor: "rgba(255,107,122,0.08)",
  },
  noticeIcon: {
    color: colors.pearl,
    fontWeight: "900",
    fontSize: 16,
  },
  noticeText: {
    flex: 1,
    color: colors.pearl,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "700",
  },
  slotHint: {
    color: colors.ash,
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
  },
});
