// LocalStorage Storage Keys
const STORAGE_KEY = "finance_planner_data_v1";

// DOM Element References
const financeForm = document.getElementById("finance-form");
const incomeInput = document.getElementById("income-input");
const currencySelect = document.getElementById("currency-select");
const currencySymbolSpan = document.getElementById("current-currency-symbol");
const calculateBtn = document.getElementById("cal");
const resetBtn = document.getElementById("reset-btn");
const deleteDataBtn = document.getElementById("delete-data-btn");

// Result Displays
const resultsSection = document.getElementById("results-section");
const summaryIncome = document.getElementById("summary-income");
const needsElem = document.querySelector(".needs");
const growthElem = document.querySelector(".growth");
const efElem = document.querySelector(".ef");
const investElem = document.querySelector(".in");
const learnElem = document.querySelector(".learn");
const lifestyleElem = document.querySelector(".ls");
const protElem = document.querySelector(".prot");
const insElem = document.querySelector(".ins");
const debtElem = document.querySelector(".debt");

// History & Modal Elements
const historySection = document.getElementById("history-section");
const historyList = document.getElementById("history-list");
const clearHistoryBtn = document.getElementById("clear-history-btn");
const deleteModal = document.getElementById("delete-modal");
const confirmDeleteBtn = document.getElementById("confirm-delete-btn");
const cancelDeleteBtn = document.getElementById("cancel-delete-btn");
const toastContainer = document.getElementById("toast-container");

// Currency Config
const CURRENCIES = {
    USD: { symbol: "$", locale: "en-US" },
    INR: { symbol: "₹", locale: "en-IN" },
    EUR: { symbol: "€", locale: "de-DE" },
    GBP: { symbol: "£", locale: "en-GB" }
};

// Application State
let appState = {
    income: 0,
    currency: "USD",
    history: []
};

// --- Initialization ---
document.addEventListener("DOMContentLoaded", () => {
    loadStateFromLocalStorage();
    setupEventListeners();
});

function setupEventListeners() {
    // Form Submission & Calculation
    financeForm.addEventListener("submit", (e) => {
        e.preventDefault();
        performCalculation(true);
    });

    calculateBtn.addEventListener("click", () => {
        performCalculation(true);
    });

    // Currency Switcher
    currencySelect.addEventListener("change", (e) => {
        appState.currency = e.target.value;
        const selectedOption = currencySelect.options[currencySelect.selectedIndex];
        const symbol = selectedOption.getAttribute("data-symbol") || "$";
        currencySymbolSpan.textContent = symbol;

        if (appState.income > 0) {
            updateUIResults(appState.income);
        }
        renderHistory();
        saveStateToLocalStorage();
    });

    // Reset Current Input
    resetBtn.addEventListener("click", () => {
        incomeInput.value = "";
        appState.income = 0;
        resultsSection.classList.add("hidden");
        showToast("Form input reset", "info");
    });

    // Delete All Data (Modal Flow)
    deleteDataBtn.addEventListener("click", () => {
        deleteModal.classList.remove("hidden");
    });

    cancelDeleteBtn.addEventListener("click", () => {
        deleteModal.classList.add("hidden");
    });

    // Close Modal on backdrop click
    deleteModal.addEventListener("click", (e) => {
        if (e.target === deleteModal) {
            deleteModal.classList.add("hidden");
        }
    });

    confirmDeleteBtn.addEventListener("click", () => {
        deleteAllLocalStorageData();
        deleteModal.classList.add("hidden");
    });

    // Clear History Button
    clearHistoryBtn.addEventListener("click", () => {
        if (appState.history.length === 0) {
            showToast("History is already empty", "info");
            return;
        }
        appState.history = [];
        saveStateToLocalStorage();
        renderHistory();
        showToast("Calculation history cleared", "danger");
    });
}

// --- Formatters ---
function formatCurrency(amount, currencyCode = appState.currency) {
    const config = CURRENCIES[currencyCode] || CURRENCIES.USD;
    try {
        return new Intl.NumberFormat(config.locale, {
            style: "currency",
            currency: currencyCode,
            maximumFractionDigits: 2
        }).format(amount);
    } catch {
        return `${config.symbol}${Number(amount).toFixed(2)}`;
    }
}

// --- Calculation Logic ---
function performCalculation(saveToHistory = false) {
    const rawVal = parseFloat(incomeInput.value);

    if (isNaN(rawVal) || rawVal <= 0) {
        showToast("Please enter a valid income amount greater than 0", "danger");
        incomeInput.focus();
        return;
    }

    appState.income = rawVal;
    updateUIResults(rawVal);

    if (saveToHistory) {
        // Save to History Log
        const newRecord = {
            id: Date.now(),
            income: rawVal,
            currency: appState.currency,
            date: new Date().toLocaleString()
        };
        // Keep max 10 records
        appState.history.unshift(newRecord);
        if (appState.history.length > 10) {
            appState.history.pop();
        }
        showToast("Calculation updated & saved to LocalStorage!", "success");
    }

    saveStateToLocalStorage();
    renderHistory();
}

