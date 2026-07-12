import { AppShell } from "@/components/app/app-shell";

function Block({ className = "" }: { className?: string }) {
  return <div className={`skeleton rounded-[28px] border border-white/10 bg-white/[0.035] ${className}`} />;
}

export default function MatchesLoading() {
  return (
    <AppShell>
      <div className="mx-auto w-full max-w-[1280px] space-y-6">
        <header className="rounded-[38px] border border-white/10 bg-white/[0.025] p-5 sm:p-7 lg:p-8">
          <Block className="h-4 w-28" />
          <Block className="mt-4 h-16 max-w-2xl" />
          <Block className="mt-4 h-5 max-w-xl" />
        </header>
        <div className="grid gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="rounded-[40px] border border-white/10 bg-white/[0.02] p-4 lg:h-[calc(100svh-190px)]">
            {Array.from({ length: 7 }).map((_, index) => <Block key={index} className="mb-3 h-20" />)}
          </aside>
          <section className="rounded-[42px] border border-white/10 bg-white/[0.02] p-5 lg:h-[calc(100svh-190px)]">
            <div className="flex items-center gap-4 border-b border-white/8 pb-5">
              <Block className="h-14 w-14" />
              <div className="flex-1"><Block className="h-5 w-48" /><Block className="mt-2 h-3 w-32" /></div>
            </div>
            <div className="space-y-4 py-8">
              <Block className="ml-auto h-16 max-w-md" />
              <Block className="h-20 max-w-lg" />
              <Block className="ml-auto h-24 max-w-xl" />
              <Block className="h-16 max-w-md" />
            </div>
            <Block className="mt-auto h-16 w-full" />
          </section>
        </div>
      </div>
    </AppShell>
  );
}
