"use client";

import type { AuthScreenMode } from "@freeborn/shared";
import {
  passwordResetRequestSchema,
  passwordUpdateSchema,
  signInSchema,
  signUpSchema,
} from "@freeborn/shared";
import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AuthInput } from "./auth-input";
import { AuthNotice } from "./auth-notice";
import { PasswordStrength } from "./password-strength";
import { GoogleGlyph } from "@/components/icons";
import { createSupabaseBrowserClient, isWebSupabaseConfigured } from "@/lib/supabase/browser";
import { getAuthErrorMessage } from "@/lib/auth/messages";
import { getBaseUrl } from "@/lib/auth/url";

type Notice = { tone: "success" | "error"; title: string; body: string };
type Values = { email: string; password: string; confirmPassword: string };
type Errors = Partial<Record<keyof Values, string>>;

const emptyState: Values = { email: "", password: "", confirmPassword: "" };

const switchItems: Array<{ mode: AuthScreenMode; label: string }> = [
  { mode: "sign-in", label: "Sign in" },
  { mode: "sign-up", label: "Create account" },
];

function Spinner() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" className="spin" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function AuthExperience({
  initialMode,
  notice,
}: {
  initialMode: AuthScreenMode;
  notice?: Notice;
}) {
  const router = useRouter();
  const supabase = useMemo(
    () => (isWebSupabaseConfigured ? createSupabaseBrowserClient() : null),
    [],
  );

  const [mode, setMode] = useState<AuthScreenMode>(initialMode);
  const [values, setValues] = useState<Values>(emptyState);
  const [errors, setErrors] = useState<Errors>({});
  const [localNotice, setLocalNotice] = useState<Notice | null>(notice ?? null);
  const [pending, setPending] = useState<"email" | "google" | null>(null);

  const isAuth = mode === "sign-in" || mode === "sign-up";

  const updateField = (field: keyof Values, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const changeMode = (next: AuthScreenMode) => {
    if (next === mode) return;
    setMode(next);
    setErrors({});
    setLocalNotice(null);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("mode", next);
      url.searchParams.delete("status");
      window.history.replaceState({}, "", url.toString());
    }
  };

  const applyErrors = (issues: Array<{ path: PropertyKey[]; message: string }>) => {
    const next: Errors = {};
    issues.forEach((issue) => {
      const key = issue.path[0];
      if (typeof key === "string" && key in emptyState) {
        next[key as keyof Errors] = issue.message;
      }
    });
    setErrors(next);
  };

  const handleEmailSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalNotice(null);
    setErrors({});
    setPending("email");

    try {
      if (!supabase) throw new Error("service_unavailable");

      if (mode === "sign-in") {
        const parsed = signInSchema.safeParse(values);
        if (!parsed.success) {
          applyErrors(parsed.error.issues);
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
          applyErrors(parsed.error.issues);
          return;
        }
        const { data, error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: { emailRedirectTo: `${getBaseUrl()}/auth/complete?intent=verify` },
        });
        if (error) throw error;
        if (data.session) {
          router.push("/app");
          router.refresh();
          return;
        }
        setLocalNotice({
          tone: "success",
          title: "Check your inbox",
          body: "We sent a secure confirmation link. Open it to activate your Freeborn account.",
        });
        setValues((current) => ({ ...current, password: "", confirmPassword: "" }));
        return;
      }

      if (mode === "reset-password") {
        const parsed = passwordResetRequestSchema.safeParse({ email: values.email });
        if (!parsed.success) {
          applyErrors(parsed.error.issues);
          return;
        }
        const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
          redirectTo: `${getBaseUrl()}/auth/complete?intent=recovery`,
        });
        if (error) throw error;
        setLocalNotice({
          tone: "success",
          title: "Recovery link sent",
          body: "Open the link from your inbox to choose a new password.",
        });
        return;
      }

      const parsed = passwordUpdateSchema.safeParse({
        password: values.password,
        confirmPassword: values.confirmPassword,
      });
      if (!parsed.success) {
        applyErrors(parsed.error.issues);
        return;
      }
      const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
      if (error) throw error;
      setLocalNotice({
        tone: "success",
        title: "Password updated",
        body: "Your account is secured again. Taking you back inside.",
      });
      router.push("/app?status=password-updated");
      router.refresh();
    } catch (error) {
      setLocalNotice({
        tone: "error",
        title: "We couldn't finish that",
        body: getAuthErrorMessage(error),
      });
    } finally {
      setPending(null);
    }
  };

  const handleGoogle = async () => {
    setLocalNotice(null);
    setPending("google");
    try {
      if (!supabase) throw new Error("service_unavailable");
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${getBaseUrl()}/auth/callback?next=/app`,
          queryParams: { access_type: "offline", prompt: "consent" },
        },
      });
      if (error) throw error;
    } catch (error) {
      setLocalNotice({
        tone: "error",
        title: "Google sign-in failed",
        body: getAuthErrorMessage(error),
      });
      setPending(null);
    }
  };

  const copy = {
    eyebrow:
      mode === "sign-up"
        ? "Private by default"
        : mode === "reset-password"
          ? "Account recovery"
          : mode === "update-password"
            ? "Recovery confirmed"
            : "Welcome back",
    title:
      mode === "sign-up"
        ? "Create your Freeborn account"
        : mode === "reset-password"
          ? "Reset your password"
          : mode === "update-password"
            ? "Choose a new password"
            : "Welcome back",
    description:
      mode === "sign-up"
        ? "Start with email, confirm it's really you, and step into a calmer kind of dating."
        : mode === "reset-password"
          ? "We'll send a secure link so you can set a new password — no stress."
          : mode === "update-password"
            ? "Set a strong password to finish restoring access to your account."
            : "Sign in to pick up where you left off. Your profile is right where you left it.",
  };

  const submitLabel =
    pending === "email"
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
            : "Update password";

  return (
    <div className="w-full max-w-[460px]">
      <div className="surface magic-border relative overflow-hidden rounded-[28px] p-6 shadow-[0_34px_110px_-42px_rgba(138,110,242,0.85)] sm:p-8">
        <div
          key={mode}
          className="animate-fade-in"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-stone)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-gold-500)]" />
            {copy.eyebrow}
          </div>
          <h1 className="mt-5 font-[family-name:var(--font-display)] text-[clamp(1.9rem,5vw,2.6rem)] leading-[0.98] tracking-[-0.04em] text-[var(--color-pearl)]">
            {copy.title}
          </h1>
          <p className="mt-3 max-w-[42ch] text-[15px] leading-7 text-[var(--color-mist)]">
            {copy.description}
          </p>
        </div>

        {localNotice ? (
          <div className="mt-5">
            <AuthNotice {...localNotice} />
          </div>
        ) : null}

        {isAuth ? (
          <div className="relative mt-6 grid grid-cols-2 rounded-2xl border border-white/10 bg-white/[0.03] p-1">
            <span
              className="absolute inset-y-1 w-[calc(50%-4px)] rounded-xl bg-[var(--gradient-ember-warm)] shadow-[0_12px_28px_-16px_rgba(239,94,94,0.9)] transition-all duration-300 ease-out"
              style={{ left: mode === "sign-up" ? "calc(50% + 0px)" : "4px" }}
              aria-hidden
            />
            {switchItems.map((item) => {
              const active = item.mode === mode;
              return (
                <button
                  key={item.mode}
                  type="button"
                  onClick={() => changeMode(item.mode)}
                  className={`relative z-10 rounded-xl px-4 py-2.5 text-center text-[13px] font-semibold transition-colors ${
                    active ? "text-white" : "text-[var(--color-mist)] hover:text-[var(--color-pearl)]"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        ) : null}

        {isAuth ? (
          <button
            type="button"
            onClick={handleGoogle}
            disabled={pending !== null}
            className="group mt-5 flex w-full items-center justify-center gap-3 rounded-2xl border border-white/12 bg-white/[0.05] px-5 py-3.5 text-sm font-semibold text-[var(--color-pearl)] transition hover:bg-white/[0.09] hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
          >
            <GoogleGlyph size={18} />
            {pending === "google" ? "Connecting…" : "Continue with Google"}
          </button>
        ) : null}

        {isAuth ? (
          <div className="my-5 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--color-mist)]">
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
                  : "Use at least 8 characters with an uppercase, lowercase, and a number."
              }
              onChange={(event) => updateField("password", event.target.value)}
            />
          ) : null}

          {mode === "sign-up" || mode === "update-password" ? (
            <div className="space-y-3">
              {mode === "sign-up" ? <PasswordStrength password={values.password} /> : null}
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
            </div>
          ) : null}

          {mode === "sign-in" ? (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => changeMode("reset-password")}
                className="text-sm font-semibold text-[var(--color-stone)] transition hover:text-[var(--color-pearl)]"
              >
                Forgot password?
              </button>
            </div>
          ) : null}

          <button
            type="submit"
            disabled={pending !== null}
            className="btn-shine group relative mt-1 inline-flex w-full items-center justify-center gap-2 overflow-hidden magic-button rounded-2xl bg-[var(--color-pearl)] px-5 py-4 text-sm font-bold text-[var(--color-ink)] transition-all hover:-translate-y-px hover:bg-white hover:shadow-[0_14px_34px_rgba(247,241,232,0.14)] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
          >
            {pending === "email" ? <Spinner /> : null}
            {submitLabel}
          </button>
        </form>

        <div className="mt-5 text-center text-[13px] text-[var(--color-mist)]">
          {mode === "sign-in" ? (
            <p>
              New to Freeborn?{" "}
              <button
                type="button"
                onClick={() => changeMode("sign-up")}
                className="font-semibold text-[var(--color-pearl)] underline decoration-white/20 underline-offset-2 transition hover:decoration-white/50"
              >
                Create your account
              </button>
            </p>
          ) : null}
          {mode === "sign-up" ? (
            <p>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => changeMode("sign-in")}
                className="font-semibold text-[var(--color-pearl)] underline decoration-white/20 underline-offset-2 transition hover:decoration-white/50"
              >
                Sign in
              </button>
            </p>
          ) : null}
          {mode === "reset-password" ? (
            <p>
              Remembered it?{" "}
              <button
                type="button"
                onClick={() => changeMode("sign-in")}
                className="font-semibold text-[var(--color-pearl)] underline decoration-white/20 underline-offset-2 transition hover:decoration-white/50"
              >
                Back to sign in
              </button>
            </p>
          ) : null}
          {mode === "update-password" ? (
            <p>
              <Link
                href="/auth?mode=sign-in"
                className="font-semibold text-[var(--color-pearl)] underline decoration-white/20 underline-offset-2 transition hover:decoration-white/50"
              >
                Back to sign in
              </Link>
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
