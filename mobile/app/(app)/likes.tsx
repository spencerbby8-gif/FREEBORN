import { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { colors, radii, type UserProfileRow } from "@freeborn/shared";
import { ScreenShell } from "@/components/ui/screen-shell";
import { SurfaceCard } from "@/components/ui/surface-card";
import { EmptyState } from "@/components/ui/empty-state";
import { ListSkeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";

export default function LikesScreen() {
  const { user } = useAuth();
  const [incoming, setIncoming] = useState<any[]>([]);
  const [outgoing, setOutgoing] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Record<string, UserProfileRow>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data: inc } = await supabase.from("user_swipes").select("liker_id, created_at, action").eq("liked_id", user.id).in("action", ["like","superlike"]).order("created_at", { ascending: false }).limit(40);
    const incomingRows = inc ?? [];
    setIncoming(incomingRows);
    const { data: out } = await supabase.from("user_swipes").select("liked_id, created_at, action").eq("liker_id", user.id).in("action", ["like","superlike"]).order("created_at", { ascending: false }).limit(40);
    const outgoingRows = out ?? [];
    setOutgoing(outgoingRows);
    const ids = Array.from(new Set([...incomingRows.map((row: any) => row.liker_id), ...outgoingRows.map((row: any) => row.liked_id)]));
    if (ids.length) {
      const { data: people } = await supabase.from("user_profiles").select("*").in("id", ids);
      const map: Record<string, UserProfileRow> = {};
      (people as UserProfileRow[] | null)?.forEach((person) => { map[person.id] = person; });
      setProfiles(map);
    } else {
      setProfiles({});
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  return (
    <ScreenShell>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Likes</Text>
        <Text style={styles.title}>Signals worth considering</Text>
        <Text style={styles.subtitle}>
          {incoming.length} people noticed your profile. Read with values and context before you respond.
        </Text>
      </View>

      {loading ? (
        <>
          <ListSkeleton rows={3} />
          <ListSkeleton rows={2} />
        </>
      ) : (
        <>
          {/* Incoming */}
          <SurfaceCard gap={0}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Liked you</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{incoming.length}</Text>
              </View>
            </View>
            {incoming.length > 0 ? (
              incoming.map((s: any, i: number) => {
                const person = profiles[s.liker_id];
                return (
                  <View key={s.liker_id} style={[styles.row, i < incoming.length - 1 && styles.rowBorder]}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{(person?.display_name ?? "FB").slice(0, 2).toUpperCase()}</Text>
                    </View>
                    <View style={styles.rowInfo}>
                      <Text style={styles.rowTitle}>{person?.display_name ?? "Freeborn member"}</Text>
                      <Text style={styles.rowMeta}>
                        {person?.city ?? "Nearby"} · {s.action === "superlike" ? "★ Spark" : "Liked you"} · {new Date(s.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                    {s.action === "superlike" && (
                      <View style={styles.sparkDot}>
                        <Text style={styles.sparkDotText}>★</Text>
                      </View>
                    )}
                  </View>
                );
              })
            ) : (
              <EmptyState
                icon="♥"
                title="No likes yet"
                body="Clear photos, values-forward interests, and a specific bio invite better attention."
                action={{ label: "Edit profile", onPress: () => router.push("/(app)/profile") }}
              />
            )}
          </SurfaceCard>

          {/* Outgoing */}
          <SurfaceCard gap={0}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>You liked</Text>
              <View style={[styles.countBadge, styles.countBadgeAlt]}>
                <Text style={[styles.countText, styles.countTextAlt]}>{outgoing.length}</Text>
              </View>
            </View>
            {outgoing.length > 0 ? (
              outgoing.map((s: any, i: number) => {
                const person = profiles[s.liked_id];
                return (
                  <View key={s.liked_id} style={[styles.row, i < outgoing.length - 1 && styles.rowBorder]}>
                    <View style={[styles.avatar, styles.avatarAlt]}>
                      <Text style={[styles.avatarText, styles.avatarTextAlt]}>{(person?.display_name ?? "★").slice(0, 2).toUpperCase()}</Text>
                    </View>
                    <View style={styles.rowInfo}>
                      <Text style={styles.rowTitle}>{person?.display_name ?? (s.action === "superlike" ? "Spark sent" : "Profile liked")}</Text>
                      <Text style={styles.rowMeta}>{person?.city ?? "Nearby"} · {new Date(s.created_at).toLocaleDateString()}</Text>
                    </View>
                  </View>
                );
              })
            ) : (
              <EmptyState
                icon="✦"
                title="Nothing sent yet"
                body="Start in Discover and choose profiles whose values, rituals, or long-term direction you would genuinely ask about."
                action={{ label: "Discover", onPress: () => router.push("/(app)") }}
              />
            )}
          </SurfaceCard>
        </>
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  header: { gap: 6 },
  eyebrow: {
    color: colors.sand,
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 2.4,
  },
  title: {
    color: colors.pearl,
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: -1.6,
    lineHeight: 32,
  },
  subtitle: {
    color: colors.mist,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
    marginBottom: 4,
  },
  cardTitle: {
    color: colors.pearl,
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: -0.2,
  },
  countBadge: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(241,201,122,0.20)",
    backgroundColor: "rgba(241,201,122,0.10)",
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  countBadgeAlt: {
    borderColor: "rgba(138,110,242,0.20)",
    backgroundColor: "rgba(138,110,242,0.10)",
  },
  countText: {
    color: colors.gold300,
    fontSize: 11,
    fontWeight: "900",
  },
  countTextAlt: {
    color: colors.violet300,
  },
  row: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.05)" },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: "rgba(239,94,94,0.10)",
    borderWidth: 1,
    borderColor: "rgba(239,94,94,0.16)",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarAlt: {
    backgroundColor: "rgba(138,110,242,0.10)",
    borderColor: "rgba(138,110,242,0.16)",
  },
  avatarText: { color: colors.pearl, fontSize: 13, fontWeight: "900" },
  avatarTextAlt: { color: colors.violet300 },
  rowInfo: { flex: 1 },
  rowTitle: { color: colors.pearl, fontSize: 14, fontWeight: "800" },
  rowMeta: { color: colors.mist, fontSize: 12, marginTop: 3, lineHeight: 16 },
  sparkDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(138,110,242,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  sparkDotText: { color: colors.violet300, fontSize: 11, fontWeight: "900" },
});
