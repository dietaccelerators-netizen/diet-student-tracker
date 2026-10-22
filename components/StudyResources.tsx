"use client";
import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import type { Paper } from '@/lib/types';
import { PortalIcon } from './PortalIcon';
import styles from './StudyResources.module.css';
type ResourceTab =
  | "all"
  | "standards-frameworks"
  | "tax-legislation"
  | "technical-references"
  | "saved";
type ResourceCategory =
  | "standards-frameworks"
  | "tax-legislation"
  | "technical-references";
type ResourceFormat =
  | "PDF"
  | "Web"
  | "Document";
type ResourceSourceType =
  | "Official"
  | "Approved Reference"
  | "Mastrevo";
type Resource = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: ResourceCategory;
  format: ResourceFormat;
  sourceType: ResourceSourceType;
  publisher: string;
  subjectSlugs: string[];
  subjectCodes: string[];
  tags: string[];
  effectiveFrom?: string;
  uploadedAt?: string;
  active?: boolean;
  verified?: boolean;
  version?: string;
  examDiet?: string;
  updatedAt: string;
  fileSize?: string;
  url: string;
  downloadable: boolean;
  featured?: boolean;
};
type ResourceSubject = {
  slug: string;
  code: string;
  name: string;
};
/* =============================================================================
   REGISTERED SUBJECTS
   In production this should come from the student's selected papers.
============================================================================= */
const sampleSubjects: ResourceSubject[] =
  [
    {
      slug:
        "advanced-taxation",
      code:
        "ATAX",
      name:
        "Advanced Taxation",
    },
    {
      slug:
        "advanced-audit-assurance-and-forensics",
      code:
        "AAAF",
      name:
        "Advanced Audit, Assurance and Forensics",
    },
    {
      slug:
        "strategic-business-reporting",
      code:
        "SBR",
      name:
        "Strategic Business Reporting",
    },
    {
      slug:
        "strategic-financial-management",
      code:
        "SFM",
      name:
        "Strategic Financial Management",
    },
    {
      slug:
        "business-law",
      code:
        "LAW",
      name:
        "Business Law",
    },
    {
      slug:
        "case-study",
      code:
        "CASE",
      name:
        "Case Study",
    },
  ];
