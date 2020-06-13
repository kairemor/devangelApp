from flask_marshmallow import Marshmallow
from marshmallow import fields

from api.devangel.models import GrantTag, ProductCategory

ma = Marshmallow()


class GrantTagSchema(ma.Schema):
    class Meta:
        model = GrantTag()
        datetimeformat = '%Y-%m-%dT%H:%M:%SZ'

    id = fields.Integer(dump_only=True)
    text = fields.String(required=True)


class GrantSchema(ma.Schema):
    class Meta:
        datetimeformat = '%Y-%m-%dT%H:%M:%SZ'

    id = fields.Integer(dump_only=True)
    title = fields.String(required=True)
    application_link = fields.String(required=True)
    deadline = fields.Date(required=True)
    funds = fields.Integer(required=True)
    category = fields.Nested("CategorySchema", dump_only=True)
    category_id = fields.Integer(required=True, load_only=True)
    highlight = fields.String()
    tags = fields.Nested(GrantTagSchema, many=True, attribute="tags_relationship")


class CategorySchema(ma.Schema):
    class Meta:
        datetimeformat = '%Y-%m-%dT%H:%M:%SZ'

    id = fields.Integer(dump_only=True)
    name = fields.String(required=True)


class ProductCategorySchema(ma.Schema):
    class Meta:
        model = ProductCategory()
        datetimeformat = '%Y-%m-%dT%H:%M:%SZ'

    id = fields.Integer(dump_only=True)
    name = fields.String(required=True)


class UserSchema(ma.Schema):
    class Meta:
        datetimeformat = '%Y-%m-%dT%H:%M:%SZ'

    id = fields.Integer(dump_only=True)
    password = fields.String(load_only=True, required=True)
    username = fields.String(required=True)
    email = fields.Email(required=True)
    roles = fields.List(fields.String, dump_only=True, attribute="rolenames")


class UserLoginSchema(ma.Schema):
    class Meta:
        datetimeformat = '%Y-%m-%dT%H:%M:%SZ'

    password = fields.String(load_only=True, required=True)
    email = fields.Email(required=True)


class CommentSchema(ma.Schema):
    class Meta:
        datetimeformat = '%Y-%m-%dT%H:%M:%SZ'

    id = fields.Integer(dump_only=True)
    text = fields.String(required=True)
    user_id = fields.Integer(required=True, dump_only=True)
    product_id = fields.Integer(required=True)
    user = fields.Nested(UserSchema, attribute="user")
    created_at = fields.DateTime(dump_only=True)


class ProductSchema(ma.Schema):
    class Meta:
        datetimeformat = '%Y-%m-%dT%H:%M:%SZ'

    id = fields.Integer(dump_only=True)
    name = fields.String(required=True)
    description = fields.String(required=True)
    highlight = fields.String(required=True)
    link = fields.String(required=True)
    categories = fields.Nested(ProductCategorySchema, many=True, attribute="categories_relationship")
    comments = fields.Nested(CommentSchema, many=True, attribute="comments")
    created_at = fields.DateTime(dump_only=True)
    upvotes_count = fields.Integer(dump_only=True)
    comments_count = fields.Integer(dump_only=True)
    has_upvoted = fields.Boolean(dump_only=True)
    thumbnail_bucket = fields.String(dump_only=True)
    thumbnail_key = fields.String(dump_only=True)
    images = fields.List(fields.Dict(), dump_only=True)


class ProductCreateSchema(ma.Schema):
    class Meta:
        datetimeformat = '%Y-%m-%dT%H:%M:%SZ'

    id = fields.Integer(dump_only=True)
    name = fields.String(required=True)
    description = fields.String(required=True)
    highlight = fields.String(required=True)
    link = fields.String(required=True)
    categories = fields.List(fields.String())
    thumbnail_key = fields.String(required=True)
    product_images = fields.List(fields.Dict())


grant_schema = GrantSchema()
grants_schema = GrantSchema(many=True)

user_schema = UserSchema()
users_schema = UserSchema(many=True)
user_login_schema = UserLoginSchema()

category_schema = CategorySchema()
categories_schema = CategorySchema(many=True)

product_schema = ProductSchema()
products_schema = ProductSchema(many=True)

product_category_schema = ProductCategorySchema()
product_categories_schema = ProductCategorySchema(many=True)

comment_schema = CommentSchema()
comments_schema = CommentSchema(many=True)

product_create_schema = ProductCreateSchema()
