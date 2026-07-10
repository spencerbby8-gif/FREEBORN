"use client";

import type { AuthScreenMode } from "@freeborn/shared";
import {
  passwordResetRequestSchema,
  passwordUpdateSchema,
  signInSchema,
  signUpSchema,
} from "@freeborn/shared";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthInput } from "./auth-input";
import { AuthNotice } from "./auth-notice";
import { createSupabaseBrowserClient, isWebSupabaseConfigured } from "@/lib/supabase/browser";
import { getAuthErrorMessage } from "@/lib/auth/messages";
import { getBaseUrl } from "@/lib/auth/url";

type AuthFormProps = {
  mode: AuthScreenMode;
};

type Errors = Partial<Record<"email" | "password" | "confirmPassword", string>>;

type Notice = {
  tone: "success" | "error";
  title: string;
  body: string;
};

const emptyState = {
  email: "",
  password: "",
  confirmPassword: "",
};

export function AuthForm({ mode }: AuthFormProps) {
  const supabase = useMemo(
    () => (isWebSupabaseConfigured ? createSupabaseBrowserClient() : null),
    [],
  );
  const router = useRouter();
  const [values, setValues] = useState(emptyState);
  const [errors, setErrors] = useState<Errors>({});
  const [notice, setNotice] = useState<Notice | null>(null);
  const [pendingAction, setPendingAction] = useState<"email" | "google" | null>(null);

  const updateField = (field: keyof typeof emptyState, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const applyValidationErrors = (issues: Array<{ path: PropertyKey[]; message: string }>) => {
    const nextErrors: Errors = {};
    issues.forEach((issue) => {
      const field = issue.path[0];
      if (typeof field === "string" && field in emptyState) {
        nextErrors[field as keyof Errors] = issue.message;
      }
    });
    setErrors(nextErrors);
  };

  const handleEmailSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice(null);
    setErrors({});
    setPendingAction("email");

    try {
      if (!supabase) {
        throw new Error("Supabase is not configured for this environment.");
      }

      if (mode === "sign-in") {
        const parsed = signInSchema.safeParse(values);
        if (!parsed.success) {
          applyValidationErrors(parsed.error.issues);
          return;
        }

        const { error } = await supabase.auth.signInWithPassword(parsed.data);
        if (error) throw error;

        router.push("/app");
        router.refresh();
        return;
      }

      if (mode === "sign-up") {
        const parsed = signUpSchema.safeParse(values);
        if (!parsed.success) {
          applyValidationErrors(parsed.error.issues);
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: {
            emailRedirectTo: `${getBaseUrl()}/auth/complete?intent=verify`,
          },
        });

        if (error) throw error;

        if (data.session) {
          router.push("/app");
          router.refresh();
          return;
        }

        setNotice({
          tone: "success",
          title: "Verification sent",
          body: "Check your email for a confirmation link to activate your Freeborn account.",
        });
        return;
      }

      if (mode === "reset-password") {
        const parsed = passwordResetRequestSchema.safeParse({ email: values.email });
        if (!parsed.success) {
          applyValidationErrors(parsed.error.issues);
          return;
        }

        const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
          redirectTo: `${getBaseUrl()}/auth/complete?intent=recovery`,
        });

        if (error) throw error;

        setNotice({
          tone: "success",
          title: "Recovery email sent",
          body: "Use the secure reset link from your inbox to choose a new password.",
        });
        return;
      }

      const parsed = passwordUpdateSchema.safeParse({
        password: values.password,
        confirmPassword: values.confirmPassword,
      });

      if (!parsed.success) {
        applyValidationErrors(parsed.error.issues);
        return;
      }

      const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
      if (error) throw error;

      setNotice({
        tone: "success",
        title: "Password updated",
        body: "Your Freeborn account is secured again. Redirecting you back inside.",
      });
      router.push("/app?status=password-updated");
      router.refresh();
    } catch (error) {
      setNotice({
        tone: "error",
        title: "We couldn't finish that",
        body: getAuthErrorMessage(error),
      });
    } finally {
      setPendingAction(null);
    }
  };

  const handleGoogleSignIn = async () => {
    setNotice(null);
    setPendingAction("google");

    try {
      if (!supabase) {
        throw new Error("Supabase is not configured for this environment.");
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${getBaseUrl()}/auth/callback?next=/app`,
          queryParams: { access_type: "offline", prompt: "consent" },
        },
      });

      if (error) throw error;
    } catch (error) {
      setNotice({
        tone: "error",
        title: "Google sign-in failed",
        body: getAuthErrorMessage(error),
      });
      setPendingAction(null);
    }
  };

  return (
    <div>
      {notice ? (
        <div className="mb-5">
          <AuthNotice {...notice} />
        </div>
      ) : null}

      {mode === "sign-in" || mode === "sign-up" ? (
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={pendingAction !== null}
          className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3.5 text-sm font-semibold text-[var(--color-pearl)] transition hover:bg-white/10 hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          {pendingAction === "google" ? "Connecting…" : "Continue with Google"}
        </button>
      ) : null}

      {mode === "sign-in" || mode === "sign-up" ? (
        <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-[var(--color-mist)]">
          <span className="h-px flex-1 bg-white/10" />
          or use email
          <span className="h-px flex-1 bg-white/10" />
        </div>
      ) : null}

      <form className="space-y-4" onSubmit={handleEmailSubmit} noValidate>
        {mode !== "update-password" ? (
          <AuthInput
            id="email"
            label="Email"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            placeholder="you@example.com"
            value={values.email}
            error={errors.email}
            onChange={(event) => updateField("email", event.target.value)}
          />
        ) : null}

        {mode !== "reset-password" ? (
          <AuthInput
            id="password"
            label={mode === "update-password" ? "New password" : "Password"}
            type="password"
            autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
            placeholder={mode === "sign-in" ? "Enter your password" : "Choose a strong password"}
            value={values.password}
            error={errors.password}
            hint={
              mode === "sign-in"
                ? undefined
                : "Use 8+ characters with uppercase, lowercase, and a number."
            }
            onChange={(event) => updateField("password", event.target.value)}
          />
        ) : null}

        {mode === "sign-up" || mode === "update-password" ? (
          <AuthInput
            id="confirmPassword"
            label={mode === "update-password" ? "Confirm new password" : "Confirm password"}
            type="password"
            autoComplete="new-password"
            placeholder="Repeat your password"
            value={values.confirmPassword}
            error={errors.confirmPassword}
            onChange={(event) => updateField("confirmPassword", event.target.value)}
          />
        ) : null}

        {mode === "sign-in" ? (
          <div className="flex justify-end">
            <Link
              href="/auth?mode=reset-password"
              className="text-sm font-semibold text-[var(--color-stone)] transition hover:text-[var(--color-pearl)]"
            >
              Forgot password?
            </Link>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={pendingAction !== null}
          className="mt-2 inline-flex w-full items-center justify-center rounded-2xl bg-[var(--color-pearl)] px-5 py-4 text-sm font-bold text-[var(--color-ink)] transition-all hover:bg-white hover:translate-y-[-1px] hover:shadow-[0_12px_30px_rgba(247,241,232,0.12)] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {pendingAction === "email"
            ? mode === "sign-in"
              ? "Signing in…"
              : mode === "sign-up"
                ? "Creating account…"
                : mode === "reset-password"
                  ? "Sending link…"
                  : "Updating password…"
            : mode === "sign-in"
              ? "Sign in"
              : mode === "sign-up"
                ? "Create account"
                : mode === "reset-password"
                  ? "Send reset link"
                  : "Update password"}
        </button>
      </form>

      {mode === "sign-in" ? (
        <p className="mt-5 text-center text-sm text-[var(--color-mist)]">
          New to Freeborn?{" "}
          <Link href="/auth?mode=sign-up" className="font-semibold text-[var(--color-pearl)] underline decoration-white/20 hover:decoration-white/40">
            Create your account
          </Link>
        </p>
      ) : null}

      {mode === "sign-up" ? (
        <p className="mt-5 text-center text-sm text-[var(--color-mist)]">
          Already have an account?{" "}
          <Link href="/auth?mode=sign-in" className="font-semibold text-[var(--color-pearl)] underline decoration-white/20 hover:decoration-white/40">
            Sign in
          </Link>
        </p>
      ) : null}

      {mode === "reset-password" ? (
        <p className="mt-5 text-center text-sm text-[var(--color-mist)]">
          <Link href="/auth?mode=sign-in" className="font-semibold text-[var(--color-pearl)] underline decoration-white/20 hover:decoration-white/40">
            Back to sign in
          </Link>
        </p>
      ) : null}
    </div>
  );
}
