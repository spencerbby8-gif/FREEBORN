import { colors, gradients, radii, shadows, spacing, typography, motion } from "./tokens";

const entries = {
  /* Color — foundations */
  "color-void": colors.void,
  "color-night": colors.night,
  "color-midnight": colors.midnight,
  "color-abyss": colors.abyss,
  "color-slate": colors.slate,
  "color-ink": colors.ink,

  /* Color — neutrals */
  "color-pearl": colors.pearl,
  "color-ivory": colors.ivory,
  "color-sand": colors.sand,
  "color-mist": colors.mist,
  "color-ash": colors.ash,

  /* Color — ember */
  "color-ember-50": colors.ember50,
  "color-ember-100": colors.ember100,
  "color-ember-300": colors.ember300,
  "color-ember-500": colors.ember500,
  "color-ember-600": colors.ember600,
  "color-ember-700": colors.ember700,

  /* Color — gold */
  "color-gold-300": colors.gold300,
  "color-gold-500": colors.gold500,
  "color-gold-600": colors.gold600,

  /* Color — violet */
  "color-violet-300": colors.violet300,
  "color-violet-500": colors.violet500,
  "color-violet-600": colors.violet600,

  /* Color — teal */
  "color-teal-300": colors.teal300,
  "color-teal-500": colors.teal500,

  /* Signals */
  "color-success": colors.success,
  "color-danger": colors.danger,
  "color-warning": colors.warning,

  /* Lines */
  "color-line": colors.line,
  "color-line-soft": colors.lineSoft,
  "color-line-strong": colors.lineStrong,
  "color-line-pearl": colors.linePearl,
  "color-hairline": colors.hairline,

  /* Glass */
  "color-glass": colors.glass,
  "color-glass-strong": colors.glassStrong,
  "color-glass-light": colors.glassLight,

  /* Legacy — preserved so existing imports work */
  "color-panel": colors.panel,
  "color-panel-soft": colors.panelSoft,
  "color-cream": colors.cream,
  "color-stone": colors.stone,
  "color-line-dark": "rgba(5,7,13,0.12)",
  "color-accent-rose": colors.accentRose,
  "color-accent-gold": colors.accentGold,
  "color-accent-blue": colors.accentBlue,
  "color-accent-mint": colors.accentMint,
  "color-accent-lilac": colors.accentLilac,

  /* Gradients */
  "gradient-ember": gradients.ember,
  "gradient-ember-soft": gradients.emberSoft,
  "gradient-ember-warm": gradients.emberWarm,
  "gradient-aurora": gradients.aurora,
  "gradient-night": gradients.night,
  "gradient-panel-gloss": gradients.panelGloss,
  "gradient-ember-glow": gradients.emberGlow,
  "gradient-gold-glow": gradients.goldGlow,
  "gradient-violet-glow": gradients.violetGlow,

  /* Legacy gradients (used in existing components) */
  "gradient-hero": gradients.ember,
  "gradient-soft-panel": gradients.panelGloss,

  /* Radius */
  "radius-xs": `${radii.xs}px`,
  "radius-sm": `${radii.sm}px`,
  "radius-md": `${radii.md}px`,
  "radius-lg": `${radii.lg}px`,
  "radius-xl": `${radii.xl}px`,
  "radius-2xl": `${radii["2xl"]}px`,
  "radius-pill": `${radii.pill}px`,

  /* Space */
  "space-3xs": `${spacing["3xs"]}px`,
  "space-2xs": `${spacing["2xs"]}px`,
  "space-xs": `${spacing.xs}px`,
  "space-sm": `${spacing.sm}px`,
  "space-md": `${spacing.md}px`,
  "space-lg": `${spacing.lg}px`,
  "space-xl": `${spacing.xl}px`,
  "space-2xl": `${spacing["2xl"]}px`,
  "space-3xl": `${spacing["3xl"]}px`,
  "space-4xl": `${spacing["4xl"]}px`,
  "space-5xl": `${spacing["5xl"]}px`,
  "space-6xl": `${spacing["6xl"]}px`,
  "space-7xl": `${spacing["7xl"]}px`,
  "space-8xl": `${spacing["8xl"]}px`,
  "space-9xl": `${spacing["9xl"]}px`,

  /* Shadows */
  "shadow-ember": shadows.ember,
  "shadow-violet": shadows.violet,
  "shadow-gold": shadows.gold,
  "shadow-card": shadows.card,
  "shadow-card-lg": shadows.cardLg,
  "shadow-raised": shadows.raised,
  "shadow-primary-btn": shadows.primaryBtn,
  "shadow-ghost-btn": shadows.ghostBtn,
  "shadow-hairline": shadows.hairline,
  "shadow-glow": shadows.cardLg,

  /* Typography */
  "font-display": typography.fontDisplay,
  "font-body": typography.fontBody,
  "font-mono": typography.fontMono,
  /* Legacy stack names — kept for globals.css / mobile compat */
  "font-display-stack": typography.fontDisplay,
  "font-body-stack": typography.fontBody,
  "font-display-hero": typography.display.hero,
  "font-display-massive": typography.display.massive,
  "font-display-section": typography.display.section,
  "font-display-h3": typography.display.h3,
  "font-body-xl": typography.body.xl,
  "font-body-lg": typography.body.lg,
  "font-body-base": typography.body.base,
  "font-body-sm": typography.body.sm,
  "font-body-xs": typography.body.xs,
  "tracking-eyebrow": typography.tracking.eyebrow,
  "tracking-tight": typography.tracking.tight,
  "tracking-display": typography.tracking.display,
  "tracking-wide": typography.tracking.wide,
  "leading-tight": typography.leading.tight,
  "leading-snug": typography.leading.snug,
  "leading-normal": typography.leading.normal,
  "leading-relaxed": typography.leading.relax,

  /* Motion */
  "ease-out": motion.easeOut,
  "ease-in-out": motion.easeInOut,
  "ease-spring": motion.spring,
} as const;

export function buildCssVariables() {
  return `:root {${Object.entries(entries)
    .map(([key, value]) => `--${key}: ${value};`)
    .join("")}}`;
}
