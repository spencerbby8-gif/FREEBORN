import Link from "next/link";
import type { ProfilePhoto, UserProfileRow } from "@freeborn/shared";
import { BadgeIcon, CameraIcon, EyeIcon, LockIcon, PinIcon, ShieldIcon, SparkIcon, UserIcon } from "@/components/icons";
import { ageFromBirthDate, completionItems, humanize, initials, locationLabel, primaryPhoto, profileStrength, publicPhotoUrl } from "./profile-utils";

type IconName = "edit" | "preview" | "photos" | "verification" | "discovery" | "privacy";

function HubIcon({ name }: { name: IconName }) {
  if (name === "preview") return <EyeIcon size={20} />;
  if (name === "photos") return <CameraIcon size={20} />;
  if (name === "verification") return <BadgeIcon size={20} />;
  if (name === "discovery") return <SparkIcon size={20} />;
  if (name === "privacy") return <LockIcon size={20} />;
  return <UserIcon size={20} />;
}

function StatusPill({ active, label }: { active: boolean; label: string }) {
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-widest ${
      active ? "border-[var(--color-teal-500)]/30 bg-[var(--color-teal-500)]/10 text-[var(--color-teal-300)]" : "border-white/10 bg-white/5 text-[var(--color-ash)]"
    }`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current shadow-[0_0_8px_currentColor]" />
      {label}
    </span>
  );
}

export function ProfileHub({ profile, photos, userEmail }: { profile: UserProfileRow; photos: ProfilePhoto[]; userEmail?: string | null }) {
  const primary = primaryPhoto(photos);
  const photoUrl = publicPhotoUrl(primary?.storage_path);
  const strength = profileStrength(profile, photos);
  const age = ageFromBirthDate(profile.birth_date);
  const items = completionItems(profile, photos);
  const missing = items.filter((item) => !item.done);
  const highImpact = missing.filter((item) => item.impact === "High").slice(0, 3);
  const completeCount = items.length - missing.length;

  const actions: Array<{ label: string; body: string; href: string; icon: IconName; primary?: boolean }> = [
    { label: strength >= 80 ? "Edit Profile" : "Improve Profile", body: "Update your public story and essentials.", href: "/app/profile/about-me", icon: "edit", primary: true },
    { label: "Preview Profile", body: "See the Discover presentation others see.", href: "/app/profile/preview", icon: "preview" },
    { label: "Photos", body: "Manage cover, order, quality, and gallery.", href: "/app/profile/photos", icon: "photos" },
    { label: "Verification", body: profile.identity_consistency_status === "mismatch_reverify_required" ? "We need to confirm your updated photos." : profile.identity_consistency_status === "periodic_reverification_due" ? "Please complete a quick selfie check." : profile.identity_consistency_status === "pending_photos" && !profile.is_verified ? "Please add a public photo before completing verification." : profile.is_verified ? "Your verification badge is active." : "Complete your trust signal.", href: "/app/profile/verification", icon: "verification" },
    { label: "Discovery Settings", body: "Tune age, distance, intent, and filters.", href: "/app/profile/privacy-visibility", icon: "discovery" },
    { label: "Privacy", body: "Control visibility and private account status.", href: "/app/profile/privacy-visibility", icon: "privacy" },
  ];

  return (
    <div className="mx-auto w-full max-w-[1220px] space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--color-stone)]">Profile</p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-[clamp(2.35rem,5vw,4.25rem)] leading-[0.92] tracking-[-0.06em] text-[var(--color-pearl)]">
            Shape how people meet you.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--color-mist)] sm:text-base">
            Your hub shows readiness, trust, visibility, and the fastest path to a profile that feels specific, safe, and easy to choose.
          </p>
        </div>
        <Link href="/app" className="inline-flex h-12 w-fit items-center justify-center rounded-full border border-white/12 bg-white/[0.04] px-5 text-sm font-bold text-[var(--color-pearl)] transition hover:bg-white/[0.08]">
          Back to Discover
        </Link>
      </header>

      <section className="luminous-card magic-border relative overflow-hidden rounded-[44px] border border-white/10 bg-[rgba(9,16,28,0.92)] p-5 shadow-[var(--shadow-card-lg)] sm:p-8 lg:p-10">
        <div className="absolute -right-28 -top-28 h-72 w-72 rounded-full bg-[var(--color-gold-500)]/10 blur-[90px]" />
        <div className="absolute -bottom-36 left-1/3 h-80 w-80 rounded-full bg-[var(--color-teal-500)]/8 blur-[100px]" />
        <div className="relative grid gap-7 lg:grid-cols-[220px_minmax(0,1fr)_280px] lg:items-center">
          <div className="relative mx-auto h-48 w-48 overflow-hidden rounded-[38px] border border-white/10 bg-gradient-to-br from-rose-500/20 to-amber-500/10 shadow-inner lg:mx-0">
            {photoUrl ? (
              <img alt="Your primary profile photo" src={photoUrl} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-[family-name:var(--font-display)] text-6xl text-white/35">
                {initials(profile.display_name)}
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/70">Cover photo</p>
            </div>
          </div>

          <div className="min-w-0 text-center lg:text-left">
            <div className="flex flex-wrap items-center justify-center gap-2.5 lg:justify-start">
              <StatusPill active={profile.is_verified} label={profile.identity_consistency_status === "mismatch_reverify_required" || profile.identity_consistency_status === "periodic_reverification_due" ? "Photo check needed" : profile.identity_consistency_status === "pending_photos" && !profile.is_verified ? "Public photo needed" : profile.is_verified ? "Verified" : "Not verified yet"} />
              <StatusPill active={profile.discoverable} label={profile.discoverable ? "Visible in discovery" : "Hidden from discovery"} />
              <StatusPill active={profile.profile_status === "active"} label={humanize(profile.profile_status || "draft")} />
            </div>
            <h2 className="mt-5 font-[family-name:var(--font-display)] text-[clamp(2.4rem,7vw,5rem)] leading-[0.88] tracking-[-0.06em] text-[var(--color-pearl)]">
              {profile.display_name || "New Member"}{age ? <span className="ml-3 text-[0.45em] font-black text-[var(--color-mist)]">{age}</span> : null}
            </h2>
            <p className="mt-4 flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-[var(--color-ash)] lg:justify-start">
              <PinIcon size={16} /> {locationLabel(profile)}{profile.occupation ? ` · ${profile.occupation}` : ""}
            </p>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-[var(--color-mist)] sm:text-base">
              {profile.bio || "Add a short, specific bio so people understand your values, rhythm, and relationship direction before they make a choice."}
            </p>
          </div>

          <div className="rounded-[34px] border border-white/10 bg-white/[0.035] p-5 shadow-inner">
            <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-[var(--color-ash)]">
              <span>Profile strength</span>
              <span className="text-[var(--color-pearl)]">{strength}%</span>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/8">
              <div className="h-full rounded-full bg-gradient-to-r from-[var(--color-ember-500)] via-[var(--color-gold-500)] to-[var(--color-teal-500)] transition-all duration-1000" style={{ width: `${strength}%` }} />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/8 bg-black/10 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-ash)]">Completion</p>
                <p className="mt-1 text-lg font-black text-[var(--color-pearl)]">{completeCount}/{items.length}</p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-black/10 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-ash)]">Photos</p>
                <p className="mt-1 text-lg font-black text-[var(--color-pearl)]">{photos.length}/6</p>
              </div>
            </div>
            <p className="mt-4 text-xs leading-5 text-[var(--color-mist)]">Email and full birth date stay private. {userEmail ? "Account email is only shown in Account Status." : ""}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {actions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className={`group rounded-[30px] border p-5 transition-all hover:-translate-y-0.5 hover:bg-white/[0.06] ${action.primary ? "border-[var(--color-gold-500)]/25 bg-[var(--color-gold-500)]/8" : "border-white/10 bg-white/[0.025]"}`}
          >
            <div className="flex items-start gap-4">
              <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${action.primary ? "bg-[var(--color-gold-500)] text-[var(--color-ink)]" : "bg-white/[0.05] text-[var(--color-gold-300)]"}`}>
                <HubIcon name={action.icon} />
              </span>
              <span>
                <span className="block text-lg font-black text-[var(--color-pearl)]">{action.label}</span>
                <span className="mt-1 block text-sm leading-6 text-[var(--color-mist)]">{action.body}</span>
              </span>
            </div>
          </Link>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-[38px] border border-white/10 bg-white/[0.025] p-6 shadow-[var(--shadow-raised)] sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[var(--color-sand)]">Completion intelligence</p>
              <h3 className="mt-3 text-2xl font-black tracking-tight text-[var(--color-pearl)]">What will improve matching most?</h3>
            </div>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-black uppercase tracking-widest text-[var(--color-mist)]">{missing.length} remaining</span>
          </div>

          <div className="mt-6 grid gap-3">
            {(highImpact.length ? highImpact : missing.slice(0, 3)).map((item) => (
              <Link key={item.id} href={item.href} className="flex items-center justify-between gap-4 rounded-3xl border border-white/8 bg-white/[0.025] p-4 transition hover:border-white/16 hover:bg-white/[0.05]">
                <span>
                  <span className="block text-sm font-black text-[var(--color-pearl)]">{item.label}</span>
                  <span className="mt-1 block text-xs leading-5 text-[var(--color-mist)]">{item.detail}</span>
                </span>
                <span className="shrink-0 rounded-full bg-[var(--color-pearl)] px-4 py-2 text-xs font-black text-[var(--color-ink)]">Complete</span>
              </Link>
            ))}
            {!missing.length ? (
              <div className="rounded-3xl border border-[var(--color-teal-500)]/20 bg-[var(--color-teal-500)]/8 p-5 text-sm font-bold text-[var(--color-teal-300)]">
                Your essentials are complete. Keep your photos and bio current as your life changes.
              </div>
            ) : null}
          </div>

          <div className="mt-8 border-t border-white/8 pt-6">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[var(--color-ash)]">Profile sections dashboard</p>
              <span className="text-[11px] font-bold text-[var(--color-mist)]">{items.filter(i => i.done).length} of {items.length} sections completed</span>
            </div>
            <div className="mt-4 grid gap-3.5 sm:grid-cols-2">
              {items.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="group flex flex-col justify-between rounded-[26px] border border-white/10 bg-white/[0.025] p-5 transition-all hover:-translate-y-0.5 hover:border-[var(--color-gold-500)]/35 hover:bg-white/[0.06]"
                >
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-base font-black text-[var(--color-pearl)] group-hover:text-[var(--color-gold-300)] transition-colors">{item.label}</span>
                      <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${item.done ? "border border-[var(--color-teal-500)]/30 bg-[var(--color-teal-500)]/15 text-[var(--color-teal-300)]" : "border border-[var(--color-gold-500)]/30 bg-[var(--color-gold-500)]/15 text-[var(--color-gold-300)]"}`}>{item.done ? "✓ Done" : item.impact}</span>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-[var(--color-mist)]">{item.detail}</p>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-white/8 pt-3 text-[11px] font-black uppercase tracking-widest text-[var(--color-ash)] group-hover:text-[var(--color-pearl)]">
                    <span>{item.done ? "Review or edit" : "Complete section"}</span>
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-[38px] border border-white/10 bg-white/[0.025] p-6 shadow-[var(--shadow-raised)] sm:p-8">
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[var(--color-sand)]">Trust ledger</p>
          <div className="mt-5 space-y-3">
            {[
              [profile.identity_consistency_status === "mismatch_reverify_required" ? "Photo confirmation needed" : profile.identity_consistency_status === "periodic_reverification_due" ? "Periodic check due" : profile.identity_consistency_status === "pending_photos" && !profile.is_verified ? "Public photo needed" : profile.is_verified ? "Verified badge active" : "Verification not complete", profile.identity_consistency_status === "mismatch_reverify_required" ? "Your profile photos changed recently, so we need a quick fresh verification check." : profile.identity_consistency_status === "periodic_reverification_due" ? "Your periodic verification renewal check is due. Please complete a quick selfie check." : profile.identity_consistency_status === "pending_photos" && !profile.is_verified ? "Please add at least one public profile photo first before the public verified badge can appear." : profile.is_verified ? "Shown only because verification is true." : "No public badge will be shown yet."],
              [profile.discoverable ? "Visible in discovery" : "Hidden from discovery", profile.discoverable ? "Members can see your profile if filters match." : "You will not appear in discovery while hidden."],
              ["Private account details", "Email, full birth date, auth provider, and exact coordinates stay private."],
            ].map(([title, body]) => (
              <div key={title} className="rounded-2xl border border-white/8 bg-black/10 p-4">
                <div className="flex items-center gap-2 text-sm font-black text-[var(--color-pearl)]"><ShieldIcon size={16} className="text-[var(--color-gold-300)]" /> {title}</div>
                <p className="mt-2 text-xs leading-5 text-[var(--color-mist)]">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
