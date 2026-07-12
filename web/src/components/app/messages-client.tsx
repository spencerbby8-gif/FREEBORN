"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition, type FormEvent } from "react";
import type { MatchMessageRow, ProfilePhoto, UserMatchRow, UserProfileRow } from "@freeborn/shared";
import { blockOrReportUser, sendMessage, unmatchUser } from "@/lib/discover/actions";
import { ArrowIcon, BadgeIcon, CloseIcon, EyeIcon, HeartIcon, LockIcon, MenuIcon, ShieldIcon, SparkIcon, UserIcon } from "@/components/icons";
import { humanize, initials, locationLabel, promptAnswers, publicPhotoUrl } from "./profile-utils";

type Conversation = {
  match: UserMatchRow;
  other: UserProfileRow | null;
  photo: ProfilePhoto | null;
  latest: MatchMessageRow | null;
};

type LocalMessage = MatchMessageRow & {
  localStatus?: "sending" | "failed" | "sent";
  localId?: string;
};

type SafetyAction = "unmatch" | "block" | "report";

function formatTime(value: string) {
  return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

function formatDay(value: string) {
  const date = new Date(value);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: today.getFullYear() === date.getFullYear() ? undefined : "numeric" }).format(date);
}

function MessageStatus({ message }: { message: LocalMessage }) {
  if (message.localStatus === "sending") return <span>Sending…</span>;
  if (message.localStatus === "failed") return <span className="text-red-100">Not sent</span>;
  if (message.read_at) return <span>Read</span>;
  return <span>Delivered</span>;
}

function TrustCue() {
  return (
    <div className="rounded-[24px] border border-[var(--color-gold-500)]/14 bg-[var(--color-gold-500)]/5 p-4 text-sm leading-6 text-[var(--color-mist)]">
      <div className="flex items-center gap-2 font-black text-[var(--color-pearl)]"><ShieldIcon size={16} className="text-[var(--color-gold-300)]" /> Message with intention</div>
      <p className="mt-2">Start from values, lifestyle, or something specific in their profile. Keep private contact details off-platform until trust is earned.</p>
      <Link href="/app/profile/verification" className="mt-3 inline-flex text-xs font-black uppercase tracking-widest text-[var(--color-gold-300)] transition hover:text-[var(--color-pearl)]">Review verification →</Link>
    </div>
  );
}

function EmptyConversations() {
  return (
    <div className="luminous-card flex min-h-[640px] flex-col items-center justify-center rounded-[42px] border border-white/10 bg-white/[0.02] p-8 text-center shadow-[var(--shadow-card-lg)]">
      <div className="pulse-glow flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-gold-500)]/10 text-[var(--color-gold-300)]"><HeartIcon size={34} /></div>
      <h2 className="mt-8 font-[family-name:var(--font-display)] text-[clamp(2rem,5vw,3rem)] leading-[0.95] text-[var(--color-pearl)]">No conversations yet.</h2>
      <p className="mt-4 max-w-md text-sm leading-7 text-[var(--color-mist)]">Mutual likes become matches here. Read the full profile, choose with care, and begin with something specific when the connection is mutual.</p>
      <Link href="/app" className="magic-button mt-8 inline-flex h-[52px] items-center justify-center rounded-2xl bg-[var(--gradient-ember-warm)] px-7 text-sm font-black text-white shadow-[var(--shadow-ember)] transition hover:-translate-y-px">Open Discover</Link>
    </div>
  );
}

function EmptyThread({ other }: { other: UserProfileRow | null }) {
  const prompts = other ? promptAnswers(other) : [];
  const prompt = prompts[0];
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center justify-center py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.035] text-[var(--color-gold-300)]"><SparkIcon size={28} /></div>
      <h3 className="mt-6 text-xl font-black text-[var(--color-pearl)]">Start with something specific.</h3>
      <p className="mt-3 text-sm leading-7 text-[var(--color-mist)]">A thoughtful first message can reference intent, values, or a detail that felt real.</p>
      {prompt ? (
        <div className="mt-6 rounded-[24px] border border-white/10 bg-white/[0.025] p-5 text-left">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-gold-300)]">Conversation starter</p>
          <p className="mt-2 text-sm font-bold leading-6 text-[var(--color-pearl)]">Ask about “{prompt.prompt}” — {prompt.answer}</p>
        </div>
      ) : null}
    </div>
  );
}

