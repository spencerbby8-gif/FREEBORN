export const colors = {
  night: "#07101c",
  midnight: "#0c1727",
  slate: "#132238",
  panel: "#111c2d",
  panelSoft: "#172438",
  cream: "#f7f1e8",
  pearl: "#fffaf5",
  stone: "#d7ccbf",
  mist: "#9ba8ba",
  ink: "#0b1320",
  line: "rgba(255, 255, 255, 0.08)",
  lineStrong: "rgba(255, 255, 255, 0.16)",
  lineDark: "rgba(11, 19, 32, 0.12)",
  accentRose: "#ff8578",
  accentGold: "#f1c97a",
  accentBlue: "#8ccfff",
  accentMint: "#7bd7bb",
  accentLilac: "#bcadff",
  success: "#7fd8b8",
  danger: "#ff9ea0",
} as const;

export const gradients = {
  hero: "linear-gradient(135deg, #ff8578 0%, #f1c97a 35%, #8ccfff 100%)",
  aurora: "linear-gradient(145deg, rgba(255,133,120,0.24), rgba(188,173,255,0.18) 45%, rgba(140,207,255,0.2) 100%)",
  night: "linear-gradient(180deg, #07101c 0%, #0c1727 52%, #101e33 100%)",
  softPanel:
    "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 56,
  '6xl': 72,
} as const;

export const radii = {
  sm: 12,
  md: 18,
  lg: 24,
  xl: 30,
  pill: 999,
} as const;

export const shadows = {
  glow: "0 24px 80px rgba(5, 10, 18, 0.36)",
  card: "0 22px 54px rgba(5, 10, 18, 0.22)",
  hairline: "0 1px 0 rgba(255, 255, 255, 0.08) inset",
} as const;

export const typography = {
  display: {
    hero: "clamp(3.5rem, 8vw, 6.5rem)",
    section: "clamp(2rem, 4vw, 3.5rem)",
  },
  body: {
    lg: "1.125rem",
    base: "1rem",
    sm: "0.9375rem",
  },
  tracking: {
    eyebrow: "0.28em",
    tight: "-0.04em",
  },
} as const;
