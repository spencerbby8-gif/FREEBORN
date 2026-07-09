import { Text, View, StyleSheet } from "react-native";
import { colors } from "@freeborn/shared";

type PillProps = {
  label: string;
  accent?: boolean;
};

export function Pill({ label, accent = false }: PillProps) {
  return (
    <View style={[styles.container, accent && styles.accentContainer]}>
      <Text style={[styles.label, accent && styles.accentLabel]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    backgroundColor: "rgba(255,255,255,0.07)",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  accentContainer: {
    backgroundColor: "rgba(247,241,232,0.95)",
    borderColor: "rgba(247,241,232,0.95)",
  },
  label: {
    color: colors.pearl,
    fontSize: 12,
    fontWeight: "600",
  },
  accentLabel: {
    color: colors.ink,
  },
});
