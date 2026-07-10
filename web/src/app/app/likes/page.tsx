import { redirect } from "next/navigation";
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

  // who liked me
  const { data: incoming } = await supabase
    .from("user_swipes")
    .select("liker_id, created_at, action")
    .eq("liked_id", user.id)
    .in("action", ["like","superlike"])
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

  // my outgoing likes
  const { data: outgoing } = await supabase
    .from("user_swipes")
    .select("liked_id, created_at, action")
    .eq("liker_id", user.id)
    .in("action", ["like","superlike"])
    .order("created_at", { ascending: false })
    .limit(48);

  return (
    <AppShell displayName={profile?.display_name}>
      <div className="mb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-stone)]">Likes</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-[clamp(2.1rem,4vw,3rem)] text-[var(--color-pearl)]">
          Who’s interested
        </h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="glass-panel premium-border rounded-[32px] p-6 sm:p-7">
          <h2 className="text-lg font-semibold text-[var(--color-pearl)]">Liked you</h2>
          <p className="mt-1 text-sm text-[var(--color-mist)]">{incoming?.length ?? 0} recent admirers</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {(incoming ?? []).map((s) => {
              const p = likerMap.get(s.liker_id);
              const ph = photoMap.get(s.liker_id);
              const url = ph ? supabase.storage.from("profile-photos").getPublicUrl(ph.storage_path).data.publicUrl : null;
              return (
                <article key={s.liker_id} className="rounded-[24px] border border-white/10 bg-white/[0.045] p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl overflow-hidden bg-white/8 border border-white/10">
                      {url ? <img src={url} alt="" className="h-full w-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[11px] text-[var(--color-stone)]">FB</div>}
                    </div>
                    <div>
                      <p className="font-semibold text-[var(--color-pearl)]">{p?.display_name ?? "Freeborn member"}</p>
                      <p className="text-xs text-[var(--color-mist)]">{p?.city ?? "Nearby"} • {s.action}</p>
                    </div>
                  </div>
                  <form action="/app" method="get" className="mt-3">
                    <button className="w-full rounded-xl bg-[var(--color-pearl)] py-2 text-xs font-bold text-[var(--color-ink)]">View in Discover</button>
                  </form>
                </article>
              );
            })}
            {!(incoming ?? []).length && (
              <p className="text-sm text-[var(--color-mist)]">No likes yet — your profile is visible and discoverable.</p>
            )}
          </div>
        </section>

        <section className="glass-panel premium-border rounded-[32px] p-6 sm:p-7">
          <h2 className="text-lg font-semibold text-[var(--color-pearl)]">You liked</h2>
          <p className="mt-1 text-sm text-[var(--color-mist)]">{outgoing?.length ?? 0} people</p>
          <ul className="mt-5 space-y-3 text-sm text-[var(--color-pearl)]/90">
            {(outgoing ?? []).slice(0,12).map(o => (
              <li key={o.liked_id} className="flex items-center justify-between border-b border-white/8 pb-3">
                <span className="font-mono text-xs opacity-70">{o.liked_id.slice(0,8)}…</span>
                <span className="text-[var(--color-mist)]">{new Date(o.created_at).toLocaleDateString()} · {o.action}</span>
              </li>
            ))}
            {!(outgoing ?? []).length && <li className="text-[var(--color-mist)]">Start liking profiles in Discover.</li>}
          </ul>
        </section>
      </div>
    </AppShell>
  );
}
