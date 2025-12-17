# 🪙 Budd - Personal Finance Tracker

**Your buddy for managing finances with a retro twist.**

Budd is a sleek, terminal-inspired personal finance tracker built with Flask and vanilla JavaScript. Track your income and expenses, set budgets, and monitor your spending habits—all through an elegant MS-DOS style interface with full keyboard navigation.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.8+-blue.svg)
![Flask](https://img.shields.io/badge/flask-3.1.2-green.svg)

---

## ✨ Features

### 💸 Transaction Management
- **Dual Transaction Types**: Track both income and expenses
- **Smart Categorization**: 
  - **Income**: Salary, Freelance, Business, Investments, Gifts, Refund, Other
  - **Expenses**: Food & Dining, Housing, Transportation, Entertainment, Shopping, Healthcare, Utilities, Other
- **Detailed Notes**: Attach contextual notes to any transaction
- **Full CRUD Operations**: Create, read, update, and delete transactions seamlessly
- **Real-time Balance**: Automatically calculated balance from all transactions

### 📊 Budget Tracking
- **Custom Budget Creation**: Name your budgets and set spending limits
- **Multi-Category Support**: Track multiple expense categories within a single budget
- **Visual Budget Cards**: Clean, organized display of budget limits and associated categories
- **Budget Validation**: Frontend and backend validation ensures at least one category per budget

### ⌨️ Full Keyboard Navigation
Navigate the entire application without touching your mouse:

**Global Shortcuts:**
- `h` → Home
- `t` → Transactions List
- `n` → New Transaction
- `b` → Budgets List
- `g` → Generate New Budget
- `Escape` → Cancel/Go Back

**List Navigation:**
- `↑` / `↓` → Navigate between cards
- `Enter` → Edit selected item
- `Delete` / `Backspace` → Delete selected item

**Form Navigation:**
- `Tab` → Move to next field
- `Shift + Tab` → Move to previous field
- `Space` / `Enter` → Toggle checkboxes and activate dropdowns
- `Arrow Keys` → Navigate within dropdowns and checkbox groups
- `Escape` → Exit form field focus

### 🎨 Retro Aesthetic
- **Terminal-Inspired Interface**: Dark theme with MS-DOS styling
- **Custom Dropdowns**: Keyboard-accessible custom select components
- **Orange & Blue Accents**: Eye-catching color scheme with glowing focus states
- **Smooth Animations**: Polished transitions and hover effects
- **Responsive Cards**: Transaction and budget cards with intuitive layouts

---

## 🚀 Getting Started

### Prerequisites
- Python 3.8 or higher
- pip (Python package installer)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/flask-budd.git
   cd flask-budd
   ```

2. **Create a virtual environment**
   ```bash
   python -m venv .venv
   
   # On macOS/Linux:
   source .venv/bin/activate
   
   # On Windows:
   .venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Initialize the database**
   ```bash
   python app.py
   ```
   The database will be automatically created on first run.

5. **Run the application**
   ```bash
   flask run
   # or
   python app.py
   ```

6. **Open your browser**
   Navigate to `http://127.0.0.1:5000`

---

## 📖 Usage Guide

### Adding a Transaction

**Using Keyboard:**
1. Press `n` from anywhere in the app
2. Enter the amount
3. Press `Tab` → Select transaction type (Income/Expense)
4. Press `Tab` → Choose a category from the dropdown
5. Press `Tab` → Add optional notes
6. Press `Tab` → Submit with `Enter`

**Using Mouse:**
1. Click "New Transaction" or press `n`
2. Fill in the form fields
3. Click "Add Transaction"

### Creating a Budget

**Using Keyboard:**
1. Press `g` from anywhere
2. Enter budget name
3. Press `Tab` → Enter spending limit
4. Press `Tab` → Use `Space` to select categories
5. Press `Tab` → Submit with `Enter`

**Using Mouse:**
1. Click "Generate Budget" or press `g`
2. Fill in name and limit
3. Check one or more categories
4. Click "Add Budget"

### Managing Your Data

- **Navigate Lists**: Use `↑` and `↓` arrow keys to select items
- **Edit**: Select an item and press `Enter`, or click the edit icon
- **Delete**: Select an item and press `Delete`/`Backspace`, then confirm
- **Quick Access**: Use keyboard shortcuts for instant navigation

---

## 🛠️ Technology Stack

### Backend
- **Flask 3.1.2** - Lightweight Python web framework
- **SQLAlchemy 2.0.45** - SQL toolkit and ORM
- **SQLite** - Embedded database (file: `budd.db`)

### Frontend
- **Vanilla JavaScript (ES6 Modules)** - No frameworks, pure JS
- **HTML5 & CSS3** - Semantic markup and custom styling
- **Custom Components** - Hand-built dropdowns and form controls

### Design Philosophy
- **Keyboard-First Navigation** - Efficiency through shortcuts
- **Terminal Aesthetic** - Nostalgic MS-DOS inspired theme
- **Modular JavaScript** - Clean separation with ES6 modules
- **RESTful API** - JSON endpoints for all operations

---

## 📁 Project Structure

```
flask-budd/
├── app.py                 # Flask application and API routes
├── requirements.txt       # Python dependencies
├── res/
│   ├── __init__.py
│   └── models.py         # SQLAlchemy models (Transaction, Budget, Category)
├── static/
│   ├── css/
│   │   └── style.css     # Terminal-inspired styles
│   ├── js/
│   │   ├── app.js        # Main application logic
│   │   └── config.js     # Routes, endpoints, and categories
│   └── favicon.svg       # Site icon
└── templates/
    ├── base.html         # Base template with navigation
    ├── home.html         # Landing page
    ├── transactions.html # Transaction list view
    ├── transaction.html  # Transaction form (add/edit)
    ├── budgets.html      # Budget list view
    └── budget.html       # Budget form (add/edit)
```

---

## 🎯 API Endpoints

### Transactions
- `GET /api/transactions` - List all transactions
- `POST /api/transactions/new` - Create transaction
- `GET /api/transactions/:id` - Get transaction details
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction
- `GET /api/balance` - Get current balance

### Budgets
- `GET /api/budgets` - List all budgets
- `POST /api/budgets/new` - Create budget
- `GET /api/budgets/:id` - Get budget details
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget

---

## 🔮 Roadmap

- [ ] **Dashboard Analytics** - Visual charts and spending insights
- [ ] **Budget Progress Tracking** - Real-time budget vs. actual spending
- [ ] **Date Range Filtering** - Filter transactions by custom date ranges
- [ ] **Export Functionality** - Export data to CSV/PDF
- [ ] **Recurring Transactions** - Set up automatic recurring entries
- [ ] **Multi-Currency Support** - Handle multiple currencies
- [ ] **Search & Advanced Filters** - Search notes, filter by category
- [ ] **Mobile Responsive Design** - Optimize for mobile devices
- [ ] **Dark/Light Theme Toggle** - User preference for color scheme
- [ ] **Tags System** - Custom tags for transactions

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 💡 Why "Budd"?

Because everyone needs a buddy to help manage their finances. Budd keeps track of your money so you can focus on what truly matters—living your life.

---

## 🙏 Acknowledgments

- Inspired by classic terminal interfaces and MS-DOS aesthetics
- Built as a learning project to master Flask and vanilla JavaScript
- Special thanks to the open-source community

---

**Made with ☕ and ⌨️ by [Your Name]**

[⬆ back to top](#-budd---personal-finance-tracker)