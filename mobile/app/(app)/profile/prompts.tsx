import { useCallback, useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { colors, profilePrompts, type UserProfileRow, type PromptAnswer } from "@freeborn/shared";
import { DetailScreenShell } from "@/components/ui/detail-screen-shell";
import { SurfaceCard } from "@/components/ui/surface-card";
import { SectionHeader } from "@/components/ui/section-header";
import { SaveActionBar } from "@/components/ui/save-action-bar";
import { DetailSkeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";

export default function PromptsScreen() {
  const { user } = useAuth();
  const [answers, setAnswers] = useState<PromptAnswer[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<{ tone: "success" | "error"; message: string } | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from("user_profiles").select("*").eq("id", user.id).maybeSingle<UserProfileRow>();
    setAnswers(data?.prompt_answers ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const addPrompt = (prompt: string) => {
    if (answers.length >= 3) return;
    if (answers.find(a => a.prompt === prompt)) return;
    setAnswers([...answers, { prompt, answer: "" }]);
    setPickerVisible(false);
  };

  const updateAnswer = (index: number, answer: string) => {
    const next = [...answers];
    next[index] = { ...next[index], answer };
    setAnswers(next);
  };

  const removeAnswer = (index: number) => {
    setAnswers(answers.filter((_, i) => i !== index));
  };

  const save = async () => {
    if (!user) return;
    setNotice(null);
    const valid = answers.filter(a => a.answer.trim().length > 0);
    setSaving(true);
    const { error } = await supabase.from("user_profiles").update({
      prompt_answers: valid,
      updated_at: new Date().toISOString(),
    }).eq("id", user.id);
    if (error) { setNotice({ tone: "error", message: "Could not save. Please try again." }); }
    else { setNotice({ tone: "success", message: "Prompts saved." }); await load(); }
    setSaving(false);
  };

  const availablePrompts = profilePrompts.filter(p => !answers.find(a => a.prompt === p));

  if (loading) {
    return (
      <DetailScreenShell title="Prompts" subtitle="Show your voice">
        <DetailSkeleton />
      </DetailScreenShell>
    );
  }

  return (
    <DetailScreenShell title="Prompts" subtitle="Show your voice">
      <SurfaceCard>
        <SectionHeader eyebrow="Prompts" title="Answer up to 3" body="Prompts let people start specific conversations. Choose questions that reveal something real." />

        {answers.map((item, i) => (
          <View key={item.prompt} style={styles.promptCard}>
            <View style={styles.promptHeader}>
              <Text style={styles.promptQuestion} numberOfLines={2}>{item.prompt}</Text>
              <Pressable onPress={() => removeAnswer(i)} hitSlop={8}>
                <Text style={styles.removeBtn}>✕</Text>
              </Pressable>
            </View>
            <TextInput
              value={item.answer}
              onChangeText={v => updateAnswer(i, v.slice(0, 300))}
              placeholder="Your answer…"
              placeholderTextColor="rgba(154,161,184,0.38)"
              multiline
              textAlignVertical="top"
              style={styles.answerInput}
            />
            <View style={styles.answerFooter}>
              <Text style={styles.answerHint}>Be specific and genuine.</Text>
              <Text style={styles.answerCounter}>{item.answer.length} / 300</Text>
            </View>
          </View>
        ))}

        {answers.length < 3 && (
          <Pressable onPress={() => setPickerVisible(!pickerVisible)} style={styles.addPromptBtn}>
            <Text style={styles.addPromptIcon}>＋</Text>
            <Text style={styles.addPromptLabel}>Add a prompt</Text>
          </Pressable>
        )}

        {pickerVisible && (
          <View style={styles.promptList}>
            {availablePrompts.map(prompt => (
              <Pressable key={prompt} onPress={() => addPrompt(prompt)} style={styles.promptOption}>
                <Text style={styles.promptOptionText}>{prompt}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </SurfaceCard>

      <SaveActionBar onSave={save} saving={saving} notice={notice} />
    </DetailScreenShell>
  );
}

const styles = StyleSheet.create({
  loadingBox: { alignItems: "center", gap: 12, paddingVertical: 32 },
  loadingText: { color: colors.mist, fontSize: 13, fontWeight: "700" },
  promptCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.03)",
    padding: 16,
    gap: 10,
  },
  promptHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 8 },
  promptQuestion: { color: colors.gold300, fontSize: 13, fontWeight: "800", flex: 1, lineHeight: 18 },
  removeBtn: { color: colors.ash, fontSize: 16, fontWeight: "700", padding: 4 },
  answerInput: {
    minHeight: 80,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    backgroundColor: "rgba(255,255,255,0.03)",
    color: colors.pearl,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
  answerFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  answerHint: { color: colors.ash, fontSize: 10, fontWeight: "600" },
  answerCounter: { color: colors.ash, fontSize: 10, fontWeight: "700", letterSpacing: 0.8 },
  addPromptBtn: {
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "rgba(255,255,255,0.14)",
    paddingVertical: 18,
    alignItems: "center",
    gap: 6,
  },
  addPromptIcon: { color: colors.gold300, fontSize: 20, fontWeight: "700" },
  addPromptLabel: { color: colors.mist, fontSize: 13, fontWeight: "700" },
  promptList: { gap: 4, maxHeight: 280 },
  promptOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  promptOptionText: { color: colors.pearl, fontSize: 13, fontWeight: "600", lineHeight: 18 },
});
