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
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  accentContainer: {
    backgroundColor: colors.pearl,
    borderColor: colors.pearl,
  },
  label: {
    color: colors.pearl,
    fontSize: 11,
    fontWeight: "800",
  },
  accentLabel: {
    color: colors.ink,
    fontWeight: "900",
  },
});
