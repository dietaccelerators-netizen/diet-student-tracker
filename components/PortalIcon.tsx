import type { ReactNode } from 'react';
const paths:Record<string,ReactNode>={
 home:<><path d="m3 10 9-7 9 7"/><path d="M5 9v11h5v-6h4v6h5V9"/></>,
 subjects:<><path d="M12 5v16M12 5C9 3 5 3 2 4v15c4-1 7-1 10 2 3-3 6-3 10-2V4c-3-1-7-1-10 1Z"/></>,
 weekly:<><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 11h18M7 15h2m4 0h2m-8 3h2"/></>,
 practice:<><path d="m4 16-1 5 5-1L20 8l-4-4L4 16Zm9-9 4 4M4 16l4 4"/></>,
 report:<><rect x="3" y="13" width="4" height="8" rx="1"/><rect x="10" y="8" width="4" height="13" rx="1"/><rect x="17" y="3" width="4" height="18" rx="1"/></>,
 resources:<path d="M3 5h6l2 3h10v12H3V5Z"/>,
 profile:<><circle cx="12" cy="7" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2H4Z"/></>
};
export function PortalIcon({name}:{name:string}){return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{paths[name]||paths.profile}</svg>}
