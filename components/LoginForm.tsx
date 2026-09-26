"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const configured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
  const [email, setEmail] = useState(configured ? "" : "tolulope@demo.diet.local");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    if (!configured && process.env.NODE_ENV !== "production") {
      setSent(true);
      window.setTimeout(() => {
        router.push(email.trim().toLowerCase() === "admin@demo.diet.local" ? "/admin" : "/dashboard");
      }, 300);
      return;
    }

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          // Approved DIET emails receive a profile through the database trigger.
          // Unapproved emails may create an Auth identity, but they receive no
          // portal profile and are rejected by the callback route.
          shouldCreateUser: true,
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (authError) throw authError;
      setSent(true);
    } catch {
      setError("We could not send an access link. Check that this email has been added to DIET Accelerator, then try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (sent && configured) {
    return (
      <div className="mt-8 rounded-lg border border-[#D7E2DA] bg-[#F4F8F4] p-5" role="status">
        <p className="font-semibold text-[#365B46]">Check your email</p>
        <p className="mt-2 text-sm leading-6 text-[#5F6A63]">We sent a secure access link to <span className="font-medium text-[#303832]">{email}</span>. Open it on this device to enter your tracker.</p>
        <button type="button" onClick={() => setSent(false)} className="focus-ring mt-4 text-sm font-semibold text-[#365B46]">Use another email</button>
      </div>
    );
  }

  return (
    <form onSubmit={(event) => void submit(event)} className="mt-8">
      <label htmlFor="email" className="mb-2 block text-sm font-medium text-[#303832]">Email address</label>
      <input
        id="email"
        type="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@example.com"
        autoComplete="email"
        className="focus-ring min-h-12 w-full rounded-md border border-[#C9D2CC] bg-white px-3 text-sm"
      />
      {error && <p className="mt-3 text-sm text-[#8C4E3E]" role="alert">{error}</p>}
      <button type="submit" disabled={submitting} className="focus-ring mt-4 min-h-12 w-full rounded-md bg-[#365B46] px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">
        {submitting ? "Sending…" : "Send My Access Link"}
      </button>
      <p className="mt-3 text-xs leading-5 text-[#7A837D]">We&apos;ll email you a secure link to open your tracker. No password is required.</p>
      {!configured && process.env.NODE_ENV !== "production" && <p className="mt-3 text-xs leading-5 text-[#8A735A]">Prototype mode: use <strong>tolulope@demo.diet.local</strong> or <strong>admin@demo.diet.local</strong>.</p>}
    </form>
  );
}
