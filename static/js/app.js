const form = document.querySelector(".transaction-form");

document.addEventListener("keydown", (e) => {
    if (e.key === "h") window.location = "/";
    else if (e.key === "t") window.location = "/transactions";
    else if (e.key === "n") window.location = "/transactions/add";
    else if (e.key === "b") window.location = "/budgets";
    else if (e.key === "g") window.location = "/budgets/add";
});

form.addEventListener("submit", (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const amount = formData.get("amount");

    console.log(amount);
});