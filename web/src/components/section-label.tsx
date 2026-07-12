type SectionLabelProps = {
  label: string;
  dot?: "ember" | "gold" | "violet" | "teal" | "none";
  size?: "sm" | "md";
};

const dotColor: Record<NonNullable<SectionLabelProps["dot"]>, string> = {
  ember:  "bg-[var(--color-ember-500)] shadow-[0_0_14px_rgba(239,94,94,0.6)]",
  gold:   "bg-[var(--color-gold-500)] shadow-[0_0_14px_rgba(217,167,82,0.5)]",
  violet: "bg-[var(--color-violet-500)] shadow-[0_0_14px_rgba(138,110,242,0.55)]",
  teal:   "bg-[var(--color-teal-500)] shadow-[0_0_14px_rgba(79,184,167,0.45)]",
  none:   "",
};

export function SectionLabel({ label, dot = "ember", size = "md" }: SectionLabelProps) {
  return (
    <div
      className={`inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-4 backdrop-blur-xl ${
        size === "sm" ? "py-1.5 text-[10px]" : "py-2 text-[11px]"
      } font-bold uppercase tracking-[0.25em] text-[var(--color-sand)] shadow-inner`}
    >
      {dot !== "none" && (
        <span className="relative flex h-1.5 w-1.5">
          <span className={`absolute inset-0 rounded-full ${dotColor[dot]}`} />
          <span className={`absolute inset-0 rounded-full ${dotColor[dot]} opacity-40 animate-ping`} />
        </span>
      )}
      {label}
    </div>
  );
}
