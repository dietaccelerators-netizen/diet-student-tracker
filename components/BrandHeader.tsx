"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/BrandLogo";
export function BrandHeader({ mode = "student", activeView = "home", previewBase }: { previewBase?:string; activeView?: string; mode?: "student" | "admin" | "plain" }) {
  const path = usePathname();
  const home = previewBase ?? (mode === "admin" ? "/admin" : "/dashboard");
  return <>
    <header className="brand-header app-topbar">
      <Link href={mode === "plain" ? "/login" : home} className="app-brand focus-ring"><span className="brand-symbol"><BrandLogo priority /></span><span><strong>DIET ACCELERATOR</strong><small>Make preparation count.</small></span></Link>
      <div className="topbar-account"><span className="account-badge">{mode === "admin" ? "Admin workspace" : "Student workspace"}</span>{mode !== "plain" && <form action="/auth/signout" method="post"><button className="focus-ring signout-button">Sign out</button></form>}</div>
    </header>
    {mode !== "plain" && <aside className="app-sidebar"><Link className="da-sidebar-logo" href={home}><BrandLogo variant="wordmark" priority/><small>Learn · Practice · Pass ICAN</small></Link><p className="nav-caption">MY WORKSPACE</p><nav aria-label="Main navigation">{(mode === 'admin' ? [['home','Students','◎']] : [['home','Home','⌂'],['subjects','My subjects','▤'],['weekly','Weekly plan','□'],['practice','Practice room','▷'],['report','Learning report','↗'],['resources','Study resources','▥'],['profile','My profile','○']]).map(([key,label,icon])=><Link key={key} className={(previewBase || path === home) && activeView === key ? 'nav-item active' : 'nav-item'} aria-current={(previewBase || path === home) && activeView === key ? 'page' : undefined} href={previewBase && ['home','subjects','weekly','practice'].includes(key)?key==='home'?previewBase:`${previewBase}&view=${key}`:mode === 'admin' ? '/admin' : key === 'home' ? '/dashboard' : `/dashboard?view=${key}`} ><span aria-hidden="true">{icon}</span>{label}</Link>)}</nav><div className="sidebar-note"><span className="sidebar-note-tag">A LITTLE EVERY DAY</span><h2>Progress has a pace.<br/>Find yours.</h2><p>Show up for one topic today. Your next step matters.</p><div className="image-slot sidebar-image" aria-label="Reserved space for a study image"><span>STUDY IMAGE</span></div></div><div className="da-sidebar-support"><strong>Need help?</strong><p>Contact your DIET coordinator for study or account support.</p></div><p className="sidebar-footer">Your preparation, in one place.</p></aside>}
  </>;
}
