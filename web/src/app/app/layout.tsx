import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const configured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

  if (!configured) {
    redirect("/auth?mode=sign-in&status=env-missing");
  }

  const supabase = await createSupabaseServerClient();
  const claimsResult = await supabase.auth.getClaims();

  if (!claimsResult.data?.claims) {
    redirect("/auth?mode=sign-in");
  }

  return children;
}
