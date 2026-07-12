"use client";

import type {
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";

type FieldShellProps = {
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  counter?: { value: number; max: number };
  htmlFor?: string;
  children: ReactNode;
};

function FieldShell({ label, error, hint, optional, counter, htmlFor, children }: FieldShellProps) {
  return (
    <div className="group space-y-2.5">
      <div className="flex items-center justify-between gap-3 px-1">
        <label htmlFor={htmlFor} className="text-[13px] font-bold uppercase tracking-wider text-[var(--color-sand)]">
          {label}
        </label>
        <div className="flex items-center gap-3">
          {counter ? (
            <span
              className={`text-[11px] font-bold uppercase tracking-widest ${
                counter.value > counter.max ? "text-[var(--color-danger)]" : "text-[var(--color-ash)]"
              }`}
            >
              {counter.value}/{counter.max}
            </span>
          ) : null}
          {optional ? (
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-mist)]">
              Optional
            </span>
          ) : null}
        </div>
      </div>
      {children}
      {hint && !error ? (
        <p className="px-1 text-[12px] leading-relaxed text-[var(--color-mist)]">{hint}</p>
      ) : null}
      {error ? (
        <p className="flex items-center gap-2 px-1 text-[12px] font-bold leading-relaxed text-[var(--color-danger)] animate-scale-in" role="alert">
          <span className="flex h-1.5 w-1.5 rounded-full bg-current" />
          {error}
        </p>
      ) : null}
    </div>
  );
}

const baseField =
  "min-h-[52px] w-full rounded-2xl border bg-white/[0.03] px-5 py-3.5 text-[15px] font-medium text-[var(--color-pearl)] outline-none transition-all placeholder:text-[var(--color-ash)] focus:bg-white/[0.06]";
const baseState = (error?: string) =>
  error
    ? "border-[var(--color-danger)] shadow-[0_0_20px_-5px_rgba(255,107,122,0.2)]"
    : "border-white/10 hover:border-white/20 focus:border-[var(--color-gold-500)] focus:shadow-[0_0_20px_-10px_rgba(217,167,82,0.3)]";

type TextInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  counter?: { value: number; max: number };
};

export function OnboardingTextInput({
  label,
  error,
  hint,
  optional,
  counter,
  id,
  className = "",
  ...props
}: TextInputProps) {
  const inputId = id ?? props.name ?? label;
  return (
    <FieldShell label={label} error={error} hint={hint} optional={optional} counter={counter} htmlFor={inputId}>
      <input
        id={inputId}
        className={`${baseField} ${baseState(error)} ${className}`}
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
  counter?: { value: number; max: number };
};

export function OnboardingTextarea({
  label,
  error,
  hint,
  optional,
  counter,
  id,
  className = "",
  ...props
}: TextareaProps) {
  const inputId = id ?? props.name ?? label;
  return (
    <FieldShell label={label} error={error} hint={hint} optional={optional} counter={counter} htmlFor={inputId}>
      <textarea
        id={inputId}
        className={`${baseField} ${baseState(error)} resize-none ${className}`}
        aria-invalid={Boolean(error)}
        {...props}
      />
    </FieldShell>
  );
}
