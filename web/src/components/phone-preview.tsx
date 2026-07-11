import { previewProfiles } from "@freeborn/shared";
import { BadgeIcon, HeartIcon, SparkIcon, CloseIcon } from "@/components/icons";

export function PhonePreview() {
  const [front, ...rest] = previewProfiles;

  return (
    <div className="relative mx-auto w-full max-w-[420px] lg:max-w-none lg:w-[440px]">
      {/* Ambient aura behind the phone */}
      <div
        className="pointer-events-none absolute -inset-16 blur-3xl opacity-70"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(239,94,94,0.28), transparent 60%), radial-gradient(ellipse 50% 40% at 70% 60%, rgba(138,110,242,0.22), transparent 60%)",
        }}
      />

      {/* Phone frame */}
      <div className="relative ring-ember rounded-[48px] p-[3px] shadow-[0_60px_120px_-20px_rgba(0,0,0,0.8)]">
        <div
          className="relative overflow-hidden rounded-[45px]"
          style={{
            background:
              "linear-gradient(180deg, #0d1122 0%, #151a33 50%, #0d1122 100%)",
          }}
        >
          {/* Notch */}
          <div className="pointer-events-none absolute left-1/2 top-2 z-30 h-7 w-28 -translate-x-1/2 rounded-full bg-black" />

          {/* Status bar */}
          <div className="relative z-20 flex items-center justify-between px-7 pt-3.5 text-[11px] font-semibold text-[var(--color-pearl)]/80">
            <span>9:41</span>
            <div className="flex items-center gap-1.5">
              {/* Signal */}
              <svg width="17" height="10" viewBox="0 0 17 10" fill="currentColor"><rect x="0" y="6" width="3" height="4" rx="1"/><rect x="4.5" y="4" width="3" height="6" rx="1"/><rect x="9" y="2" width="3" height="8" rx="1"/><rect x="13.5" y="0" width="3" height="10" rx="1"/></svg>
              {/* Wifi */}
              <svg width="15" height="11" viewBox="0 0 15 11" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M1 4c3.8-3.5 9.2-3.5 13 0"/><path d="M3.3 6.5c2.5-2.2 6-2.2 8.5 0"/><path d="M5.6 8.9c1.2-1 2.7-1 4 0"/><circle cx="7.5" cy="10" r="0.6" fill="currentColor"/></svg>
              {/* Battery */}
              <div className="flex items-center">
                <div className="h-[10px] w-[22px] rounded-[3px] border border-current/50 p-[1.5px]"><div className="h-full w-[80%] rounded-[1.5px] bg-current" /></div>
                <div className="ml-0.5 h-[4px] w-[1.5px] rounded-r bg-current/60" />
              </div>
            </div>
          </div>

          {/* App header */}
          <div className="relative z-20 flex items-center justify-between px-6 pt-5 pb-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-[var(--color-sand)]/70">
                Tonight in Brooklyn
              </p>
              <h3
                className="mt-1 text-[22px] leading-none"
                style={{ fontFamily: "var(--font-display)", fontVariationSettings: "'wght' 500, 'opsz' 144" }}
              >
                Someone you&apos;ll remember.
              </h3>
            </div>
            <button className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[var(--color-pearl)]/80 backdrop-blur">
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-ember-500)] text-[8px] font-bold">2</span>
              <HeartIcon size={16} />
            </button>
          </div>

          {/* Card stack */}
          <div className="relative px-4 pt-2">
            <div className="relative mx-auto aspect-[3/4.2] w-full">
              {/* Back cards (peeking) */}
              {rest
                .slice()
                .reverse()
                .map((p, i) => {
                  const depth = rest.length - i;
                  return (
                    <div
                      key={p.name}
                      className="absolute inset-x-0 rounded-[28px] border border-white/5 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)]"
                      style={{
                        top: `${depth * 14}px`,
                        transform: `scale(${1 - depth * 0.06}) translateY(0)`,
                        zIndex: depth,
                        opacity: 0.9 - depth * 0.25,
                        background: `linear-gradient(160deg, ${p.palette[0]}, ${p.palette[1]})`,
                      }}
                    />
                  );
                })}

              {/* Front card */}
              <article
                className="absolute inset-0 overflow-hidden rounded-[28px] shadow-[0_30px_70px_-15px_rgba(0,0,0,0.7)] ring-pearl"
                style={{
                  background: `linear-gradient(165deg, ${front.palette[0]} 0%, ${front.palette[1]} 100%)`,
                  zIndex: 10,
                }}
              >
                {/* Inner glow */}
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(ellipse 70% 50% at 30% 20%, rgba(255,220,180,0.35), transparent 60%)",
                  }}
                />

                {/* Decorative pattern (soft) */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-20"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 80% 10%, rgba(255,255,255,0.35) 0%, transparent 40%)",
                  }}
                />

                {/* Top actions */}
                <div className="relative z-10 flex items-center justify-between p-4">
                  <div className="flex items-center gap-1.5 rounded-full bg-black/20 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/95 backdrop-blur">
                    <BadgeIcon size={12} />
                    Verified
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black/20 text-white/95 backdrop-blur">
                    <SparkIcon size={16} />
                  </div>
                </div>

                {/* Spacer — faux photo area */}
                <div className="relative flex-1" />

                {/* Gradient bottom fade */}
                <div
                  className="absolute inset-x-0 bottom-0 h-3/5"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(5,7,13,0.85) 0%, rgba(5,7,13,0.4) 50%, transparent 100%)",
                  }}
                />

                {/* Prompt card */}
                <div className="absolute inset-x-4 bottom-24 z-10 rounded-2xl border border-white/15 bg-black/35 p-4 backdrop-blur-md">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/70">
                    {front.prompt}
                  </p>
                  <p
                    className="mt-1.5 text-[15px] leading-snug text-white"
                    style={{ fontFamily: "var(--font-display)", fontVariationSettings: "'wght' 400, 'opsz' 144" }}
                  >
                    “{front.answer}”
                  </p>
                </div>

                {/* Name + meta */}
                <div className="absolute inset-x-4 bottom-5 z-10">
                  <div className="flex items-end justify-between">
                    <div>
                      <h4
                        className="text-[34px] leading-[0.95] tracking-tight text-white"
                        style={{ fontFamily: "var(--font-display)", fontVariationSettings: "'wght' 500, 'opsz' 144" }}
                      >
                        {front.name}
                        <span className="ml-1.5 text-[22px] font-normal opacity-90">{front.age}</span>
                      </h4>
                      <p className="mt-1 text-[12px] text-white/80">{front.job} · {front.location}</p>
                    </div>
                  </div>

                  {/* Traits */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {front.traits.map((t) => (
                      <span
                        key={t}
                        className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-white/90 backdrop-blur"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            </div>

            {/* Action bar */}
            <div className="relative z-20 mt-5 flex items-center justify-center gap-4 pb-6">
              <button className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white/85 backdrop-blur-md transition hover:scale-105 hover:bg-white/15">
                <CloseIcon size={18} />
              </button>
              <button
                className="group relative flex h-14 items-center gap-2 rounded-full px-8 text-[13px] font-bold text-[var(--color-ink)] shadow-[0_12px_30px_-6px_rgba(239,94,94,0.6)] transition hover:scale-[1.02] btn-shine overflow-hidden"
                style={{ background: "linear-gradient(135deg, #fff 0%, #f6d79a 100%)" }}
              >
                <HeartIcon size={16} />
                Say hello
              </button>
              <button className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/10 text-[var(--color-gold-300)] backdrop-blur-md transition hover:scale-105 hover:bg-white/15">
                <SparkIcon size={18} />
              </button>
            </div>
          </div>

          {/* Home indicator */}
          <div className="mx-auto mb-2 mt-1 h-1 w-32 rounded-full bg-white/30" />
        </div>
      </div>

      {/* Floating mini-match card */}
      <div
        className="float absolute -left-6 top-24 z-20 hidden w-56 rounded-2xl border border-white/10 p-3 backdrop-blur-xl sm:block"
        style={{ background: "rgba(20,25,45,0.7)", boxShadow: "0 20px 40px -10px rgba(0,0,0,0.6)" }}
      >
        <div className="flex items-center gap-2.5">
          <div className="relative h-9 w-9 overflow-hidden rounded-full" style={{ background: "linear-gradient(135deg,#ef5e5e,#d9a752)" }}>
            <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">A</div>
          </div>
          <div className="min-w-0">
            <p className="text-[12px] font-semibold text-white">Amara liked you back</p>
            <p className="text-[10px] text-[var(--color-sand)]/80">Say something thoughtful →</p>
          </div>
        </div>
      </div>

      {/* Floating "verified" pill */}
      <div
        className="float-alt absolute -right-4 bottom-28 z-20 hidden w-48 rounded-2xl border border-white/10 px-3 py-2.5 backdrop-blur-xl sm:flex items-center gap-2"
        style={{ background: "rgba(20,25,45,0.7)", boxShadow: "0 20px 40px -10px rgba(0,0,0,0.6)" }}
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-teal-500)]/20 text-[var(--color-teal-300)]">
          <BadgeIcon size={14} />
        </span>
        <div>
          <p className="text-[11px] font-semibold text-white">Private essentials</p>
          <p className="text-[9px] text-[var(--color-sand)]/80">Email and birth date hidden</p>
        </div>
      </div>
    </div>
  );
}
