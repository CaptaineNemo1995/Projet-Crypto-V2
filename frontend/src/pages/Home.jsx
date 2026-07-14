import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

// 00 SOMMAIRE — the cahier index.
// Big Newsreader hero (italic accent word), intro paragraph, three clickable
// index rows (01 RSA / 02 ElGamal / 03 L'élection), then FIG. 1 — the animated
// 4-stage RSA pipeline. No API calls; the pipeline numbers are decorative.
// Timing/stops ported from the .dc.html `startLoop`.

const STOPS = [0, 37.5, 62.5, 100] // progress-bar width % per phase
const HEX = '0123456789ABCDEF'

// One index row — number, title, description, arrow. Whole row is clickable.
function IndexRow({ n, title, desc, onClick }) {
  return (
    <div
      onClick={onClick}
      className="grid grid-cols-[110px_1fr_380px_56px] items-baseline px-14 py-[30px] border-b border-ink/30 cursor-pointer transition-colors duration-200 hover:bg-ink/[0.05]"
    >
      <span className="text-[12px] text-accent">{n}</span>
      <span className="font-serif text-[34px] font-medium">{title}</span>
      <span className="text-[10.5px] tracking-[0.1em] text-t2 leading-[1.7]">
        {desc}
      </span>
      <span className="font-serif text-[26px] text-right">→</span>
    </div>
  )
}

// One labelled stage marker under the pipeline bar.
function Stage({ phase, index, align, children }) {
  const on = phase >= index
  return (
    <div style={{ textAlign: align }}>
      <div
        className="inline-block w-[7px] h-[7px] mb-2 transition-colors duration-500"
        style={{ background: on ? '#B3341F' : 'rgba(25,23,19,.2)' }}
      />
      <div
        className="font-mono text-[10px] tracking-[0.14em] font-semibold transition-colors duration-500"
        style={{ color: on ? '#191713' : '#A29D8D' }}
      >
        {children}
      </div>
    </div>
  )
}

export default function Home() {
  const navigate = useNavigate()

  // phase: 0..3 pipeline stage · mText: chip label · done: c produced · visible: chip opacity
  const [phase, setPhase] = useState(0)
  const [mText, setMText] = useState('m = 4886')
  const [done, setDone] = useState(false)
  const [visible, setVisible] = useState(true)

  const timers = useRef([])
  const scrambler = useRef(null)

  useEffect(() => {
    const clearAll = () => {
      timers.current.forEach(clearTimeout)
      timers.current = []
      if (scrambler.current) {
        clearInterval(scrambler.current)
        scrambler.current = null
      }
    }
    const t = (fn, ms) => timers.current.push(setTimeout(fn, ms))

    const startLoop = () => {
      clearAll()
      setPhase(0)
      setMText('m = 4886')
      setDone(false)
      setVisible(true)
      t(() => {
        setPhase(1)
        setMText('m = 4886')
      }, 1700)
      t(() => {
        setPhase(2)
        scrambler.current = setInterval(() => {
          let out = ''
          for (let i = 0; i < 10; i++) out += HEX[Math.floor(Math.random() * 16)]
          setMText(out)
        }, 70)
      }, 3400)
      t(() => {
        if (scrambler.current) {
          clearInterval(scrambler.current)
          scrambler.current = null
        }
        setPhase(3)
        setMText('c = 0x9F3A61C2')
        setDone(true)
      }, 5100)
      t(() => setVisible(false), 8400)
      t(() => startLoop(), 9200)
    }

    startLoop()
    return clearAll
  }, [])

  const x = STOPS[phase]
  const chipTranslate = phase === 0 ? '0' : phase === 3 ? '-100%' : '-50%'

  return (
    <div style={{ animation: 'fadeIn .5s ease both' }}>
      {/* HERO */}
      <div className="px-14 pt-[72px] pb-12 border-b border-ink/30">
        <div
          className="text-[11px] tracking-[0.2em] text-accent mb-[22px]"
          style={{ animation: 'fadeUp .6s ease .05s both' }}
        >
          UN CAHIER EN QUATRE PARTIES
        </div>
        <div
          className="font-serif text-[78px] font-normal leading-[1.02] tracking-[-0.01em] max-w-[820px]"
          style={{ animation: 'fadeUp .6s ease .15s both' }}
        >
          L’arithmétique des{' '}
          <span className="italic text-accent">secrets</span> — et des élections
          où personne ne peut tricher.
        </div>
        <div
          className="text-[13px] leading-[1.8] text-t1 max-w-[560px] mt-[26px]"
          style={{ animation: 'fadeUp .6s ease .28s both' }}
        >
          RSA et ElGamal avec de vrais grands nombres, étape par étape. Puis une
          élection Paillier où les bulletins sont multipliés — jamais ouverts —
          et un seul déchiffrement ne révèle que la somme.
        </div>
      </div>

      {/* INDEX ROWS */}
      <IndexRow
        n="01"
        title="RSA"
        desc="GÉNÉRATION DE CLÉS · CHIFFREMENT · SIGNATURE — PREMIERS DE MILLER–RABIN, EXPONENTIATION RAPIDE"
        onClick={() => navigate('/rsa')}
      />
      <IndexRow
        n="02"
        title="ElGamal"
        desc="CHIFFREMENT ALÉATOIRE — MÊME MESSAGE, CHIFFRÉ DIFFÉRENT À CHAQUE FOIS"
        onClick={() => navigate('/elgamal')}
      />
      <IndexRow
        n="03"
        title="L’élection"
        desc="PAILLIER, HOMOMORPHE ADDITIF — CRÉATION · ISOLOIR · TABLEAU · DÉPOUILLEMENT"
        onClick={() => navigate('/vote/setup')}
      />

      {/* FIG. 1 — RSA PIPELINE */}
      <div
        className="px-14 pt-11 pb-[72px]"
        style={{ animation: 'fadeIn 1s ease .6s both' }}
      >
        <div className="text-[10.5px] tracking-[0.16em] text-t2 mb-[38px]">
          FIG. 1 — UN MESSAGE À TRAVERS RSA
        </div>
        <div className="max-w-[960px]">
          <div className="relative h-[2px]" style={{ background: 'rgba(25,23,19,.2)' }}>
            {/* moving progress fill */}
            <div
              className="absolute left-0 top-0 bottom-0"
              style={{
                width: x + '%',
                background: '#B3341F',
                transition: 'width 1.2s cubic-bezier(.4,0,.2,1)',
              }}
            />
            {/* scrambling chip that rides the bar */}
            <div
              className="absolute whitespace-nowrap px-3 py-[7px] border border-ink"
              style={{
                top: -22,
                left: x + '%',
                transform: `translateX(${chipTranslate})`,
                transition:
                  'left 1.2s cubic-bezier(.4,0,.2,1), transform 1.2s cubic-bezier(.4,0,.2,1), opacity .7s ease',
                opacity: visible ? 1 : 0,
                background: done ? '#191713' : '#EFECE3',
              }}
            >
              <span
                className="font-mono text-[12px] font-semibold tracking-[0.04em]"
                style={{ color: done ? '#EFECE3' : '#191713' }}
              >
                {mText}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-4 mt-5">
            <Stage phase={phase} index={0} align="left">MESSAGE CLAIR</Stage>
            <Stage phase={phase} index={1} align="center">CLÉ PUBLIQUE e, n</Stage>
            <Stage phase={phase} index={2} align="center">c = mᵉ mod n</Stage>
            <Stage phase={phase} index={3} align="right">CHIFFRÉ</Stage>
          </div>
        </div>
      </div>
    </div>
  )
}
