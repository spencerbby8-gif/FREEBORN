import { useCallback, useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View, KeyboardAvoidingView, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, radii, type UserMatchRow, type UserProfileRow, type MatchMessageRow } from "@freeborn/shared";
import { ScreenShell } from "@/components/ui/screen-shell";
import { SurfaceCard } from "@/components/ui/surface-card";
import { EmptyState } from "@/components/ui/empty-state";
import { ListSkeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useHaptics } from "@/hooks/use-haptics";
import { supabase } from "@/lib/supabase";
import { emberShadow } from "@/components/magic-background";

export default function MatchesScreen() {
  const { user } = useAuth();
  const haptics = useHaptics();
  const [matches, setMatches] = useState<UserMatchRow[]>([]);
  const [profiles, setProfiles] = useState<Record<string, UserProfileRow>>({});
  const [active, setActive] = useState<string | null>(null);
  const [messages, setMessages] = useState<MatchMessageRow[]>([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase.from("user_matches").select("*").or(`user_a.eq.${user.id},user_b.eq.${user.id}`).eq("status","active").order("created_at", { ascending: false });
    const ms = (data as UserMatchRow[]) ?? [];
    setMatches(ms);
    if (ms.length && !active) setActive(ms[0].id);
    const ids = ms.map(m => m.user_a === user.id ? m.user_b : m.user_a);
    if (ids.length) {
      const { data: ps } = await supabase.from("user_profiles").select("*").in("id", ids);
      const map: Record<string, UserProfileRow> = {};
      (ps ?? []).forEach((p: any) => map[p.id] = p);
      setProfiles(map);
    }
    setLoading(false);
  }, [user, active]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

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
    haptics.light();
    await supabase.from("match_messages").insert({ match_id: active, sender_id: user.id, body: text });
    const { data } = await supabase.from("match_messages").select("*").eq("match_id", active).order("created_at", { ascending: true });
    setMessages((data as MatchMessageRow[]) ?? []);
  };

  const activeMatch = matches.find(m => m.id === active);
  const otherId = activeMatch ? (activeMatch.user_a === user?.id ? activeMatch.user_b : activeMatch.user_a) : null;
  const other = otherId ? profiles[otherId] : null;

  const handleBlockOrReport = () => {
    if (!user || !otherId) return;
    Alert.alert(
      "Safety actions",
      "What would you like to do?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Block",
          style: "destructive",
          onPress: async () => {
            await supabase.from("blocked_users").insert({
              blocker_id: user.id,
              blocked_id: otherId,
              reason: "Blocked from chat",
            });
            haptics.medium();
            setActive(null);
            await load();
          },
        },
        {
          text: "Report",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Report a concern",
              "If you experience harassment, abuse, or a safety issue, please contact our support team directly at support@freeborn.app.",
              [{ text: "OK" }],
            );
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <ScreenShell refreshing={refreshing} onRefresh={handleRefresh}>
        <View style={styles.headerGap}>
          <Text style={styles.eyebrow}>Matches</Text>
          <Text style={styles.title}>Your connections</Text>
        </View>
        <ListSkeleton rows={3} />
      </ScreenShell>
    );
  }

  if (!matches.length) {
    return (
      <ScreenShell refreshing={refreshing} onRefresh={handleRefresh}>
        <View style={styles.headerGap}>
          <Text style={styles.eyebrow}>Matches</Text>
          <Text style={styles.title}>Your connections</Text>
        </View>
        <SurfaceCard style={{ padding: 0 }}>
          <EmptyState
            icon="◈"
            title="No matches yet"
            body="Keep discovering with values and care. Thoughtful likes lead to better connections."
            action={{ label: "Discover", onPress: () => {} }}
            safetyCue="Your preferences and privacy are still active"
          />
        </SurfaceCard>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell noPadding scroll={false} contentStyle={styles.fullScreen}>
      <View style={styles.headerCompact}>
        <Text style={styles.eyebrowSmall}>Matches</Text>
        <Text style={styles.headerCount}>{matches.length} connections</Text>
      </View>

      {/* Match strip */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.matchStrip}>
        {matches.map(m => {
          const oid = m.user_a === user?.id ? m.user_b : m.user_a;
          const p = profiles[oid];
          const isActive = m.id === active;
          return (
            <Pressable key={m.id} onPress={() => setActive(m.id)} style={[styles.matchPill, isActive && styles.matchPillActive]}>
              <Text style={[styles.matchPillText, isActive && styles.matchPillTextActive]}>
                {p?.display_name?.split(" ")[0] ?? "Match"}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Chat area */}
      <View style={styles.chatContainer}>
        {/* Chat header */}
        <View style={styles.chatHeader}>
          <View style={styles.chatAvatar}>
            <Text style={styles.chatAvatarText}>{(other?.display_name ?? "FB").slice(0, 2).toUpperCase()}</Text>
          </View>
          <View style={styles.chatHeaderInfo}>
            <Text style={styles.chatName}>{other?.display_name ?? "Select a match"}</Text>
            <Text style={styles.chatMeta}>{other?.city ?? ""}{other?.occupation ? ` · ${other.occupation}` : ""}</Text>
          </View>
          {otherId && (
            <Pressable
              onPress={handleBlockOrReport}
              style={styles.chatSafetyBtn}
              accessibilityRole="button"
              accessibilityLabel="Block or report this person"
            >
              <Text style={styles.chatSafetyBtnText}>⚑</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.chatDivider} />

        {/* Messages */}
        <ScrollView style={styles.messageList} contentContainerStyle={styles.messageListContent} keyboardShouldPersistTaps="handled">
          {messages.map(msg => {
            const mine = msg.sender_id === user?.id;
            return (
              <View key={msg.id} style={[styles.bubbleRow, mine ? styles.bubbleRowMine : styles.bubbleRowTheirs]}>
                <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
                  <Text style={[styles.bubbleText, mine && styles.bubbleTextMine]}>{msg.body}</Text>
                </View>
                <Text style={styles.bubbleTime}>{new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</Text>
              </View>
            );
          })}
          {!messages.length && active && (
            <View style={styles.emptyChat}>
              <Text style={styles.emptyChatTitle}>Start with something specific.</Text>
              <Text style={styles.emptyChatBody}>A shared value, wellness rhythm, or profile detail beats a generic hello.</Text>
            </View>
          )}
        </ScrollView>

        {/* Input */}
        {active && (
          <View style={styles.inputRow}>
            <TextInput
              value={body}
              onChangeText={setBody}
              placeholder="Message…"
              placeholderTextColor={colors.ash}
              style={styles.input}
              multiline
              maxLength={1000}
            />
            <Pressable onPress={send} style={[styles.sendBtn, !body.trim() && styles.sendBtnDisabled]} disabled={!body.trim()}>
              <Text style={[styles.sendText, !body.trim() && styles.sendTextDisabled]}>Send</Text>
            </Pressable>
          </View>
        )}
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 100,
    gap: 0,
  },
  headerGap: { gap: 6, marginBottom: 16 },
  eyebrow: {
    color: colors.sand,
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 2.4,
  },
  eyebrowSmall: {
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
  headerCompact: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 12,
  },
  headerCount: {
    color: colors.mist,
    fontSize: 12,
    fontWeight: "700",
  },
  matchStrip: {
    gap: 8,
    paddingVertical: 4,
    marginBottom: 12,
  },
  matchPill: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  matchPillActive: {
    backgroundColor: colors.pearl,
    borderColor: colors.pearl,
    ...emberShadow,
  },
  matchPillText: {
    color: colors.pearl,
    fontWeight: "800",
    fontSize: 13,
  },
  matchPillTextActive: {
    color: colors.ink,
  },
  chatContainer: {
    flex: 1,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(9,16,28,0.88)",
    overflow: "hidden",
  },
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  chatAvatar: {
    width: 36,
    height: 36,
    borderRadius: 14,
    backgroundColor: "rgba(239,94,94,0.10)",
    borderWidth: 1,
    borderColor: "rgba(239,94,94,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  chatAvatarText: {
    color: colors.pearl,
    fontSize: 11,
    fontWeight: "900",
  },
  chatHeaderInfo: { flex: 1 },
  chatName: {
    color: colors.pearl,
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  chatMeta: {
    color: colors.mist,
    fontSize: 12,
    marginTop: 2,
  },
  chatSafetyBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  chatSafetyBtnText: {
    color: colors.ash,
    fontSize: 14,
    fontWeight: "700",
  },
  chatDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  messageList: { flex: 1 },
  messageListContent: {
    paddingVertical: 16,
    paddingHorizontal: 18,
    gap: 10,
  },
  bubbleRow: { maxWidth: "85%" },
  bubbleRowMine: { alignSelf: "flex-end" },
  bubbleRowTheirs: { alignSelf: "flex-start" },
  bubble: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  bubbleMine: {
    backgroundColor: colors.pearl,
    borderBottomRightRadius: 6,
  },
  bubbleTheirs: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderBottomLeftRadius: 6,
  },
  bubbleText: {
    color: colors.pearl,
    fontSize: 14,
    lineHeight: 20,
  },
  bubbleTextMine: {
    color: colors.ink,
  },
  bubbleTime: {
    color: colors.ash,
    fontSize: 10,
    marginTop: 4,
    marginHorizontal: 4,
  },
  emptyChat: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.025)",
    padding: 22,
    alignItems: "center",
    marginTop: 24,
  },
  emptyChatTitle: {
    color: colors.pearl,
    fontSize: 16,
    fontWeight: "900",
    textAlign: "center",
  },
  emptyChatBody: {
    color: colors.mist,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 6,
    textAlign: "center",
    maxWidth: 260,
  },
  inputRow: {
    flexDirection: "row",
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignItems: "flex-end",
  },
  input: {
    flex: 1,
    color: colors.pearl,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 11,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    fontSize: 14,
    fontWeight: "600",
  },
  sendBtn: {
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: colors.pearl,
    ...emberShadow,
  },
  sendBtnDisabled: {
    backgroundColor: "rgba(255,255,255,0.10)",
    shadowOpacity: 0,
    elevation: 0,
  },
  sendText: {
    color: colors.ink,
    fontWeight: "900",
    fontSize: 13,
  },
  sendTextDisabled: {
    color: colors.mist,
  },
});
