import flask_praetorian
from flask import Blueprint, request, current_app
import time
import shortuuid
import boto3
import functools
from .models import User, db, Grant, Category, Product, ProductUpvote, ProductComment, ProductCategory
from flask_restful import Resource, Api
from .schema import grants_schema, grant_schema, user_schema, categories_schema, product_schema, \
    product_categories_schema, products_schema, comment_schema, comments_schema, product_create_schema, \
    user_login_schema
from .users import guard

bp = Blueprint('api_bp', __name__, url_prefix='/api')
api = Api(bp)


def auth_optional(method):
    """
    Decorator to check if a token exists and then adds an argument
    to the wrapped function called 'user'.
    User is either the database user object or None, if no token was supplied.
    """

    @functools.wraps(method)
    def wrapper(*args, **kwargs):
        try:
            token = guard.read_token_from_header()
            flask_praetorian.decorators._verify_and_add_jwt()
            user = flask_praetorian.current_user()
        except Exception as e:
            user = None
        return method(*args, user=user, **kwargs)

    return wrapper


def generate_s3_upload_request():
    s3 = boto3.client('s3')
    key = shortuuid.uuid() + '-${filename}'
    bucket_name = current_app.config["S3_BUCKET_NAME"]
    response = s3.generate_presigned_post(bucket_name, key,
                                          Conditions=[{"acl": "public-read"},
                                                      ["content-length-range", 10, 2000000],
                                                      ["starts-with", "$Content-Type", ""]],
                                          Fields={"acl": "public-read"})
    return response


class GrantListResource(Resource):
    def get(self):
        page = request.args.get('page', 1, type=int)
        category = request.args.get('category', None, type=int)
        items_per_page = 2
        all_grants = Grant.query.order_by(Grant.created_at.desc())
        if category:
            all_grants = all_grants.filter_by(category_id=category)
        all_grants = all_grants.paginate(page, items_per_page)
        grants_count = all_grants.total
        all_grants = all_grants.items
        all_categories = Category.query.all()
        return {"grants": grants_schema.dump(all_grants), "categories": categories_schema.dump(all_categories),
                "total_grants": grants_count}

    def post(self):
        json_data = request.get_json(force=True, silent=True)
        if not json_data:
            return {'message': 'No input data provided'}, 400
        errors = grant_schema.validate(json_data)
        if errors:
            return {"status": "error", "data": errors}, 422
        data = grant_schema.load(json_data)
        new_grant = Grant(
            title=data['title'],
            deadline=data['deadline'],
            application_link=data['application_link'],
            funds=data['funds'],
            highlight=data['highlight'],
            category_id=data['category_id']
        )
        db.session.add(new_grant)
        db.session.commit()
        return grant_schema.dump(new_grant)


class UserRegisterResource(Resource):
    def post(self):
        json_data = request.get_json(force=True, silent=True)
        if not json_data:
            return {'message': 'No input data provided'}, 400
        errors = user_schema.validate(json_data)
        if errors:
            return {"status": "error", "data": errors}, 422
        existing_username = User.query.filter_by(username=json_data['username']).first()
        existing_email = User.query.filter_by(email=json_data['email']).first()
        errors = []
        if existing_username:
            errors.append("DuplicateUsernameError")
        if existing_email:
            errors.append("DuplicateEmailError")
        if existing_email or existing_email:
            return {"status": "error", "error": errors}, 401
        new_user = User(
            username=json_data['username'],
            email=json_data['email'],
            password=guard.hash_password(json_data['password'])
        )
        db.session.add(new_user)
        db.session.commit()
        return {'access_token': guard.encode_jwt_token(new_user), 'user_details': user_schema.dump(new_user)}, 200


class UserLoginResource(Resource):
    def post(self):
        json_data = request.get_json(force=True, silent=True)
        if not json_data:
            return {'message': 'No input data provided'}, 400
        errors = user_login_schema.validate(json_data)
        if errors:
            return {"status": "error", "data": errors}, 422
        user = guard.authenticate(username=json_data['email'], password=json_data['password'])
        return {'access_token': guard.encode_jwt_token(user), 'user_details': user_schema.dump(user)}, 200


class UserTokenRefreshResource(Resource):
    def post(self):
        old_token = guard.read_token_from_header()
        if not old_token:
            return {'message': 'No input data provided'}, 400
        new_token = guard.refresh_jwt_token(old_token)
        return {'access_token': new_token}, 200


class UserProfileResource(Resource):
    @flask_praetorian.auth_required
    def post(self):
        return {'user_details': user_schema.dump(flask_praetorian.current_user())}


class GrantResource(Resource):
    @flask_praetorian.auth_required
    def get(self, grant_id):
        grant = Grant.query.get_or_404(grant_id)
        return grant_schema.dump(grant)


