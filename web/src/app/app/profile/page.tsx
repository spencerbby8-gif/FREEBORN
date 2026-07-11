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
    <section className="luminous-card rounded-[28px] border border-white/10 bg-white/[0.035] p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.20em] text-[var(--color-stone)]">Private account details</p>
          <h2 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-[var(--color-pearl)]">Only you can see this.</h2>
        </div>
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-mist)]">
          Private
        </span>
      </div>

      <div className="mt-5 divide-y divide-white/8 rounded-2xl border border-white/8 bg-white/[0.025] px-4 text-sm">
        <div className="flex items-start justify-between gap-4 py-4">
          <div>
            <p className="font-semibold text-[var(--color-pearl)]">Email</p>
            <p className="mt-1 text-xs text-[var(--color-mist)]">Used for sign-in. Never shown in discovery.</p>
          </div>
          <span className="max-w-[180px] break-all text-right text-[var(--color-mist)]">{userEmail ?? "Not available"}</span>
        </div>
        <div className="flex items-center justify-between gap-4 py-4">
          <span className="font-semibold text-[var(--color-pearl)]">Verification</span>
          <span className={`font-bold ${profile.is_verified ? "text-[var(--color-success)]" : "text-[var(--color-gold-300)]"}`}>
            {profile.is_verified ? "Verified" : "Not verified yet"}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4 py-4">
          <span className="font-semibold text-[var(--color-pearl)]">Profile status</span>
          <span className="text-[var(--color-mist)]">{humanize(profile.profile_status)}</span>
        </div>
        <div className="flex items-center justify-between gap-4 py-4">
          <span className="font-semibold text-[var(--color-pearl)]">Discoverability</span>
          <span className={`font-bold ${profile.discoverable ? "text-[var(--color-success)]" : "text-[var(--color-mist)]"}`}>
            {profile.discoverable ? "Visible" : "Hidden"}
          </span>
        </div>
      </div>

      <form action="/auth/signout" method="post" className="mt-5">
        <button className="w-full rounded-2xl border border-white/10 bg-white/[0.035] px-5 py-3.5 text-sm font-bold text-[var(--color-mist)] transition hover:border-red-300/30 hover:bg-red-400/10 hover:text-red-100">
          Sign out
        </button>
      </form>
    </section>
  );
}

function ProfileOverview({ profile, photoUrl }: { profile: UserProfileRow; photoUrl: string | null }) {
  const strength = profileStrength(profile);
  const location = [profile.city, profile.region].filter(Boolean).join(", ");

  return (
    <section className="luminous-card magic-border rounded-[32px] border border-white/10 bg-white/[0.035] p-6 sm:p-7">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.05] sm:h-28 sm:w-28">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img alt="Your primary profile photo" src={photoUrl} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[rgba(239,94,94,0.25)] to-[rgba(138,110,242,0.18)] font-[family-name:var(--font-display)] text-3xl text-[var(--color-pearl)]">
              {(profile.display_name ?? "FB").slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] ${profile.discoverable ? "border-[rgba(109,211,176,0.28)] bg-[rgba(109,211,176,0.10)] text-[var(--color-success)]" : "border-white/10 bg-white/[0.04] text-[var(--color-mist)]"}`}>
              {profile.discoverable ? "Visible in discovery" : "Hidden from discovery"}
            </span>
            <span className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] ${profile.is_verified ? "border-[rgba(109,211,176,0.28)] bg-[rgba(109,211,176,0.10)] text-[var(--color-success)]" : "border-[rgba(246,215,154,0.26)] bg-[rgba(217,167,82,0.10)] text-[var(--color-gold-300)]"}`}>
              {profile.is_verified ? "Verified" : "Verification pending"}
            </span>
          </div>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-[clamp(2rem,4vw,3rem)] leading-[0.95] tracking-[-0.055em] text-[var(--color-pearl)]">
            {profile.display_name || "Your profile"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--color-mist)]">
            {location || "Location not set"}{profile.occupation ? ` · ${profile.occupation}` : ""}
          </p>
        </div>

        <div className="w-full rounded-2xl border border-white/8 bg-white/[0.03] p-4 sm:w-40">
          <p className="text-xs text-[var(--color-mist)]">Completeness</p>
          <p className="mt-1 font-[family-name:var(--font-display)] text-4xl leading-none text-[var(--color-pearl)]">{strength}%</p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/8">
            <div className="h-full rounded-full bg-gradient-to-r from-[var(--color-ember-500)] to-[var(--color-gold-500)]" style={{ width: `${strength}%` }} />
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        <a href="#edit" className="magic-button inline-flex items-center justify-center rounded-2xl bg-[var(--color-pearl)] px-5 py-3 text-sm font-extrabold text-[var(--color-ink)] hover:bg-white">
          Edit profile
        </a>
        <a href="#preview" className="inline-flex items-center justify-center rounded-2xl border border-white/12 bg-white/[0.04] px-5 py-3 text-sm font-bold text-[var(--color-pearl)] hover:bg-white/[0.08]">
          Public preview
        </a>
        <a href="#photos" className="inline-flex items-center justify-center rounded-2xl border border-white/12 bg-white/[0.04] px-5 py-3 text-sm font-bold text-[var(--color-pearl)] hover:bg-white/[0.08]">
          Manage photos
        </a>
        <a href="#privacy" className="inline-flex items-center justify-center rounded-2xl border border-white/12 bg-white/[0.04] px-5 py-3 text-sm font-bold text-[var(--color-pearl)] hover:bg-white/[0.08]">
          Privacy
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
