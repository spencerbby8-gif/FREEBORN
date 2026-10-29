-- Privacy-safe browser-integrity signals (2026-10-29).
--
-- WHAT THIS ADDS: one append-only table holding the NAMES of the consistency rules that fired
-- during a verification attempt, and nothing else. No timezone, no language string, no platform,
-- no user agent, no device identifier is stored anywhere by this feature.
--
-- WHAT THIS DELIBERATELY DOES NOT ADD: this port began life on a divergent tree that recreated
-- `public.verification_challenges` because that table had no migration there. It DOES exist in
-- this repository, created and indexed and RLS'd by
-- 20260713120000_verification_tightening.sql. Re-adding it here would have shipped a second
-- definition of a live table. The pose-challenge control is therefore unchanged by this file.
--
-- Idempotent and additive: no column drops, no policy changes to existing tables, no grants
-- revoked. Safe to re-run.

create table if not exists public.freeborn_security_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  -- Open on purpose so a later signal can be added without another migration, but the
  -- verification path only ever writes the one value below.
  kind text not null,
  -- Rule names only. See persistableDetail() in web/src/lib/security/browser-integrity.ts.
  detail text not null default 'none',
  created_at timestamptz not null default timezone('utc', now())
);

-- A reviewer reads this as a rate ("checked and clear" vs "never looked"), so the common query
-- is "this member's events of this kind, newest first".
create index if not exists freeborn_security_events_user_kind_idx
  on public.freeborn_security_events (user_id, kind, created_at desc);

-- NOTE, no attempt-level uniqueness here on purpose. A `(user_id, kind, created_at)` unique
-- index looks like a tidy "one row per attempt" guard but `now()` is transaction-level, so two
-- attempts sharing a transaction would collide, and an insert error inside a member's submit path
-- is a verification outage caused by a signal that must never cause anything. Dedupe is not
-- worth that; the row count per day is a rate either way, and the write is additionally wrapped
-- in a catch at the call site.

alter table public.freeborn_security_events enable row level security;

revoke all on public.freeborn_security_events from anon, authenticated;

-- Members may write their own row. They may not read the table back: it is an investigator's
-- ledger, and a signal that a member could enumerate is a signal they could tune around.
-- Deliberately NO read policy at all, which is a hard deny for every non-service role.
-- (Note on the idiom this replaces: 20260713120000_verification_tightening.sql grants SELECT
-- "to admins" via `profile_status = 'admin'`, but 20260709190000_phase0_foundation.sql constrains
-- that column to draft/active/paused/hidden — so no row can ever satisfy it and that policy is
-- permanently false. Verified here by applying both: the insert succeeds and every SELECT returns
-- 0 rows even for the member who wrote them. Reproducing that pattern here would have shipped a
-- second policy that looks protective and does nothing; if a reviewer UI is wanted, the fix is a
-- real role, not a copy of this check.)
drop policy if exists "Users insert own security events" on public.freeborn_security_events;
create policy "Users insert own security events"
on public.freeborn_security_events for insert
to authenticated
with check (auth.uid() = user_id);

-- No update, no delete policy is granted: an append-only ledger. `on delete cascade` above is
-- the only removal path, so a member's events go when their profile goes.

comment on table public.freeborn_security_events is
  'Advisory browser-integrity rule names from verification attempts. Never a sole cause of any
   decision; no device data is retained.';
comment on column public.freeborn_security_events.detail is
  'Comma-separated rule keys or the literal ''none''. Raw observations are dropped by design.';
