import { StyleSheet, Text, View } from "react-native";
import { colors, radii } from "@freeborn/shared";

type NoticeCardProps = {
  title: string;
  body: string;
  tone: "success" | "error";
};

export function NoticeCard({ title, body, tone }: NoticeCardProps) {
  return (
    <View style={[styles.container, tone === "success" ? styles.success : styles.error]}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: 16,
  },
  success: {
    borderColor: "rgba(127, 216, 184, 0.32)",
    backgroundColor: "rgba(127, 216, 184, 0.12)",
  },
  error: {
    borderColor: "rgba(255, 158, 160, 0.32)",
    backgroundColor: "rgba(255, 158, 160, 0.12)",
  },
  title: {
    color: colors.pearl,
    fontSize: 14,
    fontWeight: "700",
  },
  body: {
    marginTop: 6,
    color: colors.pearl,
    fontSize: 13,
    lineHeight: 21,
    opacity: 0.88,
  },
});
