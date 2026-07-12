import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import type { DiscoveryCandidate, DiscoveryPreferencesRow, ProfilePhoto, UserProfileRow } from "@freeborn/shared";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/app/app-shell";
import { DiscoverClient } from "@/components/app/discover-client";
import { humanize, profileStrength } from "@/components/app/profile-utils";
import { LockIcon, ShieldIcon, SparkIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

function StatusChip({ children, tone = "neutral" }: { children: ReactNode; tone?: "gold" | "teal" | "neutral" }) {
  const cls = tone === "teal"
    ? "border-[var(--color-teal-500)]/25 bg-[var(--color-teal-500)]/8 text-[var(--color-teal-300)]"
    : tone === "gold"
      ? "border-[var(--color-gold-500)]/25 bg-[var(--color-gold-500)]/8 text-[var(--color-gold-300)]"
      : "border-white/10 bg-white/[0.035] text-[var(--color-mist)]";
  return <span className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-[10px] font-black uppercase tracking-[0.2em] ${cls}`}><span className="h-1.5 w-1.5 rounded-full bg-current shadow-[0_0_8px_currentColor]" />{children}</span>;
}

export default async function DiscoverPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth?mode=sign-in");

  const { data: profile } = await supabase.from("user_profiles").select("*").eq("id", user.id).maybeSingle<UserProfileRow>();
  if (!profile) redirect("/auth?mode=sign-in");
  if (profile.onboarding_stage === "account_created") redirect("/app/onboarding");

  await supabase.from("discovery_preferences").upsert({ user_id: user.id }, { onConflict: "user_id", ignoreDuplicates: true });

  const { data: myPhotos } = await supabase.from("profile_photos").select("*").eq("user_id", user.id).order("position", { ascending: true });
  const typedMyPhotos = (myPhotos as ProfilePhoto[] | null) ?? [];
  const primaryPhoto = typedMyPhotos.find((photo) => photo.is_primary) ?? typedMyPhotos[0];
  const photoUrl = primaryPhoto ? supabase.storage.from("profile-photos").getPublicUrl(primaryPhoto.storage_path).data.publicUrl : null;

  const { data: candidatesRaw } = await supabase.rpc("discover_candidates", { p_user: user.id, p_limit: 24, p_offset: 0 });
  const candidatesBase = (candidatesRaw as DiscoveryCandidate[]) ?? [];
  const candidateIds = candidatesBase.map((candidate) => candidate.id);

  const photosByUser = new Map<string, ProfilePhoto[]>();
  if (candidateIds.length) {
    const { data: photos } = await supabase.from("profile_photos").select("*").in("user_id", candidateIds).order("position", { ascending: true });
    (photos as ProfilePhoto[] | null)?.forEach((photo) => {
      const grouped = photosByUser.get(photo.user_id) ?? [];
      grouped.push(photo);
      photosByUser.set(photo.user_id, grouped);
    });
  }

  let candidates = candidatesBase;
  if (candidateIds.length) {
    const { data: extras } = await supabase
      .from("user_profiles")
      .select("id, values, prompt_answers")
      .in("id", candidateIds);
    const extrasById = new Map((extras as Array<{ id: string; values: string[]; prompt_answers: unknown }> | null)?.map((row) => [row.id, row]) ?? []);
    candidates = candidatesBase.map((candidate) => ({
      ...candidate,
      values: extrasById.get(candidate.id)?.values ?? [],
      prompt_answers: Array.isArray(extrasById.get(candidate.id)?.prompt_answers) ? extrasById.get(candidate.id)?.prompt_answers as DiscoveryCandidate["prompt_answers"] : [],
    }));
  }

  const { count: likesCount } = await supabase.from("user_swipes").select("*", { count: "exact", head: true }).eq("liked_id", user.id).eq("action", "like");
  const { count: matchesCount } = await supabase.from("user_matches").select("*", { count: "exact", head: true }).or(`user_a.eq.${user.id},user_b.eq.${user.id}`).eq("status", "active");
  const { data: prefs } = await supabase.from("discovery_preferences").select("*").eq("user_id", user.id).maybeSingle<DiscoveryPreferencesRow>();

  const firstName = profile.display_name?.split(" ")[0];
  const strength = profileStrength(profile, typedMyPhotos);
  const ageMin = prefs?.age_min ?? profile.age_min_preference;
  const ageMax = prefs?.age_max ?? profile.age_max_preference;
  const distance = prefs?.distance_km ?? profile.max_distance_km;
  const intents = prefs?.relationship_intents ?? profile.relationship_goals ?? [];

  return (
    <AppShell displayName={profile.display_name} photoUrl={photoUrl}>
      <div className="mx-auto w-full max-w-[1280px] space-y-6">
        <header className="relative overflow-hidden rounded-[38px] border border-white/10 bg-[radial-gradient(circle_at_15%_0%,rgba(239,94,94,0.14),transparent_35%),rgba(255,255,255,0.025)] p-5 shadow-[var(--shadow-raised)] sm:p-7 lg:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[11px] font-black uppercase tracking-[0.24em] text-[var(--color-sand)]">
                <SparkIcon size={14} /> Discover
              </div>
              <h1 className="mt-4 font-[family-name:var(--font-display)] text-[clamp(2.4rem,5vw,4.4rem)] leading-[0.9] tracking-[-0.06em] text-[var(--color-pearl)]">
                {firstName ? `${firstName}, meet one person at a time.` : "Meet one person at a time."}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--color-mist)] sm:text-base">
                A focused room for health autonomy, natural living, values alignment, and long-term intention — without turning discovery into noise.
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <StatusChip tone={profile.discoverable ? "teal" : "neutral"}>{profile.discoverable ? "Visible" : "Hidden"}</StatusChip>
              <StatusChip tone={profile.is_verified ? "teal" : "gold"}>{profile.is_verified ? "Verified" : "Not verified yet"}</StatusChip>
              <StatusChip tone="gold">{candidates.length} loaded</StatusChip>
            </div>
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
          <main className="min-w-0 step-in">
            <DiscoverClient initialCandidates={candidates} photosByUser={Object.fromEntries(photosByUser)} emptyState={!candidates.length} />
          </main>

          <aside className="space-y-5 xl:sticky xl:top-8">
            <section className="rounded-[34px] border border-white/10 bg-white/[0.025] p-5 shadow-[var(--shadow-raised)] backdrop-blur-xl">
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[var(--color-sand)]">Tonight&rsquo;s room</p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-4"><p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-ash)]">Matches</p><p className="mt-1 font-[family-name:var(--font-display)] text-4xl text-[var(--color-pearl)]">{matchesCount ?? 0}</p></div>
                <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-4"><p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-ash)]">Likes</p><p className="mt-1 font-[family-name:var(--font-display)] text-4xl text-[var(--color-pearl)]">{likesCount ?? 0}</p></div>
              </div>
              <div className="mt-5 rounded-2xl border border-[var(--color-teal-500)]/15 bg-[var(--color-teal-500)]/5 p-4 text-sm leading-6 text-[var(--color-mist)]"><LockIcon size={16} className="mb-2 text-[var(--color-teal-300)]" />Private essentials stay hidden: email, full birth date, provider details, and exact coordinates.</div>
            </section>

            <section className="rounded-[34px] border border-white/10 bg-white/[0.025] p-5 shadow-[var(--shadow-raised)] backdrop-blur-xl">
              <div className="flex items-center justify-between"><p className="text-[11px] font-black uppercase tracking-[0.24em] text-[var(--color-sand)]">Profile health</p><span className="text-xl font-black text-[var(--color-pearl)]">{strength}%</span></div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/8"><div className="h-full rounded-full bg-gradient-to-r from-[var(--color-ember-500)] via-[var(--color-gold-500)] to-[var(--color-teal-500)]" style={{ width: `${strength}%` }} /></div>
              <Link href="/app/profile" className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-2xl bg-[var(--color-pearl)] text-sm font-black text-[var(--color-ink)] transition hover:bg-white">Improve profile</Link>
            </section>

            <section className="rounded-[34px] border border-white/10 bg-white/[0.025] p-5 shadow-[var(--shadow-raised)] backdrop-blur-xl">
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[var(--color-sand)]">Polished filters</p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-4"><p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-ash)]">Age</p><p className="mt-1 text-sm font-black text-[var(--color-pearl)]">{ageMin}–{ageMax}</p></div>
                <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-4"><p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-ash)]">Distance</p><p className="mt-1 text-sm font-black text-[var(--color-pearl)]">{distance} km</p></div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {intents.length ? intents.slice(0, 3).map((intent) => <span key={intent} className="rounded-full border border-white/8 bg-white/[0.035] px-3 py-1.5 text-xs font-bold text-[var(--color-sand)]">{humanize(intent)}</span>) : <span className="text-sm text-[var(--color-mist)]">Open to all long-term intentions</span>}
              </div>
              <Link href="/app/profile/privacy-visibility" className="mt-5 inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[var(--color-gold-300)] transition hover:text-[var(--color-pearl)]">Adjust filters <span>→</span></Link>
            </section>

            <section className="rounded-[34px] border border-white/10 bg-white/[0.025] p-5 shadow-[var(--shadow-raised)] backdrop-blur-xl">
              <div className="flex items-center gap-3 text-sm font-black text-[var(--color-pearl)]"><ShieldIcon size={18} className="text-[var(--color-gold-300)]" /> Read first, decide once</div>
              <p className="mt-2 text-sm leading-6 text-[var(--color-mist)]">Compatibility signals are summarized on the card, with full story available before you like, spark, or pass.</p>
            </section>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
