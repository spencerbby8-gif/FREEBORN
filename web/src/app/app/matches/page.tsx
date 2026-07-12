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
      <div className="mx-auto w-full max-w-[1200px]">
        <header className="mb-10 flex flex-col gap-6 lg:mb-12 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.25em] text-[var(--color-sand)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-gold-500)] shadow-[0_0_10px_rgba(217,167,82,0.6)]" />
              Shared Ground
            </div>
            <h1 
              className="text-[clamp(2.5rem,6vw,4rem)] leading-[0.95] tracking-tight text-[var(--color-pearl)]"
              style={{ fontFamily: "var(--font-display)", fontVariationSettings: "'opsz' 144, 'wght' 450" }}
            >
              Conversations.
            </h1>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          {/* Match List */}
          <aside className="luminous-card flex h-[calc(100vh-280px)] min-h-[500px] flex-col overflow-hidden rounded-[40px] border border-white/5 bg-white/[0.015] shadow-[var(--shadow-raised)]">
            <div className="border-b border-white/5 p-6">
              <h2 className="text-[13px] font-black uppercase tracking-widest text-[var(--color-ash)]">Active Matches</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
              {matchRows.length === 0 && (
                <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-[var(--color-ash)]/40">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  </div>
                  <p className="text-[15px] font-bold text-[var(--color-pearl)]">No conversations yet.</p>
                  <p className="mt-2 text-[13px] font-medium leading-relaxed text-[var(--color-ash)]">Read profiles with care in Discover to find alignment.</p>
                </div>
              )}
              
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
                    className={`group flex items-center gap-4 rounded-[24px] p-4 transition-all duration-300 ${
                      active 
                        ? "bg-[var(--gradient-ember-warm)] text-white shadow-[0_12px_24px_-10px_rgba(239,94,94,0.6)]" 
                        : "hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="relative h-14 w-14 shrink-0">
                      <div className={`h-full w-full overflow-hidden rounded-[20px] border-2 transition-all duration-500 ${active ? "border-white/20 shadow-lg" : "border-white/5 bg-white/5"}`}>
                        {url ? (
                          <img src={url} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-rose-500/10 to-amber-500/10 text-[12px] font-black">
                            {(o?.display_name ?? "F").slice(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`truncate text-[15px] font-bold ${active ? "text-white" : "text-[var(--color-pearl)]"}`}>{o?.display_name ?? "Member"}</p>
                      <p className={`truncate text-[12px] font-bold uppercase tracking-widest ${active ? "text-white/70" : "text-[var(--color-ash)]"}`}>
                        {o?.city ?? "Nearby"}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </aside>

          {/* Chat Area */}
          <section className="luminous-card flex h-[calc(100vh-280px)] min-h-[500px] flex-col overflow-hidden rounded-[40px] border border-white/5 bg-white/[0.015] shadow-[var(--shadow-raised)]">
            {!activeMatch ? (
              <div className="flex flex-1 flex-col items-center justify-center p-12 text-center">
                <div className="pulse-glow mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-[var(--color-gold-500)]/10 text-[var(--color-gold-300)] shadow-[0_0_50px_-10px_rgba(217,167,82,0.3)]">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                </div>
                <h2 className="text-2xl font-bold text-[var(--color-pearl)]">Select a Conversation</h2>
                <p className="mt-4 max-w-sm text-[16px] font-medium leading-relaxed text-[var(--color-mist)]">
                  Freeborn conversations start best when they begin with a specific detail you noticed — values, lifestyle, or intentions.
                </p>
              </div>
            ) : (
              <>
                <header className="flex items-center gap-5 border-b border-white/5 px-8 py-5 bg-white/[0.01]">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-[18px] border border-white/10 bg-white/5 shadow-inner">
                    {(() => {
                      const ph = photoMap.get(activeOtherId!);
                      const url = ph ? supabase.storage.from("profile-photos").getPublicUrl(ph.storage_path).data.publicUrl : null;
                      return url ? (
                        <img src={url} className="h-full w-full object-cover" alt="" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-rose-500/10 to-amber-500/10 text-[10px] font-black text-white/40">
                          {(activeOther?.display_name ?? "F").slice(0, 2).toUpperCase()}
                        </div>
                      );
                    })()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[17px] font-bold text-[var(--color-pearl)]">{activeOther?.display_name ?? "Member"}</p>
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--color-ash)]">{activeOther?.city ?? "Nearby"}</p>
                  </div>
                </header>

                <div className="flex-1 space-y-6 overflow-y-auto px-8 py-8 custom-scrollbar bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.01),transparent)]">
                  {(messages ?? []).map(msg => {
                    const mine = msg.sender_id === user.id;
                    return (
                      <div key={msg.id} className={`flex ${mine ? "justify-end" : "justify-start"} animate-fade-in`}>
                        <div className={`relative max-w-[80%] rounded-[28px] px-6 py-4 text-[15px] font-medium leading-relaxed shadow-lg ${
                          mine
                            ? "bg-[var(--gradient-ember-warm)] text-white shadow-[0_12px_32px_-12px_rgba(239,94,94,0.5)]"
                            : "border border-white/5 bg-white/[0.04] text-[var(--color-pearl)]"
                        }`}>
                          {msg.body}
                          <div className={`mt-2 text-[10px] font-black uppercase tracking-widest ${mine ? "text-white/50" : "text-[var(--color-ash)]"}`}>
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {!(messages ?? []).length && (
                    <div className="flex flex-col items-center justify-center py-12 text-center opacity-60">
                      <div className="mb-4 h-px w-12 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                      <p className="max-w-xs text-[13px] font-medium leading-relaxed text-[var(--color-ash)]">
                        No messages yet. Lead with a question about their values or wellness rhythm to start something meaningful.
                      </p>
                    </div>
                  )}
                </div>

                <form
                  action={async (fd: FormData) => {
                    "use server";
                    const { sendMessage } = await import("@/lib/discover/actions");
                    await sendMessage(null, fd);
                  }}
                  className="border-t border-white/5 bg-white/[0.02] p-6 sm:p-8"
                >
                  <input type="hidden" name="match_id" value={activeMatch.id} />
                  <div className="flex items-center gap-4">
                    <input
                      name="body"
                      autoComplete="off"
                      placeholder={`Message ${activeOther?.display_name?.split(" ")[0] ?? "Member"}…`}
                      className="h-14 flex-1 rounded-2xl border border-white/10 bg-white/[0.03] px-6 text-[15px] font-medium text-[var(--color-pearl)] outline-none transition-all placeholder:text-[var(--color-ash)] focus:border-[var(--color-gold-500)] focus:bg-white/[0.05]"
                      maxLength={2000}
                      required
                    />
                    <button className="magic-button flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-pearl)] text-[var(--color-ink)] shadow-lg transition-all hover:bg-white active:scale-95">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                    </button>
                  </div>
                </form>
              </>
            )}
          </section>
        </div>
      </div>
    </AppShell>
  );
}
