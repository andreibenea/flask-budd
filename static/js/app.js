// Imports
import {CATEGORIES, ROUTES, API_ENDPOINTS} from "./config.js";


// State Trackers
let selectedIndex = 0;
let deletionMode = false;
let deletionChoice = 0; // 0 = Yes, 1 = No

let formSelected = false;
let currentFieldIndex = -1; // -1 means no field selected
let formFields = [];


// Main initialization
document.addEventListener('DOMContentLoaded', async function () {
    const path = window.location.pathname;

    // Init rules on link navigation
    setupNavLinkHandlers();

    // Initialize global navigation shortcuts
    setupGlobalKeyboardShortcuts();

    // Route to appropriate page initializer
    await initializePage(path);
});


// Page controller
async function initializePage(path) {
    switch (path) {
        case ROUTES.TRANSACTIONS:
            await initTransactionsListPage();
            break;
        case ROUTES.TRANSACTIONS_ADD:
            await initTransactionFormPage();
            break;
        case ROUTES.BUDGETS:
            await initBudgetsListPage();
            break;
        case ROUTES.BUDGETS_ADD:
            await initBudgetFormPage();
            break;
        case ROUTES.HOME:
            initHomePage();
            break;
    }
}

function initHomePage() {
    // Load and display summary stats
    // loadDashboardSummary();

    // Maybe show recent transactions
    // loadRecentActivity();

    // Charts or graphs
    // initializeCharts();
}

async function initTransactionsListPage() {
    // Load and display transactions from API
    await loadTransactions()
    // Set up card selection system (keyboard navigation)
    setupCardListNavigation();
    // Set up click handlers for edit/delete buttons
    setupEventDelegation();
    // Initialize deletion prompt system
    initializeDeletionPrompt();
}


async function initTransactionFormPage() {
    const form = document.querySelector(".transaction-form");
    if (!form) {
        console.error('Transaction form not found');
        return;
    }
    // Set up transaction-specific form logic
    initTransactionFormSpecifics();
    // Set up form field navigation (Tab, Escape)
    initializeFormSelection(form);
    setupFormClickHandlers(form);
    setupFormKeyboardHandlers();
    // Handle amount input validation (no negative numbers)
    setupAmountValidation(form);
    // Check if editing an existing transaction
    const editingId = sessionStorage.getItem('editingTransactionId');

    if (editingId) {
        // Load existing transaction data into form
        try {
            await loadTransactionForEditing(editingId, form);
        } catch (error) {
            console.error('Failed to load transaction for editing:', error);
            // Clear the invalid ID and show alert
            sessionStorage.removeItem('editingTransactionId');
            alert('Transaction not found. It may have been deleted.');
            // Redirect to list
            // window.location.href = ROUTES.TRANSACTIONS;
        }
    }
    form.addEventListener('submit', saveTransaction);
}

async function initBudgetsListPage() {
    // 1. Load and display budgets from API
    await loadBudgets();
    // 2. Set up card selection system (keyboard navigation)
    setupCardListNavigation();
    // 3. Set up click handlers for edit/delete buttons
    setupEventDelegation();
    // 4. Initialize deletion prompt system
    initializeDeletionPrompt();
}

async function initBudgetFormPage() {
    const form = document.querySelector(".budget-form");
    if (!form) {
        console.error('Budget form not found');
        return;
    }

    initializeFormSelection(form);
    setupFormClickHandlers(form);
    setupFormKeyboardHandlers();
    initBudgetFormSpecifics();
    setupAmountValidation(form);
    setupCheckboxNavigation(form);


    const editingId = sessionStorage.getItem('editingBudgetId');

    if (editingId) {
        try {
            // Load existing budget data into form
            await loadBudgetForEditing(editingId, form);
        } catch (error) {
            console.error('Failed to initialize budget form with editing data:', error);
        }
    }

    form.addEventListener('submit', saveBudget);
}

function initBudgetFormSpecifics() {
    console.log('Budget form initialized');
}

