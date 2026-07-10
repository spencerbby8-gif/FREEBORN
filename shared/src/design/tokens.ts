/* ==========================================================================
   FREEBORN — DESIGN TOKENS
   A luxurious dark-first palette built around ember, midnight, and soft pearl.
   Designed to feel warm, cinematic, and unmistakably premium.
   ========================================================================== */

export const colors = {
  /* Deep foundations */
  void: "#05070d",       // deep black-blue, used sparingly
  night: "#0a0d18",      // primary background
  midnight: "#10152a",   // elevated surfaces
  abyss: "#171d36",      // card background
  slate: "#1f2744",      // raised / active surfaces
  ink: "#05070d",        // high-contrast text on light accents

  /* Pearlescent neutrals */
  pearl: "#fbf7f2",      // primary text
  ivory: "#f0e9df",      // secondary text
  sand: "#cfc4b4",       // tertiary / muted
  mist: "#9aa1b8",       // disabled / caption
  ash: "#6a718a",        // darkest muted

  /* Signature accents — Ember (primary brand heat) */
  ember50:  "#fff1ee",
  ember100: "#ffd9d0",
  ember300: "#ff9b86",
  ember500: "#ef5e5e",
  ember600: "#d94248",
  ember700: "#a82834",

  /* Signature accents — Gold (warm light) */
  gold300: "#f6d79a",
  gold500: "#d9a752",
  gold600: "#b5822f",

  /* Signature accents — Violet (mystery / allure) */
  violet300: "#c8b9ff",
  violet500: "#8a6ef2",
  violet600: "#5d40c9",

  /* Signature accents — Teal (calm / trust) */
  teal300: "#a6e6dc",
  teal500: "#4fb8a7",

  /* Signal */
  success: "#6dd3b0",
  danger:  "#ff6b7a",
  warning: "#f0b45a",

  /* Line / stroke */
  line:        "rgba(255, 255, 255, 0.07)",
  lineSoft:    "rgba(255, 255, 255, 0.04)",
  lineStrong:  "rgba(255, 255, 255, 0.14)",
  linePearl:   "rgba(251, 247, 242, 0.12)",
  hairline:    "rgba(255, 255, 255, 0.06)",

  /* Glass */
  glass:       "rgba(20, 25, 45, 0.55)",
  glassStrong: "rgba(16, 21, 42, 0.78)",
  glassLight:  "rgba(251, 247, 242, 0.04)",

  /* Legacy aliases (kept so imports that use old names don't break) */
  panel:     "#171d36",
  panelSoft: "#1f2744",
  cream:     "#f0e9df",
  stone:     "#cfc4b4",
  accentRose:  "#ef5e5e",
  accentGold:  "#d9a752",
  accentBlue:  "#8ccfff",
  accentMint:  "#6dd3b0",
  accentLilac: "#c8b9ff",
} as const;

export const gradients = {
  /* Hero brand gradient — ember → gold → violet (warm to cool, cinematic) */
  ember:       "linear-gradient(135deg, #ef5e5e 0%, #d9a752 50%, #8a6ef2 100%)",
  emberSoft:   "linear-gradient(135deg, rgba(239,94,94,0.85) 0%, rgba(217,167,82,0.85) 55%, rgba(138,110,242,0.85) 100%)",
  emberWarm:   "linear-gradient(135deg, #ef5e5e 0%, #f6d79a 100%)",

  /* Ambient aurora for panels — soft violet-to-teal */
  aurora:      "linear-gradient(145deg, rgba(138,110,242,0.22) 0%, rgba(79,184,167,0.10) 50%, rgba(239,94,94,0.18) 100%)",

  /* Night backdrop for page */
  night:       "linear-gradient(180deg, #05070d 0%, #0a0d18 40%, #10152a 100%)",

  /* Panel highlight */
  panelGloss:  "linear-gradient(180deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.02) 100%)",

  /* Radial glow for hero orbs */
  emberGlow:   "radial-gradient(circle at center, rgba(239,94,94,0.35) 0%, rgba(239,94,94,0) 70%)",
  goldGlow:    "radial-gradient(circle at center, rgba(217,167,82,0.28) 0%, rgba(217,167,82,0) 70%)",
  violetGlow:  "radial-gradient(circle at center, rgba(138,110,242,0.30) 0%, rgba(138,110,242,0) 70%)",
} as const;

export const spacing = {
  "3xs": 2,
  "2xs": 4,
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
  "6xl": 64,
  "7xl": 80,
  "8xl": 96,
  "9xl": 128,
} as const;

export const radii = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  "2xl": 36,
  pill: 999,
} as const;

export const shadows = {
  /* Soft ambient glow behind hero elements */
  ember:     "0 30px 80px -10px rgba(239, 94, 94, 0.35), 0 0 0 1px rgba(239, 94, 94, 0.10) inset",
  violet:    "0 30px 80px -10px rgba(138, 110, 242, 0.30), 0 0 0 1px rgba(138, 110, 242, 0.10) inset",
  gold:      "0 20px 60px -10px rgba(217, 167, 82, 0.25)",

  /* Card depth layers */
  card:      "0 24px 60px -12px rgba(0,0,0,0.55), 0 1px 0 rgba(255,255,255,0.05) inset",
  cardLg:    "0 40px 100px -20px rgba(0,0,0,0.65), 0 1px 0 rgba(255,255,255,0.06) inset",
  raised:    "0 12px 30px -8px rgba(0,0,0,0.50), 0 1px 0 rgba(255,255,255,0.05) inset",

  /* Button shadows */
  primaryBtn:
    "0 10px 30px -6px rgba(239, 94, 94, 0.45), 0 1px 0 rgba(255,255,255,0.20) inset",
  ghostBtn:
    "0 1px 0 rgba(255,255,255,0.05) inset",

  hairline:  "0 1px 0 rgba(255, 255, 255, 0.06) inset",
} as const;

/* Typography — editorial serif for display, geometric sans for body */
export const typography = {
  fontDisplay: "'Fraunces', 'Iowan Old Style', 'Palatino Linotype', Palatino, Georgia, serif",
  fontBody:    "'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  fontMono:    "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",

  display: {
    hero:    "clamp(3.25rem, 7.2vw, 6rem)",
    massive: "clamp(4rem, 10vw, 8.5rem)",
    section: "clamp(2.25rem, 4.5vw, 3.75rem)",
    h3:      "clamp(1.5rem, 2.5vw, 2rem)",
  },
  body: {
    xl: "1.25rem",
    lg: "1.125rem",
    base: "1rem",
    sm: "0.9375rem",
    xs: "0.8125rem",
  },
  tracking: {
    eyebrow:   "0.32em",
    tight:     "-0.045em",
    display:   "-0.055em",
    wide:      "0.08em",
  },
  leading: {
    tight:  1.05,
    snug:   1.25,
    normal: 1.55,
    relax:  1.75,
  },
} as const;

/* Motion */
export const motion = {
  easeOut: "cubic-bezier(0.22, 1, 0.36, 1)",
  easeInOut: "cubic-bezier(0.65, 0, 0.35, 1)",
  spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
} as const;
