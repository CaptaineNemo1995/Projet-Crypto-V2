"""routes — Flask blueprints for the CRYPTA REST API.

Each blueprint parses incoming decimal strings to Python ints, calls the
from-scratch crypto engine, and returns big numbers as decimal strings. Every
compute endpoint honours an optional {"trace": true} flag.
"""

from ._helpers import get_json, want_trace, req_int, opt_int, error
from .rsa_routes import rsa_bp
from .elgamal_routes import elgamal_bp
from .paillier_routes import paillier_bp
from .election_routes import election_bp
from .attacks_routes import attacks_bp

ALL_BLUEPRINTS = (
    rsa_bp,
    elgamal_bp,
    paillier_bp,
    election_bp,
    attacks_bp,
)

__all__ = [
    "ALL_BLUEPRINTS",
    "rsa_bp", "elgamal_bp", "paillier_bp", "election_bp", "attacks_bp",
    "get_json", "want_trace", "req_int", "opt_int", "error",
]
