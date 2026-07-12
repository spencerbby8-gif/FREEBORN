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
      ? "border-[var(--color-teal-500)]/20 bg-[var(--color-teal-500)]/5 text-[var(--color-teal-300)] shadow-[0_0_12px_rgba(79,184,167,0.15)]"
      : tone === "gold"
        ? "border-[var(--color-gold-500)]/20 bg-[var(--color-gold-500)]/5 text-[var(--color-gold-300)] shadow-[0_0_12px_rgba(217,167,82,0.15)]"
        : "border-white/10 bg-white/[0.03] text-[var(--color-ash)]";

  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[10px] font-bold uppercase tracking-[0.25em] ${className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${tone === "success" ? "bg-[var(--color-teal-500)] shadow-[0_0_8px_var(--color-teal-500)]" : tone === "gold" ? "bg-[var(--color-gold-500)] shadow-[0_0_8px_var(--color-gold-500)]" : "bg-[var(--color-ash)]"}`} />
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
      <div className="mx-auto w-full max-w-[1200px]">
        <header className="mb-10 flex flex-col gap-6 lg:mb-12 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.25em] text-[var(--color-sand)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-ember-500)] shadow-[0_0_10px_rgba(239,94,94,0.6)]" />
              Your Curated Room
            </div>
            <h1 
              className="text-[clamp(2.5rem,6vw,4rem)] leading-[0.95] tracking-tight text-[var(--color-pearl)]"
              style={{ fontFamily: "var(--font-display)", fontVariationSettings: "'opsz' 144, 'wght' 450" }}
            >
              {firstName ? `Welcome, ${firstName}.` : "Date with Autonomy."}
            </h1>
            <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-[var(--color-mist)]">
              Read values first. Choose with care. Every profile here respects health autonomy and long-term intention.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <StatusPill tone={profile.discoverable ? "success" : "muted"}>
              {profile.discoverable ? "Discoverable" : "Hidden"}
            </StatusPill>
            <StatusPill tone={profile.is_verified ? "success" : "gold"}>
              {profile.is_verified ? "Verified" : "Pending"}
            </StatusPill>
          </div>
        </header>

        <div className="grid gap-10 xl:grid-cols-[1fr_380px] xl:items-start">
          <main className="animate-fade-in">
            <DiscoverClient
              initialCandidates={candidates}
              photosByUser={Object.fromEntries(photosByUser)}
              emptyState={!candidates.length}
            />
          </main>

          <aside className="space-y-6 xl:sticky xl:top-8 animate-fade-in delay-2">
            <section className="luminous-card rounded-[32px] border border-white/5 bg-white/[0.02] p-8 shadow-[var(--shadow-raised)]">
              <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[var(--color-ash)]">Community Pulse</p>
              
              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="group rounded-[24px] border border-white/5 bg-white/[0.03] p-5 transition-all hover:bg-white/[0.05]">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--color-ash)] group-hover:text-[var(--color-ember-300)] transition-colors">Matches</p>
                  <p className="mt-2 font-[family-name:var(--font-display)] text-4xl font-black text-[var(--color-pearl)]">{matchesCount ?? 0}</p>
                </div>
                <div className="group rounded-[24px] border border-white/5 bg-white/[0.03] p-5 transition-all hover:bg-white/[0.05]">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--color-ash)] group-hover:text-[var(--color-gold-300)] transition-colors">Likes</p>
                  <p className="mt-2 font-[family-name:var(--font-display)] text-4xl font-black text-[var(--color-pearl)]">{likesCount ?? 0}</p>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-teal-500)] shadow-[0_0_8px_rgba(79,184,167,0.6)]" />
                  <p className="text-[13px] font-medium leading-relaxed text-[var(--color-mist)]">
                    Emails and private health history are always hidden.
                  </p>
                </div>
              </div>
            </section>

            <section className="luminous-card rounded-[32px] border border-white/5 bg-white/[0.02] p-8 shadow-[var(--shadow-raised)]">
              <div className="flex items-center justify-between gap-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[var(--color-ash)]">Profile Health</p>
                <span className="text-[20px] font-bold text-[var(--color-pearl)]">{strength}%</span>
              </div>
              
              <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-[var(--color-ember-500)] via-[var(--color-gold-500)] to-[var(--color-violet-500)] transition-all duration-1000" 
                  style={{ width: `${strength}%` }} 
                />
              </div>

              <div className="mt-8 space-y-4">
                <div className="flex items-center justify-between text-[13px] font-bold">
                  <span className="text-[var(--color-sand)]">Visual Context</span>
                  <span className="text-[var(--color-pearl)]">{profile.photo_count}/6 photos</span>
                </div>
                <div className="flex items-center justify-between text-[13px] font-bold">
                  <span className="text-[var(--color-sand)]">Shared Values</span>
                  <span className="text-[var(--color-pearl)]">{profile.interests?.length ?? 0} tags</span>
                </div>
                <div className="flex items-center justify-between text-[13px] font-bold">
                  <span className="text-[var(--color-sand)]">Personal Bio</span>
                  <span className={profile.bio ? "text-[var(--color-teal-300)]" : "text-[var(--color-ash)]"}>
                    {profile.bio ? "Detailed" : "Missing"}
                  </span>
                </div>
              </div>

              <Link href="/app/profile" className="magic-button mt-10 flex h-[52px] w-full items-center justify-center rounded-2xl bg-[var(--color-pearl)] text-[14px] font-black uppercase tracking-widest text-[var(--color-ink)] transition-all hover:bg-white active:scale-95">
                Refine Profile
              </Link>
            </section>

            <section className="luminous-card rounded-[32px] border border-white/5 bg-white/[0.02] p-8 shadow-[var(--shadow-raised)]">
              <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[var(--color-ash)]">Active Boundaries</p>
              
              <div className="mt-8 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-ash)]">Age</p>
                  <p className="mt-1 text-[15px] font-bold text-[var(--color-pearl)]">{ageMin}–{ageMax}</p>
                </div>
                <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-ash)]">Distance</p>
                  <p className="mt-1 text-[15px] font-bold text-[var(--color-pearl)]">{distance} km</p>
                </div>
              </div>
              
              <div className="mt-6 space-y-5">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-ash)]">Preferred Intentions</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {intents.length ? intents.slice(0, 2).map((i) => (
                      <span key={i} className="rounded-full bg-white/5 px-2.5 py-1 text-[11px] font-bold text-[var(--color-sand)]">
                        {humanize(i)}
                      </span>
                    )) : <span className="text-[13px] font-medium text-[var(--color-mist)]">Open to all depth</span>}
                  </div>
                </div>
              </div>

              <Link href="/app/profile#discovery" className="mt-8 flex items-center justify-center gap-2 text-[13px] font-black uppercase tracking-widest text-[var(--color-gold-300)] transition-all hover:text-[var(--color-pearl)] group">
                Adjust Preferences
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </section>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