class ProductResource(Resource):
    def get(self, product_id):
        product = Product.query.get_or_404(product_id)
        related_products = Product.query.filter(Product.categories.in_(product.categories)).order_by(
            Product.upvotes_count.desc()).limit(3)
        related_products = related_products.all()
        return {"product": product_schema.dump(product), "related_products": products_schema.dump(related_products)}


class ProductListResource(Resource):
    @auth_optional
    def get(self, user):
        page = request.args.get('page', 1, type=int)
        items_per_page = 15
        all_products = Product.query
        all_products = all_products.order_by(Product.created_at.desc()).paginate(page, items_per_page).items
        all_categories = ProductCategory.query.all()
        current_user = user
        product_ids = [product.id for product in all_products]
        if current_user:
            user_product_upvotes = ProductUpvote.query.filter(ProductUpvote.user_id == current_user.id,
                                                              ProductUpvote.product_id.in_(product_ids)).all()
            upvoted_product_ids = [upvote.product_id for upvote in user_product_upvotes]
            for product in all_products:
                if product.id in upvoted_product_ids:
                    product.has_upvoted = True
        return {"products": products_schema.dump(all_products),
                "categories": product_categories_schema.dump(all_categories)}

    @flask_praetorian.roles_required('admin')
    def post(self):
        json_data = request.get_json(force=True, silent=True)
        if not json_data:
            return {'message': 'No input data provided'}, 400
        errors = product_create_schema.validate(json_data)
        if errors:
            return {"status": "error", "data": errors}, 422
        data = product_create_schema.load(json_data)

        categories = []

        if 'categories' in data:
            categories = data['categories']

        bucket_name = current_app.config["S3_BUCKET_NAME"]

        product = Product(
            name=data['name'],
            highlight=data['highlight'],
            description=data['description'],
            link=data['link'],
            thumbnail_key=data['thumbnail_key'],
            thumbnail_bucket=bucket_name,
            images=data['product_images']
        )

        for category in categories:
            get_category = ProductCategory.query.filter_by(name=category).first()
            if get_category:
                product.categories_relationship.append(get_category)

        db.session.add(product)
        db.session.commit()

        return {"product": product_schema.dump(product)}


class ProductUpvoteResource(Resource):
    @flask_praetorian.auth_required
    def post(self, product_id):
        product = Product.query.get_or_404(product_id)
        existing_upvote = ProductUpvote.query.filter_by(product_id=product.id,
                                                        user_id=flask_praetorian.current_user().id).first()
        if existing_upvote:
            product.upvotes_count = Product.upvotes_count - 1
            db.session.delete(existing_upvote)
        else:
            product_upvote = ProductUpvote(product_id=product.id, user_id=flask_praetorian.current_user().id)
            product.upvotes_count = Product.upvotes_count + 1
            db.session.add(product_upvote)
        db.session.commit()
        return {"hello": "world"}


@bp.route('/time')
def get_current_time():
    return {'time': time.time()}


@bp.route('/s3')
def get_s3_url():
    response = generate_s3_upload_request()
    return response


class ProductCommentResource(Resource):
    @flask_praetorian.auth_required
    def post(self, product_id):
        json_data = request.get_json(force=True, silent=True)
        if not json_data:
            return {'message': 'No input data provided'}, 400
        errors = comment_schema.validate(json_data)
        if errors:
            return {"status": "error", "data": errors}, 422
        data = comment_schema.load(json_data)
        product = Product.query.get_or_404(product_id)
        product_comment = ProductComment(product_id=product.id, user_id=flask_praetorian.current_user().id,
                                         text=data["text"])
        product.comments_count = Product.comments_count + 1
        db.session.add(product_comment)
        db.session.commit()
        return {"comment": comment_schema.dump(product_comment)}


class S3UploadResource(Resource):
    @flask_praetorian.auth_required
    def post(self):
        s3_request = generate_s3_upload_request()
        return {"request": s3_request}


# Add API endpoints
api.add_resource(GrantListResource, '/grants')
api.add_resource(GrantResource, '/grants/<int:grant_id>')
api.add_resource(UserRegisterResource, '/users/register')
api.add_resource(UserLoginResource, '/users/login')
api.add_resource(UserTokenRefreshResource, '/users/refresh')
api.add_resource(UserProfileResource, '/users/profile')
api.add_resource(ProductResource, '/products/<int:product_id>')
api.add_resource(ProductListResource, '/products')
api.add_resource(ProductUpvoteResource, '/products/<int:product_id>/upvote')
api.add_resource(ProductCommentResource, '/products/<int:product_id>/comment')
api.add_resource(S3UploadResource, '/product-images-upload-request')
