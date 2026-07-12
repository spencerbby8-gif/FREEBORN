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

export type SafetyIssueType =
  | "email"
  | "phone"
  | "url"
  | "social_handle"
  | "address"
  | "qr_code"
  | "coordinates"
  | "contact_request";

export type SafetyIssue = {
  type: SafetyIssueType;
  match: string;
};

const safetyPatterns: Array<{ type: SafetyIssueType; regex: RegExp }> = [
  { type: "email", regex: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi },
  { type: "url", regex: /\b(?:https?:\/\/|www\.|[a-z0-9-]+\.(?:com|net|org|io|co|me|app|social|dating|link|bio)\b)\S*/gi },
  { type: "phone", regex: /(?:\+?\d[\s().-]*){7,}\d/g },
  {
    type: "social_handle",
    regex:
      /(?:^|[\s(])(?:@[a-z0-9_.]{3,}|(?:ig|instagram|telegram|signal|whatsapp|snap|snapchat|tiktok|twitter|x|facebook|fb|kik)\s*[:@]\s*[a-z0-9_.-]{2,})\b/gi,
  },
  {
    type: "address",
    regex:
      /\b\d{1,6}\s+[\p{L}0-9.' -]{2,}\s+(?:street|st\.?|avenue|ave\.?|road|rd\.?|drive|dr\.?|lane|ln\.?|court|ct\.?|boulevard|blvd\.?|way|place|pl\.?|trail|trl\.?|circle|cir\.?)\b/giu,
  },
  { type: "qr_code", regex: /\b(?:qr\s*code|snapcode|scan\s+(?:my|the)\s+code|scan\s+me)\b/gi },
  { type: "coordinates", regex: /\b-?\d{1,2}\.\d{4,}\s*,\s*-?\d{1,3}\.\d{4,}\b/g },
  {
    type: "contact_request",
    regex:
      /\b(?:text\s+me|call\s+me|email\s+me|dm\s+me|message\s+me\s+on|find\s+me\s+on|add\s+me\s+on)\b/gi,
  },
];

const safetyGuidance: Record<SafetyIssueType, { label: string; why: string; rewrite: string }> = {
  email: {
    label: "Email address",
    why: "Email addresses move a conversation outside Freeborn before basic trust is established.",
    rewrite: "Say what kind of conversation you enjoy instead, like “I appreciate thoughtful questions and clear plans.”",
  },
  phone: {
    label: "Phone number",
    why: "Phone numbers are private contact details and can expose you to unwanted contact.",
    rewrite: "Replace it with a preference, like “I like moving to a call after we’ve built some trust here.”",
  },
  url: {
    label: "URL or link",
    why: "Links can reveal contact details, tracking pages, or off-platform profiles.",
    rewrite: "Describe the interest without the link, like “I write about herbalism and regenerative food.”",
  },
  social_handle: {
    label: "Social handle",
    why: "Social handles bypass Freeborn’s safety boundaries and can expose your private identity.",
    rewrite: "Share the context instead, like “I enjoy photography and slow weekend hikes.”",
  },
  address: {
    label: "Street address",
    why: "Street addresses are exact location details and should never appear on a public dating profile.",
    rewrite: "Use a broad place instead, like your city, neighborhood vibe, or favorite kind of local outing.",
  },
  qr_code: {
    label: "QR-style contact sharing",
    why: "QR and scan-me language usually sends people directly to private contact channels.",
    rewrite: "Invite conversation inside Freeborn, like “Ask me about my garden or favorite farmers market.”",
  },
  coordinates: {
    label: "Exact coordinates",
    why: "Exact latitude and longitude can expose where you live, work, or spend time.",
    rewrite: "Keep location broad: city and optional region are enough for public discovery.",
  },
  contact_request: {
    label: "Off-platform contact request",
    why: "Requests to text, call, DM, or find you elsewhere pressure people out of Freeborn too early.",
    rewrite: "Set a boundary instead, like “I prefer a few thoughtful messages before exchanging contact info.”",
  },
};

export const privateContactDetailMessage =
  "For your privacy, Freeborn keeps direct contact details out of profile text. Remove the private detail and describe the story, value, or preference instead.";

export function getUnsafeContactDetailGuidance(issue: SafetyIssue) {
  return safetyGuidance[issue.type];
}

export function explainUnsafeContactDetails(issues: SafetyIssue[]) {
  const labels = [...new Set(issues.map((issue) => safetyGuidance[issue.type].label.toLowerCase()))];
  if (!labels.length) return privateContactDetailMessage;
  return `We found ${labels.join(", ")}. ${privateContactDetailMessage}`;
}

export function detectUnsafeContactDetails(value: string | null | undefined): SafetyIssue[] {
  if (!value) return [];
  const issues: SafetyIssue[] = [];
  for (const pattern of safetyPatterns) {
    pattern.regex.lastIndex = 0;
    const matches = value.match(pattern.regex) ?? [];
    for (const match of matches) {
      issues.push({ type: pattern.type, match: match.trim() });
    }
  }
  return issues;
}

export function hasUnsafeContactDetails(value: string | null | undefined) {
  return detectUnsafeContactDetails(value).length > 0;
}

export function redactUnsafeContactDetails(value: string): string {
  let next = value;
  for (const pattern of safetyPatterns) {
    pattern.regex.lastIndex = 0;
    next = next.replace(pattern.regex, "[private detail removed]");
  }
  return next.replace(/\s{2,}/g, " ").trim();
}

function safeTextRefinement(value: string, ctx: z.RefinementCtx) {
  const issues = detectUnsafeContactDetails(value);
  if (issues.length) {
    ctx.addIssue({ code: "custom", message: explainUnsafeContactDetails(issues) });
  }
}

const optionalSafeText = (max: number, message: string) =>
  z
    .string()
    .trim()
    .max(max, message)
    .superRefine(safeTextRefinement)
    .optional()
    .default("");

export const onboardingDisplayNameSchema = z
  .string()
  .trim()
  .min(2, "Use at least 2 characters.")
  .max(40, "Keep your display name under 40 characters.")
  .regex(/^[\p{L}\p{N} _'.-]+$/u, "Use letters, numbers, and basic punctuation only.")
  .superRefine(safeTextRefinement);

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
  .max(80, "Keep your city name under 80 characters.")
  .superRefine(safeTextRefinement);

export const onboardingRegionSchema = optionalSafeText(80, "Keep this under 80 characters.");

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
  .max(500, "Keep your bio under 500 characters.")
  .superRefine(safeTextRefinement);

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

export const onboardingValuesSchema = z
  .array(z.string().trim().min(1))
  .min(1, "Choose at least one value.")
  .max(8, "Choose up to eight values.");

export const onboardingDealBreakersSchema = z
  .array(z.string().trim().min(1))
  .max(12, "Pick up to 12 deal breakers.");

export const onboardingOccupationSchema = optionalSafeText(120, "Keep this under 120 characters.");

export const onboardingEducationSchema = optionalSafeText(120, "Keep this under 120 characters.");

export const onboardingIdentitySchema = z.object({
  display_name: onboardingDisplayNameSchema,
  birth_date: onboardingBirthDateSchema,
});

export const onboardingPremiumIdentitySchema = z.object({
  display_name: onboardingDisplayNameSchema,
  birth_date: onboardingBirthDateSchema,
  gender: onboardingGenderSchema,
});

export const onboardingAboutYouSchema = z.object({
  gender: onboardingGenderSchema,
  city: onboardingCitySchema,
  region: onboardingRegionSchema,
  country_code: onboardingCountryCodeSchema,
});

export const onboardingLocationSchema = z.object({
  city: onboardingCitySchema,
  region: onboardingRegionSchema,
  country_code: onboardingCountryCodeSchema,
  location_source: z.enum(["manual", "gps"]).default("manual"),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  accuracy_m: z.number().min(0).max(100000).nullable().optional(),
}).superRefine((value, ctx) => {
  if (value.location_source === "gps" && (value.latitude == null || value.longitude == null)) {
    ctx.addIssue({ code: "custom", path: ["location_source"], message: "Allow location access or switch to manual city entry." });
  }
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
  values: z.array(z.string().trim().min(1)).max(8, "Choose up to eight values.").optional().default([]),
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
  prompt: z.string().trim().min(3).max(120).superRefine(safeTextRefinement),
  answer: z.string().trim().min(8, "Answer with at least 8 characters.").max(280, "Keep answers under 280 characters.").superRefine(safeTextRefinement),
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
  note: z.string().trim().max(180).superRefine(safeTextRefinement).optional(),
});

export const messageSendSchema = z.object({
  match_id: z.string().uuid(),
  body: z.string().trim().min(1, "Say something kind to start.").max(2000, "Keep it under 2000 characters.").superRefine(safeTextRefinement),
});

export type ProfileEditInput = z.input<typeof profileEditSchema>;
export type ProfileEditPayload = z.output<typeof profileEditSchema>;
export type DiscoveryPreferencesInput = z.input<typeof discoveryPreferencesSchema>;
export type DiscoveryPreferencesPayload = z.output<typeof discoveryPreferencesSchema>;
export type SwipeActionInput = z.input<typeof swipeActionSchema>;
export type SwipeActionPayload = z.output<typeof swipeActionSchema>;
export type MessageSendInput = z.input<typeof messageSendSchema>;
export type MessageSendPayload = z.output<typeof messageSendSchema>;
