import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../../components/PageHeader.jsx'
import Badge from '../../components/Badge.jsx'
import Btn from '../../components/Btn.jsx'
import {
  electionGet,
  electionVote,
  electionVoteDemo,
} from '../../lib/api.js'

// §03.2 — L'ÉLECTEUR. The voting booth. If no election, show the bordered
// prompt back to setup. Otherwise a framed BULLETIN OFFICIEL: OUI = E(1) /
// NON = E(0), cast → electionVote → dashed REÇU panel with ciphertext + r.
export default function Booth() {
  const navigate = useNavigate()

  const [loaded, setLoaded] = useState(false)
  const [active, setActive] = useState(false)
  const [question, setQuestion] = useState('')
  const [ballotCount, setBallotCount] = useState(0)

  const [choice, setChoice] = useState(null) // 'yes' | 'no' | null
  const [receipt, setReceipt] = useState(null) // { cipher, r }
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const refresh = async () => {
    try {
      const data = await electionGet()
      if (data && data.active) {
        setActive(true)
        setQuestion(data.question || '')
        setBallotCount(data.ballot_count || 0)
      } else {
        setActive(false)
      }
    } catch {
      setActive(false)
    } finally {
      setLoaded(true)
    }
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const cast = async () => {
    if (busy || !choice) return
    setBusy(true)
    setErr('')
    try {
      const res = await electionVote({ choice })
      setReceipt({ cipher: res.ciphertext, r: res.r })
      setChoice(null)
      await refresh()
    } catch (e) {
      setErr(e.message || 'Échec du dépôt du bulletin.')
    } finally {
      setBusy(false)
    }
  }

  const castDemo = async () => {
    if (busy) return
    setBusy(true)
    setErr('')
    try {
      await electionVoteDemo()
      await refresh()
    } catch (e) {
      setErr(e.message || 'Échec du dépôt des bulletins de démo.')
    } finally {
      setBusy(false)
    }
  }

  const voterId = `ÉLECTEUR #${String(ballotCount + 1).padStart(3, '0')}`

  // A selectable OUI / NON row.
  const choiceRow = (val, label, encLabel) => {
    const selected = choice === val
    return (
      <div
        onClick={() => setChoice(val)}
        className={
          'flex items-center gap-3.5 py-3.5 px-1 cursor-pointer transition-colors ' +
          'border-b border-ink/15 hover:bg-ink/[0.04] ' +
          (selected ? 'bg-ink/[0.04]' : '')
        }
      >
        <span
          className={
            'inline-flex items-center justify-center w-[18px] h-[18px] border text-[11px] ' +
            (selected
              ? 'border-accent text-accent'
              : 'border-ink/40 text-transparent')
          }
        >
          ✓
        </span>
        <span className="text-[14px] font-semibold tracking-[0.08em]">
          {label}
        </span>
        <span className="ml-auto text-[10px] text-t2">{encLabel}</span>
      </div>
    )
  }

  return (
    <div style={{ animation: 'fadeIn .4s ease both' }}>
      <PageHeader kicker="§ 03.2 — L’ÉLECTEUR" title="L’isoloir" />

      {!loaded ? null : !active ? (
        <div className="px-14 py-11">
          <div className="border border-accent p-[28px_32px] flex justify-between items-center gap-6 max-w-[720px] flex-wrap">
            <div>
              <div className="font-serif text-[22px] mb-1">
                Aucune élection en cours.
              </div>
              <div className="text-[11px] text-t2 tracking-[0.06em]">
                L’AUTORITÉ DOIT D’ABORD CRÉER LA PAIRE DE CLÉS PAILLIER.
              </div>
            </div>
            <Btn
              full={false}
              onClick={() => navigate('/vote/setup')}
              className="h-[42px] px-[22px] text-[10.5px] tracking-[0.14em] whitespace-nowrap"
            >
              ALLER À LA CRÉATION
            </Btn>
          </div>
        </div>
      ) : (
        <div className="px-14 pt-11 pb-16 flex gap-11 items-start flex-wrap">
          {/* The official ballot card */}
          <div
            className="flex-[0_0_480px] border border-ink bg-paper2 p-[34px_36px]"
            style={{ outline: '1px solid #191713', outlineOffset: '3px' }}
          >
            <div className="text-center border-b-2 border-ink pb-3.5 mb-1.5">
              <div className="text-[11px] tracking-[0.28em] font-semibold">
                BULLETIN OFFICIEL
              </div>
              <div className="text-[9.5px] tracking-[0.16em] text-t2 mt-1.5">
                {voterId} · CHIFFRÉ DANS L’ISOLOIR
              </div>
            </div>
            <div className="font-serif italic text-[23px] leading-[1.35] pt-4 pb-5 text-center">
              {question}
            </div>
            {choiceRow('yes', 'OUI', 'CHIFFRE E(1)')}
            {choiceRow('no', 'NON', 'CHIFFRE E(0)')}
            <Btn
              onClick={cast}
              disabled={busy || !choice}
              className="mt-5 h-[46px] tracking-[0.16em]"
            >
              {busy ? 'CHIFFREMENT…' : 'CHIFFRER & DÉPOSER LE BULLETIN'}
            </Btn>
          </div>

          {/* Receipt + demo shortcut */}
          <div className="flex-1 min-w-[320px]">
            {receipt ? (
              <div className="border border-dashed border-ink/50 p-[24px_26px] mb-[22px]">
                <div className="text-[10px] tracking-[0.2em] text-accent mb-4">
                  REÇU — CE QUI A QUITTÉ L’ISOLOIR
                </div>
                <div className="py-2.5 border-b border-dotted border-ink/30">
                  <div className="text-[10.5px] text-t1 mb-1.5">
                    chiffré — publié au tableau
                  </div>
                  <div className="text-[12.5px] break-all max-h-[60px] overflow-auto">
                    {receipt.cipher}
                  </div>
                </div>
                <div className="py-2.5">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <span className="text-[10.5px] text-t1">
                      facteur d’aveuglement r
                    </span>
                    <Badge variant="secret">SECRET · NE SORT JAMAIS</Badge>
                  </div>
                  <div className="text-[12.5px] break-all max-h-[60px] overflow-auto">
                    {receipt.r}
                  </div>
                </div>
              </div>
            ) : null}

            {err ? (
              <div className="text-[10.5px] text-accent mb-4 leading-[1.7]">
                {err}
              </div>
            ) : null}

            <div className="text-[11px] text-t2 leading-[2]">
              VOTRE CHOIX EST CHIFFRÉ CÔTÉ SERVEUR. SEUL LE CHIFFRÉ EST PUBLIÉ.
              <br />
              PRESSÉ ?{' '}
              <a
                onClick={castDemo}
                className="cursor-pointer text-accent border-b border-accent/40 hover:text-ink hover:border-ink"
              >
                DÉPOSEZ 20 BULLETINS DE DÉMO
              </a>{' '}
              ET PASSEZ AU{' '}
              <a
                onClick={() => navigate('/vote/board')}
                className="cursor-pointer text-accent border-b border-accent/40 hover:text-ink hover:border-ink"
              >
                TABLEAU PUBLIC
              </a>
              .
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
