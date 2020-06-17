from flask import Blueprint, send_from_directory

static = Blueprint('static', __name__)


@static.route('/manifest.json')
def manifest():
    return send_from_directory('../../build', 'manifest.json')
