import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/app/app-shell";
import type { UserProfileRow, ProfilePhoto, DiscoveryPreferencesRow } from "@freeborn/shared";
import { ProfileEditor } from "@/components/app/profile-editor";
import { PhotoManager } from "@/components/app/photo-manager";
import { DiscoveryPreferencesForm } from "@/components/app/discovery-preferences-form";
import { ProfileVisibilityForm } from "@/components/app/profile-visibility-form";
import { PublicProfilePreview } from "@/components/app/public-profile-preview";

export const dynamic = "force-dynamic";

function humanize(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function profileStrength(profile: UserProfileRow) {
  return Math.min(
    35 +
      (profile.photo_count ?? 0) * 12 +
      (profile.bio ? 18 : 0) +
      ((profile.interests?.length ?? 0) ? 12 : 0) +
      ((profile.relationship_goals?.length ?? 0) ? 10 : 0) +
      (profile.is_verified ? 8 : 0),
    98,
  );
}

function PrivateAccountCard({ userEmail, profile }: { userEmail?: string | null; profile: UserProfileRow }) {
  return (
    <section className="luminous-card rounded-[32px] border border-white/5 bg-white/[0.02] p-8 shadow-[var(--shadow-raised)]">
      <div className="flex items-center justify-between gap-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[var(--color-ash)]">Security & Account</p>
        <span className="flex items-center gap-2 rounded-full border border-[var(--color-gold-500)]/20 bg-[var(--color-gold-500)]/5 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[var(--color-gold-300)]">
          <span className="h-1 w-1 rounded-full bg-current shadow-[0_0_8px_currentColor]" />
          Private
        </span>
      </div>

      <div className="mt-8 space-y-4">
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 transition-all hover:bg-white/[0.04]">
          <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--color-ash)]">Identity Email</p>
          <p className="mt-2 truncate text-[15px] font-bold text-[var(--color-pearl)]">{userEmail ?? "Not available"}</p>
          <p className="mt-1 text-[12px] font-medium text-[var(--color-ash)]">Never shown to other members.</p>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-ash)]">Verification</p>
            <p className={`mt-1 text-[13px] font-black uppercase tracking-wider ${profile.is_verified ? "text-[var(--color-teal-300)]" : "text-[var(--color-gold-300)]"}`}>
              {profile.is_verified ? "Verified" : "Pending"}
            </p>
          </div>
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-ash)]">Visibility</p>
            <p className={`mt-1 text-[13px] font-black uppercase tracking-wider ${profile.discoverable ? "text-[var(--color-teal-300)]" : "text-[var(--color-ash)]"}`}>
              {profile.discoverable ? "Public" : "Hidden"}
            </p>
          </div>
        </div>
      </div>

      <form action="/auth/signout" method="post" className="mt-8">
        <button className="flex h-[52px] w-full items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/5 text-[14px] font-black uppercase tracking-widest text-red-300 transition-all hover:bg-red-500/10 active:scale-95">
          End Session
        </button>
      </form>
    </section>
  );
}

