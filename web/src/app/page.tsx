import { brand, productPillars } from "@freeborn/shared";
import { PhonePreview } from "@/components/phone-preview";
import { SectionLabel } from "@/components/section-label";
import { Wordmark } from "@/components/wordmark";

const stack = [
  {
    stat: "92%",
    label: "say profile clarity matters more than volume",
  },
  {
    stat: "3x",
    label: "more trust signals visible before a first message",
  },
  {
    stat: "Zero",
    label: "tolerance for rushed, throwaway product decisions",
  },
] as const;

const experienceCards = [
  {
    title: "A better first impression",
    body: "Every surface is tuned to feel calm, premium, and unmistakably intentional from the first open.",
  },
  {
    title: "Built for serious momentum",
    body: "The foundation supports structured auth, profile depth, discovery, messaging, and premium expansion without a reset later.",
  },
  {
    title: "Trust-forward by design",
    body: "Privacy, verification, and respectful defaults are treated like core product features, not compliance chores.",
  },
] as const;

const foundation = [
  { area: "Web", detail: "Next.js app router, premium public experience, deployable on Vercel" },
  { area: "Mobile", detail: "Expo shell for iOS and Android with a branded native-feeling welcome experience" },
  { area: "Shared", detail: "Design tokens, brand system, and product language aligned across platforms" },
  { area: "Supabase", detail: "Migration-led auth foundation with RLS-ready user records and scalable tables" },
] as const;

