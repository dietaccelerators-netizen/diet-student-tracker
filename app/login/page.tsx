import { HomepagePreview } from "@/components/HomepagePreview";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BrandLogo } from "@/components/BrandLogo";
import { LoginForm } from "@/components/LoginForm";
import { getCurrentProfile } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
const errors: Record<string,string> = {"invalid-link":"That link is not valid. Request a new one below.","expired-link":"That link has expired. Request a new one below.","not-registered":"Your email has not been added yet. Ask your DIET coordinator to approve your access.","not-authorized":"Use the email registered for your DIET Tracker."};
export default async function LoginPage({searchParams}: {searchParams: Promise<{error?: string; mode?: string}>}) {
 const {error,mode} = await searchParams; const registration = mode === "setup"; const recovery = mode === "recovery";
 if(mode === "preview") return <HomepagePreview/>;
 if(!recovery && isSupabaseConfigured()) { const profile = await getCurrentProfile(); if(profile) redirect(profile.role === "admin" ? "/admin" : "/dashboard"); }
 return <main className="enrol-page"><header className="enrol-header"><Link href="/login" className="enrol-logo"><BrandLogo variant="wordmark" priority /></Link><span>{registration ? "Already a student?" : "New to DIET?"} <Link href={registration ? "/login" : "/login?mode=setup"}>{registration ? "Sign in" : "Get started"} →</Link></span></header>
 <div className="enrol-layout"><aside className="enrol-story"><span className="enrol-tag">YOUR ICAN JOURNEY, WITH DIRECTION</span><h2>A little focus.<br/>A lot of possibility.</h2><p>Your papers, your weekly priorities, and every step forward. All in one place.</p><div className="image-slot enrol-image" aria-label="Reserved space for the main student image"><span>STUDENT IMAGE</span><small>Portrait or illustration · 4:3</small></div><div className="enrol-story-bottom"><span>PLAN WITH PURPOSE</span><span>PRACTISE WITH CONFIDENCE</span></div></aside>
 <section className="enrol-form-panel"><span className="eyebrow">{registration ? "LET’S GET YOU STARTED" : "WELCOME BACK"}</span><h1>{recovery ? "Set your password." : registration ? "Your next stage starts here." : "Welcome back."}</h1><p className="enrol-description">{registration ? "Create your profile, choose your exam stage, and make your preparation personal." : "Sign in to pick up your preparation from where you left off."}</p>
 {error && errors[error] && <p role="alert" className="auth-error">{errors[error]}</p>}<LoginForm registration={registration} recovery={recovery}/><div className="enrol-help"><strong>Preparation that fits your stage.</strong><p>ATS 1–3 · Foundation · Skills · Professional</p></div><p className="enrol-footnote">Built around your papers. Designed for steady progress.</p></section></div></main>;
}
