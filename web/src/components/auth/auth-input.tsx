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
        className={`w-full rounded-[22px] border bg-white/6 px-4 py-3.5 text-[15px] text-[var(--color-pearl)] outline-none transition placeholder:text-white/32 ${
          error
            ? "border-rose-300/45 shadow-[0_0_0_1px_rgba(251,113,133,0.14)]"
            : "border-white/10 hover:border-white/18 focus:border-[var(--color-accent-gold)] focus:bg-white/8"
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
        <p id={errorId} className="text-xs font-medium leading-5 text-rose-200">
          {error}
        </p>
      ) : null}
    </div>
  );
}
