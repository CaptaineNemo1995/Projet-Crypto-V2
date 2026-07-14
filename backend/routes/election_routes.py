"""election_routes.py — /api/election/* (in-memory homomorphic e-voting).

Setup -> Booth -> Board -> Tally over Paillier. The secret key material (lambda,
mu) lives only in store.py and is NEVER returned. Each ballot ciphertext is
RSA-signed with a per-election voting key (R8); the Board shows signature status
but never plaintext. Tally multiplies every ciphertext mod n^2 and decrypts ONCE.
"""

from flask import Blueprint, jsonify

from crypto_engine import paillier, rsa
import store
from ._helpers import get_json, want_trace, error

election_bp = Blueprint("election", __name__, url_prefix="/api/election")

# Paillier key size for a demo election (fast, still non-trivial).
ELECTION_BITS = 256
DEFAULT_BASE = 100


def _public_out(el):
    return {
        "n": str(el["public"]["n"]),
        "g": str(el["public"]["g"]),
        "n2": str(el["public"]["n2"]),
    }


def _sign_ciphertext(el, c):
    """Sign ciphertext c mod voting-key n (textbook RSA sig), return (sig, valid)."""
    vk = el["voting_key"]
    m = c % vk["n"]                      # reduce so message < modulus
    s = rsa.sign(vk["n"], vk["d"], m)["s"]
    valid = rsa.verify(vk["n"], vk["e"], m, s)["valid"]
    return s, bool(valid)


def _encode_choice(el, choice):
    """Map a vote choice to the Paillier plaintext m. Raises ValueError on bad input."""
    if el["mode"] == "referendum":
        if isinstance(choice, str):
            c = choice.strip().lower()
        else:
            c = choice
        if c in ("yes", "y", 1, "1", True):
            return 1
        if c in ("no", "n", 0, "0", False):
            return 0
        raise ValueError("choice must be 'yes' or 'no'")
    # multi
    try:
        idx = int(choice)
    except (TypeError, ValueError):
        raise ValueError("choice must be a candidate index")
    if idx < 0 or idx >= len(el["candidates"]):
        raise ValueError("candidate index out of range")
    return el["base"] ** idx


def _cast(el, m):
    """Encrypt plaintext m, sign, store. Returns the ballot record + r."""
    enc = paillier.encrypt(el["public"]["n"], el["public"]["g"], m)
    c = enc["c"]
    sig, valid = _sign_ciphertext(el, c)
    ballot = store.add_ballot(str(c), str(sig), valid)
    return ballot, enc["r"]


@election_bp.post("/create")
def create():
    data = get_json()

    question = data.get("question")
    if not question or not str(question).strip():
        return error("question is required")
    question = str(question).strip()

    mode = (data.get("mode") or "referendum").strip().lower()
    if mode not in ("referendum", "multi"):
        return error("mode must be 'referendum' or 'multi'")

    candidates = data.get("candidates") or []
    base = DEFAULT_BASE
    if mode == "multi":
        if not isinstance(candidates, list) or len(candidates) < 2:
            return error("multi mode requires a candidates list of >= 2 entries")
        candidates = [str(c) for c in candidates]
        # base = next power of 10 strictly greater than max voters (default 100).
        base = DEFAULT_BASE
        req_base = data.get("base")
        if req_base is not None:
            try:
                base = int(req_base)
            except (TypeError, ValueError):
                return error("base must be an integer")
            if base < 10:
                return error("base must be >= 10")
    else:
        candidates = []

    bits = data.get("bits")
    if bits is not None:
        try:
            bits = int(bits)
        except (TypeError, ValueError):
            return error("bits must be an integer")
        if bits < 64 or bits > 4096:
            return error("bits must be between 64 and 4096")
    else:
        bits = ELECTION_BITS

    try:
        keys = paillier.keygen(bits=bits)          # default g = n+1
    except ValueError as ex:
        return error(str(ex))

    pub = {"n": keys["n"], "g": keys["g"], "n2": keys["n2"]}
    sec = {"lambda": keys["lambda"], "mu": keys["mu"]}

    el = store.create_election(question, mode, candidates, base, pub, sec)

    out = {
        "election_id": el["id"],
        "question": el["question"],
        "mode": el["mode"],
        "candidates": el["candidates"],
        "public_key": _public_out(el),
    }
    if el["mode"] == "multi":
        out["base"] = str(el["base"])
    return jsonify(out)


