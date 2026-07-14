"""rsa.py — textbook RSA from scratch (keygen, encrypt, decrypt, sign, verify).

Each operation optionally returns a `trace` list of {label, value} steps using the
course notation. Big numbers are Python ints here; the routes layer converts to/from
decimal strings at the API boundary.
"""

from .number_theory import gen_prime, gcd, modinv, modpow

DEFAULT_E = 65537


def keygen(bits, trace=False):
    """Generate an RSA keypair.

    `bits` is the modulus size; each prime is bits/2 (min 32/prime for demo speed).
    e starts at 65537 and is bumped by +2 until gcd(e, phi) == 1.
    Returns a dict with ints p, q, n, phi, e, d (+ trace if requested).
    """
    half = max(bits // 2, 32)
    p = gen_prime(half)
    q = gen_prime(half)
    while q == p:
        q = gen_prime(half)

    n = p * q
    phi = (p - 1) * (q - 1)
    e = DEFAULT_E
    while gcd(e, phi) != 1:
        e += 2
    d = modinv(e, phi)

    result = {"p": p, "q": q, "n": n, "phi": phi, "e": e, "d": d}
    if trace:
        result["trace"] = [
            {"label": "p (prime)", "value": str(p)},
            {"label": "q (prime)", "value": str(q)},
            {"label": "n = p·q", "value": str(n)},
            {"label": "φ(n) = (p−1)(q−1)", "value": str(phi)},
            {"label": "e — gcd(e, φ(n)) = 1", "value": str(e)},
            {"label": "d = e⁻¹ mod φ(n)  (extended Euclid)", "value": str(d)},
            {"label": "check e·d mod φ(n)", "value": str(e * d % phi)},
        ]
    return result


def encrypt(n, e, m, trace=False):
    """c = m^e mod n. Requires m < n."""
    if n < 2:
        raise ValueError("n must be >= 2")
    if m >= n:
        raise ValueError("message m must be < n")
    c = modpow(m, e, n)
    result = {"c": c}
    if trace:
        result["trace"] = [
            {"label": "m", "value": str(m)},
            {"label": "e", "value": str(e)},
            {"label": "n", "value": str(n)},
            {"label": "c = mᵉ mod n  (square-and-multiply)", "value": str(c)},
        ]
    return result


def decrypt(n, d, c, trace=False):
    """m = c^d mod n."""
    if n < 2:
        raise ValueError("n must be >= 2")
    m = modpow(c, d, n)
    result = {"m": m}
    if trace:
        result["trace"] = [
            {"label": "c", "value": str(c)},
            {"label": "d (secret)", "value": str(d)},
            {"label": "m = cᵈ mod n", "value": str(m)},
        ]
    return result


def sign(n, d, m, trace=False):
    """s = m^d mod n (textbook signature over the raw message)."""
    if n < 2:
        raise ValueError("n must be >= 2")
    if m >= n:
        raise ValueError("message m must be < n")
    s = modpow(m, d, n)
    result = {"s": s}
    if trace:
        result["trace"] = [
            {"label": "m", "value": str(m)},
            {"label": "s = mᵈ mod n", "value": str(s)},
        ]
    return result


def verify(n, e, m, s, trace=False):
    """recovered = s^e mod n; valid = recovered == m."""
    if n < 2:
        raise ValueError("n must be >= 2")
    recovered = modpow(s, e, n)
    valid = recovered == m
    result = {"valid": valid, "recovered": recovered}
    if trace:
        result["trace"] = [
            {"label": "s", "value": str(s)},
            {"label": "sᵉ mod n", "value": str(recovered)},
            {"label": "expected m", "value": str(m)},
        ]
    return result
