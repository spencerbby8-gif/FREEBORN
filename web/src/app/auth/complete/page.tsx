import { AuthCard } from "@/components/auth/auth-card";
import { AuthCompleteClient } from "@/components/auth/auth-complete-client";
import { AuthShell } from "@/components/auth/auth-shell";

export default async function AuthCompletePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const intentValue = Array.isArray(params.intent) ? params.intent[0] : params.intent;
  const intent = intentValue === "recovery" ? "recovery" : "verify";

  return (
    <AuthShell>
      <AuthCard>
        <AuthCompleteClient intent={intent} />
      </AuthCard>
    </AuthShell>
  );
}
