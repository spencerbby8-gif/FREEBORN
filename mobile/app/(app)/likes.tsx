import { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { colors, radii, type UserProfileRow } from "@freeborn/shared";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { Wordmark } from "@/components/wordmark";

export default function LikesScreen() {
  const { user } = useAuth();
  const [incoming, setIncoming] = useState<any[]>([]);
  const [outgoing, setOutgoing] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Record<string, UserProfileRow>>({});

  const load = useCallback(async () => {
    if (!user) return;
    const { data: inc } = await supabase.from("user_swipes").select("liker_id, created_at, action").eq("liked_id", user.id).in("action", ["like","superlike"]).order("created_at", { ascending: false }).limit(40);
    const incomingRows = inc ?? [];
    setIncoming(incomingRows);
    const { data: out } = await supabase.from("user_swipes").select("liked_id, created_at, action").eq("liker_id", user.id).in("action", ["like","superlike"]).order("created_at", { ascending: false }).limit(40);
    const outgoingRows = out ?? [];
    setOutgoing(outgoingRows);
    const ids = Array.from(new Set([...incomingRows.map((row) => row.liker_id), ...outgoingRows.map((row) => row.liked_id)]));
    if (ids.length) {
      const { data: people } = await supabase.from("user_profiles").select("*").in("id", ids);
      const map: Record<string, UserProfileRow> = {};
      (people as UserProfileRow[] | null)?.forEach((person) => { map[person.id] = person; });
      setProfiles(map);
    } else {
      setProfiles({});
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  return (
    <LinearGradient colors={[colors.night, colors.midnight, colors.slate]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          <Wordmark />
          <Text style={styles.title}>Signals worth considering</Text>
          <Text style={styles.subtitle}>{incoming.length} people noticed your profile. Read with context before you respond.</Text>

          {/* Incoming */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Liked you</Text>
              <Text style={styles.cardCount}>{incoming.length}</Text>
            </View>
            {incoming.length > 0 ? (
              incoming.map((s, i) => {
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
                </View>
                );
              })
            ) : (
              <Text style={styles.emptyText}>No likes yet — your profile is visible and discoverable.</Text>
            )}
          </View>

          {/* Outgoing */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>You liked</Text>
              <Text style={styles.cardCount}>{outgoing.length}</Text>
            </View>
            {outgoing.length > 0 ? (
              outgoing.map((s, i) => {
                const person = profiles[s.liked_id];
                return (
                <View key={s.liked_id} style={[styles.row, i < outgoing.length - 1 && styles.rowBorder]}>
                  <View style={[styles.avatar, { backgroundColor: "rgba(140,207,255,0.10)" }]}>
                    <Text style={[styles.avatarText, { color: colors.accentBlue }]}>{(person?.display_name ?? "★").slice(0, 2).toUpperCase()}</Text>
                  </View>
                  <View style={styles.rowInfo}>
                    <Text style={styles.rowTitle}>{person?.display_name ?? (s.action === "superlike" ? "Spark sent" : "Profile liked")}</Text>
                    <Text style={styles.rowMeta}>{person?.city ?? "Nearby"} · {new Date(s.created_at).toLocaleDateString()}</Text>
                  </View>
                </View>
                );
              })
            ) : (
              <Text style={styles.emptyText}>Start discovering profiles you like.</Text>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 120, gap: 16 },
  title: { color: colors.pearl, fontSize: 28, fontWeight: "800", letterSpacing: -1, marginTop: 8 },
  subtitle: { color: colors.mist, fontSize: 13 },
  card: { borderRadius: radii.xl, borderWidth: 1, borderColor: colors.lineStrong, backgroundColor: "rgba(9,16,28,0.88)", padding: 16 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  cardTitle: { color: colors.pearl, fontSize: 16, fontWeight: "700" },
  cardCount: { color: colors.stone, fontSize: 14, fontWeight: "700" },
  row: { flexDirection: "row", gap: 12, paddingVertical: 12, alignItems: "center" },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.06)" },
  avatar: { width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(255,133,120,0.12)", justifyContent: "center", alignItems: "center" },
  avatarText: { color: colors.pearl, fontSize: 12, fontWeight: "800" },
  rowInfo: { flex: 1 },
  rowTitle: { color: colors.pearl, fontSize: 14, fontWeight: "700" },
  rowMeta: { color: colors.mist, fontSize: 12, marginTop: 2 },
  emptyText: { color: colors.mist, fontSize: 13, paddingVertical: 8 },
});
