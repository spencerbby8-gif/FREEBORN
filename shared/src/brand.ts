export const brand = {
  name: "Freeborn",
  shortName: "FREEBORN",
  tagline: "Meet with intention.",
  manifesto:
    "Freeborn is a different kind of dating app — one built for people who have outgrown the swipe. Where depth comes before volume, trust comes before first messages, and every match begins with real intention.",
  trustPillars: [
    "Intent-led profiles",
    "Verified authenticity",
    "Private by design",
  ],
} as const;

export type Brand = typeof brand;
