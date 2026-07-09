import Link from "next/link";
import { authTrustPoints, brand } from "@freeborn/shared";
import { Wordmark } from "@/components/wordmark";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 hero-grid opacity-30" />
      <div className="orb absolute left-[7%] top-16 h-56 w-56 rounded-full bg-[rgba(255,133,120,0.18)]" />
      <div className="orb orb-alt absolute right-[8%] top-10 h-72 w-72 rounded-full bg-[rgba(140,207,255,0.16)]" />

      <div className="relative mx-auto flex min-h-screen max-w-[1280px] flex-col px-6 py-6 sm:px-8 lg:px-10">
        <header className="glass-panel premium-border flex items-center justify-between rounded-full px-4 py-3 sm:px-6">
          <Wordmark />
          <Link
            href="/"
            className="rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm font-semibold text-[var(--color-pearl)] transition hover:bg-white/10"
          >
            Back to site
          </Link>
        </header>

        <section className="grid flex-1 items-center gap-8 py-8 lg:grid-cols-[1.05fr_0.95fr] lg:py-12">
          <div className="glass-panel premium-border hidden rounded-[40px] p-8 lg:block xl:p-10">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-stone)]">
                Serious, premium authentication
              </div>
              <h1 className="mt-6 max-w-[12ch] font-[family-name:var(--font-display)] text-[clamp(3.2rem,5vw,5.2rem)] leading-[0.93] tracking-[-0.05em] text-[var(--color-pearl)]">
                Trust should feel effortless from the first secure step.
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-8 text-[var(--color-mist)]">
                {brand.manifesto} Freeborn authentication is designed to feel calm, fast, and deliberate across web and mobile.
              </p>
            </div>

            <div className="mt-10 grid gap-4">
              {authTrustPoints.map((item, index) => (
                <article
                  key={item}
                  className={`premium-border rounded-[28px] bg-white/[0.05] p-5 ${index === 1 ? "float-card" : ""}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-1 h-3 w-3 rounded-full bg-[var(--color-accent-gold)]" />
                    <p className="text-base leading-7 text-[var(--color-pearl)]/92">{item}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center">{children}</div>
        </section>
      </div>
    </main>
  );
}
