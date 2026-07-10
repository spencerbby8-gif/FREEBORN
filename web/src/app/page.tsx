import Link from "next/link";
import { brand, trustStats, testimonials, safetyFeatures, howItWorks, faqs, productPillars } from "@freeborn/shared";
import { PhonePreview } from "@/components/phone-preview";
import { SectionLabel } from "@/components/section-label";
import { Wordmark } from "@/components/wordmark";
import { Section } from "@/components/section";
import { Reveal } from "@/components/reveal";
import {
  ArrowIcon,
  BadgeIcon,
  CheckIcon,
  EyeIcon,
  HeartIcon,
  LockIcon,
  QuoteIcon,
  ShieldIcon,
  SparkIcon,
  SparkleIcon,
  StarIcon,
} from "@/components/icons";

/* -------------------------------------------------------------------------- */
/*  Nav                                                                       */
/* -------------------------------------------------------------------------- */

function Nav() {
  return (
    <header className="sticky top-5 z-50 mx-auto w-full max-w-[1200px] px-6 sm:px-8 lg:px-10">
      <div className="surface ring-pearl flex items-center justify-between rounded-full px-4 py-2.5 sm:px-5">
        <Link href="/" aria-label="Freeborn home">
          <Wordmark size="sm" />
        </Link>

        <nav className="hidden items-center gap-8 text-[13px] font-medium text-[var(--color-sand)] md:flex">
          <a href="#how" className="transition hover:text-[var(--color-pearl)]">How it works</a>
          <a href="#safety" className="transition hover:text-[var(--color-pearl)]">Safety</a>
          <a href="#stories" className="transition hover:text-[var(--color-pearl)]">Stories</a>
          <a href="#faq" className="transition hover:text-[var(--color-pearl)]">FAQ</a>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/auth?mode=sign-in"
            className="hidden rounded-full px-4 py-2 text-[13px] font-semibold text-[var(--color-pearl)]/90 transition hover:bg-white/5 sm:inline-flex"
          >
            Sign in
          </Link>
          <Link
            href="/auth?mode=sign-up"
            className="group relative overflow-hidden rounded-full bg-[var(--color-pearl)] px-5 py-2.5 text-[13px] font-bold text-[var(--color-ink)] shadow-[0_6px_20px_-4px_rgba(251,247,242,0.25)] transition hover:translate-y-[-1px] hover:shadow-[0_10px_28px_-4px_rgba(251,247,242,0.35)] btn-shine"
          >
            Join Freeborn
            <span className="ml-1 inline-block transition-transform group-hover:translate-x-0.5">→</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

/* -------------------------------------------------------------------------- */
/*  Hero                                                                      */
/* -------------------------------------------------------------------------- */

function Hero() {
  return (
    <section className="relative overflow-hidden pt-6">
      {/* Ambient lighting */}
      <div className="pointer-events-none absolute inset-0 grid-lines opacity-50" />
      <div className="orb drift" style={{ top: "-6%", left: "-8%", width: 560, height: 560, background: "radial-gradient(circle, rgba(239,94,94,0.35), transparent 60%)" }} />
      <div className="orb drift-alt" style={{ top: "-4%", right: "-10%", width: 640, height: 640, background: "radial-gradient(circle, rgba(138,110,242,0.30), transparent 60%)" }} />
      <div className="orb drift-slow" style={{ bottom: "-20%", left: "30%", width: 500, height: 500, background: "radial-gradient(circle, rgba(217,167,82,0.22), transparent 65%)" }} />

      <div className="relative mx-auto w-full max-w-[1200px] px-6 pb-16 pt-10 sm:px-8 lg:px-10 lg:pb-24 lg:pt-14">
        <Nav />

        <div className="mt-14 grid items-center gap-14 lg:mt-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
          {/* Left — copy */}
          <div className="max-w-[640px]">
            <Reveal>
              <SectionLabel label="Dating, rebuilt for people who mean it" dot="ember" />
            </Reveal>

            <Reveal delay={1}>
              <h1
                className="mt-7 text-[var(--font-display-massive)] leading-[0.97] tracking-[var(--tracking-display)] text-[var(--color-pearl)]"
                style={{ fontFamily: "var(--font-display)", fontVariationSettings: "'opsz' 144, 'SOFT' 30, 'wght' 450" }}
              >
                Stop swiping.
                <br />
                <span className="text-ember">Start meeting.</span>
              </h1>
            </Reveal>

            <Reveal delay={2}>
              <p className="mt-7 max-w-[560px] text-lg leading-[1.65] text-[var(--color-sand)] sm:text-xl">
                {brand.manifesto}
              </p>
            </Reveal>

            <Reveal delay={3}>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/auth?mode=sign-up"
                  className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-[var(--gradient-ember-warm)] px-8 py-4 text-[14px] font-bold text-white shadow-[var(--shadow-ember)] transition hover:translate-y-[-2px] hover:shadow-[0_20px_50px_-8px_rgba(239,94,94,0.55)] btn-shine"
                >
                  Create your profile
                  <ArrowIcon size={16} className="transition-transform group-hover:translate-x-0.5" />
                </Link>
                <a
                  href="#how"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--color-line-pearl)] bg-white/[0.03] px-8 py-4 text-[14px] font-semibold text-[var(--color-pearl)] backdrop-blur-md transition hover:bg-white/[0.08]"
                >
                  See how it works
                </a>
              </div>
            </Reveal>

            <Reveal delay={4}>
              <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-[12px] text-[var(--color-mist)]">
                <span className="flex items-center gap-2">
                  <BadgeIcon size={15} className="text-[var(--color-teal-300)]" />
                  Photo verified
                </span>
                <span className="flex items-center gap-2">
                  <LockIcon size={15} className="text-[var(--color-gold-300)]" />
                  Private by default
                </span>
                <span className="flex items-center gap-2">
                  <HeartIcon size={15} className="text-[var(--color-ember-300)]" />
                  No endless swiping
                </span>
              </div>
            </Reveal>
          </div>

          {/* Right — phone */}
          <Reveal delay={2}>
            <PhonePreview />
          </Reveal>
        </div>

        {/* Trust marquee */}
        <Reveal>
          <div className="mt-20 border-y border-[var(--color-line)] py-6">
            <div className="grid grid-cols-2 gap-6 text-center sm:grid-cols-4">
              {trustStats.map((s) => (
                <div key={s.label} className="px-2">
                  <div
                    className="text-[clamp(1.6rem,3vw,2.2rem)] leading-none tracking-tight text-[var(--color-pearl)]"
                    style={{ fontFamily: "var(--font-display)", fontVariationSettings: "'opsz' 144, 'wght' 500" }}
                  >
                    {s.stat}
                  </div>
                  <p className="mt-2 text-[11px] leading-snug text-[var(--color-mist)] sm:text-[12px]">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Problem / Manifesto                                                       */
/* -------------------------------------------------------------------------- */

function Manifesto() {
  return (
    <Section id="why" className="overflow-hidden">
      <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
        <Reveal>
          <div className="relative">
            <div
              className="pointer-events-none absolute -inset-10 blur-3xl opacity-60"
              style={{ background: "radial-gradient(circle, rgba(239,94,94,0.18), transparent 60%)" }}
            />
            <div className="relative rounded-[36px] border border-[var(--color-line)] bg-gradient-to-br from-[var(--color-abyss)] to-[var(--color-midnight)] p-10 shadow-[var(--shadow-card-lg)] sm:p-14">
              <QuoteIcon size={48} className="text-[var(--color-ember-500)]/60" />
              <p
                className="mt-8 text-[clamp(1.6rem,3vw,2.2rem)] leading-[1.2] tracking-[-0.03em] text-[var(--color-pearl)]"
                style={{ fontFamily: "var(--font-display)", fontVariationSettings: "'opsz' 144, 'wght' 400, 'SOFT' 50" }}
              >
                Dating apps had stopped feeling human. They had turned us into cards in a deck, endlessly flicked, rarely read.
                We built Freeborn for the moment you decide you want better.
              </p>
              <div className="mt-10 flex items-center gap-3">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-full"
                  style={{ background: "linear-gradient(135deg, #ef5e5e, #8a6ef2)" }}
                >
                  <span className="text-sm font-bold text-white">FB</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--color-pearl)]">The Freeborn founders</p>
                  <p className="text-xs text-[var(--color-mist)]">From a letter to our early members</p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={1}>
          <SectionLabel label="Why Freeborn exists" dot="violet" />
          <h2
            className="mt-6 text-[var(--font-display-section)] leading-[1.02] tracking-[var(--tracking-display)] text-[var(--color-pearl)]"
            style={{ fontFamily: "var(--font-display)", fontVariationSettings: "'opsz' 144, 'wght' 450, 'SOFT' 30" }}
          >
            Swiping was never designed to help you <span className="text-warm">fall in love.</span>
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-[var(--color-sand)]">
            It was designed to keep you scrolling. We replaced it with something slower — one person at a time,
            real profiles, conversations that start with intention, and an interface that disappears when it&apos;s done its job.
          </p>

          <ul className="mt-10 space-y-5">
            {[
              { icon: HeartIcon, title: "One match at a time", body: "No stacks, no infinite scroll. You give each person real attention — and receive it in return." },
              { icon: SparkleIcon, title: "Profiles with a pulse", body: "Prompts, values, and intentions come before photos. You learn who someone is before you decide how they look." },
              { icon: ShieldIcon, title: "Built by people who care", body: "We are not a giant conglomerate chasing engagement metrics. We build what we would want for our friends." },
            ].map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex gap-5">
                <span className="mt-0.5 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl border border-[var(--color-line-pearl)] bg-white/[0.04] text-[var(--color-ember-300)]">
                  <Icon size={20} />
                </span>
                <div>
                  <p className="text-base font-semibold text-[var(--color-pearl)]">{title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--color-mist)]">{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </Section>
  );
}

/* -------------------------------------------------------------------------- */
/*  How it works                                                              */
/* -------------------------------------------------------------------------- */

function HowItWorks() {
  return (
    <Section id="how">
      <div className="mx-auto max-w-3xl text-center">
        <Reveal>
          <SectionLabel label="How it works" dot="gold" />
        </Reveal>
        <Reveal delay={1}>
          <h2
            className="mt-6 text-[var(--font-display-section)] leading-[1.02] tracking-[var(--tracking-display)] text-[var(--color-pearl)]"
            style={{ fontFamily: "var(--font-display)", fontVariationSettings: "'opsz' 144, 'wght' 450, 'SOFT' 30" }}
          >
            A calmer path from <span className="text-ember">hello</span> to something real.
          </h2>
        </Reveal>
        <Reveal delay={2}>
          <p className="mt-5 text-lg leading-relaxed text-[var(--color-sand)]">
            Four quiet steps. No games, no gimmicks, no &ldquo;boosts&rdquo; or paywalls between you and a good conversation.
          </p>
        </Reveal>
      </div>

      <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {howItWorks.map((step, i) => {
          const accents = ["ember", "gold", "violet", "teal"] as const;
          const accent = accents[i];
          const accentVar =
            accent === "ember" ? "var(--color-ember-500)" :
            accent === "gold"  ? "var(--color-gold-500)" :
            accent === "violet"? "var(--color-violet-500)" :
                                 "var(--color-teal-500)";
          return (
            <Reveal key={step.step} delay={(i + 1) as 1 | 2 | 3 | 4}>
              <div className="group relative h-full overflow-hidden rounded-3xl border border-[var(--color-line)] bg-gradient-to-b from-white/[0.04] to-white/[0.015] p-7 transition hover:border-white/15 hover:bg-white/[0.05]">
                <div
                  className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-60"
                  style={{ background: `radial-gradient(circle, ${accentVar}50, transparent 60%)` }}
                />
                <div
                  className="inline-flex h-12 w-12 items-center justify-center rounded-2xl font-mono text-[13px] font-bold"
                  style={{
                    background: `linear-gradient(135deg, ${accentVar}30, ${accentVar}08)`,
                    border: `1px solid ${accentVar}40`,
                    color: accentVar,
                  }}
                >
                  {step.step}
                </div>
                <h3
                  className="mt-6 text-[22px] leading-tight tracking-[-0.02em] text-[var(--color-pearl)]"
                  style={{ fontFamily: "var(--font-display)", fontVariationSettings: "'opsz' 144, 'wght' 500" }}
                >
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[var(--color-mist)]">{step.body}</p>
              </div>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Pillars / features                                                        */
/* -------------------------------------------------------------------------- */

function Pillars() {
  return (
    <Section id="features">
      <div className="grid items-start gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <Reveal className="lg:sticky lg:top-28">
          <SectionLabel label="What makes it different" dot="ember" />
          <h2
            className="mt-6 text-[var(--font-display-section)] leading-[1.02] tracking-[var(--tracking-display)] text-[var(--color-pearl)]"
            style={{ fontFamily: "var(--font-display)", fontVariationSettings: "'opsz' 144, 'wght' 450, 'SOFT' 30" }}
          >
            Every detail, in service of <span className="text-warm">real connection.</span>
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-[var(--color-sand)]">
            We sweated the things most apps don&apos;t bother with — how a profile reads before a photo loads, how it
            feels to say no, how quickly a good conversation begins.
          </p>
          <Link
            href="/auth?mode=sign-up"
            className="group mt-8 inline-flex items-center gap-2 rounded-full border border-[var(--color-line-pearl)] bg-white/[0.04] px-6 py-3 text-sm font-semibold text-[var(--color-pearl)] transition hover:bg-white/[0.08]"
          >
            Try it yourself
            <ArrowIcon size={15} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </Reveal>

        <div className="space-y-4">
          {productPillars.map((pillar, i) => (
            <Reveal key={pillar.title} delay={((i % 3) + 1) as 1 | 2 | 3}>
              <div className="group relative overflow-hidden rounded-3xl border border-[var(--color-line)] bg-gradient-to-br from-[var(--color-abyss)] to-[var(--color-midnight)] p-8 transition hover:border-white/12">
                <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 aurora-anim"
                  style={{ background: "linear-gradient(135deg, rgba(239,94,94,0.06), rgba(138,110,242,0.06), rgba(79,184,167,0.06))" }} />
                <div className="relative flex items-start gap-6">
                  <div className="flex-shrink-0">
                    {i === 0 && <SparkIcon size={28} className="text-[var(--color-ember-300)]" />}
                    {i === 1 && <ShieldIcon size={28} className="text-[var(--color-teal-300)]" />}
                    {i === 2 && <SparkleIcon size={28} className="text-[var(--color-violet-300)]" />}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold tracking-tight text-[var(--color-pearl)]">{pillar.title}</h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-[var(--color-mist)]">{pillar.body}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}

          {/* Feature grid */}
          <Reveal>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { icon: BadgeIcon, title: "Verified photos", body: "Live-selfie checks. What you see is who they are.", color: "var(--color-teal-300)" },
                { icon: LockIcon, title: "Incognito mode", body: "Only be seen by people you&apos;ve liked.", color: "var(--color-gold-300)" },
                { icon: EyeIcon, title: "Read receipts off", body: "Reply when you want to. No pressure.", color: "var(--color-violet-300)" },
                { icon: StarIcon, title: "Curated daily", body: "Fresh, thoughtful profiles each afternoon.", color: "var(--color-ember-300)" },
              ].map(({ icon: Icon, title, body, color }) => (
                <div key={title} className="rounded-2xl border border-[var(--color-line)] bg-white/[0.02] p-5 transition hover:bg-white/[0.04]">
                  <Icon size={22} style={{ color }} />
                  <p className="mt-4 text-[15px] font-semibold text-[var(--color-pearl)]">{title}</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-[var(--color-mist)]">{body}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Safety                                                                    */
/* -------------------------------------------------------------------------- */

function Safety() {
  return (
    <Section id="safety">
      <div className="relative overflow-hidden rounded-[40px] border border-[var(--color-line)] p-10 sm:p-14 lg:p-16"
        style={{
          background:
            "linear-gradient(160deg, rgba(23,29,54,0.9) 0%, rgba(10,13,24,0.95) 100%)",
        }}
      >
        <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full blur-3xl opacity-50"
          style={{ background: "radial-gradient(circle, rgba(79,184,167,0.25), transparent 65%)" }} />
        <div className="pointer-events-none absolute -right-24 -bottom-24 h-96 w-96 rounded-full blur-3xl opacity-50"
          style={{ background: "radial-gradient(circle, rgba(138,110,242,0.22), transparent 65%)" }} />

        <div className="relative grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <SectionLabel label="Safety, built in" dot="teal" />
            <h2
              className="mt-6 text-[var(--font-display-section)] leading-[1.02] tracking-[var(--tracking-display)] text-[var(--color-pearl)]"
              style={{ fontFamily: "var(--font-display)", fontVariationSettings: "'opsz' 144, 'wght' 450, 'SOFT' 30" }}
            >
              You should feel <span className="text-warm">safe</span> before you feel sparks.
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-[var(--color-sand)]">
              Trust is not a feature we ship and forget. It is the foundation the app sits on — verification,
              moderation, privacy, and a zero-tolerance bar for anyone who doesn&apos;t treat people with respect.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/auth?mode=sign-up"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-pearl)] px-6 py-3 text-sm font-bold text-[var(--color-ink)] transition hover:bg-white"
              >
                Join safely →
              </Link>
              <a
                href="#faq"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 px-6 py-3 text-sm font-semibold text-[var(--color-pearl)] transition hover:bg-white/5"
              >
                Our safety principles
              </a>
            </div>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-2">
            {safetyFeatures.map((f, i) => (
              <Reveal key={f.title} delay={((i % 3) + 1) as 1 | 2 | 3}>
                <div className="h-full rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-teal-500)]/15 text-[var(--color-teal-300)]">
                    <CheckIcon size={18} />
                  </span>
                  <h3 className="mt-4 text-base font-semibold text-[var(--color-pearl)]">{f.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--color-mist)]">{f.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Testimonials / Stories                                                    */
/* -------------------------------------------------------------------------- */

function Stories() {
  return (
    <Section id="stories">
      <div className="mx-auto max-w-3xl text-center">
        <Reveal>
          <SectionLabel label="Stories from Freeborn" dot="violet" />
        </Reveal>
        <Reveal delay={1}>
          <h2
            className="mt-6 text-[var(--font-display-section)] leading-[1.02] tracking-[var(--tracking-display)] text-[var(--color-pearl)]"
            style={{ fontFamily: "var(--font-display)", fontVariationSettings: "'opsz' 144, 'wght' 450, 'SOFT' 30" }}
          >
            The people who have already <span className="text-ember">found each other.</span>
          </h2>
        </Reveal>
      </div>

      <div className="mt-16 grid gap-6 lg:grid-cols-3">
        {testimonials.map((t, i) => {
          const palettes = [
            ["#ef5e5e", "#d9a752"],
            ["#8a6ef2", "#4fb8a7"],
            ["#d9a752", "#ef5e5e"],
          ] as const;
          const p = palettes[i];
          return (
            <Reveal key={t.name} delay={((i % 3) + 1) as 1 | 2 | 3}>
              <figure className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-[var(--color-line)] p-8 transition hover:border-white/15"
                style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))" }}
              >
                <QuoteIcon size={36} className="text-[var(--color-gold-300)]/70" />
                <blockquote
                  className="mt-6 flex-1 text-[18px] leading-[1.5] tracking-[-0.01em] text-[var(--color-pearl)]"
                  style={{ fontFamily: "var(--font-display)", fontVariationSettings: "'opsz' 144, 'wght' 400, 'SOFT' 50" }}
                >
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-8 flex items-center gap-3 border-t border-[var(--color-line)] pt-6">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ background: `linear-gradient(135deg, ${p[0]}, ${p[1]})` }}
                  >
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-pearl)]">{t.name}</p>
                    <p className="text-[12px] text-[var(--color-mist)]">{t.meta}</p>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          );
        })}
      </div>

      {/* Press / as-seen-in strip */}
      <Reveal>
        <div className="mt-16 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-60 grayscale">
          {["THE NEW YORK TIMES", "VOGUE", "THE CUT", "GQ", "FAST COMPANY", "MONOCLE"].map((n) => (
            <span key={n} className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[var(--color-mist)]">
              {n}
            </span>
          ))}
        </div>
      </Reveal>
    </Section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Pricing / Membership teaser                                              */
/* -------------------------------------------------------------------------- */

function Membership() {
  return (
    <Section id="membership">
      <div className="relative overflow-hidden rounded-[40px] border border-[var(--color-line)]">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 60% at 20% 30%, rgba(239,94,94,0.18), transparent 60%), radial-gradient(ellipse 60% 60% at 80% 70%, rgba(217,167,82,0.14), transparent 60%), linear-gradient(160deg, #0d1122, #151a33)",
          }}
        />
        <div className="relative grid gap-12 p-10 sm:p-14 lg:grid-cols-2 lg:p-16">
          <Reveal>
            <SectionLabel label="Free, always" dot="gold" />
            <h2
              className="mt-6 text-[var(--font-display-section)] leading-[1.02] tracking-[var(--tracking-display)] text-[var(--color-pearl)]"
              style={{ fontFamily: "var(--font-display)", fontVariationSettings: "'opsz' 144, 'wght' 450, 'SOFT' 30" }}
            >
              Meeting someone should not <span className="text-warm">cost anything.</span>
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-[var(--color-sand)]">
              Freeborn is free for matching, messaging, and meeting. An optional membership exists for people who want
              deeper insight — but you will never need to pay to connect with someone great.
            </p>

            <ul className="mt-8 space-y-3">
              {[
                "Unlimited matching & messaging",
                "Photo verification for all members",
                "Advanced privacy & incognito controls",
                "Thoughtful conversation prompts",
              ].map((f) => (
                <li key={f} className="flex items-center gap-3 text-[15px] text-[var(--color-pearl)]/90">
                  <CheckIcon size={18} className="flex-shrink-0 text-[var(--color-teal-300)]" />
                  {f}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={2}>
            <div className="relative">
              <div
                className="pointer-events-none absolute -inset-6 rounded-3xl blur-2xl"
                style={{ background: "radial-gradient(circle, rgba(239,94,94,0.25), transparent 70%)" }}
              />
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[rgba(10,13,24,0.7)] p-8 backdrop-blur-xl">
                <div className="flex items-baseline justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-[var(--color-gold-300)]">
                      Freeborn+
                    </p>
                    <p className="mt-1 text-sm text-[var(--color-sand)]">For people who want a little more.</p>
                  </div>
                  <div className="text-right">
                    <p
                      className="text-4xl text-[var(--color-pearl)]"
                      style={{ fontFamily: "var(--font-display)", fontVariationSettings: "'wght' 500" }}
                    >
                      $14
                    </p>
                    <p className="text-xs text-[var(--color-mist)]">per month</p>
                  </div>
                </div>

                <ul className="mt-7 space-y-3 text-sm text-[var(--color-sand)]">
                  {[
                    "See who liked you before you match",
                    "Unlimited advanced preferences",
                    "Priority profile visibility twice daily",
                    "Read receipts & activity insights",
                    "Rewind a mistaken pass",
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <CheckIcon size={16} className="mt-0.5 flex-shrink-0 text-[var(--color-gold-300)]" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/auth?mode=sign-up"
                  className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-[var(--color-pearl)] py-3.5 text-sm font-bold text-[var(--color-ink)] transition hover:bg-white"
                >
                  Start free, upgrade when it&apos;s worth it
                </Link>
                <p className="mt-3 text-center text-[11px] text-[var(--color-mist)]">Cancel anytime. No nonsense.</p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}

/* -------------------------------------------------------------------------- */
/*  FAQ                                                                       */
/* -------------------------------------------------------------------------- */

function Faq() {
  return (
    <Section id="faq">
      <div className="mx-auto max-w-3xl text-center">
        <Reveal>
          <SectionLabel label="Questions, answered" dot="ember" />
        </Reveal>
        <Reveal delay={1}>
          <h2
            className="mt-6 text-[var(--font-display-section)] leading-[1.02] tracking-[var(--tracking-display)] text-[var(--color-pearl)]"
            style={{ fontFamily: "var(--font-display)", fontVariationSettings: "'opsz' 144, 'wght' 450, 'SOFT' 30" }}
          >
            The things people <span className="text-ember">actually ask.</span>
          </h2>
        </Reveal>
      </div>

      <Reveal delay={2}>
        <div className="mx-auto mt-14 max-w-3xl divide-y divide-[var(--color-line)] rounded-3xl border border-[var(--color-line)] bg-white/[0.02] px-2 sm:px-4">
          {faqs.map((f) => (
            <details key={f.q} className="group px-4 py-6 sm:px-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-left">
                <span className="text-base font-semibold text-[var(--color-pearl)] sm:text-lg">{f.q}</span>
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-[var(--color-line)] text-[var(--color-sand)] transition group-open:rotate-45 group-open:border-[var(--color-ember-500)]/40 group-open:text-[var(--color-ember-300)]">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M7 1v12M1 7h12"/></svg>
                </span>
              </summary>
              <p className="mt-4 text-[15px] leading-relaxed text-[var(--color-mist)]">{f.a}</p>
            </details>
          ))}
        </div>
      </Reveal>
    </Section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Final CTA                                                                 */
/* -------------------------------------------------------------------------- */

function Cta() {
  return (
    <Section padY={false} className="pb-24 sm:pb-28 lg:pb-32">
      <Reveal>
        <div className="relative overflow-hidden rounded-[40px] border border-[var(--color-line)] px-8 py-20 text-center sm:px-14 sm:py-28">
          {/* Animated aurora backdrop */}
          <div
            className="pointer-events-none absolute inset-0 aurora-anim"
            style={{
              background:
                "radial-gradient(ellipse 50% 50% at 20% 40%, rgba(239,94,94,0.35), transparent 60%), radial-gradient(ellipse 50% 50% at 80% 60%, rgba(138,110,242,0.30), transparent 60%), radial-gradient(ellipse 60% 60% at 50% 100%, rgba(217,167,82,0.20), transparent 60%), linear-gradient(180deg, #0d1122, #05070d)",
            }}
          />
          <div className="pointer-events-none absolute inset-0 grid-lines opacity-40" />

          <div className="relative mx-auto max-w-2xl">
            <div className="flex justify-center">
              <SectionLabel label="Your person is waiting" dot="ember" />
            </div>
            <h2
              className="mx-auto mt-8 text-[var(--font-display-massive)] leading-[0.97] tracking-[var(--tracking-display)] text-[var(--color-pearl)]"
              style={{ fontFamily: "var(--font-display)", fontVariationSettings: "'opsz' 144, 'wght' 400, 'SOFT' 30" }}
            >
              The next hello could be <span className="text-ember">the one.</span>
            </h2>
            <p className="mx-auto mt-7 max-w-xl text-lg leading-relaxed text-[var(--color-sand)]">
              Free to join. Built with care. Full of people who, like you, are tired of the noise.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/auth?mode=sign-up"
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-[var(--color-pearl)] px-9 py-4 text-[15px] font-bold text-[var(--color-ink)] shadow-[0_20px_60px_-10px_rgba(251,247,242,0.3)] transition hover:translate-y-[-2px] hover:bg-white btn-shine"
              >
                Create your free profile
                <ArrowIcon size={16} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/auth?mode=sign-in"
                className="inline-flex items-center rounded-full border border-white/15 bg-white/[0.05] px-8 py-4 text-[14px] font-semibold text-[var(--color-pearl)] transition hover:bg-white/[0.1]"
              >
                I already have an account
              </Link>
            </div>

            <p className="mt-8 text-xs text-[var(--color-mist)]">
              Takes about 8 minutes. You can edit anything later.
            </p>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Footer                                                                    */
/* -------------------------------------------------------------------------- */

function Footer() {
  return (
    <footer className="border-t border-[var(--color-line)]">
      <div className="mx-auto w-full max-w-[1200px] px-6 py-14 sm:px-8 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr_1fr_1fr]">
          <div>
            <Wordmark size="md" />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-[var(--color-mist)]">
              {brand.manifesto}
            </p>
            <div className="mt-6 flex gap-2">
              {["Instagram", "TikTok", "Twitter", "Substack"].map((s) => (
                <a key={s} href="#" aria-label={s} className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-line)] text-[var(--color-sand)] transition hover:bg-white/5 hover:text-[var(--color-pearl)]">
                  <span className="text-[10px] font-bold uppercase">{s.charAt(0)}</span>
                </a>
              ))}
            </div>
          </div>

          {[
            { title: "Product", links: ["How it works", "Safety", "Stories", "Freeborn+", "Download"] },
            { title: "Company", links: ["About", "Careers", "Press", "Blog", "Contact"] },
            { title: "Legal", links: ["Privacy", "Terms", "Community", "Cookies", "Safety center"] },
          ].map((col) => (
            <div key={col.title}>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--color-sand)]">{col.title}</p>
              <ul className="mt-5 space-y-3 text-sm text-[var(--color-mist)]">
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="transition hover:text-[var(--color-pearl)]">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-[var(--color-line)] pt-8 text-[12px] text-[var(--color-mist)] sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Freeborn. Made with care for people looking for something real.</p>
          <div className="flex items-center gap-5">
            <span>Designed in New York · Paris · London</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function Home() {
  return (
    <main className="relative min-h-screen">
      <Hero />
      <Manifesto />
      <HowItWorks />
      <Pillars />
      <Safety />
      <Stories />
      <Membership />
      <Faq />
      <Cta />
      <Footer />
    </main>
  );
}
