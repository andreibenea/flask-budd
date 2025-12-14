const form = document.querySelector(".transaction-form");

document.addEventListener("keydown", (e) => {
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

async function loadTransactions() {
    const response = await fetch("/api/transactions");
    const data = await response.json();

    const container = document.querySelector(".list-transactions-content");
    container.innerHTML = data.transactions.map(t => `
        <div class="list-transactions-item">
            <div class="item-part">${t.timestamp}</div>
            <div class="item-part">${t.amount}</div>
            <div class="item-part">${t.category}</div>
            <div class="item-part">${t.kind}</div>
            <div class="item-part">${t.notes || ""}</div>
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
    `).join("");
}

async function loadBudgets() {
    const response = await fetch("/api/budgets");
    const data = await response.json();

    const container = document.querySelector(".list-budgets-content");
    container.innerHTML = data.budgets.map(b => `
        <div class="list-budgets-item">
            <div class="item-part">${b.timestamp}</div>
            <div class="item-part">${b.name}</div>
            <div class="item-part">${b.limit}</div>
            <div class="item-part-container">${b.categories.map(cat => `<div class="item-part-sm">${cat.name}</div>`).join(" ")}</div>
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
    `).join("");
}

if (window.location.pathname === "/transactions") {
    loadTransactions();
} else if (window.location.pathname === "/budgets") {
    loadBudgets();
}