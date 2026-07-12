import { brand } from "@freeborn/shared";

type WordmarkProps = {
  muted?: boolean;
  size?: "sm" | "md" | "lg";
  mono?: boolean;
};

/**
 * Freeborn Monogram — "The Flame"
 *
 * An abstract F-shape carved by two ember arcs meeting at a golden center.
 * Designed to feel both ancient (a seal) and modern (a spark). Built entirely
 * in SVG so it scales crisply to any size and animates with CSS.
 */
function Monogram({ size = 40 }: { size?: number }) {
  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
      aria-hidden
    >
      {/* Outer glow */}
      <div
        className="absolute inset-0 rounded-[32%] pulse-glow"
        style={{
          background:
            "radial-gradient(circle at 35% 35%, rgba(239,94,94,0.4) 0%, rgba(217,167,82,0.2) 45%, transparent 70%)",
          filter: "blur(8px)",
        }}
      />
      {/* Mark plate */}
      <svg
        viewBox="0 0 40 40"
        width={size}
        height={size}
        className="relative drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
      >
        <defs>
          <linearGradient id="fb-ember" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ef5e5e" />
            <stop offset="55%" stopColor="#d9a752" />
            <stop offset="100%" stopColor="#8a6ef2" />
          </linearGradient>
          <linearGradient id="fb-plate" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1f2744" />
            <stop offset="100%" stopColor="#0a0d18" />
          </linearGradient>
        </defs>

        {/* Rounded square plate */}
        <rect
          x="1"
          y="1"
          width="38"
          height="38"
          rx="12"
          ry="12"
          fill="url(#fb-plate)"
          stroke="url(#fb-ember)"
          strokeWidth="1.5"
          opacity="1"
        />

        {/* The flame / F glyph */}
        <g stroke="url(#fb-ember)" strokeWidth="2.5" strokeLinecap="round" fill="none">
          {/* Left ember arc */}
          <path d="M14 28 C 14 18, 18 12, 24 10" />
          {/* Right ember arc */}
          <path d="M26 28 C 26 20, 23 16, 20 13" />
          {/* Ember dot (spark) */}
          <circle cx="20" cy="11" r="1.8" fill="#f6d79a" stroke="none" />
        </g>
      </svg>
    </div>
  );
}

export function Wordmark({ muted = false, size = "md", mono = false }: WordmarkProps) {
  const dims = {
    sm: { logo: 32, name: "text-[18px]", tag: "text-[8px]" },
    md: { logo: 42, name: "text-[22px]", tag: "text-[9px]" },
    lg: { logo: 64, name: "text-[32px] leading-none", tag: "text-[10px]" },
  }[size];

  return (
    <div className="flex items-center gap-4 select-none">
      <Monogram size={dims.logo} />
      <div className="leading-tight">
        <div
          className={`${dims.name} tracking-tighter font-bold ${
            mono ? "tracking-[0.18em] uppercase" : ""
          } ${
            muted ? "text-[var(--color-pearl)]/80" : "text-[var(--color-pearl)]"
          }`}
          style={{ fontFamily: "var(--font-display)", fontVariationSettings: "'opsz' 144, 'wght' 500" }}
        >
          {mono ? brand.shortName : brand.name}
        </div>
        <div
          className={`mt-1 font-black uppercase tracking-[0.3em] ${dims.tag} ${
            muted ? "text-[var(--color-ash)]" : "text-[var(--color-sand)]"
          }`}
        >
          {brand.tagline}
        </div>
      </div>
    </div>
  );
}
