"""attacks_routes.py — /api/attacks/* (R9, from the June 2026 sheet).

Two pedagogical attacks:
  - elgamal_repeated_k: reusing the ephemeral k across two messages leaks the
    plaintext ratio, so a known m1 recovers m2 from c2'/c2 mod p.
  - rsa_cyclic: iterating c -> c^e mod n eventually cycles back to c; the value
    one step before the repeat is the plaintext. Tiny moduli make this trivial —
    motivating large keys.
"""

from flask import Blueprint, jsonify

from crypto_engine import modpow, modinv
from ._helpers import get_json, error

attacks_bp = Blueprint("attacks", __name__, url_prefix="/api/attacks")

# Small demo defaults for the repeated-k attack.
RK_DEFAULT = {"p": 467, "a": 2, "y": 100, "m1": 42, "m2": 313}
# Cyclic-attack defaults from the sheet.
CYCLIC_DEFAULT = {"n": 259, "e": 5, "c": 134}

# Render integers as Unicode subscripts so step labels read as real math (c₁, c₂ …).
_SUB = str.maketrans("0123456789", "₀₁₂₃₄₅₆₇₈₉")


def _sub(num):
    return str(num).translate(_SUB)


@attacks_bp.post("/elgamal_repeated_k")
def elgamal_repeated_k():
    data = get_json()
    try:
        p = int(data.get("p", RK_DEFAULT["p"]))
        a = int(data.get("a", RK_DEFAULT["a"]))
        y = int(data.get("y", RK_DEFAULT["y"]))
        m1 = int(data.get("m1", RK_DEFAULT["m1"]))
        m2 = int(data.get("m2", RK_DEFAULT["m2"]))
    except (TypeError, ValueError):
        return error("p, a, y, m1, m2 must be integers")

    if p < 3:
        return error("p must be >= 3")
    if m1 <= 0 or m1 >= p or m2 < 0 or m2 >= p:
        return error("messages must satisfy 0 <= m < p (m1 must be nonzero)")

    # Attacker/encryptor uses the SAME ephemeral k for both messages (the flaw).
    import secrets
    k = 1 + secrets.randbelow(p - 2)
    c1 = modpow(a, k, p)                 # shared across both — the tell
    yk = modpow(y, k, p)
    c2a = m1 * yk % p                     # ciphertext of m1
    c2b = m2 * yk % p                     # ciphertext of m2

    # Attack: c2b / c2a = m2 / m1  (the y^k factors cancel). With known m1:
    #   m2 = m1 * c2b * c2a^{-1} mod p.
    inv_c2a = modinv(c2a, p)
    if inv_c2a is None:
        return error("c2 (of m1) has no inverse mod p; pick different parameters")
    ratio = c2b * inv_c2a % p             # = m2 * m1^{-1} mod p
    recovered = m1 * ratio % p

    steps = [
        {"label": "p", "value": str(p)},
        {"label": "a", "value": str(a)},
        {"label": "y = aˢ mod p (public)", "value": str(y)},
        {"label": "reused k (the flaw — never do this)", "value": str(k)},
        {"label": "C₁ = aᵏ mod p (identical for both)", "value": str(c1)},
        {"label": "yᵏ mod p", "value": str(yk)},
        {"label": "known plaintext m₁", "value": str(m1)},
        {"label": "C₂  = m₁·yᵏ mod p", "value": str(c2a)},
        {"label": "C₂' = m₂·yᵏ mod p", "value": str(c2b)},
        {"label": "C₂'·C₂⁻¹ mod p = m₂·m₁⁻¹ (yᵏ cancels)", "value": str(ratio)},
        {"label": "m₂ = m₁·(C₂'·C₂⁻¹) mod p", "value": str(recovered)},
        {"label": "actual m₂ (for verification)", "value": str(m2)},
    ]

    return jsonify({
        "steps": steps,
        "recovered_m2": str(recovered),
        "success": recovered == m2,
    })


@attacks_bp.post("/rsa_cyclic")
def rsa_cyclic():
    data = get_json()
    try:
        n = int(data.get("n", CYCLIC_DEFAULT["n"]))
        e = int(data.get("e", CYCLIC_DEFAULT["e"]))
        c = int(data.get("c", CYCLIC_DEFAULT["c"]))
    except (TypeError, ValueError):
        return error("n, e, c must be integers")

    if n < 2:
        return error("n must be >= 2")
    if c < 0 or c >= n:
        return error("ciphertext c must satisfy 0 <= c < n")

    # Iterate c -> c^e mod n. The sequence must eventually return to the start
    # (finite state). The value seen just BEFORE c reappears is the plaintext m,
    # because encrypting it once more yields c again.
    steps = [{"label": "start c₀", "value": str(c)}]
    cur = c
    prev = c
    cycle_length = 0
    recovered = None
    # Guard the loop at n iterations (cycle length divides the group order).
    for i in range(1, n + 2):
        nxt = modpow(cur, e, n)
        steps.append({"label": "c" + _sub(i) + " = c" + _sub(i - 1) + "ᵉ mod n", "value": str(nxt)})
        cycle_length = i
        if nxt == c:
            recovered = cur          # one step before c reappears
            break
        prev = cur
        cur = nxt

    if recovered is None:
        return error("no cycle found within bound; parameters may be degenerate")

    steps.append({"label": "cycle length", "value": str(cycle_length)})
    steps.append({"label": "recovered plaintext m (step before c reappears)",
                  "value": str(recovered)})

    return jsonify({
        "cycle_length": cycle_length,
        "recovered": str(recovered),
        "steps": steps,
    })
