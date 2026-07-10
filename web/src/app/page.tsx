import Link from "next/link";
import { brand, productPillars } from "@freeborn/shared";
import { PhonePreview } from "@/components/phone-preview";
import { SectionLabel } from "@/components/section-label";
import { Wordmark } from "@/components/wordmark";

const stats = [
  { stat: "92%", label: "of members say clarity matters more than volume" },
  { stat: "3x", label: "more meaningful connections with intent-led profiles" },
  { stat: "Zero", label: "tolerance for rushed, throwaway experiences" },
] as const;

const features = [
  {
    title: "Designed for depth",
    body: "Profiles shaped around values, goals, and emotional clarity before a single conversation begins.",
    gradient: "from-rose-400/20 to-amber-400/10",
  },
  {
    title: "Trust built in",
    body: "Verification, respectful defaults, and privacy controls are part of the foundation, not an afterthought.",
    gradient: "from-sky-400/20 to-violet-400/10",
  },
  {
    title: "Premium by feel",
    body: "Subtle motion, balanced spacing, and deeply considered details create an experience people want to stay in.",
    gradient: "from-emerald-400/20 to-teal-400/10",
  },
] as const;

export default function Home() {
  return (
    <main className="relative overflow-hidden">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 hero-grid opacity-30" />
      <div className="orb absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-[rgba(255,133,120,0.12)]" />
      <div className="orb orb-alt absolute -right-32 top-0 h-[600px] w-[600px] rounded-full bg-[rgba(140,207,255,0.10)]" />
      <div className="orb absolute -bottom-32 left-1/3 h-[400px] w-[400px] rounded-full bg-[rgba(188,173,255,0.08)]" style={{ animationDelay: "-10s" }} />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1280px] flex-col px-6 pb-20 pt-6 sm:px-8 lg:px-10">
        {/* Navigation */}
        <header className="glass-panel premium-border sticky top-5 z-30 flex items-center justify-between rounded-full px-4 py-3 sm:px-6">
          <Wordmark />
          <nav className="hidden items-center gap-8 text-sm text-[var(--color-mist)] md:flex">
            <a href="#features" className="transition hover:text-[var(--color-pearl)]">Features</a>
            <a href="#values" className="transition hover:text-[var(--color-pearl)]">Values</a>
            <a href="#privacy" className="transition hover:text-[var(--color-pearl)]">Privacy</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/auth?mode=sign-in"
              className="hidden rounded-full px-4 py-2 text-sm font-semibold text-[var(--color-pearl)] transition hover:bg-white/10 sm:inline-flex"
            >
              Sign in
            </Link>
            <Link
              href="/auth?mode=sign-up"
              className="rounded-full bg-[var(--color-pearl)] px-5 py-2.5 text-sm font-bold text-[var(--color-ink)] transition hover:bg-white hover:translate-y-[-1px]"
            >
              Get started
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative grid flex-1 items-center gap-16 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-28">
          <div className="max-w-[680px]">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-stone)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent-gold)]" />
              Intentional connection
            </div>
            <h1 className="font-[family-name:var(--font-display)] text-[clamp(3.5rem,8vw,6.5rem)] leading-[0.92] tracking-[-0.05em] text-[var(--color-pearl)]">
              Dating should feel{" "}
              <span className="text-gradient">considered</span>, not chaotic.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--color-mist)] sm:text-xl">
              {brand.manifesto} Freeborn is built for people who want depth, clarity, and trust from the very first interaction.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/auth?mode=sign-up"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-pearl)] px-8 py-4 text-sm font-bold text-[var(--color-ink)] transition-all hover:bg-white hover:translate-y-[-2px] hover:shadow-[0_20px_60px_rgba(247,241,232,0.15)]"
              >
                Create your account
                <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
              </Link>
              <Link
                href="/auth?mode=sign-in"
                className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/[0.04] px-8 py-4 text-sm font-semibold text-[var(--color-pearl)] transition hover:bg-white/10 hover:translate-y-[-1px]"
              >
                Sign in
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-16 grid gap-px overflow-hidden rounded-3xl border border-white/8 bg-white/[0.06] sm:grid-cols-3">
              {stats.map((item) => (
                <div key={item.label} className="bg-[rgba(7,16,28,0.6)] px-6 py-6 backdrop-blur-sm">
                  <div className="font-[family-name:var(--font-display)] text-3xl text-[var(--color-pearl)]">
                    {item.stat}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-mist)]">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <PhonePreview />
        </section>

        {/* Features */}
        <section id="features" className="mt-16 scroll-mt-24">
          <div className="text-center">
            <SectionLabel label="Features" />
            <h2 className="mt-5 font-[family-name:var(--font-display)] text-[clamp(2.2rem,4vw,3.5rem)] leading-[0.96] tracking-[-0.045em] text-[var(--color-pearl)]">
              Every detail, thoughtfully considered.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-[var(--color-mist)]">
              Freeborn is designed from the ground up to prioritize meaningful connection over mindless volume.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className={`group premium-border rounded-3xl bg-white/[0.04] p-8 transition-all hover:bg-white/[0.07] hover:translate-y-[-2px] ${i === 1 ? "float-card" : ""}`}
              >
                <div className={`mb-6 h-12 w-12 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center`}>
                  <div className="h-6 w-6 rounded-lg bg-white/20" />
                </div>
                <h3 className="text-xl font-semibold text-[var(--color-pearl)]">{feature.title}</h3>
                <p className="mt-4 text-sm leading-7 text-[var(--color-mist)]">{feature.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Product Pillars / Values */}
        <section id="values" className="mt-24 scroll-mt-24">
          <div className="glass-panel premium-border rounded-3xl p-8 sm:p-12">
            <SectionLabel label="Our values" />
            <h2 className="mt-5 max-w-2xl font-[family-name:var(--font-display)] text-[clamp(2rem,4vw,3.2rem)] leading-[0.96] tracking-[-0.045em] text-[var(--color-pearl)]">
              Connection built on clarity, trust, and intention.
            </h2>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {productPillars.map((pillar) => (
                <div key={pillar.title} className="rounded-2xl border border-white/8 bg-white/[0.03] p-6">
                  <div className="mb-4 h-2 w-12 rounded-full bg-gradient-to-r from-[var(--color-accent-rose)] to-[var(--color-accent-gold)]" />
                  <h3 className="text-lg font-semibold text-[var(--color-pearl)]">{pillar.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[var(--color-mist)]">{pillar.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Privacy / Trust */}
        <section id="privacy" className="mt-24 scroll-mt-24 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-8 sm:p-10">
            <SectionLabel label="Privacy first" />
            <h3 className="mt-5 font-[family-name:var(--font-display)] text-[clamp(1.8rem,3vw,2.8rem)] leading-[0.96] tracking-[-0.04em] text-[var(--color-pearl)]">
              Your data belongs to you. Always.
            </h3>
            <p className="mt-4 text-base leading-7 text-[var(--color-mist)]">
              We believe privacy is a core product feature, not a compliance checkbox. Your conversations, preferences, and personal details stay under your control.
            </p>
            <ul className="mt-8 space-y-4">
              {[
                "End-to-end encrypted conversations",
                "Granular visibility controls",
                "No data sold to third parties",
                "Delete your account and data at any time",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-[var(--color-pearl)]/90">
                  <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--color-accent-mint)]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-white/8 bg-[linear-gradient(145deg,rgba(255,133,120,0.06),rgba(140,207,255,0.06))] p-8 sm:p-10">
            <SectionLabel label="Community" />
            <h3 className="mt-5 font-[family-name:var(--font-display)] text-[clamp(1.8rem,3vw,2.8rem)] leading-[0.96] tracking-[-0.04em] text-[var(--color-pearl)]">
              A space for intentional people.
            </h3>
            <p className="mt-4 text-base leading-7 text-[var(--color-mist)]">
              Every member of Freeborn shares one thing: they&apos;re looking for something real. Our community guidelines ensure respect is the baseline, not the exception.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {["Respectful communication", "Authentic profiles", "Clear intentions", "Zero tolerance for harassment"].map((item) => (
                <span key={item} className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-[var(--color-stone)]">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mt-24 rounded-3xl bg-[linear-gradient(135deg,rgba(255,133,120,0.12),rgba(241,201,122,0.08),rgba(140,207,255,0.10))] border border-white/8 p-8 sm:p-12 text-center">
          <SectionLabel label="Get started" />
          <h2 className="mt-5 font-[family-name:var(--font-display)] text-[clamp(2rem,4vw,3.5rem)] leading-[0.96] tracking-[-0.045em] text-[var(--color-pearl)]">
            Ready to meet someone who gets it?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-8 text-[var(--color-mist)]">
            Join Freeborn and discover a dating experience that respects your time, your values, and your privacy.
          </p>
          <Link
            href="/auth?mode=sign-up"
            className="group mt-8 inline-flex items-center gap-2 rounded-full bg-[var(--color-pearl)] px-8 py-4 text-sm font-bold text-[var(--color-ink)] transition-all hover:bg-white hover:translate-y-[-2px] hover:shadow-[0_20px_60px_rgba(247,241,232,0.15)]"
          >
            Create your free account
            <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </section>

        {/* Footer */}
        <footer className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-white/8 py-8 text-sm text-[var(--color-mist)] sm:flex-row sm:items-center">
          <Wordmark muted />
          <p>© {new Date().getFullYear()} Freeborn. All rights reserved.</p>
        </footer>
      </div>
    </main>
  );
}
