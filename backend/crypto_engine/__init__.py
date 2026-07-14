"""crypto_engine — from-scratch cryptography for CRYPTA.

Public API re-exported and grouped by module. No external crypto libraries;
Miller-Rabin, square-and-multiply, and extended Euclid are all hand-written.
"""

from . import number_theory, rsa, elgamal, paillier

# --- number_theory ---
from .number_theory import (
    modpow,
    egcd,
    modinv,
    gcd,
    lcm,
    rand_bits,
    is_prime,
    gen_prime,
)

# --- rsa (namespaced aliases to avoid clashing with other modules) ---
from .rsa import keygen as rsa_keygen
from .rsa import encrypt as rsa_encrypt
from .rsa import decrypt as rsa_decrypt
from .rsa import sign as rsa_sign
from .rsa import verify as rsa_verify

# --- elgamal ---
from .elgamal import keygen as elgamal_keygen
from .elgamal import compute_y as elgamal_compute_y
from .elgamal import encrypt as elgamal_encrypt
from .elgamal import decrypt as elgamal_decrypt

# --- paillier ---
from .paillier import keygen as paillier_keygen
from .paillier import encrypt as paillier_encrypt
from .paillier import decrypt as paillier_decrypt
from .paillier import add as paillier_add
from .paillier import tally as paillier_tally

__all__ = [
    # modules
    "number_theory", "rsa", "elgamal", "paillier",
    # number theory
    "modpow", "egcd", "modinv", "gcd", "lcm", "rand_bits", "is_prime", "gen_prime",
    # rsa
    "rsa_keygen", "rsa_encrypt", "rsa_decrypt", "rsa_sign", "rsa_verify",
    # elgamal
    "elgamal_keygen", "elgamal_compute_y", "elgamal_encrypt", "elgamal_decrypt",
    # paillier
    "paillier_keygen", "paillier_encrypt", "paillier_decrypt",
    "paillier_add", "paillier_tally",
]
