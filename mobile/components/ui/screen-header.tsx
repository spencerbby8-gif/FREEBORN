import { type ReactNode } from "react";
import { Text, View, StyleSheet } from "react-native";
import { colors } from "@freeborn/shared";
import { Wordmark } from "@/components/wordmark";

type ScreenHeaderProps = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  right?: ReactNode;
};

export function ScreenHeader({ eyebrow, title, subtitle, right }: ScreenHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Wordmark />
        {right}
      </View>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  eyebrow: {
    color: colors.sand,
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 2.4,
  },
  title: {
    color: colors.pearl,
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: -1.8,
    lineHeight: 34,
  },
  subtitle: {
    color: colors.mist,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 2,
  },
});