function ProfileOverview({ profile, photoUrl }: { profile: UserProfileRow; photoUrl: string | null }) {
  const strength = profileStrength(profile);
  const location = [profile.city, profile.region].filter(Boolean).join(", ");

  return (
    <section className="luminous-card magic-border relative overflow-hidden rounded-[40px] border border-white/10 bg-[rgba(9,16,28,0.92)] p-8 shadow-[var(--shadow-card-lg)] sm:p-10">
      <div className="flex flex-col gap-8 sm:flex-row sm:items-center">
        <div className="relative h-28 w-28 shrink-0 sm:h-32 sm:w-32">
          <div className="h-full w-full overflow-hidden rounded-[32px] border-2 border-white/10 bg-white/5 shadow-inner">
            {photoUrl ? (
              <img alt="Your primary profile photo" src={photoUrl} className="h-full w-full object-cover transition-transform duration-700 hover:scale-110" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-rose-500/20 to-amber-500/20 font-[family-name:var(--font-display)] text-4xl font-black text-white/40">
                {(profile.display_name ?? "FB").slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--color-gold-500)] text-[var(--color-ink)] shadow-lg shadow-black/40 ring-4 ring-[#0a0d18]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <span className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-widest ${profile.discoverable ? "border-[var(--color-teal-500)]/30 bg-[var(--color-teal-500)]/10 text-[var(--color-teal-300)]" : "border-white/10 bg-white/5 text-[var(--color-ash)]"}`}>
              <span className={`h-1 w-1 rounded-full ${profile.discoverable ? "bg-current shadow-[0_0_8px_currentColor]" : "bg-current"}`} />
              {profile.discoverable ? "Public Profile" : "Hidden Profile"}
            </span>
            {profile.is_verified && (
              <span className="flex items-center gap-2 rounded-full border border-[var(--color-teal-500)]/30 bg-[var(--color-teal-500)]/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-[var(--color-teal-300)]">
                <span className="h-1 w-1 rounded-full bg-current shadow-[0_0_8px_currentColor]" />
                Verified Member
              </span>
            )}
          </div>
          <h2 
            className="mt-5 text-[clamp(2.25rem,5vw,3.5rem)] leading-[0.9] tracking-tight text-[var(--color-pearl)]"
            style={{ fontFamily: "var(--font-display)", fontVariationSettings: "'opsz' 144, 'wght' 500" }}
          >
            {profile.display_name || "New Member"}
          </h2>
          <p className="mt-3 text-[15px] font-bold uppercase tracking-[0.2em] text-[var(--color-ash)]">
            {location || "Location pending"}{profile.occupation ? ` · ${profile.occupation}` : ""}
          </p>
        </div>

        <div className="w-full shrink-0 rounded-[28px] border border-white/5 bg-white/[0.02] p-5 shadow-inner sm:w-48">
          <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-[var(--color-ash)]">
            <span>Profile Health</span>
            <span className="text-[var(--color-pearl)]">{strength}%</span>
          </div>
          <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-[var(--color-ember-500)] via-[var(--color-gold-500)] to-[var(--color-teal-500)] transition-all duration-1000" 
              style={{ width: `${strength}%` }} 
            />
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-3 sm:grid-cols-4">
        <a href="#edit" className="flex h-12 items-center justify-center rounded-2xl bg-[var(--color-pearl)] px-4 text-[13px] font-black uppercase tracking-widest text-[var(--color-ink)] transition-all hover:bg-white active:scale-95">
          Edit Details
        </a>
        <a href="#preview" className="flex h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-[13px] font-black uppercase tracking-widest text-[var(--color-pearl)] transition-all hover:bg-white/[0.08] active:scale-95">
          Public Preview
        </a>
        <a href="#photos" className="flex h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-[13px] font-black uppercase tracking-widest text-[var(--color-pearl)] transition-all hover:bg-white/[0.08] active:scale-95">
          Manage Photos
        </a>
        <a href="#privacy" className="flex h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-[13px] font-black uppercase tracking-widest text-[var(--color-pearl)] transition-all hover:bg-white/[0.08] active:scale-95">
          Privacy Settings
        </a>
      </div>
    </section>
  );
}

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth?mode=sign-in");

  const { data: profile } = await supabase.from("user_profiles").select("*").eq("id", user.id).maybeSingle<UserProfileRow>();
  if (!profile) redirect("/auth?mode=sign-in");
  if (profile.onboarding_stage === "account_created") redirect("/app/onboarding");

  const { data: photos } = await supabase.from("profile_photos").select("*").eq("user_id", user.id).order("position");
  const { data: prefs } = await supabase.from("discovery_preferences").select("*").eq("user_id", user.id).maybeSingle<DiscoveryPreferencesRow>();

  const primary = (photos as ProfilePhoto[] | null)?.find((photo) => photo.is_primary) ?? photos?.[0];
  const photoUrl = primary ? supabase.storage.from("profile-photos").getPublicUrl(primary.storage_path).data.publicUrl : null;

  return (
    <AppShell displayName={profile.display_name} photoUrl={photoUrl}>
      <div className="mx-auto w-full max-w-[1220px]">
        <header className="mb-7 flex flex-col gap-5 lg:mb-9 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--color-stone)]">Profile</p>
            <h1 className="mt-3 font-[family-name:var(--font-display)] text-[clamp(2.25rem,5vw,4rem)] leading-[0.92] tracking-[-0.06em] text-[var(--color-pearl)]">
              Shape how people meet you.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--color-mist)] sm:text-base">
              Your public profile can express values, wellness rhythm, and long-term intent without exposing private essentials. Email, full birth date, account details, and private medical history stay private.
            </p>
          </div>
          <Link href="/app" className="inline-flex w-fit items-center justify-center rounded-full border border-white/12 bg-white/[0.04] px-5 py-3 text-sm font-bold text-[var(--color-pearl)] hover:bg-white/[0.08]">
            Back to Discover
          </Link>
        </header>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px] xl:items-start">
          <main className="space-y-6">
            <ProfileOverview profile={profile} photoUrl={photoUrl} />
            <div id="preview" className="scroll-mt-8">
              <PublicProfilePreview profile={profile} photos={(photos as ProfilePhoto[]) ?? []} />
            </div>
            <div id="photos" className="scroll-mt-8">
              <PhotoManager photos={(photos as ProfilePhoto[]) ?? []} />
            </div>
            <div id="edit" className="scroll-mt-8">
              <ProfileEditor profile={profile} />
            </div>
          </main>

          <aside className="space-y-6 xl:sticky xl:top-8">
            <ProfileVisibilityForm profile={profile} />
            <DiscoveryPreferencesForm prefs={prefs ?? null} profile={profile} />
            <PrivateAccountCard userEmail={user.email} profile={profile} />
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
