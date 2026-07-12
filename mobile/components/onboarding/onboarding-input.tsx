import { useState, type ReactNode } from "react";
import { StyleSheet, Text, TextInput, View, type TextInputProps, type ViewStyle } from "react-native";
import { colors, radii } from "@freeborn/shared";

type OnboardingInputProps = TextInputProps & {
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  children?: ReactNode;
  style?: ViewStyle;
};

export function OnboardingInput({ label, error, hint, optional, style, ...props }: OnboardingInputProps) {
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? "rgba(255, 158, 160, 0.5)"
    : focused
      ? "rgba(241,201,122,0.40)"
      : "rgba(255,255,255,0.10)";

  const bgColor = focused
    ? "rgba(255,255,255,0.06)"
    : "rgba(255,255,255,0.035)";

  return (
    <View style={styles.wrapper}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {optional ? (
          <View style={styles.optionalBadge}>
            <Text style={styles.optionalLabel}>Optional</Text>
          </View>
        ) : null}
      </View>
      <TextInput
        placeholderTextColor="rgba(154,161,184,0.42)"
        selectionColor={colors.gold300}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[
          styles.input,
          { borderColor, backgroundColor: bgColor },
          style,
        ]}
        {...props}
      />
      {hint && !error ? <Text style={styles.hint}>{hint}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 7 },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: {
    color: colors.sand,
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 1.6,
  },
  optionalBadge: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.03)",
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  optionalLabel: {
    color: colors.ash,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  input: {
    minHeight: 54,
    borderRadius: 18,
    borderWidth: 1,
    color: colors.pearl,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    fontWeight: "700",
  },
  hint: {
    color: colors.mist,
    fontSize: 12,
    lineHeight: 18,
  },
  error: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: "600",
  },
});
