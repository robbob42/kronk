from flask import render_template
from app.main import bp
from app.models import Project, User

@bp.route('/')
def index():
    return render_template('index.html')

@bp.route('/admin')
def admin():
    projects = Project.query.filter_by(is_active=True).order_by(Project.priority).all()
    users = User.query.filter_by(is_active=True).order_by(User.name).all()
    return render_template('admin.html', projects=projects, users=users)