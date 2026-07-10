"use client";

import { useState, type InputHTMLAttributes } from "react";

type AuthInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
};

export function AuthInput({ label, error, hint, id, className = "", type, ...props }: AuthInputProps) {
  const [revealed, setRevealed] = useState(false);
  const isPassword = type === "password";
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-semibold text-[var(--color-pearl)]">{label}</label>
      <div className="relative">
        <input
          id={id}
          type={isPassword && revealed ? "text" : type}
          className={`min-h-12 w-full rounded-2xl border bg-white/[0.04] px-4 py-3.5 ${isPassword ? "pr-16" : ""} text-[16px] text-[var(--color-pearl)] outline-none transition-all placeholder:text-white/30 focus:bg-white/[0.07] ${error ? "border-red-300/50 shadow-[0_0_0_3px_rgba(251,113,133,0.08)]" : "border-white/10 hover:border-white/20 focus:border-[var(--color-accent-gold)] focus:shadow-[0_0_0_3px_rgba(241,201,122,0.10)]"} ${className}`}
          aria-invalid={Boolean(error)}
          aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
          {...props}
        />
        {isPassword ? (
          <button type="button" onClick={() => setRevealed((value) => !value)} aria-label={revealed ? "Hide password" : "Show password"} aria-pressed={revealed} className="absolute inset-y-1 right-2 my-auto min-h-10 rounded-xl px-3 text-xs font-bold text-[var(--color-stone)] hover:bg-white/[0.06] hover:text-[var(--color-pearl)]">
            {revealed ? "Hide" : "Show"}
          </button>
        ) : null}
      </div>
      {hint && !error ? <p id={hintId} className="text-xs leading-5 text-[var(--color-mist)]">{hint}</p> : null}
      {error ? <p id={errorId} className="flex items-center gap-2 text-xs font-semibold leading-5 text-red-200" role="alert"><span aria-hidden="true">●</span>{error}</p> : null}
    </div>
  );
}
