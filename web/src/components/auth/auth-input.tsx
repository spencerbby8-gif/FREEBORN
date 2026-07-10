"use client";

import { useState, type InputHTMLAttributes } from "react";

type AuthInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
};

function EyeIcon({ open }: { open: boolean }) {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {open ? (
        <>
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
          <circle cx="12" cy="12" r="2.8" />
        </>
      ) : (
        <>
          <path d="M3 3l18 18" />
          <path d="M10.6 6.2A9.7 9.7 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3 3.8M6.2 7.9A17 17 0 0 0 2 12s3.5 7 10 7a9.6 9.6 0 0 0 3.4-.6" />
          <path d="M9.9 9.9a2.8 2.8 0 0 0 4 4" />
        </>
      )}
    </svg>
  );
}

export function AuthInput({
  label,
  error,
  hint,
  optional,
  id,
  className = "",
  type,
  ...props
}: AuthInputProps) {
  const [revealed, setRevealed] = useState(false);
  const isPassword = type === "password";
  const inputId = id ?? props.name ?? label;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={inputId} className="text-sm font-semibold text-[var(--color-pearl)]">
          {label}
        </label>
        {optional ? (
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-stone)]">
            Optional
          </span>
        ) : null}
      </div>

      <div className="relative">
        <input
          id={inputId}
          type={isPassword && revealed ? "text" : type}
          className={`min-h-12 w-full rounded-2xl border bg-white/[0.04] px-4 py-3.5 ${
            isPassword ? "pr-14" : ""
          } text-[15px] text-[var(--color-pearl)] outline-none transition-all placeholder:text-white/30 focus:bg-white/[0.06] ${
            error
              ? "border-[var(--color-danger)]/55 shadow-[0_0_0_3px_rgba(255,107,122,0.10)]"
              : "border-white/10 hover:border-white/20 focus:border-[var(--color-gold-500)] focus:shadow-[0_0_0_3px_rgba(217,167,82,0.12)]"
          } ${className}`}
          aria-invalid={Boolean(error)}
          aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
          {...props}
        />
        {isPassword ? (
          <button
            type="button"
            onClick={() => setRevealed((value) => !value)}
            aria-label={revealed ? "Hide password" : "Show password"}
            aria-pressed={revealed}
            className="absolute inset-y-0 right-1.5 my-auto flex h-10 w-10 items-center justify-center rounded-xl text-[var(--color-mist)] transition hover:bg-white/[0.06] hover:text-[var(--color-pearl)]"
          >
            <EyeIcon open={revealed} />
          </button>
        ) : null}
      </div>

      {hint && !error ? (
        <p id={hintId} className="text-xs leading-5 text-[var(--color-mist)]">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="flex items-center gap-1.5 text-xs font-medium leading-5 text-[var(--color-danger)]" role="alert">
          <span aria-hidden="true">●</span>
          {error}
        </p>
      ) : null}
    </div>
  );
}
