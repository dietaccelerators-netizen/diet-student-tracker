import { redirect } from "next/navigation";
import { BrandLogo } from "@/components/BrandLogo";
import { LoginForm } from "@/components/LoginForm";
import { getCurrentProfile } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const errorMessages: Record<string, string> = {
  "invalid-link": "That access link is not valid. Request a new one below.",
  "expired-link": "That access link has expired. Request a new one below.",
  "not-registered": "This account has not been added to the DIET Tracker yet.",
  "not-authorized": "Use the email address registered for your DIET Tracker.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (isSupabaseConfigured()) {
    const profile = await getCurrentProfile();
    if (profile) redirect(profile.role === "admin" ? "/admin" : "/dashboard");
  }

  const { error } = await searchParams;

  return (
    <main className="min-h-screen bg-[#FAFBFB]">
      <div className="mx-auto grid min-h-screen max-w-6xl items-center px-5 py-12 sm:px-8">
        <section className="login-panel mx-auto w-full max-w-md">
          <div className="mb-10 w-[220px] sm:w-[250px]">
            <BrandLogo variant="wordmark" priority />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.17em] text-[#365B46]">Private student portal</p>
          <h1 className="editorial mt-3 text-4xl font-medium leading-[1.05] sm:text-5xl">Welcome to your DIET Tracker</h1>
          <p className="mt-4 max-w-sm text-sm leading-6 text-[#68716B]">Keep your preparation visible and know what deserves your attention next.</p>
          {error && errorMessages[error] && (
            <p className="mt-5 rounded-md border border-[#E7D6D0] bg-[#FCF6F4] px-4 py-3 text-sm text-[#7F4A3D]" role="alert">{errorMessages[error]}</p>
          )}
          <LoginForm />
        </section>
      </div>
    </main>
  );
}
