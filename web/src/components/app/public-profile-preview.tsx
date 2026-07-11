import type { ProfilePhoto, UserProfileRow } from "@freeborn/shared";

function publicPhotoUrl(path?: string | null) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  return `${base}/storage/v1/object/public/profile-photos/${path.split("/").map(encodeURIComponent).join("/")}`;
}

function initials(name?: string | null) {
  return (name ?? "FB")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function humanize(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function ageFromBirthDate(value?: string | null) {
  if (!value) return null;
  const birth = new Date(value);
  if (Number.isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDelta = today.getMonth() - birth.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < birth.getDate())) age -= 1;
  return age >= 18 ? age : null;
}

export function PublicProfilePreview({ profile, photos }: { profile: UserProfileRow; photos: ProfilePhoto[] }) {
  const primary = photos.find((photo) => photo.is_primary) ?? photos[0];
  const photoUrl = publicPhotoUrl(primary?.storage_path);
  const location = [profile.city, profile.region].filter(Boolean).join(", ");
  const age = ageFromBirthDate(profile.birth_date);
  const prompt = Array.isArray(profile.prompt_answers) ? profile.prompt_answers.find((item) => item.prompt && item.answer) : null;

  return (
    <section className="luminous-card magic-border overflow-hidden rounded-[32px] border border-white/10 bg-[rgba(9,16,28,0.88)]">
      <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-[rgba(239,94,94,0.22)] via-[rgba(217,167,82,0.10)] to-[rgba(138,110,242,0.20)]">
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoUrl} alt="Your public profile preview" className="h-full w-full object-cover" />
        ) : (
          <div className="empty-glow flex h-full w-full items-center justify-center">
            <div className="relative text-center">
              <span className="font-[family-name:var(--font-display)] text-7xl tracking-[-0.08em] text-white/85">{initials(profile.display_name)}</span>
              <p className="mt-3 text-xs font-bold uppercase tracking-[0.18em] text-white/55">Add a cover photo</p>
            </div>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-black/82 via-black/36 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5">
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/58">Public preview</p>
              <h2 className="mt-2 font-[family-name:var(--font-display)] text-4xl leading-[0.92] tracking-[-0.055em] text-white">
                {profile.display_name || "Your name"}{age ? <span className="ml-2 font-sans text-2xl font-semibold text-white/78">{age}</span> : null}
              </h2>
              <p className="mt-2 truncate text-sm font-medium text-white/72">
                {location || "Location not set"}{profile.occupation ? ` · ${profile.occupation}` : ""}
              </p>
            </div>
            {profile.is_verified ? (
              <span className="shrink-0 rounded-full border border-[rgba(166,230,220,0.35)] bg-[rgba(79,184,167,0.20)] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[var(--color-teal-300)]">
                Verified
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="space-y-5 p-5">
        <p className="text-sm leading-7 text-[var(--color-pearl)]/90">
          {profile.bio || "Your bio will appear here. A specific, warm introduction helps the right people recognize you."}
        </p>

        {prompt ? (
          <div className="rounded-2xl border border-white/8 bg-white/[0.035] p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--color-gold-300)]">{prompt.prompt}</p>
            <p className="mt-2 text-sm leading-6 text-[var(--color-pearl)]/90">{prompt.answer}</p>
          </div>
        ) : null}

        {profile.relationship_goals?.length ? (
          <div className="flex flex-wrap gap-2">
            {profile.relationship_goals.slice(0, 3).map((goal) => (
              <span key={goal} className="rounded-full border border-[rgba(246,215,154,0.25)] bg-[rgba(217,167,82,0.10)] px-3 py-1.5 text-xs font-bold text-[var(--color-pearl)]">
                {humanize(goal)}
              </span>
            ))}
          </div>
        ) : null}

        {profile.interests?.length ? (
          <div className="flex flex-wrap gap-2">
            {profile.interests.slice(0, 6).map((interest) => (
              <span key={interest} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-[var(--color-mist)]">
                {interest}
              </span>
            ))}
          </div>
        ) : null}

        <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-4 text-xs leading-5 text-[var(--color-mist)]">
          Hidden from public view: email, full birth date, account provider details, and internal status.
        </div>
      </div>
    </section>
  );
}
