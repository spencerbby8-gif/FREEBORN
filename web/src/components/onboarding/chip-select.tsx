"use client";

import { useCallback } from "react";

type ChipSelectProps = {
  label: string;
  options: readonly string[];
  value: string[];
  onChange: (next: string[]) => void;
  error?: string;
  hint?: string;
  optional?: boolean;
  max?: number;
};

export function ChipSelect({
  label,
  options,
  value,
  onChange,
  error,
  hint,
  optional,
  max,
}: ChipSelectProps) {
  const toggle = useCallback(
    (option: string) => {
      if (value.includes(option)) {
        onChange(value.filter((item) => item !== option));
        return;
      }
      if (max && value.length >= max) {
        return;
      }
      onChange([...value, option]);
    },
    [max, onChange, value],
  );

  const atMax = Boolean(max && value.length >= max);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <label className="block text-sm font-semibold text-[var(--color-pearl)]">{label}</label>
        <div className="flex items-center gap-2">
          {optional ? (
            <span className="rounded-full border border-white/10 bg-white/4 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-stone)]">
              Optional
            </span>
          ) : null}
          {max ? (
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-stone)]">
              {value.length}/{max}
            </span>
          ) : null}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = value.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => toggle(option)}
              aria-pressed={active}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                active
                  ? "border-[var(--color-accent-gold)] bg-[var(--color-accent-gold)]/15 text-[var(--color-pearl)]"
                  : atMax
                    ? "border-white/10 bg-white/3 text-[var(--color-mist)]/60"
                    : "border-white/12 bg-white/5 text-[var(--color-mist)] hover:border-white/20 hover:text-[var(--color-pearl)]"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
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
