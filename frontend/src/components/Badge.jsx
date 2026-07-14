// Badge — tiny bordered caps label.
//   variant="secret" -> accent border/text (default for private values)
//   variant="public" -> ink-muted border/text
export default function Badge({ variant = 'public', children }) {
  const secret = variant === 'secret'
  return (
    <span
      className={
        'text-[9px] tracking-[0.14em] px-1.5 py-px border ' +
        (secret
          ? 'text-accent border-accent/50'
          : 'text-t1 border-ink/35')
      }
    >
      {children}
    </span>
  )
}
