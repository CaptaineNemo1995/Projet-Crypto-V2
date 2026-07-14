import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../../components/PageHeader.jsx'
import Btn from '../../components/Btn.jsx'
import { electionGet, electionBoard } from '../../lib/api.js'

// §03.3 — REGISTRE PUBLIC. The public board lists every published ciphertext
// (id | ciphertext) with hairline rules. No plaintext is ever readable.
export default function Board() {
  const navigate = useNavigate()

  const [loaded, setLoaded] = useState(false)
  const [active, setActive] = useState(false)
  const [ballots, setBallots] = useState([])

  const refresh = async () => {
    try {
      const status = await electionGet()
      const isActive = !!(status && status.active)
      setActive(isActive)
      if (isActive) {
        const data = await electionBoard()
        setBallots((data && data.ballots) || [])
      } else {
        setBallots([])
      }
    } catch {
      setActive(false)
      setBallots([])
    } finally {
      setLoaded(true)
    }
  }

  useEffect(() => {
    refresh()
    const t = setInterval(refresh, 2000)
    return () => clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const count = ballots.length

  return (
    <div style={{ animation: 'fadeIn .4s ease both' }}>
      <PageHeader
        kicker="§ 03.3 — REGISTRE PUBLIC"
        title="Tableau public"
        right={
          <>
            {count} — PUBLIÉS
            <br />
            CHAQUE CHIFFRÉ EST PUBLIC — AUCUN VOTE N’EST LISIBLE
          </>
        }
      />

      {!loaded ? null : !active ? (
        <div className="px-14 py-14 text-[12px] text-t2 leading-[2]">
          AUCUNE ÉLECTION EN COURS —{' '}
          <a
            onClick={() => navigate('/vote/setup')}
            className="cursor-pointer text-accent border-b border-accent/40 hover:text-ink hover:border-ink"
          >
            CRÉEZ-EN UNE
          </a>
          .
        </div>
      ) : count === 0 ? (
        <div className="px-14 py-14 text-[12px] text-t2">
          AUCUN BULLETIN —{' '}
          <a
            onClick={() => navigate('/vote/booth')}
            className="cursor-pointer text-accent border-b border-accent/40 hover:text-ink hover:border-ink"
          >
            DÉPOSEZ-EN UN DANS L’ISOLOIR
          </a>
          .
        </div>
      ) : (
        <>
          <div className="px-14 pt-2.5 pb-6">
            {ballots.map((b) => (
              <div
                key={b.id}
                className="grid grid-cols-[120px_1fr] gap-6 py-[11px] border-b border-ink/15 items-baseline"
              >
                <span className="text-[11px] text-accent">{b.id}</span>
                <span className="text-[12px] text-t1 break-all">
                  {b.ciphertext}
                </span>
              </div>
            ))}
          </div>
          <div className="px-14 pt-2.5 pb-16">
            <Btn
              full={false}
              onClick={() => navigate('/vote/tally')}
              className="h-11 px-[26px] tracking-[0.16em]"
            >
              CLORE LE SCRUTIN → DÉPOUILLEMENT
            </Btn>
          </div>
        </>
      )}
    </div>
  )
}
