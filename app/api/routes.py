# app/api/routes.py
from flask import request, jsonify
from app import db
from app.api import bp
from app.models import User, Project
from app.models import Completion, Transaction

@bp.route('/users', methods=['POST'])
def create_user():
    data = request.get_json() or {}
    if 'name' not in data:
        return jsonify({'error': 'Missing name'}), 400
    if User.query.filter_by(name=data['name']).first():
        return jsonify({'error': 'User already exists'}), 400
    
    user = User(name=data['name'])
    db.session.add(user)
    db.session.commit()
    
    response = jsonify(
        {
            'id': user.id,
            'name': user.name,
            'balance': user.balance
        }
    )
    response.status_code = 201 # 201 = Created
    return response

@bp.route('/projects', methods=['POST'])
def create_project():
    data = request.get_json() or {}
    required_fields = ['name', 'value']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields (name, value)'}), 400

    project = Project(
        name=data['name'],
        value=data['value'],
        description=data.get('description', ''),
        priority=data.get('priority', 100)
    )
    db.session.add(project)
    db.session.commit()
    
    response = jsonify(
        {
            'id': project.id,
            'name': project.name,
            'value': project.value,
            'status': project.status
        }
    )
    response.status_code = 201
    return response

@bp.route('/users', methods=['GET'])
def get_users():
    users = User.query.filter_by(is_active=True).all() # Add this filter
    user_list = [
        {'id': user.id, 'name': user.name, 'balance': user.balance} 
        for user in users
    ]
    return jsonify(user_list)

@bp.route('/projects', methods=['GET'])
def get_projects():
    projects = Project.query.filter_by(status='available', is_active=True).order_by(Project.priority).all() # Add is_active filter
    project_list = [
        {'id': project.id, 'name': project.name, 'description': project.description, 'value': project.value, 'priority': project.priority}
        for project in projects
    ]
    return jsonify(project_list)

@bp.route('/projects/<int:project_id>/complete', methods=['POST'])
def complete_project(project_id):
    project = Project.query.get_or_404(project_id)
    if project.status != 'available':
        return jsonify({'error': 'Project is not available for completion'}), 400

    data = request.get_json() or {}
    participants_data = data.get('participants') # Expecting {'id': 1, 'shares': 2} format

    if not participants_data or not isinstance(participants_data, list) or len(participants_data) == 0:
        return jsonify({'error': 'A list of participants is required'}), 400

    # --- Start of the new share-based logic ---
    
    # 1. Calculate total shares and validate user IDs
    total_shares = 0
    participant_ids = [p.get('id') for p in participants_data]
    participants = User.query.filter(User.id.in_(participant_ids)).all()
    
    if len(participants) != len(participant_ids):
        return jsonify({'error': 'One or more user IDs are invalid'}), 400

    for p_data in participants_data:
        total_shares += p_data.get('shares', 1)

    if total_shares == 0:
        return jsonify({'error': 'Total shares cannot be zero'}), 400

    # 2. Create the Completion record
    completion = Completion(project=project)
    db.session.add(completion)
    
    # 3. Calculate value per share and create transactions
    value_per_share = project.value / total_shares
    
    # Map user objects by ID for easy lookup
    user_map = {user.id: user for user in participants}

    for p_data in participants_data:
        user_id = p_data.get('id')
        user_shares = p_data.get('shares', 1)
        user_reward = round(value_per_share * user_shares, 2)
        
        user = user_map.get(user_id)
        if user:
            completion.participants.append(user)
            transaction = Transaction(
                user=user,
                completion=completion,
                amount=user_reward
            )
            db.session.add(transaction)
    
    # 4. Update project status
    project.status = 'completed'
    
    db.session.commit()
    
    return jsonify({'message': f"Project '{project.name}' completed successfully."})

@bp.route('/users/<int:user_id>/spend', methods=['POST'])
def spend_money(user_id):
    user = User.query.get_or_404(user_id)
    data = request.get_json() or {}
    amount = data.get('amount')

    if amount is None or not isinstance(amount, (int, float)) or amount <= 0:
        return jsonify({'error': 'A valid positive amount is required'}), 400

    transaction = Transaction(
        user=user,
        amount=-abs(amount) # Ensure the amount is stored as a negative value
    )
    db.session.add(transaction)
    db.session.commit()

    return jsonify({
        'message': f'${amount} spent successfully for {user.name}.',
        'new_balance': user.balance
    })

@bp.route('/users/<int:user_id>/transactions', methods=['GET'])
def get_user_transactions(user_id):
    user = User.query.get_or_404(user_id)
    transactions = user.transactions.order_by(Transaction.timestamp.desc()).all()
    
    transaction_list = []
    for t in transactions:
        # For earnings, add the project name to the response
        description = "Spent"
        if t.completion and t.completion.project:
            description = t.completion.project.name

        transaction_list.append({
            'id': t.id,
            'amount': t.amount,
            'timestamp': t.timestamp.isoformat() + 'Z',
            'description': description
        })
        
    return jsonify(transaction_list)

@bp.route('/projects/<int:project_id>/archive', methods=['POST'])
def archive_project(project_id):
    project = Project.query.get_or_404(project_id)
    project.is_active = False # Set to inactive instead of deleting
    db.session.commit()
    return jsonify({'message': 'Project archived successfully.'})

@bp.route('/users/<int:user_id>/archive', methods=['POST'])
def archive_user(user_id):
    user = User.query.get_or_404(user_id)
    user.is_active = False # Set to inactive instead of deleting
    db.session.commit()
    return jsonify({'message': 'User archived successfully.'})