"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/BrandLogo";
export function BrandHeader({ mode = "student" }: { mode?: "student" | "admin" | "plain" }) {
  const path = usePathname();
  const home = mode === "admin" ? "/admin" : "/dashboard";
  return <>
    <header className="brand-header app-topbar">
      <Link href={mode === "plain" ? "/login" : home} className="app-brand focus-ring"><span className="brand-symbol"><BrandLogo priority /></span><span><strong>DIET ACCELERATOR</strong><small>Make preparation count.</small></span></Link>
      <div className="topbar-account"><span className="account-badge">{mode === "admin" ? "Admin workspace" : "Student workspace"}</span>{mode !== "plain" && <form action="/auth/signout" method="post"><button className="focus-ring signout-button">Sign out</button></form>}</div>
    </header>
    {mode !== "plain" && <aside className="app-sidebar"><p className="nav-caption">MY WORKSPACE</p><nav aria-label="Main navigation"><Link className={path === home ? "nav-item active" : "nav-item"} href={home}><span aria-hidden="true">⌂</span>{mode === "admin" ? "Students" : "Overview"}</Link>{mode === "student" && <><Link className="nav-item" href="/dashboard#my-papers"><span aria-hidden="true">▤</span>My papers</Link><Link className="nav-item" href="/dashboard#weekly-focus"><span aria-hidden="true">◎</span>Weekly focus</Link><Link className="nav-item" href="/dashboard#my-progress"><span aria-hidden="true">↗</span>My progress</Link></>}</nav><div className="sidebar-note"><span className="sidebar-note-tag">A LITTLE EVERY DAY</span><h2>Progress has a pace.<br/>Find yours.</h2><p>Show up for one topic today. Your next step matters.</p><div className="image-slot sidebar-image" aria-label="Reserved space for a study image"><span>STUDY IMAGE</span></div></div><p className="sidebar-footer">Your preparation, in one place.</p></aside>}
  </>;
}
