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
    transactions = Transaction.query.all()
    return {'transactions': [t.to_dict() for t in transactions]}


@app.route("/api/transactions/new", methods=["POST"])
def api_transactions_new():
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


@app.route("/api/budgets", methods=["GET"])
def api_budgets():
    budgets = Budget.query.all()
    return {
        'budgets': [budget.to_dict() for budget in budgets]
    }


@app.route("/api/budgets/new", methods=["POST"])
def api_budget_new():
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


if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run()
