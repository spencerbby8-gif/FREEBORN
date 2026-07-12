import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/app/app-shell";
import { MessagesClient } from "@/components/app/messages-client";
import type { MatchMessageRow, ProfilePhoto, UserMatchRow, UserProfileRow } from "@freeborn/shared";

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
  if (!profile) redirect("/auth?mode=sign-in");
  if (profile.onboarding_stage === "account_created") redirect("/app/onboarding");

  const { data: myPhotos } = await supabase.from("profile_photos").select("*").eq("user_id", user.id).order("position", { ascending: true });
  const myPrimary = ((myPhotos as ProfilePhoto[] | null) ?? []).find((photo) => photo.is_primary) ?? (myPhotos as ProfilePhoto[] | null)?.[0];
  const myPhotoUrl = myPrimary ? supabase.storage.from("profile-photos").getPublicUrl(myPrimary.storage_path).data.publicUrl : null;

  const { data: matches } = await supabase
    .from("user_matches")
    .select("*")
    .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
    .eq("status", "active")
    .order("last_message_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  const matchRows = (matches as UserMatchRow[]) ?? [];
  const otherIds = matchRows.map((match) => (match.user_a === user.id ? match.user_b : match.user_a));

  const { data: others } = otherIds.length
    ? await supabase.from("user_profiles").select("*").in("id", otherIds)
    : { data: [] as UserProfileRow[] };
  const otherMap = new Map(((others as UserProfileRow[] | null) ?? []).map((other) => [other.id, other]));

  const { data: photos } = otherIds.length
    ? await supabase.from("profile_photos").select("*").in("user_id", otherIds).eq("is_primary", true)
    : { data: [] as ProfilePhoto[] };
  const photoMap = new Map(((photos as ProfilePhoto[] | null) ?? []).map((photo) => [photo.user_id, photo]));

  const activeMatch = selected ? matchRows.find((match) => match.id === selected) ?? matchRows[0] : matchRows[0];

  const { data: activeMessages } = activeMatch
    ? await supabase.from("match_messages").select("*").eq("match_id", activeMatch.id).order("created_at", { ascending: true }).limit(160)
    : { data: [] as MatchMessageRow[] };

  const { data: latestMessages } = matchRows.length
    ? await supabase
        .from("match_messages")
        .select("*")
        .in("match_id", matchRows.map((match) => match.id))
        .order("created_at", { ascending: false })
        .limit(Math.max(matchRows.length * 4, 40))
    : { data: [] as MatchMessageRow[] };

  const latestByMatch = new Map<string, MatchMessageRow>();
  ((latestMessages as MatchMessageRow[] | null) ?? []).forEach((message) => {
    if (!latestByMatch.has(message.match_id)) latestByMatch.set(message.match_id, message);
  });

  const conversations = matchRows.map((match) => {
    const otherId = match.user_a === user.id ? match.user_b : match.user_a;
    return {
      match,
      other: otherMap.get(otherId) ?? null,
      photo: photoMap.get(otherId) ?? null,
      latest: latestByMatch.get(match.id) ?? null,
    };
  });

  return (
    <AppShell displayName={profile.display_name} photoUrl={myPhotoUrl}>
      <div className="mx-auto w-full max-w-[1280px] space-y-6">
        <header className="relative overflow-hidden rounded-[38px] border border-white/10 bg-[radial-gradient(circle_at_15%_0%,rgba(217,167,82,0.14),transparent_34%),rgba(255,255,255,0.025)] p-5 shadow-[var(--shadow-raised)] sm:p-7 lg:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--color-sand)]">Messages</p>
              <h1 className="mt-3 font-[family-name:var(--font-display)] text-[clamp(2.4rem,5vw,4.3rem)] leading-[0.9] tracking-[-0.06em] text-[var(--color-pearl)]">
                Conversations with shared ground.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--color-mist)] sm:text-base">
                A calm place for mutual matches to move from values and intent into thoughtful conversation.
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[var(--color-mist)]">{matchRows.length} active</span>
              <span className="rounded-full border border-[var(--color-gold-500)]/25 bg-[var(--color-gold-500)]/8 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[var(--color-gold-300)]">Private by default</span>
            </div>
          </div>
        </header>

        <MessagesClient
          key={activeMatch?.id ?? "empty"}
          currentUserId={user.id}
          conversations={conversations}
          activeMatchId={activeMatch?.id ?? null}
          initialMessages={(activeMessages as MatchMessageRow[]) ?? []}
        />
      </div>
    </AppShell>
  );
}
