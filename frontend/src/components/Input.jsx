// Input — transparent, no box, bottom-border only (accent on focus), mono.
//   variant="solid"  -> solid hairline underline (default, for main fields)
//   variant="dotted" -> dotted underline (used for inline editable value rows)
// Pass value + onChange as usual; extra props flow through.
export default function Input({
  variant = 'solid',
  value,
  onChange,
  className = '',
  ...rest
}) {
  const border =
    variant === 'dotted'
      ? 'border-b border-dotted border-ink/40 h-[30px] text-[13.5px]'
      : 'border-b border-solid border-ink/50 h-[38px] text-[14px]'
  return (
    <input
      value={value}
      onChange={onChange}
      className={
        'w-full box-border bg-transparent border-0 p-0 text-ink font-mono ' +
        border +
        ' ' +
        className
      }
      {...rest}
    />
  )
}
