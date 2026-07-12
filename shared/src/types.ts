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
  | "welcome"
  | "identity"
  | "location"
  | "relationship_intent"
  | "lifestyle"
  | "values"
  | "interests"
  | "bio"
  | "photos"
  | "discovery_preferences"
  | "verification"
  | "finish"
  // Legacy step names kept so older mobile clients and existing rows continue to parse.
  | "about_you"
  | "bio_goals"
  | "interests_lifestyle"
  | "preferences_extras"
  | "complete";

export type ProfilePhoto = {
  id: string;
  user_id: string;
  storage_path: string;
  blurhash: string | null;
  width: number | null;
  height: number | null;
  position: number;
  is_primary: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
};

export type DiscoveryPreferencesRow = {
  user_id: string;
  age_min: number;
  age_max: number;
  distance_km: number;
  show_genders: string[];
  relationship_intents: string[];
  deal_breaker_strict: boolean;
  verified_only: boolean;
  photos_required: boolean;
  created_at: string;
  updated_at: string;
};

export type UserSwipeAction = "like" | "pass" | "superlike";

export type UserSwipeRow = {
  liker_id: string;
  liked_id: string;
  action: UserSwipeAction;
  note: string | null;
  created_at: string;
};

export type UserMatchRow = {
  id: string;
  user_a: string;
  user_b: string;
  initiated_by: string | null;
  status: "active" | "archived" | "blocked";
  last_message_at: string | null;
  created_at: string;
};

export type MatchMessageRow = {
  id: string;
  match_id: string;
  sender_id: string;
  body: string;
  read_at: string | null;
  created_at: string;
};

export type PromptAnswer = {
  prompt: string;
  answer: string;
};

export type NotificationPreferencesRow = {
  user_id: string;
  match_alerts: boolean;
  message_alerts: boolean;
  like_alerts: boolean;
  profile_activity: boolean;
  created_at: string;
  updated_at: string;
};

export type BlockedUserRow = {
  id: string;
  blocker_id: string;
  blocked_id: string;
  reason: string | null;
  created_at: string;
};

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
  height_cm: number | null;
  prompt_answers: PromptAnswer[];
  show_gender: string[];
  age_min_preference: number;
  age_max_preference: number;
  max_distance_km: number;
  discoverable: boolean;
  last_active_at: string;
  photo_count: number;
  verified_photo: boolean;
  auth_providers: string[];
  haptic_feedback: boolean;
  card_animations: boolean;
  notification_sounds: boolean;
};

export type DiscoveryCandidate = {
  id: string;
  display_name: string | null;
  bio: string | null;
  city: string | null;
  region: string | null;
  country_code: string | null;
  gender: string | null;
  birth_date: string | null;
  age: number | null;
  relationship_goals: string[];
  values?: string[];
  interests: string[];
  lifestyle_preferences: string[];
  prompt_answers?: PromptAnswer[];
  occupation: string | null;
  education: string | null;
  is_verified: boolean;
  photo_count: number;
  last_active_at: string | null;
  photos?: ProfilePhoto[];
};

export type ProfileWithPhotos = UserProfileRow & {
  age: number | null;
  photos: ProfilePhoto[];
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
  values: string[];
  interests: string[];
  lifestyle_preferences: string[];
  deal_breakers: string[];
  occupation: string;
  education: string;
};