@election_bp.get("")
@election_bp.get("/")
def status():
    el = store.get_election()
    if el is None:
        return jsonify({"active": False})
    return jsonify({
        "active": True,
        "question": el["question"],
        "mode": el["mode"],
        "candidates": el["candidates"],
        "public_key": _public_out(el),
        "base": str(el["base"]) if el["mode"] == "multi" else None,
        "ballot_count": store.ballot_count(),
        "tallied": el["tallied"],
    })


@election_bp.post("/vote")
def vote():
    el = store.get_election()
    if el is None:
        return error("no active election")
    if el["tallied"]:
        return error("election already tallied; reset to vote again")

    data = get_json()
    if "choice" not in data:
        return error("missing field: choice")
    try:
        m = _encode_choice(el, data["choice"])
    except ValueError as ex:
        return error(str(ex))

    ballot, r = _cast(el, m)
    if not ballot["sig_valid"]:
        return error("ballot signature verification failed", 500)

    return jsonify({
        "ballot_id": ballot["id"],
        "ciphertext": ballot["ciphertext"],
        "r": str(r),
        "signature": ballot["signature"],
        "sig_valid": ballot["sig_valid"],
    })


@election_bp.post("/vote_demo")
def vote_demo():
    el = store.get_election()
    if el is None:
        return error("no active election")
    if el["tallied"]:
        return error("election already tallied; reset to vote again")

    added = 0
    if el["mode"] == "referendum":
        # Demo distribution: 20 ballots, 13 yes / 7 no.
        for _ in range(13):
            _cast(el, 1)
            added += 1
        for _ in range(7):
            _cast(el, 0)
            added += 1
    else:
        # Spread a small demo distribution across candidates.
        n_cand = len(el["candidates"])
        dist = [5, 4, 3, 2, 1]
        for j in range(n_cand):
            votes = dist[j] if j < len(dist) else 1
            for _ in range(votes):
                _cast(el, el["base"] ** j)
                added += 1

    return jsonify({"added": added, "ballot_count": store.ballot_count()})


@election_bp.get("/board")
def board():
    el = store.get_election()
    if el is None:
        return jsonify({"ballots": [], "ballot_count": 0})
    ballots = [
        {
            "id": b["id"],
            "ciphertext": b["ciphertext"],
            "signature": b["signature"],
            "sig_valid": b["sig_valid"],
        }
        for b in store.get_ballots()
    ]
    return jsonify({"ballots": ballots, "ballot_count": len(ballots)})


@election_bp.post("/tally")
def tally():
    el = store.get_election()
    if el is None:
        return error("no active election")

    ballots = store.get_ballots()
    # Only tally validly-signed ballots (invalid sigs rejected — R8).
    valid_cts = [int(b["ciphertext"]) for b in ballots if b["sig_valid"]]
    if not valid_cts:
        return error("no valid ballots to tally")

    n = el["public"]["n"]
    lam = el["secret"]["lambda"]
    mu = el["secret"]["mu"]

    res = paillier.tally(n, lam, mu, valid_cts, trace=True)
    product = res["product"]
    total = res["sum"]              # sum of plaintexts, from ONE decryption

    trace = res["trace"]

    if el["mode"] == "referendum":
        yes = total
        no = len(valid_cts) - yes
        results = {"yes": yes, "no": no, "total": len(valid_cts)}
    else:
        # Decode the base-`base` digits: each candidate's count is one digit block.
        base = el["base"]
        counts = {}
        remaining = total
        for cand in el["candidates"]:
            counts[cand] = remaining % base
            remaining //= base
        results = {"counts": counts, "total": len(valid_cts)}
        trace = trace + [
            {"label": "decoded in base", "value": str(base)},
            {"label": "Σ counts (encoded)", "value": str(total)},
        ]

    store.set_tallied(True)

    return jsonify({
        "product": str(product),
        "decryptions": 1,
        "results": results,
        "trace": trace,
    })


@election_bp.post("/reset")
def reset():
    store.reset_election()
    return jsonify({"ok": True})
