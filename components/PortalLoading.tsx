/** Static placeholders: no shimmer, fake percentages, or changing announcements. */
export function PortalLoading({label}:{label:string}) {
  return <div className="portal-loading" role="status" aria-live="polite">
    <p>{label}</p><div className="portal-loading-lines" aria-hidden="true"><span/><span/><span/></div>
  </div>;
}
