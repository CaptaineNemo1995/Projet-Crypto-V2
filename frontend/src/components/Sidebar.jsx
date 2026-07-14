import { useLocation, useNavigate } from 'react-router-dom'
import { useTrace } from '../lib/trace.jsx'

// Sidebar — the dark index sidebar (240px, ink bg, paper text).
// Props:
//   election — live election state { active, ballot_count, tallied }
//              used to drive the ✓ step marks on the sub-items.
//
// Step-mark logic (per spec):
//   CRÉATION      done when active
//   ISOLOIR       done when ballot_count > 0
//   TABLEAU PUBLIC done when ballot_count > 0
//   DÉPOUILLEMENT done when tallied
export default function Sidebar({ election }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { traceOn, setTraceOn } = useTrace()

  const active = !!(election && election.active)
  const hasBallots = !!(election && Number(election.ballot_count) > 0)
  const tallied = !!(election && election.tallied)

  const done = {
    setup: active,
    booth: hasBallots,
    board: hasBallots,
    tally: tallied,
  }

  const is = (p) => pathname === p

  // Top-level index row (00/01/02/03)
  const NavRow = ({ to, num, label, on }) => (
    <span
      role="button"
      onClick={() => navigate(to)}
      className={
        'flex items-baseline gap-3.5 px-[22px] py-[11px] cursor-pointer ' +
        'text-[11px] tracking-[0.16em] font-semibold border-l-2 ' +
        'transition-colors duration-200 ' +
        (on
          ? 'text-paper bg-paper/[0.08] border-accent'
          : 'text-paper/45 border-transparent hover:text-paper')
      }
    >
      <span className="text-accent">{num}</span>
      <span>{label}</span>
    </span>
  )

  // Indented sub-item with a live step mark
  const SubRow = ({ to, label, doneKey }) => {
    const on = is(to)
    const isDone = done[doneKey]
    return (
      <span
        role="button"
        onClick={() => navigate(to)}
        className={
          'flex items-baseline gap-3 pl-10 pr-[22px] py-2 cursor-pointer ' +
          'text-[10px] tracking-[0.16em] font-medium border-l-2 ' +
          'transition-colors duration-200 ' +
          (on
            ? 'text-paper bg-paper/[0.06] border-accent'
            : 'text-paper/[0.38] border-transparent hover:text-paper')
        }
      >
        <span
          className={
            'inline-block w-3 ' + (isDone ? 'text-accent' : 'text-paper/30')
          }
        >
          {isDone ? '✓' : '·'}
        </span>
        <span>{label}</span>
      </span>
    )
  }

  return (
    <div className="w-60 flex-none bg-ink text-paper h-screen box-border flex flex-col overflow-y-auto z-50">
      {/* Header → home */}
      <div
        role="button"
        onClick={() => navigate('/')}
        className="px-[22px] py-[26px] border-b border-paper/15 cursor-pointer"
      >
        <div className="font-serif text-[28px] font-medium tracking-[0.02em] leading-none">
          CRYPTA
        </div>
        <div className="text-[9.5px] tracking-[0.18em] text-paper/45 mt-2 leading-[1.4]">
          CRYPTOGRAPHIE AVANCÉE
          <br />
          PROJET FINAL — JUILLET 2026
        </div>
      </div>

      {/* Index nav */}
      <div className="py-[18px] flex flex-col">
        <NavRow to="/" num="00" label="SOMMAIRE" on={is('/')} />
        <NavRow to="/rsa" num="01" label="RSA" on={is('/rsa')} />
        <NavRow to="/elgamal" num="02" label="ELGAMAL" on={is('/elgamal')} />
        <NavRow to="/vote/setup" num="03" label="ÉLECTION" on={false} />
        <SubRow to="/vote/setup" label="CRÉATION" doneKey="setup" />
        <SubRow to="/vote/booth" label="ISOLOIR" doneKey="booth" />
        <SubRow to="/vote/board" label="TABLEAU PUBLIC" doneKey="board" />
        <SubRow to="/vote/tally" label="DÉPOUILLEMENT" doneKey="tally" />
      </div>

      {/* Bottom: trace toggle + server-side note */}
      <div className="mt-auto border-t border-paper/15 px-[22px] py-4">
        <span
          role="button"
          onClick={() => setTraceOn(!traceOn)}
          className="flex items-center gap-[9px] cursor-pointer text-[10px] tracking-[0.16em] text-paper/55 hover:text-paper transition-colors"
        >
          <span
            className={
              'w-2 h-2 transition-colors ' +
              (traceOn ? 'bg-accent' : 'bg-paper/25')
            }
          />
          TRACE DE CALCUL
        </span>
        <div className="text-[9.5px] tracking-[0.12em] text-paper/30 mt-3.5 leading-[1.7]">
          CALCULS EXÉCUTÉS CÔTÉ SERVEUR
          <br />
          PYTHON, SANS BIBLIOTHÈQUE
        </div>
      </div>
    </div>
  )
}
