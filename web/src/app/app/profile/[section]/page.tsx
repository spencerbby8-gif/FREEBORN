import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/app/app-shell";
import { PhotoManager } from "@/components/app/photo-manager";
import { PublicProfilePreview } from "@/components/app/public-profile-preview";
import { DiscoveryPreferencesForm } from "@/components/app/discovery-preferences-form";
import { ProfileSectionEditor, AccountStatusPanel, type ProfileSectionId } from "@/components/app/profile-section-editor";
import { VerificationFlow } from "@/components/app/verification-flow";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { DiscoveryPreferencesRow, ProfilePhoto, UserProfileRow } from "@freeborn/shared";
import { primaryPhoto } from "@/components/app/profile-utils";
import { ArrowIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

const editSections: ProfileSectionId[] = [
  "about-me",
  "intent",
  "values",
  "lifestyle",
  "interests",
  "prompts",
  "dealbreakers",
  "privacy-visibility",
];

const allSections = [...editSections, "photos", "preview", "verification", "account-status"] as const;
type Section = (typeof allSections)[number];

function parseSection(value: string): Section {
  if ((allSections as readonly string[]).includes(value)) return value as Section;
  notFound();
}

export default async function ProfileSectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ section: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { section: rawSection } = await params;
  const query = await searchParams;
  const section = parseSection(rawSection);
  const rawStatus = Array.isArray(query.status) ? query.status[0] : query.status;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth?mode=sign-in");

  const { data: profile } = await supabase.from("user_profiles").select("*").eq("id", user.id).maybeSingle<UserProfileRow>();
  if (!profile) redirect("/auth?mode=sign-in");
  if (profile.onboarding_stage === "account_created") redirect("/app/onboarding");

  const { data: photos } = await supabase.from("profile_photos").select("*").eq("user_id", user.id).order("position");
  const typedPhotos = (photos as ProfilePhoto[]) ?? [];
  const primary = primaryPhoto(typedPhotos);
  const photoUrl = primary ? supabase.storage.from("profile-photos").getPublicUrl(primary.storage_path).data.publicUrl : null;

  const { data: prefs } = section === "privacy-visibility"
    ? await supabase.from("discovery_preferences").select("*").eq("user_id", user.id).maybeSingle<DiscoveryPreferencesRow>()
    : { data: null } as { data: DiscoveryPreferencesRow | null };

  return (
    <AppShell displayName={profile.display_name} photoUrl={photoUrl}>
      {editSections.includes(section as ProfileSectionId) && section !== "privacy-visibility" ? (
        <ProfileSectionEditor section={section as ProfileSectionId} profile={profile} />
      ) : null}

      {section === "privacy-visibility" ? (
        <div className="mx-auto grid w-full max-w-[1180px] gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
          <ProfileSectionEditor section="privacy-visibility" profile={profile} />
          <div className="lg:sticky lg:top-8 lg:self-start">
            <DiscoveryPreferencesForm prefs={prefs} profile={profile} />
          </div>
        </div>
      ) : null}

      {section === "photos" ? (
        <div className="mx-auto w-full max-w-[980px] space-y-6">
          <Link href="/app/profile" className="inline-flex items-center gap-2 text-sm font-bold text-[var(--color-mist)] transition hover:text-[var(--color-pearl)]"><ArrowIcon size={16} className="rotate-180" /> Profile hub</Link>
          <PhotoManager photos={typedPhotos} />
        </div>
      ) : null}
      {section === "preview" ? <PublicProfilePreview profile={profile} photos={typedPhotos} /> : null}
      {section === "verification" ? (
        <VerificationFlow
          profile={profile}
          photos={typedPhotos}
          initialState={profile.is_verified ? "approved" : rawStatus === "verified" || rawStatus === "sent" ? "pending" : rawStatus === "failed" || rawStatus === "error" ? "failed" : "ready"}
        />
      ) : null}
      {section === "account-status" ? <AccountStatusPanel profile={profile} userEmail={user.email} /> : null}
    </AppShell>
  );
}
