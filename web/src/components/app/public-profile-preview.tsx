import Link from "next/link";
import type { ProfilePhoto, UserProfileRow } from "@freeborn/shared";
import { ArrowIcon, BadgeIcon, CheckIcon, LockIcon, PinIcon, ShieldIcon } from "@/components/icons";
import { ageFromBirthDate, humanize, initials, locationLabel, primaryPhoto, promptAnswers, publicPhotoUrl } from "./profile-utils";

function Chip({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "gold" | "teal" | "danger" }) {
  const cls =
    tone === "gold"
      ? "border-[var(--color-gold-500)]/25 bg-[var(--color-gold-500)]/8 text-[var(--color-gold-300)]"
      : tone === "teal"
        ? "border-[var(--color-teal-500)]/25 bg-[var(--color-teal-500)]/8 text-[var(--color-teal-300)]"
        : tone === "danger"
          ? "border-red-400/25 bg-red-400/8 text-red-100"
          : "border-white/8 bg-white/[0.035] text-[var(--color-sand)]";
  return <span className={`rounded-full border px-3.5 py-2 text-xs font-bold ${cls}`}>{children}</span>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[var(--color-ash)]">{title}</p>
      {children}
    </section>
  );
}

export function PublicProfilePreview({ profile, photos }: { profile: UserProfileRow; photos: ProfilePhoto[] }) {
  const cover = primaryPhoto(photos);
  const coverUrl = publicPhotoUrl(cover?.storage_path);
  const age = ageFromBirthDate(profile.birth_date);
  const prompts = promptAnswers(profile);
  const gallery = photos.filter((photo) => photo.id !== cover?.id).slice(0, 5);

  return (
    <div className="mx-auto w-full max-w-[760px] space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link href="/app/profile" className="inline-flex items-center gap-2 text-sm font-bold text-[var(--color-mist)] transition hover:text-[var(--color-pearl)]"><ArrowIcon size={16} className="rotate-180" /> Profile hub</Link>
          <p className="mt-6 text-xs font-black uppercase tracking-[0.24em] text-[var(--color-sand)]">Preview Profile</p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-[clamp(2.2rem,5vw,3.8rem)] leading-[0.94] tracking-[-0.05em] text-[var(--color-pearl)]">How discovery sees you.</h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--color-mist)]">This is a read-only preview modeled after the Discover card. Private fields are intentionally absent.</p>
        </div>
      </header>

      <article className="luminous-card magic-border relative overflow-hidden rounded-[42px] border border-white/10 bg-[rgba(9,16,28,0.92)] shadow-[var(--shadow-card-lg)] backdrop-blur-3xl">
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-gradient-to-br from-[rgba(239,94,94,0.15)] via-[rgba(217,167,82,0.08)] to-[rgba(138,110,242,0.12)] sm:aspect-[4/4.7]">
          {coverUrl ? (
            <img src={coverUrl} alt="Your public cover photo" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <div className="text-center">
                <span className="font-[family-name:var(--font-display)] text-8xl tracking-tighter text-white/20">{initials(profile.display_name)}</span>
                <p className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-ash)]">Photo pending</p>
              </div>
            </div>
          )}

          <div className="absolute inset-x-0 top-6 z-10 flex gap-1.5 px-6" aria-label="Profile photos">
            {Array.from({ length: Math.max(photos.length, 1) }).map((_, index) => <span key={index} className={`h-1 flex-1 rounded-full ${index === 0 ? "bg-white shadow-[0_0_15px_white]" : "bg-white/20"}`} />)}
          </div>

          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/95 via-black/35 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
            <div className="flex items-end justify-between gap-4">
              <div className="min-w-0">
                <div className="mb-3 flex flex-wrap gap-2">
                  {profile.is_verified ? <Chip tone="teal"><span className="inline-flex items-center gap-1.5"><BadgeIcon size={13} /> Verified</span></Chip> : null}
                  <Chip tone={profile.discoverable ? "gold" : "neutral"}>{profile.discoverable ? "Visible" : "Hidden"}</Chip>
                </div>
                <h2 className="font-[family-name:var(--font-display)] text-[clamp(2.5rem,7vw,4.25rem)] leading-[0.88] tracking-tight text-white">
                  {profile.display_name || "New Member"}{age ? <span className="ml-3 text-[0.42em] font-black text-white/65">{age}</span> : null}
                </h2>
                <p className="mt-3 flex items-center gap-2 text-[13px] font-black uppercase tracking-[0.18em] text-white/70"><PinIcon size={15} /> {locationLabel(profile)}{profile.occupation ? ` · ${profile.occupation}` : ""}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8 p-6 sm:p-8">
          <Section title="Bio">
            <p className="text-[17px] font-medium leading-8 text-[var(--color-pearl)]/92">{profile.bio || "Add a bio to help people understand your voice, values, and relationship direction."}</p>
          </Section>

          {profile.relationship_goals?.length ? <Section title="Relationship intent"><div className="flex flex-wrap gap-2.5">{profile.relationship_goals.slice(0, 3).map((goal) => <Chip key={goal} tone="gold">{humanize(goal)}</Chip>)}</div></Section> : null}
          {profile.values?.length ? <Section title="Values"><div className="flex flex-wrap gap-2.5">{profile.values.slice(0, 8).map((value) => <Chip key={value} tone="gold">{value}</Chip>)}</div></Section> : null}
          {profile.lifestyle_preferences?.length ? <Section title="Lifestyle"><div className="flex flex-wrap gap-2.5">{profile.lifestyle_preferences.slice(0, 10).map((item) => <Chip key={item}>{item}</Chip>)}</div></Section> : null}
          {profile.interests?.length ? <Section title="Interests"><div className="flex flex-wrap gap-2.5">{profile.interests.slice(0, 12).map((item) => <Chip key={item}>{item}</Chip>)}</div></Section> : null}

          {prompts.length ? (
            <Section title="Prompts">
              <div className="grid gap-3">
                {prompts.slice(0, 3).map((prompt) => (
                  <div key={prompt.prompt} className="rounded-[28px] border border-white/8 bg-white/[0.025] p-5">
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-gold-300)]">{prompt.prompt}</p>
                    <p className="mt-3 text-[15px] font-bold leading-7 text-[var(--color-pearl)]/90">{prompt.answer}</p>
                  </div>
                ))}
              </div>
            </Section>
          ) : null}

          {gallery.length ? (
            <Section title="More photos">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {gallery.map((photo) => {
                  const url = publicPhotoUrl(photo.storage_path);
                  return url ? <img key={photo.id} src={url} alt="Additional profile photo" className="aspect-[4/5] rounded-[24px] border border-white/8 object-cover" /> : null;
                })}
              </div>
            </Section>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[24px] border border-white/8 bg-white/[0.02] p-5">
              <div className="flex items-center gap-2 text-sm font-black text-[var(--color-pearl)]"><ShieldIcon size={16} className="text-[var(--color-gold-300)]" /> Trust indicator</div>
              <p className="mt-2 text-xs leading-5 text-[var(--color-mist)]">Verification badge appears only when verification is complete.</p>
            </div>
            <div className="rounded-[24px] border border-white/8 bg-white/[0.02] p-5">
              <div className="flex items-center gap-2 text-sm font-black text-[var(--color-pearl)]"><LockIcon size={16} className="text-[var(--color-gold-300)]" /> Privacy active</div>
              <p className="mt-2 text-xs leading-5 text-[var(--color-mist)]">Email, full birth date, account provider, and exact coordinates are hidden.</p>
            </div>
          </div>
        </div>
      </article>

      <Link href="/app/profile/photos" className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 text-sm font-bold text-[var(--color-pearl)] transition hover:bg-white/[0.08]"><CheckIcon size={16} /> Improve this preview</Link>
    </div>
  );
}
