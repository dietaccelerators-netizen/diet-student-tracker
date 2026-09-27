import Link from "next/link";
import { redirect } from "next/navigation";
import { BrandLogo } from "@/components/BrandLogo";
import { LoginForm } from "@/components/LoginForm";
import { getCurrentProfile } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
const errors: Record<string,string> = {"invalid-link":"That link is not valid. Request a new one below.","expired-link":"That link has expired. Request a new one below.","not-registered":"Your email has not been added yet. Ask your DIET coordinator to approve your access.","not-authorized":"Use the email registered for your DIET Tracker."};
export default async function LoginPage({searchParams}: {searchParams: Promise<{error?: string; mode?: string}>}) {
 if(isSupabaseConfigured()) { const profile = await getCurrentProfile(); if(profile) redirect(profile.role === "admin" ? "/admin" : "/dashboard"); }
 const {error,mode} = await searchParams; const registration = mode === "setup";
 return <main className="enrol-page"><header className="enrol-header"><Link href="/login" className="enrol-logo"><BrandLogo variant="wordmark" priority /></Link><span>{registration ? "Already activated?" : "New to your tracker?"} <Link href={registration ? "/login" : "/login?mode=setup"}>{registration ? "Sign in" : "Get started"} →</Link></span></header>
 <div className="enrol-layout"><aside className="enrol-story"><span className="enrol-tag">YOUR ICAN JOURNEY, WITH DIRECTION</span><h2>A little focus.<br/>A lot of possibility.</h2><p>Your papers, your weekly priorities, and every step forward. All in one place.</p><div className="image-slot enrol-image" aria-label="Reserved space for the main student image"><span>STUDENT IMAGE</span><small>Portrait or illustration · 4:3</small></div><div className="enrol-story-bottom"><span>PLAN WITH PURPOSE</span><span>PRACTISE WITH CONFIDENCE</span></div></aside>
 <section className="enrol-form-panel"><ol className="enrol-progress" aria-label="Account setup stages"><li aria-current="step"><b>1</b> Email</li><li><b>2</b> Verify</li><li><b>3</b> Your papers</li></ol><span className="eyebrow">{registration ? "LET’S GET YOU STARTED" : "WELCOME BACK"}</span><h1>{registration ? "Make room for your next big step." : "Ready for your next step?"}</h1><p className="enrol-description">{registration ? "Activate your DIET account using the email registered by your coordinator. We’ll guide you into your personal tracker." : "Sign in to pick up your preparation from where you left off."}</p>
 {error && errors[error] && <p role="alert" className="auth-error">{errors[error]}</p>}<LoginForm registration={registration}/><div className="enrol-help"><strong>New to DIET Accelerator?</strong><p>Your coordinator needs to add your email before you can activate your tracker.</p></div><p className="enrol-footnote">Built around your papers. Designed for steady progress.</p></section></div></main>;
}
