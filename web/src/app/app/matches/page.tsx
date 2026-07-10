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
      <div className="mb-5 flex items-end justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-stone)]">Matches</p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-[clamp(2rem,4vw,3rem)] text-[var(--color-pearl)]">
            Conversations that matter
          </h1>
        </div>
        <p className="text-sm text-[var(--color-mist)]">{matchRows.length} active</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
        <aside className="glass-panel premium-border rounded-[28px] p-4 max-h-[760px] overflow-auto">
          {matchRows.length === 0 && (
            <p className="p-3 text-sm text-[var(--color-mist)]">No matches yet — keep discovering thoughtful profiles.</p>
          )}
          <div className="space-y-2">
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
                  className={`flex items-center gap-3 rounded-[20px] px-3 py-3 transition ${active ? "bg-white text-[var(--color-ink)]" : "hover:bg-white/6 text-[var(--color-pearl)]"}`}
                >
                  <div className="h-12 w-12 overflow-hidden rounded-2xl bg-white/8 border border-white/12">
                    {url ? <img src={url} className="h-full w-full object-cover" alt="" /> : <div className="flex h-full w-full items-center justify-center text-[11px] font-bold">{(o?.display_name ?? "F").slice(0,1)}</div>}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`truncate text-sm font-semibold ${active ? "" : ""}`}>{o?.display_name ?? "Freeborn member"}</p>
                    <p className={`truncate text-xs ${active ? "text-[rgba(11,19,32,0.62)]" : "text-[var(--color-mist)]"}`}>
                      {o?.city ?? "Nearby"} • matched {new Date(m.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </aside>

        <section className="glass-panel premium-border rounded-[32px] flex min-h-[520px] flex-col">
          {!activeMatch ? (
            <div className="flex flex-1 items-center justify-center p-10 text-center text-[var(--color-mist)]">
              Select a match to start a thoughtful conversation.
            </div>
          ) : (
            <>
              <div className="border-b border-white/10 px-5 py-4 sm:px-7">
                <p className="text-sm text-[var(--color-mist)]">Matched with</p>
                <p className="text-xl font-semibold text-[var(--color-pearl)]">{activeOther?.display_name ?? "Freeborn member"}</p>
              </div>
              <div className="flex-1 space-y-3 overflow-auto px-5 py-5 sm:px-7">
                {(messages ?? []).map(msg => {
                  const mine = msg.sender_id === user.id;
                  return (
                    <div key={msg.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[72%] rounded-[22px] px-4 py-3 text-sm leading-6 ${mine ? "bg-[var(--color-pearl)] text-[var(--color-ink)]" : "bg-white/[0.07] text-[var(--color-pearl)] border border-white/10"}`}>
                        {msg.body}
                        <div className={`mt-1 text-[10px] ${mine ? "text-[rgba(11,19,32,0.55)]" : "text-[var(--color-stone)]"}`}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {!(messages ?? []).length && (
                  <div className="text-center text-sm text-[var(--color-mist)] py-10">
                    Say hello — thoughtful first messages get thoughtful replies.
                  </div>
                )}
              </div>
              <form action={async (fd: FormData) => {
                "use server";
                const { sendMessage } = await import("@/lib/discover/actions");
                await sendMessage(null, fd);
              }} className="border-t border-white/10 px-5 py-4 sm:px-7">
                <input type="hidden" name="match_id" value={activeMatch.id} />
                <div className="flex gap-3">
                  <input
                    name="body"
                    placeholder={`Message ${activeOther?.display_name?.split(" ")[0] ?? "them"}…`}
                    className="flex-1 rounded-[18px] border border-white/14 bg-white/[0.05] px-4 py-3 text-sm text-[var(--color-pearl)] outline-none placeholder:text-[var(--color-mist)]"
                    maxLength={2000}
                    required
                  />
                  <button className="rounded-[18px] bg-[var(--color-pearl)] px-5 py-3 text-sm font-bold text-[var(--color-ink)]">Send</button>
                </div>
              </form>
            </>
          )}
        </section>
      </div>
    </AppShell>
  );
}
