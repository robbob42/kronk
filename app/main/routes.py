from flask import render_template, request, abort
from app.main import bp
from app.models import Project, User, Transaction

@bp.route('/')
def index():
    return render_template('index.html')

@bp.route('/admin')
def admin():
    projects = Project.query.filter_by(is_active=True).order_by(Project.status.asc(), Project.priority.asc()).all()
    users = User.query.filter_by(is_active=True).order_by(User.name).all()
    transactions = Transaction.query.order_by(Transaction.timestamp.desc()).all()
    return render_template('admin.html', projects=projects, users=users, transactions=transactions)

@bp.route('/remote')
def remote():
    # Cloudflare Access sends the user's email in this header.
    user_email = request.headers.get('CF-Access-Authenticated-User-Email')
    if not user_email:
        # Abort if the header is missing (meaning they aren't logged in via Cloudflare)
        abort(401, 'Missing user identity header.')

    user = User.query.filter_by(email=user_email).first_or_404()
    
    return render_template('remote.html', user=user)