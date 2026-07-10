export type AuthScreenMode =
  | "sign-in"
  | "sign-up"
  | "reset-password"
  | "update-password";

export type DiscoveryStage = "account_created" | "profile_setup" | "ready";

export type RelationshipIntent =
  | "long_term"
  | "life_partner"
  | "meaningful_connection"
  | "still_exploring";

export type GenderIdentity =
  | "woman"
  | "man"
  | "non_binary"
  | "genderqueer"
  | "genderfluid"
  | "agender"
  | "two_spirit"
  | "prefer_to_self_describe"
  | "prefer_not_to_say";

export type OnboardingStep =
  | "identity"
  | "about_you"
  | "bio_goals"
  | "interests_lifestyle"
  | "preferences_extras"
  | "complete";

export type UserProfileRow = {
  id: string;
  email: string;
  handle: string | null;
  onboarding_stage: DiscoveryStage;
  profile_status: string;
  first_name: string | null;
  last_name: string | null;
  birth_date: string | null;
  city: string | null;
  region: string | null;
  country_code: string | null;
  relationship_goal: string | null;
  relationship_goals: string[];
  values: string[];
  bio: string | null;
  display_name: string | null;
  gender: string | null;
  interests: string[];
  lifestyle_preferences: string[];
  deal_breakers: string[];
  occupation: string | null;
  education: string | null;
  onboarding_step: OnboardingStep;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  onboarding_completed_at: string | null;
};

export type OnboardingDraft = {
  display_name: string;
  birth_date: string;
  gender: string;
  city: string;
  region: string;
  country_code: string;
  bio: string;
  relationship_goals: string[];
  interests: string[];
  lifestyle_preferences: string[];
  deal_breakers: string[];
  occupation: string;
  education: string;
};
