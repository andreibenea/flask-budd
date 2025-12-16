const form = document.querySelector(".transaction-form");
const cards = document.getElementsByClassName("row-card")

let selectedIndex = 0;
let deletionMode = false;
let deletionChoice = 0; // 0 = Yes, 1 = No

let formSelected = false;
let currentFieldIndex = -1; // -1 means no field selected
let formFields = [];


function initializeFormSelection() {
    const form = document.querySelector(".transaction-form") || document.querySelector(".budget-form");
    if (!form) return;

    formFields = Array.from(form.querySelectorAll('input, select, textarea, button[type="submit"]'));

    formSelected = true;
    form.classList.add('selected');

    if (formFields.length > 0) {
        currentFieldIndex = 0;
        formFields[0].focus();
        formFields[0].select(); // Select text if it's a text input
    }
}

function saveTransaction(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const editingId = sessionStorage.getItem('editingTransactionId');

    const transactionData = {
        amount: formData.get('amount'),
        category: formData.get('category'),
        kind: formData.get('kind'),
        notes: formData.get('notes') || '',
    };

    const url = editingId
        ? `/api/transactions/${editingId}`
        : '/api/transactions/new';
    const method = editingId ? 'PUT' : 'POST';

    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionData)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to create transaction');
            }
            return response.json();
        })
        .then(data => {
            console.log('Transaction created:', data);
            window.location.href = '/transactions';
        })
        .catch(error => {
            console.error('Error creating transaction:', error);
            alert('Failed to create transaction. Please try again.');
        });
}


function saveBudget(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const editingId = sessionStorage.getItem('editingBudgetId');

    const budgetData = {
        name: formData.get('name'),
        limit: formData.get('amount'),
        categories: formData.get('categories'),
    };

    const url = editingId
        ? `/api/budgets/${editingId}`
        : '/api/budgets/new';
    const method = editingId ? 'PUT' : 'POST';

    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(budgetData)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to create budget');
            }
            return response.json();
        })
        .then(data => {
            console.log('Budget created:', data);
            window.location.href = '/budgets';
        })
        .catch(error => {
            console.error('Error creating budget:', error);
            alert('Failed to create budget. Please try again.');
        });
}

function setupEventDelegation() {
    const container = document.querySelector(".list-container");

    container.addEventListener('click', (e) => {
        const card = e.target.closest('.row-card');
        if (!card) return;

        const cardIndex = Array.from(cards).indexOf(card);

        if (e.target.closest('button.edit')) {
            e.stopPropagation();
            selectedIndex = cardIndex;
            updateSelection();
            editSelected();
            return;
        }

        if (e.target.closest('button.delete')) {
            e.stopPropagation();
            selectedIndex = cardIndex;
            updateSelection();
            showDeletionPrompt();
            return;
        }

        if (!e.target.closest('button')) {
            selectedIndex = cardIndex;
            updateSelection();
        }
    });
}

document.addEventListener("keydown", (e) => {
    if (formSelected && currentFieldIndex >= 0) {
        if (e.key === 'Tab') {
            e.preventDefault();
            navigateFormFields(e.shiftKey ? -1 : 1);
        } else if (e.key === 'Escape') {
            e.preventDefault();
            blurCurrentField();
        }
        return;
    }

    const navKeys = ['ArrowUp', 'ArrowDown', 'k', 'j', 'Enter', 'Backspace', 'Delete', 'Escape', 'ArrowLeft', 'ArrowRight'];
    if (navKeys.includes(e.key)) {
        e.preventDefault();
    }

    if (deletionMode) {
        switch (e.key) {
            case 'ArrowLeft':
                deletionChoice = 0;
                updateDeletionPrompt();
                break;
            case 'ArrowRight':
                deletionChoice = 1;
                updateDeletionPrompt();
                break;
            case 'Enter':
                confirmDeletion();
                break;
            case 'Escape':
                hideDeletionPrompt();
                break;
        }
    } else {
        switch (e.key) {
            case 'ArrowUp':
            case 'k':
                moveUp();
                break;
            case 'ArrowDown':
            case 'j':
                moveDown();
                break;
            case 'Enter':
                editSelected();
                break;
            case 'Backspace':
            case 'Delete':
                showDeletionPrompt();
                break;
        }
    }

    if (e.key === "h") window.location = "/";
    else if (e.key === "t") window.location = "/transactions";
    else if (e.key === "n") {
        sessionStorage.removeItem('editingTransactionId');
        window.location = "/transactions/add";
    } else if (e.key === "b") window.location = "/budgets";
    else if (e.key === "g") window.location = "/budgets/add";
    else if (e.key === "Escape") {
        if (window.location.pathname === "/transactions/add") {
            window.location = "/transactions"
        } else if (window.location.pathname === "/budgets/add") {
            window.location = "/budgets"
        }
    }
});

function navigateFormFields(direction) {
    if (formFields.length === 0) return;

    currentFieldIndex += direction;

    if (currentFieldIndex < 0) {
        currentFieldIndex = formFields.length - 1;
    } else if (currentFieldIndex >= formFields.length) {
        currentFieldIndex = 0;
    }

    formFields[currentFieldIndex].focus();
    if (formFields[currentFieldIndex].select) {
        formFields[currentFieldIndex].select();
    }
}

