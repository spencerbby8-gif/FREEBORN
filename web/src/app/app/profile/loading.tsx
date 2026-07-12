import { AppShell } from "@/components/app/app-shell";

function Block({ className = "" }: { className?: string }) {
  return <div className={`skeleton rounded-[28px] border border-white/10 bg-white/[0.035] ${className}`} />;
}

export default function ProfileLoading() {
  return (
    <AppShell>
      <div className="mx-auto w-full max-w-[1220px] space-y-6">
        <header>
          <Block className="h-3 w-24" />
          <Block className="mt-4 h-16 max-w-xl" />
          <Block className="mt-4 h-5 max-w-2xl" />
        </header>
        <section className="luminous-card rounded-[44px] border border-white/10 bg-white/[0.02] p-5 shadow-[var(--shadow-card-lg)] sm:p-8 lg:p-10">
          <div className="grid gap-7 lg:grid-cols-[220px_minmax(0,1fr)_280px] lg:items-center">
            <Block className="mx-auto h-48 w-48 lg:mx-0" />
            <div>
              <Block className="h-8 max-w-sm" />
              <Block className="mt-5 h-20 max-w-xl" />
              <Block className="mt-4 h-5 max-w-lg" />
              <Block className="mt-5 h-20 max-w-2xl" />
            </div>
            <Block className="h-56" />
          </div>
        </section>
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => <Block key={index} className="h-36" />)}
        </section>
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <Block className="h-80" />
          <Block className="h-80" />
        </section>
      </div>
    </AppShell>
  );
}
