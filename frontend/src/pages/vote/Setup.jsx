import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../../components/PageHeader.jsx'
import Section from '../../components/Section.jsx'
import Field from '../../components/Field.jsx'
import Input from '../../components/Input.jsx'
import Btn from '../../components/Btn.jsx'
import { electionGet, electionCreate } from '../../lib/api.js'

const DEFAULT_Q = 'Le département doit-il adopter les examens à livre ouvert ?'

// §03.1 — L'AUTORITÉ. Create the Paillier election: question input + createElection.
// Public key (n, g = n+1) is shown; λ, μ stay SCELLÉ (never returned by the API).
export default function Setup() {
  const navigate = useNavigate()

  const [question, setQuestion] = useState(DEFAULT_Q)
  const [active, setActive] = useState(false)
  const [pubKey, setPubKey] = useState(null) // { n, g }
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  // Load current election state on mount (an election may already exist).
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const data = await electionGet()
        if (cancelled || !data || !data.active) return
        setActive(true)
        if (data.question) setQuestion(data.question)
        if (data.public_key) setPubKey(data.public_key)
      } catch {
        // No election yet — leave defaults.
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const create = async () => {
    if (busy) return
    const q = question.trim()
    if (!q) {
      setErr('La question du scrutin est requise.')
      return
    }
    setBusy(true)
    setErr('')
    try {
      const res = await electionCreate({ question: q })
      setActive(true)
      if (res && res.public_key) setPubKey(res.public_key)
    } catch (e) {
      setErr(e.message || 'Échec de la création.')
    } finally {
      setBusy(false)
    }
  }

  const electionBadge = active ? (
    <span className="text-[9px] tracking-[0.14em] px-2 py-1 border border-accent/50 text-accent">
      SCRUTIN OUVERT
    </span>
  ) : (
    <span className="text-[9px] tracking-[0.14em] px-2 py-1 border border-ink/35 text-t1">
      AUCUN SCRUTIN
    </span>
  )

  const pkValue = pubKey
    ? `n = ${pubKey.n}\ng = ${pubKey.g}`
    : '—'

  return (
    <div style={{ animation: 'fadeIn .4s ease both' }}>
      <PageHeader
        kicker="§ 03.1 — L’AUTORITÉ"
        title="Créer l’élection"
        right={electionBadge}
      />

      <Section
        left={
          <div>
            <div className="text-[11px] text-t2 leading-[1.9] mb-[26px]">
              UNE PAIRE DE CLÉS PAILLIER. LA CLÉ PUBLIQUE VA À CHAQUE ÉLECTEUR ; λ
              ET μ RESTENT SOUS CLÉ JUSQU’AU DÉPOUILLEMENT.
            </div>
            <div className="text-[10px] tracking-[0.16em] text-t2 mb-1.5">
              QUESTION DU SCRUTIN
            </div>
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="text-[12.5px] mb-[22px]"
            />
            <Btn onClick={create} disabled={busy}>
              {busy
                ? 'GÉNÉRATION DES CLÉS…'
                : active
                ? 'RECRÉER — NOUVELLES CLÉS'
                : 'CRÉER LE SCRUTIN — CLÉS PAILLIER'}
            </Btn>
            {active ? (
              <Btn
                variant="outline"
                onClick={() => navigate('/vote/booth')}
                className="mt-2.5 h-[42px] text-[10.5px] tracking-[0.14em]"
              >
                ALLER À L’ISOLOIR →
              </Btn>
            ) : null}
            {err ? (
              <div className="text-[10.5px] text-accent mt-3.5 leading-[1.7]">
                {err}
              </div>
            ) : null}
          </div>
        }
      >
        <Field label="clé publique — n, g = n+1" badge="PUBLIC">
          <span className="whitespace-pre-wrap break-all">{pkValue}</span>
        </Field>
        <Field
          label="λ, μ — clé de déchiffrement"
          badge="SCELLÉ"
          variant="secret"
          valueClass="text-t2"
        >
          SOUS CLÉ — NE QUITTE JAMAIS L’AUTORITÉ
        </Field>
        <div className="pt-[22px] text-[11px] text-t2 leading-[2]">
          POURQUOI PAILLIER — IL ADDITIONNE SOUS LA MULTIPLICATION :
          <br />
          <span className="text-ink">E(m₁) · E(m₂) mod n² = E(m₁ + m₂)</span>
          <br />
          LES BULLETINS SONT MULTIPLIÉS, JAMAIS OUVERTS. UN SEUL DÉCHIFFREMENT À LA
          FIN NE RÉVÈLE QUE LA SOMME.
        </div>
      </Section>
    </div>
  )
}