async function loadBudgetForEditing(editingId, form) {
    const response = await fetch(`${API_ENDPOINTS.budgets}/${editingId}`);

    if (!response.ok) {
        throw new Error('Failed to fetch budget');
    }

    const data = await response.json();

    const nameInput = document.getElementById('name');
    if (nameInput) nameInput.value = data.name || '';

    const limitInput = document.getElementById('amount');
    if (limitInput && data.limit) {
        limitInput.value = parseFloat(data.limit.replace('$', ''));
    }

    // Check the appropriate category checkboxes
    if (data.categories && Array.isArray(data.categories)) {
        const categoryNames = data.categories.map(cat => cat.name.toLowerCase().replace(/ & /g, '_and_').replace(/ /g, '_'));

        const checkboxes = form.querySelectorAll('input[name="categories"]');
        checkboxes.forEach(checkbox => {
            const checkboxLabel = checkbox.nextElementSibling.textContent.trim().toLowerCase().replace(/ & /g, '_and_').replace(/ /g, '_');
            if (categoryNames.includes(checkboxLabel)) {
                checkbox.checked = true;
            }
        });
    }

    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) submitButton.textContent = 'Save Budget';
}

function setupGlobalKeyboardShortcuts() {
    document.addEventListener("keydown", (e) => {
        if (formSelected && currentFieldIndex >= 0) return;
        if (e.key === "h") window.location = ROUTES.HOME;
        else if (e.key === "t") {
            window.location = ROUTES.TRANSACTIONS;
        } else if (e.key === "n") {
            sessionStorage.removeItem('editingTransactionId');
            window.location = ROUTES.TRANSACTIONS_ADD;
        } else if (e.key === "b") {
            window.location = ROUTES.BUDGETS;
        } else if (e.key === "g") {
            sessionStorage.removeItem('editingBudgetId');
            window.location = ROUTES.BUDGETS_ADD;
        } else if (e.key === "Escape") {
            if (window.location.pathname === ROUTES.TRANSACTIONS_ADD) {
                window.location = ROUTES.TRANSACTIONS;
            } else if (window.location.pathname === ROUTES.BUDGETS_ADD) {
                window.location = ROUTES.BUDGETS;
            }
        }
    });
}

function setupNavLinkHandlers() {
    // Clear transaction editing ID when clicking "New Transaction"
    const newTransactionLinks = document.querySelectorAll('a[href="/transactions/add"]');
    newTransactionLinks.forEach(link => {
        link.addEventListener('click', function () {
            sessionStorage.removeItem('editingTransactionId');
        });
    });

    // Clear budget editing ID when clicking "New Budget"
    const newBudgetLinks = document.querySelectorAll('a[href="/budgets/add"]');
    newBudgetLinks.forEach(link => {
        link.addEventListener('click', function () {
            sessionStorage.removeItem('editingBudgetId');
        });
    });
}

function setupCardListNavigation() {
    const cards = document.getElementsByClassName("row-card");

    if (cards.length === 0) {
        console.warn('No cards found for navigation setup');
        return;
    }

    // Initialize selection on first card
    initializeSelection(cards);

    // Set up keyboard navigation
    document.addEventListener("keydown", (e) => {
        if (formSelected && currentFieldIndex >= 0) return;
        if (deletionMode) return;

        const navKeys = ['ArrowUp', 'ArrowDown', 'Enter', 'Backspace', 'Delete'];
        if (!navKeys.includes(e.key)) return;

        e.preventDefault();

        switch (e.key) {
            case 'ArrowUp':
                moveUp(cards);
                break;
            case 'ArrowDown':
                moveDown(cards);
                break;
            case 'Enter':
                editSelected(cards);
                break;
            case 'Backspace':
            case 'Delete':
                showDeletionPrompt(cards);
                break;
        }
    });
}

function setupCheckboxNavigation(form) {
    const checkboxes = Array.from(form.querySelectorAll('input[type="checkbox"][name="categories"]'));

    if (checkboxes.length === 0) return;

    checkboxes.forEach((checkbox, index) => {
        const label = checkbox.closest('.checkbox-item');

        // Make checkbox labels focusable
        label.setAttribute('tabindex', '0');

        // Handle keyboard navigation on checkbox labels
        label.addEventListener('keydown', (e) => {
            if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                checkbox.checked = !checkbox.checked;
            } else if (e.key === 'Tab') {
                // Let Tab work naturally
                return;
            } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                e.preventDefault();
                const nextIndex = (index + 1) % checkboxes.length;
                checkboxes[nextIndex].closest('.checkbox-item').focus();
            } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                e.preventDefault();
                const prevIndex = (index - 1 + checkboxes.length) % checkboxes.length;
                checkboxes[prevIndex].closest('.checkbox-item').focus();
            }
        });

        // Handle clicks on the label to toggle checkbox
        label.addEventListener('click', (e) => {
            if (e.target !== checkbox) {
                checkbox.checked = !checkbox.checked;
            }
        });
    });
}

