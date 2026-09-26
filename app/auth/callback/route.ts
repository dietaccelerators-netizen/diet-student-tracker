import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const requestedNext = requestUrl.searchParams.get("next");

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=invalid-link", requestUrl.origin));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL("/login?error=expired-link", requestUrl.origin));
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login?error=not-authorized", requestUrl.origin));
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    await supabase.auth.signOut();
    return NextResponse.redirect(new URL("/login?error=not-registered", requestUrl.origin));
  }

  const safeNext = requestedNext?.startsWith("/") && !requestedNext.startsWith("//") && !requestedNext.startsWith("/\\") ? requestedNext : null;
  const destination = safeNext ?? (profile.role === "admin" ? "/admin" : "/dashboard");
  return NextResponse.redirect(new URL(destination, requestUrl.origin));
}
