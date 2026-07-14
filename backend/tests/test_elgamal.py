"""ElGamal tests — course test vector."""

from crypto_engine import elgamal


def test_elgamal_td_p11_a2_s3():
    """TD: p=11, a=2, s=3 -> y=8."""
    res = elgamal.compute_y(p=11, a=2, s=3)
    assert res["y"] == 8


def test_elgamal_encrypt_decrypt_roundtrip_m7():
    """Encrypt m=7 with fresh k, decrypt back to 7 (any fresh k)."""
    p, a, s = 11, 2, 3
    y = elgamal.compute_y(p, a, s)["y"]
    m = 7
    # run several times: fresh random k each call must still round-trip
    for _ in range(20):
        enc = elgamal.encrypt(p, a, y, m)
        assert 1 <= enc["k"] <= p - 2
        dec = elgamal.decrypt(p, s, enc["c1"], enc["c2"])
        assert dec["m"] == m


def test_elgamal_keygen_roundtrip():
    kp = elgamal.keygen(bits=128, trace=True)
    p, a, s, y = kp["p"], kp["a"], kp["s"], kp["y"]
    assert y == pow(a, s, p)
    m = 424242
    enc = elgamal.encrypt(p, a, y, m)
    assert elgamal.decrypt(p, s, enc["c1"], enc["c2"])["m"] == m
