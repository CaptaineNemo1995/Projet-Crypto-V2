"""Tests for the from-scratch number-theory primitives."""

from crypto_engine.number_theory import (
    modpow, egcd, modinv, gcd, lcm, rand_bits, is_prime, gen_prime,
)


def test_modpow_matches_python_pow():
    assert modpow(4886, 123, 48841) == pow(4886, 123, 48841)
    assert modpow(2, 10, 1000) == 24
    assert modpow(7, 0, 13) == 1          # anything^0 = 1
    assert modpow(123456789, 987654321, 1000000007) == pow(123456789, 987654321, 1000000007)


def test_egcd_identity():
    a, b = 240, 46
    g, x, y = egcd(a, b)
    assert g == gcd(a, b)
    assert a * x + b * y == g


def test_modinv():
    assert modinv(3, 11) == 4              # 3*4 = 12 ≡ 1 mod 11
    assert (13 * modinv(13, 1012)) % 1012 == 1
    assert modinv(2, 4) is None            # gcd != 1 -> no inverse


def test_gcd_lcm():
    assert gcd(12, 16) == 4
    assert lcm(12, 16) == 48               # Paillier course vector lambda
    assert lcm(0, 5) == 0


def test_rand_bits_shape():
    for bits in (16, 32, 64, 128):
        n = rand_bits(bits)
        assert n.bit_length() == bits      # top bit forced -> full length
        assert n & 1 == 1                  # bottom bit forced -> odd


def test_is_prime_known():
    assert is_prime(2)
    assert is_prime(23)
    assert is_prime(47)
    assert is_prime(2 ** 31 - 1)           # Mersenne prime
    assert not is_prime(1)
    assert not is_prime(0)
    assert not is_prime(561)               # Carmichael number
    assert not is_prime(23 * 47)


def test_gen_prime():
    p = gen_prime(64)
    assert p.bit_length() == 64
    assert is_prime(p)
