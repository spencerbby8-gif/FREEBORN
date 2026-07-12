import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/app/app-shell";
import type { ProfilePhoto, UserProfileRow } from "@freeborn/shared";

export const dynamic = "force-dynamic";

function initials(name?: string | null) {
  return (name ?? "FB").slice(0, 2).toUpperCase();
}

export default async function LikesPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth?mode=sign-in");

  const { data: profile } = await supabase.from("user_profiles").select("*").eq("id", user.id).maybeSingle<UserProfileRow>();
  if (profile?.onboarding_stage === "account_created") redirect("/app/onboarding");

  const { data: incoming } = await supabase
    .from("user_swipes")
    .select("liker_id, created_at, action")
    .eq("liked_id", user.id)
    .in("action", ["like", "superlike"])
    .order("created_at", { ascending: false })
    .limit(48);

  const { data: outgoing } = await supabase
    .from("user_swipes")
    .select("liked_id, created_at, action")
    .eq("liker_id", user.id)
    .in("action", ["like", "superlike"])
    .order("created_at", { ascending: false })
    .limit(48);

  const likerIds = (incoming ?? []).map((row) => row.liker_id);
  const likedIds = (outgoing ?? []).map((row) => row.liked_id);
  const allIds = Array.from(new Set([...likerIds, ...likedIds]));

  const { data: people } = allIds.length
    ? await supabase.from("user_profiles").select("*").in("id", allIds)
    : { data: [] as UserProfileRow[] };
  const peopleMap = new Map((people ?? []).map((person) => [person.id, person]));

  const { data: photos } = allIds.length
    ? await supabase.from("profile_photos").select("*").in("user_id", allIds).order("position")
    : { data: [] as ProfilePhoto[] };
  const photoMap = new Map<string, ProfilePhoto>();
  (photos ?? []).forEach((photo) => {
    if (!photoMap.has(photo.user_id) || photo.is_primary) photoMap.set(photo.user_id, photo);
  });

  const photoUrl = (personId: string) => {
    const photo = photoMap.get(personId);
    return photo ? supabase.storage.from("profile-photos").getPublicUrl(photo.storage_path).data.publicUrl : null;
  };

  return (
    <AppShell displayName={profile?.display_name}>
      <div className="mx-auto w-full max-w-[1200px]">
        <header className="mb-10 flex flex-col gap-6 lg:mb-12 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.25em] text-[var(--color-sand)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-ember-500)] shadow-[0_0_10px_rgba(239,94,94,0.6)]" />
              Community Signals
            </div>
            <h1 
              className="text-[clamp(2.5rem,6vw,4rem)] leading-[0.95] tracking-tight text-[var(--color-pearl)]"
              style={{ fontFamily: "var(--font-display)", fontVariationSettings: "'opsz' 144, 'wght' 450" }}
            >
              Raised Hands.
            </h1>
            <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-[var(--color-mist)]">
              See who has noticed your values and return to Discover when you are ready to read their full profile with care.
            </p>
          </div>
        </header>

        <div className="grid gap-10 lg:grid-cols-2">
          <section className="luminous-card rounded-[40px] border border-white/5 bg-white/[0.02] p-8 shadow-[var(--shadow-card-lg)]">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[var(--color-pearl)]">Liked You</h2>
                <p className="mt-2 text-[14px] font-medium text-[var(--color-ash)]">Members who noticed enough shared context to act.</p>
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 text-[14px] font-black text-[var(--color-sand)] ring-1 ring-white/10">
                {incoming?.length ?? 0}
              </span>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2">
              {(incoming ?? []).map((signal) => {
                const person = peopleMap.get(signal.liker_id);
                const url = photoUrl(signal.liker_id);
                return (
                  <div key={signal.liker_id} className="group relative flex flex-col rounded-[32px] border border-white/5 bg-white/[0.02] p-5 transition-all hover:bg-white/[0.04] hover:border-white/10">
                    <div className="flex items-center gap-4">
                      <div className="relative h-14 w-14 shrink-0">
                        <div className="h-full w-full overflow-hidden rounded-[20px] border border-white/10 bg-white/5 shadow-inner">
                          {url ? (
                            <img src={url} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-rose-500/20 to-amber-500/20 text-[12px] font-black text-white/40">
                              {initials(person?.display_name)}
                            </div>
                          )}
                        </div>
                        {signal.action === "superlike" && (
                          <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-lg bg-[var(--color-violet-500)] text-white shadow-lg ring-2 ring-[#10152a]">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z" /></svg>
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-[15px] font-bold text-[var(--color-pearl)]">{person?.display_name ?? "Freeborn Member"}</p>
                        <p className="truncate text-[12px] font-bold uppercase tracking-widest text-[var(--color-ash)]">
                          {person?.city ?? "Nearby"}
                        </p>
                      </div>
                    </div>
                    <Link
                      href="/app"
                      className="mt-5 flex h-11 items-center justify-center rounded-2xl bg-white/5 text-[11px] font-black uppercase tracking-widest text-[var(--color-sand)] transition-all hover:bg-white/[0.08] hover:text-[var(--color-pearl)] active:scale-95"
                    >
                      View Profile
                    </Link>
                  </div>
                );
              })}
              
              {!(incoming ?? []).length && (
                <div className="col-span-2 rounded-[32px] border-2 border-dashed border-white/5 bg-white/[0.01] p-12 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-2xl text-[var(--color-ash)]/40">＋</div>
                  <h3 className="mt-6 text-lg font-bold text-[var(--color-pearl)]">No likes yet.</h3>
                  <p className="mx-auto mt-2 max-w-[240px] text-[14px] font-medium leading-relaxed text-[var(--color-ash)]">
                    Profiles with clear photos and deep bio details invite better attention.
                  </p>
                  <Link href="/app/profile" className="mt-8 inline-flex h-11 items-center justify-center rounded-full border border-white/10 px-6 text-[12px] font-black uppercase tracking-widest text-[var(--color-sand)] transition-all hover:bg-white/5 hover:text-[var(--color-pearl)]">
                    Refine Profile
                  </Link>
                </div>
              )}
            </div>
          </section>

          <section className="luminous-card rounded-[40px] border border-white/5 bg-white/[0.02] p-8 shadow-[var(--shadow-card-lg)]">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[var(--color-pearl)]">Sent with Intent</h2>
                <p className="mt-2 text-[14px] font-medium text-[var(--color-ash)]">A record of the choices you made with care.</p>
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 text-[14px] font-black text-[var(--color-sand)] ring-1 ring-white/10">
                {outgoing?.length ?? 0}
              </span>
            </div>

            <div className="space-y-3">
              {(outgoing ?? []).slice(0, 12).map((signal) => {
                const person = peopleMap.get(signal.liked_id);
                const url = photoUrl(signal.liked_id);
                return (
                  <div key={signal.liked_id} className="group flex items-center justify-between gap-4 rounded-[24px] border border-white/5 bg-white/[0.01] p-4 transition-all hover:bg-white/[0.03]">
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-[16px] border border-white/10 bg-white/5 shadow-inner">
                        {url ? (
                          <img src={url} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-rose-500/10 to-amber-500/10 text-[10px] font-black text-white/30">
                            {initials(person?.display_name)}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-[15px] font-bold text-[var(--color-pearl)]">
                          {signal.action === "superlike" ? "★ " : ""}{person?.display_name ?? "Freeborn Member"}
                        </p>
                        <p className="truncate text-[11px] font-bold uppercase tracking-widest text-[var(--color-ash)]">{person?.city ?? "Nearby"}</p>
                      </div>
                    </div>
                    <span className="flex-shrink-0 text-[11px] font-bold uppercase tracking-widest text-[var(--color-ash)]/60 group-hover:text-[var(--color-ash)] transition-colors">
                      {new Date(signal.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                );
              })}
              
              {!(outgoing ?? []).length && (
                <div className="rounded-[32px] border-2 border-dashed border-white/5 bg-white/[0.01] p-12 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-2xl text-[var(--color-ash)]/40">♥</div>
                  <h3 className="mt-6 text-lg font-bold text-[var(--color-pearl)]">Discovery is waiting.</h3>
                  <p className="mx-auto mt-2 max-w-[240px] text-[14px] font-medium leading-relaxed text-[var(--color-ash)]">
                    Look for values and daily rituals you would actually ask about.
                  </p>
                  <Link href="/app" className="mt-8 inline-flex h-11 items-center justify-center rounded-full bg-[var(--color-pearl)] px-6 text-[12px] font-black uppercase tracking-widest text-[var(--color-ink)] transition-all hover:bg-white active:scale-95">
                    Start Discovering
                  </Link>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
    </AppShell>
  );
}