function updateUIResults(incomeVal) {
    // 50 / 30 / 10 / 10 Breakdown
    const needs = incomeVal * 0.50;
    const growth = incomeVal * 0.30;
    const ef = incomeVal * 0.10;
    const invest = incomeVal * 0.10;
    const learn = incomeVal * 0.10;
    const lifestyle = incomeVal * 0.10;
    const protection = incomeVal * 0.10;
    const insurance = incomeVal * 0.05;
    const debt = incomeVal * 0.05;

    // Update Banner
    summaryIncome.textContent = formatCurrency(incomeVal);

    // Update Main Cards
    needsElem.textContent = formatCurrency(needs);
    growthElem.textContent = formatCurrency(growth);
    lifestyleElem.textContent = formatCurrency(lifestyle);
    protElem.textContent = formatCurrency(protection);

    // Update Sub-items
    efElem.textContent = formatCurrency(ef);
    investElem.textContent = formatCurrency(invest);
    learnElem.textContent = formatCurrency(learn);
    insElem.textContent = formatCurrency(insurance);
    debtElem.textContent = formatCurrency(debt);

    // Unhide Results Section
    resultsSection.classList.remove("hidden");
}

// --- LocalStorage Management ---
function saveStateToLocalStorage() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
    } catch (err) {
        console.error("Failed to save to LocalStorage:", err);
    }
}

function loadStateFromLocalStorage() {
    try {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (savedData) {
            const parsed = JSON.parse(savedData);
            appState = {
                income: parsed.income || 0,
                currency: parsed.currency || "USD",
                history: Array.isArray(parsed.history) ? parsed.history : []
            };

            // Restore Currency Selection
            currencySelect.value = appState.currency;
            const selectedOption = currencySelect.options[currencySelect.selectedIndex];
            if (selectedOption) {
                currencySymbolSpan.textContent = selectedOption.getAttribute("data-symbol") || "$";
            }

            // Restore Income if exists
            if (appState.income > 0) {
                incomeInput.value = appState.income;
                updateUIResults(appState.income);
            }

            renderHistory();
        }
    } catch (err) {
        console.error("Failed to load from LocalStorage:", err);
    }
}

// DELETE DATA FROM LOCALSTORAGE
function deleteAllLocalStorageData() {
    try {
        // Clear specific key or clear all LocalStorage
        localStorage.removeItem(STORAGE_KEY);
        
        // Reset app internal state
        appState = {
            income: 0,
            currency: "USD",
            history: []
        };

        // Reset UI
        incomeInput.value = "";
        currencySelect.value = "USD";
        currencySymbolSpan.textContent = "$";
        resultsSection.classList.add("hidden");
        renderHistory();

        showToast("All LocalStorage data deleted successfully!", "danger");
    } catch (err) {
        console.error("Failed to delete LocalStorage data:", err);
        showToast("Error deleting stored data", "danger");
    }
}

function deleteHistoryItem(id) {
    appState.history = appState.history.filter(item => item.id !== id);
    saveStateToLocalStorage();
    renderHistory();
    showToast("Record removed from history", "info");
}

// --- Render Saved History ---
function renderHistory() {
    historyList.innerHTML = "";

    if (!appState.history || appState.history.length === 0) {
        historyList.innerHTML = `<p class="empty-history-msg">No saved calculations found in LocalStorage. Enter an income above to get started!</p>`;
        return;
    }

    appState.history.forEach((record) => {
        const itemEl = document.createElement("div");
        itemEl.className = "history-item";
        
        const formattedAmt = formatCurrency(record.income, record.currency || appState.currency);

        itemEl.innerHTML = `
            <div class="history-info">
                <span class="history-amount">${formattedAmt} / month</span>
                <span class="history-date">${record.date}</span>
            </div>
            <div class="history-actions">
                <button class="btn btn-secondary btn-sm load-record-btn" title="Reload this calculation">
                    <i class="fa-solid fa-arrow-up-right-from-square"></i> Load
                </button>
                <button class="btn btn-outline-danger btn-icon-only delete-record-btn" title="Delete record">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
        `;

        // Event listeners for individual items
        itemEl.querySelector(".load-record-btn").addEventListener("click", () => {
            incomeInput.value = record.income;
            if (record.currency) {
                currencySelect.value = record.currency;
                appState.currency = record.currency;
                const option = currencySelect.options[currencySelect.selectedIndex];
                if (option) currencySymbolSpan.textContent = option.getAttribute("data-symbol") || "$";
            }
            performCalculation(false);
            showToast(`Loaded calculation for ${formattedAmt}`, "info");
        });

        itemEl.querySelector(".delete-record-btn").addEventListener("click", () => {
            deleteHistoryItem(record.id);
        });

        historyList.appendChild(itemEl);
    });
}

// --- Toast Notifications ---
function showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    
    let iconClass = "fa-circle-info";
    if (type === "success") iconClass = "fa-circle-check";
    if (type === "danger") iconClass = "fa-circle-exclamation";

    toast.innerHTML = `
        <i class="fa-solid ${iconClass}"></i>
        <span>${message}</span>
    `;

    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(50px)";
        toast.style.transition = "all 0.3s ease";
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}



