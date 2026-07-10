import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/app/app-shell";
import type { ProfilePhoto, UserProfileRow } from "@freeborn/shared";

export const dynamic = "force-dynamic";

export default async function LikesPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth?mode=sign-in");

  const { data: profile } = await supabase.from("user_profiles").select("*").eq("id", user.id).maybeSingle<UserProfileRow>();
  if (profile?.onboarding_stage === "account_created") redirect("/app/onboarding");

  // Who liked me
  const { data: incoming } = await supabase
    .from("user_swipes")
    .select("liker_id, created_at, action")
    .eq("liked_id", user.id)
    .in("action", ["like", "superlike"])
    .order("created_at", { ascending: false })
    .limit(48);

  const likerIds = (incoming ?? []).map(r => r.liker_id);
  const { data: likers } = likerIds.length
    ? await supabase.from("user_profiles").select("*").in("id", likerIds)
    : { data: [] as UserProfileRow[] };
  const likerMap = new Map((likers ?? []).map(p => [p.id, p]));

  const { data: photos } = likerIds.length
    ? await supabase.from("profile_photos").select("*").in("user_id", likerIds).order("position")
    : { data: [] as ProfilePhoto[] };
  const photoMap = new Map<string, ProfilePhoto>();
  (photos ?? []).forEach(p => { if (!photoMap.has(p.user_id)) photoMap.set(p.user_id, p); });

  // My outgoing likes
  const { data: outgoing } = await supabase
    .from("user_swipes")
    .select("liked_id, created_at, action")
    .eq("liker_id", user.id)
    .in("action", ["like", "superlike"])
    .order("created_at", { ascending: false })
    .limit(48);

  return (
    <AppShell displayName={profile?.display_name}>
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-stone)]">Likes</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-[clamp(1.8rem,3.5vw,2.8rem)] text-[var(--color-pearl)]">
          Who&apos;s interested
        </h1>
        <p className="mt-2 text-sm text-[var(--color-mist)]">
          {incoming?.length ?? 0} people have liked your profile
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Incoming likes */}
        <section className="rounded-2xl border border-white/8 bg-white/[0.03] p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-[var(--color-pearl)]">Liked you</h2>
            <span className="rounded-full bg-white/[0.04] px-3 py-1 text-xs font-semibold text-[var(--color-stone)]">
              {incoming?.length ?? 0}
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {(incoming ?? []).map((s) => {
              const p = likerMap.get(s.liker_id);
              const ph = photoMap.get(s.liker_id);
              const url = ph ? supabase.storage.from("profile-photos").getPublicUrl(ph.storage_path).data.publicUrl : null;
              return (
                <div key={s.liker_id} className="rounded-xl border border-white/8 bg-white/[0.02] p-4 transition hover:bg-white/[0.04]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-rose-400/20 to-amber-400/10">
                      {url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-xs font-bold text-[var(--color-stone)]">
                          {(p?.display_name ?? "FB").slice(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-pearl)]">{p?.display_name ?? "Freeborn member"}</p>
                      <p className="text-xs text-[var(--color-mist)]">
                        {p?.city ?? "Nearby"}
                        {s.action === "superlike" && <span className="ml-2 text-[var(--color-accent-blue)]">★ Super</span>}
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/app"
                    className="mt-3 flex w-full items-center justify-center rounded-xl bg-[var(--color-pearl)] py-2.5 text-xs font-bold text-[var(--color-ink)] transition hover:bg-white"
                  >
                    View in Discover
                  </Link>
                </div>
              );
            })}
            {!(incoming ?? []).length && (
              <p className="col-span-2 text-sm text-[var(--color-mist)] py-8 text-center">
                No likes yet — your profile is visible and discoverable.
              </p>
            )}
          </div>
        </section>

        {/* Outgoing likes */}
        <section className="rounded-2xl border border-white/8 bg-white/[0.03] p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-[var(--color-pearl)]">You liked</h2>
            <span className="rounded-full bg-white/[0.04] px-3 py-1 text-xs font-semibold text-[var(--color-stone)]">
              {outgoing?.length ?? 0}
            </span>
          </div>
          <div className="space-y-3">
            {(outgoing ?? []).slice(0, 12).map((o) => (
              <div key={o.liked_id} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
                <span className="text-sm font-semibold text-[var(--color-pearl)]">
                  {o.action === "superlike" ? "★ " : ""}Profile liked
                </span>
                <span className="text-xs text-[var(--color-mist)]">
                  {new Date(o.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
            {!(outgoing ?? []).length && (
              <p className="text-sm text-[var(--color-mist)] py-8 text-center">
                Start liking profiles in Discover.
              </p>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
