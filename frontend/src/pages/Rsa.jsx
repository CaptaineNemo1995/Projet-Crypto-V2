import { useState } from 'react'
import PageHeader from '../components/PageHeader.jsx'
import Section from '../components/Section.jsx'
import Field from '../components/Field.jsx'
import BitSelect from '../components/BitSelect.jsx'
import Btn from '../components/Btn.jsx'
import Input from '../components/Input.jsx'
import TracePanel from '../components/TracePanel.jsx'
import { useTrace } from '../lib/trace.jsx'
import {
  rsaKeygen,
  rsaEncrypt,
  rsaDecrypt,
  rsaSign,
  rsaVerify,
} from '../lib/api.js'

// §01 — RSA worksheet. All arithmetic runs server-side (Python); big numbers
// stay decimal strings end-to-end. Trace panel appears when the sidebar toggle
// is on (passes trace:true, renders the returned [{label,value}] list).
export default function Rsa() {
  const { traceOn } = useTrace()

  // Keypair (defaults = the small known toy pair so ops work immediately).
  const [bits, setBits] = useState(256)
  const [generating, setGenerating] = useState(false)
  const [p, setP] = useState('23')
  const [q, setQ] = useState('47')
  const [n, setN] = useState('1081')
  const [e, setE] = useState('13')
  const [d, setD] = useState('545')

  // 1.2 encrypt / decrypt
  const [msg, setMsg] = useState('42')
  const [cipher, setCipher] = useState('—')
  const [decrypted, setDecrypted] = useState('—')

  // 1.3 sign / verify
  const [sigMsg, setSigMsg] = useState('99')
  const [sig, setSig] = useState('—')
  const [verifyResult, setVerifyResult] = useState('—')
  const [verifyOk, setVerifyOk] = useState(null) // null | true | false

  const [trace, setTrace] = useState([])
  const [err, setErr] = useState('')

  const flag = () => (traceOn ? { trace: true } : {})
  const fail = (ex) => setErr(ex && ex.message ? ex.message : String(ex))

  // Load the full known keypair so every op works at once.
  const loadToy = () => {
    setP('23')
    setQ('47')
    setN('1081')
    setE('13')
    setD('545')
    setCipher('—')
    setDecrypted('—')
    setSig('—')
    setVerifyResult('—')
    setVerifyOk(null)
    setTrace([])
    setErr('')
  }

  const generate = async () => {
    if (generating) return
    setGenerating(true)
    setErr('')
    try {
      const res = await rsaKeygen({ bits, ...flag() })
      setP(res.p)
      setQ(res.q)
      setN(res.n)
      setE(res.e)
      setD(res.d)
      // Generating clears stale outputs.
      setCipher('—')
      setDecrypted('—')
      setSig('—')
      setVerifyResult('—')
      setVerifyOk(null)
      setTrace(res.trace || [])
    } catch (ex) {
      fail(ex)
    } finally {
      setGenerating(false)
    }
  }

  const encrypt = async () => {
    setErr('')
    try {
      const res = await rsaEncrypt({ n, e, m: msg, ...flag() })
      setCipher(res.c)
      setTrace(res.trace || [])
    } catch (ex) {
      fail(ex)
    }
  }

  const decrypt = async () => {
    setErr('')
    try {
      const res = await rsaDecrypt({ n, d, c: cipher === '—' ? '0' : cipher, ...flag() })
      setDecrypted(res.m)
      setTrace(res.trace || [])
    } catch (ex) {
      fail(ex)
    }
  }

  const sign = async () => {
    setErr('')
    try {
      const res = await rsaSign({ n, d, m: sigMsg, ...flag() })
      setSig(res.s)
      setVerifyResult('—')
      setVerifyOk(null)
      setTrace(res.trace || [])
    } catch (ex) {
      fail(ex)
    }
  }

  const verify = async () => {
    setErr('')
    try {
      const res = await rsaVerify({
        n,
        e,
        m: sigMsg,
        s: sig === '—' ? '0' : sig,
        ...flag(),
      })
      const ok = !!res.valid
      setVerifyOk(ok)
      setVerifyResult(
        (ok ? 'VALIDE' : 'INVALIDE') + ' — sᵉ mod n = ' + res.recovered,
      )
      setTrace(res.trace || [])
    } catch (ex) {
      fail(ex)
    }
  }

  return (
    <div style={{ animation: 'fadeIn .4s ease both' }}>
      <PageHeader
        kicker="§ 01 — CHIFFREMENT À CLÉ PUBLIQUE & SIGNATURES"
        title="RSA"
        right={
          <>
            RIVEST · SHAMIR · ADLEMAN, 1977
            <br />
            <a
              onClick={loadToy}
              className="cursor-pointer"
              role="button"
            >
              CHARGER DES PETITS NOMBRES — p 23, q 47
            </a>
          </>
        }
      />

      {err ? (
        <div className="px-14 py-3 border-b border-ink/30 text-[11px] text-accent tracking-[0.06em]">
          ERREUR — {err}
        </div>
      ) : null}

      {/* 1.1 — Générer la paire de clés */}
      <Section
        number="1.1"
        title="Générer la paire de clés"
        formula={
          <>
            n = p·q
            <br />
            e·d ≡ 1 mod φ(n)
          </>
        }
        left={
          <>
            <div className="text-[10px] tracking-[0.16em] text-t2 mb-2.5">
              MODULE — BITS
            </div>
            <div className="mb-6">
              <BitSelect value={bits} onChange={setBits} />
            </div>
            <Btn onClick={generate} disabled={generating}>
              {generating ? 'GÉNÉRATION…' : 'GÉNÉRER LA PAIRE'}
            </Btn>
            <div className="text-[10.5px] text-t3 mt-3.5 leading-[1.8]">
              PREMIERS DE MILLER–RABIN · EUCLIDE ÉTENDU POUR d
            </div>
          </>
        }
      >
        <Field label="p — premier" badge="SECRET" variant="secret" value={p} />
        <Field label="q — premier" badge="SECRET" variant="secret" value={q} />
        <Field label="n = p·q" badge="PUBLIC" value={n} />
        <Field label="e" badge="PUBLIC" value={e} />
        <Field
          label="d = e⁻¹ mod φ(n)"
          badge="SECRET"
          variant="secret"
          value={d}
          last
        />
      </Section>

      {/* 1.2 — Chiffrer, puis déchiffrer */}
      <Section
        number="1.2"
        title="Chiffrer, puis déchiffrer"
        formula={
          <>
            c = mᵉ mod n
            <br />
            m = cᵈ mod n
          </>
        }
        left={
          <>
            <div className="text-[10px] tracking-[0.16em] text-t2 mb-1.5">
              MESSAGE m — ENTIER &lt; n
            </div>
            <div className="mb-[22px]">
              <Input value={msg} onChange={(ev) => setMsg(ev.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <Btn onClick={encrypt} className="h-[42px]">
                CHIFFRER
              </Btn>
              <Btn onClick={decrypt} variant="outline" className="h-[42px]">
                DÉCHIFFRER
              </Btn>
            </div>
          </>
        }
      >
        <Field label="chiffré c" badge="PUBLIC" value={cipher} />
        <Field label="m déchiffré — doit correspondre" value={decrypted} last />
      </Section>

      {/* 1.3 — Signer, puis vérifier */}
      <Section
        number="1.3"
        title="Signer, puis vérifier"
        formula={
          <>
            s = mᵈ mod n
            <br />
            vérifier sᵉ mod n = m
          </>
        }
        left={
          <>
            <div className="text-[10px] tracking-[0.16em] text-t2 mb-1.5">
              MESSAGE À SIGNER — ENTIER &lt; n
            </div>
            <div className="mb-[22px]">
              <Input
                value={sigMsg}
                onChange={(ev) => setSigMsg(ev.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <Btn onClick={sign} className="h-[42px]">
                SIGNER — d
              </Btn>
              <Btn onClick={verify} variant="outline" className="h-[42px]">
                VÉRIFIER — e
              </Btn>
            </div>
          </>
        }
      >
        <Field
          label="signature s"
          badge="CRÉÉE AVEC d SECRET"
          variant="secret"
          value={sig}
        />
        <Field
          label="vérification — accessible à tous"
          value={verifyResult}
          valueClass={verifyOk === null ? '' : 'text-accent'}
          last
        />
      </Section>

      <TracePanel show={traceOn} lines={trace} />
    </div>
  )
}
