import { previewProfiles } from "@freeborn/shared";

export function PhonePreview() {
  return (
    <div className="relative flex justify-center lg:justify-end">
      <div className="premium-border relative w-full max-w-[520px] overflow-hidden rounded-[42px] bg-white/[0.05] p-4 shadow-[var(--shadow-glow)] backdrop-blur-md">
        <div className="absolute inset-x-10 top-0 h-px bg-white/30" />
        <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,#0b1524_0%,#111f34_100%)] px-5 pb-5 pt-6">
          <div className="absolute left-1/2 top-3 h-1.5 w-24 -translate-x-1/2 rounded-full bg-white/10" />
          <div className="flex items-center justify-between pt-3">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--color-stone)]">Freeborn preview</p>
              <h3 className="mt-2 font-[family-name:var(--font-display)] text-3xl tracking-[-0.04em] text-[var(--color-pearl)]">
                Designed to linger.
              </h3>
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-[var(--color-pearl)]">
              Phase 0
            </div>
          </div>

          <div className="relative mt-8 min-h-[500px]">
            {previewProfiles.map((profile, index) => (
              <article
                key={profile.name}
                className="absolute inset-x-0 rounded-[30px] border border-white/10 p-5 shadow-[0_22px_54px_rgba(5,10,18,0.3)]"
                style={{
                  top: `${index * 110}px`,
                  transform: `scale(${1 - index * 0.04}) translateX(${index * 12}px)`,
                  background: `linear-gradient(145deg, ${profile.gradient[0]} 0%, ${profile.gradient[1]} 100%)`,
                  opacity: index === 0 ? 1 : 0.9,
                }}
              >
                <div className="rounded-[24px] bg-[rgba(7,16,28,0.4)] p-5 backdrop-blur-md">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-[family-name:var(--font-display)] text-4xl leading-none tracking-[-0.05em] text-[var(--color-pearl)]">
                        {profile.name}
                        <span className="ml-2 text-2xl opacity-80">{profile.age}</span>
                      </h4>
                      <p className="mt-3 text-sm text-[rgba(255,250,245,0.8)]">{profile.location}</p>
                    </div>
                    <div className="rounded-full border border-white/18 bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-pearl)]">
                      Verified
                    </div>
                  </div>
                  <p className="mt-6 max-w-[28ch] text-base leading-7 text-[rgba(255,250,245,0.92)]">{profile.headline}</p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {profile.traits.map((trait) => (
                      <span key={trait} className="rounded-full border border-white/18 bg-white/10 px-3 py-2 text-xs font-medium text-[var(--color-pearl)]">
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))}

            <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-4 rounded-[28px] border border-white/10 bg-[rgba(7,16,28,0.65)] p-5 backdrop-blur-xl">
              <button className="flex h-14 w-14 items-center justify-center rounded-full border border-white/12 bg-white/8 text-2xl text-[var(--color-pearl)] transition hover:bg-white/14">
                ×
              </button>
              <button className="flex h-16 flex-1 items-center justify-center rounded-full bg-[var(--color-pearl)] px-5 text-sm font-bold text-[var(--color-ink)] transition hover:translate-y-[-1px] hover:bg-white">
                Intentional match preview
              </button>
              <button className="flex h-14 w-14 items-center justify-center rounded-full border border-white/12 bg-white/8 text-2xl text-[var(--color-pearl)] transition hover:bg-white/14">
                ✓
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
