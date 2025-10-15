# kronk.py
from app import create_app, db
from app.models import User, Project, Completion, Transaction

app = create_app()

# This makes objects available in the 'flask shell' for easy testing
@app.shell_context_processor
def make_shell_context():
    return {'db': db, 'User': User, 'Project': Project, 
            'Completion': Completion, 'Transaction': Transaction}