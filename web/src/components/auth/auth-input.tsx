import type { InputHTMLAttributes } from "react";

type AuthInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
};

export function AuthInput({ label, error, hint, id, className = "", ...props }: AuthInputProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-semibold text-[var(--color-pearl)]">
        {label}
      </label>
      <input
        id={id}
        className={`w-full rounded-2xl border bg-white/[0.04] px-4 py-3.5 text-[15px] text-[var(--color-pearl)] outline-none transition-all placeholder:text-white/30 focus:bg-white/[0.06] ${
          error
            ? "border-red-300/40 shadow-[0_0_0_1px_rgba(251,113,133,0.15)]"
            : "border-white/8 hover:border-white/16 focus:border-[var(--color-accent-gold)]/50 focus:shadow-[0_0_0_1px_rgba(241,201,122,0.2)]"
        } ${className}`}
        aria-invalid={Boolean(error)}
        aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
        {...props}
      />
      {hint ? (
        <p id={hintId} className="text-xs leading-5 text-[var(--color-mist)]">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="text-xs font-medium leading-5 text-red-200">
          {error}
        </p>
      ) : null}
    </div>
  );
}