function initializeFormSelection(form) {
    if (!form) return;

    const customSelects = Array.from(form.querySelectorAll('.custom-select'));
    const regularInputs = Array.from(form.querySelectorAll('input[type="text"], input[type="number"], textarea, button[type="submit"]'));
    const checkboxLabels = Array.from(form.querySelectorAll('.checkbox-item'));
    const submitButton = Array.from(form.querySelectorAll('button[type="submit"]'));


    formFields = [...customSelects, ...regularInputs, ...checkboxLabels, ...submitButton].sort((a, b) => {
        return (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) ? -1 : 1;
    });

    formSelected = true;
    form.classList.add('selected');

    if (formFields.length > 0) {
        currentFieldIndex = 0;
        formFields[0].focus();
        if (formFields[0].select) {
            formFields[0].select();
        }
    }
}

function initializeDeletionPrompt() {
    document.addEventListener("keydown", (e) => {
        if (!deletionMode) return;

        e.preventDefault();

        switch (e.key) {
            case 'ArrowLeft':
                deletionChoice = 0; // Select "Yes"
                updateDeletionPrompt();
                break;
            case 'ArrowRight':
                deletionChoice = 1; // Select "No"
                updateDeletionPrompt();
                break;
            case 'Enter':
                confirmDeletion();
                break;
            case 'Escape':
                hideDeletionPrompt();
                break;
        }
    });
}

function initTransactionFormSpecifics() {
    const kindSelectElement = document.getElementById('kind-select');
    const categoryCard = document.getElementById('category-card');
    const categorySelectElement = document.getElementById('category-select');

    if (!kindSelectElement || !categoryCard || !categorySelectElement) return;

    // Initialize both custom selects
    const kindSelect = initCustomSelect(kindSelectElement, [
        {value: 'expense', label: 'Expense'},
        {value: 'income', label: 'Income'}
    ]);
    console.log(kindSelect)

    const categorySelect = initCustomSelect(categorySelectElement);

    // Disable category card initially
    categoryCard.classList.add('disabled');

    // Track the previous kind to detect changes
    let previousKind = document.getElementById('kind').value;

    // Listen for kind changes
    const kindHiddenInput = document.getElementById('kind');
    const observer = new MutationObserver(() => {
        const selectedType = kindHiddenInput.value;
        console.log('🔔 Input event fired! Selected type:', selectedType);

        // If kind changed (not just initial load), clear the category
        if (previousKind && previousKind !== selectedType) {
            const categoryHiddenInput = document.getElementById('category');
            categoryHiddenInput.value = '';
            const categorySelected = categorySelectElement.querySelector('.select-selected');
            if (categorySelected) {
                categorySelected.textContent = 'Select category...';
            }
        }
        previousKind = selectedType;

        if (selectedType && CATEGORIES[selectedType]) {
            categorySelect.setOptions(CATEGORIES[selectedType]);
            categoryCard.classList.remove('disabled');
        } else {
            categorySelect.clear();
            categoryCard.classList.add('disabled');
        }
    });

    observer.observe(kindHiddenInput, {attributes: true, attributeFilter: ['value']});

    // Also trigger on direct input events
    kindHiddenInput.addEventListener('input', () => {
        const selectedType = kindHiddenInput.value;

        // If kind changed, clear the category
        if (previousKind && previousKind !== selectedType) {
            const categoryHiddenInput = document.getElementById('category');
            categoryHiddenInput.value = '';
            const categorySelected = categorySelectElement.querySelector('.select-selected');
            if (categorySelected) {
                categorySelected.textContent = 'Select category...';
            }
        }
        previousKind = selectedType;

        if (selectedType && CATEGORIES[selectedType]) {
            categorySelect.setOptions(CATEGORIES[selectedType]);
            categoryCard.classList.remove('disabled');
        } else {
            categorySelect.clear();
            categoryCard.classList.add('disabled');
        }
    });
}


function setupAmountValidation(form) {
    const amountInput = form.querySelector('input[name="amount"]');
    if (!amountInput) return;

    // Prevent negative numbers on input
    amountInput.addEventListener('input', function () {
        if (this.value < 0) {
            this.value = '';
        }
    });

    // Prevent negative numbers on paste
    amountInput.addEventListener('paste', function () {
        setTimeout(() => {
            if (this.value < 0) {
                this.value = '';
            }
        }, 0);
    });
}

