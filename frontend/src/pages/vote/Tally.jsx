import { useEffect, useState } from 'react'
import PageHeader from '../../components/PageHeader.jsx'
import Btn from '../../components/Btn.jsx'
import TracePanel from '../../components/TracePanel.jsx'
import { useTrace } from '../../lib/trace.jsx'
import { electionGet, electionTally } from '../../lib/api.js'

// §03.4 — DÉPOUILLEMENT. Multiply every ciphertext into one (∏ cᵢ mod n²) and
// decrypt ONCE. Big serif OUI (accent) / NON counts, proportion bar, product C,
// and a single-decryption note. Trace panel when traceOn.
export default function Tally() {
  const { traceOn } = useTrace()

  const [loaded, setLoaded] = useState(false)
  const [active, setActive] = useState(false)
  const [ballotCount, setBallotCount] = useState(0)

  const [done, setDone] = useState(false)
  const [yes, setYes] = useState(null)
  const [no, setNo] = useState(null)
  const [product, setProduct] = useState('—')
  const [decCount, setDecCount] = useState(0)
  const [trace, setTrace] = useState([])
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const data = await electionGet()
        if (cancelled) return
        if (data && data.active) {
          setActive(true)
          setBallotCount(data.ballot_count || 0)
        } else {
          setActive(false)
        }
      } catch {
        if (!cancelled) setActive(false)
      } finally {
        if (!cancelled) setLoaded(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const runTally = async () => {
    if (busy) return
    setBusy(true)
    setErr('')
    try {
      const res = await electionTally({ trace: traceOn })
      const r = res.results || {}
      setYes(r.yes ?? 0)
      setNo(r.no ?? 0)
      setProduct(res.product || '—')
      setDecCount(res.decryptions ?? 1)
      setTrace(traceOn && Array.isArray(res.trace) ? res.trace : [])
      setDone(true)
    } catch (e) {
      setErr(e.message || 'Échec du dépouillement.')
    } finally {
      setBusy(false)
    }
  }

  const total = (yes || 0) + (no || 0)
  const yesPct = done && total > 0 ? Math.round((yes / total) * 100) : 0
  const verdict = done ? (yes > no ? 'ADOPTÉ' : yes < no ? 'REJETÉ' : 'ÉGALITÉ') : ''

  return (
    <div style={{ animation: 'fadeIn .4s ease both' }}>
      <PageHeader
        kicker="§ 03.4 — UN SEUL DÉCHIFFREMENT, TOTAL UNIQUEMENT"
        title="Le dépouillement"
      />

      <div className="grid grid-cols-[320px_1fr] border-b border-ink/30">
        {/* Controls */}
        <div className="pt-[34px] pr-8 pb-11 pl-14 border-r border-ink/30">
          <div className="text-[11px] text-t2 leading-[1.9] mb-[26px]">
            TOUS LES CHIFFRÉS SONT MULTIPLIÉS EN UN SEUL : ∏ cᵢ mod n². UN UNIQUE
            DÉCHIFFREMENT NE RÉVÈLE QUE LE NOMBRE DE OUI.
          </div>
          <Btn onClick={runTally} disabled={busy || !active} className="tracking-[0.16em]">
            {busy ? 'DÉPOUILLEMENT…' : `DÉPOUILLER — ${ballotCount}`}
          </Btn>
          {err ? (
            <div className="text-[10.5px] text-accent mt-3.5 leading-[1.7]">
              {err}
            </div>
          ) : null}
          <div className="text-[10px] tracking-[0.14em] text-t2 mt-4">
            DÉCHIFFREMENTS EFFECTUÉS — {done ? decCount : 0}
          </div>
          <div className="pt-3.5">
            <div className="text-[10.5px] text-t1 mb-1.5">produit C</div>
            <div className="text-[12.5px] break-all max-h-[60px] overflow-auto">
              {product}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="pt-10 pr-14 pb-14 pl-10 relative min-w-0">
          <div className="flex items-baseline gap-[18px] gap-y-2.5 flex-wrap mb-[26px] pr-[170px]">
            <span
              className="font-serif font-medium leading-none text-accent"
              style={{ fontSize: 'clamp(56px,9vw,110px)' }}
            >
              {done ? yes : '—'}
            </span>
            <span className="text-[11px] tracking-[0.16em] text-t2 whitespace-nowrap">
              OUI — E(1)
            </span>
            <span
              className="font-serif font-medium leading-none"
              style={{ fontSize: 'clamp(56px,9vw,110px)' }}
            >
              {done ? no : '—'}
            </span>
            <span className="text-[11px] tracking-[0.16em] text-t2 whitespace-nowrap">
              NON — E(0)
            </span>
          </div>

          {done ? (
            <span
              className="absolute top-9 right-14 text-[13px] tracking-[0.2em] font-semibold border px-3.5 py-1.5 text-accent border-accent/60 -rotate-6"
              style={{ transform: 'rotate(-6deg)' }}
            >
              {verdict}
            </span>
          ) : null}

          <div className="h-2 bg-ink/[0.12] flex max-w-[560px] mb-[26px]">
            <div
              className="bg-accent h-full transition-[width] duration-500"
              style={{ width: `${yesPct}%` }}
            />
          </div>

          <div className="text-[11px] text-t2 leading-[2] max-w-[520px]">
            POURQUOI PAS RSA ? IL N’EST QU’HOMOMORPHE MULTIPLICATIF — E(x)·E(y) =
            E(x·y), INUTILE POUR COMPTER. PAILLIER ADDITIONNE SOUS LA
            MULTIPLICATION :{' '}
            <span className="text-ink">E(m₁)·E(m₂) mod n² = E(m₁+m₂)</span> —
            EXACTEMENT CE QU’IL FAUT POUR UN DÉPOUILLEMENT.
          </div>
        </div>
      </div>

      <TracePanel show={traceOn} lines={trace} />
    </div>
  )
}
