import { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { colors, radii, type UserMatchRow, type UserProfileRow, type MatchMessageRow } from "@freeborn/shared";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { Wordmark } from "@/components/wordmark";

export default function MatchesScreen() {
  const { user } = useAuth();
  const [matches, setMatches] = useState<UserMatchRow[]>([]);
  const [profiles, setProfiles] = useState<Record<string, UserProfileRow>>({});
  const [active, setActive] = useState<string | null>(null);
  const [messages, setMessages] = useState<MatchMessageRow[]>([]);
  const [body, setBody] = useState("");

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from("user_matches").select("*").or(`user_a.eq.${user.id},user_b.eq.${user.id}`).eq("status","active").order("created_at", { ascending: false });
    const ms = (data as UserMatchRow[]) ?? [];
    setMatches(ms);
    if (ms.length && !active) setActive(ms[0].id);
    const ids = ms.map(m => m.user_a === user.id ? m.user_b : m.user_a);
    if (ids.length) {
      const { data: ps } = await supabase.from("user_profiles").select("*").in("id", ids);
      const map: Record<string, UserProfileRow> = {};
      (ps ?? []).forEach((p:any) => map[p.id] = p);
      setProfiles(map);
    }
  }, [user, active]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!active) return;
    let mounted = true;
    (async () => {
      const { data } = await supabase.from("match_messages").select("*").eq("match_id", active).order("created_at", { ascending: true });
      if (mounted) setMessages((data as MatchMessageRow[]) ?? []);
    })();
    return () => { mounted = false; };
  }, [active]);

  const send = async () => {
    if (!body.trim() || !active || !user) return;
    const text = body.trim();
    setBody("");
    await supabase.from("match_messages").insert({ match_id: active, sender_id: user.id, body: text });
    const { data } = await supabase.from("match_messages").select("*").eq("match_id", active).order("created_at", { ascending: true });
    setMessages((data as MatchMessageRow[]) ?? []);
  };

  const activeMatch = matches.find(m => m.id === active);
  const otherId = activeMatch ? (activeMatch.user_a === user?.id ? activeMatch.user_b : activeMatch.user_a) : null;
  const other = otherId ? profiles[otherId] : null;

  return (
    <LinearGradient colors={[colors.night, colors.midnight, colors.slate]} style={{ flex:1 }}>
      <SafeAreaView style={{ flex:1 }}>
        <View style={styles.container}>
          <View style={styles.header}><Wordmark /><Text style={styles.headerTag}>{matches.length} matches</Text></View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.matchStrip}>
            {matches.map(m => {
              const oid = m.user_a === user?.id ? m.user_b : m.user_a;
              const p = profiles[oid];
              const isActive = m.id === active;
              return (
                <Pressable key={m.id} onPress={() => setActive(m.id)} style={[styles.matchPill, isActive && styles.matchPillActive]}>
                  <Text style={[styles.matchPillText, isActive && { color: colors.ink }]}>{p?.display_name?.split(" ")[0] ?? "Match"}</Text>
                </Pressable>
              );
            })}
            {!matches.length && <Text style={styles.empty}>No matches yet.</Text>}
          </ScrollView>

          <View style={styles.chatBox}>
            <Text style={styles.chatTitle}>{other?.display_name ?? "Select a match"}</Text>
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingVertical: 12, gap: 10 }}>
              {messages.map(msg => {
                const mine = msg.sender_id === user?.id;
                return (
                  <View key={msg.id} style={{ alignItems: mine ? "flex-end" : "flex-start" }}>
                    <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
                      <Text style={[styles.bubbleText, mine && { color: colors.ink }]}>{msg.body}</Text>
                    </View>
                  </View>
                );
              })}
              {!messages.length && active && <Text style={styles.empty}>Say hello — thoughtful first messages win.</Text>}
            </ScrollView>
            {active && (
              <View style={styles.inputRow}>
                <TextInput value={body} onChangeText={setBody} placeholder="Message…" placeholderTextColor={colors.mist}
                  style={styles.input} multiline />
                <Pressable onPress={send} style={styles.sendBtn}><Text style={styles.sendText}>Send</Text></Pressable>
              </View>
            )}
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, padding: 16, paddingBottom: 90 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  headerTag: { color: colors.mist, fontSize: 12, fontWeight: "700" },
  matchStrip: { gap: 8, paddingVertical: 6, paddingRight: 16 },
  matchPill: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999, borderWidth: 1, borderColor: colors.lineStrong, backgroundColor: "rgba(255,255,255,0.05)", marginRight: 8 },
  matchPillActive: { backgroundColor: colors.pearl },
  matchPillText: { color: colors.pearl, fontWeight: "700", fontSize: 13 },
  empty: { color: colors.mist, paddingVertical: 8 },
  chatBox: { flex: 1, borderRadius: radii.xl, borderWidth: 1, borderColor: colors.lineStrong, backgroundColor: "rgba(9,16,28,0.9)", marginTop: 12, padding: 14 },
  chatTitle: { color: colors.pearl, fontSize: 18, fontWeight: "800", marginBottom: 6 },
  bubble: { maxWidth: "80%", borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleMine: { backgroundColor: colors.pearl },
  bubbleTheirs: { backgroundColor: "rgba(255,255,255,0.07)", borderWidth: 1, borderColor: colors.lineStrong },
  bubbleText: { color: colors.pearl, fontSize: 14, lineHeight: 20 },
  inputRow: { flexDirection: "row", gap: 8, borderTopWidth: 1, borderTopColor: colors.lineStrong, paddingTop: 10, alignItems: "flex-end" },
  input: { flex: 1, color: colors.pearl, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10, maxHeight: 100, borderWidth: 1, borderColor: colors.lineStrong, fontSize: 14 },
  sendBtn: { backgroundColor: colors.pearl, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12 },
  sendText: { color: colors.ink, fontWeight: "900", fontSize: 13 },
});
