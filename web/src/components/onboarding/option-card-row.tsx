"use client";

import { CheckIcon } from "@/components/icons";

type Option = { value: string; label: string; caption?: string };

type OptionCardRowProps = {
  options: Option[];
  value: string[];
  onChange: (next: string[]) => void;
  max?: number;
};

export function OptionCardRow({ options, value, onChange, max }: OptionCardRowProps) {
  const toggle = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((item) => item !== optionValue));
      return;
    }
    if (max && value.length >= max) return;
    onChange([...value, optionValue]);
  };

  return (
    <div className="grid gap-2.5 sm:grid-cols-2">
      {options.map((option) => {
        const active = value.includes(option.value);
        const disabled = !active && Boolean(max && value.length >= max);
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => toggle(option.value)}
            disabled={disabled}
            aria-pressed={active}
            className={`group relative flex items-start gap-3 rounded-2xl border px-4 py-3 text-left transition-all active:scale-[0.99] ${
              active
                ? "border-[var(--color-gold-500)]/50 bg-[var(--color-gold-500)]/10"
                : disabled
                  ? "border-white/8 bg-white/[0.02] opacity-50"
                  : "border-white/10 bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.07]"
            }`}
          >
            <span
              className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border transition-colors ${
                active
                  ? "border-[var(--color-gold-500)] bg-[var(--color-gold-500)] text-[var(--color-ink)]"
                  : "border-white/20 text-transparent"
              }`}
            >
              <CheckIcon size={12} />
            </span>
            <span>
              <span className={`block text-sm font-semibold ${active ? "text-[var(--color-pearl)]" : "text-[var(--color-pearl)]/90"}`}>
                {option.label}
              </span>
              {option.caption ? (
                <span className="mt-0.5 block text-xs leading-5 text-[var(--color-mist)]">{option.caption}</span>
              ) : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}