/* =============================================================================
   MOCK RESOURCE DATA
   Replace with verified files and Supabase records.
   IMPORTANT:
   These are example catalogue entries showing how the interface should work.
   Do not publish a technical or legal resource to students until its:
   - title
   - version
   - source
   - file
   - effective date
   - examination relevance
   have been verified.
============================================================================= */
const sampleResources: Resource[] =
  [
    {
      id:
        "ifrs-reference",
      slug:
        "ifrs-accounting-standards-reference",
      title:
        "IFRS Accounting Standards — Reference Collection",
      description:
        "Supplementary reference material for financial reporting standards used alongside your Strategic Business Reporting lessons.",
      category:
        "standards-frameworks",
      format:
        "PDF",
      sourceType:
        "Official",
      publisher:
        "Approved Standards Source",
      subjectSlugs: [
        "strategic-business-reporting",
      ],
      subjectCodes: [
        "SBR",
      ],
      tags: [
        "IFRS",
        "financial reporting",
        "standards",
      ],
      version:
        "Current approved edition",
      updatedAt:
        "18 Oct 2026",
      fileSize:
        "Reference file",
      url:
        "/resources/ifrs-accounting-standards-reference.pdf",
      downloadable:
        true,
      featured:
        true,
    },
    {
      id:
        "ias-12",
      slug:
        "ias-12-income-taxes",
      title:
        "IAS 12 — Income Taxes",
      description:
        "Technical reference for current and deferred tax accounting concepts used in financial reporting.",
      category:
        "standards-frameworks",
      format:
        "PDF",
      sourceType:
        "Official",
      publisher:
        "Approved Standards Source",
      subjectSlugs: [
        "strategic-business-reporting",
      ],
      subjectCodes: [
        "SBR",
      ],
      tags: [
        "IAS 12",
        "income taxes",
        "deferred tax",
      ],
      version:
        "Current approved edition",
      updatedAt:
        "16 Oct 2026",
      url:
        "/resources/ias-12-income-taxes.pdf",
      downloadable:
        true,
    },
    {
      id:
        "ifrs-9",
      slug:
        "ifrs-9-financial-instruments",
      title:
        "IFRS 9 — Financial Instruments",
      description:
        "Reference material covering classification, measurement and related financial instrument principles.",
      category:
        "standards-frameworks",
      format:
        "PDF",
      sourceType:
        "Official",
      publisher:
        "Approved Standards Source",
      subjectSlugs: [
        "strategic-business-reporting",
        "strategic-financial-management",
      ],
      subjectCodes: [
        "SBR",
        "SFM",
      ],
      tags: [
        "IFRS 9",
        "financial instruments",
      ],
      version:
        "Current approved edition",
      updatedAt:
        "15 Oct 2026",
      url:
        "/resources/ifrs-9-financial-instruments.pdf",
      downloadable:
        true,
    },
    {
      id:
        "isa-500",
      slug:
        "isa-500-audit-evidence",
      title:
        "ISA 500 — Audit Evidence",
      description:
        "Professional auditing standard reference supporting your study of audit evidence and reliability.",
      category:
        "standards-frameworks",
      format:
        "PDF",
      sourceType:
        "Official",
      publisher:
        "Approved Auditing Standards Source",
      subjectSlugs: [
        "advanced-audit-assurance-and-forensics",
      ],
      subjectCodes: [
        "AAAF",
      ],
      tags: [
        "ISA 500",
        "audit evidence",
      ],
      version:
        "Current approved edition",
      updatedAt:
        "13 Oct 2026",
      url:
        "/resources/isa-500-audit-evidence.pdf",
      downloadable:
        true,
    },
    {
      id:
        "isa-315",
      slug:
        "isa-315-risk-assessment",
      title:
        "ISA 315 — Identifying and Assessing Risks",
      description:
        "Supplementary auditing-standard reference for risk identification and assessment.",
      category:
        "standards-frameworks",
      format:
        "PDF",
      sourceType:
        "Official",
      publisher:
        "Approved Auditing Standards Source",
      subjectSlugs: [
        "advanced-audit-assurance-and-forensics",
      ],
      subjectCodes: [
        "AAAF",
      ],
      tags: [
        "ISA 315",
        "audit risk",
        "risk assessment",
      ],
      version:
        "Current approved edition",
      updatedAt:
        "12 Oct 2026",
      url:
        "/resources/isa-315-risk-assessment.pdf",
      downloadable:
        true,
    },
    {
      id:
        "finance-act",
      slug:
        "finance-act-exam-reference",
      title:
        "Finance Act — Exam Diet Reference",
      description:
        "Approved Finance Act reference applicable to the examination diet configured by the administrator.",
      category:
        "tax-legislation",
      format:
        "PDF",
      sourceType:
        "Official",
      publisher:
        "Federal Government / Approved Source",
      subjectSlugs: [
        "advanced-taxation",
        "business-law",
      ],
      subjectCodes: [
        "ATAX",
        "LAW",
      ],
      tags: [
        "Finance Act",
        "tax legislation",
      ],
      version:
        "Exam-diet controlled",
      examDiet:
        "November 2026",
      updatedAt:
        "20 Oct 2026",
      url:
        "/resources/finance-act-exam-reference.pdf",
      downloadable:
        true,
      featured:
        true,
    },
    {
      id:
        "cita-reference",
      slug:
        "companies-income-tax-reference",
      title:
        "Companies Income Tax — Legislation Reference",
      description:
        "Reference copy for company taxation provisions relevant to Advanced Taxation study.",
      category:
        "tax-legislation",
      format:
        "PDF",
      sourceType:
        "Official",
      publisher:
        "Approved Legislative Source",
      subjectSlugs: [
        "advanced-taxation",
      ],
      subjectCodes: [
        "ATAX",
      ],
      tags: [
        "companies income tax",
        "tax legislation",
      ],
      version:
        "Exam-diet controlled",
      examDiet:
        "November 2026",
      updatedAt:
        "18 Oct 2026",
      url:
        "/resources/companies-income-tax-reference.pdf",
      downloadable:
        true,
    },
    {
      id:
        "vat-reference",
      slug:
        "vat-legislation-reference",
      title:
        "Value Added Tax — Legislation Reference",
      description:
        "Supplementary legislative reference for Value Added Tax study and revision.",
      category:
        "tax-legislation",
      format:
        "PDF",
      sourceType:
        "Official",
      publisher:
        "Approved Legislative Source",
      subjectSlugs: [
        "advanced-taxation",
      ],
      subjectCodes: [
        "ATAX",
      ],
      tags: [
        "VAT",
        "value added tax",
        "tax legislation",
      ],
      version:
        "Exam-diet controlled",
      examDiet:
        "November 2026",
      updatedAt:
        "18 Oct 2026",
      url:
        "/resources/vat-legislation-reference.pdf",
      downloadable:
        true,
    },
    {
      id:
        "firs-circulars",
      slug:
        "firs-circular-collection",
      title:
        "FIRS Circulars — Reference Collection",
      description:
        "A controlled collection of relevant tax circulars provided for supplementary Advanced Taxation reference.",
      category:
        "tax-legislation",
      format:
        "PDF",
      sourceType:
        "Official",
      publisher:
        "Federal Inland Revenue Service",
      subjectSlugs: [
        "advanced-taxation",
      ],
      subjectCodes: [
        "ATAX",
      ],
      tags: [
        "FIRS",
        "circulars",
        "tax administration",
      ],
      version:
        "Curated exam reference",
      examDiet:
        "November 2026",
      updatedAt:
        "17 Oct 2026",
      url:
        "/resources/firs-circular-collection.pdf",
      downloadable:
        true,
    },
    {
      id:
        "ethics-code",
      slug:
        "professional-ethics-reference",
      title:
        "Professional Ethics — Reference Code",
      description:
        "Professional ethics reference supporting audit, assurance and case-study application.",
      category:
        "technical-references",
      format:
        "PDF",
      sourceType:
        "Official",
      publisher:
        "Approved Professional Standards Source",
      subjectSlugs: [
        "advanced-audit-assurance-and-forensics",
        "case-study",
      ],
      subjectCodes: [
        "AAAF",
        "CASE",
      ],
      tags: [
        "ethics",
        "professional conduct",
        "independence",
      ],
      version:
        "Current approved edition",
      updatedAt:
        "15 Oct 2026",
      url:
        "/resources/professional-ethics-reference.pdf",
      downloadable:
        true,
    },
    {
      id:
        "corporate-reporting-reference",
      slug:
        "corporate-reporting-reference-guide",
      title:
        "Corporate Reporting — Technical Reference Guide",
      description:
        "Supplementary reference material for common reporting principles, terminology and disclosure areas.",
      category:
        "technical-references",
      format:
        "Document",
      sourceType:
        "Approved Reference",
      publisher:
        "Mastrevo Reference Library",
      subjectSlugs: [
        "strategic-business-reporting",
      ],
      subjectCodes: [
        "SBR",
      ],
      tags: [
        "financial reporting",
        "technical reference",
      ],
      updatedAt:
        "10 Oct 2026",
      url:
        "/resources/corporate-reporting-reference-guide",
      downloadable:
        false,
    },
    {
      id:
        "case-report-reference",
      slug:
        "professional-report-writing-reference",
      title:
        "Professional Report Writing — Reference Guide",
      description:
        "Supplementary structure reference for formal professional reports and recommendations.",
      category:
        "technical-references",
      format:
        "Document",
      sourceType:
        "Mastrevo",
      publisher:
        "Mastrevo Reference Library",
      subjectSlugs: [
        "case-study",
        "advanced-audit-assurance-and-forensics",
      ],
      subjectCodes: [
        "CASE",
        "AAAF",
      ],
      tags: [
        "report writing",
        "professional writing",
        "case study",
      ],
      updatedAt:
        "8 Oct 2026",
      url:
        "/resources/professional-report-writing-reference",
      downloadable:
        false,
    },
  ];