function saveTransaction(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const editingId = sessionStorage.getItem('editingTransactionId');

    // Convert category value to label
    const categoryValue = formData.get('category');
    const kind = formData.get('kind');

    console.log('==================');
    console.log('categoryValue:', categoryValue);
    console.log('kind:', kind);
    console.log('CATEGORIES:', CATEGORIES);
    console.log('CATEGORIES[kind]:', CATEGORIES[kind]);
    console.log('==================');

    let categoryLabel = categoryValue;

    if (kind && CATEGORIES[kind]) {
        console.log('✅ Inside if condition');
        const found = CATEGORIES[kind].find(cat => {
            console.log(`Comparing cat.value "${cat.value}" with categoryValue "${categoryValue}"`);
            return cat.value === categoryValue;
        });
        console.log('Found:', found);
        if (found) {
            categoryLabel = found.label;
            console.log('Set categoryLabel to:', categoryLabel);
        }
    } else {
        console.log('❌ If condition NOT met');
        console.log('kind exists?', !!kind);
        console.log('CATEGORIES[kind] exists?', !!CATEGORIES[kind]);
    }

    console.log('Final categoryLabel:', categoryLabel);

    const transactionData = {
        amount: formData.get('amount'),
        category: categoryLabel,
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
            console.log(JSON.stringify(transactionData))
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

async function loadTransactionForEditing(editingId, form) {
    const response = await fetch(`${API_ENDPOINTS.transactions}/${editingId}`);

    if (!response.ok) {
        throw new Error('Failed to fetch transaction');
    }

    const data = await response.json();

    document.getElementById('amount').value = parseFloat(data.amount.replace('$', ''));
    document.getElementById('notes').value = data.notes || '';

    // Set kind first, which will trigger category options to populate
    const kindHiddenInput = document.getElementById('kind');
    kindHiddenInput.value = data.kind;

    // Update the kind select display
    const kindSelectElement = document.getElementById('kind-select');
    if (kindSelectElement) {
        const kindSelected = kindSelectElement.querySelector('.select-selected');
        const kindItems = kindSelectElement.querySelector('.select-items');
        const kindOption = kindItems.querySelector(`[data-value="${data.kind}"]`);
        if (kindSelected && kindOption) {
            kindSelected.textContent = kindOption.textContent;
            kindItems.querySelectorAll('div').forEach(opt => {
                opt.classList.toggle('same-as-selected', opt.getAttribute('data-value') === data.kind);
            });
        }
    }

    // Dispatch input event to populate categories
    kindHiddenInput.dispatchEvent(new Event('input', {bubbles: true}));

    // Use requestAnimationFrame to wait for DOM update after categories populate
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            // Find the category value from CATEGORIES config by matching the label
            let categoryValue = null;
            if (data.kind && CATEGORIES[data.kind]) {
                const matchedCategory = CATEGORIES[data.kind].find(
                    cat => cat.label.toLowerCase() === data.category.toLowerCase()
                );
                categoryValue = matchedCategory ? matchedCategory.value : null;
            }

            console.log('🔍 Looking for category label:', data.category);
            console.log('🔍 Found category value:', categoryValue);

            if (!categoryValue) {
                console.error('❌ Could not find matching category value for label:', data.category);
                return;
            }

            const categoryHiddenInput = document.getElementById('category');
            categoryHiddenInput.value = categoryValue;

            // Update the category select display
            const categorySelectElement = document.getElementById('category-select');
            if (categorySelectElement) {
                const categorySelected = categorySelectElement.querySelector('.select-selected');
                const categoryItems = categorySelectElement.querySelector('.select-items');
                const categoryOption = categoryItems.querySelector(`[data-value="${categoryValue}"]`);

                if (categorySelected && categoryOption) {
                    categorySelected.textContent = categoryOption.textContent;
                    categoryItems.querySelectorAll('div').forEach(opt => {
                        opt.classList.toggle('same-as-selected', opt.getAttribute('data-value') === categoryValue);
                    });
                } else {
                    console.error('❌ Could not find category option for value:', categoryValue);
                }
            }
        });
    });

    form.querySelector('button[type="submit"]').textContent = 'Save Transaction';
}

