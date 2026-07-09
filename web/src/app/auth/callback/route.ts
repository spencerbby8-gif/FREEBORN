import { NextResponse, type NextRequest } from "next/server";
import { safeNextPath } from "@/lib/auth/url";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { origin, searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"), "/app");

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.redirect(new URL("/auth?mode=sign-in&status=env-missing", origin));
  }

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL(next, origin));
    }
  }

  return NextResponse.redirect(new URL("/auth?mode=sign-in&status=oauth-error", origin));
}
