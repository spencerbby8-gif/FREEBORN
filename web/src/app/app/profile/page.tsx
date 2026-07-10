import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/app/app-shell";
import type { UserProfileRow, ProfilePhoto, DiscoveryPreferencesRow } from "@freeborn/shared";
import { ProfileEditor } from "@/components/app/profile-editor";
import { PhotoManager } from "@/components/app/photo-manager";
import { DiscoveryPreferencesForm } from "@/components/app/discovery-preferences-form";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth?mode=sign-in");

  const { data: profile } = await supabase.from("user_profiles").select("*").eq("id", user.id).maybeSingle<UserProfileRow>();
  if (!profile) redirect("/auth?mode=sign-in");
  if (profile.onboarding_stage === "account_created") redirect("/app/onboarding");

  const { data: photos } = await supabase.from("profile_photos").select("*").eq("user_id", user.id).order("position");
  const { data: prefs } = await supabase.from("discovery_preferences").select("*").eq("user_id", user.id).maybeSingle<DiscoveryPreferencesRow>();

  const primary = (photos as ProfilePhoto[] | null)?.find(p => p.is_primary) ?? photos?.[0];
  const photoUrl = primary ? supabase.storage.from("profile-photos").getPublicUrl(primary.storage_path).data.publicUrl : null;

  return (
    <AppShell displayName={profile.display_name} photoUrl={photoUrl}>
      <div className="mb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-stone)]">Profile</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-[clamp(2.1rem,4vw,3.2rem)] text-[var(--color-pearl)]">
          Make your profile unforgettable
        </h1>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <PhotoManager photos={(photos as ProfilePhoto[]) ?? []} />
          <ProfileEditor profile={profile} />
        </div>
        <div className="space-y-6" id="discovery">
          <DiscoveryPreferencesForm prefs={prefs ?? null} profile={profile} />
          <div className="glass-panel premium-border rounded-[30px] p-6">
            <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--color-stone)]">Account</p>
            <div className="mt-4 space-y-3 text-sm text-[var(--color-pearl)]/90">
              <div className="flex justify-between"><span className="text-[var(--color-mist)]">Email</span><span>{user.email}</span></div>
              <div className="flex justify-between"><span className="text-[var(--color-mist)]">Verified</span><span>{profile.is_verified ? "Yes" : "Pending"}</span></div>
              <div className="flex justify-between"><span className="text-[var(--color-mist)]">Status</span><span className="capitalize">{profile.profile_status}</span></div>
              <div className="flex justify-between"><span className="text-[var(--color-mist)]">Discoverable</span><span>{profile.discoverable ? "On" : "Off"}</span></div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
