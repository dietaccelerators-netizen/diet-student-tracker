"use client";
import Link from "next/link";
import brand from "./PortalBrand.module.css";
import { PortalIcon } from "./PortalIcon";
import weeklyStyles from "./WeeklyShell.module.css";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/BrandLogo";
export function BrandHeader({ mode = "student", activeView = "home", previewBase }: { previewBase?:string; activeView?: string; mode?: "student" | "admin" | "plain" }) {
  const path = usePathname();
  const home = previewBase ?? (mode === "admin" ? "/admin" : "/dashboard");
  return <>
    <header className={`brand-header app-topbar ${weeklyStyles.header} ${brand.header}`}>
      <Link href={mode === "plain" ? "/login" : home} className="app-brand focus-ring"><span style={{display:"block",width:"clamp(150px, 20vw, 240px)",lineHeight:0}}><BrandLogo variant="wordmark" priority /></span></Link>
      <div className="topbar-account"><span className="account-badge">{mode === "admin" ? "Admin workspace" : "Student workspace"}</span>{mode !== "plain" && <form action="/auth/signout" method="post"><button className="focus-ring signout-button">Sign out</button></form>}</div>
    </header>
    {mode !== "plain" && <aside className={`app-sidebar ${weeklyStyles.sidebar}`}><Link className="da-sidebar-logo" href={home}><BrandLogo variant="wordmark" priority/><small>For Professional Accounting Exams</small></Link><p className="nav-caption">MY WORKSPACE</p><nav aria-label="Main navigation">{(mode === 'admin' ? [['home','Students','◎']] : [['home','Home','⌂'],['subjects','My subjects','▤'],['weekly','Weekly plan','□'],['practice','Practice room','▷'],['report','Learning report','↗'],['resources','Study resources','▥'],['profile','My profile','○']]).map(([key,label,icon])=><Link key={key} className={(previewBase || path === home || (key === "subjects" && path.startsWith("/papers/"))) && (activeView === key || (key === "subjects" && path.startsWith("/papers/"))) ? 'nav-item active' : 'nav-item'} aria-current={(previewBase || path === home || (key === "subjects" && path.startsWith("/papers/"))) && (activeView === key || (key === "subjects" && path.startsWith("/papers/"))) ? 'page' : undefined} href={previewBase && ['home','subjects','weekly','practice'].includes(key)?key==='home'?previewBase:`${previewBase}&view=${key}`:mode === 'admin' ? '/admin' : key === 'home' ? '/dashboard' : `/dashboard?view=${key}`} ><span aria-hidden="true"><PortalIcon name={key}/></span>{label}</Link>)}</nav><div className="sidebar-note"><span className="sidebar-note-tag">YOUR STUDY PLAN</span><h2>Plan your next<br/>study session.</h2><p>Choose a topic, set a time and continue at your pace.</p><div style={{width:112,height:112,margin:"20px auto 4px",borderRadius:16,overflow:"hidden",background:"#fff",padding:6}}><BrandLogo variant="icon"/></div></div><div className="da-sidebar-support"><strong>Need help?</strong><p>Contact your Mastrevo coordinator for study or account support.</p></div><p className="sidebar-footer">Your preparation, in one place.</p></aside>}
  </>;
}
