import { previewProfiles } from "@freeborn/shared";

export function PhonePreview() {
  return (
    <div className="relative flex justify-center lg:justify-end">
      <div className="premium-border relative w-full max-w-[480px] overflow-hidden rounded-[44px] bg-white/[0.06] p-[3px] shadow-[var(--shadow-glow)] backdrop-blur-xl">
        <div className="relative overflow-hidden rounded-[41px] bg-[linear-gradient(180deg,#0b1524_0%,#111f34_100%)]">
          {/* Status bar */}
          <div className="relative z-10 flex items-center justify-between px-6 pt-4">
            <span className="text-xs font-semibold text-white/60">9:41</span>
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-4 rounded-sm border border-white/30" />
              <div className="h-2.5 w-2.5 rounded-full border border-white/30" />
            </div>
          </div>

          {/* Content */}
          <div className="px-5 pb-5 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/50">Discover</p>
                <h3 className="mt-1 font-[family-name:var(--font-display)] text-2xl tracking-[-0.04em] text-[var(--color-pearl)]">
                  Thoughtful people
                </h3>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5">
                <div className="h-4 w-4 rounded-full border border-white/30" />
              </div>
            </div>

            {/* Profile cards */}
            <div className="relative mt-6 min-h-[440px]">
              {previewProfiles.map((profile, index) => (
                <article
                  key={profile.name}
                  className="absolute inset-x-0 rounded-3xl border border-white/10 p-5 shadow-[0_22px_54px_rgba(5,10,18,0.4)]"
                  style={{
                    top: `${index * 100}px`,
                    transform: `scale(${1 - index * 0.04}) translateX(${index * 10}px)`,
                    background: `linear-gradient(145deg, ${profile.gradient[0]} 0%, ${profile.gradient[1]} 100%)`,
                    opacity: index === 0 ? 1 : 0.85,
                    zIndex: 2 - index,
                  }}
                >
                  <div className="rounded-2xl bg-[rgba(7,16,28,0.35)] p-5 backdrop-blur-md">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="font-[family-name:var(--font-display)] text-3xl leading-none tracking-[-0.05em] text-[var(--color-pearl)]">
                          {profile.name}
                          <span className="ml-2 text-xl font-sans opacity-80">{profile.age}</span>
                        </h4>
                        <p className="mt-2 text-sm text-white/70">{profile.location}</p>
                      </div>
                      <div className="rounded-full border border-white/18 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-white">
                        Verified
                      </div>
                    </div>
                    <p className="mt-4 max-w-[28ch] text-sm leading-7 text-white/90">{profile.headline}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {profile.traits.map((trait) => (
                        <span key={trait} className="rounded-full border border-white/18 bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-white">
                          {trait}
                        </span>
                      ))}
                    </div>
                  </div>
                </article>
              ))}

              {/* Action bar */}
              <div
                className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-4 rounded-2xl border border-white/10 bg-[rgba(7,16,28,0.7)] p-4 backdrop-blur-xl"
                style={{ zIndex: 10 }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/12 bg-white/8 text-lg text-white/70 transition hover:bg-white/14">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="12" x2="21" y2="12" /><polyline points="8,5 3,12 8,19" /></svg>
                </div>
                <div className="flex h-14 flex-1 items-center justify-center rounded-full bg-gradient-to-r from-[var(--color-accent-rose)] to-[var(--color-accent-gold)] px-5 text-sm font-bold text-white shadow-lg transition hover:translate-y-[-1px]">
                  Connect
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/12 bg-white/8 text-lg text-white/70 transition hover:bg-white/14">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78l8.84 8.84 8.84-8.84a5.5 5.5 0 0 0 0-7.78z" /></svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
