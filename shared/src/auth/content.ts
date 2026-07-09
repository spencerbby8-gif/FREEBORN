export const authModes = {
  signIn: {
    title: "Welcome back",
    eyebrow: "Phase 1 · Authentication",
    description:
      "Sign in to continue with a calm, secure, and premium-first Freeborn experience.",
    submitLabel: "Sign in",
  },
  signUp: {
    title: "Create your Freeborn account",
    eyebrow: "Private by default",
    description:
      "Start with email, confirm ownership, and enter a product built around thoughtful trust.",
    submitLabel: "Create account",
  },
  reset: {
    title: "Reset your password",
    eyebrow: "Account recovery",
    description:
      "We’ll send a secure recovery link so you can choose a new password without friction.",
    submitLabel: "Send reset link",
  },
  updatePassword: {
    title: "Choose a new password",
    eyebrow: "Recovery confirmed",
    description:
      "Set a strong password to finish restoring access to your Freeborn account.",
    submitLabel: "Update password",
  },
} as const;

export const authTrustPoints = [
  "Supabase Auth with secure session persistence",
  "Google sign in for web and mobile",
  "Email verification and recovery flows",
  "Protected routes with restored sessions",
] as const;
