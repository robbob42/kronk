# app/__init__.py
from flask import Flask
from config import Config
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

db = SQLAlchemy()
migrate = Migrate()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    db.init_app(app)
    migrate.init_app(app, db)

    # Register the blueprint here
    from app.api import bp as api_blueprint
    app.register_blueprint(api_blueprint, url_prefix='/api')

    from app.main import bp as main_blueprint
    app.register_blueprint(main_blueprint)

    return app

from app import models