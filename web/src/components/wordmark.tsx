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
            "radial-gradient(circle at 35% 35%, rgba(239,94,94,0.55) 0%, rgba(217,167,82,0.25) 45%, transparent 70%)",
          filter: "blur(6px)",
        }}
      />
      {/* Mark plate */}
      <svg
        viewBox="0 0 40 40"
        width={size}
        height={size}
        className="relative"
      >
        <defs>
          <linearGradient id="fb-ember" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ef5e5e" />
            <stop offset="55%" stopColor="#d9a752" />
            <stop offset="100%" stopColor="#8a6ef2" />
          </linearGradient>
          <linearGradient id="fb-plate" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#171d36" />
            <stop offset="100%" stopColor="#0a0d18" />
          </linearGradient>
        </defs>

        {/* Rounded square plate */}
        <rect
          x="1"
          y="1"
          width="38"
          height="38"
          rx="11"
          ry="11"
          fill="url(#fb-plate)"
          stroke="url(#fb-ember)"
          strokeWidth="1"
          opacity="0.95"
        />

        {/* The flame / F glyph */}
        <g stroke="url(#fb-ember)" strokeWidth="2.2" strokeLinecap="round" fill="none">
          {/* Left ember arc */}
          <path d="M14 30 C 14 18, 18 12, 24 10" />
          {/* Right ember arc */}
          <path d="M26 30 C 26 20, 23 16, 20 13" />
          {/* Ember dot (spark) */}
          <circle cx="20" cy="11" r="1.5" fill="#f6d79a" stroke="none" />
        </g>
      </svg>
    </div>
  );
}

export function Wordmark({ muted = false, size = "md", mono = false }: WordmarkProps) {
  const dims = {
    sm: { logo: 28, name: "text-lg", tag: "text-[8px]" },
    md: { logo: 38, name: "text-xl", tag: "text-[9px]" },
    lg: { logo: 56, name: "text-[2.25rem] leading-none", tag: "text-[10px]" },
  }[size];

  return (
    <div className="flex items-center gap-3 select-none">
      <Monogram size={dims.logo} />
      <div className="leading-none">
        <div
          className={`${dims.name} tracking-tight font-semibold ${
            mono ? "tracking-[0.18em] uppercase" : ""
          } ${
            muted ? "text-[var(--color-pearl)]/85" : "text-[var(--color-pearl)]"
          }`}
          style={{ fontFamily: "var(--font-display)", fontVariationSettings: "'opsz' 144, 'SOFT' 50" }}
        >
          {mono ? brand.shortName : brand.name}
        </div>
        <div
          className={`mt-1 font-medium uppercase tracking-[0.28em] ${dims.tag} ${
            muted ? "text-[var(--color-mist)]" : "text-[var(--color-sand)]"
          }`}
        >
          {brand.tagline}
        </div>
      </div>
    </div>
  );
}
