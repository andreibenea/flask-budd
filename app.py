from flask import Flask, render_template, request, redirect, url_for, flash
from res.models import Transaction, Budget, Category, db

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///budd.db"
app.config["SECRET_KEY"] = "dev-secret-key"
db.init_app(app)


# ===================================================================
# RENDER TEMPLATES
# ===================================================================
@app.route("/")
def homepage():
    return render_template("home.html")


@app.route("/transactions")
def transactions_page():
    return render_template("transactions.html")


@app.route("/budgets")
def budgets_page():
    return render_template("budgets.html")


@app.route("/transactions/add")
def add_transaction_page():
    return render_template("create_transaction.html")


@app.route("/budgets/add")
def add_budget_page():
    return render_template("create_budget.html")


@app.route("/transaction/<int:transaction_id>")
def transaction_page(transaction_id):
    transaction = Transaction.query.get(transaction_id)
    return render_template("transaction.html", transaction=transaction)


@app.route("/budget/<int:budget_id>")
def budget_page(budget_id):
    budget = Budget.query.get(budget_id)
    return render_template("budget.html", budget=budget)


# ===================================================================
# API ENDPOINTS
# ===================================================================

@app.route("/api/transactions", methods=["GET"])
def api_transactions():
    """Get all transactions"""
    transactions = Transaction.query.all()
    return {'transactions': [t.to_dict() for t in transactions]}


@app.route("/api/transactions/new", methods=["POST"])
def api_transactions_new():
    """Create a new transaction"""
    amount = request.form.get("amount")
    category = request.form.get("category")
    kind = request.form.get("kind")
    notes = request.form.get("notes")
    new_transaction = Transaction()
    new_transaction.amount = amount
    new_transaction.category = category
    new_transaction.kind = kind
    new_transaction.notes = notes
    db.session.add(new_transaction)
    db.session.commit()
    transactions = Transaction.query.all()
    return {'transactions': [t.to_dict() for t in transactions]}


@app.route("/api/transactions/<int:transaction_id>", methods=["GET", "PUT", "DELETE"])
def api_transaction_details(transaction_id):
    """Get, update or delete a transaction"""
    transaction = Transaction.query.get(transaction_id)
    if transaction is None:
        return 404
    if request.method == 'GET':
        return transaction.to_dict()
    elif request.method == 'DELETE':
        db.session.delete(transaction)
        db.session.commit()
        return api_transactions()
    elif request.method == 'PUT':
        transaction.amount = request.form.get("amount")
        transaction.category = request.form.get("category")
        transaction.kind = request.form.get("kind")
        transaction.notes = request.form.get("notes")
        db.session.add(transaction)
        db.session.commit()
        return api_transactions()


@app.route("/api/budgets", methods=["GET"])
def api_budgets():
    """Get all budgets"""
    budgets = Budget.query.all()
    return {
        'budgets': [budget.to_dict() for budget in budgets]
    }


@app.route("/api/budgets/new", methods=["POST"])
def api_budget_new():
    """Create a new budget"""
    name = request.form.get("name")
    limit = request.form.get("limit")
    categories_string = request.form.get("categories")
    new_budget = Budget()
    new_budget.name = name
    new_budget.limit = limit
    for cat_name in categories_string.split(","):
        category = Category()
        category.name = cat_name.strip()
        new_budget.categories.append(category)
    db.session.add(new_budget)
    db.session.commit()
    budgets = Budget.query.all()
    return {'budgets': [b.to_dict() for b in budgets]}


@app.route("/api/budgets/<int:budget_id>", methods=["GET", "PUT", "DELETE"])
def api_budget_details(budget_id):
    """Get, update or delete a budget"""
    budget = Budget.query.get(budget_id)
    if budget is None:
        return 404
    if request.method == 'GET':
        return budget.to_dict()
    elif request.method == 'DELETE':
        db.session.delete(budget)
        db.session.commit()
        return api_budgets()
    elif request.method == 'PUT':
        budget.name = request.form.get("name")
        budget.limit = request.form.get("limit")
        budget.categories = []
        for cat in request.form.get("categories").split(","):
            category = Category()
            category.name = cat.strip()
            budget.categories.append(category)

        db.session.add(budget)
        db.session.commit()
        return budget.to_dict()


if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run()
