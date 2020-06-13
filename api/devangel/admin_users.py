import flask_login as login
from wtforms import form, fields, validators
from werkzeug.security import generate_password_hash, check_password_hash

from .models import AdminUser, db

admin_login_manager = login.LoginManager()


@admin_login_manager.user_loader
def load_user(user_id):
    return AdminUser.query.get(user_id)


# Define login and registration forms (for flask-login)
class LoginForm(form.Form):
    login = fields.StringField(validators=[validators.required()])
    password = fields.PasswordField(validators=[validators.required()])

    def validate_login(self, field):
        user = self.get_user()

        if user is None:
            raise validators.ValidationError('Invalid user')

        # we're comparing the plaintext pw with the the hash from the db
        if not check_password_hash(user.password, self.password.data):
            # to compare plain text passwords use
            # if user.password != self.password.data:
            raise validators.ValidationError('Invalid password')

    def get_user(self):
        return db.session.query(AdminUser).filter_by(login=self.login.data).first()
