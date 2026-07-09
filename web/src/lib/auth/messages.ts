export function getAuthErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

export const authStatusMessages = {
  "verification-sent": {
    tone: "success" as const,
    title: "Check your inbox",
    body: "We sent a verification link so you can confirm your email and unlock your session.",
  },
  "reset-sent": {
    tone: "success" as const,
    title: "Recovery email sent",
    body: "Open the reset link from your email to choose a new password.",
  },
  verified: {
    tone: "success" as const,
    title: "Email confirmed",
    body: "Your account is now verified. You can continue into Freeborn.",
  },
  recovered: {
    tone: "success" as const,
    title: "Recovery confirmed",
    body: "Choose a new password to finish restoring your account.",
  },
  "password-updated": {
    tone: "success" as const,
    title: "Password updated",
    body: "Your account is secured again. You can continue with your session.",
  },
  "signed-out": {
    tone: "success" as const,
    title: "Signed out",
    body: "You’ve been securely signed out of Freeborn.",
  },
  "oauth-error": {
    tone: "error" as const,
    title: "Google sign-in could not finish",
    body: "Please try again. If this continues, check your provider redirect URLs in Supabase.",
  },
  "link-invalid": {
    tone: "error" as const,
    title: "That link is no longer valid",
    body: "Request a fresh verification or recovery email and try again.",
  },
  "env-missing": {
    tone: "error" as const,
    title: "Supabase is not configured",
    body: "Add the required environment variables before using authentication locally.",
  },
};

export type AuthStatusKey = keyof typeof authStatusMessages;
