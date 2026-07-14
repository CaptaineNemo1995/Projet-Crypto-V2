"""store.py — module-level in-memory store for ONE active CRYPTA election.

Holds the election question/mode/candidates, the Paillier public parameters
(n, g, n2) and secret (lambda, mu — NEVER exposed by routes), a per-election RSA
voting keypair used to sign ballot ciphertexts (R8), and the list of cast ballots.

There is no database: a single module-level dict is the singleton store. The
election routes are the only writers; everything here is plain Python ints.
"""

from crypto_engine import rsa

# The single active election (or None when nothing is set up).
_election = None


def _next_ballot_id():
    _election["ballot_seq"] += 1
    return _election["ballot_seq"]


def create_election(question, mode, candidates, base, pub, sec):
    """Initialise the active election, replacing any previous one.

    pub = {"n", "g", "n2"} (ints); sec = {"lambda", "mu"} (ints, server-side only).
    Generates a fresh per-election RSA voting keypair for ballot signing.
    Returns the new election dict.
    """
    global _election

    # Per-election RSA voting key (used to sign/verify ballot ciphertexts).
    # 512-bit modulus: big enough to be non-trivial, fast enough for the demo.
    vk = rsa.keygen(512)

    _election = {
        "id": "election-1",
        "question": question,
        "mode": mode,
        "candidates": list(candidates) if candidates else [],
        "base": base,
        "public": {"n": pub["n"], "g": pub["g"], "n2": pub["n2"]},
        "secret": {"lambda": sec["lambda"], "mu": sec["mu"]},
        "voting_key": {"n": vk["n"], "e": vk["e"], "d": vk["d"]},
        "ballots": [],
        "ballot_seq": 0,
        "tallied": False,
    }
    return _election


def reset_election():
    """Clear the active election."""
    global _election
    _election = None


def get_election():
    """Return the active election dict (or None)."""
    return _election


def is_active():
    return _election is not None


def add_ballot(ciphertext, signature, sig_valid):
    """Append a ballot record and return it (id assigned here)."""
    ballot = {
        "id": _next_ballot_id(),
        "ciphertext": ciphertext,
        "signature": signature,
        "sig_valid": sig_valid,
    }
    _election["ballots"].append(ballot)
    return ballot


def get_ballots():
    """All ballots for the active election (empty list if none active)."""
    if _election is None:
        return []
    return _election["ballots"]


def ballot_count():
    if _election is None:
        return 0
    return len(_election["ballots"])


def set_tallied(flag=True):
    if _election is not None:
        _election["tallied"] = flag
