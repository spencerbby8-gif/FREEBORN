import Link from "next/link";
import { brand } from "@freeborn/shared";
import { Wordmark } from "@/components/wordmark";
import { BadgeIcon, HeartIcon, ShieldIcon } from "@/components/icons";

const trustPoints = [
  {
    icon: ShieldIcon,
    title: "Private essentials",
    body: "Email and full birth date stay out of discovery, while your public profile stays editable.",
  },
  {
    icon: BadgeIcon,
    title: "Badges have to be earned",
    body: "Verification status is visible only when a profile has it — never implied by default.",
  },
  {
    icon: HeartIcon,
    title: "Context before impulse",
    body: "Intentions, interests, location, and profile completeness sit beside the photos."
  },
] as const;

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="aurora-field" />
      <div className="pointer-events-none absolute inset-0 hero-grid opacity-25" />
      <div className="orb drift absolute -left-24 -top-24 h-80 w-80 rounded-full bg-[rgba(239,94,94,0.16)] blur-[2px]" />
      <div className="orb drift-alt absolute -right-24 top-10 h-96 w-96 rounded-full bg-[rgba(138,110,242,0.15)] blur-[2px]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1280px] flex-col px-6 py-6 sm:px-8 lg:px-10">
        <header className="surface ring-pearl flex items-center justify-between rounded-full px-4 py-3 sm:px-6">
          <Wordmark />
          <Link
            href="/"
            className="rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-[var(--color-pearl)] transition hover:bg-white/10"
          >
            Back to home
          </Link>
        </header>

        <section className="grid flex-1 items-center gap-10 py-8 lg:grid-cols-[1fr_0.92fr] lg:py-16">
          <div className="hidden lg:block">
            <div className="surface magic-border relative overflow-hidden rounded-[32px] p-9 shadow-[0_42px_120px_-44px_rgba(239,94,94,0.75)] xl:p-11">
              <div
                className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full opacity-70 blur-2xl"
                style={{ background: "radial-gradient(circle, rgba(217,167,82,0.22), transparent 65%)" }}
              />
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-stone)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-ember-500)]" />
                Dating, with intention
              </div>
              <h1 className="relative mt-6 font-[family-name:var(--font-display)] text-[clamp(2.25rem,3.4vw,3.4rem)] leading-[1.0] tracking-[-0.04em] text-[var(--color-pearl)]">
                Trust should feel effortless from the first step.
              </h1>
              <p className="relative mt-5 max-w-lg text-lg leading-8 text-[var(--color-mist)]">
                {brand.manifesto}
              </p>

              <div className="relative mt-9 space-y-3">
                {trustPoints.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.title}
                      className="hover-lift luminous-card flex items-start gap-4 rounded-2xl border border-white/8 bg-white/[0.035] p-4 transition hover:border-white/14 hover:bg-white/[0.06]"
                    >
                      <span className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-[var(--color-ember-300)]">
                        <Icon size={18} />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-[var(--color-pearl)]">{item.title}</p>
                        <p className="mt-0.5 text-[13px] leading-6 text-[var(--color-mist)]">{item.body}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center">{children}</div>
        </section>
      </div>
    </main>
  );
}
