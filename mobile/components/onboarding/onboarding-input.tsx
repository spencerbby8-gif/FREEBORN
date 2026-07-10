import { useState } from "react";
import { StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";
import { colors, radii } from "@freeborn/shared";

type OnboardingInputProps = TextInputProps & {
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
};

export function OnboardingInput({
  label,
  error,
  hint,
  optional,
  style,
  ...props
}: OnboardingInputProps) {
  const [focused, setFocused] = useState(false);
  const borderColor = error
    ? "rgba(255, 158, 160, 0.6)"
    : focused
      ? colors.gold500
      : colors.lineStrong;

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
        placeholderTextColor="rgba(255,250,245,0.34)"
        style={[
          styles.input,
          { borderColor, backgroundColor: focused ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.06)" },
          style as object,
        ]}
        selectionColor={colors.gold500}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...props}
      />
      {hint && !error ? <Text style={styles.hint}>{hint}</Text> : null}
      {error ? (
        <View style={styles.errorRow}>
          <Text style={styles.errorDot}>●</Text>
          <Text style={styles.error}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 8 },
  labelRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  label: { color: colors.pearl, fontSize: 14, fontWeight: "700" },
  optionalBadge: { borderRadius: 999, borderWidth: 1, borderColor: colors.lineStrong, backgroundColor: "rgba(255,255,255,0.04)", paddingHorizontal: 8, paddingVertical: 3 },
  optionalLabel: { color: colors.stone, fontSize: 10, fontWeight: "700", letterSpacing: 1.4, textTransform: "uppercase" },
  input: { borderRadius: radii.md, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 15, color: colors.pearl, fontSize: 15 },
  hint: { color: colors.mist, fontSize: 12, lineHeight: 18 },
  errorRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  errorDot: { color: colors.danger, fontSize: 10 },
  error: { color: colors.danger, fontSize: 12, fontWeight: "600", flex: 1 },
});
