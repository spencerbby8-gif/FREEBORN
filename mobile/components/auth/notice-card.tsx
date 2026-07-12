import { StyleSheet, Text, View } from "react-native";
import { colors, radii } from "@freeborn/shared";

type NoticeCardProps = {
  title: string;
  body: string;
  tone: "success" | "error";
};

export function NoticeCard({ title, body, tone }: NoticeCardProps) {
  const success = tone === "success";
  const accent = success ? colors.success : colors.danger;

  return (
    <View
      style={[
        styles.container,
        {
          borderColor: success ? "rgba(109,211,176,0.28)" : "rgba(255,107,122,0.28)",
          backgroundColor: success ? "rgba(109,211,176,0.08)" : "rgba(255,107,122,0.08)",
        },
      ]}
    >
      <View style={[styles.icon, { backgroundColor: success ? "rgba(109,211,176,0.16)" : "rgba(255,107,122,0.16)" }]}>
        <Text style={[styles.iconGlyph, { color: accent }]}>{success ? "✓" : "!"}</Text>
      </View>
      <View style={styles.textBlock}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>{body}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
  },
  icon: {
    width: 26,
    height: 26,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  iconGlyph: { fontSize: 14, fontWeight: "900" },
  textBlock: { flex: 1 },
  title: {
    color: colors.pearl,
    fontSize: 14,
    fontWeight: "800",
  },
  body: {
    marginTop: 4,
    color: colors.pearl,
    fontSize: 13,
    lineHeight: 19,
    opacity: 0.82,
  },
});
