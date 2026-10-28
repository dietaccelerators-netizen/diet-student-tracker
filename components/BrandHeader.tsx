"use client";
import { PreferenceEffects } from './PortalPreferences';
import Link from "next/link";
import { useState } from "react";
import brand from "./PortalBrand.module.css";
import { PortalIcon } from "./PortalIcon";
import weeklyStyles from "./WeeklyShell.module.css";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/BrandLogo";
export function BrandHeader({ mode = "student", activeView = "home", previewBase }: { previewBase?:string; activeView?: string; mode?: "student" | "admin" | "plain" }) {
  const path = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const home = previewBase ?? (mode === "admin" ? "/admin" : "/dashboard");
  return <>
    {mode === "student" && <PreferenceEffects/>}
    {mode !== "plain" && <a className="portal-skip" href="#portal-content">Skip to content</a>}
    <header className={`brand-header app-topbar ${weeklyStyles.header} ${brand.header}`}>
      <Link href={mode === "plain" ? "/login" : home} className="app-brand focus-ring"><span style={{display:"block",width:"clamp(150px, 20vw, 240px)",lineHeight:0}}><BrandLogo variant="wordmark" priority /></span></Link>
      <div className="topbar-account"><span className="account-badge">{mode === "admin" ? "Admin workspace" : "Student workspace"}</span>{mode !== "plain" && <form action="/auth/signout" method="post"><button className="focus-ring signout-button">Sign out</button></form>}</div>
    </header>
    {mode !== "plain" && <aside className={`app-sidebar ${weeklyStyles.sidebar}`} data-open={menuOpen} onKeyDown={e=>{if(e.key==='Escape'){setMenuOpen(false);e.currentTarget.querySelector<HTMLButtonElement>('.portal-menu-toggle')?.focus();}}}><button className="portal-menu-toggle" aria-expanded={menuOpen} aria-controls="portal-navigation" onClick={()=>setMenuOpen(!menuOpen)}><span>{menuOpen?'Close navigation':'Menu'}</span><span aria-hidden="true">{menuOpen?'×':'☰'}</span></button><Link className="da-sidebar-logo" href={home}><BrandLogo variant="wordmark" priority/></Link><p className="nav-caption">MY WORKSPACE</p><nav id="portal-navigation" aria-label="Main navigation" onClick={()=>setMenuOpen(false)}>{(mode === 'admin' ? [['home','Students','◎']] : [['home','Home','⌂'],['subjects','My subjects','▤'],['weekly','Weekly plan','□'],['practice','Practice room','▷'],['report','Learning report','↗'],['resources','Study resources','▥'],['profile','My profile','○'],['settings','Settings','⚙'],['support','Help & Support','?']]).map(([key,label])=><Link key={key} className={(previewBase || path === home || (key === "subjects" && path.startsWith("/papers/"))) && (activeView === key || (key === "subjects" && path.startsWith("/papers/"))) ? 'nav-item active' : 'nav-item'} aria-current={(previewBase || path === home || (key === "subjects" && path.startsWith("/papers/"))) && (activeView === key || (key === "subjects" && path.startsWith("/papers/"))) ? 'page' : undefined} href={previewBase && ['home','subjects','weekly','practice','report','resources','support'].includes(key)?key==='home'?previewBase:`${previewBase}&view=${key}`:mode === 'admin' ? '/admin' : key === 'home' ? '/dashboard' : `/dashboard?view=${key}`} ><span aria-hidden="true"><PortalIcon name={key}/></span>{label}</Link>)}</nav></aside>}
  </>;
}
