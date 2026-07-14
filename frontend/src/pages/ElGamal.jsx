import { useState } from 'react'
import PageHeader from '../components/PageHeader.jsx'
import Section from '../components/Section.jsx'
import Field from '../components/Field.jsx'
import BitSelect from '../components/BitSelect.jsx'
import Input from '../components/Input.jsx'
import TracePanel from '../components/TracePanel.jsx'
import { useTrace } from '../lib/trace.jsx'
import { elgamalKeygen, elgamalComputeY, elgamalEncrypt, elgamalDecrypt } from '../lib/api.js'

// §02 — ElGamal. Params/keys (2.1) + chiffrer/déchiffrer (2.2).
// Crypto runs server-side; all values are decimal strings kept as strings.
export default function ElGamal() {
  const { traceOn } = useTrace()

  // Defaults: p=11, a=2, s=3, y=8, m=7 (toy parameters).
  const [p, setP] = useState('11')
  const [a, setA] = useState('2')
  const [s, setS] = useState('3')
  const [y, setY] = useState('8')
  const [m, setM] = useState('7')

  const [k, setK] = useState('—')
  const [c1, setC1] = useState('—')
  const [c2, setC2] = useState('—')
  const [dec, setDec] = useState('—')

  const [bits, setBits] = useState(256)
  const [generating, setGenerating] = useState(false)
  const [busy, setBusy] = useState('') // 'y' | 'enc' | 'dec'
  const [err, setErr] = useState('')
  const [trace, setTrace] = useState([])

  const t = () => (traceOn ? { trace: true } : {})
  const keep = (res) => setTrace(traceOn && res.trace ? res.trace : [])

  // Charge les petits nombres : p=11, a=2, s=3 puis calcule y=8.
  async function loadToy() {
    setErr('')
    setP('11'); setA('2'); setS('3'); setM('7')
    setK('—'); setC1('—'); setC2('—'); setDec('—')
    try {
      const res = await elgamalComputeY({ p: '11', a: '2', s: '3', ...t() })
      setY(res.y)
      keep(res)
    } catch (e) {
      setErr(e.message)
    }
  }

  // 2.1 — génère de vrais grands paramètres (p premier, a, s, y).
  async function generate() {
    setErr('')
    setGenerating(true)
    try {
      const res = await elgamalKeygen({ bits, ...t() })
      setP(res.p); setA(res.a); setS(res.s); setY(res.y)
      setK('—'); setC1('—'); setC2('—'); setDec('—')
      keep(res)
    } catch (e) {
      setErr(e.message)
    } finally {
      setGenerating(false)
    }
  }

  // 2.1 — recalcule y = aˢ mod p à partir des champs saisis.
  async function computeY() {
    setErr('')
    setBusy('y')
    try {
      const res = await elgamalComputeY({ p, a, s, ...t() })
      setY(res.y)
      keep(res)
    } catch (e) {
      setErr(e.message)
    } finally {
      setBusy('')
    }
  }

  // 2.2 — chiffre m en tirant un k frais côté serveur.
  async function encrypt() {
    setErr('')
    setBusy('enc')
    try {
      const res = await elgamalEncrypt({ p, a, y, m, ...t() })
      setK(res.k); setC1(res.c1); setC2(res.c2); setDec('—')
      keep(res)
    } catch (e) {
      setErr(e.message)
    } finally {
      setBusy('')
    }
  }

  // 2.2 — déchiffre (C₁,C₂) avec la clé privée s.
  async function decrypt() {
    setErr('')
    setBusy('dec')
    try {
      const res = await elgamalDecrypt({ p, s, c1, c2, ...t() })
      setDec(res.m)
      keep(res)
    } catch (e) {
      setErr(e.message)
    } finally {
      setBusy('')
    }
  }

  return (
    <div style={{ animation: 'fadeIn .4s ease both' }}>
      <PageHeader
        kicker="§ 02 — CHIFFREMENT ALÉATOIRE"
        title="ElGamal"
        right={
          <>
            PROBLÈME DU LOGARITHME DISCRET
            <br />
            <a onClick={loadToy} className="cursor-pointer">
              CHARGER DES PETITS NOMBRES — p 11, a 2, s 3
            </a>
          </>
        }
      />

      {err ? (
        <div className="px-14 py-3 border-b border-ink/30 text-[11px] tracking-[0.04em] text-accent">
          {err}
        </div>
      ) : null}

      {/* 2.1 — Paramètres & clés */}
      <Section
        number="2.1"
        title="Paramètres & clés"
        formula={<>y = aˢ mod p</>}
        left={
          <>
            <div className="text-[10px] tracking-[0.16em] text-t2 mb-2.5">
              PREMIER — BITS
            </div>
            <div className="mb-6">
              <BitSelect value={bits} onChange={setBits} />
            </div>
            <span
              role="button"
              onClick={generating ? undefined : generate}
              className={
                'flex items-center justify-center h-11 text-[11px] tracking-[0.16em] font-semibold transition-colors duration-200 select-none ' +
                (generating
                  ? 'bg-ink/10 text-t3 cursor-default'
                  : 'bg-ink text-paper cursor-pointer hover:bg-accent')
              }
            >
              {generating ? 'GÉNÉRATION DU PREMIER…' : 'GÉNÉRER LES PARAMÈTRES'}
            </span>
            <div className="text-[10.5px] text-t3 mt-3.5 leading-[1.8]">
              OU SAISISSEZ DE PETITS NOMBRES ET{' '}
              <a
                onClick={busy === 'y' ? undefined : computeY}
                className="cursor-pointer"
              >
                RECALCULEZ y
              </a>
            </div>
          </>
        }
      >
        <Field label="p — module premier" badge="PUBLIC">
          <Input variant="dotted" value={p} onChange={(e) => setP(e.target.value)} />
        </Field>
        <Field label="a — générateur" badge="PUBLIC">
          <Input variant="dotted" value={a} onChange={(e) => setA(e.target.value)} />
        </Field>
        <Field label="s — exposant privé" badge="SECRET" variant="secret">
          <Input variant="dotted" value={s} onChange={(e) => setS(e.target.value)} />
        </Field>
        <Field label="y = aˢ mod p" badge="PUBLIC" value={y} last />
      </Section>

      {/* 2.2 — Chiffrer & déchiffrer */}
      <Section
        number="2.2"
        title="Chiffrer & déchiffrer"
        formula={
          <>
            C₁ = aᵏ mod p
            <br />
            C₂ = m·yᵏ mod p
            <br />
            m = C₂·(C₁ˢ)⁻¹ mod p
          </>
        }
        left={
          <>
            <div className="text-[10px] tracking-[0.16em] text-t2 mb-1.5">
              MESSAGE m — ENTIER &lt; p
            </div>
            <div className="mb-[22px]">
              <Input value={m} onChange={(e) => setM(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-2.5 mb-5">
              <span
                role="button"
                onClick={busy === 'enc' ? undefined : encrypt}
                className={
                  'flex items-center justify-center h-[42px] text-[10.5px] tracking-[0.14em] font-semibold transition-colors duration-200 select-none ' +
                  (busy === 'enc'
                    ? 'bg-ink/10 text-t3 cursor-default'
                    : 'bg-ink text-paper cursor-pointer hover:bg-accent')
                }
              >
                CHIFFRER — k FRAIS
              </span>
              <span
                role="button"
                onClick={busy === 'dec' ? undefined : decrypt}
                className={
                  'flex items-center justify-center h-[42px] text-[10.5px] tracking-[0.14em] font-semibold border transition-all duration-200 select-none ' +
                  (busy === 'dec'
                    ? 'border-ink/20 text-t3 cursor-default'
                    : 'border-ink/50 text-ink cursor-pointer hover:border-accent hover:text-accent')
                }
              >
                DÉCHIFFRER — s
              </span>
            </div>
            <div className="border-l-2 border-accent pl-3.5 text-[10.5px] text-t1 leading-[1.8]">
              <span className="text-accent font-semibold">
                NE JAMAIS RÉUTILISER k.
              </span>{' '}
              DEUX CHIFFRÉS AVEC LE MÊME k RÉVÈLENT LE RAPPORT DE LEURS MESSAGES.
            </div>
          </>
        }
      >
        <Field label="k — éphémère" badge="SECRET · USAGE UNIQUE" variant="secret" value={k} />
        <Field label="C₁ = aᵏ mod p" badge="PUBLIC" value={c1} />
        <Field label="C₂ = m·yᵏ mod p" badge="PUBLIC" value={c2} />
        <Field label="m retrouvé" value={dec} last />
      </Section>

      <TracePanel show={traceOn} lines={trace} />
    </div>
  )
}
