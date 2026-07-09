import type { AuthScreenMode } from "@freeborn/shared";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radii } from "@freeborn/shared";

const items: Array<{ mode: AuthScreenMode; label: string }> = [
  { mode: "sign-in", label: "Sign in" },
  { mode: "sign-up", label: "Create" },
  { mode: "reset-password", label: "Reset" },
];

export function ModeSwitch({
  mode,
  onChange,
}: {
  mode: AuthScreenMode;
  onChange: (mode: AuthScreenMode) => void;
}) {
  return (
    <View style={styles.row}>
      {items.map((item) => {
        const active = item.mode === mode;
        return (
          <Pressable key={item.mode} onPress={() => onChange(item.mode)} style={[styles.item, active && styles.activeItem]}>
            <Text style={[styles.label, active && styles.activeLabel]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 8,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    backgroundColor: "rgba(255,255,255,0.04)",
    padding: 6,
  },
  item: {
    flex: 1,
    borderRadius: radii.md,
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  activeItem: {
    backgroundColor: colors.pearl,
  },
  label: {
    color: colors.mist,
    textAlign: "center",
    fontSize: 13,
    fontWeight: "700",
  },
  activeLabel: {
    color: colors.ink,
  },
});
