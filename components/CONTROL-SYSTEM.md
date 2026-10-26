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
