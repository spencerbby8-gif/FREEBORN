import { AppShell } from "@/components/app/app-shell";

function Block({ className = "" }: { className?: string }) {
  return <div className={`skeleton rounded-[28px] border border-white/10 bg-white/[0.035] ${className}`} />;
}

export default function DiscoverLoading() {
  return (
    <AppShell>
      <div className="mx-auto w-full max-w-[1280px] space-y-6">
        <header className="rounded-[38px] border border-white/10 bg-white/[0.025] p-5 sm:p-7 lg:p-8">
          <Block className="h-7 w-32" />
          <Block className="mt-5 h-20 max-w-2xl" />
          <Block className="mt-4 h-5 max-w-xl" />
        </header>
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
          <main className="mx-auto w-full max-w-[760px]">
            <div className="relative min-h-[760px]">
              <Block className="absolute inset-x-4 top-8 h-[720px] opacity-50" />
              <Block className="relative z-10 min-h-[760px] rounded-[46px]" />
            </div>
          </main>
          <aside className="space-y-5">
            <Block className="h-52" />
            <Block className="h-48" />
            <Block className="h-56" />
            <Block className="h-40" />
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
