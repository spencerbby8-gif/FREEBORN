import { authModes } from "@freeborn/shared";
import type { AuthScreenMode } from "@freeborn/shared";
import { AuthNotice } from "./auth-notice";

type Notice = {
  title: string;
  body: string;
  tone: "success" | "error";
};

export function AuthCard({
  mode,
  notice,
  children,
}: {
  mode: AuthScreenMode;
  notice?: Notice;
  children: React.ReactNode;
}) {
  const config =
    mode === "sign-in"
      ? authModes.signIn
      : mode === "sign-up"
        ? authModes.signUp
        : mode === "reset-password"
          ? authModes.reset
          : authModes.updatePassword;

  return (
    <div className="w-full max-w-[480px]">
      <div className="rounded-3xl border border-white/10 bg-[rgba(9,16,28,0.85)] p-6 shadow-[var(--shadow-glow)] backdrop-blur-2xl sm:p-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-stone)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent-gold)]" />
          {config.eyebrow}
        </div>
        <h1 className="mt-5 font-[family-name:var(--font-display)] text-[clamp(2rem,5vw,3.2rem)] leading-[0.95] tracking-[-0.05em] text-[var(--color-pearl)]">
          {config.title}
        </h1>
        <p className="mt-3 max-w-[40ch] text-base leading-7 text-[var(--color-mist)]">
          {config.description}
        </p>

        {notice ? (
          <div className="mt-5">
            <AuthNotice {...notice} />
          </div>
        ) : null}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