function blurCurrentField() {
    if (currentFieldIndex >= 0 && formFields[currentFieldIndex]) {
        formFields[currentFieldIndex].blur();
        currentFieldIndex = -1;
    }
}

function setupFormClickHandlers() {
    const form = document.querySelector(".transaction-form") || document.querySelector(".budget-form");
    if (!form) return;

    formFields.forEach((field, index) => {
        field.addEventListener('focus', () => {
            currentFieldIndex = index;
        });

        field.addEventListener('blur', () => {
            // Small delay to allow Tab navigation to work
            setTimeout(() => {
                if (document.activeElement !== formFields[currentFieldIndex]) {
                    currentFieldIndex = -1;
                }
            }, 10);
        });
    });
}

function initializeSelection() {
    if (cards.length > 0) {
        cards[0].classList.add('selected');
    }
}

function updateSelection() {
    for (let card of cards) {
        card.classList.remove('selected');
    }
    if (cards[selectedIndex]) {
        cards[selectedIndex].classList.add('selected');
        cards[selectedIndex].scrollIntoView({behavior: 'smooth', block: 'center'});
    }
}

function moveUp() {
    if (selectedIndex > 0) {
        selectedIndex--;
        updateSelection();
    }
}

function moveDown() {
    if (selectedIndex < cards.length - 1) {
        selectedIndex++;
        updateSelection(cards);
    }
}

function editSelected() {
    if (cards[selectedIndex]) {
        const card = cards[selectedIndex];
        if (card.classList.contains("empty-state")) {
            if (window.location.pathname === "/transactions") {
                window.location = "/transactions/add";
            } else if (window.location.pathname === "/budgets") {
                window.location = "/budgets/add";
            }
            return;
        }

        const editButton = card.querySelector('button.edit');
        const itemId = editButton.dataset.id;

        let url, destination, storageKey;

        if (window.location.pathname === "/transactions") {
            url = `/api/transactions/${itemId}`;
            destination = "/transactions/add";
            storageKey = 'editingTransactionId';
        } else if (window.location.pathname === "/budgets") {
            url = `/api/budgets/${itemId}`;
            destination = "/budgets/add";
            storageKey = 'editingBudgetId';
        } else {
            return;
        }

        fetch(url)
            .then(response => response.json())
            .then(data => {
                sessionStorage.setItem(storageKey, itemId);
                window.location.href = destination;
            })
            .catch(error => {
                console.error('Error loading item:', error);
                alert('Failed to load item for editing');
            });
    }
}

function showDeletionPrompt() {
    if (!cards[selectedIndex]) return;

    deletionMode = true;
    deletionChoice = 0; // Default to Yes

    const prompt = document.createElement('div');
    prompt.className = 'deletion-prompt';
    prompt.innerHTML = `
        <div class="prompt-content">
            <p>Delete this transaction?</p>
            <div class="prompt-options">
                <button class="prompt-option active" data-choice="0">Yes</button>
                <button class="prompt-option" data-choice="1">No</button>
            </div>
        </div>
    `;
    const yesBtn = prompt.querySelector('[data-choice="0"]');
    const noBtn = prompt.querySelector('[data-choice="1"]');

    yesBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deletionChoice = 0;
        confirmDeletion();
    });

    noBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deletionChoice = 1;
        confirmDeletion();
    });

    cards[selectedIndex].appendChild(prompt);
}

function updateDeletionPrompt() {
    const options = document.querySelectorAll('.prompt-option');
    options.forEach((option, index) => {
        if (index === deletionChoice) {
            option.classList.add('active');
        } else {
            option.classList.remove('active');
        }
    });
}

function hideDeletionPrompt() {
    const prompt = document.querySelector('.deletion-prompt');
    if (prompt) {
        prompt.remove();
    }
    deletionMode = false;
    deletionChoice = 0;
}

function confirmDeletion() {
    if (deletionChoice === 0) { // Yes selected
        if (cards[selectedIndex]) {
            const itemId = cards[selectedIndex].querySelector("button.delete").dataset.id;
            const cardToRemove = cards[selectedIndex]
            let apiEndpoint;
            if (window.location.pathname === "/transactions") {
                apiEndpoint = `/api/transactions/${itemId}`;
            } else if (window.location.pathname === "/budgets") {
                apiEndpoint = `/api/budgets/${itemId}`;
            } else {
                console.error('Unknown page for deletion');
                hideDeletionPrompt();
                return;
            }
            fetch(apiEndpoint, {
                method: "DELETE"
            })
                .then(response => {
                        if (response.ok) {
                            cardToRemove.remove();
                            if (cards.length === 0) {
                                selectedIndex = 0;
                                window.location = "/transactions";
                            } else if (selectedIndex >= cards.length) {
                                selectedIndex = cards.length - 1;
                            }
                            updateSelection();
                            hideDeletionPrompt();
                        } else {
                            console.error('Failed to delete item');
                            hideDeletionPrompt();
                        }
                    }
                )
                .catch(error => {
                    console.error('Error:', error);
                    hideDeletionPrompt();
                });
        }
    } else {
        hideDeletionPrompt();
    }
}

