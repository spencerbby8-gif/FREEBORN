import { Text, StyleSheet, View } from "react-native";
import { colors } from "@freeborn/shared";

type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  body?: string;
};

export function SectionHeader({ eyebrow, title, body }: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.title}>{title}</Text>
      {body ? <Text style={styles.body}>{body}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 5 },
  eyebrow: {
    color: colors.sand,
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 2.4,
  },
  title: {
    color: colors.pearl,
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: -0.6,
    lineHeight: 24,
  },
  body: {
    color: colors.mist,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 2,
  },
});
