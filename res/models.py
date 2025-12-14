from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Float, nullable=False)
    kind = db.Column(db.String(7), nullable=False)
    category = db.Column(db.String(25), nullable=False)
    notes = db.Column(db.String(200))
    timestamp = db.Column(db.DateTime, nullable=False, default=datetime.now)

    def __repr__(self):
        return f"<Transaction {self.id}: ${self.amount} - {self.category}>"

    def to_dict(self):
        return {
            "id": self.id,
            "amount": self.amount,
            "category": self.category,
            "kind": self.kind,
            "notes": self.notes,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None
        }


class Category(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(25), nullable=False)
    budget_id = db.Column(db.Integer, db.ForeignKey('budget.id'))

    def __repr__(self):
        return f"<Category {self.name}: budget id [{self.budget_id}]>"

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "budget_id": self.budget_id,
        }


class Budget(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.DateTime, nullable=False, default=datetime.now)
    name = db.Column(db.String(25), nullable=False)
    limit = db.Column(db.Float, nullable=False)
    categories = db.relationship('Category', backref='budget')

    def __repr__(self):
        return f"<Budget {self.name}: limit [{self.limit}], categories [{self.categories}]>"

    def to_dict(self):
        cats = []
        for category in self.categories:
            cat = category.to_dict()
            cats.append(cat)
        return {
            "id": self.id,
            "name": self.name,
            "limit": self.limit,
            "categories": cats,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None
        }
