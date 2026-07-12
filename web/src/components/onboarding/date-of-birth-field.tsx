"use client";

import { useMemo, useState } from "react";
import { SelectMenu } from "./select-menu";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

type DateOfBirthFieldProps = {
  label?: string;
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
};

function parseParts(value: string): [string, string, string] {
  return /^(\d{4})-(\d{2})-(\d{2})$/.test(value)
    ? (value.split("-") as [string, string, string])
    : ["", "", ""];
}

export function DateOfBirthField({
  label = "Date of birth",
  value,
  onChange,
  error,
  hint,
}: DateOfBirthFieldProps) {
  const [year, setYear] = useState(parseParts(value)[0]);
  const [month, setMonth] = useState(parseParts(value)[1]);
  const [day, setDay] = useState(parseParts(value)[2]);

  const emit = (nextYear: string, nextMonth: string, nextDay: string) => {
    if (nextYear && nextMonth && nextDay) {
      onChange(`${nextYear}-${nextMonth}-${nextDay}`);
    }
  };

  const currentYear = new Date().getFullYear();
  const yearOptions = useMemo(() => {
    const oldest = currentYear - 100;
    const youngest = currentYear - 18;
    const list: Array<{ value: string; label: string }> = [];
    for (let y = youngest; y >= oldest; y--) {
      list.push({ value: String(y), label: String(y) });
    }
    return list;
  }, [currentYear]);

  const monthOptions = months.map((name, index) => ({
    value: String(index + 1).padStart(2, "0"),
    label: name,
  }));

  const dayOptions = Array.from({ length: 31 }, (_, i) => {
    const d = String(i + 1).padStart(2, "0");
    return { value: d, label: String(i + 1) };
  });

  return (
    <div className="space-y-2.5">
      <div className="px-1">
        <label className="text-[13px] font-bold uppercase tracking-wider text-[var(--color-sand)]">
          {label}
        </label>
      </div>
      <div className="grid grid-cols-[1.2fr_0.8fr_0.9fr] gap-3">
        <SelectMenu
          value={month}
          onChange={(next) => {
            setMonth(next);
            emit(year, next, day);
          }}
          options={monthOptions}
          placeholder="Month"
          hideLabel
        />
        <SelectMenu
          value={day}
          onChange={(next) => {
            setDay(next);
            emit(year, month, next);
          }}
          options={dayOptions}
          placeholder="Day"
          hideLabel
        />
        <SelectMenu
          value={year}
          onChange={(next) => {
            setYear(next);
            emit(next, month, day);
          }}
          options={yearOptions}
          placeholder="Year"
          hideLabel
        />
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
