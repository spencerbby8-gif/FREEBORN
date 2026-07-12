import type { GenderIdentity, OnboardingStep, RelationshipIntent } from "./types";

/* ==========================================================================
   MARKETING COPY
   The public product should earn trust with specific, truthful language.
   Avoid unverified outcome metrics, fake press, and claims the app cannot honor.
   ========================================================================== */

export const productPillars = [
  {
    title: "Values before volume",
    body: "Freeborn is built for people who want health autonomy, natural living, faith or philosophy, family direction, and long-term intentions to have room in the dating experience — without turning a profile into a debate.",
  },
  {
    title: "Natural health belongs in compatibility",
    body: "Lifestyle, wellness rhythm, informed choice, and medical freedom can shape daily life. Freeborn gives members a respectful way to share those values early, so connection starts with context.",
  },
  {
    title: "Trust without overexposure",
    body: "Age-gated onboarding, private birth dates, editable discovery settings, visible verification status, and clear profile completeness cues help the room feel accountable while personal essentials stay private.",
  },
] as const;

export const previewProfiles = [
  {
    name: "Mara",
    age: 29,
    location: "Austin, TX",
    job: "Functional nutritionist",
    headline: "Garden mornings, honest conversation, and building a life that feels free.",
    prompt: "A value I will not compromise on…",
    answer: "Informed choice. I want a relationship where we can ask good questions, respect the body, and make health decisions without pressure.",
    traits: ["Long-term", "Natural health", "Health autonomy"],
    palette: ["#ef5e5e", "#d9a752"] as [string, string],
  },
  {
    name: "Jonah",
    age: 34,
    location: "Boise, ID",
    job: "Regenerative farmer",
    headline: "Looking for a woman who wants roots, resilience, and a real home.",
    prompt: "My perfect Sunday…",
    answer: "Sunrise coffee, farmers market, a long walk, meal prep from scratch, and phones away by dinner.",
    traits: ["Life partner", "Grounded", "Outdoorsy"],
    palette: ["#8a6ef2", "#6dd3b0"] as [string, string],
  },
  {
    name: "Elena",
    age: 31,
    location: "Franklin, TN",
    job: "Midwife",
    headline: "Soft heart, strong standards, and serious about building something lasting.",
    prompt: "I’m looking for someone who…",
    answer: "Lives with conviction, cares about natural health, and wants a peaceful home more than a performative life.",
    traits: ["Intentional", "Family-minded", "Wellness"],
    palette: ["#d9a752", "#ef5e5e"] as [string, string],
  },
] as const;

export const trustStats = [
  { stat: "18+", label: "age-gated membership before discovery opens" },
  { stat: "6", label: "profile photos maximum, keeping presentation intentional" },
  { stat: "3", label: "relationship intentions highlighted on each profile" },
  { stat: "0", label: "birth dates, emails, or account providers shown publicly" },
] as const;

export const communityPrinciples = [
  {
    title: "Honor health autonomy",
    body: "Members should be free to make informed choices about their bodies, homes, food, family, and care without coercion or ridicule. Compatibility starts with respect.",
  },
  {
    title: "Be recognizable and real",
    body: "Use recent photos, honest details, and a bio that sounds like you. A profile should feel like an invitation into your values, not a performance for strangers.",
  },
  {
    title: "Move toward commitment with care",
    body: "Pass respectfully, like intentionally, and open with something specific. Freeborn rewards attention, patience, and long-term clarity over impulse.",
  },
] as const;

export const profileProofPoints = [
  {
    title: "Values are part of the profile",
    body: "Natural health, medical freedom, lifestyle rhythm, relationship intentions, and deal breakers can be shared as compatibility signals instead of awkward first-date surprises.",
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
    title: "Health autonomy respected",
    body: "Freeborn is for people who believe medical decisions and wellness practices deserve informed consent, personal agency, and respectful conversation.",
  },
  {
    title: "Age-gated entry",
    body: "Date of birth is required to confirm 18+ eligibility, then kept private from public profiles.",
  },
  {
    title: "Private by default",
    body: "Emails, full birth dates, last names, and account provider details stay out of discovery cards and public profile surfaces.",
  },
  {
    title: "Discovery controls",
    body: "Members can tune age range, distance, shown genders, intentions, verified-only discovery, and whether they are discoverable at all.",
  },
] as const;

