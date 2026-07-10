"use client";

import { useEffect, useRef, useState } from "react";
import { CheckIcon } from "@/components/icons";

type Option = { value: string; label: string };

type SelectMenuProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  id?: string;
};

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function SelectMenu({
  label,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  error,
  hint,
  optional,
  id,
}: SelectMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlId = id ?? label;
  const selected = options.find((option) => option.value === value)?.label;

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={controlId} className="text-sm font-semibold text-[var(--color-pearl)]">
          {label}
        </label>
        {optional ? (
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-stone)]">
            Optional
          </span>
        ) : null}
      </div>

      <div className="relative" ref={containerRef}>
        <button
          type="button"
          id={controlId}
          onClick={() => setOpen((value) => !value)}
          aria-haspopup="listbox"
          aria-expanded={open}
          className={`flex min-h-12 w-full items-center justify-between rounded-2xl border bg-white/[0.04] px-4 py-3.5 text-left text-[15px] outline-none transition-all ${
            open ? "border-[var(--color-gold-500)] shadow-[0_0_0_3px_rgba(217,167,82,0.12)]" : ""
          } ${
            error
              ? "border-[var(--color-danger)]/55"
              : "border-white/10 hover:border-white/20"
          } ${selected ? "text-[var(--color-pearl)]" : "text-white/30"}`}
        >
          <span className="truncate">{selected ?? placeholder}</span>
          <span className="ml-2 text-[var(--color-mist)]">
            <Chevron open={open} />
          </span>
        </button>

        {open ? (
          <div
            role="listbox"
            className="absolute z-30 mt-2 max-h-64 w-full origin-top animate-scale-in overflow-y-auto rounded-2xl border border-white/10 bg-[#0c1424] p-1.5 shadow-[var(--shadow-card-lg)] backdrop-blur-xl"
          >
            {options.map((option) => {
              const active = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-[14px] transition-colors ${
                    active
                      ? "bg-[var(--color-gold-500)]/12 text-[var(--color-pearl)]"
                      : "text-[var(--color-sand)] hover:bg-white/[0.06] hover:text-[var(--color-pearl)]"
                  }`}
                >
                  {option.label}
                  {active ? (
                    <CheckIcon size={15} className="text-[var(--color-gold-300)]" />
                  ) : null}
                </button>
              );
            })}
          </div>
        ) : null}
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
