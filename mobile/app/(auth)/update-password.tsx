import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { authModes, passwordUpdateSchema } from "@freeborn/shared";
import { AuthInput } from "@/components/auth/auth-input";
import { AuthSurface } from "@/components/auth/auth-surface";
import { NoticeCard } from "@/components/auth/notice-card";
import { PasswordStrength } from "@/components/auth/password-strength";
import { emberShadow } from "@/components/magic-background";
import { useAuth } from "@/hooks/use-auth";
import { colors } from "@freeborn/shared";

type Errors = Partial<Record<"password" | "confirmPassword", string>>;

export default function UpdatePasswordScreen() {
  const { notice, clearNotice, updatePassword } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [localNotice, setLocalNotice] = useState<{ tone: "success" | "error"; title: string; body: string } | null>(null);
  const [pending, setPending] = useState(false);

  const handleSubmit = async () => {
    clearNotice();
    setLocalNotice(null);
    setErrors({});
    setPending(true);

    try {
      const parsed = passwordUpdateSchema.safeParse({ password, confirmPassword });
      if (!parsed.success) {
        const nextErrors: Errors = {};
        parsed.error.issues.forEach((issue) => {
          const key = issue.path[0];
          if (typeof key === "string") nextErrors[key as keyof Errors] = issue.message;
        });
        setErrors(nextErrors);
        return;
      }

      const result = await updatePassword(parsed.data.password);
      if (result.error) throw new Error(result.error);
      setLocalNotice({ tone: "success", title: "Password updated", body: "Your new password has been saved securely." });
    } catch (error) {
      setLocalNotice({ tone: "error", title: "We couldn't update your password", body: error instanceof Error ? error.message : "Please try again." });
    } finally {
      setPending(false);
    }
  };

  return (
    <AuthSurface eyebrow={authModes.updatePassword.eyebrow} title={authModes.updatePassword.title} description={authModes.updatePassword.description}>
      {localNotice ?? notice ? <NoticeCard {...(localNotice ?? notice)!} /> : null}
      <View style={styles.stack}>
        <View>
          <AuthInput
            label="New password"
            value={password}
            error={errors.password}
            placeholder="Choose a strong password"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="newPassword"
            hint="Use 8+ characters with uppercase, lowercase, and a number."
            onChangeText={setPassword}
          />
          <PasswordStrength password={password} />
        </View>
        <AuthInput
          label="Confirm new password"
          value={confirmPassword}
          error={errors.confirmPassword}
          placeholder="Repeat your password"
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="newPassword"
          onChangeText={setConfirmPassword}
        />
        <Pressable style={[styles.button, pending ? styles.disabled : null]} onPress={handleSubmit} disabled={pending}>
          {pending ? <ActivityIndicator color={colors.ink} /> : <Text style={styles.buttonLabel}>{authModes.updatePassword.submitLabel}</Text>}
        </Pressable>
      </View>
    </AuthSurface>
  );
}

const styles = StyleSheet.create({
  stack: { gap: 16, marginTop: 6 },
  button: { borderRadius: 22, backgroundColor: colors.pearl, paddingHorizontal: 20, paddingVertical: 16, alignItems: "center", justifyContent: "center", minHeight: 54, ...emberShadow },
  buttonLabel: { color: colors.ink, fontSize: 14, fontWeight: "900", textAlign: "center" },
  disabled: { opacity: 0.6 },
});