export default function Home() {
  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 hero-grid opacity-40" />
      <div className="orb absolute left-[8%] top-24 h-56 w-56 rounded-full bg-[rgba(255,133,120,0.22)]" />
      <div className="orb orb-alt absolute right-[10%] top-12 h-72 w-72 rounded-full bg-[rgba(140,207,255,0.16)]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1240px] flex-col px-6 pb-20 pt-6 sm:px-8 lg:px-10">
        <header className="glass-panel premium-border sticky top-5 z-30 flex items-center justify-between rounded-full px-4 py-3 sm:px-6">
          <Wordmark />
          <nav className="hidden items-center gap-6 text-sm text-[var(--color-mist)] md:flex">
            <a href="#experience" className="transition hover:text-[var(--color-pearl)]">
              Experience
            </a>
            <a href="#foundation" className="transition hover:text-[var(--color-pearl)]">
              Foundation
            </a>
            <a href="#trust" className="transition hover:text-[var(--color-pearl)]">
              Trust
            </a>
          </nav>
          <a
            href="#foundation"
            className="rounded-full border border-white/12 bg-white/6 px-4 py-2 text-sm font-semibold text-[var(--color-pearl)] transition hover:bg-white/10"
          >
            Explore Phase 0
          </a>
        </header>

        <section className="relative grid flex-1 items-center gap-14 py-16 lg:grid-cols-[1.08fr_0.92fr] lg:py-24">
          <div className="max-w-[720px]">
            <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-stone)]">
              Premium dating platform foundation
            </div>
            <h1 className="max-w-[11ch] font-[family-name:var(--font-display)] text-[clamp(4rem,9vw,7rem)] leading-[0.92] tracking-[-0.05em] text-[var(--color-pearl)]">
              Dating should feel <span className="text-gradient">considered</span>, not chaotic.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-[var(--color-mist)] sm:text-xl">
              {brand.manifesto} This foundation gives Freeborn a serious visual identity, a scalable technical base, and the kind of first impression people remember.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <a
                href="#experience"
                className="inline-flex items-center justify-center rounded-full bg-[var(--color-pearl)] px-7 py-4 text-sm font-bold text-[var(--color-ink)] transition hover:translate-y-[-1px] hover:bg-white"
              >
                See the product feel
              </a>
              <a
                href="#foundation"
                className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/5 px-7 py-4 text-sm font-semibold text-[var(--color-pearl)] transition hover:bg-white/10"
              >
                View architecture
              </a>
            </div>

            <div className="mt-14 grid gap-4 sm:grid-cols-3">
              {stack.map((item) => (
                <div key={item.label} className="premium-border rounded-[28px] bg-white/[0.045] p-5 backdrop-blur-sm">
                  <div className="font-[family-name:var(--font-display)] text-4xl text-[var(--color-pearl)]">
                    {item.stat}
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[var(--color-mist)]">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <PhonePreview />
        </section>

        <section id="experience" className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="glass-panel premium-border rounded-[36px] p-7 sm:p-10">
            <SectionLabel label="The tone" />
            <h2 className="mt-5 max-w-md font-[family-name:var(--font-display)] text-[clamp(2.4rem,5vw,4rem)] leading-[0.94] tracking-[-0.045em] text-[var(--color-pearl)]">
              Calm confidence, real warmth, no cheap product shortcuts.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-[var(--color-mist)] sm:text-lg">
              Freeborn should feel like a premium members club translated into software: soft edges, crisp typography, balanced hierarchy, and trust signals that quietly do their job.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {experienceCards.map((card, index) => (
              <article
                key={card.title}
                className={`premium-border rounded-[32px] bg-white/[0.045] p-6 backdrop-blur-sm ${index === 1 ? "float-card" : ""}`}
              >
                <div className="mb-5 h-11 w-11 rounded-2xl bg-white/10" />
                <h3 className="text-lg font-semibold text-[var(--color-pearl)]">{card.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[var(--color-mist)]">{card.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="trust" className="mt-24 grid gap-6 lg:grid-cols-[0.94fr_1.06fr]">
          <div className="rounded-[36px] border border-white/10 bg-[rgba(9,16,28,0.66)] p-7 shadow-[var(--shadow-glow)] backdrop-blur-sm sm:p-10">
            <SectionLabel label="Trust architecture" />
            <h2 className="mt-5 font-[family-name:var(--font-display)] text-[clamp(2.2rem,4vw,3.7rem)] leading-[0.96] tracking-[-0.045em] text-[var(--color-pearl)]">
              Safety is part of the product language.
            </h2>
            <div className="mt-7 space-y-4">
              {productPillars.map((pillar) => (
                <div key={pillar.title} className="premium-border rounded-[28px] bg-white/[0.05] p-5">
                  <h3 className="text-base font-semibold text-[var(--color-pearl)]">{pillar.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-mist)]">{pillar.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <article className="glass-panel premium-border float-card rounded-[34px] p-7 sm:p-8">
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-stone)]">
                Verification-first posture
              </div>
              <p className="mt-4 text-3xl font-[family-name:var(--font-display)] leading-tight text-[var(--color-pearl)]">
                Profiles can grow into high-trust identities instead of disposable accounts.
              </p>
            </article>
            <article className="premium-border float-card float-card-delay rounded-[34px] bg-[linear-gradient(180deg,rgba(255,255,255,0.14),rgba(255,255,255,0.04))] p-7 sm:p-8">
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-stone)]">
                Serious product foundation
              </div>
              <p className="mt-4 text-3xl font-[family-name:var(--font-display)] leading-tight text-[var(--color-pearl)]">
                Supabase, shared tokens, and a clean monorepo setup give the product room to scale without rework.
              </p>
            </article>
            <article className="premium-border rounded-[34px] bg-white/[0.045] p-7 md:col-span-2 sm:p-8">
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-stone)]">
                Human tone
              </div>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--color-mist)] sm:text-lg">
                Every sentence, label, and empty-state direction in Freeborn should reinforce respect. Premium apps do not feel robotic or over-engineered. They feel effortless because the details were taken seriously.
              </p>
            </article>
          </div>
        </section>

        <section id="foundation" className="mt-24 rounded-[40px] border border-white/10 bg-[rgba(247,241,232,0.95)] px-6 py-8 text-[var(--color-ink)] shadow-[0_28px_80px_rgba(5,10,18,0.32)] sm:px-10 sm:py-12">
          <SectionLabel dark label="Phase 0 foundation" />
          <div className="mt-5 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <h2 className="font-[family-name:var(--font-display)] text-[clamp(2.3rem,4vw,3.8rem)] leading-[0.96] tracking-[-0.045em]">
                A disciplined base built for the next five phases.
              </h2>
              <p className="mt-4 text-base leading-7 text-[rgba(11,19,32,0.72)] sm:text-lg">
                The foundation is structured so auth, onboarding, discovery, messaging, and premium layers can land cleanly without rethinking the repo, design language, or backend posture.
              </p>
            </div>
            <div className="rounded-full border border-[var(--color-line-dark)] px-5 py-3 text-sm font-semibold text-[rgba(11,19,32,0.7)]">
              Phase 0 only — intentionally scoped
            </div>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {foundation.map((item) => (
              <article key={item.area} className="rounded-[30px] border border-[var(--color-line-dark)] bg-white/70 p-6 shadow-[0_14px_40px_rgba(11,19,32,0.08)]">
                <div className="text-sm font-semibold uppercase tracking-[0.2em] text-[rgba(11,19,32,0.46)]">
                  {item.area}
                </div>
                <p className="mt-4 text-lg font-semibold leading-7 text-[var(--color-ink)]">{item.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <footer className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-white/10 py-8 text-sm text-[var(--color-mist)] sm:flex-row sm:items-center">
          <Wordmark muted />
          <p>Premium dating, built with discipline.</p>
        </footer>
      </div>
    </main>
  );
}
