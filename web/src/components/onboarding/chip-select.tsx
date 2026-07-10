"use client";

import { useCallback } from "react";
import { CheckIcon } from "@/components/icons";

type ChipSelectProps = {
  label: string;
  options: readonly string[];
  value: string[];
  onChange?: (next: string[]) => void;
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
      if (!onChange) return;
      if (value.includes(option)) {
        onChange(value.filter((item) => item !== option));
        return;
      }
      if (max && value.length >= max) return;
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
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-stone)]">
              Optional
            </span>
          ) : null}
          {max ? (
            <span
              className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${
                atMax ? "text-[var(--color-gold-300)]" : "text-[var(--color-stone)]"
              }`}
            >
              {value.length}/{max}
            </span>
          ) : null}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = value.includes(option);
          const disabled = !active && atMax;
          return (
            <button
              key={option}
              type="button"
              onClick={() => toggle(option)}
              aria-pressed={active}
              disabled={disabled}
              className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition-all active:scale-[0.97] ${
                active
                  ? "border-[var(--color-gold-500)]/50 bg-[var(--color-gold-500)]/12 text-[var(--color-pearl)]"
                  : disabled
                    ? "border-white/8 bg-white/[0.02] text-[var(--color-mist)]/45"
                    : "border-white/10 bg-white/[0.04] text-[var(--color-mist)] hover:border-white/20 hover:bg-white/[0.07] hover:text-[var(--color-pearl)]"
              }`}
            >
              {active ? <CheckIcon size={14} className="text-[var(--color-gold-300)]" /> : null}
              {option}
            </button>
          );
        })}
      </div>
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
