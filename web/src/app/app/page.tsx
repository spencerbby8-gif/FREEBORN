import { Wordmark } from "@/components/wordmark";
import { SectionLabel } from "@/components/section-label";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function formatDate(value: string | null | undefined) {
  if (!value) return "Not available yet";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export default async function AppPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const status = Array.isArray(params.status) ? params.status[0] : params.status;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("onboarding_stage, profile_status, created_at, updated_at, is_verified")
    .eq("id", user?.id ?? "")
    .maybeSingle();

  const providers = user?.app_metadata?.providers as string[] | undefined;
  const isVerified = Boolean(user?.email_confirmed_at || profile?.is_verified);

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 hero-grid opacity-30" />
      <div className="orb absolute left-[8%] top-20 h-56 w-56 rounded-full bg-[rgba(255,133,120,0.16)]" />
      <div className="orb orb-alt absolute right-[10%] top-12 h-72 w-72 rounded-full bg-[rgba(140,207,255,0.15)]" />
      <div className="relative mx-auto flex min-h-screen max-w-[1240px] flex-col px-6 py-6 sm:px-8 lg:px-10">
        <header className="glass-panel premium-border flex items-center justify-between rounded-full px-4 py-3 sm:px-6">
          <Wordmark />
          <form action="/auth/signout" method="post">
            <button className="rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm font-semibold text-[var(--color-pearl)] transition hover:bg-white/10">
              Sign out
            </button>
          </form>
        </header>

        <section className="grid flex-1 gap-6 py-10 lg:grid-cols-[1.04fr_0.96fr]">
          <div className="glass-panel premium-border rounded-[40px] p-7 sm:p-10">
            <SectionLabel label="Protected account area" />
            <h1 className="mt-5 max-w-[11ch] font-[family-name:var(--font-display)] text-[clamp(3rem,6vw,5rem)] leading-[0.94] tracking-[-0.05em] text-[var(--color-pearl)]">
              Authentication that already feels product-grade.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--color-mist)]">
              Phase 1 keeps the post-auth surface intentionally tight: session restore, protected routes, account trust signals, and a clean launch point for onboarding.
            </p>

            {status === "verified" || status === "password-updated" ? (
              <div className="mt-7 rounded-[28px] border border-emerald-300/24 bg-emerald-300/10 p-5 text-emerald-50">
                <p className="text-sm font-semibold">
                  {status === "verified" ? "Email confirmed" : "Password updated"}
                </p>
                <p className="mt-1 text-sm leading-6 opacity-90">
                  {status === "verified"
                    ? "Your account is active and ready for the next phase."
                    : "Your new password has been saved securely."}
                </p>
              </div>
            ) : null}

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <article className="premium-border rounded-[28px] bg-white/[0.05] p-5">
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--color-stone)]">Email</p>
                <p className="mt-3 text-base font-semibold text-[var(--color-pearl)]">{user?.email}</p>
              </article>
              <article className="premium-border rounded-[28px] bg-white/[0.05] p-5">
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--color-stone)]">Verification</p>
                <p className="mt-3 text-base font-semibold text-[var(--color-pearl)]">
                  {isVerified ? "Verified" : "Pending confirmation"}
                </p>
              </article>
              <article className="premium-border rounded-[28px] bg-white/[0.05] p-5">
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--color-stone)]">Providers</p>
                <p className="mt-3 text-base font-semibold capitalize text-[var(--color-pearl)]">
                  {providers?.join(", ") || "email"}
                </p>
              </article>
            </div>
          </div>

          <div className="grid gap-5">
            <article className="premium-border rounded-[34px] bg-[rgba(247,241,232,0.96)] p-7 text-[var(--color-ink)] shadow-[0_24px_70px_rgba(5,10,18,0.28)] sm:p-8">
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[rgba(11,19,32,0.48)]">
                Session state
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-[rgba(11,19,32,0.58)]">Last identity update</p>
                  <p className="mt-2 text-lg font-semibold">{formatDate(user?.updated_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-[rgba(11,19,32,0.58)]">Profile row updated</p>
                  <p className="mt-2 text-lg font-semibold">{formatDate(profile?.updated_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-[rgba(11,19,32,0.58)]">Onboarding stage</p>
                  <p className="mt-2 text-lg font-semibold capitalize">
                    {profile?.onboarding_stage?.replaceAll("_", " ") || "Account created"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[rgba(11,19,32,0.58)]">Profile status</p>
                  <p className="mt-2 text-lg font-semibold capitalize">{profile?.profile_status || "draft"}</p>
                </div>
              </div>
            </article>

            <article className="glass-panel premium-border rounded-[34px] p-7 sm:p-8">
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-stone)]">
                What Phase 1 now guarantees
              </div>
              <ul className="mt-5 space-y-4 text-sm leading-7 text-[var(--color-pearl)]/92 sm:text-base">
                <li>• Email sign up and sign in with validation, error handling, and session restore.</li>
                <li>• Google OAuth wired for browser and native mobile with redirect-safe flows.</li>
                <li>• Password recovery and email verification paths ready for live provider setup.</li>
                <li>• Protected routes that keep unauthenticated users out of the app shell.</li>
              </ul>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}