function ConversationAvatar({ profile, photo, active }: { profile: UserProfileRow | null; photo: ProfilePhoto | null; active?: boolean }) {
  const url = publicPhotoUrl(photo?.storage_path);
  return (
    <div className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-[20px] border ${active ? "border-white/25" : "border-white/8"} bg-white/5 shadow-inner`}>
      {url ? <img src={url} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-rose-500/15 to-amber-500/10 text-sm font-black text-white/55">{initials(profile?.display_name)}</div>}
      {profile?.is_verified ? <span className="absolute bottom-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-teal-500)] text-[9px] text-white">✓</span> : null}
    </div>
  );
}

function ConversationList({ conversations, activeId }: { conversations: Conversation[]; activeId?: string }) {
  return (
    <aside className="luminous-card flex min-h-[620px] flex-col overflow-hidden rounded-[40px] border border-white/10 bg-white/[0.02] shadow-[var(--shadow-raised)] lg:h-[calc(100svh-190px)]">
      <div className="border-b border-white/8 p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[var(--color-sand)]">Messages</p>
            <h2 className="mt-2 text-xl font-black text-[var(--color-pearl)]">Shared ground</h2>
          </div>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-black text-[var(--color-mist)]">{conversations.length}</span>
        </div>
      </div>
      <div className="flex-1 space-y-1 overflow-y-auto p-3 custom-scrollbar">
        {conversations.map((conversation) => {
          const active = activeId === conversation.match.id;
          const other = conversation.other;
          const latest = conversation.latest;
          return (
            <Link key={conversation.match.id} href={`/app/matches?m=${conversation.match.id}`} className={`group flex items-center gap-3 rounded-[26px] p-3 transition-all ${active ? "bg-[var(--gradient-ember-warm)] text-white shadow-[0_16px_36px_-18px_rgba(239,94,94,0.75)]" : "hover:bg-white/[0.045]"}`}>
              <ConversationAvatar profile={other} photo={conversation.photo} active={active} />
              <span className="min-w-0 flex-1">
                <span className={`block truncate text-sm font-black ${active ? "text-white" : "text-[var(--color-pearl)]"}`}>{other?.display_name ?? "Freeborn member"}</span>
                <span className={`mt-1 block truncate text-xs leading-5 ${active ? "text-white/75" : "text-[var(--color-mist)]"}`}>{latest ? latest.body : "Matched — begin with intention."}</span>
                <span className={`mt-1 block text-[10px] font-black uppercase tracking-widest ${active ? "text-white/55" : "text-[var(--color-ash)]"}`}>{other?.city ?? "Nearby"}{latest ? ` · ${formatDay(latest.created_at)}` : ""}</span>
              </span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}

function ProfileQuickPanel({ other, photo }: { other: UserProfileRow | null; photo: ProfilePhoto | null }) {
  const prompts = other ? promptAnswers(other) : [];
  return (
    <aside className="hidden w-[300px] shrink-0 border-l border-white/8 bg-white/[0.012] p-5 xl:block">
      <div className="rounded-[30px] border border-white/10 bg-white/[0.025] p-5">
        <ConversationAvatar profile={other} photo={photo} />
        <h3 className="mt-4 text-xl font-black text-[var(--color-pearl)]">{other?.display_name ?? "Member"}</h3>
        <p className="mt-1 text-xs font-black uppercase tracking-widest text-[var(--color-ash)]">{other ? locationLabel(other) : "Nearby"}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {other?.is_verified ? <span className="rounded-full border border-[var(--color-teal-500)]/25 bg-[var(--color-teal-500)]/8 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-[var(--color-teal-300)]">Verified</span> : null}
          {other?.relationship_goals?.slice(0, 2).map((goal) => <span key={goal} className="rounded-full border border-[var(--color-gold-500)]/20 bg-[var(--color-gold-500)]/7 px-3 py-1.5 text-[10px] font-black text-[var(--color-gold-300)]">{humanize(goal)}</span>)}
        </div>
        {other?.bio ? <p className="mt-4 line-clamp-5 text-sm leading-6 text-[var(--color-mist)]">{other.bio}</p> : null}
      </div>
      {prompts[0] ? (
        <div className="mt-4 rounded-[26px] border border-white/8 bg-white/[0.02] p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-gold-300)]">Prompt</p>
          <p className="mt-2 text-sm font-bold leading-6 text-[var(--color-pearl)]">{prompts[0].prompt}</p>
          <p className="mt-1 text-sm leading-6 text-[var(--color-mist)]">{prompts[0].answer}</p>
        </div>
      ) : null}
      <TrustCue />
    </aside>
  );
}

function SafetyModal({ action, other, onClose, onConfirm, pending }: { action: SafetyAction; other: UserProfileRow | null; onClose: () => void; onConfirm: (reason?: string) => void; pending: boolean }) {
  const [reason, setReason] = useState("");
  const title = action === "unmatch" ? "Unmatch?" : action === "block" ? "Block this member?" : "Report and block?";
  const body = action === "unmatch"
    ? "This conversation will move out of your active matches. You can keep using Freeborn with your privacy intact."
    : action === "block"
      ? "They will be blocked from interacting with you. This action is intentionally easy to find, but never pushed into your conversation."
      : "Send a concise safety note and block this member. Use this for conduct that does not belong in the Freeborn room.";
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 p-4 backdrop-blur-md sm:items-center" role="dialog" aria-modal="true">
      <div className="animate-scale-in w-full max-w-[460px] rounded-[34px] border border-white/10 bg-[rgba(9,16,28,0.96)] p-6 shadow-[var(--shadow-card-lg)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[var(--color-sand)]">Safety</p>
            <h3 className="mt-2 text-2xl font-black text-[var(--color-pearl)]">{title}</h3>
          </div>
          <button type="button" onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[var(--color-mist)]"><CloseIcon size={16} /></button>
        </div>
        <p className="mt-4 text-sm leading-7 text-[var(--color-mist)]">{body}</p>
        {action === "report" ? <textarea value={reason} onChange={(event) => setReason(event.target.value.slice(0, 500))} rows={4} className="mt-5 w-full resize-none rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm leading-6 text-[var(--color-pearl)] outline-none focus:border-[var(--color-gold-500)]" placeholder={`What should we know about ${other?.display_name ?? "this member"}?`} /> : null}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={onClose} className="h-12 rounded-2xl border border-white/10 bg-white/[0.04] text-sm font-bold text-[var(--color-pearl)]">Cancel</button>
          <button type="button" disabled={pending} onClick={() => onConfirm(reason)} className="h-12 rounded-2xl border border-red-400/25 bg-red-500/10 text-sm font-black text-red-100 disabled:opacity-60">{pending ? "Working…" : action === "unmatch" ? "Unmatch" : action === "block" ? "Block" : "Report & block"}</button>
        </div>
      </div>
    </div>
  );
}

export function MessagesClient({
  currentUserId,
  conversations,
  activeMatchId,
  initialMessages,
}: {
  currentUserId: string;
  conversations: Conversation[];
  activeMatchId?: string | null;
  initialMessages: MatchMessageRow[];
}) {
  const active = conversations.find((conversation) => conversation.match.id === activeMatchId) ?? conversations[0] ?? null;
  const [messages, setMessages] = useState<LocalMessage[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [pending, startTransition] = useTransition();
  const [safetyAction, setSafetyAction] = useState<SafetyAction | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, active?.match.id]);

  const other = active?.other ?? null;
  const otherPhoto = active?.photo ?? null;

  const send = (body: string, retryLocalId?: string) => {
    if (!active || !body.trim()) return;
    const localId = retryLocalId ?? `local-${Date.now()}`;
    const optimistic: LocalMessage = {
      id: localId,
      localId,
      match_id: active.match.id,
      sender_id: currentUserId,
      body: body.trim(),
      read_at: null,
      created_at: new Date().toISOString(),
      localStatus: "sending",
    };
    setMessages((current) => retryLocalId ? current.map((message) => message.localId === retryLocalId ? optimistic : message) : [...current, optimistic]);
    setDraft("");

    startTransition(async () => {
      const fd = new FormData();
      fd.set("match_id", active.match.id);
      fd.set("body", body.trim());
      const result = await sendMessage(null, fd);
      if (!result?.ok || !result.message) {
        setMessages((current) => current.map((message) => message.localId === localId ? { ...message, localStatus: "failed" } : message));
        return;
      }
      setMessages((current) => current.map((message) => message.localId === localId ? { ...(result.message as MatchMessageRow), localStatus: "sent" } : message));
    });
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    send(draft);
  };

  const confirmSafety = (reason?: string) => {
    if (!active || !safetyAction) return;
    startTransition(async () => {
      const fd = new FormData();
      fd.set("match_id", active.match.id);
      if (other?.id) fd.set("blocked_id", other.id);
      if (reason) fd.set("reason", reason);
      fd.set("mode", safetyAction);
      const result = safetyAction === "unmatch" ? await unmatchUser(fd) : await blockOrReportUser(fd);
      if (result?.ok) window.location.href = "/app/matches";
    });
  };

  if (!conversations.length) return <EmptyConversations />;

  return (
    <div className="grid gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
      <ConversationList conversations={conversations} activeId={active?.match.id} />

      <section className="luminous-card flex min-h-[680px] overflow-hidden rounded-[42px] border border-white/10 bg-white/[0.018] shadow-[var(--shadow-card-lg)] lg:h-[calc(100svh-190px)]">
        {active ? (
          <div className="flex min-w-0 flex-1 flex-col">
            <header className="flex items-center justify-between gap-4 border-b border-white/8 bg-white/[0.018] px-4 py-4 sm:px-6">
              <div className="flex min-w-0 items-center gap-4">
                <ConversationAvatar profile={other} photo={otherPhoto} />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-lg font-black text-[var(--color-pearl)]">{other?.display_name ?? "Member"}</p>
                    {other?.is_verified ? <BadgeIcon size={16} className="text-[var(--color-teal-300)]" /> : null}
                  </div>
                  <p className="truncate text-[11px] font-black uppercase tracking-[0.18em] text-[var(--color-ash)]">{other ? locationLabel(other) : "Nearby"} · Matched {formatDay(active.match.created_at)}</p>
                </div>
              </div>
              <div className="relative flex items-center gap-2">
                <button type="button" onClick={() => setMenuOpen((value) => !value)} className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-[var(--color-mist)] transition hover:bg-white/[0.08]" aria-label="Conversation actions"><MenuIcon size={18} /></button>
                {menuOpen ? (
                  <div className="absolute right-0 top-[52px] z-20 w-56 rounded-3xl border border-white/10 bg-[rgba(9,16,28,0.96)] p-2 shadow-[var(--shadow-card-lg)] backdrop-blur-xl">
                    <button type="button" onClick={() => { setQuickOpen(true); setMenuOpen(false); }} className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold text-[var(--color-pearl)] hover:bg-white/[0.06]"><EyeIcon size={16} /> Profile quick view</button>
                    <button type="button" onClick={() => { setSafetyAction("unmatch"); setMenuOpen(false); }} className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold text-[var(--color-pearl)] hover:bg-white/[0.06]"><UserIcon size={16} /> Unmatch</button>
                    <button type="button" onClick={() => { setSafetyAction("block"); setMenuOpen(false); }} className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold text-red-100 hover:bg-red-500/10"><ShieldIcon size={16} /> Block</button>
                    <button type="button" onClick={() => { setSafetyAction("report"); setMenuOpen(false); }} className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold text-red-100 hover:bg-red-500/10"><LockIcon size={16} /> Report</button>
                  </div>
                ) : null}
              </div>
            </header>

            <div ref={scrollRef} className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.018),transparent_55%)] px-4 py-6 custom-scrollbar sm:px-6">
              <div className="mx-auto max-w-3xl space-y-5">
                {!messages.length ? <EmptyThread other={other} /> : null}
                {messages.map((message, i) => {
                  const mine = message.sender_id === currentUserId;
                  const previous = messages[i - 1];
                  const showDay = !previous || formatDay(previous.created_at) !== formatDay(message.created_at);
                  return (
                    <div key={message.localId ?? message.id}>
                      {showDay ? <div className="my-6 flex items-center gap-3"><div className="h-px flex-1 bg-white/8" /><span className="rounded-full border border-white/8 bg-white/[0.035] px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[var(--color-ash)]">{formatDay(message.created_at)}</span><div className="h-px flex-1 bg-white/8" /></div> : null}
                      <div className={`flex ${mine ? "justify-end" : "justify-start"} animate-fade-in`}>
                        <div className={`group max-w-[86%] sm:max-w-[72%] ${mine ? "items-end" : "items-start"} flex flex-col`}>
                          <div className={`rounded-[28px] px-5 py-3.5 text-[15px] font-medium leading-7 shadow-lg ${mine ? "rounded-br-lg bg-[var(--gradient-ember-warm)] text-white shadow-[0_16px_40px_-18px_rgba(239,94,94,0.85)]" : "rounded-bl-lg border border-white/8 bg-white/[0.055] text-[var(--color-pearl)]"}`}>
                            {message.body}
                          </div>
                          <div className={`mt-1.5 flex items-center gap-2 px-2 text-[10px] font-black uppercase tracking-widest ${mine ? "text-[var(--color-gold-300)]/80" : "text-[var(--color-ash)]"}`}>
                            <span>{formatTime(message.created_at)}</span>
                            {mine ? <MessageStatus message={message} /> : null}
                            {message.localStatus === "failed" ? <button type="button" onClick={() => send(message.body, message.localId)} className="text-red-100 underline decoration-red-100/30 underline-offset-4">Retry</button> : null}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {pending && draft.length === 0 ? <div className="flex justify-end"><div className="rounded-full border border-white/8 bg-white/[0.035] px-4 py-2 text-xs font-bold text-[var(--color-mist)]">Sending with care…</div></div> : null}
                {inputFocused ? <div className="text-center text-[11px] font-bold uppercase tracking-widest text-[var(--color-ash)]">Keep it specific, kind, and private.</div> : null}
              </div>
            </div>

            <form onSubmit={onSubmit} className="sticky bottom-0 border-t border-white/8 bg-[rgba(9,16,28,0.92)] p-4 backdrop-blur-2xl sm:p-5">
              <div className="mx-auto flex max-w-3xl items-end gap-3">
                <textarea value={draft} onFocus={() => setInputFocused(true)} onBlur={() => setInputFocused(false)} onChange={(event) => setDraft(event.target.value.slice(0, 2000))} rows={1} placeholder={`Message ${other?.display_name?.split(" ")[0] ?? "them"}…`} className="max-h-36 min-h-[54px] flex-1 resize-none rounded-[24px] border border-white/10 bg-white/[0.04] px-5 py-4 text-[15px] font-medium leading-6 text-[var(--color-pearl)] outline-none transition placeholder:text-[var(--color-ash)] focus:border-[var(--color-gold-500)] focus:bg-white/[0.06]" />
                <button type="submit" disabled={!draft.trim() || pending} className="magic-button flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-2xl bg-[var(--color-pearl)] text-[var(--color-ink)] shadow-lg transition hover:bg-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-45" aria-label="Send message"><ArrowIcon size={20} /></button>
              </div>
            </form>
          </div>
        ) : null}

        <ProfileQuickPanel other={other} photo={otherPhoto} />
      </section>

      {quickOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 p-4 backdrop-blur-md sm:items-center" role="dialog" aria-modal="true">
          <div className="animate-scale-in w-full max-w-[420px] rounded-[34px] border border-white/10 bg-[rgba(9,16,28,0.96)] p-6 shadow-[var(--shadow-card-lg)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[var(--color-sand)]">Profile quick view</p>
                <h3 className="mt-2 text-2xl font-black text-[var(--color-pearl)]">{other?.display_name ?? "Member"}</h3>
              </div>
              <button type="button" onClick={() => setQuickOpen(false)} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[var(--color-mist)]"><CloseIcon size={16} /></button>
            </div>
            <div className="mt-5 flex items-center gap-4">
              <ConversationAvatar profile={other} photo={otherPhoto} />
              <div>
                <p className="text-sm font-black uppercase tracking-widest text-[var(--color-ash)]">{other ? locationLabel(other) : "Nearby"}</p>
                <p className="mt-1 text-sm leading-6 text-[var(--color-mist)]">{other?.bio ? other.bio.slice(0, 140) : "Use the conversation to learn more with care."}</p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {other?.relationship_goals?.slice(0, 3).map((goal) => <span key={goal} className="rounded-full border border-[var(--color-gold-500)]/20 bg-[var(--color-gold-500)]/8 px-3 py-1.5 text-xs font-bold text-[var(--color-gold-300)]">{humanize(goal)}</span>)}
              {other?.values?.slice(0, 3).map((value) => <span key={value} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-bold text-[var(--color-sand)]">{value}</span>)}
            </div>
          </div>
        </div>
      ) : null}

      {safetyAction ? <SafetyModal action={safetyAction} other={other} onClose={() => setSafetyAction(null)} onConfirm={confirmSafety} pending={pending} /> : null}
    </div>
  );
}
