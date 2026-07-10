import { redirect } from "next/navigation";
import type { DiscoveryCandidate, ProfilePhoto, UserProfileRow, DiscoveryPreferencesRow } from "@freeborn/shared";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/app/app-shell";
import { DiscoverClient } from "@/components/app/discover-client";

export const dynamic = "force-dynamic";

export default async function DiscoverPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth?mode=sign-in");

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle<UserProfileRow>();

  if (!profile) redirect("/auth?mode=sign-in");
  if (profile.onboarding_stage === "account_created") redirect("/app/onboarding");

  // Ensure discovery preferences exist
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

  // discover candidates via RPC
  const { data: candidatesRaw } = await supabase.rpc("discover_candidates", {
    p_user: user.id,
    p_limit: 24,
    p_offset: 0,
  });

  const candidates = (candidatesRaw as DiscoveryCandidate[]) ?? [];

  // fetch photos for candidates
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

  // stats
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
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div>
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-stone)]">
                Discovery · Phase 3
              </p>
              <h1 className="mt-2 font-[family-name:var(--font-display)] text-[clamp(2.2rem,4vw,3.3rem)] leading-[0.95] tracking-[-0.045em] text-[var(--color-pearl)]">
                Thoughtful people, nearby.
              </h1>
            </div>
            <div className="hidden text-right text-xs text-[var(--color-mist)] sm:block">
              <div>{matchesCount ?? 0} matches</div>
              <div>{likesCount ?? 0} likes received</div>
            </div>
          </div>

          <DiscoverClient
            initialCandidates={candidates}
            photosByUser={Object.fromEntries(photosByUser)}
            emptyState={!candidates.length}
          />
        </div>

        <aside className="space-y-5">
          <div className="glass-panel premium-border rounded-[32px] p-6 sm:p-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-stone)]">
              Your filters
            </p>
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-[var(--color-mist)]">Age</p>
                <p className="mt-1 text-lg font-semibold text-[var(--color-pearl)]">
                  {prefs?.age_min ?? profile.age_min_preference} – {prefs?.age_max ?? profile.age_max_preference}
                </p>
              </div>
              <div>
                <p className="text-[var(--color-mist)]">Distance</p>
                <p className="mt-1 text-lg font-semibold text-[var(--color-pearl)]">
                  {prefs?.distance_km ?? profile.max_distance_km} km
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-[var(--color-mist)]">Showing</p>
                <p className="mt-1 text-[15px] font-semibold capitalize text-[var(--color-pearl)]">
                  {(prefs?.show_genders ?? []).join(", ") || "Everyone thoughtful"}
                </p>
              </div>
            </div>
            <a
              href="/app/profile#discovery"
              className="mt-5 inline-flex text-sm font-semibold text-[var(--color-accent-gold)] hover:underline"
            >
              Adjust preferences →
            </a>
          </div>

          <div className="premium-border rounded-[32px] bg-[rgba(247,241,232,0.97)] p-6 text-[var(--color-ink)] shadow-[var(--shadow-card)] sm:p-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[rgba(11,19,32,0.5)]">
              Profile strength
            </p>
            <div className="mt-3 flex items-baseline gap-3">
              <span className="font-[family-name:var(--font-display)] text-4xl">
                {Math.min(35 + (profile.photo_count ?? 0) * 15 + (profile.bio ? 20 : 0) + (profile.interests?.length ? 15 : 0), 98)}%
              </span>
              <span className="text-sm text-[rgba(11,19,32,0.66)]">complete</span>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-[rgba(11,19,32,0.78)]">
              <li>• {profile.photo_count} {profile.photo_count === 1 ? "photo" : "photos"} uploaded</li>
              <li>• {profile.interests?.length ?? 0} interests selected</li>
              <li>• {profile.is_verified ? "Verified email" : "Email pending verify"}</li>
            </ul>
            <a
              href="/app/profile"
              className="mt-5 inline-flex w-full items-center justify-center rounded-[18px] bg-[var(--color-ink)] px-4 py-3 text-sm font-bold text-white hover:bg-black"
            >
              Edit profile
            </a>
          </div>

          <div className="glass-panel premium-border rounded-[32px] p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-stone)]">
              Trust signals
            </p>
            <div className="mt-4 space-y-3 text-[14px] leading-6 text-[var(--color-pearl)]/92">
              <p>• Verification-minded safety is built into every profile.</p>
              <p>• Private, respectful conversations — no screenshots broadcast.</p>
              <p>• Human moderation + clear reporting tools.</p>
            </div>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
