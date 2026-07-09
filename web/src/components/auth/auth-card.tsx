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
    <div className="w-full max-w-[560px]">
      <div className="premium-border rounded-[36px] bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.04))] p-[1px] shadow-[var(--shadow-glow)]">
        <div className="rounded-[35px] bg-[rgba(9,16,28,0.84)] p-6 backdrop-blur-xl sm:p-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-stone)]">
            <span className="h-2 w-2 rounded-full bg-[var(--color-accent-gold)]" />
            {config.eyebrow}
          </div>
          <h1 className="mt-5 font-[family-name:var(--font-display)] text-[clamp(2.6rem,6vw,4.2rem)] leading-[0.95] tracking-[-0.05em] text-[var(--color-pearl)]">
            {config.title}
          </h1>
          <p className="mt-4 max-w-[44ch] text-base leading-7 text-[var(--color-mist)] sm:text-lg">
            {config.description}
          </p>

          {notice ? <div className="mt-6"><AuthNotice {...notice} /></div> : null}
          <div className="mt-7">{children}</div>
        </div>
      </div>
    </div>
  );
}
