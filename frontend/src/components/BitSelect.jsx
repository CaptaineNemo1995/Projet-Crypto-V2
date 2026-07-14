// BitSelect — 256/512/1024/2048 as spaced underlined mono options.
// Selected = accent + underline; others = muted, hover to ink.
// Props: value (number), onChange (fn(number)), options (default [256,512,1024,2048]).
export default function BitSelect({
  value,
  onChange,
  options = [256, 512, 1024, 2048],
}) {
  return (
    <div className="flex gap-[18px]">
      {options.map((b) => {
        const on = value === b
        return (
          <span
            key={b}
            role="button"
            onClick={() => onChange(b)}
            className={
              'cursor-pointer text-[12px] pb-0.5 border-b-2 transition-colors duration-200 ' +
              (on
                ? 'font-semibold text-accent border-accent'
                : 'font-normal text-t2 border-transparent hover:text-ink')
            }
          >
            {b}
          </span>
        )
      })}
    </div>
  )
}