export const howItWorks = [
  {
    step: "01",
    title: "Build a values-aligned profile",
    body: "Share your essentials, health rhythm, lifestyle, relationship direction, interests, and a short bio. It is designed to feel human before it feels searchable.",
  },
  {
    step: "02",
    title: "Set your boundaries",
    body: "Choose who you want to see, how far discovery should reach, and whether deal breakers should be strict. Clarity is part of chemistry.",
  },
  {
    step: "03",
    title: "Read the whole person",
    body: "Profiles put location, intention, words, interests, photos, wellness cues, and verification status in one calm view so every choice has context.",
  },
  {
    step: "04",
    title: "Move toward something real",
    body: "When a like becomes mutual, the conversation begins with values already on the table — not a blank performance of small talk.",
  },
] as const;

export const faqs = [
  {
    q: "Who is Freeborn for?",
    a: "Freeborn is for values-aligned singles who care about medical freedom, natural health, informed choice, and intentional long-term relationships. It is for people who want compatibility to include how they live, heal, build family, and make decisions.",
  },
  {
    q: "Is Freeborn only for people with the exact same health views?",
    a: "No. Freeborn is not a purity test. It is a relationship platform for people who value autonomy, respectful conversation, natural living, and long-term clarity. Members can decide which values are essential for them.",
  },
  {
    q: "How is Freeborn different from other dating apps?",
    a: "Freeborn emphasizes full profiles, clear intentions, finite discovery, privacy-minded onboarding, and compatibility around values like health autonomy and natural wellness. It is built around deciding with context instead of reacting to a stack.",
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
  "Natural health",
  "Medical freedom",
  "Holistic wellness",
  "Herbal remedies",
  "Homesteading",
  "Regenerative farming",
  "Farmers markets",
  "Traditional food",
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
  "Natural health",
  "Holistic living",
  "Medical freedom",
  "Health autonomy",
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
  "Health autonomy",
  "Natural living",
  "Low-tox home",
  "Organic food",
  "Homeschool curious",
  "Family-minded",
  "Faith-friendly",
  "Early bird",
  "Night owl",
  "Homebody",
  "Social butterfly",
  "Adventurous",
  "Routine-oriented",
  "Spontaneous",
  "Planner",
  "Fitness-focused",
  "Ingredient-conscious",
  "Low-tox living",
  "Homesteading",
  "Regenerative food",
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
  "Natural wellness",
  "Informed health choices",
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

export const valueOptions = [
  "Medical freedom",
  "Health autonomy",
  "Informed consent",
  "Natural health",
  "Holistic wellness",
  "Herbal remedies",
  "Traditional food",
  "Low-tox living",
  "Family values",
  "Faith",
  "Personal sovereignty",
  "Self-reliance",
  "Community",
  "Environmental stewardship",
  "Regenerative agriculture",
  "Homeschooling",
  "Home birth",
  "Breastfeeding advocacy",
  "Nutritional freedom",
  "Body autonomy",
] as const;

export const dealBreakerOptions = [
  "Health coercion",
  "Disrespect for medical freedom",
  "Mocking natural health",
  "No long-term intention",
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
  "Medical pressure",
  "Dismisses natural health",
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
    description: "The private essentials that help Freeborn introduce you safely.",
  },
  {
    step: "about_you",
    label: "About you",
    description: "Where you are and how you describe yourself.",
  },
  {
    step: "bio_goals",
    label: "Bio & goals",
    description: "Your voice, values, and relationship direction.",
  },
  {
    step: "interests_lifestyle",
    label: "Interests",
    description: "What lights you up, including wellness and daily rhythm.",
  },
  {
    step: "preferences_extras",
    label: "Boundaries",
    description: "The finer details and non-negotiables that keep discovery honest.",
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
  "A wellness rhythm that matters to me…",
  "A value I won’t compromise on…",
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
