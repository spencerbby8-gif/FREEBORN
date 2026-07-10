"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wordmark } from "@/components/wordmark";
import type { ReactNode } from "react";

const nav = [
  { href: "/app", label: "Discover", icon: "✨" },
  { href: "/app/likes", label: "Likes", icon: "♥" },
  { href: "/app/matches", label: "Matches", icon: "◈" },
  { href: "/app/profile", label: "Profile", icon: "◯" },
];

export function AppShell({
  children,
  displayName,
  photoUrl,
}: {
  children: ReactNode;
  displayName?: string | null;
  photoUrl?: string | null;
}) {
  const pathname = usePathname();

  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-0 hero-grid opacity-25" />
      <div className="orb absolute left-[4%] top-20 h-56 w-56 rounded-full bg-[rgba(255,133,120,0.14)]" />
      <div className="orb orb-alt absolute right-[6%] top-10 h-72 w-72 rounded-full bg-[rgba(140,207,255,0.12)]" />

      <div className="relative mx-auto grid min-h-screen w-full max-w-[1280px] grid-cols-1 gap-0 px-4 py-5 sm:px-6 lg:grid-cols-[260px_1fr] lg:px-8 lg:py-8">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex lg:flex-col">
          <div className="glass-panel premium-border sticky top-8 rounded-[32px] px-5 py-6">
            <Wordmark />
            <nav className="mt-10 space-y-2">
              {nav.map((item) => {
                const active = pathname === item.href || (item.href !== "/app" && pathname?.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                      active
                        ? "bg-white text-[var(--color-ink)] shadow-[0_12px_34px_rgba(0,0,0,0.18)]"
                        : "text-[var(--color-mist)] hover:bg-white/6 hover:text-[var(--color-pearl)]"
                    }`}
                  >
                    <span className="text-[15px] w-5 text-center">{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-10 rounded-[24px] border border-white/10 bg-white/[0.045] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-stone)]">
                Phase 3
              </p>
              <p className="mt-3 text-sm leading-6 text-[var(--color-pearl)]/90">
                Discovery, photos, matching, and premium messaging — live across web and mobile.
              </p>
            </div>

            <form action="/auth/signout" method="post" className="mt-6">
              <button className="w-full rounded-2xl border border-white/12 bg-white/5 py-3 text-sm font-semibold text-[var(--color-pearl)] transition hover:bg-white/10">
                Sign out
              </button>
            </form>
          </div>
        </aside>

        {/* Main */}
        <div className="min-w-0 pb-24 lg:pb-0 lg:pl-8">
          <header className="glass-panel premium-border mb-6 flex items-center justify-between rounded-[28px] px-4 py-3 sm:px-5 lg:hidden">
            <Wordmark />
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-stone)]">Freeborn</p>
                <p className="text-sm font-semibold text-[var(--color-pearl)]">{displayName || "You"}</p>
              </div>
              <div className="h-10 w-10 overflow-hidden rounded-2xl border border-white/14 bg-white/8">
                {photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img alt="" src={photoUrl} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[11px] font-bold text-[var(--color-stone)]">
                    FB
                  </div>
                )}
              </div>
            </div>
          </header>

          <div className="min-w-0">{children}</div>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[rgba(7,16,28,0.9)] backdrop-blur-2xl lg:hidden">
        <div className="mx-auto flex max-w-[560px] items-center justify-around px-2 py-2.5">
          {nav.map((item) => {
            const active = pathname === item.href || (item.href !== "/app" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-w-[72px] flex-col items-center gap-1 rounded-2xl px-3 py-2 text-[11px] font-semibold transition ${
                  active ? "text-[var(--color-pearl)]" : "text-[var(--color-mist)]"
                }`}
              >
                <span className={`text-[18px] ${active ? "" : "opacity-80"}`}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
