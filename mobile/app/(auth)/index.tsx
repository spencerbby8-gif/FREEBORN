import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { AuthScreenMode } from "@freeborn/shared";
import { authModes, passwordResetRequestSchema, signInSchema, signUpSchema } from "@freeborn/shared";
import { AuthInput } from "@/components/auth/auth-input";
import { AuthSurface } from "@/components/auth/auth-surface";
import { ModeSwitch } from "@/components/auth/mode-switch";
import { NoticeCard } from "@/components/auth/notice-card";
import { useAuth } from "@/hooks/use-auth";
import { colors } from "@freeborn/shared";

type FormState = { email: string; password: string; confirmPassword: string };
type Errors = Partial<Record<keyof FormState, string>>;

const initialState: FormState = { email: "", password: "", confirmPassword: "" };

export default function AuthScreen() {
  const { notice, clearNotice, signInWithEmail, signUpWithEmail, requestPasswordReset, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState<AuthScreenMode>("sign-in");
  const [values, setValues] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<Errors>({});
  const [localNotice, setLocalNotice] = useState<{ tone: "success" | "error"; title: string; body: string } | null>(null);
  const [pending, setPending] = useState<"email" | "google" | null>(null);

  const copy = useMemo(() => {
    if (mode === "sign-up") return authModes.signUp;
    if (mode === "reset-password") return authModes.reset;
    return authModes.signIn;
  }, [mode]);

  const visibleNotice = localNotice ?? notice;

  const updateField = (field: keyof FormState, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const applyErrors = (issues: Array<{ path: PropertyKey[]; message: string }>) => {
    const next: Errors = {};
    issues.forEach((issue) => {
      const key = issue.path[0];
      if (typeof key === "string" && key in values) {
        next[key as keyof Errors] = issue.message;
      }
    });
    setErrors(next);
  };

  const handleSubmit = async () => {
    clearNotice();
    setLocalNotice(null);
    setErrors({});
    setPending("email");

    try {
      if (mode === "sign-in") {
        const parsed = signInSchema.safeParse(values);
        if (!parsed.success) { applyErrors(parsed.error.issues); return; }
        const result = await signInWithEmail(parsed.data.email, parsed.data.password);
        if (result.error) throw new Error(result.error);
        return;
      }

      if (mode === "sign-up") {
        const parsed = signUpSchema.safeParse(values);
        if (!parsed.success) { applyErrors(parsed.error.issues); return; }
        const result = await signUpWithEmail(parsed.data.email, parsed.data.password);
        if (result.error) throw new Error(result.error);
        setLocalNotice({ tone: "success", title: "Verification sent", body: "Check your inbox for a secure confirmation link to activate your Freeborn account." });
        return;
      }

      const parsed = passwordResetRequestSchema.safeParse({ email: values.email });
      if (!parsed.success) { applyErrors(parsed.error.issues); return; }
      const result = await requestPasswordReset(parsed.data.email);
      if (result.error) throw new Error(result.error);
      setLocalNotice({ tone: "success", title: "Recovery email sent", body: "Open the reset link from your inbox to choose a new password." });
    } catch (error) {
      setLocalNotice({ tone: "error", title: "We couldn't finish that", body: error instanceof Error ? error.message : "Please try again." });
    } finally {
      setPending(null);
    }
  };

  const handleGoogle = async () => {
    clearNotice();
    setLocalNotice(null);
    setPending("google");
    const result = await signInWithGoogle();
    if (result.error) setLocalNotice({ tone: "error", title: "Google sign-in failed", body: result.error });
    setPending(null);
  };

  return (
    <AuthSurface eyebrow={copy.eyebrow} title={copy.title} description={copy.description}>
      <ModeSwitch mode={mode} onChange={setMode} />

      {visibleNotice ? <NoticeCard {...visibleNotice} /> : null}

      {mode !== "reset-password" ? (
        <Pressable style={[styles.googleButton, pending ? styles.disabled : null]} onPress={handleGoogle} disabled={pending !== null}>
          <View style={styles.googleBadge}>
            <Text style={styles.googleBadgeLabel}>G</Text>
          </View>
          <Text style={styles.googleButtonLabel}>{pending === "google" ? "Connecting…" : "Continue with Google"}</Text>
        </Pressable>
      ) : null}

      {mode !== "reset-password" ? (
        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <Text style={styles.dividerLabel}>or use email</Text>
          <View style={styles.divider} />
        </View>
      ) : null}

      <View style={styles.formStack}>
        <AuthInput label="Email" value={values.email} error={errors.email} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} textContentType="emailAddress" onChangeText={(value) => updateField("email", value)} />

        {mode !== "reset-password" ? (
          <AuthInput label="Password" value={values.password} error={errors.password} placeholder={mode === "sign-in" ? "Enter your password" : "Choose a strong password"} secureTextEntry autoCapitalize="none" autoCorrect={false} textContentType={mode === "sign-in" ? "password" : "newPassword"} hint={mode === "sign-in" ? undefined : "Use 8+ characters with uppercase, lowercase, and a number."} onChangeText={(value) => updateField("password", value)} />
        ) : null}

        {mode === "sign-up" ? (
          <AuthInput label="Confirm password" value={values.confirmPassword} error={errors.confirmPassword} placeholder="Repeat your password" secureTextEntry autoCapitalize="none" autoCorrect={false} textContentType="newPassword" onChangeText={(value) => updateField("confirmPassword", value)} />
        ) : null}

        {mode === "sign-in" ? (
          <Pressable onPress={() => setMode("reset-password")}>
            <Text style={styles.linkLabel}>Forgot password?</Text>
          </Pressable>
        ) : null}

        <Pressable style={[styles.primaryButton, pending ? styles.disabled : null]} onPress={handleSubmit} disabled={pending !== null}>
          <Text style={styles.primaryButtonLabel}>
            {pending === "email"
              ? mode === "sign-in" ? "Signing in…" : mode === "sign-up" ? "Creating account…" : "Sending link…"
              : copy.submitLabel}
          </Text>
        </Pressable>

        {mode !== "sign-in" ? (
          <Pressable onPress={() => setMode("sign-in")}>
            <Text style={styles.footerLabel}>Already have an account? Sign in</Text>
          </Pressable>
        ) : (
          <Pressable onPress={() => setMode("sign-up")}>
            <Text style={styles.footerLabel}>New to Freeborn? Create your account</Text>
          </Pressable>
        )}
      </View>
    </AuthSurface>
  );
}

const styles = StyleSheet.create({
  googleButton: {
    marginTop: 18,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    backgroundColor: "rgba(255,255,255,0.06)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 15,
  },
  googleBadge: {
    width: 32,
    height: 32,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.pearl,
  },
  googleBadgeLabel: { color: colors.ink, fontSize: 15, fontWeight: "800" },
  googleButtonLabel: { color: colors.pearl, fontSize: 14, fontWeight: "700" },
  dividerRow: {
    marginVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  divider: { flex: 1, height: 1, backgroundColor: colors.lineStrong },
  dividerLabel: { color: colors.mist, fontSize: 11, fontWeight: "700", letterSpacing: 1.8, textTransform: "uppercase" },
  formStack: { gap: 16 },
  linkLabel: { color: colors.stone, fontSize: 13, fontWeight: "700", textAlign: "right" },
  primaryButton: { borderRadius: 22, backgroundColor: colors.pearl, paddingHorizontal: 20, paddingVertical: 16 },
  primaryButtonLabel: { color: colors.ink, fontSize: 14, fontWeight: "800", textAlign: "center" },
  footerLabel: { color: colors.mist, fontSize: 13, textAlign: "center" },
  disabled: { opacity: 0.65 },
});
