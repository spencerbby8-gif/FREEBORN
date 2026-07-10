"use client";

import { useMemo, useState } from "react";

export function BirthDateField({ defaultValue, error, hint }: { defaultValue: string; error?: string; hint?: string }) {
  const initial = /^\d{4}-\d{2}-\d{2}$/.test(defaultValue) ? defaultValue.split("-") : ["", "", ""];
  const [year, setYear] = useState(initial[0]);
  const [month, setMonth] = useState(initial[1]);
  const [day, setDay] = useState(initial[2]);
  const value = useMemo(() => year && month && day ? `${year.padStart(4, "0")}-${month.padStart(2, "0")}-${day.padStart(2, "0")}` : "", [year, month, day]);
  const describedBy = error ? "birth_date-error" : "birth_date-hint";
  const inputClass = `min-w-0 rounded-2xl border bg-white/[0.04] px-3 py-3.5 text-center text-base text-[var(--color-pearl)] outline-none transition placeholder:text-white/30 ${error ? "border-rose-300/45" : "border-white/10 focus:border-[var(--color-accent-gold)] focus:bg-white/[0.07]"}`;
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-semibold text-[var(--color-pearl)]">Date of birth</legend>
      <div className="grid grid-cols-[1fr_1fr_1.35fr] gap-2" aria-describedby={describedBy}>
        <input className={inputClass} aria-label="Birth month" inputMode="numeric" autoComplete="bday-month" placeholder="MM" maxLength={2} value={month} onChange={(e) => setMonth(e.target.value.replace(/\D/g, "").slice(0, 2))} />
        <input className={inputClass} aria-label="Birth day" inputMode="numeric" autoComplete="bday-day" placeholder="DD" maxLength={2} value={day} onChange={(e) => setDay(e.target.value.replace(/\D/g, "").slice(0, 2))} />
        <input className={inputClass} aria-label="Birth year" inputMode="numeric" autoComplete="bday-year" placeholder="YYYY" maxLength={4} value={year} onChange={(e) => setYear(e.target.value.replace(/\D/g, "").slice(0, 4))} />
      </div>
      <input type="hidden" name="birth_date" value={value} />
      {error ? <p id="birth_date-error" role="alert" className="text-xs font-semibold text-rose-200">● {error}</p> : <p id="birth_date-hint" className="text-xs leading-5 text-[var(--color-mist)]">{hint}</p>}
    </fieldset>
  );
}
