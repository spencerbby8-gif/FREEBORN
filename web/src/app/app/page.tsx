import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import type { DiscoveryCandidate, ProfilePhoto, UserProfileRow, DiscoveryPreferencesRow } from "@freeborn/shared";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/app/app-shell";
import { DiscoverClient } from "@/components/app/discover-client";

export const dynamic = "force-dynamic";

function humanize(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
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

function StatusPill({ tone, children }: { tone: "success" | "muted" | "gold"; children: ReactNode }) {
  const className =
    tone === "success"
      ? "border-[rgba(109,211,176,0.28)] bg-[rgba(109,211,176,0.10)] text-[var(--color-success)]"
      : tone === "gold"
        ? "border-[rgba(246,215,154,0.30)] bg-[rgba(217,167,82,0.10)] text-[var(--color-gold-300)]"
        : "border-white/10 bg-white/[0.04] text-[var(--color-mist)]";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] ${className}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}

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

  const primaryPhoto = (myPhotos as ProfilePhoto[] | null)?.find((photo) => photo.is_primary) ?? myPhotos?.[0];
  const photoUrl = primaryPhoto
    ? supabase.storage.from("profile-photos").getPublicUrl(primaryPhoto.storage_path).data.publicUrl
    : null;

  const { data: candidatesRaw } = await supabase.rpc("discover_candidates", {
    p_user: user.id,
    p_limit: 24,
    p_offset: 0,
  });
  const candidates = (candidatesRaw as DiscoveryCandidate[]) ?? [];

  const candidateIds = candidates.map((candidate) => candidate.id);
  const photosByUser = new Map<string, ProfilePhoto[]>();
  if (candidateIds.length) {
    const { data: photos } = await supabase
      .from("profile_photos")
      .select("*")
      .in("user_id", candidateIds)
      .order("position", { ascending: true });
    (photos as ProfilePhoto[] | null)?.forEach((photo) => {
      const grouped = photosByUser.get(photo.user_id) ?? [];
      grouped.push(photo);
      photosByUser.set(photo.user_id, grouped);
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

  const strength = profileStrength(profile);
  const firstName = profile.display_name?.split(" ")[0];
  const ageMin = prefs?.age_min ?? profile.age_min_preference;
  const ageMax = prefs?.age_max ?? profile.age_max_preference;
  const distance = prefs?.distance_km ?? profile.max_distance_km;
  const showGenders = prefs?.show_genders ?? profile.show_gender ?? [];
  const intents = prefs?.relationship_intents ?? profile.relationship_goals ?? [];

  return (
    <AppShell displayName={profile.display_name} photoUrl={photoUrl}>
      <div className="mx-auto w-full max-w-[1220px]">
        <header className="mb-7 flex flex-col gap-5 lg:mb-9 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--color-stone)]">Discover</p>
            <h1 className="mt-3 font-[family-name:var(--font-display)] text-[clamp(2.3rem,5vw,4.1rem)] leading-[0.92] tracking-[-0.06em] text-[var(--color-pearl)]">
              Meet one values-aligned person at a time.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--color-mist)] sm:text-base">
              {firstName ? `Welcome back, ${firstName}. ` : "Your curated feed is ready. "}
              Read the whole profile — values, wellness rhythm, intentions, and context — then make one thoughtful choice.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusPill tone={profile.discoverable ? "success" : "muted"}>
              {profile.discoverable ? "Visible" : "Hidden"}
            </StatusPill>
            <StatusPill tone={profile.is_verified ? "success" : "gold"}>
              {profile.is_verified ? "Verified" : "Verification pending"}
            </StatusPill>
          </div>
        </header>

        <div className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
          <main>
            <DiscoverClient
              initialCandidates={candidates}
              photosByUser={Object.fromEntries(photosByUser)}
              emptyState={!candidates.length}
            />
          </main>

          <aside className="space-y-5 xl:sticky xl:top-8">
            <section className="luminous-card rounded-[28px] border border-white/10 bg-white/[0.035] p-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.20em] text-[var(--color-stone)]">Discovery brief</p>
              <h2 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-[var(--color-pearl)]">Your room is set with boundaries.</h2>
              <p className="mt-3 text-sm leading-6 text-[var(--color-mist)]">
                Freeborn keeps discovery finite and values-forward. Private essentials like email, full birth date, and private medical history are never shown to other members.
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                  <p className="text-xs text-[var(--color-mist)]">Matches</p>
                  <p className="mt-1 font-[family-name:var(--font-display)] text-3xl leading-none text-[var(--color-pearl)]">{matchesCount ?? 0}</p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                  <p className="text-xs text-[var(--color-mist)]">Likes</p>
                  <p className="mt-1 font-[family-name:var(--font-display)] text-3xl leading-none text-[var(--color-pearl)]">{likesCount ?? 0}</p>
                </div>
              </div>
            </section>

            <section className="luminous-card rounded-[28px] border border-white/10 bg-white/[0.035] p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.20em] text-[var(--color-stone)]">Profile strength</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-mist)]">A fuller profile gives people better reasons to start something specific.</p>
                </div>
                <span className="font-[family-name:var(--font-display)] text-4xl leading-none text-[var(--color-pearl)]">{strength}%</span>
              </div>
              <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-white/8">
                <div className="h-full rounded-full bg-gradient-to-r from-[var(--color-ember-500)] via-[var(--color-gold-500)] to-[var(--color-violet-500)]" style={{ width: `${strength}%` }} />
              </div>
              <ul className="mt-5 space-y-3 text-sm text-[var(--color-mist)]">
                <li className="flex items-center justify-between gap-3"><span>Photos</span><span className="font-semibold text-[var(--color-pearl)]">{profile.photo_count}/6</span></li>
                <li className="flex items-center justify-between gap-3"><span>Interests</span><span className="font-semibold text-[var(--color-pearl)]">{profile.interests?.length ?? 0}</span></li>
                <li className="flex items-center justify-between gap-3"><span>Bio</span><span className={profile.bio ? "font-semibold text-[var(--color-success)]" : "font-semibold text-[var(--color-mist)]"}>{profile.bio ? "Added" : "Missing"}</span></li>
              </ul>
              <Link href="/app/profile" className="magic-button mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-[var(--color-pearl)] px-5 py-3 text-sm font-extrabold text-[var(--color-ink)] hover:bg-white">
                Edit profile
              </Link>
            </section>

            <section className="luminous-card rounded-[28px] border border-white/10 bg-white/[0.035] p-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.20em] text-[var(--color-stone)]">Active filters</p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                  <p className="text-xs text-[var(--color-mist)]">Age</p>
                  <p className="mt-1 text-lg font-bold text-[var(--color-pearl)]">{ageMin}–{ageMax}</p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                  <p className="text-xs text-[var(--color-mist)]">Distance</p>
                  <p className="mt-1 text-lg font-bold text-[var(--color-pearl)]">{distance} km</p>
                </div>
              </div>
              <div className="mt-4 space-y-3">
                <div>
                  <p className="text-xs text-[var(--color-mist)]">Showing</p>
                  <p className="mt-1 text-sm font-semibold text-[var(--color-pearl)]">
                    {showGenders.length ? showGenders.map(humanize).join(", ") : "Everyone"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--color-mist)]">Intentions</p>
                  <p className="mt-1 text-sm font-semibold text-[var(--color-pearl)]">
                    {intents.length ? intents.map(humanize).join(", ") : "Open"}
                  </p>
                </div>
              </div>
              <Link href="/app/profile#discovery" className="mt-5 inline-flex text-sm font-bold text-[var(--color-gold-300)] transition hover:text-[var(--color-pearl)]">
                Adjust preferences →
              </Link>
            </section>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
