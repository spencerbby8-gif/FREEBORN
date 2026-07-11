export const brand = {
  name: "Freeborn",
  shortName: "FREEBORN",
  tagline: "Date like you mean it.",
  manifesto:
    "Freeborn is a calmer place to meet: full profiles, clear intentions, visible trust signals, and enough room for people to sound like themselves. Built for daters who would rather be remembered by one right person than skimmed by a hundred strangers.",
  trustPillars: [
    "Profiles with intent",
    "Visible trust signals",
    "Private essentials",
  ],
} as const;

export type Brand = typeof brand;
