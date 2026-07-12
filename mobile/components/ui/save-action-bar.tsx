import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "@freeborn/shared";
import { emberShadow } from "@/components/magic-background";

type SaveActionBarProps = {
  onSave: () => void;
  saving?: boolean;
  disabled?: boolean;
  label?: string;
  savingLabel?: string;
  notice?: { tone: "success" | "error"; message: string } | null;
};

export function SaveActionBar({ onSave, saving, disabled, label = "Save", savingLabel = "Saving…", notice }: SaveActionBarProps) {
  return (
    <View style={styles.container}>
      {notice && (
        <View style={[styles.notice, notice.tone === "success" ? styles.noticeSuccess : styles.noticeError]}>
          <Text style={styles.noticeIcon}>{notice.tone === "success" ? "✓" : "!"}</Text>
          <Text style={styles.noticeText}>{notice.message}</Text>
        </View>
      )}
      <Pressable
        onPress={onSave}
        disabled={saving || disabled}
        style={[styles.saveBtn, (saving || disabled) && styles.saveBtnDisabled]}
      >
        <Text style={styles.saveText}>{saving ? savingLabel : label}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12, marginTop: 8 },
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
  saveBtn: {
    backgroundColor: colors.pearl,
    borderRadius: 22,
    paddingVertical: 16,
    alignItems: "center",
    ...emberShadow,
  },
  saveBtnDisabled: { opacity: 0.5 },
  saveText: { color: colors.ink, fontSize: 14, fontWeight: "900" },
});
