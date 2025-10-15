# app/models.py
from app import db
from datetime import datetime
from sqlalchemy import func

# This is a helper/association table for our many-to-many relationship
# between Completions and Users.
completion_participants = db.Table('completion_participants',
    db.Column('user_id', db.Integer, db.ForeignKey('user.id'), primary_key=True),
    db.Column('completion_id', db.Integer, db.ForeignKey('completion.id'), primary_key=True)
)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), index=True, unique=True)
    transactions = db.relationship('Transaction', backref='user', lazy='dynamic')
    is_active = db.Column(db.Boolean, default=True, nullable=False)

    @property
    def balance(self):
        # Calculate balance on the fly from the transactions table.
        # This is more reliable than storing it in a column.
        total = db.session.query(func.sum(Transaction.amount)).filter(Transaction.user_id == self.id).scalar()
        return total or 0.0

    def __repr__(self):
        return f'<User {self.name}>'

class Project(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), index=True, unique=True)
    description = db.Column(db.Text)
    value = db.Column(db.Float, nullable=False)
    priority = db.Column(db.Integer, default=100)
    status = db.Column(db.String(64), default='available') # e.g., 'available', 'completed'
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    completions = db.relationship('Completion', backref='project', lazy='dynamic')

    def __repr__(self):
        return f'<Project {self.name}>'

class Completion(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'))
    timestamp = db.Column(db.DateTime, index=True, default=datetime.utcnow)
    
    # The many-to-many relationship linking to Users
    participants = db.relationship(
        'User', secondary=completion_participants,
        backref=db.backref('completions', lazy='dynamic'), lazy='dynamic')
    
    transactions = db.relationship('Transaction', backref='completion', lazy='dynamic')

    def __repr__(self):
        return f'<Completion of Project ID {self.project_id}>'

class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    completion_id = db.Column(db.Integer, db.ForeignKey('completion.id'), nullable=True)
    amount = db.Column(db.Float, nullable=False)
    timestamp = db.Column(db.DateTime, index=True, default=datetime.utcnow)

    def __repr__(self):
        return f'<Transaction {self.amount} for User ID {self.user_id}>'