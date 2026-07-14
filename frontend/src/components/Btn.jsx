// Btn — an action button rendered as a clickable span (matches the .dc.html).
// Props:
//   variant  — 'primary' (ink bg, paper text, hover accent bg)
//            | 'outline' (hairline border, hover accent border+text)
//   disabled — dims and blocks onClick (used for the cast button etc.)
//   full     — full width (default true; buttons in the design are block)
//   className — extra classes (e.g. height overrides, margins)
export default function Btn({
  variant = 'primary',
  disabled = false,
  full = true,
  onClick,
  className = '',
  children,
  ...rest
}) {
  const base =
    'flex items-center justify-center h-11 text-[11px] tracking-[0.16em] ' +
    'font-semibold transition-all duration-200 select-none ' +
    (full ? 'w-full ' : '')

  let look
  if (disabled) {
    look = 'bg-ink/10 text-t3 cursor-default'
  } else if (variant === 'outline') {
    look =
      'border border-ink/50 text-ink cursor-pointer hover:border-accent hover:text-accent'
  } else {
    look = 'bg-ink text-paper cursor-pointer hover:bg-accent'
  }

  return (
    <span
      role="button"
      onClick={disabled ? undefined : onClick}
      className={base + look + ' ' + className}
      {...rest}
    >
      {children}
    </span>
  )
}
