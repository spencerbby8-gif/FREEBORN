"use client";

type PasswordStrengthProps = {
  password: string;
};

type Rule = { label: string; test: (value: string) => boolean };

const rules: Rule[] = [
  { label: "8+ characters", test: (v) => v.length >= 8 },
  { label: "Uppercase letter", test: (v) => /[A-Z]/.test(v) },
  { label: "Lowercase letter", test: (v) => /[a-z]/.test(v) },
  { label: "A number", test: (v) => /[0-9]/.test(v) },
];

const levels = [
  { label: "Too weak", color: "var(--color-danger)", segments: 1 },
  { label: "Fair", color: "var(--color-warning)", segments: 2 },
  { label: "Good", color: "var(--color-gold-500)", segments: 3 },
  { label: "Strong", color: "var(--color-success)", segments: 4 },
];

export function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password) return null;

  const passed = rules.filter((rule) => rule.test(password)).length;
  const level = passed >= 4 ? 3 : passed - 1 < 0 ? 0 : passed - 1;
  const current = levels[level];

  return (
    <div className="space-y-2">
      <div className="flex gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{
              backgroundColor: i < current.segments ? current.color : "rgba(255,255,255,0.10)",
            }}
          />
        ))}
      </div>
      <div className="flex items-center justify-between text-[11px] leading-4">
        <span className="font-semibold" style={{ color: current.color }}>
          {current.label}
        </span>
        <span className="flex gap-1" aria-hidden="true">
          {rules.map((rule) => (
            <span
              key={rule.label}
              title={rule.label}
              className={rule.test(password) ? "text-[var(--color-success)]" : "text-white/20"}
            >
              {rule.test(password) ? "●" : "○"}
            </span>
          ))}
        </span>
      </div>
    </div>
  );
}