function saveBudget(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const editingId = sessionStorage.getItem('editingBudgetId');

    // Get all checked categories
    const checkedCategories = Array.from(event.target.querySelectorAll('input[name="categories"]:checked'));

    // Frontend validation - at least one category must be selected
    if (checkedCategories.length === 0) {
        alert('Please select at least one category for this budget.');
        return;
    }

    // Convert checked values to labels for storage
    const categoriesArray = checkedCategories.map(checkbox => {
        const label = checkbox.nextElementSibling.textContent.trim();
        return {name: label};
    });

    const budgetData = {
        name: formData.get('name'),
        limit: formData.get('amount'),
        categories: categoriesArray,
    };

    console.log('Sending budget data:', budgetData);

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
                return response.json().then(err => {
                    throw new Error(err.error || 'Failed to save budget');
                });
            }
            return response.json();
        })
        .then(data => {
            console.log('Budget saved:', data);
            sessionStorage.removeItem('editingBudgetId');
            window.location.href = '/budgets';
        })
        .catch(error => {
            console.error('Error saving budget:', error);
            alert(error.message || 'Failed to save budget. Please try again.');
        });
}

function setupEventDelegation() {
    const container = document.querySelector(".list-container");
    const cards = document.getElementsByClassName("row-card");
    container.addEventListener('click', (e) => {
        const card = e.target.closest('.row-card');
        if (!card) return;

        const cardIndex = Array.from(cards).indexOf(card);

        if (e.target.closest('button.edit')) {
            e.stopPropagation();
            selectedIndex = cardIndex;
            updateSelection(cards);
            editSelected(cards);
            return;
        }

        if (e.target.closest('button.delete')) {
            e.stopPropagation();
            selectedIndex = cardIndex;
            updateSelection(cards);
            showDeletionPrompt(cards);
            return;
        }

        if (!e.target.closest('button')) {
            selectedIndex = cardIndex;
            updateSelection(cards);
        }
    });
}

function setupFormClickHandlers(form) {
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

function setupFormKeyboardHandlers() {
    document.addEventListener("keydown", (e) => {
        // Only handle when a form field is focused
        if (!formSelected || currentFieldIndex < 0) return;

        if (e.key === 'Tab') {
            e.preventDefault();
            navigateFormFields(e.shiftKey ? -1 : 1);
        } else if (e.key === 'Escape') {
            e.preventDefault();
            blurCurrentField();
        }
    });
}

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
        formSelected = false;  // Important: Clear the flag
    }
}

function initializeSelection(cards) {
    if (cards.length > 0) {
        cards[0].classList.add('selected');
    }
}

function updateSelection(cards) {
    for (let card of cards) {
        card.classList.remove('selected');
    }
    if (cards[selectedIndex]) {
        cards[selectedIndex].classList.add('selected');
        cards[selectedIndex].scrollIntoView({behavior: 'smooth', block: 'center'});
    }
}

function moveUp(cards) {
    if (selectedIndex > 0) {
        selectedIndex--;
        updateSelection(cards);
    }
}

function moveDown(cards) {
    if (selectedIndex < cards.length - 1) {
        selectedIndex++;
        updateSelection(cards);
    }
}

