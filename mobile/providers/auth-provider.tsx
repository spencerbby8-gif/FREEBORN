import { PropsWithChildren, useCallback, useEffect, useMemo, useState } from "react";
import type { EmailOtpType, Session, User } from "@supabase/supabase-js";
import { router } from "expo-router";
import * as Linking from "expo-linking";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import * as WebBrowser from "expo-web-browser";
import { AuthContext, type AuthNotice } from "@/hooks/use-auth";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

WebBrowser.maybeCompleteAuthSession();

function createNotice(tone: "success" | "error", title: string, body: string): NonNullable<AuthNotice> {
  return { tone, title, body };
}

function getAuthErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : "";
  if (message.includes("invalid login credentials")) return "That email and password combination isn’t right.";
  if (message.includes("email not confirmed")) return "Confirm your email before signing in.";
  if (message.includes("already registered")) return "An account already exists for this email. Try signing in.";
  if (message.includes("rate limit") || message.includes("too many")) return "Too many attempts. Wait a moment, then try again.";
  if (message.includes("network") || message.includes("fetch")) return "Check your connection and try again.";
  return "We couldn’t complete that request. Please try again.";
}

function getAuthRedirect(intent: "verify" | "recovery") {
  return Linking.createURL("/auth/complete", {
    scheme: "freeborn",
    queryParams: { intent },
  });
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [recoveryReady, setRecoveryReady] = useState(false);
  const [notice, setNotice] = useState<AuthNotice>(null);

  const clearNotice = useCallback(() => setNotice(null), []);

  const syncSessionFromUrl = useCallback(async (url: string) => {
    const { params, errorCode } = QueryParams.getQueryParams(url);

    if (errorCode) {
      throw new Error(errorCode);
    }

    const accessToken = typeof params.access_token === "string" ? params.access_token : null;
    const refreshToken = typeof params.refresh_token === "string" ? params.refresh_token : null;
    const tokenHash = typeof params.token_hash === "string" ? params.token_hash : null;
    const type = typeof params.type === "string" ? params.type : null;

    if (tokenHash && type) {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: type as EmailOtpType,
      });

      if (error) {
        throw error;
      }
    }

    if (accessToken && refreshToken) {
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (error) {
        throw error;
      }
    }

    const {
      data: { session: refreshedSession },
    } = await supabase.auth.getSession();

    setSession(refreshedSession);
    setUser(refreshedSession?.user ?? null);

    if (type === "recovery") {
      setRecoveryReady(true);
      setNotice(createNotice("success", "Recovery confirmed", "Choose a new password to finish restoring your account."));
      router.replace("/(auth)/update-password");
      return;
    }

    if (refreshedSession) {
      setRecoveryReady(false);
      setNotice(createNotice("success", "Email confirmed", "Your Freeborn account is now verified."));
      router.replace("/(app)");
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      try {
        if (!isSupabaseConfigured) {
          setNotice(
            createNotice(
              "error",
              "Service unavailable",
              "Authentication isn’t available in this build. Please try again later.",
            ),
          );
        }

        const initialUrl = await Linking.getInitialURL();
        if (initialUrl) {
          try {
            await syncSessionFromUrl(initialUrl);
          } catch (error) {
            setNotice(createNotice("error", "Link error", getAuthErrorMessage(error)));
          }
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) {
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    bootstrap();

    const linkSubscription = Linking.addEventListener("url", ({ url }) => {
      syncSessionFromUrl(url).catch((error) => {
        setNotice(createNotice("error", "Link error", getAuthErrorMessage(error)));
      });
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (event === "PASSWORD_RECOVERY") {
        setRecoveryReady(true);
        router.replace("/(auth)/update-password");
      }

      if (event === "SIGNED_OUT") {
        setRecoveryReady(false);
      }
    });

    return () => {
      mounted = false;
      linkSubscription.remove();
      subscription.unsubscribe();
    };
  }, [syncSessionFromUrl]);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      return { error: "Missing Supabase configuration." };
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return { error: getAuthErrorMessage(error) };
    }

    router.replace("/(app)");
    return {};
  }, []);

  const signUpWithEmail = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      return { error: "Missing Supabase configuration." };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: getAuthRedirect("verify"),
      },
    });

    if (error) {
      return { error: getAuthErrorMessage(error) };
    }

    if (data.session) {
      router.replace("/(app)");
      return {};
    }

    setNotice(
      createNotice(
        "success",
        "Verification sent",
        "Check your inbox for a secure confirmation link to activate your Freeborn account.",
      ),
    );

    return {};
  }, []);

  const requestPasswordReset = useCallback(async (email: string) => {
    if (!isSupabaseConfigured) {
      return { error: "Missing Supabase configuration." };
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: getAuthRedirect("recovery"),
    });

    if (error) {
      return { error: getAuthErrorMessage(error) };
    }

    setNotice(
      createNotice(
        "success",
        "Recovery email sent",
        "Open the link from your inbox to choose a new password.",
      ),
    );

    return {};
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (!isSupabaseConfigured) {
      return { error: "Missing Supabase configuration." };
    }

    const redirectTo = getAuthRedirect("verify");
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        skipBrowserRedirect: true,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (error) {
      return { error: getAuthErrorMessage(error) };
    }

    const result = await WebBrowser.openAuthSessionAsync(data?.url ?? "", redirectTo);

    if (result.type === "success" && result.url) {
      try {
        await syncSessionFromUrl(result.url);
        return {};
      } catch (oauthError) {
        return { error: getAuthErrorMessage(oauthError) };
      }
    }

    if (result.type === "cancel") {
      return { error: "Google sign-in was cancelled." };
    }

    return { error: "Google sign-in did not complete." };
  }, [syncSessionFromUrl]);

  const updatePassword = useCallback(async (password: string) => {
    if (!isSupabaseConfigured) {
      return { error: "Missing Supabase configuration." };
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      return { error: getAuthErrorMessage(error) };
    }

    setRecoveryReady(false);
    setNotice(createNotice("success", "Password updated", "Your new password has been saved securely."));
    router.replace("/(app)");
    return {};
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      const message = getAuthErrorMessage(error);
      setNotice(createNotice("error", "Sign-out failed", message));
      return { error: message };
    }

    setRecoveryReady(false);
    setNotice(createNotice("success", "Signed out", "You have been securely signed out of Freeborn."));
    router.replace("/(auth)");
    return {};
  }, []);

  const value = useMemo(
    () => ({
      session,
      user,
      isLoading,
      recoveryReady,
      notice,
      clearNotice,
      signInWithEmail,
      signUpWithEmail,
      requestPasswordReset,
      signInWithGoogle,
      updatePassword,
      signOut,
    }),
    [
      clearNotice,
      isLoading,
      notice,
      recoveryReady,
      requestPasswordReset,
      session,
      signInWithEmail,
      signInWithGoogle,
      signOut,
      signUpWithEmail,
      updatePassword,
      user,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
