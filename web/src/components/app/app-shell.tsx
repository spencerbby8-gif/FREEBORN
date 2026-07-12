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
    <div className="relative min-h-screen overflow-hidden bg-[var(--color-night)]">
      {/* Background Ambience */}
      <div className="aurora-field" />
      <div className="pointer-events-none absolute inset-0 grid-lines opacity-20" />
      <div className="orb drift absolute -left-20 -top-20 h-[500px] w-[500px] rounded-full bg-[rgba(239,94,94,0.12)] blur-[80px]" />
      <div className="orb drift-alt absolute -right-24 top-10 h-[600px] w-[600px] rounded-full bg-[rgba(138,110,242,0.1)] blur-[100px]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1400px] flex-col lg:flex-row">
        {/* Desktop Sidebar */}
        <aside className="hidden w-[280px] shrink-0 flex-col lg:flex">
          <div className="sticky top-0 flex h-screen flex-col px-6 py-10">
            <Link href="/" className="mb-12 block transition hover:opacity-80">
              <Wordmark size="md" />
            </Link>

            <nav className="flex-1 space-y-2">
              {nav.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center gap-4 rounded-2xl px-5 py-3.5 text-[15px] font-bold transition-all ${
                      active
                        ? "bg-[var(--gradient-ember-warm)] text-white shadow-[0_12px_28px_-8px_rgba(239,94,94,0.6)]"
                        : "text-[var(--color-sand)] hover:bg-white/[0.04] hover:text-[var(--color-pearl)]"
                    }`}
                  >
                    <span className={`transition-transform duration-300 group-hover:scale-110 ${active ? "text-white" : "text-[var(--color-ash)] group-hover:text-[var(--color-ember-300)]"}`}>
                      {navIcons[item.icon]}
                    </span>
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto space-y-6">
              <div className="rounded-[28px] border border-white/5 bg-white/[0.02] p-5 shadow-inner">
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--color-ash)]">
                  Community Standard
                </p>
                <p className="mt-3 text-[13px] font-medium leading-relaxed text-[var(--color-mist)]">
                  Respect health autonomy. Date with intention.
                </p>
              </div>

              <form action="/auth/signout" method="post">
                <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] py-3 text-[13px] font-bold text-[var(--color-ash)] transition-all hover:border-red-500/20 hover:bg-red-500/5 hover:text-red-300">
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          {/* Mobile Top Header */}
          <header className="sticky top-0 z-30 flex items-center justify-between bg-[var(--color-night)]/80 px-6 py-4 backdrop-blur-xl lg:hidden border-b border-white/5">
            <Wordmark size="sm" />
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-inner">
                {photoUrl ? (
                  <img alt="" src={photoUrl} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-rose-500/20 to-amber-500/20 text-[10px] font-black text-white/40">
                    {(displayName ?? "FB").slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
          </header>

          <div className="px-6 py-8 pb-32 sm:px-8 lg:px-10 lg:py-12 lg:pb-12">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/5 bg-[var(--color-night)]/90 pb-[env(safe-area-inset-bottom)] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] backdrop-blur-2xl lg:hidden">
        <div className="mx-auto flex max-w-[500px] items-center justify-around px-4 py-3">
          {nav.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1.5 transition-all active:scale-90 ${
                  active ? "text-[var(--color-pearl)]" : "text-[var(--color-ash)]"
                }`}
              >
                <div className={`relative flex h-10 w-10 items-center justify-center rounded-2xl transition-all duration-300 ${
                  active ? "bg-[var(--color-ember-500)]/15 text-[var(--color-ember-300)] shadow-[0_0_15px_rgba(239,94,94,0.2)]" : "bg-transparent"
                }`}>
                  {navIcons[item.icon]}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
