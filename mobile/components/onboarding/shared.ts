import type { OnboardingStep, OnboardingDraft } from "@freeborn/shared";

export const STEP_TITLES: Record<OnboardingStep, string> = {
  welcome: "Welcome to Freeborn",
  identity: "Start with who you are",
  location: "Where are you based?",
  intent: "What are you looking for?",
  relationship_intent: "What are you looking for?",
  lifestyle: "How do you live day to day?",
  values: "What matters most to you?",
  interests: "What are you into?",
  bio: "Tell people about yourself",
  photos: "Add your photos",
  discovery_preferences: "Set your boundaries",
  verification: "Trust & verification",
  finish: "You're all set",
  about_you: "",
  bio_goals: "",
  interests_lifestyle: "",
  preferences_extras: "",
  complete: "",
};

export const STEP_SUBTITLES: Record<OnboardingStep, string> = {
  welcome: "A calm, private place to build a profile that reflects who you really are.",
  identity: "Your name, age, and gender. Private essentials stay hidden.",
  location: "Your city is public. Exact coordinates never are.",
  intent: "Pick up to 3 relationship intentions.",
  relationship_intent: "Pick up to 3 relationship intentions.",
  lifestyle: "Choose up to 12 lifestyle cues that shape your daily rhythm.",
  values: "Choose up to 8 values that guide your decisions.",
  interests: "Pick up to 12 interests that spark conversation.",
  bio: "Write a short intro. Safety checks block contact details.",
  photos: "Upload, crop, and reorder your photos.",
  discovery_preferences: "Tune who appears in your feed.",
  verification: "Verification helps people trust your profile.",
  finish: "Review and enter the room.",
  about_you: "",
  bio_goals: "",
  interests_lifestyle: "",
  preferences_extras: "",
  complete: "",
};

export type StepProps = {
  draft: OnboardingDraft;
  errors: Record<string, string>;
  onUpdate: <K extends keyof OnboardingDraft>(key: K, value: OnboardingDraft[K]) => void;
};

export function toNullable(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function mapFieldErrors(issues: Array<{ path: PropertyKey[]; message: string }>) {
  const errors: Record<string, string> = {};
  for (const issue of issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !(key in errors)) errors[key] = issue.message;
  }
  return errors;
}
