import { StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";
import { colors, radii } from "@freeborn/shared";

type AuthInputProps = TextInputProps & {
  label: string;
  error?: string;
  hint?: string;
};

export function AuthInput({ label, error, hint, ...props }: AuthInputProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor="rgba(255,250,245,0.34)"
        style={[styles.input, error ? styles.inputError : undefined]}
        {...props}
      />
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 8,
  },
  label: {
    color: colors.pearl,
    fontSize: 14,
    fontWeight: "700",
  },
  input: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    backgroundColor: "rgba(255,255,255,0.06)",
    paddingHorizontal: 16,
    paddingVertical: 15,
    color: colors.pearl,
    fontSize: 15,
  },
  inputError: {
    borderColor: "rgba(255, 158, 160, 0.6)",
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
