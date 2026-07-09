import { brand } from "@freeborn/shared";

type WordmarkProps = {
  muted?: boolean;
};

export function Wordmark({ muted = false }: WordmarkProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(255,133,120,0.18),rgba(140,207,255,0.22))] shadow-[0_12px_30px_rgba(5,10,18,0.25)]">
        <div className="absolute inset-[1px] rounded-[15px] bg-[rgba(7,16,28,0.85)]" />
        <div className="relative flex items-center gap-[3px]">
          <span className="h-4 w-[2px] rounded-full bg-[var(--color-pearl)]/90" />
          <span className="h-6 w-6 rounded-full border border-[var(--color-pearl)]/75 border-l-transparent border-r-transparent" />
          <span className="h-4 w-[2px] rounded-full bg-[var(--color-pearl)]/90" />
        </div>
      </div>
      <div className="leading-none">
        <div className={`font-[family-name:var(--font-display)] text-2xl tracking-[-0.05em] ${muted ? "text-[var(--color-pearl)]/92" : "text-[var(--color-pearl)]"}`}>
          {brand.name}
        </div>
        <div className={`mt-1 text-[10px] font-semibold uppercase tracking-[0.28em] ${muted ? "text-[var(--color-mist)]" : "text-[var(--color-stone)]"}`}>
          Intentional connection
        </div>
      </div>
    </div>
  );
}
