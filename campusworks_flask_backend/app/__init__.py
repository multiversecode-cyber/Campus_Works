
import os
from datetime import timedelta
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv

load_dotenv()

db = SQLAlchemy()
jwt = JWTManager()


def create_app(test_config=None):
    app = Flask(__name__)

    app_env = os.getenv("APP_ENV", "development")
    secret_key = os.getenv("SECRET_KEY")
    jwt_secret_key = os.getenv("JWT_SECRET_KEY")

    if app_env == "production" and (not secret_key or not jwt_secret_key):
        raise RuntimeError(
            "SECRET_KEY and JWT_SECRET_KEY must be configured in production."
        )

    app.config.update(
        SECRET_KEY=secret_key or "dev-only-change-me",
        JWT_SECRET_KEY=jwt_secret_key or "dev-jwt-only-change-me",
        JWT_ACCESS_TOKEN_EXPIRES=timedelta(hours=8),
        SQLALCHEMY_DATABASE_URI=os.getenv(
            "DATABASE_URL", "sqlite:///campusworks.db"
        ),
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        DEBUG=os.getenv("FLASK_DEBUG", "0") == "1",
    )

    if test_config:
        app.config.update(test_config)

    db.init_app(app)
    jwt.init_app(app)

    CORS(
        app,
        resources={
            r"/api/*": {
                "origins": os.getenv(
                    "FRONTEND_ORIGIN", "http://localhost:5173"
                )
            }
        },
    )

    from .routes import api
    app.register_blueprint(api, url_prefix="/api")

    @app.get("/health")
    def health():
        return jsonify({
            "status": "ok",
            "service": "CampusWorks Flask API"
        })

    with app.app_context():
        from . import models
        db.create_all()

    return app
