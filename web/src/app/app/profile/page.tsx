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
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-stone)]">Profile</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-[clamp(1.8rem,3.5vw,2.8rem)] text-[var(--color-pearl)]">
          Make your profile unforgettable
        </h1>
        <p className="mt-2 text-sm text-[var(--color-mist)]">Every detail helps you find the right kind of connection.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <PhotoManager photos={(photos as ProfilePhoto[]) ?? []} />
          <ProfileEditor profile={profile} />
        </div>
        <div className="space-y-6" id="discovery">
          <DiscoveryPreferencesForm prefs={prefs ?? null} profile={profile} />
          <div className="luminous-card rounded-2xl border border-white/8 bg-white/[0.035] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-stone)]">Account</p>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--color-mist)]">Email</span>
                <span className="text-[var(--color-pearl)]">{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-mist)]">Verified</span>
                <span className={`font-semibold ${profile.is_verified ? "text-emerald-300" : "text-[var(--color-mist)]"}`}>
                  {profile.is_verified ? "Yes" : "Not verified"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-mist)]">Status</span>
                <span className="capitalize text-[var(--color-pearl)]">{profile.profile_status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-mist)]">Discoverable</span>
                <span className={`font-semibold ${profile.discoverable ? "text-emerald-300" : "text-[var(--color-mist)]"}`}>
                  {profile.discoverable ? "On" : "Off"}
                </span>
              </div>
            </div>
            <form action="/auth/signout" method="post" className="mt-6">
              <button className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-3 text-sm font-semibold text-[var(--color-mist)] transition hover:bg-white/[0.06] hover:text-red-200">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