// Only verified, active document versions belong in the student catalogue.
const publishedResources: Resource[] = [];
const categories = [
 ['standards-frameworks','Standards & Frameworks','IFRS, IAS, ISA and professional frameworks.'],
 ['tax-legislation','Tax & Legislation','Acts, legislation and supplementary circulars.'],
 ['technical-references','Technical References','Ethics, guidance and professional references.'],
] as const;
const tabs = [['all','All Resources'],...categories.map(([id,label])=>[id,label]),['saved','Saved']] as [ResourceTab,string][];
const slug = (name:string) => name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
export function StudyResources({papers,studentId}:{papers:Paper[];studentId:string}) {
 const params=useSearchParams(),router=useRouter(),pathname=usePathname();
 const [sample,setSample]=useState(false),[tab,setTab]=useState<ResourceTab>('all'),[search,setSearch]=useState(''),[format,setFormat]=useState('all');
 const [saved,setSaved]=useState<string[]>([]),[loaded,setLoaded]=useState(false),[notice,setNotice]=useState('');
 const [selected,setSelected]=useState<Resource|null>(null);
 const dialog=useRef<HTMLDialogElement>(null);
 const key=`mastrevo-resources-saved:v1:${studentId}`;
 const subjects=sample?sampleSubjects:papers.map(p=>({slug:p.id,code:p.code,name:p.name}));
 const incoming=params.get('subject')||'all';
 const subject=subjects.find(s=>s.slug===incoming||slug(s.name)===incoming);
 const unavailableSubject=incoming!=='all'&&!subject;
 const incomingResource=params.get('resource');
 const catalogue=sample?sampleResources:publishedResources.filter(r=>r.active&&r.verified);
 useEffect(()=>{try{const value=JSON.parse(localStorage.getItem(key)||'[]');setSaved(Array.isArray(value)?value.filter((id):id is string=>typeof id==='string'):[]);}catch{setNotice('Saved resources are unavailable in this browser.');}setLoaded(true);},[key]);
 useEffect(()=>{if(!incomingResource)return;const source=sample?sampleResources:publishedResources.filter(r=>r.active&&r.verified);const r=source.find(r=>r.slug===incomingResource);setSelected(r||null);if(!r)setNotice('This resource is not available in the selected library.');},[incomingResource,sample]);
 useEffect(()=>{if(selected&&!dialog.current?.open)dialog.current?.showModal();else if(!selected&&dialog.current?.open)dialog.current.close();},[selected]);
 function setSubject(value:string){const next=new URLSearchParams(params.toString());if(value==='all')next.delete('subject');else next.set('subject',value);next.delete('resource');router.replace(`${pathname}?${next}`,{scroll:false});}
 function switchLibrary(value:boolean){setSample(value);setSubject('all');setSelected(null);setNotice('');}
 function toggle(r:Resource){const next=saved.includes(r.id)?saved.filter(id=>id!==r.id):[...saved,r.id];setSaved(next);try{localStorage.setItem(key,JSON.stringify(next));setNotice(`${next.includes(r.id)?'Saved':'Removed'} ${r.title}${sample?' (sample)':''}.`);}catch{setNotice('Changed for this visit only; browser storage is unavailable.');}}
 function clear(){setSearch('');setFormat('all');setTab('all');setSubject('all');}
 const found=catalogue.filter(r=>(tab==='all'||(tab==='saved'?saved.includes(r.id):r.category===tab))&&(!unavailableSubject)&&(incoming==='all'||!!subject&&(r.subjectSlugs.includes(slug(subject.name))||r.subjectCodes.includes(subject.code)))&&(format==='all'||r.format===format)&&[r.title,r.description,r.publisher,...r.tags,...r.subjectCodes].join(' ').toLowerCase().includes(search.trim().toLowerCase())).sort((a,b)=>Number(!!b.featured)-Number(!!a.featured)||a.title.localeCompare(b.title));
 const savedCount=catalogue.filter(r=>saved.includes(r.id)).length;
 function details(r:Resource){setSelected(r);}
 return <section className={styles.page} aria-label="Study Resources">
  <header className={styles.header}><div><span className={styles.eyebrow}>YOUR REFERENCE LIBRARY</span><h1>Study Resources</h1><p>Access supplementary standards, legislation and technical references that support your registered papers.</p></div><span className={styles.icon}><PortalIcon name="resources"/></span></header>
  <div className={styles.libraryMode}><span>Extra support for your studies</span><div className={styles.pills} aria-label="Resource library"><button aria-pressed={!sample} onClick={()=>switchLibrary(false)}>My resources</button><button aria-pressed={sample} onClick={()=>switchLibrary(true)}>Sample library</button></div></div>
  {sample&&<p className={styles.note}>Sample catalogue · Example entries from the supplied design. Documents, publishers, versions and exam relevance are unverified; opening and downloading are unavailable.</p>}
  {(subject||unavailableSubject)&&<div className={styles.context}><div><small>ADDITIONAL RESOURCES FOR</small><h2>{subject?.name||'Unregistered subject'}</h2><p>{subject?'Showing references linked to this paper.':'This subject is not in the selected library.'}</p></div><button className={styles.secondary} onClick={()=>setSubject('all')}>View All Resources</button></div>}
  <section className={styles.filters} aria-label="Filter resources"><label>Search resources<div className={styles.search}><PortalIcon name="search"/><input aria-label="Search resources" type="search" placeholder="Search IFRS, ISA, VAT, Finance Act…" value={search} onChange={e=>setSearch(e.target.value)}/></div></label><label>Subject<select value={subject?.slug||(unavailableSubject?'unavailable':'all')} onChange={e=>setSubject(e.target.value)}><option value="all">{sample?'All sample subjects':'All registered subjects'}</option>{unavailableSubject&&<option value="unavailable">Unregistered subject</option>}{subjects.map(s=><option key={s.slug} value={s.slug}>{s.code} — {s.name}</option>)}</select></label><label>Format<select value={format} onChange={e=>setFormat(e.target.value)}>{['all','PDF','Web','Document'].map(f=><option value={f} key={f}>{f==='all'?'All formats':f}</option>)}</select></label></section>
  <nav className={styles.tabs} aria-label="Resource sections">{tabs.map(([id,label])=><button key={id} aria-current={tab===id?'page':undefined} onClick={()=>setTab(id)}>{label}{id==='saved'?` (${savedCount})`:''}</button>)}</nav>
  {!sample&&!catalogue.length&&tab==='all'&&!search&&incoming==='all'&&<div className={styles.categories}>{categories.map(([id,label,text])=><button key={id} onClick={()=>setTab(id)}><span className={styles.icon}><PortalIcon name={id==='standards-frameworks'?'subjects':id==='tax-legislation'?'notes':'resources'}/></span><h3>{label}</h3><p>{text}</p><span>Browse references →</span></button>)}</div>}
  <div className={styles.sectionHeading}><div><h2>{tab==='saved'?'Saved Resources':'Resource Library'}</h2><p aria-live="polite">{found.length} {sample?'sample ':''}{found.length===1?'resource':'resources'} found</p></div><small>Bookmarks are saved on this device.</small></div>
  {notice&&<p className={styles.note} role="status">{notice}</p>}
  {found.length?<div className={styles.grid}>{found.map(r=><article key={r.id} className={styles.card}><div className={styles.cardTop}><span className={styles.icon}><PortalIcon name="resources"/></span><div className={styles.badges}><span>{categories.find(c=>c[0]===r.category)?.[1]}</span><span>{r.format}</span>{sample&&<span>Sample</span>}</div><button className={styles.bookmark} aria-label={`${saved.includes(r.id)?'Unsave':'Save'} ${r.title}`} aria-pressed={saved.includes(r.id)} disabled={!loaded} onClick={()=>toggle(r)}><Bookmark filled={saved.includes(r.id)}/></button></div><h3>{r.title}</h3><p>{r.description}</p><div className={styles.badges}>{r.subjectCodes.map(c=><span key={c}>{c}</span>)}</div><dl className={styles.metadata}><div><dt>Publisher</dt><dd>{sample?'Awaiting verification':r.publisher}</dd></div><div><dt>Version</dt><dd>{sample?'Not verified':r.version||'Not specified'}</dd></div><div><dt>Exam relevance</dt><dd>{sample?'Not confirmed':r.examDiet||'Not specified'}</dd></div></dl><button className={styles.primary} onClick={()=>details(r)}>View Resource →</button></article>)}</div>:<div className={styles.empty}><span className={styles.icon}><PortalIcon name="resources"/></span><h3>{tab==='saved'?'No saved resources yet':!sample&&!catalogue.length?'Your reference library is being prepared':'No resources found'}</h3><p>{tab==='saved'?'Save resources to find them here again.':!sample&&!catalogue.length?'Approved standards, legislation and technical references will appear here once their versions and exam relevance have been verified.':'Try a different subject, category, format or search phrase.'}</p><div className={styles.actions}>{!sample&&<button className={styles.primary} onClick={()=>switchLibrary(true)}>Explore sample library →</button>}<button className={styles.secondary} onClick={clear}>Clear Filters</button></div></div>}
  <p className={styles.footnote}>These are supplementary references. Your lessons stay in My Subjects and exam practice stays in Practice Room.</p>
  <dialog ref={dialog} className={`${styles.page} ${styles.dialog}`} aria-labelledby="resource-title" onCancel={()=>setSelected(null)} onClose={()=>setSelected(null)}>{selected&&<><div className={styles.dialogHead}><strong>Resource Details</strong><button className={styles.bookmark} aria-label="Close resource details" onClick={()=>setSelected(null)}>×</button></div><div className={styles.dialogBody}><div className={styles.badges}><span>{selected.format}</span><span>{sample?'Sample · unverified':selected.sourceType}</span></div><h2 id="resource-title">{selected.title}</h2><p>{selected.description}</p><h3>Resource information</h3><dl className={styles.metadata}>{[['Publisher',sample?'Awaiting verification':selected.publisher],['Version',sample?'Not verified':selected.version||'Not specified'],['Effective date',sample?'Not verified':selected.effectiveFrom||'Not specified'],['Exam relevance',sample?'Not confirmed':selected.examDiet||'Not specified'],['Uploaded',sample?'No document uploaded':selected.uploadedAt||'Not specified'],['Updated',sample?'Not verified':selected.updatedAt]].map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><h3>Relevant papers</h3><div className={styles.badges}>{selected.subjectCodes.map(c=><span key={c}>{c}</span>)}</div><h3>Tags</h3><div className={styles.badges}>{selected.tags.map(t=><span key={t}>{t}</span>)}</div>{sample&&<p className={styles.note}>This is a catalogue example. No verified document is attached.</p>}<div className={styles.actions}><button className={styles.secondary} disabled={!loaded} aria-pressed={saved.includes(selected.id)} onClick={()=>toggle(selected)}>{saved.includes(selected.id)?'Saved':'Save Resource'}</button>{!sample&&selected.verified&&selected.active?<><a className={styles.primary} href={selected.url} target="_blank" rel="noopener noreferrer">Open Resource ↗</a>{selected.downloadable&&<a className={styles.secondary} href={selected.url} download>Download</a>}</>:<button className={styles.primary} disabled>Document unavailable</button>}</div></div></>}</dialog>
 </section>;
}
function Bookmark({filled}:{filled:boolean}){return <svg width="19" height="19" viewBox="0 0 24 24" fill={filled?'currentColor':'none'} stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M6 3h12v18l-6-4-6 4Z"/></svg>;}
