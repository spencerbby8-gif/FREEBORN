import { z } from "zod";

const emailSchema = z
  .email("Enter a valid email address.")
  .trim()
  .transform((value) => value.toLowerCase());

const passwordSchema = z
  .string()
  .min(8, "Use at least 8 characters.")
  .regex(/[A-Z]/, "Add at least one uppercase letter.")
  .regex(/[a-z]/, "Add at least one lowercase letter.")
  .regex(/[0-9]/, "Add at least one number.");

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password."),
});

export const signUpSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm your password."),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const passwordResetRequestSchema = z.object({
  email: emailSchema,
});

export const passwordUpdateSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm your new password."),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type SignInInput = z.input<typeof signInSchema>;
export type SignInPayload = z.output<typeof signInSchema>;
export type SignUpInput = z.input<typeof signUpSchema>;
export type SignUpPayload = z.output<typeof signUpSchema>;
export type PasswordResetRequestInput = z.input<typeof passwordResetRequestSchema>;
export type PasswordResetRequestPayload = z.output<typeof passwordResetRequestSchema>;
export type PasswordUpdateInput = z.input<typeof passwordUpdateSchema>;
export type PasswordUpdatePayload = z.output<typeof passwordUpdateSchema>;

const eighteenYearsAgo = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 18);
  date.setHours(0, 0, 0, 0);
  return date;
};

const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

