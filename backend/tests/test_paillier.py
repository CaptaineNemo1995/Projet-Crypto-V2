"""Paillier tests — course vectors + homomorphic tally."""

from crypto_engine import paillier


# Shared course-vector key material: p=13, q=17, g=4886.
KEY = paillier.keygen(p=13, q=17, g=4886)


def test_paillier_key_material():
    """Sanity-check the derived key: n=221, n²=48841, lambda=48, mu=159."""
    assert KEY["n"] == 221
    assert KEY["n2"] == 48841
    assert KEY["lambda"] == 48
    assert KEY["mu"] == 159
    assert KEY["g"] == 4886


def test_paillier_course_vector_m123_r59():
    """encrypt(m=123, r=59) then decrypt == 123."""
    n, g, lam, mu = KEY["n"], KEY["g"], KEY["lambda"], KEY["mu"]
    enc = paillier.encrypt(n, g, 123, r=59)
    assert enc["c"] == 13250            # deterministic given fixed r
    dec = paillier.decrypt(n, lam, mu, enc["c"])
    assert dec["m"] == 123


def test_paillier_homomorphism_single_decryption():
    """C1=27275, C2=27402, C3=12991 decrypt individually to m1,m2,m3;
    product mod n² decrypts (ONE decryption) to (m1+m2+m3) mod n."""
    n, lam, mu = KEY["n"], KEY["lambda"], KEY["mu"]
    C = [27275, 27402, 12991]

    ms = [paillier.decrypt(n, lam, mu, c)["m"] for c in C]
    assert ms == [11, 12, 13]

    expected = sum(ms) % n              # 36

    result = paillier.tally(n, lam, mu, C)
    assert result["sum"] == expected    # 36 — product decrypts to the sum

    # tally performs exactly one decryption: product then single decrypt
    n2 = KEY["n2"]
    prod = 1
    for c in C:
        prod = prod * c % n2
    assert result["product"] == prod
    assert paillier.decrypt(n, lam, mu, prod)["m"] == expected


def test_paillier_encrypt_random_r_roundtrip():
    """Omitting r picks a random coprime r; must still decrypt correctly."""
    n, g, lam, mu = KEY["n"], KEY["g"], KEY["lambda"], KEY["mu"]
    for m in (0, 1, 42, 220):
        enc = paillier.encrypt(n, g, m)
        assert paillier.decrypt(n, lam, mu, enc["c"])["m"] == m


def test_paillier_keygen_default_g_bits():
    """Default g = n+1 path with generated primes round-trips."""
    kp = paillier.keygen(bits=64)
    assert kp["g"] == kp["n"] + 1
    enc = paillier.encrypt(kp["n"], kp["g"], 1234)
    assert paillier.decrypt(kp["n"], kp["lambda"], kp["mu"], enc["c"])["m"] == 1234
