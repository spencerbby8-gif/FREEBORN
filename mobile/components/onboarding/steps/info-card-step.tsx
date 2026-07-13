import { StyleSheet, Text, View } from "react-native";
import { colors } from "@freeborn/shared";

type Props = {
  title: string;
  body: string;
  tip: string;
};

/** Reusable info-card for photos, discovery_preferences, and verification steps. */
export function InfoCardStep({ title, body, tip }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
      <Text style={styles.tip}>{tip}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.03)",
    padding: 18,
    gap: 8,
  },
  title: { color: colors.pearl, fontSize: 16, fontWeight: "800" },
  body: { color: colors.mist, fontSize: 14, lineHeight: 22 },
  tip: { color: colors.gold300, fontSize: 12, fontWeight: "700", lineHeight: 18 },
});
