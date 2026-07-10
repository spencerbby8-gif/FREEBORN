import type { ReactNode } from "react";

export function AuthCard({ children }: { children: ReactNode }) {
  return (
    <div className="w-full max-w-[460px]">
      <div className="surface ring-pearl rounded-[28px] p-6 shadow-[var(--shadow-glow)] sm:p-8">
        {children}
      </div>
    </div>
  );
}
