import type { Metadata } from "next";
import Link from "next/link";
import {
  brand,
  communityPrinciples,
  faqs,
  howItWorks,
  productPillars,
  profileProofPoints,
  safetyFeatures,
  trustStats,
} from "@freeborn/shared";
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
export const metadata: Metadata = {
  title: "Date with Autonomy · Freeborn",
  description: "The relationship platform for medical freedom, natural health, and intentional love. Connect with people who share your values.",
  alternates: { canonical: "https://freeborn.app" },
  openGraph: {
    title: "Freeborn · Date with Autonomy",
    description: "The relationship platform for medical freedom, natural health, and intentional love.",
    url: "https://freeborn.app",
    type: "website",
  },
};

function JsonLd() {
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://freeborn.app/#organization",
        name: brand.name,
        url: "https://freeborn.app",
        slogan: "Date with Autonomy.",
        description: brand.seoDescription,
        logo: "https://freeborn.app/freeborn-mark.svg",
      },
      {
        "@type": "WebSite",
        "@id": "https://freeborn.app/#website",
        url: "https://freeborn.app",
        name: brand.name,
        description: brand.seoDescription,
        publisher: { "@id": "https://freeborn.app/#organization" },
        inLanguage: "en-US",
      },
      {
        "@type": "SoftwareApplication",
        "@id": "https://freeborn.app/#app",
        name: brand.name,
        applicationCategory: "SocialNetworkingApplication",
        operatingSystem: "Web, iOS, Android",
        url: "https://freeborn.app",
        description: brand.seoDescription,
        publisher: { "@id": "https://freeborn.app/#organization" },
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
      {
        "@type": "FAQPage",
        "@id": "https://freeborn.app/#faq",
        mainEntity: faqs.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph).replace(/</g, "\\u003c") }}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*  Nav                                                                       */
/* -------------------------------------------------------------------------- */

