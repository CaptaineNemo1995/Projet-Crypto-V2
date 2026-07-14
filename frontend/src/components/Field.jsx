import Badge from './Badge.jsx'

// Field — a value row: small label + optional Badge + mono value.
// The value wraps (word-break) and scrolls vertically if long.
// Props:
//   label   — the row label (left)
//   badge   — optional string shown in a Badge
//   variant — 'secret' | 'public' badge style (default 'public')
//   last    — when true, drops the bottom hairline
//   valueClass — extra classes for the value line (e.g. color for VALID/INVALID)
//   children — the value; if omitted, `value` prop is used
export default function Field({
  label,
  badge,
  variant = 'public',
  last = false,
  value,
  valueClass = '',
  children,
}) {
  return (
    <div className={'py-3.5 ' + (last ? '' : 'border-b border-ink/15')}>
      <div className="flex items-center gap-2.5 mb-1.5">
        <span className="text-[11px] text-t1">{label}</span>
        {badge ? <Badge variant={variant}>{badge}</Badge> : null}
      </div>
      <div
        className={
          'text-[13.5px] break-all max-h-12 overflow-auto ' + valueClass
        }
      >
        {children ?? value}
      </div>
    </div>
  )
}
