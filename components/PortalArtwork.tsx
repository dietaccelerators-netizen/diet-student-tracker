import { PortalIcon } from './PortalIcon';
export function subjectIcon(name:string){
 if(/tax|quantitative|management accounting/i.test(name))return 'calculator';
 if(/audit|assurance/i.test(name))return 'search';
 if(/technology|information/i.test(name))return 'computer';
 if(/law|public sector|governance/i.test(name))return 'building';
 if(/finance|financial|economics/i.test(name))return 'report';
 return 'subjects';
}
export function PortalArtwork({kind='subjects',compact=false}:{kind?:string;compact?:boolean}){
 return <div className={`mv-artwork ${compact?'mv-artwork-compact':''}`} aria-hidden="true"><span className="mv-art-orbit"/><span className="mv-art-dot"/><div className="mv-art-sheet"><i/><i/><i/></div><div className="mv-art-tile"><PortalIcon name={kind}/></div><span className="mv-art-check"><PortalIcon name="check"/></span></div>;
}
