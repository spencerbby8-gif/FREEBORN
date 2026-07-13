import { StyleSheet, Text, View } from "react-native";
import { colors } from "@freeborn/shared";
import type { StepProps } from "../shared";

export function FinishStep(_props: StepProps) {
  return (
    <View style={styles.card}>
      <View style={styles.check}>
        <Text style={styles.checkGlyph}>✓</Text>
      </View>
      <Text style={styles.title}>Your profile is ready</Text>
      <Text style={styles.subtitle}>
        You can refine anything from your profile later. What people will see: your
        name, age, city, bio, intentions, values, interests, lifestyle, and photos.
        They will not see your email, full birth date, or private account details.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: "center", gap: 12, paddingVertical: 8 },
  check: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.gold300,
  },
  checkGlyph: { color: colors.ink, fontSize: 28, fontWeight: "900" },
  title: { color: colors.pearl, fontSize: 20, fontWeight: "900", letterSpacing: -0.4 },
  subtitle: { color: colors.mist, fontSize: 14, lineHeight: 22, textAlign: "center" },
});
