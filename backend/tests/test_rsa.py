"""RSA tests — course test vectors."""

from crypto_engine import rsa
from crypto_engine.number_theory import gcd, modinv


def test_rsa_td_p23_q47_e13():
    """TD: p=23, q=47, e=13 -> phi=1012; e*d % phi == 1 and round-trip."""
    p, q, e = 23, 47, 13
    n = p * q
    phi = (p - 1) * (q - 1)
    assert phi == 1012
    assert gcd(e, phi) == 1                 # e=13 is usable as-is
    d = modinv(e, phi)
    assert e * d % phi == 1

    m = 42
    c = rsa.encrypt(n, e, m)["c"]
    back = rsa.decrypt(n, d, c)["m"]
    assert back == m


def test_rsa_keygen_bumps_e_and_roundtrips_small():
    """keygen with explicit primes path exercised via small bits; verify e·d≡1."""
    kp = rsa.keygen(bits=64, trace=True)
    n, e, d, phi = kp["n"], kp["e"], kp["d"], kp["phi"]
    assert e * d % phi == 1
    assert gcd(e, phi) == 1
    assert kp["trace"][-1]["value"] == "1"  # check e·d mod φ(n)

    m = 12345
    c = rsa.encrypt(n, e, m)["c"]
    assert rsa.decrypt(n, d, c)["m"] == m


def test_rsa_2048_roundtrip():
    """2048-bit modulus round-trip (encrypt then decrypt)."""
    kp = rsa.keygen(bits=2048)
    n, e, d = kp["n"], kp["e"], kp["d"]
    assert n.bit_length() >= 2040          # ~2048-bit modulus
    m = 0xDEADBEEFCAFEBABE1234567890ABCDEF
    c = rsa.encrypt(n, e, m)["c"]
    assert rsa.decrypt(n, d, c)["m"] == m


def test_rsa_sign_verify():
    kp = rsa.keygen(bits=64)
    n, e, d = kp["n"], kp["e"], kp["d"]
    m = 99
    s = rsa.sign(n, d, m)["s"]
    v = rsa.verify(n, e, m, s)
    assert v["valid"] is True
    assert v["recovered"] == m
    # tampered signature must fail
    bad = rsa.verify(n, e, m, s + 1)
    assert bad["valid"] is False
