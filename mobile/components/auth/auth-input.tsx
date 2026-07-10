import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radii } from "@freeborn/shared";

function EyeIcon({ open }: { open: boolean }) {
  return (
    <Ionicons
      name={open ? "eye-off" : "eye"}
      size={20}
      color={colors.stone}
    />
  );
}

type AuthInputProps = TextInputProps & { label: string; error?: string; hint?: string };

export function AuthInput({ label, error, hint, secureTextEntry, style, ...props }: AuthInputProps) {
  const [revealed, setRevealed] = useState(false);
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? "rgba(255, 158, 160, 0.7)"
    : focused
      ? colors.gold500
      : colors.lineStrong;

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.inputShell,
          { borderColor, backgroundColor: focused ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.06)" },
        ]}
      >
        <TextInput
          placeholderTextColor="rgba(255,250,245,0.34)"
          style={[styles.input, style]}
          secureTextEntry={Boolean(secureTextEntry) && !revealed}
          selectionColor={colors.gold500}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          accessibilityLabel={label}
          accessibilityHint={error ?? hint}
          {...props}
        />
        {secureTextEntry ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={revealed ? "Hide password" : "Show password"}
            onPress={() => setRevealed((value) => !value)}
            hitSlop={8}
            style={styles.reveal}
          >
            <EyeIcon open={revealed} />
          </Pressable>
        ) : null}
      </View>
      {hint && !error ? <Text style={styles.hint}>{hint}</Text> : null}
      {error ? (
        <View style={styles.errorRow}>
          <Text style={styles.errorDot}>●</Text>
          <Text accessibilityLiveRegion="polite" style={styles.error}>
            {error}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 8 },
  label: { color: colors.pearl, fontSize: 14, fontWeight: "700" },
  inputShell: {
    minHeight: 54,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  input: { flex: 1, paddingHorizontal: 16, paddingVertical: 14, color: colors.pearl, fontSize: 16 },
  reveal: {
    minWidth: 56,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 4,
    borderRadius: 14,
  },
  hint: { color: colors.mist, fontSize: 12, lineHeight: 18 },
  errorRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  errorDot: { color: colors.danger, fontSize: 10 },
  error: { color: colors.danger, fontSize: 12, lineHeight: 18, fontWeight: "600", flex: 1 },
});
