"""paillier_routes.py — /api/paillier/* endpoints (engine-level, general g).

keygen, encrypt, decrypt, tally. Supports a general generator g (course vector
uses g = 4886 != n+1). Big numbers are decimal strings; optional {"trace": true};
{"error"} + 400 on bad input.
"""

from flask import Blueprint, jsonify

from crypto_engine import paillier
from ._helpers import get_json, want_trace, req_int, opt_int, error

paillier_bp = Blueprint("paillier", __name__, url_prefix="/api/paillier")


@paillier_bp.post("/keygen")
def keygen():
    data = get_json()
    try:
        p = opt_int(data, "p")
        q = opt_int(data, "q")
        bits = opt_int(data, "bits")
        g = opt_int(data, "g")
        if (p is None or q is None) and bits is None:
            return error("provide either (p, q) or bits")
        if bits is not None and bits > 4096:
            return error("bits must be <= 4096")
        res = paillier.keygen(p=p, q=q, bits=bits, g=g, trace=want_trace(data))
    except ValueError as ex:
        return error(str(ex))

    out = {
        "n": str(res["n"]),
        "g": str(res["g"]),
        "lambda": str(res["lambda"]),
        "mu": str(res["mu"]),
        "n2": str(res["n2"]),
    }
    if "trace" in res:
        out["trace"] = res["trace"]
    return jsonify(out)


@paillier_bp.post("/encrypt")
def encrypt():
    data = get_json()
    try:
        n = req_int(data, "n")
        g = req_int(data, "g")
        m = req_int(data, "m")
        r = opt_int(data, "r")
        if n < 2:
            return error("n must be >= 2")
        res = paillier.encrypt(n, g, m, r=r, trace=want_trace(data))
    except ValueError as ex:
        return error(str(ex))

    out = {"c": str(res["c"]), "r": str(res["r"])}
    if "trace" in res:
        out["trace"] = res["trace"]
    return jsonify(out)


@paillier_bp.post("/decrypt")
def decrypt():
    data = get_json()
    try:
        n = req_int(data, "n")
        lam = req_int(data, "lambda")
        mu = req_int(data, "mu")
        c = req_int(data, "c")
        if n < 2:
            return error("n must be >= 2")
        res = paillier.decrypt(n, lam, mu, c, trace=want_trace(data))
    except ValueError as ex:
        return error(str(ex))

    out = {"m": str(res["m"])}
    if "trace" in res:
        out["trace"] = res["trace"]
    return jsonify(out)


@paillier_bp.post("/tally")
def tally():
    data = get_json()
    try:
        n = req_int(data, "n")
        lam = req_int(data, "lambda")
        mu = req_int(data, "mu")
        raw = data.get("ciphertexts")
        if not isinstance(raw, list) or not raw:
            return error("ciphertexts must be a non-empty list")
        try:
            cts = [int(str(x).strip()) for x in raw]
        except (TypeError, ValueError):
            return error("ciphertexts must be a list of integers")
        if n < 2:
            return error("n must be >= 2")
        res = paillier.tally(n, lam, mu, cts, trace=want_trace(data))
    except ValueError as ex:
        return error(str(ex))

    out = {"product": str(res["product"]), "sum": str(res["sum"])}
    if "trace" in res:
        out["trace"] = res["trace"]
    return jsonify(out)
