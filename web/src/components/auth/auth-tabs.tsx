import type { AuthScreenMode } from "@freeborn/shared";
import Link from "next/link";

const items: Array<{ mode: AuthScreenMode; label: string }> = [
  { mode: "sign-in", label: "Sign in" },
  { mode: "sign-up", label: "Create account" },
];

export function AuthTabs({ mode }: { mode: AuthScreenMode }) {
  if (mode === "reset-password" || mode === "update-password") {
    return null;
  }

  return (
    <div className="mb-6 flex rounded-2xl border border-white/10 bg-white/[0.03] p-1.5">
      {items.map((item) => {
        const active = item.mode === mode;
        return (
          <Link
            key={item.mode}
            href={`/auth?mode=${item.mode}`}
            className={`flex-1 rounded-xl px-4 py-3 text-center text-sm font-semibold transition-all ${
              active
                ? "bg-[var(--color-pearl)] text-[var(--color-ink)] shadow-sm"
                : "text-[var(--color-mist)] hover:text-[var(--color-pearl)]"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
