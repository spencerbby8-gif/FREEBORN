import type { AuthScreenMode } from "@freeborn/shared";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, radii } from "@freeborn/shared";
import { emberShadow } from "@/components/magic-background";

const items: Array<{ mode: AuthScreenMode; label: string }> = [
  { mode: "sign-in", label: "Sign in" },
  { mode: "sign-up", label: "Create account" },
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
            {active ? (
              <LinearGradient
                colors={[colors.ember500, colors.gold300]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.activeGradient}
              >
                <Text style={[styles.label, styles.activeLabel]}>{item.label}</Text>
              </LinearGradient>
            ) : (
              <Text style={styles.label}>{item.label}</Text>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 6,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(255,255,255,0.04)",
    padding: 5,
  },
  item: {
    flex: 1,
    borderRadius: 18,
    overflow: "hidden",
  },
  activeItem: {
    ...emberShadow,
  },
  activeGradient: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    color: colors.mist,
    textAlign: "center",
    fontSize: 13,
    fontWeight: "700",
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  activeLabel: {
    color: "white",
    fontWeight: "900",
  },
});
