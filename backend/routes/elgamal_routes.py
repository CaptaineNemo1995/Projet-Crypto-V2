"""elgamal_routes.py — /api/elgamal/* endpoints (professor's notation p, a, s, y).

keygen, compute_y, encrypt (fresh random k each call), decrypt. Big numbers are
decimal strings; optional {"trace": true}; {"error"} + 400 on bad input.
"""

from flask import Blueprint, jsonify

from crypto_engine import elgamal
from ._helpers import get_json, want_trace, req_int, error

elgamal_bp = Blueprint("elgamal", __name__, url_prefix="/api/elgamal")


@elgamal_bp.post("/keygen")
def keygen():
    data = get_json()
    try:
        bits = req_int(data, "bits")
        if bits < 8:
            return error("bits must be >= 8")
        if bits > 4096:
            return error("bits must be <= 4096")
        res = elgamal.keygen(bits, trace=want_trace(data))
    except ValueError as ex:
        return error(str(ex))

    out = {
        "p": str(res["p"]),
        "a": str(res["a"]),
        "s": str(res["s"]),
        "y": str(res["y"]),
    }
    if "trace" in res:
        out["trace"] = res["trace"]
    return jsonify(out)


@elgamal_bp.post("/compute_y")
def compute_y():
    data = get_json()
    try:
        p = req_int(data, "p")
        a = req_int(data, "a")
        s = req_int(data, "s")
        res = elgamal.compute_y(p, a, s, trace=want_trace(data))
    except ValueError as ex:
        return error(str(ex))

    out = {"y": str(res["y"])}
    if "trace" in res:
        out["trace"] = res["trace"]
    return jsonify(out)


@elgamal_bp.post("/encrypt")
def encrypt():
    data = get_json()
    try:
        p = req_int(data, "p")
        a = req_int(data, "a")
        y = req_int(data, "y")
        m = req_int(data, "m")
        res = elgamal.encrypt(p, a, y, m, trace=want_trace(data))
    except ValueError as ex:
        return error(str(ex))

    out = {"k": str(res["k"]), "c1": str(res["c1"]), "c2": str(res["c2"])}
    if "trace" in res:
        out["trace"] = res["trace"]
    return jsonify(out)


@elgamal_bp.post("/decrypt")
def decrypt():
    data = get_json()
    try:
        p = req_int(data, "p")
        s = req_int(data, "s")
        c1 = req_int(data, "c1")
        c2 = req_int(data, "c2")
        res = elgamal.decrypt(p, s, c1, c2, trace=want_trace(data))
    except ValueError as ex:
        return error(str(ex))

    out = {"m": str(res["m"])}
    if "trace" in res:
        out["trace"] = res["trace"]
    return jsonify(out)
