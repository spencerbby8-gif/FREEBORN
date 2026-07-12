import type { ReactNode } from "react";

export function AuthCard({ children }: { children: ReactNode }) {
  return (
    <div className="w-full max-w-[480px]">
      <div className="surface magic-border rounded-[40px] p-8 shadow-[var(--shadow-card-lg)] sm:p-12">
        {children}
      </div>
    </div>
  );
}