function Nav() {
  return (
    <header className="sticky top-[calc(1.25rem+env(safe-area-inset-top))] z-50 mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
      <div className="surface ring-pearl flex items-center justify-between rounded-full px-4 py-2.5 sm:px-6">
        <Link href="/" aria-label="Freeborn home" className="flex-shrink-0">
          <Wordmark size="sm" />
        </Link>

        <nav className="hidden items-center gap-10 text-[13px] font-semibold tracking-wide uppercase text-[var(--color-sand)] md:flex">
          <a href="#how" className="transition hover:text-[var(--color-pearl)]">How it works</a>
          <a href="#safety" className="transition hover:text-[var(--color-pearl)]">Safety</a>
          <a href="#community" className="transition hover:text-[var(--color-pearl)]">Values</a>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/auth?mode=sign-in"
            className="hidden px-4 py-2 text-[13px] font-bold text-[var(--color-pearl)]/80 transition hover:text-[var(--color-pearl)] sm:inline-flex"
          >
            Sign in
          </Link>
          <Link
            href="/auth?mode=sign-up"
            className="magic-button relative overflow-hidden rounded-full bg-[var(--color-pearl)] px-6 py-2.5 text-[13px] font-bold text-[var(--color-ink)] transition hover:scale-[1.02] active:scale-[0.98] btn-shine"
          >
            Join now
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
    <section className="relative overflow-hidden pt-6 lg:pt-12">
      {/* Ambient lighting */}
      <div className="aurora-field" />
      <div className="pointer-events-none absolute inset-0 grid-lines opacity-40" />
      <div className="orb drift" style={{ top: "-10%", left: "-10%", width: 700, height: 700, background: "radial-gradient(circle, rgba(239,94,94,0.25), transparent 70%)" }} />
      <div className="orb drift-alt" style={{ top: "-5%", right: "-10%", width: 800, height: 800, background: "radial-gradient(circle, rgba(138,110,242,0.2), transparent 70%)" }} />

      <div className="relative mx-auto w-full max-w-[1200px] px-6 pb-24 pt-4 sm:px-8 lg:px-10 lg:pb-36">
        <Nav />

        <div className="mt-20 grid items-center gap-20 lg:mt-28 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          {/* Left — copy */}
          <div className="z-10 text-center lg:text-left">
            <Reveal>
              <div className="inline-flex justify-center lg:justify-start">
                <SectionLabel label="Medical Freedom · Natural Health · Intentional Love" dot="ember" />
              </div>
            </Reveal>

            <Reveal delay={1}>
              <h1
                className="mt-10 text-[clamp(3.5rem,10vw,5.5rem)] leading-[0.9] tracking-tighter text-[var(--color-pearl)]"
                style={{ fontFamily: "var(--font-display)", fontVariationSettings: "'opsz' 144, 'SOFT' 30, 'wght' 450" }}
              >
                Date with <br className="hidden lg:block" />
                <span className="text-ember font-bold">Autonomy.</span>
              </h1>
            </Reveal>

            <Reveal delay={2}>
              <p className="mx-auto mt-10 max-w-[540px] text-[18px] font-medium leading-relaxed text-[var(--color-sand)] sm:text-[20px] lg:mx-0">
                The relationship platform for people who value informed choice, natural wellness, and building a life on their own terms.
              </p>
            </Reveal>

            <Reveal delay={3}>
              <div className="mt-12 flex flex-col items-center gap-5 sm:flex-row sm:justify-center lg:justify-start">
                <Link
                  href="/auth?mode=sign-up"
                  className="magic-button group relative flex h-16 items-center justify-center gap-4 overflow-hidden rounded-full bg-[var(--gradient-ember-warm)] px-12 text-[16px] font-black uppercase tracking-widest text-white shadow-[var(--shadow-ember)] transition-all hover:translate-y-px btn-shine sm:w-auto"
                >
                  Create Profile
                  <ArrowIcon size={20} strokeWidth={3} className="transition-transform group-hover:translate-x-1" />
                </Link>
                <a
                  href="#how"
                  className="inline-flex h-16 items-center justify-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-10 text-[15px] font-bold uppercase tracking-widest text-[var(--color-pearl)] backdrop-blur-xl transition-all hover:bg-white/[0.08] active:scale-95"
                >
                  Learn More
                </a>
              </div>
            </Reveal>

            <Reveal delay={4}>
              <div className="mt-16 flex flex-wrap justify-center gap-x-10 gap-y-6 text-[12px] font-black uppercase tracking-[0.2em] text-[var(--color-ash)] lg:justify-start">
                <span className="flex items-center gap-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-[var(--color-teal-500)] shadow-[0_0_10px_var(--color-teal-500)]" />
                  Values-Forward
                </span>
                <span className="flex items-center gap-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-[var(--color-gold-500)] shadow-[0_0_10px_var(--color-gold-500)]" />
                  Privacy-First
                </span>
                <span className="flex items-center gap-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-[var(--color-ember-500)] shadow-[0_0_10px_var(--color-ember-500)]" />
                  Long-Term Intent
                </span>
              </div>
            </Reveal>
          </div>

          {/* Right — phone */}
          <Reveal delay={2} className="relative mx-auto w-full max-w-[380px] lg:max-w-none lg:pl-10">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_50%,rgba(239,94,94,0.1),transparent_70%)] blur-[60px]" />
            <PhonePreview />
          </Reveal>
        </div>

        {/* Trust marquee */}
        <Reveal>
          <div className="mt-20 border-y border-white/5 py-8">
            <div className="grid grid-cols-2 gap-8 text-center sm:grid-cols-4">
              {trustStats.map((s) => (
                <div key={s.label} className="px-2">
                  <div
                    className="text-[clamp(1.75rem,3.5vw,2.5rem)] leading-none tracking-tight text-[var(--color-pearl)]"
                    style={{ fontFamily: "var(--font-display)", fontVariationSettings: "'opsz' 144, 'wght' 500" }}
                  >
                    {s.stat}
                  </div>
                  <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--color-mist)]">{s.label}</p>
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
      <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-24">
        <Reveal>
          <div className="relative group">
            <div
              className="pointer-events-none absolute -inset-10 blur-[100px] opacity-40 transition-opacity duration-1000 group-hover:opacity-60"
              style={{ background: "radial-gradient(circle, rgba(239,94,94,0.25), transparent 70%)" }}
            />
            <div className="relative rounded-[48px] border border-white/10 bg-gradient-to-br from-[var(--color-midnight)] to-[var(--color-night)] p-10 shadow-[var(--shadow-card-lg)] sm:p-16 overflow-hidden">
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-[var(--color-ember-500)]/5 blur-[80px]" />
              
              <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-[var(--color-ember-500)]/10 text-[var(--color-ember-500)] shadow-[0_0_20px_rgba(239,94,94,0.15)]">
                <QuoteIcon size={32} strokeWidth={2} />
              </div>
              <p
                className="mt-12 text-[clamp(1.8rem,3.5vw,2.6rem)] leading-[1.1] tracking-tight text-[var(--color-pearl)]"
                style={{ fontFamily: "var(--font-display)", fontVariationSettings: "'opsz' 144, 'wght' 400, 'SOFT' 50" }}
              >
                Dating apps stopped asking what people actually build a life around. Freeborn is for the moment you want <span className="text-ember font-bold">shared values</span> to matter from the start.
              </p>
              <div className="mt-14 flex items-center gap-5">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-white/10 bg-gradient-to-br from-[#ef5e5e] to-[#8a6ef2] p-[2px]">
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-[#0a0d18] text-[13px] font-black tracking-tighter text-white">FB</div>
                </div>
                <div>
                  <p className="text-[15px] font-bold text-[var(--color-pearl)]">The Freeborn Founders</p>
                  <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[var(--color-ash)]">Our Commitment</p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={1}>
          <div className="lg:pl-6">
            <SectionLabel label="Why Freeborn exists" dot="violet" />
            <h2
              className="mt-8 text-[var(--font-display-section)] leading-[1.05] tracking-[var(--tracking-display)] text-[var(--color-pearl)]"
              style={{ fontFamily: "var(--font-display)", fontVariationSettings: "'opsz' 144, 'wght' 450, 'SOFT' 30" }}
            >
              Shared values should not be a <span className="text-warm">late discovery.</span>
            </h2>
            <p className="mt-8 text-lg leading-relaxed text-[var(--color-sand)]">
              Most apps optimize for the reaction. Freeborn is built for recognition — real profiles, deep values, and conversations that begin from shared ground instead of assumptions.
            </p>

            <ul className="mt-12 space-y-8">
              {[
                { icon: HeartIcon, title: "Long-term intent first", body: "No stacks, no infinite scroll. You give each person real attention — and look for the kind of alignment that can hold a relationship." },
                { icon: SparkleIcon, title: "Profiles with values", body: "Wellness rhythms, relationship goals, and lifestyle cues come before empty performance. You learn more than a photo can say." },
                { icon: ShieldIcon, title: "Autonomy belongs here", body: "Designed for people who respect informed choices, natural health, privacy, and the right to build life on their own terms." },
              ].map(({ icon: Icon, title, body }) => (
                <li key={title} className="flex gap-6">
                  <span className="mt-1 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-[var(--color-ember-300)]">
                    <Icon size={22} />
                  </span>
                  <div>
                    <p className="text-lg font-bold text-[var(--color-pearl)]">{title}</p>
                    <p className="mt-2 text-base leading-relaxed text-[var(--color-mist)]">{body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
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
      <div className="mx-auto max-w-4xl text-center">
        <Reveal>
          <SectionLabel label="The Process" dot="gold" />
        </Reveal>
        <Reveal delay={1}>
          <h2
            className="mt-10 text-[clamp(2.5rem,6vw,4rem)] leading-[1.05] tracking-tight text-[var(--color-pearl)]"
            style={{ fontFamily: "var(--font-display)", fontVariationSettings: "'opsz' 144, 'wght' 450, 'SOFT' 30" }}
          >
            A calmer path from <br className="hidden sm:block" />
            <span className="text-ember font-bold">hello</span> to something real.
          </h2>
        </Reveal>
        <Reveal delay={2}>
          <p className="mx-auto mt-8 max-w-2xl text-[18px] font-medium leading-relaxed text-[var(--color-sand)]">
            Four grounded steps. No fake scarcity, no compatibility scores, and no pressure to decide without context.
          </p>
        </Reveal>
      </div>

      <div className="mt-24 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        {howItWorks.map((step, i) => {
          const accents = ["ember", "gold", "violet", "teal"] as const;
          const accent = accents[i];
          const accentVar =
            accent === "ember" ? "var(--color-ember-500)" :
            accent === "gold"   ? "var(--color-gold-500)" :
            accent === "violet"? "var(--color-violet-500)" :
                                 "var(--color-teal-500)";
          return (
            <Reveal key={step.step} delay={(i + 1) as 1 | 2 | 3 | 4}>
              <div className="hover-lift group relative h-full overflow-hidden rounded-[40px] border border-white/5 bg-white/[0.015] p-10 transition-all hover:bg-white/[0.03] shadow-[var(--shadow-raised)]">
                <div
                  className="pointer-events-none absolute -right-8 -top-8 h-48 w-48 rounded-full opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-40"
                  style={{ background: `radial-gradient(circle, ${accentVar}50, transparent 70%)` }}
                />
                <div
                  className="inline-flex h-14 w-14 items-center justify-center rounded-[20px] font-mono text-[14px] font-black"
                  style={{
                    background: `linear-gradient(135deg, ${accentVar}15, ${accentVar}05)`,
                    border: `2px solid ${accentVar}20`,
                    color: accentVar,
                    boxShadow: `0 0 20px ${accentVar}10`,
                  }}
                >
                  {step.step}
                </div>
                <h3
                  className="mt-10 text-[20px] font-bold tracking-tight text-[var(--color-pearl)]"
                  style={{ fontFamily: "var(--font-display)", fontVariationSettings: "'opsz' 144, 'wght' 500" }}
                >
                  {step.title}
                </h3>
                <p className="mt-4 text-[15px] font-medium leading-relaxed text-[var(--color-mist)]">{step.body}</p>
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
      <div className="grid items-start gap-16 lg:grid-cols-[0.8fr,1.2fr] lg:gap-24">
        <Reveal className="lg:sticky lg:top-32">
          <SectionLabel label="The Difference" dot="ember" />
          <h2
            className="mt-8 text-[var(--font-display-section)] leading-[1.05] tracking-[var(--tracking-display)] text-[var(--color-pearl)]"
            style={{ fontFamily: "var(--font-display)", fontVariationSettings: "'opsz' 144, 'wght' 450, 'SOFT' 30" }}
          >
            Built for <br className="hidden lg:block" />
            <span className="text-warm font-bold">Values-Aligned Love.</span>
          </h2>
          <p className="mt-8 text-[18px] font-medium leading-relaxed text-[var(--color-sand)]">
            We sweated the details most apps avoid — how values show up without becoming a debate, how privacy is protected, and how connection begins from shared ground.
          </p>
          <div className="mt-12">
            <Link
              href="/auth?mode=sign-up"
              className="group inline-flex h-14 items-center justify-center gap-4 rounded-full border border-white/10 bg-white/[0.04] px-8 text-[15px] font-bold uppercase tracking-widest text-[var(--color-pearl)] transition-all hover:bg-white/[0.08] active:scale-95 shadow-inner"
            >
              Try Freeborn
              <ArrowIcon size={18} strokeWidth={2.5} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </Reveal>

        <div className="space-y-8">
          {productPillars.map((pillar, i) => (
            <Reveal key={pillar.title} delay={((i % 3) + 1) as 1 | 2 | 3}>
              <div className="hover-lift group relative overflow-hidden rounded-[40px] border border-white/5 bg-gradient-to-br from-[var(--color-midnight)] to-[var(--color-night)] p-10 shadow-[var(--shadow-raised)] transition-all hover:border-white/10">
                <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-1000 group-hover:opacity-100 aurora-anim"
                  style={{ background: "linear-gradient(135deg, rgba(239,94,94,0.05), rgba(138,110,242,0.05), rgba(79,184,167,0.05))" }} />
                <div className="relative flex items-start gap-10">
                  <div className="flex-shrink-0">
                    {i === 0 && <SparkIcon size={40} strokeWidth={1.5} className="text-[var(--color-ember-300)] shadow-[0_0_20px_rgba(239,94,94,0.3)]" />}
                    {i === 1 && <ShieldIcon size={40} strokeWidth={1.5} className="text-[var(--color-teal-300)] shadow-[0_0_20px_rgba(79,184,167,0.3)]" />}
                    {i === 2 && <SparkleIcon size={40} strokeWidth={1.5} className="text-[var(--color-violet-300)] shadow-[0_0_20px_rgba(138,110,242,0.3)]" />}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold tracking-tight text-[var(--color-pearl)]">{pillar.title}</h3>
                    <p className="mt-4 text-[16px] font-medium leading-relaxed text-[var(--color-mist)]">{pillar.body}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}

          {/* Feature grid */}
          <Reveal>
            <div className="grid gap-6 sm:grid-cols-2">
              {[
                { icon: BadgeIcon, title: "Earned Badges", body: "Verification status appears only when a profile has earned it.", color: "var(--color-teal-300)" },
                { icon: LockIcon, title: "Hidden Essentials", body: "Email and birth date stay out of discovery and public surfaces.", color: "var(--color-gold-300)" },
                { icon: EyeIcon, title: "Discovery Control", body: "Full control over when and how your profile is visible to others.", color: "var(--color-violet-300)" },
                { icon: StarIcon, title: "Profile Depth", body: "Photos, bio, and intentions all shape a recognizable profile.", color: "var(--color-ember-300)" },
              ].map(({ icon: Icon, title, body, color }) => (
                <div key={title} className="hover-lift luminous-card rounded-[32px] border border-white/5 bg-white/[0.02] p-8 transition-all hover:bg-white/[0.04] shadow-inner">
                  <Icon size={32} strokeWidth={2} style={{ color }} />
                  <p className="mt-6 text-[17px] font-bold text-[var(--color-pearl)]">{title}</p>
                  <p className="mt-3 text-[14px] font-medium leading-relaxed text-[var(--color-mist)]">{body}</p>
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
      <div className="relative overflow-hidden rounded-[56px] border border-white/10 p-10 sm:p-16 lg:p-20"
        style={{
          background:
            "linear-gradient(160deg, rgba(23,29,54,0.95) 0%, rgba(10,13,24,0.98) 100%)",
        }}
      >
        <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full blur-[100px] opacity-40"
          style={{ background: "radial-gradient(circle, rgba(79,184,167,0.3), transparent 70%)" }} />
        <div className="pointer-events-none absolute -right-24 -bottom-24 h-[400px] w-[400px] rounded-full blur-[100px] opacity-40"
          style={{ background: "radial-gradient(circle, rgba(138,110,242,0.25), transparent 70%)" }} />

        <div className="relative grid gap-16 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <SectionLabel label="Safety, built in" dot="teal" />
            <h2
              className="mt-8 text-[var(--font-display-section)] leading-[1.05] tracking-[var(--tracking-display)] text-[var(--color-pearl)]"
              style={{ fontFamily: "var(--font-display)", fontVariationSettings: "'opsz' 144, 'wght' 450, 'SOFT' 30" }}
            >
              Trust should protect <br className="hidden sm:block" />
              your <span className="text-warm">Autonomy.</span>
            </h2>
            <p className="mt-8 text-lg leading-relaxed text-[var(--color-sand)]">
              Trust is not a vibe; it is visible product behavior. Freeborn is careful about what it shows, what it hides, and how members express values without exposing private essentials.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/auth?mode=sign-up"
                className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-[var(--color-pearl)] px-8 text-[15px] font-bold text-[var(--color-ink)] transition hover:bg-white"
              >
                Create a profile →
              </Link>
            </div>
          </Reveal>

          <div className="grid gap-6 sm:grid-cols-2">
            {safetyFeatures.map((f, i) => (
              <Reveal key={f.title} delay={((i % 3) + 1) as 1 | 2 | 3}>
                <div className="h-full rounded-[24px] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-md">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-teal-500)]/10 text-[var(--color-teal-300)]">
                    <CheckIcon size={20} />
                  </span>
                  <h3 className="mt-6 text-lg font-bold text-[var(--color-pearl)]">{f.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-[var(--color-mist)]">{f.body}</p>
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
/*  Community standard                                                        */
/* -------------------------------------------------------------------------- */

function Community() {
  return (
    <Section id="community">
      <div className="grid items-start gap-16 lg:grid-cols-[0.85fr_1.15fr] lg:gap-24">
        <Reveal className="lg:sticky lg:top-32">
          <SectionLabel label="Community Standard" dot="violet" />
          <h2
            className="mt-8 text-[var(--font-display-section)] leading-[1.05] tracking-[var(--tracking-display)] text-[var(--color-pearl)]"
            style={{ fontFamily: "var(--font-display)", fontVariationSettings: "'opsz' 144, 'wght' 450, 'SOFT' 30" }}
          >
            Clear values. <br className="hidden sm:block" />
            <span className="text-ember font-bold">Shared promises.</span>
          </h2>
          <p className="mt-8 text-[18px] font-medium leading-relaxed text-[var(--color-sand)]">
            Freeborn should feel like a living room with standards, not a feed of interchangeable parts. Every member is asked to protect a room where autonomy and long-term intent are respected.
          </p>
        </Reveal>

        <div className="space-y-6">
          {communityPrinciples.map((item, i) => (
            <Reveal key={item.title} delay={((i % 3) + 1) as 1 | 2 | 3}>
              <div className="hover-lift group relative overflow-hidden rounded-[40px] border border-white/5 bg-white/[0.015] p-10 transition-all hover:bg-white/[0.03] shadow-[var(--shadow-raised)]">
                <div
                  className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full opacity-0 blur-[100px] transition-opacity duration-700 group-hover:opacity-40"
                  style={{ background: i === 0 ? "rgba(239,94,94,0.3)" : i === 1 ? "rgba(217,167,82,0.25)" : "rgba(79,184,167,0.25)" }}
                />
                <div className="relative flex gap-8">
                  <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-[20px] border border-white/10 bg-white/[0.04] font-mono text-[16px] font-black text-[var(--color-gold-300)] shadow-inner">
                    0{i + 1}
                  </span>
                  <div>
                    <h3 className="text-xl font-bold tracking-tight text-[var(--color-pearl)]">{item.title}</h3>
                    <p className="mt-4 text-[16px] font-medium leading-relaxed text-[var(--color-mist)]">{item.body}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Trust ledger                                                              */
/* -------------------------------------------------------------------------- */

function TrustLedger() {
  return (
    <Section id="trust-ledger">
      <div className="relative overflow-hidden rounded-[64px] border border-white/5 bg-[var(--color-midnight)] shadow-[var(--shadow-raised)]">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 70% at 20% 30%, rgba(239,94,94,0.18), transparent 60%), radial-gradient(ellipse 70% 70% at 80% 70%, rgba(79,184,167,0.16), transparent 60%), linear-gradient(160deg, #0d1122, #151a33)",
          }}
        />
        <div className="relative grid gap-16 p-10 sm:p-20 lg:grid-cols-[0.9fr_1.1fr] lg:p-24">
          <Reveal>
            <SectionLabel label="Verification & Integrity" dot="gold" />
            <h2
              className="mt-10 text-[clamp(2.25rem,5vw,3.5rem)] leading-[1.05] tracking-tight text-[var(--color-pearl)]"
              style={{ fontFamily: "var(--font-display)", fontVariationSettings: "'opsz' 144, 'wght' 450, 'SOFT' 30" }}
            >
              The fastest way to lose trust is to <span className="text-warm font-bold">overclaim.</span>
            </h2>
            <p className="mt-8 text-[18px] font-medium leading-relaxed text-[var(--color-sand)]">
              We name what is true in the product and leave the fantasy metrics out. No fake press strips, no invented success rates — just a polished path to meeting with context.
            </p>
            <div className="mt-12 flex flex-col gap-5 sm:flex-row">
              <Link
                href="/auth?mode=sign-up"
                className="group inline-flex h-16 items-center justify-center gap-4 rounded-full bg-[var(--color-pearl)] px-10 text-[16px] font-black uppercase tracking-widest text-[var(--color-ink)] transition-all hover:bg-white active:scale-95"
              >
                Join Honestly
                <ArrowIcon size={20} strokeWidth={3} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </Reveal>

          <div className="grid gap-6">
            {profileProofPoints.map((item, i) => (
              <Reveal key={item.title} delay={((i % 3) + 1) as 1 | 2 | 3}>
                <div className="group rounded-[40px] border border-white/5 bg-white/[0.02] p-8 shadow-inner transition-all hover:bg-white/[0.04]">
                  <div className="flex items-start gap-6">
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-[var(--color-gold-500)]/10 text-[var(--color-gold-300)] shadow-[0_0_20px_rgba(217,167,82,0.1)] group-hover:scale-110 transition-transform">
                      <CheckIcon size={28} strokeWidth={2.5} />
                    </span>
                    <div>
                      <h3 className="text-[18px] font-bold text-[var(--color-pearl)]">{item.title}</h3>
                      <p className="mt-3 text-[15px] font-medium leading-relaxed text-[var(--color-mist)]">{item.body}</p>
                    </div>
                  </div>
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
/*  FAQ                                                                       */
/* -------------------------------------------------------------------------- */

function Faq() {
  return (
    <Section id="faq">
      <div className="mx-auto max-w-3xl text-center">
        <Reveal>
          <SectionLabel label="Common Questions" dot="ember" />
        </Reveal>
        <Reveal delay={1}>
          <h2
            className="mt-8 text-[var(--font-display-section)] leading-[1.05] tracking-[var(--tracking-display)] text-[var(--color-pearl)]"
            style={{ fontFamily: "var(--font-display)", fontVariationSettings: "'opsz' 144, 'wght' 450, 'SOFT' 30" }}
          >
            The things people <br className="hidden sm:block" />
            <span className="text-ember">actually ask.</span>
          </h2>
        </Reveal>
      </div>

      <Reveal delay={2}>
        <div className="mx-auto mt-16 max-w-3xl space-y-4">
          {faqs.map((f, i) => (
            <details key={f.q} className="group rounded-[32px] border border-white/5 bg-white/[0.015] p-2 transition-all hover:bg-white/[0.03]">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 px-6 py-6 text-left">
                <span className="text-lg font-bold text-[var(--color-pearl)] sm:text-xl">{f.q}</span>
                <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-white/10 text-[var(--color-sand)] transition-all group-open:rotate-45 group-open:border-[var(--color-ember-500)]/40 group-open:bg-[var(--color-ember-500)]/5 group-open:text-[var(--color-ember-300)]">
                  <svg width="20" height="20" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M7 1v12M1 7h12"/></svg>
                </span>
              </summary>
              <div className="px-6 pb-8">
                <p className="text-[17px] leading-relaxed text-[var(--color-mist)] font-medium">{f.a}</p>
              </div>
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
    <Section padY={false} className="pb-32 sm:pb-40 lg:pb-48">
      <Reveal>
        <div className="relative overflow-hidden rounded-[64px] border border-white/10 px-8 py-24 text-center sm:px-16 sm:py-32 shadow-[var(--shadow-card-lg)]">
          {/* Animated aurora backdrop */}
          <div
            className="pointer-events-none absolute inset-0 aurora-anim"
            style={{
              background:
                "radial-gradient(ellipse 60% 60% at 20% 40%, rgba(239,94,94,0.35), transparent 60%), radial-gradient(ellipse 60% 60% at 80% 60%, rgba(138,110,242,0.25), transparent 60%), radial-gradient(ellipse 70% 70% at 50% 100%, rgba(217,167,82,0.25), transparent 60%), linear-gradient(180deg, #0d1122, #05070d)",
            }}
          />
          <div className="pointer-events-none absolute inset-0 grid-lines opacity-30" />

          <div className="relative mx-auto max-w-3xl">
            <div className="flex justify-center">
              <SectionLabel label="Join the Community" dot="ember" />
            </div>
            <h2
              className="mx-auto mt-10 text-[var(--font-display-massive)] leading-[0.95] tracking-[var(--tracking-display)] text-[var(--color-pearl)]"
              style={{ fontFamily: "var(--font-display)", fontVariationSettings: "'opsz' 144, 'wght' 400, 'SOFT' 30" }}
            >
              Make the next hello <br className="hidden sm:block" />
              <span className="text-ember">mean something.</span>
            </h2>
            <p className="mx-auto mt-8 max-w-2xl text-[20px] font-medium leading-relaxed text-[var(--color-sand)]">
              Freeborn is ready for intentional people who believe that health choices are personal and lasting love is worth the wait.
            </p>
            <div className="mt-12 flex flex-col items-center justify-center gap-5 sm:flex-row">
              <Link
                href="/auth?mode=sign-up"
                className="magic-button group relative flex h-16 items-center justify-center gap-4 overflow-hidden rounded-full bg-[var(--color-pearl)] px-12 text-[17px] font-black uppercase tracking-widest text-[var(--color-ink)] shadow-[0_24px_64px_-12px_rgba(251,247,242,0.4)] transition-all hover:translate-y-px hover:bg-white btn-shine"
              >
                Build Your Profile
                <ArrowIcon size={20} strokeWidth={3} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <p className="mt-12 text-sm font-bold uppercase tracking-[0.25em] text-[var(--color-ash)]">
              Always Private · Always Free · Built for Autonomy
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
  const columns = [
    {
      title: "Platform",
      links: [
        ["How it works", "#how"],
        ["Safety standard", "#safety"],
        ["Community values", "#community"],
        ["Trust ledger", "#trust-ledger"],
      ],
    },
    {
      title: "Membership",
      links: [
        ["Join Freeborn", "/auth?mode=sign-up"],
        ["Sign in", "/auth?mode=sign-in"],
        ["Common questions", "#faq"],
      ],
    },
    {
      title: "Contact",
      links: [
        ["Support", "mailto:hello@freeborn.app"],
        ["Safety", "mailto:safety@freeborn.app"],
      ],
    },
  ] as const;

  return (
    <footer className="border-t border-white/5 bg-[var(--color-night)]">
      <div className="mx-auto w-full max-w-[1200px] px-6 py-20 sm:px-8 lg:px-10">
        <div className="grid gap-16 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Wordmark size="md" />
            <p className="mt-6 max-w-xs text-base leading-relaxed text-[var(--color-mist)]">
              The relationship platform for medical freedom, natural health, and intentional love.
            </p>
            <div className="mt-8 rounded-3xl border border-white/5 bg-white/[0.02] p-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-sand)]">The Freeborn Promise</p>
              <p className="mt-3 text-sm leading-relaxed text-[var(--color-mist)]">
                No fake metrics. No public exposure of private essentials. Your health autonomy is respected here.
              </p>
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-sand)]">{col.title}</p>
              <ul className="mt-6 space-y-4 text-sm text-[var(--color-mist)]">
                {col.links.map(([label, href]) => (
                  <li key={label}>
                    <a href={href} className="transition hover:text-[var(--color-pearl)]">{label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-20 flex flex-col items-start justify-between gap-6 border-t border-white/5 pt-10 text-[12px] font-medium text-[var(--color-ash)] sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Freeborn. Built with intention.</p>
          <div className="flex items-center gap-6">
            <span>Designed for clarity, consent, and connection.</span>
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
      <JsonLd />
      <Hero />
      <Manifesto />
      <HowItWorks />
      <Pillars />
      <Safety />
      <Community />
      <TrustLedger />
      <Faq />
      <Cta />
      <Footer />
    </main>
  );
}
