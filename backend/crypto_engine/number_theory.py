"""number_theory.py — from-scratch number-theory primitives.

modpow (square-and-multiply), egcd, modinv, gcd, lcm, rand_bits,
is_prime (Miller-Rabin, k=12) and gen_prime.

No external crypto libraries. Randomness uses the `secrets` module.
"""

import secrets

# Small primes for trial division before the Miller-Rabin test.
_SMALL_PRIMES = (2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37)


def modpow(base, exp, mod):
    """Modular exponentiation via square-and-multiply. base**exp mod mod."""
    if mod == 1:
        return 0
    base %= mod
    result = 1
    e = exp
    while e > 0:
        if e & 1:
            result = result * base % mod
        base = base * base % mod
        e >>= 1
    return result


def egcd(a, b):
    """Extended Euclid. Returns (g, x, y) with a*x + b*y = g = gcd(a, b)."""
    if b == 0:
        return (a, 1, 0)
    g, x, y = egcd(b, a % b)
    return (g, y, x - (a // b) * y)


def modinv(a, m):
    """Modular inverse of a mod m via extended Euclid.

    Returns None when gcd(a, m) != 1 (no inverse exists).
    """
    a = ((a % m) + m) % m
    g, x, _ = egcd(a, m)
    if g != 1:
        return None
    return ((x % m) + m) % m


def gcd(a, b):
    """Greatest common divisor (Euclid)."""
    a, b = abs(a), abs(b)
    while b:
        a, b = b, a % b
    return a


def lcm(a, b):
    """Least common multiple."""
    if a == 0 or b == 0:
        return 0
    return a // gcd(a, b) * b


def rand_bits(bits):
    """Random odd integer of exactly `bits` bits.

    Top bit forced (full length) and bottom bit forced (odd).
    Uses `secrets` for cryptographic randomness.
    """
    if bits < 1:
        raise ValueError("bits must be >= 1")
    n = secrets.randbits(bits)
    n |= 1 << (bits - 1)   # force top bit -> full length
    n |= 1                 # force bottom bit -> odd
    return n & ((1 << bits) - 1)


def is_prime(n, k=12):
    """Primality test: small-prime trial division then Miller-Rabin (k rounds)."""
    if n < 2:
        return False
    for p in _SMALL_PRIMES:
        if n == p:
            return True
        if n % p == 0:
            return False

    # write n-1 = d * 2^r with d odd
    d = n - 1
    r = 0
    while not (d & 1):
        d >>= 1
        r += 1

    for _ in range(k):
        # witness a in [2, n-2]
        a = 2 + secrets.randbelow(n - 3)
        x = modpow(a, d, n)
        if x == 1 or x == n - 1:
            continue
        composite = True
        for _ in range(r - 1):
            x = x * x % n
            if x == n - 1:
                composite = False
                break
        if composite:
            return False
    return True


def gen_prime(bits):
    """Generate a probable prime of `bits` bits (loop rand_bits until is_prime)."""
    while True:
        c = rand_bits(bits)
        if is_prime(c):
            return c
