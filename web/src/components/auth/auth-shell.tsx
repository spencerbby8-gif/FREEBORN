import Link from "next/link";
import { brand } from "@freeborn/shared";
import { Wordmark } from "@/components/wordmark";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 hero-grid opacity-25" />
      <div className="orb absolute -left-20 -top-20 h-72 w-72 rounded-full bg-[rgba(255,133,120,0.12)]" />
      <div className="orb orb-alt absolute -right-20 top-10 h-80 w-80 rounded-full bg-[rgba(140,207,255,0.10)]" />

      <div className="relative mx-auto flex min-h-screen max-w-[1280px] flex-col px-6 py-6 sm:px-8 lg:px-10">
        <header className="glass-panel premium-border flex items-center justify-between rounded-full px-4 py-3 sm:px-6">
          <Wordmark />
          <Link
            href="/"
            className="rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-[var(--color-pearl)] transition hover:bg-white/10"
          >
            Back to home
          </Link>
        </header>

        <section className="grid flex-1 items-center gap-10 py-8 lg:grid-cols-[1fr_1fr] lg:py-16">
          <div className="hidden lg:block">
            <div className="glass-panel premium-border rounded-3xl p-8 xl:p-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-stone)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent-gold)]" />
                A premium experience
              </div>
              <h1 className="mt-6 font-[family-name:var(--font-display)] text-[clamp(2.5rem,4vw,4rem)] leading-[0.94] tracking-[-0.05em] text-[var(--color-pearl)]">
                Trust should feel effortless from the first step.
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-8 text-[var(--color-mist)]">
                {brand.manifesto} Your journey starts with a secure, calm sign-in that respects your privacy.
              </p>

              <div className="mt-10 grid gap-4">
                {[
                  { title: "Secure & private", desc: "Your data is encrypted and never shared without your consent." },
                  { title: "Works everywhere", desc: "Seamless access from your phone, tablet, or computer." },
                  { title: "Recovery built in", desc: "Forgot your password? Reset it securely in minutes." },
                ].map((item, i) => (
                  <div key={item.title} className="flex items-start gap-4 rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                    <div className={`mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br ${
                      i === 0 ? "from-rose-400/20 to-amber-400/10" : i === 1 ? "from-sky-400/20 to-violet-400/10" : "from-emerald-400/20 to-teal-400/10"
                    }`}>
                      <div className="h-2 w-2 rounded-full bg-white/40" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-pearl)]">{item.title}</p>
                      <p className="mt-1 text-sm leading-6 text-[var(--color-mist)]">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center">{children}</div>
        </section>
      </div>
    </main>
  );
}
