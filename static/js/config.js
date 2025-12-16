
export const ROUTES = {
    HOME: '/',
    TRANSACTIONS: '/transactions',
    TRANSACTIONS_ADD: '/transactions/add',
    BUDGETS: '/budgets',
    BUDGETS_ADD: '/budgets/add'
};

export const API_ENDPOINTS = {
    transactions: '/api/transactions',
    budgets: '/api/budgets'
};

export const CATEGORIES = {
    income: [
        {value: 'salary', label: 'Salary'},
        {value: 'freelance', label: 'Freelance'},
        {value: 'business', label: 'Business'},
        {value: 'investments', label: 'Investments'},
        {value: 'gifts', label: 'Gifts'},
        {value: 'refund', label: 'Refund'},
        {value: 'other_income', label: 'Other Income'}
    ],
    expense: [
        {value: 'food_and_dining', label: 'Food & Dining'},
        {value: 'housing', label: 'Housing'},
        {value: 'transportation', label: 'Transportation'},
        {value: 'entertainment', label: 'Entertainment'},
        {value: 'shopping', label: 'Shopping'},
        {value: 'healthcare', label: 'Healthcare'},
        {value: 'utilities', label: 'Utilities'},
        {value: 'other_expense', label: 'Other Expense'}
    ]
};

