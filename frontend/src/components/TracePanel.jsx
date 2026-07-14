// TracePanel — the "ANNEXE — TRACE DE CALCUL, DERNIÈRE OPÉRATION" block.
// Renders lines: [{ label, value }] in a 320px | 1fr dotted-rule list.
// Renders nothing unless `show` is true AND there is at least one line.
// Wire `show` to useTrace().traceOn from the page.
export default function TracePanel({ show, lines = [] }) {
  if (!show || !lines || lines.length === 0) return null
  return (
    <div className="border-b border-ink/30 bg-ink/[0.03]">
      <div className="px-14 pt-[22px] pb-1.5 text-[10.5px] tracking-[0.16em] text-accent">
        ANNEXE — TRACE DE CALCUL, DERNIÈRE OPÉRATION
      </div>
      <div className="px-14 pt-2 pb-[30px]">
        {lines.map((line, i) => (
          <div
            key={i}
            className="grid grid-cols-[320px_1fr] gap-6 py-2 border-b border-dotted border-ink/25 items-baseline"
          >
            <span className="text-[11px] text-t1">{line.label}</span>
            <span className="text-[12px] break-all">{line.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
