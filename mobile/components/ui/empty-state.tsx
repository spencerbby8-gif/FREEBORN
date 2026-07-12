import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radii } from "@freeborn/shared";

type EmptyStateProps = {
  icon: string;
  title: string;
  body: string;
  action?: { label: string; onPress: () => void };
  secondaryAction?: { label: string; onPress: () => void };
  safetyCue?: string;
};

export function EmptyState({
  icon,
  title,
  body,
  action,
  secondaryAction,
  safetyCue,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Text style={styles.iconGlyph}>{icon}</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
      {action && (
        <Pressable
          onPress={action.onPress}
          style={({ pressed }) => [
            styles.primaryBtn,
            pressed && styles.primaryBtnPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel={action.label}
        >
          <Text style={styles.primaryBtnLabel}>{action.label}</Text>
        </Pressable>
      )}
      {secondaryAction && (
        <Pressable
          onPress={secondaryAction.onPress}
          style={({ pressed }) => [
            styles.secondaryBtn,
            pressed && styles.secondaryBtnPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel={secondaryAction.label}
        >
          <Text style={styles.secondaryBtnLabel}>{secondaryAction.label}</Text>
        </Pressable>
      )}
      {safetyCue && (
        <View style={styles.safetyRow}>
          <View style={styles.safetyDot} />
          <Text style={styles.safetyText}>{safetyCue}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 20,
    gap: 10,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(241,201,122,0.12)",
    borderWidth: 1,
    borderColor: "rgba(241,201,122,0.20)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  iconGlyph: { fontSize: 24 },
  title: {
    color: colors.pearl,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.6,
    textAlign: "center",
  },
  body: {
    color: colors.mist,
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
    maxWidth: 280,
  },
  primaryBtn: {
    marginTop: 8,
    backgroundColor: colors.pearl,
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 32,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.ember500,
    shadowOpacity: 0.22,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  primaryBtnPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  primaryBtnLabel: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "900",
    textAlign: "center",
  },
  secondaryBtn: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingVertical: 13,
    paddingHorizontal: 28,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtnPressed: {
    opacity: 0.88,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  secondaryBtnLabel: {
    color: colors.pearl,
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
  safetyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  safetyDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.teal300,
  },
  safetyText: {
    color: colors.mist,
    fontSize: 11,
    fontWeight: "600",
  },
});
