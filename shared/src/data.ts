import type { GenderIdentity, OnboardingStep, RelationshipIntent } from "./types";

export const productPillars = [
  {
    title: "Intent-led discovery",
    body: "Profiles are shaped around values, relationship goals, and emotional clarity before endless swiping ever begins.",
  },
  {
    title: "Trust in every interaction",
    body: "Verification, respectful defaults, and privacy-aware controls are part of the product foundation, not an afterthought.",
  },
  {
    title: "Premium by feel",
    body: "Subtle motion, balanced spacing, and deeply considered UI details create a dating experience people want to stay in.",
  },
] as const;

export const previewProfiles = [
  {
    name: "Maya",
    age: 29,
    location: "SoHo, New York",
    headline: "Creative director who values emotional fluency and unhurried chemistry.",
    traits: ["Intentional", "Well-traveled", "Monogamous"],
    gradient: ["#ff8578", "#f1c97a"],
  },
  {
    name: "Noah",
    age: 31,
    location: "Mission District, San Francisco",
    headline: "Product strategist looking for depth, warmth, and a shared sense of direction.",
    traits: ["Grounded", "Curious", "Long-term"],
    gradient: ["#8ccfff", "#bcadff"],
  },
] as const;

export const genderOptions: Array<{ value: GenderIdentity; label: string }> = [
  { value: "woman", label: "Woman" },
  { value: "man", label: "Man" },
  { value: "non_binary", label: "Non-binary" },
  { value: "genderqueer", label: "Genderqueer" },
  { value: "genderfluid", label: "Genderfluid" },
  { value: "agender", label: "Agender" },
  { value: "two_spirit", label: "Two-Spirit" },
  { value: "prefer_to_self_describe", label: "Prefer to self-describe" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

export const relationshipGoalOptions: Array<{
  value: RelationshipIntent;
  label: string;
  caption: string;
}> = [
  {
    value: "long_term",
    label: "Long-term relationship",
    caption: "Building something serious and lasting.",
  },
  {
    value: "life_partner",
    label: "Life partner",
    caption: "Ready to share a full life together.",
  },
  {
    value: "meaningful_connection",
    label: "Meaningful connection",
    caption: "Open to wherever depth leads.",
  },
  {
    value: "still_exploring",
    label: "Still exploring",
    caption: "Taking my time with clarity.",
  },
];

export const interestOptions = [
  "Travel",
  "Cooking",
  "Hiking",
  "Reading",
  "Photography",
  "Music",
  "Art",
  "Yoga",
  "Dancing",
  "Running",
  "Cycling",
  "Surfing",
  "Skiing",
  "Gaming",
  "Film",
  "Theater",
  "Writing",
  "Podcasts",
  "Volunteering",
  "Gardening",
  "Dogs",
  "Cats",
  "Coffee",
  "Wine",
  "Cocktails",
  "Baking",
  "Pottery",
  "Design",
  "Fashion",
  "Wellness",
  "Meditation",
  "Journaling",
  "Astrology",
  "Museums",
  "Concerts",
  "Festivals",
  "Trivia",
  "Board games",
  "Tennis",
  "Swimming",
  "Rock climbing",
] as const;

export const lifestyleOptions = [
  "Early bird",
  "Night owl",
  "Homebody",
  "Social butterfly",
  "Adventurous",
  "Routine-oriented",
  "Spontaneous",
  "Planner",
  "Fitness-focused",
  "Outdoorsy",
  "City lover",
  "Vegetarian",
  "Vegan",
  "Flexitarian",
  "Coffee snob",
  "Tea drinker",
  "Craft beer",
  "Wine lover",
  "Sober curious",
  "Non-drinker",
  "Non-smoker",
  "Spiritual",
  "Religious",
  "Secular",
  "Dog person",
  "Cat person",
  "Plant parent",
  "Minimalist",
  "Maximalist",
  "Digital nomad",
  "Career-focused",
  "Side projects",
] as const;

export const dealBreakerOptions = [
  "Smoking",
  "Dishonesty",
  "Poor communication",
  "Different life goals",
  "Long distance",
  "No ambition",
  "Drama",
  "Jealousy",
  "Controlling behavior",
  "Financial irresponsibility",
  "Different values",
  "No sense of humor",
  "Passive aggression",
  "Disrespectful",
  "Unreliable",
  "Non-monogamous",
  "Wants kids",
  "Doesn't want kids",
  "Messy",
  "Workaholic",
] as const;

export const onboardingStepMeta: Array<{
  step: OnboardingStep;
  label: string;
  description: string;
}> = [
  {
    step: "identity",
    label: "Identity",
    description: "The essentials that shape how people meet you.",
  },
  {
    step: "about_you",
    label: "About you",
    description: "Where you are and how you describe yourself.",
  },
  {
    step: "bio_goals",
    label: "Bio & goals",
    description: "Your voice and what you're looking for.",
  },
  {
    step: "interests_lifestyle",
    label: "Interests",
    description: "What lights you up and how you spend your time.",
  },
  {
    step: "preferences_extras",
    label: "Preferences",
    description: "The finer details and optional extras.",
  },
];

export const onboardingStepOrder: OnboardingStep[] = [
  "identity",
  "about_you",
  "bio_goals",
  "interests_lifestyle",
  "preferences_extras",
];

export const emptyOnboardingDraft = {
  display_name: "",
  birth_date: "",
  gender: "",
  city: "",
  region: "",
  country_code: "",
  bio: "",
  relationship_goals: [] as string[],
  interests: [] as string[],
  lifestyle_preferences: [] as string[],
  deal_breakers: [] as string[],
  occupation: "",
  education: "",
};
