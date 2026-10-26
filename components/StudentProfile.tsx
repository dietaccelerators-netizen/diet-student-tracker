'use client';
import Link from 'next/link';
import type { Paper, Profile } from '@/lib/types';
import { stageFor } from '@/lib/stages';
import { ManagePapers } from './ManagePapers';
import styles from './StudentProfile.module.css';
export function StudentProfile({student,papers}:{student:Profile;papers:Paper[]}){
 const stage=stageFor(student.level)||student.level||'Stage not set';
 const initials=student.fullName.trim().split(/\s+/).slice(0,2).map(n=>n[0]).join('');
 return <section className={styles.page} aria-label="My profile">
  <header><span className={styles.eyebrow}>YOUR STUDENT ACCOUNT</span><h1>My profile</h1><p>Check your details and the papers you’re preparing for.</p></header>
  <section className={styles.identity} aria-label="Student identity"><span className={styles.avatar} aria-hidden="true">{initials}</span><div><h2>{student.fullName}</h2><p>{stage}<span aria-hidden="true"> · </span>{student.examDiet||'Exam diet not set'}</p></div></section>
  <div className={styles.grid}>
   <section data-ui="card" className={styles.card}><div className={styles.cardHeading}><h2>Personal information</h2><span className={styles.badge}>Coordinator-managed</span></div><dl><div><dt>Full name</dt><dd>{student.fullName}</dd></div><div><dt>Registered email</dt><dd>{student.email||'Not provided'}</dd></div></dl><p className={styles.note}>Your coordinator can correct these details while keeping your learning history linked to your account.</p><Link data-ui="secondary" className={styles.secondary} href="/dashboard?view=support">Prepare a correction request →</Link></section>
   <section data-ui="card" className={styles.card}><div className={styles.cardHeading}><h2>Exam registration</h2><span className={styles.badge}>Coordinator-managed</span></div><dl><div><dt>Exam stage</dt><dd>{stage}</dd></div><div><dt>Exam diet</dt><dd>{student.examDiet||'Not set — confirm with your coordinator'}</dd></div></dl><p className={styles.note}>Need to change your stage or exam diet? Ask your coordinator to update your registration.</p><Link data-ui="secondary" className={styles.secondary} href="/dashboard?view=support">Prepare a registration request →</Link></section>
  </div>
  <section data-ui="card" className={styles.card}><div className={styles.cardHeading}><div><h2>Registered papers</h2><p className={styles.note}>The papers currently selected in your Mastrevo account.</p></div><span className={styles.badge}>You can manage these</span></div>
   {papers.length?<ul className={styles.papers}>{papers.map(p=><li key={p.id}><span className={styles.paperCode}>{p.code}</span><strong>{p.name}</strong></li>)}</ul>:<p className={styles.note}>No papers selected. Choose your papers to personalise your learning space.</p>}
   <ManagePapers studentId={student.id}/>
  </section>
  <footer className={styles.footer}><p>Reading and portal preferences live in <Link href="/dashboard?view=settings">Settings →</Link></p><p>Support requests are prepared as drafts. Download your request and share it with your coordinator; it is not sent automatically.</p></footer>
 </section>;
}
