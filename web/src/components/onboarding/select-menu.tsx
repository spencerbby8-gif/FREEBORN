"use client";

import { useEffect, useRef, useState } from "react";
import { CheckIcon } from "@/components/icons";

type Option = { value: string; label: string };

type SelectMenuProps = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  id?: string;
  hideLabel?: boolean;
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
  hideLabel = false,
}: SelectMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlId = id ?? label ?? "select-menu";
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
    <div className="group space-y-2.5">
      {label && !hideLabel ? (
        <div className="flex items-center justify-between gap-3 px-1">
          <label htmlFor={controlId} className="text-[13px] font-bold uppercase tracking-wider text-[var(--color-sand)]">
            {label}
          </label>
          {optional ? (
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-mist)]">
              Optional
            </span>
          ) : null}
        </div>
      ) : null}

      <div className="relative" ref={containerRef}>
        <button
          type="button"
          id={controlId}
          onClick={() => setOpen((value) => !value)}
          aria-haspopup="listbox"
          aria-expanded={open}
          className={`flex min-h-[52px] w-full items-center justify-between rounded-2xl border bg-white/[0.03] px-5 py-3.5 text-left text-[15px] font-medium outline-none transition-all ${
            open ? "border-[var(--color-gold-500)] bg-white/[0.06] shadow-[0_0_20px_-10px_rgba(217,167,82,0.3)]" : ""
          } ${
            error
              ? "border-[var(--color-danger)] shadow-[0_0_20px_-5px_rgba(255,107,122,0.2)]"
              : "border-white/10 hover:border-white/20"
          } ${selected ? "text-[var(--color-pearl)]" : "text-[var(--color-ash)]"}`}
        >
          <span className="truncate">{selected ?? placeholder}</span>
          <span className="ml-2 text-[var(--color-mist)] transition-transform duration-300">
            <Chevron open={open} />
          </span>
        </button>

        {open ? (
          <div
            role="listbox"
            className="absolute z-30 mt-2 max-h-64 w-full origin-top animate-scale-in overflow-y-auto rounded-[24px] border border-white/10 bg-[#0c1424] p-2 shadow-[var(--shadow-card-lg)] backdrop-blur-xl"
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
                  className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-[14px] font-bold transition-all ${
                    active
                      ? "bg-[var(--color-gold-500)]/15 text-[var(--color-pearl)]"
                      : "text-[var(--color-sand)] hover:bg-white/[0.06] hover:text-[var(--color-pearl)]"
                  }`}
                >
                  {option.label}
                  {active ? (
                    <CheckIcon size={16} className="text-[var(--color-gold-300)]" />
                  ) : null}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

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
