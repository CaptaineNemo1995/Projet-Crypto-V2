"""paillier.py — Paillier homomorphic cryptosystem from scratch.

Supports a GENERAL generator g (the course vector uses g = 4886 != n+1); the
election keygen may use the default g = n+1. Provides keygen, encrypt, decrypt,
a homomorphic add, and a tally (product of ciphertexts mod n² then ONE decryption).

L(x) = (x - 1) / n.
"""

import secrets

from .number_theory import gen_prime, gcd, lcm, modpow, modinv


def _L(x, n):
    """L(x) = (x - 1) / n  (integer division; x ≡ 1 mod n by construction)."""
    return (x - 1) // n


def keygen(p=None, q=None, bits=None, g=None, trace=False):
    """Generate a Paillier keypair.

    Provide either explicit primes (p, q) OR a `bits` size (each prime bits/2).
    `g` defaults to n + 1 but an arbitrary generator may be supplied (course vector
    uses g = 4886). Returns ints n, g, lambda (lam), mu, n2 (+ trace if requested).

    Key relation: lambda = lcm(p-1, q-1); mu = (L(g^lambda mod n²))^{-1} mod n.
    """
    if p is None or q is None:
        if bits is None:
            raise ValueError("provide either (p, q) or bits")
        half = max(bits // 2, 32)
        p = gen_prime(half)
        q = gen_prime(half)
        while q == p:
            q = gen_prime(half)

    n = p * q
    n2 = n * n
    if g is None:
        g = n + 1
    lam = lcm(p - 1, q - 1)

    l_val = _L(modpow(g, lam, n2), n)
    mu = modinv(l_val, n)
    if mu is None:
        raise ValueError("g is not a valid generator for these primes (mu undefined)")

    result = {"n": n, "g": g, "lambda": lam, "mu": mu, "n2": n2}
    if trace:
        result["trace"] = [
            {"label": "p (prime)", "value": str(p)},
            {"label": "q (prime)", "value": str(q)},
            {"label": "n = p·q", "value": str(n)},
            {"label": "n² = n·n", "value": str(n2)},
            {"label": "g", "value": str(g)},
            {"label": "λ = lcm(p−1, q−1)", "value": str(lam)},
            {"label": "L(gᵏ mod n²)  where k=λ", "value": str(l_val)},
            {"label": "μ = (L(g^λ mod n²))⁻¹ mod n", "value": str(mu)},
        ]
    return result


def _pick_r(n):
    """Random r in [1, n-1] coprime to n."""
    while True:
        r = 1 + secrets.randbelow(n - 1)
        if gcd(r, n) == 1:
            return r


def encrypt(n, g, m, r=None, trace=False):
    """c = g^m · r^n mod n².  r random coprime to n if omitted."""
    n2 = n * n
    if r is None:
        r = _pick_r(n)
    gm = modpow(g, m, n2)
    rn = modpow(r, n, n2)
    c = gm * rn % n2

    result = {"c": c, "r": r}
    if trace:
        result["trace"] = [
            {"label": "m", "value": str(m)},
            {"label": "r (coprime to n)", "value": str(r)},
            {"label": "gᵐ mod n²", "value": str(gm)},
            {"label": "rⁿ mod n²", "value": str(rn)},
            {"label": "c = gᵐ·rⁿ mod n²", "value": str(c)},
        ]
    return result


def decrypt(n, lam, mu, c, trace=False):
    """m = L(c^lambda mod n²)·mu mod n."""
    n2 = n * n
    u = modpow(c, lam, n2)
    l_val = _L(u, n)
    m = l_val * mu % n

    result = {"m": m}
    if trace:
        result["trace"] = [
            {"label": "c^λ mod n²", "value": str(u)},
            {"label": "L(c^λ mod n²) = (u−1)/n", "value": str(l_val)},
            {"label": "m = L·μ mod n", "value": str(m)},
        ]
    return result


def add(n, c1, c2, trace=False):
    """Homomorphic addition: E(m1)·E(m2) mod n² = E(m1 + m2)."""
    n2 = n * n
    c = c1 * c2 % n2
    result = {"c": c}
    if trace:
        result["trace"] = [
            {"label": "c₁", "value": str(c1)},
            {"label": "c₂", "value": str(c2)},
            {"label": "c = c₁·c₂ mod n²  → E(m₁+m₂)", "value": str(c)},
        ]
    return result


def tally(n, lam, mu, ciphertexts, trace=False):
    """Homomorphic tally.

    product = Π ci mod n²; then a SINGLE decryption yields the sum of plaintexts.
    Returns ints product and sum (+ trace if requested).
    """
    n2 = n * n
    product = 1
    for c in ciphertexts:
        product = product * c % n2

    dec = decrypt(n, lam, mu, product)
    total = dec["m"]

    result = {"product": product, "sum": total}
    if trace:
        result["trace"] = [
            {"label": "ballots combined", "value": str(len(ciphertexts))},
            {"label": "Π cᵢ mod n²", "value": str(product)},
            {"label": "single decryption → Σ mᵢ", "value": str(total)},
        ]
    return result
