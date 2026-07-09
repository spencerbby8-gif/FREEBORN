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
        if (error) {
          throw error;
        }

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

        if (error) {
          throw error;
        }

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

        if (error) {
          throw error;
        }

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
      if (error) {
        throw error;
      }

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
        title: "We couldn’t finish that",
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
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        throw error;
      }
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

      {mode !== "update-password" ? (
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={pendingAction !== null}
          className="flex w-full items-center justify-center gap-3 rounded-[22px] border border-white/12 bg-white/7 px-5 py-3.5 text-sm font-semibold text-[var(--color-pearl)] transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[var(--color-ink)]">G</span>
          {pendingAction === "google" ? "Connecting to Google…" : "Continue with Google"}
        </button>
      ) : null}

      {mode !== "update-password" ? (
        <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-[0.24em] text-[var(--color-mist)]">
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
            <Link href="/auth?mode=reset-password" className="text-sm font-semibold text-[var(--color-stone)] transition hover:text-[var(--color-pearl)]">
              Forgot password?
            </Link>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={pendingAction !== null}
          className="mt-2 inline-flex w-full items-center justify-center rounded-[22px] bg-[var(--color-pearl)] px-5 py-4 text-sm font-bold text-[var(--color-ink)] transition hover:translate-y-[-1px] hover:bg-white disabled:cursor-not-allowed disabled:opacity-70"
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
          <Link href="/auth?mode=sign-up" className="font-semibold text-[var(--color-pearl)]">
            Create your account
          </Link>
        </p>
      ) : null}

      {mode === "sign-up" ? (
        <p className="mt-5 text-center text-sm text-[var(--color-mist)]">
          Already have an account?{" "}
          <Link href="/auth?mode=sign-in" className="font-semibold text-[var(--color-pearl)]">
            Sign in
          </Link>
        </p>
      ) : null}
    </div>
  );
}
