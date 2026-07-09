import type { AuthScreenMode } from "@freeborn/shared";

const items: Array<{ mode: AuthScreenMode; label: string }> = [
  { mode: "sign-in", label: "Sign in" },
  { mode: "sign-up", label: "Create account" },
  { mode: "reset-password", label: "Reset password" },
];

export function AuthTabs({ mode }: { mode: AuthScreenMode }) {
  if (mode === "update-password") {
    return null;
  }

  return (
    <div className="mb-6 grid grid-cols-3 gap-2 rounded-[24px] border border-white/10 bg-white/4 p-2">
      {items.map((item) => {
        const active = item.mode === mode;
        return (
          <a
            key={item.mode}
            href={`/auth?mode=${item.mode}`}
            className={`rounded-[18px] px-4 py-3 text-center text-sm font-semibold transition ${
              active
                ? "bg-[var(--color-pearl)] text-[var(--color-ink)]"
                : "text-[var(--color-mist)] hover:bg-white/6 hover:text-[var(--color-pearl)]"
            }`}
          >
            {item.label}
          </a>
        );
      })}
    </div>
  );
}
