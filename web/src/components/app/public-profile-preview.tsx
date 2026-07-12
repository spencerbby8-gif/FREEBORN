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
    <section className="luminous-card magic-border relative overflow-hidden rounded-[40px] border border-white/10 bg-[rgba(9,16,28,0.92)] shadow-[var(--shadow-card-lg)]">
      <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-[rgba(239,94,94,0.15)] via-[rgba(217,167,82,0.08)] to-[rgba(138,110,242,0.12)]">
        {photoUrl ? (
          <img src={photoUrl} alt="Public profile preview" className="h-full w-full object-cover transition duration-1000 hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <div className="relative text-center">
              <span className="text-8xl tracking-tighter text-white/20" style={{ fontFamily: "var(--font-display)", fontVariationSettings: "'opsz' 144, 'wght' 500" }}>{initials(profile.display_name)}</span>
              <p className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-ash)]">Photo Required</p>
            </div>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-8 sm:p-10">
          <div className="flex items-end justify-between gap-4">
            <div className="min-w-0">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-white/60 backdrop-blur-md">
                <span className="h-1 w-1 rounded-full bg-white/40" />
                Live Preview
              </div>
              <h2 
                className="text-[clamp(2.25rem,6vw,3.5rem)] leading-[0.9] tracking-tight text-white"
                style={{ fontFamily: "var(--font-display)", fontVariationSettings: "'opsz' 144, 'wght' 500" }}
              >
                {profile.display_name || "New Member"}{age ? <span className="ml-3 text-2xl font-bold opacity-60">{age}</span> : null}
              </h2>
              <p className="mt-3 truncate text-[15px] font-bold uppercase tracking-widest text-white/70">
                {location || "Location pending"}{profile.occupation ? ` · ${profile.occupation}` : ""}
              </p>
            </div>
            {profile.is_verified ? (
              <div className="shrink-0 rounded-full border border-[var(--color-teal-500)]/30 bg-[var(--color-teal-500)]/20 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[var(--color-teal-300)] backdrop-blur-xl">
                Verified
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="space-y-8 p-8 sm:p-10">
        <p className="text-[17px] font-medium leading-relaxed text-[var(--color-pearl)]/90">
          {profile.bio || "Your introduction will appear here. Share your values and lifestyle to connect with intentional people."}
        </p>

        {prompt ? (
          <div className="rounded-[32px] border border-white/5 bg-white/[0.02] p-6 shadow-inner transition-all hover:bg-white/[0.04]">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--color-gold-300)]">{prompt.prompt}</p>
            <p className="mt-3 text-[16px] font-bold leading-relaxed text-[var(--color-pearl)]/90">{prompt.answer}</p>
          </div>
        ) : null}

        {profile.relationship_goals?.length ? (
          <div className="flex flex-wrap gap-2.5">
            {profile.relationship_goals.slice(0, 3).map((goal) => (
              <span key={goal} className="rounded-full border border-[var(--color-gold-500)]/20 bg-[var(--color-gold-500)]/5 px-4 py-2 text-[12px] font-bold text-[var(--color-gold-300)] shadow-[0_0_15px_rgba(217,167,82,0.1)]">
                {humanize(goal)}
              </span>
            ))}
          </div>
        ) : null}

        {profile.interests?.length ? (
          <div className="flex flex-wrap gap-2">
            {profile.interests.slice(0, 8).map((interest) => (
              <span key={interest} className="rounded-full border border-white/5 bg-white/[0.03] px-3.5 py-1.5 text-[12px] font-bold text-[var(--color-sand)] transition-colors hover:bg-white/10">
                {interest}
              </span>
            ))}
          </div>
        ) : null}

        <div className="flex items-center gap-3 rounded-[24px] border border-white/5 bg-white/[0.015] p-5">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-ash)]/20 text-[10px] font-black text-[var(--color-ash)]">i</span>
          <p className="text-[12px] font-medium leading-relaxed text-[var(--color-ash)]">
            Privacy protection active: your email, full birth date, and medical details are never displayed.
          </p>
        </div>
      </div>
    </section>
  );
}
