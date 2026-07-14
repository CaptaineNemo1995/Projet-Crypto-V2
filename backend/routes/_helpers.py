"""_helpers.py — shared request/response helpers for the route blueprints.

Kept in its own module so blueprint modules can import it without a circular
dependency through routes/__init__.py.
"""

from flask import jsonify, request


def get_json():
    """Return the request JSON body as a dict (empty dict if none/invalid)."""
    data = request.get_json(silent=True)
    return data if isinstance(data, dict) else {}


def want_trace(data):
    return bool(data.get("trace"))


def req_int(data, key):
    """Parse data[key] as an int from a decimal string or number.

    Raises ValueError (with a friendly message) if missing or non-integer.
    """
    if key not in data or data[key] is None or data[key] == "":
        raise ValueError("missing field: " + key)
    try:
        return int(str(data[key]).strip())
    except (TypeError, ValueError):
        raise ValueError("field '" + key + "' must be an integer")


def opt_int(data, key, default=None):
    """Parse an optional int field; return default if absent/blank."""
    if key not in data or data[key] is None or data[key] == "":
        return default
    try:
        return int(str(data[key]).strip())
    except (TypeError, ValueError):
        raise ValueError("field '" + key + "' must be an integer")


def error(msg, code=400):
    return jsonify({"error": msg}), code
