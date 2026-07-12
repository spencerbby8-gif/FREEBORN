import { AppShell } from "@/components/app/app-shell";

function Block({ className = "" }: { className?: string }) {
  return <div className={`skeleton rounded-[28px] border border-white/10 bg-white/[0.035] ${className}`} />;
}

export default function ProfileSectionLoading() {
  return (
    <AppShell>
      <div className="mx-auto w-full max-w-[980px] space-y-6">
        <div>
          <Block className="h-5 w-28" />
          <Block className="mt-6 h-14 max-w-xl" />
          <Block className="mt-4 h-5 max-w-2xl" />
        </div>
        <div className="luminous-card rounded-[38px] border border-white/10 bg-white/[0.02] p-5 shadow-[var(--shadow-card-lg)] sm:p-8">
          <div className="grid gap-5 sm:grid-cols-2">
            <Block className="h-16" />
            <Block className="h-16" />
            <Block className="h-16" />
            <Block className="h-16" />
          </div>
          <Block className="mt-6 h-40" />
          <div className="mt-8 flex justify-between gap-4 border-t border-white/8 pt-6">
            <Block className="h-10 flex-1" />
            <Block className="h-12 w-36" />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