export const onboardingDisplayNameSchema = z
  .string()
  .trim()
  .min(2, "Use at least 2 characters.")
  .max(40, "Keep your display name under 40 characters.")
  .regex(/^[\p{L}\p{N} _'.-]+$/u, "Use letters, numbers, and basic punctuation only.");

export const onboardingBirthDateSchema = z
  .string()
  .trim()
  .regex(isoDatePattern, "Use a YYYY-MM-DD date.")
  .refine((value) => !Number.isNaN(new Date(value).getTime()), {
    message: "Enter a real calendar date.",
  })
  .refine(
    (value) => {
      const parsed = new Date(value);
      parsed.setHours(0, 0, 0, 0);
      return parsed.getTime() <= eighteenYearsAgo().getTime();
    },
    { message: "You must be at least 18 years old to use Freeborn." },
  );

export const onboardingGenderSchema = z.enum([
  "woman",
  "man",
  "non_binary",
  "genderqueer",
  "genderfluid",
  "agender",
  "two_spirit",
  "prefer_to_self_describe",
  "prefer_not_to_say",
]);

export const onboardingCitySchema = z
  .string()
  .trim()
  .min(1, "Please share the city you live in.")
  .max(80, "Keep your city name under 80 characters.");

export const onboardingRegionSchema = z
  .string()
  .trim()
  .max(80, "Keep this under 80 characters.")
  .optional()
  .default("");

export const onboardingCountryCodeSchema = z
  .string()
  .trim()
  .transform((value) => value.toUpperCase())
  .refine(
    (value) => value === "" || /^[A-Za-z]{2}$/.test(value),
    "Use a two-letter country code like US, CA, GB, or AU.",
  )
  .optional()
  .default("");

export const onboardingBioSchema = z
  .string()
  .trim()
  .min(20, "A good bio is at least 20 characters.")
  .max(500, "Keep your bio under 500 characters.");

export const onboardingRelationshipGoalsSchema = z
  .array(
    z.enum(["long_term", "life_partner", "meaningful_connection", "still_exploring"]),
  )
  .min(1, "Pick at least one relationship goal.")
  .max(3, "Choose up to three goals.");

export const onboardingInterestsSchema = z
  .array(z.string().trim().min(1))
  .min(1, "Share at least one interest.")
  .max(12, "Pick up to 12 interests.");

export const onboardingLifestyleSchema = z
  .array(z.string().trim().min(1))
  .min(1, "Share at least one lifestyle preference.")
  .max(12, "Pick up to 12 preferences.");

export const onboardingDealBreakersSchema = z
  .array(z.string().trim().min(1))
  .max(12, "Pick up to 12 deal breakers.");

export const onboardingOccupationSchema = z
  .string()
  .trim()
  .max(120, "Keep this under 120 characters.")
  .optional()
  .default("");

export const onboardingEducationSchema = z
  .string()
  .trim()
  .max(120, "Keep this under 120 characters.")
  .optional()
  .default("");

export const onboardingIdentitySchema = z.object({
  display_name: onboardingDisplayNameSchema,
  birth_date: onboardingBirthDateSchema,
});

export const onboardingAboutYouSchema = z.object({
  gender: onboardingGenderSchema,
  city: onboardingCitySchema,
  region: onboardingRegionSchema,
  country_code: onboardingCountryCodeSchema,
});

export const onboardingBioGoalsSchema = z.object({
  bio: onboardingBioSchema,
  relationship_goals: onboardingRelationshipGoalsSchema,
});

export const onboardingInterestsLifestyleSchema = z.object({
  interests: onboardingInterestsSchema,
  lifestyle_preferences: onboardingLifestyleSchema,
});

export const onboardingPreferencesExtrasSchema = z.object({
  deal_breakers: onboardingDealBreakersSchema,
  occupation: onboardingOccupationSchema,
  education: onboardingEducationSchema,
});

export const onboardingProfileSchema = z.object({
  display_name: onboardingDisplayNameSchema,
  birth_date: onboardingBirthDateSchema,
  gender: onboardingGenderSchema,
  city: onboardingCitySchema,
  region: onboardingRegionSchema,
  country_code: onboardingCountryCodeSchema,
  bio: onboardingBioSchema,
  relationship_goals: onboardingRelationshipGoalsSchema,
  interests: onboardingInterestsSchema,
  lifestyle_preferences: onboardingLifestyleSchema,
  deal_breakers: onboardingDealBreakersSchema,
  occupation: onboardingOccupationSchema,
  education: onboardingEducationSchema,
});

export type OnboardingIdentityInput = z.input<typeof onboardingIdentitySchema>;
export type OnboardingAboutYouInput = z.input<typeof onboardingAboutYouSchema>;
export type OnboardingBioGoalsInput = z.input<typeof onboardingBioGoalsSchema>;
export type OnboardingInterestsLifestyleInput = z.input<typeof onboardingInterestsLifestyleSchema>;
export type OnboardingPreferencesExtrasInput = z.input<typeof onboardingPreferencesExtrasSchema>;
export type OnboardingProfileInput = z.input<typeof onboardingProfileSchema>;
export type OnboardingProfilePayload = z.output<typeof onboardingProfileSchema>;

// Phase 3: Discovery, profile editing, prompts
export const profileHeightSchema = z
  .number()
  .int()
  .min(120, "Height must be at least 120 cm.")
  .max(230, "Height must be under 230 cm.")
  .nullable()
  .optional();

export const promptAnswerSchema = z.object({
  prompt: z.string().trim().min(3).max(120),
  answer: z.string().trim().min(8, "Answer with at least 8 characters.").max(280, "Keep answers under 280 characters."),
});

export const profilePromptsSchema = z.array(promptAnswerSchema).max(3);

export const discoveryPreferencesSchema = z.object({
  age_min: z.number().int().min(18).max(80),
  age_max: z.number().int().min(18).max(99),
  distance_km: z.number().int().min(5).max(500),
  show_genders: z.array(onboardingGenderSchema).min(1, "Select at least one."),
  relationship_intents: onboardingRelationshipGoalsSchema,
  verified_only: z.boolean().default(false),
  photos_required: z.boolean().default(true),
  deal_breaker_strict: z.boolean().default(true),
}).refine((v) => v.age_max >= v.age_min, {
  message: "Maximum age must be at least minimum age.",
  path: ["age_max"],
});

export const profileEditSchema = onboardingProfileSchema.extend({
  height_cm: profileHeightSchema,
  prompt_answers: profilePromptsSchema.optional().default([]),
  show_gender: z.array(onboardingGenderSchema).optional().default([]),
  discoverable: z.boolean().default(true),
});

export const swipeActionSchema = z.object({
  liked_id: z.string().uuid(),
  action: z.enum(["like", "pass", "superlike"]),
  note: z.string().trim().max(180).optional(),
});

export const messageSendSchema = z.object({
  match_id: z.string().uuid(),
  body: z.string().trim().min(1, "Say something kind to start.").max(2000, "Keep it under 2000 characters."),
});

export type ProfileEditInput = z.input<typeof profileEditSchema>;
export type ProfileEditPayload = z.output<typeof profileEditSchema>;
export type DiscoveryPreferencesInput = z.input<typeof discoveryPreferencesSchema>;
export type DiscoveryPreferencesPayload = z.output<typeof discoveryPreferencesSchema>;
export type SwipeActionInput = z.input<typeof swipeActionSchema>;
export type SwipeActionPayload = z.output<typeof swipeActionSchema>;
export type MessageSendInput = z.input<typeof messageSendSchema>;
export type MessageSendPayload = z.output<typeof messageSendSchema>;
