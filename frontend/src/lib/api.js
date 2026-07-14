// Fetch wrappers for the backend REST API.
// Big numbers travel as decimal STRINGS. Each POST throws on { error }.

async function post(path, body) {
  const res = await fetch(`/api${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body ?? {}),
  })
  let data
  try {
    data = await res.json()
  } catch {
    throw new Error(`Bad response from ${path} (${res.status})`)
  }
  if (!res.ok || (data && data.error)) {
    throw new Error((data && data.error) || `Request to ${path} failed (${res.status})`)
  }
  return data
}

async function get(path) {
  const res = await fetch(`/api${path}`)
  let data
  try {
    data = await res.json()
  } catch {
    throw new Error(`Bad response from ${path} (${res.status})`)
  }
  if (!res.ok || (data && data.error)) {
    throw new Error((data && data.error) || `Request to ${path} failed (${res.status})`)
  }
  return data
}

/* ===== RSA ===== */
export const rsaKeygen = ({ bits, trace }) => post('/rsa/keygen', { bits, trace })
export const rsaEncrypt = ({ n, e, m, trace }) => post('/rsa/encrypt', { n, e, m, trace })
export const rsaDecrypt = ({ n, d, c, trace }) => post('/rsa/decrypt', { n, d, c, trace })
export const rsaSign = ({ n, d, m, trace }) => post('/rsa/sign', { n, d, m, trace })
export const rsaVerify = ({ n, e, m, s, trace }) => post('/rsa/verify', { n, e, m, s, trace })

/* ===== ElGamal ===== */
export const elgamalKeygen = ({ bits, trace }) => post('/elgamal/keygen', { bits, trace })
export const elgamalComputeY = ({ p, a, s, trace }) => post('/elgamal/compute_y', { p, a, s, trace })
export const elgamalEncrypt = ({ p, a, y, m, trace }) =>
  post('/elgamal/encrypt', { p, a, y, m, trace })
export const elgamalDecrypt = ({ p, s, c1, c2, trace }) =>
  post('/elgamal/decrypt', { p, s, c1, c2, trace })

/* ===== Paillier ===== */
export const paillierKeygen = ({ p, q, bits, trace }) =>
  post('/paillier/keygen', { p, q, bits, trace })
export const paillierEncrypt = ({ n, g, m, r, trace }) =>
  post('/paillier/encrypt', { n, g, m, r, trace })
export const paillierDecrypt = ({ n, lambda, mu, c, trace }) =>
  post('/paillier/decrypt', { n, lambda, mu, c, trace })
export const paillierTally = ({ n, lambda, mu, ciphertexts, trace }) =>
  post('/paillier/tally', { n, lambda, mu, ciphertexts, trace })

/* ===== Election ===== */
export const electionCreate = ({ question, mode, candidates, bits }) =>
  post('/election/create', { question, mode, candidates, bits })
export const electionGet = () => get('/election')
export const electionVote = ({ choice }) => post('/election/vote', { choice })
export const electionVoteDemo = () => post('/election/vote_demo', {})
export const electionBoard = () => get('/election/board')
export const electionTally = ({ trace } = {}) => post('/election/tally', { trace })
export const electionReset = () => post('/election/reset', {})

/* ===== Attacks (R9) ===== */
export const attackElgamalRepeatedK = ({ p, a, y, m1, m2 } = {}) =>
  post('/attacks/elgamal_repeated_k', { p, a, y, m1, m2 })
export const attackRsaCyclic = ({ n, e, c } = {}) => post('/attacks/rsa_cyclic', { n, e, c })
