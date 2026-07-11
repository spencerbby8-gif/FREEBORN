import { redirect } from "next/navigation";
import type { DiscoveryCandidate, ProfilePhoto, UserProfileRow, DiscoveryPreferencesRow } from "@freeborn/shared";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/app/app-shell";
import { DiscoverClient } from "@/components/app/discover-client";

export const dynamic = "force-dynamic";

export default async function DiscoverPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth?mode=sign-in");

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle<UserProfileRow>();

  if (!profile) redirect("/auth?mode=sign-in");
  if (profile.onboarding_stage === "account_created") redirect("/app/onboarding");

  await supabase.from("discovery_preferences").upsert({ user_id: user.id }, { onConflict: "user_id", ignoreDuplicates: true });

  const { data: myPhotos } = await supabase
    .from("profile_photos")
    .select("*")
    .eq("user_id", user.id)
    .order("position", { ascending: true });

  const primaryPhoto = (myPhotos as ProfilePhoto[] | null)?.find((p) => p.is_primary) ?? myPhotos?.[0];
  const photoUrl = primaryPhoto
    ? supabase.storage.from("profile-photos").getPublicUrl(primaryPhoto.storage_path).data.publicUrl
    : null;

  const { data: candidatesRaw } = await supabase.rpc("discover_candidates", {
    p_user: user.id, p_limit: 24, p_offset: 0,
  });
  const candidates = (candidatesRaw as DiscoveryCandidate[]) ?? [];

  const candidateIds = candidates.map((c) => c.id);
  const photosByUser = new Map<string, ProfilePhoto[]>();
  if (candidateIds.length) {
    const { data: photos } = await supabase
      .from("profile_photos")
      .select("*")
      .in("user_id", candidateIds)
      .order("position", { ascending: true });
    (photos as ProfilePhoto[] | null)?.forEach((p) => {
      const arr = photosByUser.get(p.user_id) ?? [];
      arr.push(p);
      photosByUser.set(p.user_id, arr);
    });
  }

  const { count: likesCount } = await supabase
    .from("user_swipes")
    .select("*", { count: "exact", head: true })
    .eq("liked_id", user.id)
    .eq("action", "like");

  const { count: matchesCount } = await supabase
    .from("user_matches")
    .select("*", { count: "exact", head: true })
    .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
    .eq("status", "active");

  const { data: prefs } = await supabase
    .from("discovery_preferences")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle<DiscoveryPreferencesRow>();

  return (
    <AppShell displayName={profile.display_name} photoUrl={photoUrl}>
      <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-stone)]">
              Discover
            </p>
            <h1 className="mt-2 font-[family-name:var(--font-display)] text-[clamp(1.8rem,3.5vw,2.8rem)] leading-[0.95] tracking-[-0.045em] text-[var(--color-pearl)]">
              Thoughtful people, nearby.
            </h1>
            <p className="mt-2 text-sm text-[var(--color-mist)]">
              {profile.display_name ? `Welcome back, ${profile.display_name.split(" ")[0]}.` : "Your curated feed is ready."}
            </p>
          </div>

          <DiscoverClient
            initialCandidates={candidates}
            photosByUser={Object.fromEntries(photosByUser)}
            emptyState={!candidates.length}
          />
        </div>

        <aside className="space-y-5">
          {/* Profile summary */}
          <div className="luminous-card rounded-2xl border border-white/8 bg-white/[0.035] p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/8">
                {photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img alt="" src={photoUrl} className="h-full w-full object-cover" />
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--color-stone)]">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--color-pearl)]">{profile.display_name || "You"}</p>
                <p className="text-xs text-[var(--color-mist)]">{matchesCount ?? 0} matches · {likesCount ?? 0} likes</p>
              </div>
            </div>
          </div>

          {/* Filter summary */}
          <div className="luminous-card rounded-2xl border border-white/8 bg-white/[0.035] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-stone)]">
              Your filters
            </p>
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-[var(--color-mist)] text-xs">Age range</p>
                <p className="mt-1 text-base font-semibold text-[var(--color-pearl)]">
                  {prefs?.age_min ?? profile.age_min_preference} – {prefs?.age_max ?? profile.age_max_preference}
                </p>
              </div>
              <div>
                <p className="text-[var(--color-mist)] text-xs">Distance</p>
                <p className="mt-1 text-base font-semibold text-[var(--color-pearl)]">
                  {prefs?.distance_km ?? profile.max_distance_km} km
                </p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-[var(--color-mist)] text-xs">Showing</p>
              <p className="mt-1 text-sm font-semibold capitalize text-[var(--color-pearl)]">
                {(prefs?.show_genders ?? []).join(", ") || "Everyone"}
              </p>
            </div>
            <a href="/app/profile#discovery" className="mt-5 inline-flex text-sm font-semibold text-[var(--color-accent-gold)] hover:text-[var(--color-pearl)] transition">
              Adjust preferences →
            </a>
          </div>

          {/* Profile strength */}
          <div className="luminous-card rounded-2xl border border-white/8 bg-white/[0.035] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-stone)]">
              Profile strength
            </p>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-[family-name:var(--font-display)] text-3xl text-[var(--color-pearl)]">
                {Math.min(35 + (profile.photo_count ?? 0) * 15 + (profile.bio ? 20 : 0) + (profile.interests?.length ? 15 : 0), 98)}%
              </span>
              <span className="text-xs text-[var(--color-mist)]">complete</span>
            </div>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/8">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[var(--color-accent-rose)] to-[var(--color-accent-gold)]"
                style={{ width: `${Math.min(35 + (profile.photo_count ?? 0) * 15 + (profile.bio ? 20 : 0) + (profile.interests?.length ? 15 : 0), 98)}%` }}
              />
            </div>
            <ul className="mt-4 space-y-2 text-xs text-[var(--color-mist)]">
              <li className="flex items-center gap-2">
                <span className={`h-1.5 w-1.5 rounded-full ${profile.photo_count ? "bg-emerald-400" : "bg-white/20"}`} />
                {profile.photo_count} photo{profile.photo_count !== 1 ? "s" : ""}
              </li>
              <li className="flex items-center gap-2">
                <span className={`h-1.5 w-1.5 rounded-full ${(profile.interests?.length ?? 0) > 0 ? "bg-emerald-400" : "bg-white/20"}`} />
                {profile.interests?.length ?? 0} interests
              </li>
              <li className="flex items-center gap-2">
                <span className={`h-1.5 w-1.5 rounded-full ${profile.is_verified ? "bg-emerald-400" : "bg-white/20"}`} />
                {profile.is_verified ? "Verified" : "Not verified"}
              </li>
            </ul>
            <a href="/app/profile" className="mt-5 inline-flex w-full items-center justify-center magic-button rounded-xl bg-[var(--color-pearl)] px-4 py-3 text-sm font-bold text-[var(--color-ink)] transition hover:bg-white hover:translate-y-[-1px]">
              Edit profile
            </a>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
