"""elgamal.py — ElGamal encryption from scratch (professor's notation p, a, s, y).

keygen, compute_y, encrypt (FRESH random k every call), decrypt.
Each op optionally returns a `trace` list of {label, value} steps.
"""

import secrets

from .number_theory import gen_prime, modpow, modinv


def keygen(bits, trace=False):
    """Generate ElGamal parameters.

    p = Miller-Rabin prime of `bits` bits; a = 2; s random secret in [2, p-2];
    y = a^s mod p. Returns ints p, a, s, y (+ trace if requested).
    """
    p = gen_prime(bits)
    a = 2
    # secret exponent in [2, p-2]
    s = 2 + secrets.randbelow(p - 3)
    y = modpow(a, s, p)

    result = {"p": p, "a": a, "s": s, "y": y}
    if trace:
        result["trace"] = [
            {"label": "p — " + str(bits) + "-bit Miller–Rabin prime", "value": str(p)},
            {"label": "a", "value": str(a)},
            {"label": "s — random secret", "value": str(s)},
            {"label": "y = aˢ mod p  (square-and-multiply)", "value": str(y)},
        ]
    return result


def compute_y(p, a, s, trace=False):
    """y = a^s mod p."""
    if p < 3:
        raise ValueError("p must be >= 3")
    y = modpow(a, s, p)
    result = {"y": y}
    if trace:
        result["trace"] = [
            {"label": "p", "value": str(p)},
            {"label": "a", "value": str(a)},
            {"label": "s (secret)", "value": str(s)},
            {"label": "y = aˢ mod p", "value": str(y)},
        ]
    return result


def encrypt(p, a, y, m, trace=False):
    """Encrypt m with a FRESH random ephemeral k each call.

    c1 = a^k mod p ; c2 = m·y^k mod p. Requires m < p.
    """
    if p < 3:
        raise ValueError("p must be >= 3")
    if m >= p:
        raise ValueError("message m must be < p")
    # fresh ephemeral key k in [1, p-2], never reused
    k = 1 + secrets.randbelow(p - 2)
    c1 = modpow(a, k, p)
    yk = modpow(y, k, p)
    c2 = m * yk % p

    result = {"k": k, "c1": c1, "c2": c2}
    if trace:
        result["trace"] = [
            {"label": "fresh k (never reused)", "value": str(k)},
            {"label": "C₁ = aᵏ mod p", "value": str(c1)},
            {"label": "yᵏ mod p", "value": str(yk)},
            {"label": "C₂ = m·yᵏ mod p", "value": str(c2)},
        ]
    return result


def decrypt(p, s, c1, c2, trace=False):
    """m = c2·(c1^s)^{-1} mod p."""
    if p < 3:
        raise ValueError("p must be >= 3")
    c1s = modpow(c1, s, p)
    inv = modinv(c1s, p)
    if inv is None:
        raise ValueError("c1^s has no inverse mod p")
    m = c2 * inv % p

    result = {"m": m}
    if trace:
        result["trace"] = [
            {"label": "C₁ˢ mod p", "value": str(c1s)},
            {"label": "(C₁ˢ)⁻¹ mod p  (extended Euclid)", "value": str(inv)},
            {"label": "m = C₂·(C₁ˢ)⁻¹ mod p", "value": str(m)},
        ]
    return result
