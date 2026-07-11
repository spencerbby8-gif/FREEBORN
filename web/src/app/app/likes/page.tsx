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
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-stone)]">Likes</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-[clamp(1.8rem,3.5vw,2.8rem)] text-[var(--color-pearl)]">
          Signals worth considering
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-mist)]">
          See who has raised a hand, then return to Discover when you are ready to read the full profile.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-white/8 bg-white/[0.03] p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[var(--color-pearl)]">Liked you</h2>
              <p className="mt-1 text-xs text-[var(--color-mist)]">People who noticed something specific enough to act.</p>
            </div>
            <span className="rounded-full bg-white/[0.04] px-3 py-1 text-xs font-semibold text-[var(--color-stone)]">
              {incoming?.length ?? 0}
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {(incoming ?? []).map((signal) => {
              const person = peopleMap.get(signal.liker_id);
              const url = photoUrl(signal.liker_id);
              return (
                <div key={signal.liker_id} className="rounded-xl border border-white/8 bg-white/[0.02] p-4 transition hover:bg-white/[0.04]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-rose-400/20 to-amber-400/10">
                      {url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={url} alt={person?.display_name ? `${person.display_name}'s profile photo` : "Profile photo"} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-xs font-bold text-[var(--color-stone)]">{initials(person?.display_name)}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[var(--color-pearl)]">{person?.display_name ?? "Freeborn member"}</p>
                      <p className="truncate text-xs text-[var(--color-mist)]">
                        {person?.city ?? "Nearby"}
                        {signal.action === "superlike" && <span className="ml-2 text-[var(--color-accent-blue)]">★ Spark</span>}
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/app"
                    className="mt-3 flex w-full items-center justify-center rounded-xl bg-[var(--color-pearl)] py-2.5 text-xs font-bold text-[var(--color-ink)] transition hover:bg-white"
                  >
                    Read profiles in Discover
                  </Link>
                </div>
              );
            })}
            {!(incoming ?? []).length && (
              <div className="col-span-2 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-5 py-8 text-center">
                <p className="text-sm font-semibold text-[var(--color-pearl)]">No likes yet.</p>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[var(--color-mist)]">
                  Add clear photos, a specific bio, and a few interests. Trustworthy profiles invite better attention.
                </p>
                <Link href="/app/profile" className="mt-4 inline-flex rounded-full border border-white/10 px-4 py-2 text-xs font-bold text-[var(--color-pearl)] hover:bg-white/[0.06]">
                  Strengthen profile
                </Link>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-white/8 bg-white/[0.03] p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[var(--color-pearl)]">You noticed</h2>
              <p className="mt-1 text-xs text-[var(--color-mist)]">A record of the profiles you chose with intention.</p>
            </div>
            <span className="rounded-full bg-white/[0.04] px-3 py-1 text-xs font-semibold text-[var(--color-stone)]">
              {outgoing?.length ?? 0}
            </span>
          </div>
          <div className="space-y-3">
            {(outgoing ?? []).slice(0, 12).map((signal) => {
              const person = peopleMap.get(signal.liked_id);
              const url = photoUrl(signal.liked_id);
              return (
                <div key={signal.liked_id} className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-rose-400/15 to-sky-400/10">
                      {url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-[11px] font-bold text-[var(--color-stone)]">{initials(person?.display_name)}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[var(--color-pearl)]">
                        {signal.action === "superlike" ? "★ " : ""}{person?.display_name ?? "Freeborn member"}
                      </p>
                      <p className="truncate text-xs text-[var(--color-mist)]">{person?.city ?? "Nearby"}</p>
                    </div>
                  </div>
                  <span className="flex-shrink-0 text-xs text-[var(--color-mist)]">
                    {new Date(signal.created_at).toLocaleDateString()}
                  </span>
                </div>
              );
            })}
            {!(outgoing ?? []).length && (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-5 py-8 text-center">
                <p className="text-sm font-semibold text-[var(--color-pearl)]">No outgoing likes yet.</p>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[var(--color-mist)]">
                  Start in Discover and look for the details you would actually ask about.
                </p>
                <Link href="/app" className="mt-4 inline-flex rounded-full bg-[var(--color-pearl)] px-4 py-2 text-xs font-bold text-[var(--color-ink)] hover:bg-white">
                  Go to Discover
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
