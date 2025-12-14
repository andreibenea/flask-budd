const form = document.querySelector(".transaction-form");
const cards = document.getElementsByClassName("row-card")

let selectedIndex = 0;
let deletionMode = false;
let deletionChoice = 0; // 0 = Yes, 1 = No

// function attachClickListeners() {
//     for (let i = 0; i < cards.length; i++) {
//         cards[i].addEventListener('click', (e) => {
//             if (e.target.closest('button')) {
//                 return;
//             }
//             selectedIndex = i;
//             updateSelection();
//         });
//
//         const editBtn = cards[i].querySelector('button.edit');
//         if (editBtn) {
//             editBtn.addEventListener('click', (e) => {
//                 e.stopPropagation();
//                 selectedIndex = i;
//                 updateSelection();
//                 editSelected();
//             });
//         }
//
//         const deleteBtn = cards[i].querySelector('button.delete');
//         if (deleteBtn) {
//             deleteBtn.addEventListener('click', (e) => {
//                 e.stopPropagation();
//                 selectedIndex = i;
//                 updateSelection();
//                 showDeletionPrompt();
//             });
//         }
//     }
// }


function setupEventDelegation() {
    const container = document.querySelector(".list-container");

    // Single click listener on the container
    container.addEventListener('click', (e) => {
        const card = e.target.closest('.row-card');
        if (!card) return;

        const cardIndex = Array.from(cards).indexOf(card);

        // Check if clicking edit button
        if (e.target.closest('button.edit')) {
            e.stopPropagation();
            selectedIndex = cardIndex;
            updateSelection();
            editSelected();
            return;
        }

        // Check if clicking delete button
        if (e.target.closest('button.delete')) {
            e.stopPropagation();
            selectedIndex = cardIndex;
            updateSelection();
            showDeletionPrompt();
            return;
        }

        // Click on card itself (not on buttons)
        if (!e.target.closest('button')) {
            selectedIndex = cardIndex;
            updateSelection();
        }
    });
}
document.addEventListener("keydown", (e) => {
    const navKeys = ['ArrowUp', 'ArrowDown', 'k', 'j', 'Enter', 'Backspace', 'Delete', 'Escape', 'ArrowLeft', 'ArrowRight'];
    if (navKeys.includes(e.key)) {
        e.preventDefault();
    }
    if (deletionMode) {
        switch (e.key) {
            case 'ArrowLeft':
                deletionChoice = 0; // Yes
                updateDeletionPrompt();
                break;
            case 'ArrowRight':
                deletionChoice = 1; // No
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
    else if (e.key === "n") window.location = "/transactions/add";
    else if (e.key === "b") window.location = "/budgets";
    else if (e.key === "g") window.location = "/budgets/add";
    else if (e.key === "Escape") {
        if (window.location.pathname === "/transactions/add") {
            window.location = "/transactions"
        } else if (window.location.pathname === "/budgets/add") {
            window.location = "/budgets"
        }
    }
});

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
        cards[selectedIndex].scrollIntoView({behavior: 'smooth', block: 'nearest'});
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
        const editButton = cards[selectedIndex].querySelector('button.edit');
        if (editButton) {
            editButton.click();
        }
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
            const deleteButton = cards[selectedIndex].querySelector('button.delete');
            const transactionId = cards[selectedIndex].querySelector("button.delete").dataset.id;
            const cardToRemove = cards[selectedIndex]
            fetch(`api/transactions/${transactionId}`, {
                method: "DELETE"
            })
                .then(response => {
                        if (response.ok) {
                            cardToRemove.remove();
                            const remainingCards = document.getElementsByClassName("transaction-card");
                            if (cards.length === 0) {
                                selectedIndex = 0;
                            } else if (selectedIndex >= cards.length) {
                                selectedIndex = cards.length - 1;
                            }
                            updateSelection();
                            attachClickListeners();
                        } else {
                            console.error('Failed to delete transaction');
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
    initializeSelection();
    // attachClickListeners();
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
`).join("");
    initializeSelection();
    // attachClickListeners();
}

if (window.location.pathname === "/transactions") {
    loadTransactions();
    setupEventDelegation();
    // document.addEventListener("DOMContentLoaded", initializeSelection)
} else if (window.location.pathname === "/budgets") {
    loadBudgets();
    setupEventDelegation();
}