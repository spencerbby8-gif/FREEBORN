import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";
import { colors, radii } from "@freeborn/shared";

type AuthInputProps = TextInputProps & { label: string; error?: string; hint?: string };

export function AuthInput({ label, error, hint, secureTextEntry, style, ...props }: AuthInputProps) {
  const [revealed, setRevealed] = useState(false);
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputShell, error ? styles.inputError : undefined]}>
        <TextInput
          placeholderTextColor="rgba(255,250,245,0.34)"
          style={[styles.input, style]}
          secureTextEntry={Boolean(secureTextEntry) && !revealed}
          accessibilityLabel={label}
          accessibilityHint={error ?? hint}
          {...props}
        />
        {secureTextEntry ? (
          <Pressable accessibilityRole="button" accessibilityLabel={revealed ? "Hide password" : "Show password"} onPress={() => setRevealed((value) => !value)} hitSlop={8} style={styles.reveal}>
            <Text style={styles.revealLabel}>{revealed ? "Hide" : "Show"}</Text>
          </Pressable>
        ) : null}
      </View>
      {hint && !error ? <Text style={styles.hint}>{hint}</Text> : null}
      {error ? <Text accessibilityLiveRegion="polite" style={styles.error}>●  {error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 8 },
  label: { color: colors.pearl, fontSize: 14, fontWeight: "700" },
  inputShell: { minHeight: 54, borderRadius: radii.md, borderWidth: 1, borderColor: colors.lineStrong, backgroundColor: "rgba(255,255,255,0.06)", flexDirection: "row", alignItems: "center" },
  input: { flex: 1, paddingHorizontal: 16, paddingVertical: 14, color: colors.pearl, fontSize: 16 },
  inputError: { borderColor: "rgba(255, 158, 160, 0.7)", backgroundColor: "rgba(255,90,100,0.06)" },
  reveal: { minWidth: 52, minHeight: 44, alignItems: "center", justifyContent: "center", marginRight: 4, borderRadius: 14 },
  revealLabel: { color: colors.stone, fontSize: 12, fontWeight: "800" },
  hint: { color: colors.mist, fontSize: 12, lineHeight: 18 },
  error: { color: colors.danger, fontSize: 12, lineHeight: 18, fontWeight: "600" },
});
