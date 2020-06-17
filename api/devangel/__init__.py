import os
from flask import Flask
import jinja2
from flask_cors import CORS


def create_app(test_config=None):
    # create and configure the app
    app = Flask(__name__, static_folder='../../build',
                static_url_path='/', instance_relative_config=True)
    # CORS
    CORS(app)
    secret_key = os.environ.get("DEVANGEL_SECRET_KEY", "dev")
    app.config.from_mapping(
        SECRET_KEY=secret_key,
        DATABASE=os.path.join(app.instance_path, 'flaskr.sqlite'),
    )

    if test_config is None:
        # load the instance config, if it exists, when not testing
        app.config.from_pyfile('config.py', silent=True)
    else:
        # load the test config if passed in
        app.config.from_mapping(test_config)

    # ensure the instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    # Setup database
    from .models import db, User, Grant, Category, GrantTag
    from .migrations import migrate
    database_url = os.environ.get(
        "DEVANGEL_DB_URL", "postgresql+psycopg2://postgres:devangel123@dbinstance.cdsfpnto71mr.us-east-2.rds.amazonaws.com:5432/")
    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db.init_app(app)
    # Initialize database migrations
    migrate.init_app(app, db)

    # Setup custom templates loader
    app.jinja_loader = jinja2.ChoiceLoader([
        app.jinja_loader,
        jinja2.FileSystemLoader(['devangel/templates']),
    ])

    # Setup admin user auth
    from api.devangel.admin import AuthenticatedAdminIndexView
    from flask_admin import Admin
    from .admin_users import admin_login_manager
    admin_login_manager.init_app(app)

    # Setup admin panel
    from .admin import init_admin

    f_admin = Admin(app, name="DevAngel", template_mode="bootstrap3", index_view=AuthenticatedAdminIndexView(),
                    base_template='admin/master.html')

    init_admin(f_admin)

    # Setup user auth
    from .users import guard
    app.config['JWT_ACCESS_LIFESPAN'] = {'hours': 24}
    app.config['JWT_REFRESH_LIFESPAN'] = {'days': 30}
    # https://github.com/flask-restful/flask-restful/issues/792
    app.config['PROPAGATE_EXCEPTIONS'] = True
    guard.init_app(app, User)

    # S3
    app.config['S3_BUCKET_NAME'] = os.environ.get("S3_BUCKET_NAME", "")

    # Register blueprints
    from . import api
    from . import views
    app.register_blueprint(api.bp)
    app.register_blueprint(views.static, url_prefix='')
    from .schema import ma
    ma.init_app(app)

    @app.route('/')
    def index():
        return app.send_static_file('index.html')

    return app
