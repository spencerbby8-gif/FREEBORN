import type { ProfilePhoto, PromptAnswer, UserProfileRow } from "@freeborn/shared";

export function publicPhotoUrl(path?: string | null) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  return `${base}/storage/v1/object/public/profile-photos/${path.split("/").map(encodeURIComponent).join("/")}`;
}

export function initials(name?: string | null) {
  return (name ?? "FB")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function humanize(value?: string | null) {
  return (value ?? "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function ageFromBirthDate(value?: string | null) {
  if (!value) return null;
  const birth = new Date(value);
  if (Number.isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDelta = today.getMonth() - birth.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < birth.getDate())) age -= 1;
  return age >= 18 ? age : null;
}

export function primaryPhoto(photos: ProfilePhoto[]) {
  return photos.find((photo) => photo.is_primary) ?? photos[0] ?? null;
}

export type CompletionItem = {
  id: string;
  label: string;
  href: string;
  done: boolean;
  impact: "High" | "Medium" | "Trust";
  detail: string;
};

export function promptAnswers(profile: UserProfileRow): PromptAnswer[] {
  return Array.isArray(profile.prompt_answers) ? profile.prompt_answers.filter((item) => item.prompt && item.answer) : [];
}

export function completionItems(profile: UserProfileRow, photos: ProfilePhoto[]): CompletionItem[] {
  const prompts = promptAnswers(profile);
  return [
    {
      id: "about-me",
      label: "About Me",
      href: "/app/profile/about-me",
      done: Boolean(profile.display_name && profile.birth_date && profile.gender && profile.city && profile.bio && profile.bio.length >= 20),
      impact: "High",
      detail: "Name, age, location, and bio anchor the first impression.",
    },
    {
      id: "photos",
      label: "Photos",
      href: "/app/profile/photos",
      done: photos.length > 0,
      impact: "High",
      detail: "A clear cover photo has the biggest effect on trust and recognition.",
    },
    {
      id: "intent",
      label: "Intent",
      href: "/app/profile/intent",
      done: (profile.relationship_goals?.length ?? 0) > 0,
      impact: "High",
      detail: "Intent helps align people before the first message.",
    },
    {
      id: "values",
      label: "Values",
      href: "/app/profile/values",
      done: (profile.values?.length ?? 0) > 0,
      impact: "High",
      detail: "Values are one of Freeborn’s strongest compatibility signals.",
    },
    {
      id: "lifestyle",
      label: "Lifestyle",
      href: "/app/profile/lifestyle",
      done: (profile.lifestyle_preferences?.length ?? 0) > 0,
      impact: "Medium",
      detail: "Daily rhythm makes profiles feel specific and human.",
    },
    {
      id: "interests",
      label: "Interests",
      href: "/app/profile/interests",
      done: (profile.interests?.length ?? 0) >= 3,
      impact: "Medium",
      detail: "Interests create easy, specific conversation starters.",
    },
    {
      id: "prompts",
      label: "Prompts",
      href: "/app/profile/prompts",
      done: prompts.length > 0,
      impact: "Medium",
      detail: "Prompt answers add depth beyond tags and photos.",
    },
    {
      id: "dealbreakers",
      label: "Dealbreakers",
      href: "/app/profile/dealbreakers",
      done: (profile.deal_breakers?.length ?? 0) > 0,
      impact: "Medium",
      detail: "Boundaries protect attention and improve match fit.",
    },
    {
      id: "privacy-visibility",
      label: "Privacy & Visibility",
      href: "/app/profile/privacy-visibility",
      done: profile.discoverable !== null && profile.discoverable !== undefined,
      impact: "Trust",
      detail: "Visibility controls explain exactly when you appear in discovery.",
    },
    {
      id: "verification",
      label: "Verification",
      href: "/app/profile/verification",
      done: profile.is_verified,
      impact: "Trust",
      detail: "A real trust badge appears only after verification is complete.",
    },
    {
      id: "account-status",
      label: "Account Status",
      href: "/app/profile/account-status",
      done: profile.profile_status === "active" && profile.onboarding_stage !== "account_created",
      impact: "Trust",
      detail: "Status and private account details help you understand how Freeborn protects your profile.",
    },
  ];
}

export function profileStrength(profile: UserProfileRow, photos: ProfilePhoto[]) {
  const items = completionItems(profile, photos);
  const weighted = items.reduce((score, item) => {
    if (!item.done) return score;
    return score + (item.impact === "High" ? 13 : item.impact === "Trust" ? 9 : 8);
  }, 10);
  return Math.min(weighted + (profile.is_verified ? 8 : 0), 98);
}

export function locationLabel(profile: UserProfileRow) {
  return [profile.city, profile.region].filter(Boolean).join(", ") || "Location pending";
}
