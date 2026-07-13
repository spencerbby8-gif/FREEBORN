import { StyleSheet, Text, View } from "react-native";
import { colors } from "@freeborn/shared";
import type { StepProps } from "../shared";

export function WelcomeStep(_props: StepProps) {
  return (
    <View style={styles.cards}>
      {([
        ["Private by default", "Birth date, email, and exact location stay out of public view."],
        ["Safety checked", "Contact details are blocked from your profile text."],
        ["One step at a time", "Each screen has one job. Progress saves automatically."],
      ] as const).map(([title, body]) => (
        <View key={title} style={styles.card}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardBody}>{body}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  cards: { gap: 10 },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.03)",
    padding: 16,
  },
  cardTitle: { color: colors.pearl, fontSize: 15, fontWeight: "800" },
  cardBody: { color: colors.mist, fontSize: 13, lineHeight: 20, marginTop: 4 },
});
