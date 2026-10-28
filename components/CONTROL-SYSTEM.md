# Portal controls

The shared rules are in `app/controls.css`; typography stays in each page's module.

- Use `PortalButton` for asynchronous actions. Pass real pending state and a specific `loadingLabel`. It renders a native disabled button while pending; set `type="submit"` explicitly for forms. Keep success/error feedback beside the operation.
- Use `IconButton` with a descriptive `label`; icons are decorative. Use `PortalIcon` for the shared 24-unit, 1.7-stroke family at 18–20 px in controls.
- Use `FilterPill` for selections, not navigation. It exposes `aria-pressed`; selected pills have a checkmark and border as well as colour.
- Existing native buttons and Next links can use `data-ui="primary|secondary|quiet|danger|icon|pill"`. Keep links as links. Do not use `aria-disabled` alone to disable a link.
- Reserve primary blue for the next main action within an area. Use secondary for alternatives. Keep destructive actions in a separate area.
- Use `data-ui="card"` for padded content cards. Illustrated cards use `card-shell` outside and `card-body` around the text to avoid padding the artwork twice.
- Progression uses `arrow-right`; internal disclosure uses `chevron-right` or `chevron-down`; external destinations use `external`. Close controls use `close`.
- Frequent controls target at least 44 × 44 CSS pixels. Small carousel dots sit inside full-size buttons. Nav icons remain 20 px.
- Normal, hover, pressed, focus, disabled and pending states share tokens. Honour both OS and portal reduced-motion preferences. Reading content has no added animation.
- Status text remains required; colour alone is insufficient. This system is not a WCAG conformance claim. Test keyboard flow, focus clipping, reflow and contrast on rendered pages before claiming conformance.

## Purposeful motion

- Use 140ms colour/border transitions for controls; active tab indicators change over the same duration.
- Mark whole-card actions with `data-motion="card"`. Fine pointers get at most a 2px lift; non-actionable containers do not gain a new lift.
- Native help/history disclosures use `data-motion="disclosure"` with a 200ms height transition where supported. Older browsers retain instant native opening and closing. Hidden contents stay non-interactive.
- Bookmarks retain their persistent selected state and the existing saved/removed confirmation. No animation loop is added.
- Session completion feedback is triggered only after the save resolves. Existing totals and the plan update from the saved result; revisiting history does not replay the checkmark animation.
- `PortalLoading` gives draft/resource/session lists a static, labelled placeholder. No shimmer or false progress is shown.
- Existing inline save errors and retry controls are retained. Failed saves do not show completion feedback.
- Both device and portal Reduce Motion disable transitions and hover displacement. Reading content remains still independently of these settings.
- Timings are design defaults, not a conformance claim; test real devices and long study sessions before tuning further.

## Shared layout

- `app/portal-layout.css` owns shell widths, gutters and navigation geometry. Preserve the existing Space Grotesk / Source Sans content typography.
- Use `data-portal-page` for the Home, Subjects and Practice landing surfaces; the shell supplies outer padding, so these pages must not add another gutter. Reading workspaces retain their own layout.
- Desktop navigation participates in the document layout. It sticks only when the viewport is tall enough to show all links; it never creates a second vertical scroll area.
- At 760px and below, use the labelled navigation disclosure. Escape closes it and returns focus to its toggle. Selecting a destination closes it.
- Every shell has a keyboard-visible Skip to content link and a focusable content destination.
- Do not restore promotional panels to the sidebar. Keep announcements on Home below learning actions.
- Preserve explicit unavailable/demo labels. A visual pass does not make question publication, cross-device sample history or ticket delivery operational.
