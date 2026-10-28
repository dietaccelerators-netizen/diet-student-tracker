import type { ReactNode } from 'react';
const paths:Record<string,ReactNode>={
 'arrow-right':<path d="M4 12h16m-6-6 6 6-6 6"/>,
 'arrow-left':<path d="M20 12H4m6-6-6 6 6 6"/>,
 'chevron-right':<path d="m9 5 7 7-7 7"/>,
 'chevron-down':<path d="m5 9 7 7 7-7"/>,
 external:<><path d="M14 3h7v7m0-7L10 14"/><path d="M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5"/></>,
 menu:<path d="M4 6h16M4 12h16M4 18h16"/>,
 close:<path d="m6 6 12 12M6 18 18 6"/>,
 settings:<><path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="3"/><circle cx="15" cy="17" r="3"/></>,
 support:<><circle cx="12" cy="12" r="9"/><path d="M9 9a3 3 0 0 1 6 0c0 2-3 2-3 4m0 3h.01"/></>,
 clock:<><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
 check:<path d="m5 12 4 4L19 6"/>,
 notes:<><rect x="5" y="3" width="15" height="18" rx="2"/><path d="M3 7h4M3 12h4M3 17h4M10 8h6m-6 4h6m-6 4h4"/></>,
 target:<><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></>,
 calculator:<><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M8 6h8M8 11h1m6 0h1m-8 4h1m6 0h1m-8 4h1m6 0h1"/></>,
 search:<><circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/></>,
 computer:<><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8m-4-4v4m-6-10 3-2-3-2m5 5h4"/></>,
 building:<><path d="m2 8 10-5 10 5H2Zm2 13h16M6 11v7m6-7v7m6-7v7"/></>,
 home:<><path d="m3 10 9-7 9 7"/><path d="M5 9v11h5v-6h4v6h5V9"/></>,
 subjects:<><path d="M12 5v16M12 5C9 3 5 3 2 4v15c4-1 7-1 10 2 3-3 6-3 10-2V4c-3-1-7-1-10 1Z"/></>,
 weekly:<><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 11h18M7 15h2m4 0h2m-8 3h2"/></>,
 practice:<><path d="m4 16-1 5 5-1L20 8l-4-4L4 16Zm9-9 4 4M4 16l4 4"/></>,
 report:<><rect x="3" y="13" width="4" height="8" rx="1"/><rect x="10" y="8" width="4" height="13" rx="1"/><rect x="17" y="3" width="4" height="18" rx="1"/></>,
 resources:<path d="M3 5h6l2 3h10v12H3V5Z"/>,
 profile:<><circle cx="12" cy="7" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2H4Z"/></>
};
export function PortalIcon({name,size=20}:{name:string;size?:18|20|24}){return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{paths[name]||paths.profile}</svg>}