async function loadTransactions() {
    const response = await fetch("/api/transactions");
    const data = await response.json();

    const container = document.querySelector(".list-container");
    if ("transactions" in data) {
        container.innerHTML = data.transactions.map(t => `
    <div class="row-card">
        <div class="card-main">
            <div class="card-category">${t.category}</div>
            <div class="card-amount ${t.kind}">${t.kind === 'income' ? '+' : '-'}${t.amount}</div>
        </div>
        <div class="card-timestamp">${t.timestamp}</div>
        <div class="card-extras">
            <div class="card-notes">${t.notes || 'No notes'}</div>
            <div class="card-actions">
                <button class="edit" data-id="${t.id}">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.293l6.293-6.293z"/>
                    </svg>
                </button>
                <button class="delete" data-id="${t.id}">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                        <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                    </svg>
                </button>
            </div>
        </div>
    </div>
`).join("");
    } else {
        container.innerHTML = `
    <div class="row-card empty-state">
        <div class="card-main">
            <div class="card-category">No transactions found! Press Enter or Return to add one!</div>
        </div>
    </div>
    `;
    }
    initializeSelection();
}

async function loadBudgets() {
    const response = await fetch("/api/budgets");
    const data = await response.json();

    const container = document.querySelector(".list-container");
    container.innerHTML = data.budgets.map(b => `
    <div class="row-card">
        <div class="card-main">
            <div class="card-name">${b.name}</div>
            <div class="card-limit">${b.limit}</div>
        </div>
        <div class="card-timestamp">${b.timestamp}</div>
        <div class="card-extras">
            <div class="card-categories">
               ${b.categories.map(cat => `<span class="category-tag">${cat.name}</span>`).join('')}
            </div>
            <div class="card-actions">
                <button class="edit" data-id="${b.id}">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.293l6.293-6.293z"/>
                    </svg>
                </button>
                <button class="delete" data-id="${b.id}">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                        <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                    </svg>
                </button>
            </div>
        </div>
    </div>
`).join("");
    initializeSelection();
}

document.addEventListener('DOMContentLoaded', function () {
    const navLinks = document.querySelectorAll('nav a[href="/transactions/add"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function () {
            sessionStorage.removeItem('editingTransactionId');
        });
    });
    const budgetLinks = document.querySelectorAll('nav a[href="/budgets/add"]');
    budgetLinks.forEach(link => {
        link.addEventListener('click', function () {
            sessionStorage.removeItem('editingBudgetId');
        });
    });
});

if (window.location.pathname === "/transactions") {
    loadTransactions();
    setupEventDelegation();
} else if (window.location.pathname === "/budgets") {
    loadBudgets();
    setupEventDelegation();
} else if (window.location.pathname === "/transactions/add") {
    const form = document.querySelector(".transaction-form");
    if (form) {
        const editingId = sessionStorage.getItem('editingTransactionId');
        const amountInput = form.querySelector('input[name="amount"]');
        if (amountInput) {
            amountInput.addEventListener('input', function (e) {
                if (this.value < 0) {
                    this.value = '';
                }
            });
            amountInput.addEventListener('paste', function (e) {
                setTimeout(() => {
                    if (this.value < 0) {
                        this.value = '';
                    }
                }, 0);
            });
        }
        if (editingId) {
            fetch(`/api/transactions/${editingId}`)
                .then(response => response.json())
                .then(data => {
                    document.getElementById('amount').value = parseFloat(data.amount.replace('$', ''));
                    document.getElementById('kind').value = data.kind;
                    document.getElementById('category').value = data.category;
                    document.getElementById('notes').value = data.notes || '';

                    form.querySelector('button[type="submit"]').textContent = 'Save Transaction';
                    initializeFormSelection();
                    setupFormClickHandlers();
                })
                .catch(error => {
                    console.error('Error loading transaction:', error);
                    sessionStorage.removeItem('editingTransactionId');
                });
        } else {
            initializeFormSelection();
            setupFormClickHandlers();
        }
        form.addEventListener('submit', saveTransaction);
    }
} else if (window.location.pathname === "/budgets/add") {
    const form = document.querySelector(".budget-form");
    if (form) {
        const editingId = sessionStorage.getItem('editingBudgetId');

        if (editingId) {
            fetch(`/api/budgets/${editingId}`)
                .then(response => response.json())
                .then(data => {
                    // Populate form fields with budget data
                    document.getElementById('name').value = data.name;
                    document.getElementById('limit').value = parseFloat(data.limit.replace('$', ''));
                    // Handle categories population based on your form structure

                    form.querySelector('button[type="submit"]').textContent = 'Save Budget';
                    initializeFormSelection();
                    setupFormClickHandlers();
                })
                .catch(error => {
                    console.error('Error loading budget:', error);
                    sessionStorage.removeItem('editingBudgetId');
                });
        } else {
            initializeFormSelection();
            setupFormClickHandlers();
        }

        form.addEventListener('submit', saveBudget);
    }
}
