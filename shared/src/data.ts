import type { GenderIdentity, OnboardingStep, RelationshipIntent } from "./types";

/* ==========================================================================
   MARKETING COPY
   The public product should earn trust with specific, truthful language.
   Avoid unverified outcome metrics, fake press, and claims the app cannot honor.
   ========================================================================== */

export const productPillars = [
  {
    title: "Profiles with a point of view",
    body: "Freeborn asks for values, rhythm, interests, and a few considered words before anyone becomes another face in a feed. The goal is recognition, not volume.",
  },
  {
    title: "Trust signals people can understand",
    body: "Age-gated onboarding, visible verification status, private birth dates, member-controlled discovery, and clear profile completeness cues make the experience feel accountable.",
  },
  {
    title: "A slower rhythm by design",
    body: "Discovery is intentionally finite. See the whole person, make a considered choice, and move toward a conversation instead of disappearing into an endless stack.",
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

export const trustStats = [
  { stat: "18+", label: "age-gated membership before discovery opens" },
  { stat: "6", label: "profile photos maximum, keeping presentation intentional" },
  { stat: "3", label: "relationship intentions highlighted on each profile" },
  { stat: "0", label: "birth dates, emails, and last names shown publicly" },
] as const;

export const communityPrinciples = [
  {
    title: "Be recognizable",
    body: "Use recent photos, honest details, and a bio that sounds like you. A profile should feel like an invitation, not a performance.",
  },
  {
    title: "Move with care",
    body: "Pass respectfully, like intentionally, and open with something specific. Freeborn rewards attention over impulse.",
  },
  {
    title: "Protect the room",
    body: "Harassment, hate, impersonation, spam, and pressure do not belong here. Reports are treated as product-critical work, not admin noise.",
  },
] as const;

export const profileProofPoints = [
  {
    title: "Composite profile previews",
    body: "The people shown in marketing are illustrative composites, not fake member claims. In the app, profiles come from real member data.",
  },
  {
    title: "No invented success numbers",
    body: "Freeborn does not claim match rates, second-date rates, or press logos it cannot prove inside the current product.",
  },
  {
    title: "Clear control surfaces",
    body: "Members can edit profile details, photos, preferences, discoverability, and account session state from inside the product.",
  },
] as const;

export const safetyFeatures = [
  {
    title: "Age-gated entry",
    body: "Date of birth is required to confirm 18+ eligibility, then kept private from public profiles.",
  },
  {
    title: "Verification is visible",
    body: "Profiles only show a verification badge when the account has earned that status. No badge is implied by default.",
  },
  {
    title: "Private by default",
    body: "Emails, birth dates, last names, and account provider details stay out of discovery cards and public profile surfaces.",
  },
  {
    title: "Discovery controls",
    body: "Members can tune age range, distance, shown genders, intentions, verified-only discovery, and whether they are discoverable at all.",
  },
] as const;

export const howItWorks = [
  {
    step: "01",
    title: "Build a profile with intent",
    body: "Share your essentials, relationship direction, interests, lifestyle, and a short bio. It is designed to feel human before it feels searchable.",
  },
  {
    step: "02",
    title: "Set your boundaries",
    body: "Choose who you want to see, how far discovery should reach, and whether deal breakers should be strict. Clarity is part of chemistry.",
  },
  {
    step: "03",
    title: "Read the whole person",
    body: "Profiles put location, intention, words, interests, photos, and verification status in one calm view so every choice has context.",
  },
  {
    step: "04",
    title: "Start from something real",
    body: "When a like becomes mutual, the conversation begins with the details already shared — not a blank performance of small talk.",
  },
] as const;

export const faqs = [
  {
    q: "Who is Freeborn for?",
    a: "People who want dating to feel more deliberate, respectful, and emotionally honest. If you are looking for infinite swiping or disposable conversations, Freeborn will feel intentionally different.",
  },
  {
    q: "How is Freeborn different from other dating apps?",
    a: "Freeborn emphasizes full profiles, clear intentions, finite discovery, privacy-minded onboarding, and visible trust signals. It is built around deciding with context instead of reacting to a stack.",
  },
  {
    q: "Is Freeborn free?",
    a: "The current product lets members create a profile, discover people, like, match, and message without advertising a paid plan or invented upgrade promise.",
  },
  {
    q: "What information is public?",
    a: "Discovery surfaces profile details such as display name, age, city, region, occupation, bio, intentions, interests, lifestyle, photos, and verification status. Email, full birth date, and account provider details are not shown publicly.",
  },
  {
    q: "How do you build trust without overpromising?",
    a: "By showing what the product actually supports today: age-gated onboarding, editable privacy controls, discoverability settings, verification status, profile completeness cues, and clear member standards.",
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
