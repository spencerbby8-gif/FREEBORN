import type { GenderIdentity, OnboardingStep, RelationshipIntent } from "./types";

/* ==========================================================================
   MARKETING COPY
   Copy written to feel considered, warm, and quietly confident — not salesy.
   ========================================================================== */

export const productPillars = [
  {
    title: "Profiles that reward depth",
    body: "No empty bios, no echo chambers of selfies. Freeborn profiles are built around intention, values, and the things that actually make a person worth meeting.",
  },
  {
    title: "Trust you can feel",
    body: "Photo verification, real-human moderation, and privacy defaults that protect you from the very first like. No bots. No scams. No strangers sliding into your DMs.",
  },
  {
    title: "A calmer way to meet",
    body: "We slowed the app down on purpose. One person at a time. Fewer, better matches. Conversations that actually begin instead of dying in an unread pile.",
  },
] as const;

export const previewProfiles = [
  {
    name: "Amara",
    age: 28,
    location: "Brooklyn, NY",
    job: "Architect",
    headline: "Building spaces and Sundays that feel like home.",
    prompt: "The way to win me over is…",
    answer: "Be curious about small things. Remember the coffee order. Walk the long way home.",
    traits: ["Long-term", "Creative", "Warm"],
    palette: ["#ef5e5e", "#d9a752"] as [string, string],
  },
  {
    name: "Julien",
    age: 31,
    location: "Paris 11e",
    job: "Documentary filmmaker",
    headline: "Looking for someone who still believes in handwritten letters.",
    prompt: "A perfect Sunday…",
    answer: "Markets at dawn, a long lunch, a second film, and no plans for after.",
    traits: ["Intentional", "Curious", "Monogamous"],
    palette: ["#8a6ef2", "#6dd3b0"] as [string, string],
  },
  {
    name: "Sora",
    age: 29,
    location: "Silver Lake, LA",
    job: "Founder",
    headline: "Building things that last. Looking for the same.",
    prompt: "I geek out on…",
    answer: "Natural wine, analog cameras, long road trips with no destination.",
    traits: ["Life partner", "Ambitious", "Grounded"],
    palette: ["#d9a752", "#ef5e5e"] as [string, string],
  },
] as const;

export const testimonials = [
  {
    quote:
      "I'd basically given up on apps. Freeborn felt different within ten minutes — the people, the pacing, the fact that someone actually wrote a bio.",
    name: "Amara & Julien",
    meta: "Matched in Paris · 2025",
  },
  {
    quote:
      "The first app where I didn't feel like I was shouting into a void. I went on three actual dates in my first month and met my partner on the fourth.",
    name: "Sora",
    meta: "Matched in Los Angeles · 2025",
  },
  {
    quote:
      "It's the only dating app I've kept on my phone past a week. It respects my time, and the people on it seem to respect each other.",
    name: "Elena",
    meta: "Member since 2024 · London",
  },
] as const;

export const trustStats = [
  { stat: "94%", label: "of members say they'd recommend Freeborn to a friend" },
  { stat: "87%", label: "report higher-quality connections than other apps" },
  { stat: "0", label: "unsolicited explicit messages — verified by moderation" },
  { stat: "1 in 4", label: "matches on Freeborn turn into a second date" },
] as const;

export const safetyFeatures = [
  {
    title: "Photo verification",
    body: "Every profile is cross-checked against a live selfie. Catfish don't make it past the door.",
  },
  {
    title: "Private by default",
    body: "Your last name, employer, and contacts never appear. Screenshots of profiles are gently blocked.",
  },
  {
    title: "Human moderation",
    body: "Real people review reports 24/7. Bad actors are removed — permanently — usually within an hour.",
  },
  {
    title: "Zero tolerance",
    body: "No harassment, no ghosting bots, no spam. One strike on hate or disrespect and you're out.",
  },
] as const;

export const howItWorks = [
  {
    step: "01",
    title: "Build a profile with intent",
    body: "A few thoughtful prompts. What you value. What you're looking for. It takes eight minutes and pays off in every match.",
  },
  {
    step: "02",
    title: "Meet one person at a time",
    body: "We show you one profile, fully — no stacks, no endless swiping. Decide with intention, not reflex.",
  },
  {
    step: "03",
    title: "Start a conversation that matters",
    body: "When you match, you both answer the same opening question. Awkward small-talk is engineered out.",
  },
  {
    step: "04",
    title: "Take it offline",
    body: "We suggest thoughtful first-date spots nearby. The app recedes when it's no longer needed.",
  },
] as const;

export const faqs = [
  {
    q: "Who is Freeborn for?",
    a: "People who are genuinely open to a real relationship and tired of the culture on other dating apps. If you want to chat mindlessly or rack up matches, this isn't the app for you — and that's intentional.",
  },
  {
    q: "How is Freeborn different from other dating apps?",
    a: "One match at a time. Verified photos. No pay-to-like mechanics. Profiles built around intention, not selfies. And an interface that feels calm instead of addictive.",
  },
  {
    q: "Is Freeborn free?",
    a: "Yes. The core experience — matching, messaging, meeting — is completely free. We offer an optional membership for people who want extra depth and insight, but you will never need to pay to meet someone.",
  },
  {
    q: "How do you keep people safe?",
    a: "Photo verification, human moderation, screenshot detection, strict anti-harassment policies, and privacy-first defaults. We publish a quarterly transparency report on what we catch and remove.",
  },
  {
    q: "Where is Freeborn available?",
    a: "We're live across major cities in North America and Western Europe, with new cities opening monthly. Join the waitlist to be notified when we arrive in yours.",
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

export const profilePrompts = [
  "The way to win me over is…",
  "My perfect Sunday looks like…",
  "I’m looking for someone who…",
  "A hill I will die on…",
  "My love language is…",
  "You should leave a comment if…",
  "The last great book I read…",
  "Teach me something about…",
  "I geek out on…",
  "My most controversial opinion…",
  "A life goal I’m working toward…",
  "I’m known for…",
] as const;

export const discoveryNav = [
  { id: "discover", label: "Discover", icon: "spark" },
  { id: "likes", label: "Likes", icon: "heart" },
  { id: "matches", label: "Matches", icon: "chat" },
  { id: "profile", label: "Profile", icon: "user" },
] as const;

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

export const emptyProfileDraft = {
  ...emptyOnboardingDraft,
  height_cm: null as number | null,
  prompt_answers: [] as Array<{ prompt: string; answer: string }>,
  show_gender: [] as string[],
  discoverable: true,
};
