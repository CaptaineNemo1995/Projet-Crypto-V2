// Section — the 320px | 1fr two-column worksheet block.
// Left column (bordered right): section number + serif sub-title + formula + controls.
// Right column: value rows (usually <Field/>s).
// Bordered bottom hairline.
//
// Props:
//   number   — small accent index (e.g. "1.1")
//   title    — serif sub-title (e.g. "Générer la paire de clés")
//   formula  — optional formula/description node under the title (muted)
//   left     — the controls node (BitSelect, inputs, Btns, notes…)
//   children — the right-column content (value rows)
export default function Section({ number, title, formula, left, children }) {
  return (
    <div className="grid grid-cols-[320px_1fr] border-b border-ink/30">
      <div className="pt-[34px] pr-8 pb-11 pl-14 border-r border-ink/30">
        {number ? (
          <div className="text-[11px] text-accent mb-2">{number}</div>
        ) : null}
        {title ? (
          <div className="font-serif text-[26px] font-medium mb-1.5">
            {title}
          </div>
        ) : null}
        {formula ? (
          <div className="text-[11px] text-t2 leading-[1.8] mb-6">{formula}</div>
        ) : null}
        {left}
      </div>
      <div className="pt-5 pr-14 pb-11 pl-10">{children}</div>
    </div>
  )
}
