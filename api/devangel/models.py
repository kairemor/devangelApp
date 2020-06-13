from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.ext.associationproxy import association_proxy
from datetime import datetime
from sqlalchemy.sql import expression
from sqlalchemy.ext.compiler import compiles
from sqlalchemy.types import DateTime
from sqlalchemy.dialects.postgresql import JSON


class utcnow(expression.FunctionElement):
    type = DateTime()


@compiles(utcnow, 'postgresql')
def pg_utcnow(element, compiler, **kw):
    return "TIMEZONE('utc', CURRENT_TIMESTAMP)"


db = SQLAlchemy()


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, unique=True, nullable=False)
    email = db.Column(db.String, unique=True, nullable=False)
    password = db.Column(db.String)
    roles = db.Column(db.String)
    created_at = db.Column(db.DateTime, nullable=False,
                           default=datetime.utcnow, server_default=utcnow())
    updated_at = db.Column(db.DateTime,
                           onupdate=datetime.utcnow)

    @classmethod
    def lookup(cls, email):
        return cls.query.filter_by(email=email).one_or_none()

    @classmethod
    def identify(cls, id):
        return cls.query.get(id)

    @property
    def identity(self):
        return self.id

    @property
    def rolenames(self):
        try:
            return self.roles.split(',')
        except Exception:
            return []


class AdminUser(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, unique=True, nullable=False)
    password = db.Column(db.String, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False,
                           default=datetime.utcnow, server_default=utcnow())
    updated_at = db.Column(db.DateTime,
                           onupdate=datetime.utcnow)

    @property
    def is_authenticated(self):
        return True

    @property
    def is_active(self):
        return True

    @property
    def is_anonymous(self):
        return False

    def get_id(self):
        return self.id

    # Required for administrative interface
    def __unicode__(self):
        return self.username


grant_tags = db.Table('grant_tags',
                      db.Column('grant_tag_id', db.Integer, db.ForeignKey('grant_tag.id'), primary_key=True),
                      db.Column('grant_id', db.Integer, db.ForeignKey('grants.id'), primary_key=True)
                      )


class GrantTag(db.Model):
    __tablename__ = 'grant_tag'

    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.String, nullable=False, unique=True)
    created_at = db.Column(db.DateTime, nullable=False,
                           default=datetime.utcnow, server_default=utcnow())
    updated_at = db.Column(db.DateTime,
                           onupdate=datetime.utcnow)

    def __repr__(self):
        return '<Tag {}>'.format(self.text)


class Grant(db.Model):
    __tablename__ = 'grants'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String, nullable=False)
    highlight = db.Column(db.Text)
    funds = db.Column(db.Integer, nullable=True)
    deadline = db.Column(db.Date, nullable=True)
    application_link = db.Column(db.String, nullable=False)
    category_id = db.Column(db.ForeignKey('categories.id'))
    category = db.relationship('Category',
                               backref=db.backref('grants', lazy=True))
    tags_relationship = db.relationship('GrantTag', secondary=grant_tags, lazy='subquery',
                                        backref=db.backref('grants', lazy=True))
    tags = association_proxy('tags_relationship', 'text')
    created_at = db.Column(db.DateTime, nullable=False,
                           default=datetime.utcnow, server_default=utcnow())
    updated_at = db.Column(db.DateTime,
                           onupdate=datetime.utcnow)


class Category(db.Model):
    __tablename__ = 'categories'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False, unique=True)
    created_at = db.Column(db.DateTime, nullable=False,
                           default=datetime.utcnow, server_default=utcnow())
    updated_at = db.Column(db.DateTime,
                           onupdate=datetime.utcnow)

    def __repr__(self):
        return '<Category {}>'.format(self.name)


product_categories = db.Table('product_categories',
                              db.Column('product_category_id', db.Integer, db.ForeignKey('product_category.id'),
                                        primary_key=True),
                              db.Column('product_id', db.Integer, db.ForeignKey('product.id'), primary_key=True)
                              )


class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    description = db.Column(db.String)
    highlight = db.Column(db.String)
    link = db.Column(db.String, nullable=False)
    categories_relationship = db.relationship('ProductCategory', secondary=product_categories, lazy='subquery',
                                              backref=db.backref('product', lazy=True))
    categories = association_proxy('categories_relationship', 'name')
    upvotes = db.relationship('ProductUpvote', backref='product_upvotes', lazy='joined')
    upvotes_count = db.Column(db.Integer, nullable=False, default=0, server_default="0")
    comments = db.relationship('ProductComment', backref='product_comments', lazy='joined')
    comments_count = db.Column(db.Integer, nullable=False, default=0, server_default="0")
    created_at = db.Column(db.DateTime, nullable=False,
                           default=datetime.utcnow, server_default=utcnow())
    updated_at = db.Column(db.DateTime,
                           onupdate=datetime.utcnow)
    thumbnail_bucket = db.Column(db.String)
    thumbnail_key = db.Column(db.String)
    images = db.Column(JSON)


class ProductCategory(db.Model):
    __tablename__ = 'product_category'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False, unique=True)
    created_at = db.Column(db.DateTime, nullable=False,
                           default=datetime.utcnow, server_default=utcnow())
    updated_at = db.Column(db.DateTime,
                           onupdate=datetime.utcnow)

    def __repr__(self):
        return '<Category {}>'.format(self.name)


class ProductUpvote(db.Model):
    __tablename__ = 'product_upvotes'
    __table_args__ = (
        db.UniqueConstraint('product_id', 'user_id', name='unique_product_upvote'),
    )

    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.DateTime, nullable=False,
                           default=datetime.utcnow, server_default=utcnow())
    updated_at = db.Column(db.DateTime,
                           onupdate=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"))
    user = db.relationship("User", backref=db.backref("product_upvotes", cascade="all, delete-orphan"))
    product_id = db.Column(db.Integer, db.ForeignKey("product.id"))
    product = db.relationship("Product", backref=db.backref("product_upvotes", cascade="all, delete-orphan"))


class ProductComment(db.Model):
    __tablename__ = 'product_comments'

    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.Text, nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"))
    user = db.relationship("User", lazy="joined", backref=db.backref("product_comments", cascade="all, delete-orphan"))
    product_id = db.Column(db.Integer, db.ForeignKey("product.id"))
    product = db.relationship("Product", backref=db.backref("product_comments", cascade="all, delete-orphan"))
    created_at = db.Column(db.DateTime, nullable=False,
                           default=datetime.utcnow, server_default=utcnow())
    updated_at = db.Column(db.DateTime,
                           onupdate=datetime.utcnow)
