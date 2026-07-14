"""rsa_routes.py — /api/rsa/* endpoints (keygen, encrypt, decrypt, sign, verify).

Big numbers cross the API as decimal strings. Every endpoint honours an optional
{"trace": true} flag and returns {"error": msg} + HTTP 400 on bad input.
"""

from flask import Blueprint, jsonify

from crypto_engine import rsa
from ._helpers import get_json, want_trace, req_int, error

rsa_bp = Blueprint("rsa", __name__, url_prefix="/api/rsa")


@rsa_bp.post("/keygen")
def keygen():
    data = get_json()
    try:
        bits = req_int(data, "bits")
        if bits < 64:
            return error("bits must be >= 64")
        if bits > 4096:
            return error("bits must be <= 4096")
        res = rsa.keygen(bits, trace=want_trace(data))
    except ValueError as ex:
        return error(str(ex))

    out = {
        "p": str(res["p"]),
        "q": str(res["q"]),
        "n": str(res["n"]),
        "phi": str(res["phi"]),
        "e": str(res["e"]),
        "d": str(res["d"]),
    }
    if "trace" in res:
        out["trace"] = res["trace"]
    return jsonify(out)


@rsa_bp.post("/encrypt")
def encrypt():
    data = get_json()
    try:
        n = req_int(data, "n")
        e = req_int(data, "e")
        m = req_int(data, "m")
        res = rsa.encrypt(n, e, m, trace=want_trace(data))
    except ValueError as ex:
        return error(str(ex))

    out = {"c": str(res["c"])}
    if "trace" in res:
        out["trace"] = res["trace"]
    return jsonify(out)


@rsa_bp.post("/decrypt")
def decrypt():
    data = get_json()
    try:
        n = req_int(data, "n")
        d = req_int(data, "d")
        c = req_int(data, "c")
        res = rsa.decrypt(n, d, c, trace=want_trace(data))
    except ValueError as ex:
        return error(str(ex))

    out = {"m": str(res["m"])}
    if "trace" in res:
        out["trace"] = res["trace"]
    return jsonify(out)


@rsa_bp.post("/sign")
def sign():
    data = get_json()
    try:
        n = req_int(data, "n")
        d = req_int(data, "d")
        m = req_int(data, "m")
        res = rsa.sign(n, d, m, trace=want_trace(data))
    except ValueError as ex:
        return error(str(ex))

    out = {"s": str(res["s"])}
    if "trace" in res:
        out["trace"] = res["trace"]
    return jsonify(out)


@rsa_bp.post("/verify")
def verify():
    data = get_json()
    try:
        n = req_int(data, "n")
        e = req_int(data, "e")
        m = req_int(data, "m")
        s = req_int(data, "s")
        res = rsa.verify(n, e, m, s, trace=want_trace(data))
    except ValueError as ex:
        return error(str(ex))

    out = {"valid": bool(res["valid"]), "recovered": str(res["recovered"])}
    if "trace" in res:
        out["trace"] = res["trace"]
    return jsonify(out)
