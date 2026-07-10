import { useEffect, useState, useCallback } from "react";
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

  const load = useCallback(async () => {
    if (!user) return;
    const { data: inc } = await supabase.from("user_swipes").select("liker_id, created_at, action").eq("liked_id", user.id).in("action", ["like","superlike"]).order("created_at", { ascending: false }).limit(40);
    setIncoming(inc ?? []);
    const { data: out } = await supabase.from("user_swipes").select("liked_id, created_at, action").eq("liker_id", user.id).in("action", ["like","superlike"]).order("created_at", { ascending: false }).limit(40);
    setOutgoing(out ?? []);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  return (
    <LinearGradient colors={[colors.night, colors.midnight, colors.slate]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          <Wordmark />
          <Text style={styles.title}>Likes</Text>
          <Text style={styles.subtitle}>Who’s interested — Phase 3</Text>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Liked you · {incoming.length}</Text>
            {incoming.map((s) => (
              <View key={s.liker_id} style={styles.row}>
                <Text style={styles.mono}>{s.liker_id.slice(0,8)}…</Text>
                <Text style={styles.meta}>{s.action} · {new Date(s.created_at).toLocaleDateString()}</Text>
              </View>
            ))}
            {!incoming.length && <Text style={styles.empty}>No likes yet — you’re discoverable.</Text>}
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>You liked · {outgoing.length}</Text>
            {outgoing.map((s) => (
              <View key={s.liked_id} style={styles.row}>
                <Text style={styles.mono}>{s.liked_id.slice(0,8)}…</Text>
                <Text style={styles.meta}>{s.action} · {new Date(s.created_at).toLocaleDateString()}</Text>
              </View>
            ))}
            {!outgoing.length && <Text style={styles.empty}>Start discovering profiles.</Text>}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 110, gap: 16 },
  title: { color: colors.pearl, fontSize: 28, fontWeight: "800", letterSpacing: -1, marginTop: 12 },
  subtitle: { color: colors.mist, fontSize: 13 },
  card: { borderRadius: radii.xl, borderWidth: 1, borderColor: colors.lineStrong, backgroundColor: "rgba(9,16,28,0.88)", padding: 16, gap: 10 },
  cardTitle: { color: colors.pearl, fontSize: 16, fontWeight: "700", marginBottom: 4 },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.06)" },
  mono: { color: colors.pearl, fontFamily: "monospace", fontSize: 12 },
  meta: { color: colors.mist, fontSize: 12 },
  empty: { color: colors.mist, fontSize: 13 },
});
