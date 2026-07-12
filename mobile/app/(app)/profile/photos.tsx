import { useCallback, useEffect, useMemo, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { colors, type ProfilePhoto } from "@freeborn/shared";
import { DetailScreenShell } from "@/components/ui/detail-screen-shell";
import { SurfaceCard } from "@/components/ui/surface-card";
import { SectionHeader } from "@/components/ui/section-header";
import { EmptyState } from "@/components/ui/empty-state";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { publicPhotoUrl } from "@/hooks/use-profile-data";

export default function PhotosScreen() {
  const { user } = useAuth();
  const [photos, setPhotos] = useState<ProfilePhoto[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from("profile_photos").select("*").eq("user_id", user.id).order("position");
    setPhotos((data as ProfilePhoto[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  return (
    <DetailScreenShell title="Photos" subtitle={`${photos.length} / 6 intentional photos`}>
      {loading ? null : (
        <SurfaceCard>
          <SectionHeader eyebrow="Gallery" title="Your photo gallery" body="Recent, recognizable photos help your profile feel safe and specific. Upload from web for now." />
          {photos.length > 0 ? (
            <View style={styles.grid}>
              {photos.map(photo => {
                const url = publicPhotoUrl(photo.storage_path);
                return (
                  <View key={photo.id} style={styles.slot}>
                    {url ? <Image source={{ uri: url }} style={styles.image} resizeMode="cover" /> : <Text style={styles.slotText}>Unavailable</Text>}
                    {photo.is_primary ? <View style={styles.primaryBadge}><Text style={styles.primaryBadgeText}>Primary</Text></View> : null}
                  </View>
                );
              })}
              {/* Empty slots */}
              {Array.from({ length: Math.max(0, 6 - photos.length) }).map((_, i) => (
                <View key={`empty-${i}`} style={styles.slot}>
                  <Text style={styles.addIcon}>＋</Text>
                </View>
              ))}
            </View>
          ) : (
            <EmptyState
              icon="＋"
              title="Add your first photo"
              body="Uploads are managed from the web profile for now. Your photos will appear here as soon as they are added."
            />
          )}
        </SurfaceCard>
      )}
    </DetailScreenShell>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  slot: { width: "31%", aspectRatio: 0.8, borderRadius: 18, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", backgroundColor: "rgba(255,255,255,0.04)", overflow: "hidden", alignItems: "center", justifyContent: "center" },
  image: { width: "100%", height: "100%" },
  slotText: { color: colors.mist, fontSize: 10, textAlign: "center", padding: 8 },
  addIcon: { color: colors.ash, fontSize: 24, fontWeight: "700" },
  primaryBadge: { position: "absolute", bottom: 6, borderRadius: 999, backgroundColor: colors.gold300, paddingHorizontal: 8, paddingVertical: 4 },
  primaryBadgeText: { color: colors.ink, fontSize: 9, fontWeight: "900", textTransform: "uppercase" },
});
