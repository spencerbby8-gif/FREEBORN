import { AppShell } from "@/components/app/app-shell";

function SkeletonCard({ className = "" }: { className?: string }) {
  return <div className={`luminous-card rounded-[28px] border border-white/10 bg-white/[0.035] p-6 ${className}`} />;
}

export default function ProfileLoading() {
  return (
    <AppShell>
      <div className="mx-auto w-full max-w-[1220px]">
        <header className="mb-7">
          <div className="skeleton h-3 w-24 rounded-full" />
          <div className="skeleton mt-4 h-14 max-w-xl rounded-2xl" />
          <div className="skeleton mt-4 h-5 max-w-2xl rounded-full" />
        </header>
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px] xl:items-start">
          <main className="space-y-6">
            <SkeletonCard className="h-64" />
            <SkeletonCard className="h-[720px]" />
            <SkeletonCard className="h-96" />
          </main>
          <aside className="space-y-6">
            <SkeletonCard className="h-72" />
            <SkeletonCard className="h-[560px]" />
            <SkeletonCard className="h-80" />
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
