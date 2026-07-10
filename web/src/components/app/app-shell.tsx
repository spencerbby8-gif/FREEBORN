"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wordmark } from "@/components/wordmark";
import type { ReactNode } from "react";

const nav = [
  { href: "/app", label: "Discover", icon: "spark" },
  { href: "/app/likes", label: "Likes", icon: "heart" },
  { href: "/app/matches", label: "Matches", icon: "chat" },
  { href: "/app/profile", label: "Profile", icon: "user" },
];

const navIcons: Record<string, ReactNode> = {
  spark: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z"/></svg>
  ),
  heart: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78l8.84 8.84 8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/></svg>
  ),
  chat: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
  ),
  user: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  ),
};

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

  const isActive = (href: string) => {
    if (href === "/app") return pathname === "/app";
    return pathname?.startsWith(href);
  };

  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-0 hero-grid opacity-20" />
      <div className="orb absolute -left-20 -top-20 h-64 w-64 rounded-full bg-[rgba(255,133,120,0.10)]" />
      <div className="orb orb-alt absolute -right-20 top-10 h-72 w-72 rounded-full bg-[rgba(140,207,255,0.08)]" />

      <div className="relative mx-auto grid min-h-screen w-full max-w-[1320px] grid-cols-1 gap-0 px-4 py-5 sm:px-6 lg:grid-cols-[240px_1fr] lg:px-8 lg:py-8">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex lg:flex-col">
          <div className="sticky top-8 rounded-3xl border border-white/10 bg-[rgba(9,16,28,0.75)] p-5 backdrop-blur-2xl">
            <Wordmark />
            <nav className="mt-10 space-y-1.5">
              {nav.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all ${
                      active
                        ? "bg-[var(--color-pearl)] text-[var(--color-ink)] shadow-[0_8px_24px_rgba(0,0,0,0.2)]"
                        : "text-[var(--color-mist)] hover:bg-white/[0.04] hover:text-[var(--color-pearl)]"
                    }`}
                  >
                    <span className={`w-5 ${active ? "text-[var(--color-ink)]" : ""}`}>
                      {navIcons[item.icon]}
                    </span>
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-8 rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-stone)]">
                Your journey
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--color-mist)]">
                Meet thoughtful people who share your values and intentions.
              </p>
            </div>

            <form action="/auth/signout" method="post" className="mt-6">
              <button className="w-full rounded-2xl border border-white/10 bg-white/[0.03] py-3 text-sm font-semibold text-[var(--color-mist)] transition hover:bg-white/[0.06] hover:text-[var(--color-pearl)]">
                Sign out
              </button>
            </form>
          </div>
        </aside>

        {/* Main */}
        <div className="min-w-0 pb-28 lg:pb-0 lg:pl-8">
          {/* Mobile header */}
          <header className="glass-panel premium-border mb-6 flex items-center justify-between rounded-2xl px-4 py-3 sm:px-5 lg:hidden">
            <Wordmark />
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs uppercase tracking-[0.15em] text-[var(--color-stone)]">Freeborn</p>
                <p className="text-sm font-semibold text-[var(--color-pearl)]">{displayName || "You"}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/8">
                {photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img alt="" src={photoUrl} className="h-full w-full object-cover" />
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--color-stone)]">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                )}
              </div>
            </div>
          </header>

          <div className="min-w-0">{children}</div>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/8 bg-[rgba(7,16,28,0.92)] backdrop-blur-2xl lg:hidden">
        <div className="mx-auto flex max-w-[500px] items-center justify-around px-2 py-2">
          {nav.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-w-[64px] flex-col items-center gap-1 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                  active ? "text-[var(--color-pearl)]" : "text-[var(--color-mist)]"
                }`}
              >
                <span className={`${active ? "" : "opacity-70"}`}>
                  {navIcons[item.icon]}
                </span>
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
