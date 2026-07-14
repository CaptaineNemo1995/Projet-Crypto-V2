// PageHeader — the §NN accent kicker + big Newsreader title + optional right meta.
// Props:
//   kicker — small caps accent line (e.g. "§ 01 — CHIFFREMENT À CLÉ PUBLIQUE")
//   title  — big serif title (e.g. "RSA")
//   right  — optional React node shown right-aligned at the baseline (meta/link/badge)
//   titleClass — extra classes for the title (defaults to 64px)
export default function PageHeader({ kicker, title, right, titleClass = '' }) {
  return (
    <div className="px-14 pt-14 pb-[34px] border-b border-ink/30 flex justify-between items-end gap-6">
      <div>
        {kicker ? (
          <div className="text-[11px] tracking-[0.2em] text-accent mb-3.5">
            {kicker}
          </div>
        ) : null}
        <div
          className={
            'font-serif font-medium leading-none ' +
            (titleClass || 'text-[64px]')
          }
        >
          {title}
        </div>
      </div>
      {right ? (
        <div className="text-[10.5px] tracking-[0.1em] text-t2 text-right leading-[1.8]">
          {right}
        </div>
      ) : null}
    </div>
  )
}
