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
  .length(2, "Use the two-letter country code.")
  .regex(/^[A-Za-z]{2}$/, "Use letters only.")
  .transform((value) => value.toUpperCase())
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
