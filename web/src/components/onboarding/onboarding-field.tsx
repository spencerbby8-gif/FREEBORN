import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

type FieldShellProps = {
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  children: ReactNode;
};

function FieldShell({ label, error, hint, optional, children }: FieldShellProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <label className="block text-sm font-semibold text-[var(--color-pearl)]">{label}</label>
        {optional ? (
          <span className="rounded-full border border-white/10 bg-white/4 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-stone)]">
            Optional
          </span>
        ) : null}
      </div>
      {children}
      {hint && !error ? (
        <p className="text-xs leading-5 text-[var(--color-mist)]">{hint}</p>
      ) : null}
      {error ? (
        <p className="text-xs font-medium leading-5 text-rose-200" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

type TextInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
};

export function OnboardingTextInput({
  label,
  error,
  hint,
  optional,
  id,
  className = "",
  ...props
}: TextInputProps) {
  const inputId = id ?? props.name ?? label;
  return (
    <FieldShell label={label} error={error} hint={hint} optional={optional}>
      <input
        id={inputId}
        className={`w-full rounded-[22px] border bg-white/6 px-4 py-3.5 text-[15px] text-[var(--color-pearl)] outline-none transition placeholder:text-white/32 ${
          error
            ? "border-rose-300/45 shadow-[0_0_0_1px_rgba(251,113,133,0.14)]"
            : "border-white/10 hover:border-white/18 focus:border-[var(--color-accent-gold)] focus:bg-white/8"
        } ${className}`}
        aria-invalid={Boolean(error)}
        {...props}
      />
    </FieldShell>
  );
}

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
};

export function OnboardingTextarea({
  label,
  error,
  hint,
  optional,
  id,
  className = "",
  ...props
}: TextareaProps) {
  const inputId = id ?? props.name ?? label;
  return (
    <FieldShell label={label} error={error} hint={hint} optional={optional}>
      <textarea
        id={inputId}
        className={`w-full resize-none rounded-[22px] border bg-white/6 px-4 py-3.5 text-[15px] text-[var(--color-pearl)] outline-none transition placeholder:text-white/32 ${
          error
            ? "border-rose-300/45 shadow-[0_0_0_1px_rgba(251,113,133,0.14)]"
            : "border-white/10 hover:border-white/18 focus:border-[var(--color-accent-gold)] focus:bg-white/8"
        } ${className}`}
        aria-invalid={Boolean(error)}
        {...props}
      />
    </FieldShell>
  );
}

type SelectInputProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  options: Array<{ value: string; label: string }>;
};

export function OnboardingSelect({
  label,
  error,
  hint,
  optional,
  id,
  className = "",
  options,
  ...props
}: SelectInputProps) {
  const inputId = id ?? props.name ?? label;
  return (
    <FieldShell label={label} error={error} hint={hint} optional={optional}>
      <select
        id={inputId}
        className={`w-full appearance-none rounded-[22px] border bg-white/6 px-4 py-3.5 text-[15px] text-[var(--color-pearl)] outline-none transition ${
          error
            ? "border-rose-300/45 shadow-[0_0_0_1px_rgba(251,113,133,0.14)]"
            : "border-white/10 hover:border-white/18 focus:border-[var(--color-accent-gold)] focus:bg-white/8"
        } ${className}`}
        aria-invalid={Boolean(error)}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-[#0c1727] text-[var(--color-pearl)]">
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}
