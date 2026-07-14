"""app.py — CRYPTA Flask application factory.

Creates the app, enables open CORS (dev), and registers every API blueprint
(RSA, ElGamal, Paillier, Election, Attacks). Run directly for a dev server:

    python app.py    # 127.0.0.1:5000, debug
"""

from flask import Flask, jsonify
from flask_cors import CORS

from routes import ALL_BLUEPRINTS


def create_app():
    app = Flask(__name__)

    # Open CORS in dev so the Vite frontend (port 5173) can call the API.
    CORS(app)

    for bp in ALL_BLUEPRINTS:
        app.register_blueprint(bp)

    @app.get("/api/health")
    def health():
        return jsonify({"ok": True, "service": "crypta-backend"})

    return app


if __name__ == "__main__":
    create_app().run(host="127.0.0.1", port=5000, debug=True)
