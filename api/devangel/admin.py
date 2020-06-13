from flask import redirect, url_for, request
from flask_admin import Admin, AdminIndexView, expose, helpers
from flask_admin.contrib import sqla
import flask_login as login
from wtforms import form as wtf_form, fields, validators
from werkzeug.security import check_password_hash
from .models import db, AdminUser, User, Grant, Category, GrantTag, Product, ProductCategory, ProductComment


class UserModelView(sqla.ModelView):
    def is_accessible(self):
        return login.current_user.is_authenticated


class GrantModelView(sqla.ModelView):
    def is_accessible(self):
        return login.current_user.is_authenticated


class CategoryModelView(sqla.ModelView):
    def is_accessible(self):
        return login.current_user.is_authenticated


class GrantTagModelView(sqla.ModelView):
    def is_accessible(self):
        return login.current_user.is_authenticated


class ProductModelView(sqla.ModelView):
    def is_accessible(self):
        return login.current_user.is_authenticated


class ProductCategoryModelView(sqla.ModelView):
    def is_accessible(self):
        return login.current_user.is_authenticated


class ProductCommentModelView(sqla.ModelView):
    can_create = False

    def is_accessible(self):
        return login.current_user.is_authenticated

    def after_model_delete(self, model):
        product = Product.query.get(model.product_id)
        product.comments_count -= 1
        db.session.commit()
        print(self, model, 'after_delete')


class LoginForm(wtf_form.Form):
    username = fields.StringField(validators=[validators.required()])
    password = fields.PasswordField(validators=[validators.required()])

    def validate_username(self, field):
        user = self.get_user()
        if user is None:
            raise validators.ValidationError('Invalid username')

        # we're comparing the plaintext pw with the the hash from the db
        if not check_password_hash(user.password, self.password.data):
            # to compare plain text passwords use
            # if user.password != self.password.data:
            raise validators.ValidationError('Invalid password')

    def get_user(self):
        return db.session.query(AdminUser).filter_by(username=self.username.data).first()


class AuthenticatedAdminIndexView(AdminIndexView):
    @expose('/')
    def index(self):
        if not login.current_user.is_authenticated:
            return redirect('/admin/login')
        return super(AuthenticatedAdminIndexView, self).index()

    @expose('/login/', methods=('GET', 'POST'))
    def login_view(self):
        # handle user login
        form = LoginForm(request.form)
        if helpers.validate_form_on_submit(form):
            user = form.get_user()
            login.login_user(user)

        if login.current_user.is_authenticated:
            return redirect(url_for('.index'))
        self._template_args['form'] = form
        return super(AuthenticatedAdminIndexView, self).index()

    @expose('/logout/')
    def logout_view(self):
        login.logout_user()
        return redirect(url_for('.index'))


# Hack to prevent blueprint name collisions
# See: https://github.com/flask-admin/flask-admin/issues/910#issuecomment-216068210
def init_admin(f_admin):
    f_admin.add_view(UserModelView(User, db.session))
    f_admin.add_view(GrantModelView(Grant, db.session))
    f_admin.add_view(CategoryModelView(Category, db.session))
    f_admin.add_view(GrantTagModelView(GrantTag, db.session))
    f_admin.add_view(ProductModelView(Product, db.session))
    f_admin.add_view(ProductCategoryModelView(ProductCategory, db.session))
    f_admin.add_view(ProductCommentModelView(ProductComment, db.session))
