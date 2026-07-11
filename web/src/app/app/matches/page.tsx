import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/app/app-shell";
import type { UserMatchRow, UserProfileRow, ProfilePhoto, MatchMessageRow } from "@freeborn/shared";

export const dynamic = "force-dynamic";

export default async function MatchesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const selected = Array.isArray(params.m) ? params.m[0] : params.m;

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth?mode=sign-in");

  const { data: profile } = await supabase.from("user_profiles").select("*").eq("id", user.id).maybeSingle<UserProfileRow>();
  if (profile?.onboarding_stage === "account_created") redirect("/app/onboarding");

  const { data: matches } = await supabase
    .from("user_matches")
    .select("*")
    .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
    .eq("status", "active")
    .order("last_message_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  const matchRows = (matches as UserMatchRow[]) ?? [];
  const otherIds = matchRows.map(m => m.user_a === user.id ? m.user_b : m.user_a);
  const { data: others } = otherIds.length
    ? await supabase.from("user_profiles").select("*").in("id", otherIds)
    : { data: [] as UserProfileRow[] };
  const otherMap = new Map((others ?? []).map(o => [o.id, o]));

  const { data: photos } = otherIds.length
    ? await supabase.from("profile_photos").select("*").in("user_id", otherIds).eq("is_primary", true)
    : { data: [] as ProfilePhoto[] };
  const photoMap = new Map((photos ?? []).map(p => [p.user_id, p]));

  const activeMatch = selected ? matchRows.find(m => m.id === selected) ?? matchRows[0] : matchRows[0];
  const activeOtherId = activeMatch ? (activeMatch.user_a === user.id ? activeMatch.user_b : activeMatch.user_a) : null;
  const activeOther = activeOtherId ? otherMap.get(activeOtherId) : null;

  const { data: messages } = activeMatch
    ? await supabase.from("match_messages").select("*").eq("match_id", activeMatch.id).order("created_at", { ascending: true }).limit(120)
    : { data: [] as MatchMessageRow[] };

  return (
    <AppShell displayName={profile?.display_name}>
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-stone)]">Matches</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-[clamp(1.8rem,3.5vw,2.8rem)] text-[var(--color-pearl)]">
          Conversations with shared ground
        </h1>
      </div>

      <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
        {/* Match list */}
        <aside className="luminous-card max-h-[720px] overflow-auto rounded-2xl border border-white/8 bg-white/[0.035] p-4">
          {matchRows.length === 0 && (
            <div className="empty-glow flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 px-5 py-12 text-center">
              <div className="pulse-glow flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-violet-500)]/15 text-[var(--color-violet-300)]">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <p className="mt-4 text-sm font-semibold text-[var(--color-pearl)]">No matches yet.</p>
              <p className="mt-2 max-w-[240px] text-sm leading-6 text-[var(--color-mist)]">Keep reading profiles with care. The right conversation should feel grounded in values, not accidental.</p>
            </div>
          )}
          <div className="space-y-1.5">
            {matchRows.map(m => {
              const oid = m.user_a === user.id ? m.user_b : m.user_a;
              const o = otherMap.get(oid);
              const ph = photoMap.get(oid);
              const url = ph ? supabase.storage.from("profile-photos").getPublicUrl(ph.storage_path).data.publicUrl : null;
              const active = activeMatch?.id === m.id;
              return (
                <Link
                  key={m.id}
                  href={`/app/matches?m=${m.id}`}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 transition-all ${
                    active ? "bg-[var(--gradient-ember-warm)] text-white shadow-[0_16px_34px_-22px_rgba(239,94,94,0.9)]" : "text-[var(--color-pearl)] hover:bg-white/[0.055] hover:translate-x-1"
                  }`}
                >
                  <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-rose-400/20 to-sky-400/10">
                    {url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={url} className="h-full w-full object-cover" alt="" />
                    ) : (
                      <span className="text-xs font-bold text-[var(--color-stone)]">
                        {(o?.display_name ?? "F").slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[var(--color-pearl)]">{o?.display_name ?? "Freeborn member"}</p>
                    <p className="truncate text-xs text-[var(--color-mist)]">
                      {o?.city ?? "Nearby"}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </aside>

        {/* Chat */}
        <section className="luminous-card flex min-h-[520px] flex-col rounded-2xl border border-white/8 bg-white/[0.035]">
          {!activeMatch ? (
            <div className="flex flex-1 items-center justify-center p-10 text-center text-[var(--color-mist)]">
              <div className="empty-glow rounded-3xl border border-dashed border-white/10 px-8 py-10">
                <div className="pulse-glow mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-gold-500)]/15 text-[var(--color-gold-300)]">
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                </div>
                <p className="mt-4 text-sm font-semibold text-[var(--color-pearl)]">Choose a match when you are ready.</p>
                <p className="mt-2 max-w-sm text-sm leading-6 text-[var(--color-mist)]">Conversations on Freeborn start best when they begin with something you actually noticed — values, lifestyle, or long-term direction.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 border-b border-white/8 px-5 py-4">
                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-rose-400/20 to-sky-400/10">
                  {(() => {
                    const ph = photoMap.get(activeOtherId!);
                    const url = ph ? supabase.storage.from("profile-photos").getPublicUrl(ph.storage_path).data.publicUrl : null;
                    return url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={url} className="h-full w-full object-cover" alt="" />
                    ) : (
                      <span className="text-xs font-bold text-[var(--color-stone)]">
                        {(activeOther?.display_name ?? "F").slice(0, 2).toUpperCase()}
                      </span>
                    );
                  })()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--color-pearl)]">{activeOther?.display_name ?? "Freeborn member"}</p>
                  <p className="text-xs text-[var(--color-mist)]">{activeOther?.city ?? "Nearby"}</p>
                </div>
              </div>

              <div className="flex-1 space-y-3 overflow-auto px-5 py-5">
                {(messages ?? []).map(msg => {
                  const mine = msg.sender_id === user.id;
                  return (
                    <div key={msg.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                        mine
                          ? "bg-[var(--gradient-ember-warm)] text-white shadow-[0_16px_34px_-22px_rgba(239,94,94,0.9)]"
                          : "border border-white/8 bg-white/[0.06] text-[var(--color-pearl)] shadow-[0_12px_30px_-24px_rgba(0,0,0,0.8)]"
                      }`}>
                        {msg.body}
                        <div className={`mt-1 text-[10px] ${mine ? "text-white/70" : "text-[var(--color-stone)]"}`}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {!(messages ?? []).length && (
                  <div className="empty-glow flex items-center justify-center rounded-2xl border border-dashed border-white/10 px-5 py-12 text-center text-sm text-[var(--color-mist)]">
                    <span>Start with a detail from their profile — a shared value, wellness rhythm, or thoughtful first question beats a generic hello.</span>
                  </div>
                )}
              </div>

              <form
                action={async (fd: FormData) => {
                  "use server";
                  const { sendMessage } = await import("@/lib/discover/actions");
                  await sendMessage(null, fd);
                }}
                className="border-t border-white/8 px-5 py-4"
              >
                <input type="hidden" name="match_id" value={activeMatch.id} />
                <div className="flex gap-3">
                  <input
                    name="body"
                    placeholder={`Message ${activeOther?.display_name?.split(" ")[0] ?? "them"}…`}
                    className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-[var(--color-pearl)] outline-none placeholder:text-[var(--color-mist)] focus:border-white/20 transition"
                    maxLength={2000}
                    required
                  />
                  <button className="magic-button rounded-xl bg-[var(--color-pearl)] px-5 py-3 text-sm font-bold text-[var(--color-ink)] transition hover:bg-white hover:translate-y-[-1px]">
                    Send
                  </button>
                </div>
              </form>
            </>
          )}
        </section>
      </div>
    </AppShell>
  );
}
