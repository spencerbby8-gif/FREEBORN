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
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={htmlFor} className="text-sm font-semibold text-[var(--color-pearl)]">
          {label}
        </label>
        <div className="flex items-center gap-2">
          {counter ? (
            <span
              className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${
                counter.value > counter.max ? "text-[var(--color-danger)]" : "text-[var(--color-stone)]"
              }`}
            >
              {counter.value}/{counter.max}
            </span>
          ) : null}
          {optional ? (
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-stone)]">
              Optional
            </span>
          ) : null}
        </div>
      </div>
      {children}
      {hint && !error ? (
        <p className="text-xs leading-5 text-[var(--color-mist)]">{hint}</p>
      ) : null}
      {error ? (
        <p className="flex items-center gap-1.5 text-xs font-medium leading-5 text-[var(--color-danger)]" role="alert">
          <span aria-hidden="true">●</span>
          {error}
        </p>
      ) : null}
    </div>
  );
}

const baseField =
  "w-full rounded-2xl border bg-white/[0.04] px-4 py-3.5 text-[15px] text-[var(--color-pearl)] outline-none transition placeholder:text-white/30 focus:bg-white/[0.06]";
const baseState = (error?: string) =>
  error
    ? "border-[var(--color-danger)]/55 shadow-[0_0_0_3px_rgba(255,107,122,0.10)]"
    : "border-white/10 hover:border-white/20 focus:border-[var(--color-gold-500)] focus:shadow-[0_0_0_3px_rgba(217,167,82,0.12)]";

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
