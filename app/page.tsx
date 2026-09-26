import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function HomePage() {
  if (!isSupabaseConfigured()) redirect("/login");
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const destination = profile?.role === "admin" ? "/admin" : "/dashboard";
  redirect(destination);
}