function editSelected(cards) {
    if (cards[selectedIndex]) {
        const card = cards[selectedIndex];
        if (card.classList.contains("empty-state")) {
            if (window.location.pathname === ROUTES.TRANSACTIONS) {
                window.location = ROUTES.TRANSACTIONS_ADD;
            } else if (window.location.pathname === ROUTES.BUDGETS) {
                window.location = ROUTES.BUDGETS_ADD;
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
            .then(() => {
                sessionStorage.setItem(storageKey, itemId);
                window.location.href = destination;
            })
            .catch(error => {
                console.error('Error loading item:', error);
                alert('Failed to load item for editing');
            });
    }
}

function showDeletionPrompt(cards) {
    const emptyCard = document.querySelector(".empty-state");
    if (emptyCard) return;
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
        const cards = document.getElementsByClassName("row-card");
        if (cards[selectedIndex]) {
            const itemId = cards[selectedIndex].querySelector("button.delete").dataset.id;
            const cardToRemove = cards[selectedIndex]
            let apiEndpoint;
            if (window.location.pathname === ROUTES.TRANSACTIONS) {
                apiEndpoint = `${API_ENDPOINTS.transactions}/${itemId}`;
            } else if (window.location.pathname === ROUTES.BUDGETS) {
                apiEndpoint = `${API_ENDPOINTS.budgets}/${itemId}`;
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
                                // window.location = "/transactions";
                                window.location.reload()
                            } else if (selectedIndex >= cards.length) {
                                selectedIndex = cards.length - 1;
                            }
                            updateSelection(cards);
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
    try {


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
        <div class="card-main empty-state">
            <div class="card-category">No transactions found! Press Enter or Return to add one!</div>
        </div>
    </div>
    `;
        }
        const cards = document.getElementsByClassName("row-card");
        initializeSelection(cards);
    } catch (error) {
        console.error('Error loading transactions:', error);
        alert('Failed to load transactions');
    }
}

async function loadBudgets() {
    try {
        const response = await fetch(API_ENDPOINTS.budgets);
        const data = await response.json();

        const container = document.querySelector(".list-container");
        if ("budgets" in data) {
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
        } else {
            container.innerHTML = `
    <div class="row-card empty-state">
        <div class="card-main">
            <div class="card-category">No budgets found! Press Enter or Return to add one!</div>
        </div>
    </div>
    `;
        }
        const cards = document.getElementsByClassName("row-card");
        initializeSelection(cards);
    } catch (error) {
        console.error('Error loading budgets:', error);
        alert('Failed to load budgets');
    }
}


function initCustomSelect(selectElement, initialOptions = null) {
    const selected = selectElement.querySelector('.select-selected');
    const items = selectElement.querySelector('.select-items');
    const hiddenInput = selectElement.parentElement.querySelector('input[type="hidden"]');
    let focusedIndex = -1;

    // Make the select element focusable
    selectElement.setAttribute('tabindex', '0');

    // If initial options provided, populate them
    if (initialOptions) {
        items.innerHTML = initialOptions.map(opt =>
            `<div data-value="${opt.value}" data-label="${opt.label}">${opt.label}</div>`
        ).join('');
        attachOptionListeners();
    }

    // Toggle dropdown
    selected.addEventListener('click', (e) => {
        e.stopPropagation();
        const options = items.querySelectorAll('div');
        if (options.length === 0) return;

        closeAllSelect(selectElement);
        items.classList.toggle('select-hide');
        focusedIndex = -1;
    });

    function attachOptionListeners() {
        items.querySelectorAll('div').forEach(option => {
            option.onclick = (e) => {
                e.stopPropagation();
                selected.textContent = option.textContent;
                hiddenInput.value = option.getAttribute('data-value');

                // Dispatch input event so listeners can react
                hiddenInput.dispatchEvent(new Event('input', {bubbles: true}));

                items.querySelectorAll('div').forEach(o => o.classList.remove('same-as-selected'));
                option.classList.add('same-as-selected');
                items.classList.add('select-hide');
            };
        });
    }

    attachOptionListeners();

    selectElement.addEventListener('keydown', (e) => {
        const options = items.querySelectorAll('div');
        if (options.length === 0) return;

        if (items.classList.contains('select-hide')) {
            if (['Enter', ' ', 'ArrowDown'].includes(e.key)) {
                e.preventDefault();
                items.classList.remove('select-hide');
                focusedIndex = 0;
                updateFocus();
            }
        } else {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                focusedIndex = Math.min(focusedIndex + 1, options.length - 1);
                updateFocus();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                focusedIndex = Math.max(focusedIndex - 1, 0);
                updateFocus();
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (focusedIndex >= 0) options[focusedIndex].click();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                items.classList.add('select-hide');
            }
        }
    });

    function updateFocus() {
        const options = items.querySelectorAll('div');
        options.forEach((opt, idx) => {
            opt.classList.toggle('keyboard-focused', idx === focusedIndex);
        });
        if (focusedIndex >= 0) {
            options[focusedIndex].scrollIntoView({block: 'nearest'});
        }
    }

    return {
        setOptions: (optionsArray) => {
            items.innerHTML = optionsArray.map(cat =>
                `<div data-value="${cat.value}" data-label="${cat.label}">${cat.label}</div>`
            ).join('');
            attachOptionListeners();
        },
        clear: () => {
            items.innerHTML = '';
            selected.textContent = 'Select type first...';
            hiddenInput.value = '';
        }
    };
}

function closeAllSelect(exceptElement) {
    document.querySelectorAll('.select-items').forEach(items => {
        if (exceptElement && items.parentElement === exceptElement) return;
        items.classList.add('select-hide');
    });
}
