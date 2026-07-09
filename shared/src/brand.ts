export const brand = {
  name: "Freeborn",
  shortName: "FREEBORN",
  tagline: "Thoughtful connection starts with intention.",
  manifesto:
    "A premium dating experience designed for people who want depth, clarity, and trust from the very first interaction.",
  trustPillars: [
    "Intent-led profiles",
    "Verification-minded safety",
    "Private, respectful conversations",
  ],
} as const;

export type Brand = typeof brand;
