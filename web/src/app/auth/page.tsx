import { redirect } from "next/navigation";
import type { AuthScreenMode } from "@freeborn/shared";
import { AuthExperience } from "@/components/auth/auth-experience";
import { AuthShell } from "@/components/auth/auth-shell";
import { authStatusMessages, type AuthStatusKey } from "@/lib/auth/messages";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function parseMode(value?: string): AuthScreenMode {
  if (value === "sign-up") return "sign-up";
  if (value === "reset-password") return "reset-password";
  if (value === "update-password") return "update-password";
  return "sign-in";
}

export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const rawMode = Array.isArray(params.mode) ? params.mode[0] : params.mode;
  const rawStatus = Array.isArray(params.status) ? params.status[0] : params.status;
  const mode = parseMode(rawMode);

  const configured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

  let claims: Record<string, unknown> | null | undefined;
  if (configured) {
    const supabase = await createSupabaseServerClient();
    const result = await supabase.auth.getClaims();
    claims = result.data?.claims;
  }

  if (claims && mode !== "update-password") {
    redirect("/app");
  }

  const derivedStatus = !configured ? "env-missing" : rawStatus;
  const status =
    derivedStatus && derivedStatus in authStatusMessages
      ? (derivedStatus as AuthStatusKey)
      : undefined;

  const notice = status ? authStatusMessages[status] : undefined;

  return (
    <AuthShell>
      <AuthExperience
        initialMode={mode}
        notice={notice}
      />
    </AuthShell>
  );
}
