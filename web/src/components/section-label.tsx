type SectionLabelProps = {
  label: string;
  dark?: boolean;
};

export function SectionLabel({ label, dark = false }: SectionLabelProps) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] ${
        dark
          ? "border border-[var(--color-line-dark)] bg-[rgba(11,19,32,0.03)] text-[rgba(11,19,32,0.56)]"
          : "border border-white/10 bg-white/5 text-[var(--color-stone)]"
      }`}
    >
      <span className={`h-2 w-2 rounded-full ${dark ? "bg-[var(--color-accent-rose)]" : "bg-[var(--color-accent-gold)]"}`} />
      {label}
    </div>
  );
}
