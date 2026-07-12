import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/app/app-shell";
import { ProfileHub } from "@/components/app/profile-hub";
import type { ProfilePhoto, UserProfileRow } from "@freeborn/shared";
import { primaryPhoto } from "@/components/app/profile-utils";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
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

  return (
    <AppShell displayName={profile.display_name} photoUrl={photoUrl}>
      <ProfileHub profile={profile} photos={typedPhotos} userEmail={user.email} />
    </AppShell>
  );
}
