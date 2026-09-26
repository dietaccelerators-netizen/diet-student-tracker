import { redirect } from "next/navigation";
import { initialTrackerState } from "@/lib/mock-data";
import type { Profile } from "@/lib/types";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

function demoProfile(role: "student" | "admin") {
  return initialTrackerState.profiles.find((profile) => profile.role === role)!;
}

export async function getCurrentProfile(): Promise<Profile | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, exam_diet, level")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !data) return null;

  const { data: assignments } = await supabase
    .from("student_papers")
    .select("paper_id")
    .eq("student_id", user.id);

  return {
    id: data.id,
    fullName: data.full_name,
    email: data.email,
    role: data.role,
    examDiet: data.exam_diet ?? "",
    level: data.level ?? "",
    paperIds: (assignments ?? []).map((row) => row.paper_id),
  };
}

export async function requireStudent(): Promise<Profile> {
  if (!isSupabaseConfigured()) {
    if (process.env.NODE_ENV === "production") throw new Error("Supabase is not configured.");
    return demoProfile("student");
  }
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect("/login?error=not-authorized");
    throw new Error("Unreachable after redirect");
  }
  if (profile.role === "admin") redirect("/admin");
  return profile;
}

export async function requireAdmin(): Promise<Profile> {
  if (!isSupabaseConfigured()) {
    if (process.env.NODE_ENV === "production") throw new Error("Supabase is not configured.");
    return demoProfile("admin");
  }
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect("/login?error=not-authorized");
    throw new Error("Unreachable after redirect");
  }
  if (profile.role !== "admin") redirect("/dashboard");
  return profile;
}
