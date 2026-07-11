export const authModes = {
  signIn: {
    title: "Welcome back",
    eyebrow: "Secure sign-in",
    description:
      "Sign in to continue your values-aligned Freeborn experience with privacy, care, and long-term intention.",
    submitLabel: "Sign in",
  },
  signUp: {
    title: "Create your Freeborn account",
    eyebrow: "Private by default",
    description:
      "Start with email, confirm ownership, and enter a relationship platform built for health autonomy, natural living, and thoughtful trust.",
    submitLabel: "Create account",
  },
  reset: {
    title: "Reset your password",
    eyebrow: "Account recovery",
    description:
      "We'll send a secure recovery link so you can choose a new password without friction.",
    submitLabel: "Send reset link",
  },
  updatePassword: {
    title: "Choose a new password",
    eyebrow: "Recovery confirmed",
    description:
      "Set a strong password to finish restoring access to your Freeborn account.",
    submitLabel: "Update password",
  },
} as const;

export const authTrustPoints = [
  "Values-aligned relationship profiles",
  "Private birth date and account details",
  "Health autonomy respected in community standards",
  "Editable profile and discovery controls",
] as const;

export const onboardingIntro = {
  eyebrow: "Your profile",
  title: "Build the profile people will actually remember.",
  description:
    "Take a few minutes to share who you are, what you value, and the kind of long-term connection you want. Every field is saved automatically, and you can always edit later.",
} as const;

export const onboardingComplete = {
  eyebrow: "Profile ready",
  title: "Your Freeborn profile is live.",
  description:
    "You're set up with a thoughtful foundation. Add photos, refine values, and keep your profile current from settings.",
} as const;

export const onboardingFieldHints = {
  display_name:
    "This is how you'll appear to others. Use your real name, a nickname, or a handle you like.",
  birth_date: "We use this to confirm you're 18 or older. It's never shown publicly.",
  gender: "Choose the option that feels most like you. This shapes who sees your profile.",
  city: "Share the city you live in so matches feel close enough to be real.",
  region: "Optional. A state, province, or region helps narrow discovery.",
  country_code: "Optional. Two-letter country code, like US, CA, GB, or AU.",
  bio:
    "A short, honest introduction. Mention the values, health rhythm, family direction, or everyday joys that matter to you.",
  relationship_goals:
    "Pick up to three. This shapes the kind of long-term connections Freeborn encourages for you.",
  interests:
    "Choose the things you genuinely enjoy, including natural health or wellness practices if they matter to you.",
  lifestyle_preferences:
    "How do you spend your time? These help surface people who fit your rhythm and standards.",
  deal_breakers:
    "Optional. The things that would make a match feel off, including pressure around health or values. Keeps discovery honest.",
  occupation: "Optional. Share what you do, or keep it private for now.",
  education: "Optional. A school, field of study, or the last place you learned something meaningful.",
} as const;
