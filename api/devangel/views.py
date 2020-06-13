from flask import Blueprint, render_template

static = Blueprint('static', __name__)


@static.route('/manifest.json')
def manifest():
    return render_template('manifest.json')
