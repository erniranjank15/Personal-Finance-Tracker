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
const summaryAllocatedAmount = document.getElementById("summary-allocated-amount");
const summaryAllocation = document.getElementById("summary-allocation");
const progressPercentage = document.getElementById("progress-percentage");

// Progress bars & legend percentages
const barNeeds = document.getElementById("bar-needs");
const barGrowth = document.getElementById("bar-growth");
const barLifestyle = document.getElementById("bar-lifestyle");
const barProtection = document.getElementById("bar-protection");

const legendNeedsPct = document.getElementById("legend-needs-pct");
const legendGrowthPct = document.getElementById("legend-growth-pct");
const legendLifestylePct = document.getElementById("legend-lifestyle-pct");
const legendProtectionPct = document.getElementById("legend-protection-pct");

const badgeNeeds = document.getElementById("badge-needs");
const badgeGrowth = document.getElementById("badge-growth");
const badgeLifestyle = document.getElementById("badge-lifestyle");
const badgeProtection = document.getElementById("badge-protection");

const needsElem = document.querySelector(".needs");
const growthElem = document.querySelector(".growth");
const efElem = document.querySelector(".ef");
const investElem = document.querySelector(".in");
const learnElem = document.querySelector(".learn");
const lifestyleElem = document.querySelector(".ls");
const protElem = document.querySelector(".prot");
const insElem = document.querySelector(".ins");
const debtElem = document.querySelector(".debt");

// Fund Transfer Elements
const transferForm = document.getElementById("transfer-form");
const transferFromSelect = document.getElementById("transfer-from");
const transferToSelect = document.getElementById("transfer-to");
const transferAmountInput = document.getElementById("transfer-amount");
const transferCurrencySymbol = document.getElementById("transfer-currency-symbol");
const availableFromBadge = document.getElementById("available-from-badge");
const availableToBadge = document.getElementById("available-to-badge");
const resetAllocationsBtn = document.getElementById("reset-allocations-btn");
const quickChips = document.querySelectorAll(".quick-transfer-buttons .btn-chip");

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
    allocations: null, // { needs: 0, growth: 0, lifestyle: 0, protection: 0 }
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
        if (transferCurrencySymbol) transferCurrencySymbol.textContent = symbol;

        if (appState.income > 0) {
            updateUIResults();
        }
        renderHistory();
        saveStateToLocalStorage();
    });

    // Reset Current Input
    resetBtn.addEventListener("click", () => {
        incomeInput.value = "";
        appState.income = 0;
        appState.allocations = null;
        resultsSection.classList.add("hidden");
        showToast("Form input reset", "info");
        saveStateToLocalStorage();
    });

    // Transfer Fund Listeners
    transferFromSelect.addEventListener("change", updateTransferBadges);
    transferToSelect.addEventListener("change", updateTransferBadges);

    quickChips.forEach(chip => {
        chip.addEventListener("click", () => {
            const pct = parseFloat(chip.dataset.pct);
            const fromCat = transferFromSelect.value;
            const currentFromAmount = appState.allocations ? (appState.allocations[fromCat] || 0) : 0;
            const computed = (currentFromAmount * pct);
            // round to 2 decimal places
            transferAmountInput.value = Math.max(0, Math.floor(computed * 100) / 100);
        });
    });

    if (transferForm) {
        transferForm.addEventListener("submit", (e) => {
            e.preventDefault();
            handleFundTransfer();
        });
    }

    if (resetAllocationsBtn) {
        resetAllocationsBtn.addEventListener("click", () => {
            if (appState.income <= 0) return;
            initDefaultAllocations(appState.income);
            updateUIResults();
            saveStateToLocalStorage();
            showToast("Reset to standard 50/30/10/10 allocations!", "info");
        });
    }

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
function initDefaultAllocations(income) {
    appState.allocations = {
        needs: income * 0.50,
        growth: income * 0.30,
        lifestyle: income * 0.10,
        protection: income * 0.10
    };
}

function performCalculation(saveToHistory = false) {
    const rawVal = parseFloat(incomeInput.value);

    if (isNaN(rawVal) || rawVal <= 0) {
        showToast("Please enter a valid income amount greater than 0", "danger");
        incomeInput.focus();
        return;
    }

    appState.income = rawVal;
    initDefaultAllocations(rawVal);
    updateUIResults();

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

function handleFundTransfer() {
    if (!appState.income || !appState.allocations) {
        showToast("Please calculate budget first", "danger");
        return;
    }

    const fromCat = transferFromSelect.value;
    const toCat = transferToSelect.value;
    const transferAmount = parseFloat(transferAmountInput.value);

    if (fromCat === toCat) {
        showToast("Please select two different categories to transfer funds", "danger");
        return;
    }

    if (isNaN(transferAmount) || transferAmount <= 0) {
        showToast("Please enter a valid transfer amount greater than 0", "danger");
        transferAmountInput.focus();
        return;
    }

    const availableAmount = appState.allocations[fromCat] || 0;
    if (transferAmount > availableAmount + 0.0001) {
        showToast(`Insufficient funds in ${getCategoryName(fromCat)}! Available: ${formatCurrency(availableAmount)}`, "danger");
        return;
    }

    // Execute transfer
    appState.allocations[fromCat] = Math.max(0, appState.allocations[fromCat] - transferAmount);
    appState.allocations[toCat] = (appState.allocations[toCat] || 0) + transferAmount;

    // Reset transfer input field
    transferAmountInput.value = "";

    // Update entire UI dynamically
    updateUIResults();
    saveStateToLocalStorage();

    showToast(`Successfully moved ${formatCurrency(transferAmount)} from ${getCategoryName(fromCat)} to ${getCategoryName(toCat)}!`, "success");
}

function getCategoryName(catKey) {
    const names = {
        needs: "Needs",
        growth: "Growth",
        lifestyle: "Lifestyle",
        protection: "Protection"
    };
    return names[catKey] || catKey;
}

function updateTransferBadges() {
    if (!appState.allocations) return;
    const fromCat = transferFromSelect.value;
    const toCat = transferToSelect.value;

    const fromAmt = appState.allocations[fromCat] || 0;
    const toAmt = appState.allocations[toCat] || 0;

    if (availableFromBadge) {
        availableFromBadge.textContent = `Available: ${formatCurrency(fromAmt)}`;
    }
    if (availableToBadge) {
        availableToBadge.textContent = `Current: ${formatCurrency(toAmt)}`;
    }
}

function updateUIResults() {
    if (!appState.allocations || appState.income <= 0) return;

    const { needs, growth, lifestyle, protection } = appState.allocations;
    const incomeVal = appState.income;
    const totalAllocated = needs + growth + lifestyle + protection;

    // Percentages
    const needsPct = incomeVal > 0 ? (needs / incomeVal) * 100 : 0;
    const growthPct = incomeVal > 0 ? (growth / incomeVal) * 100 : 0;
    const lifestylePct = incomeVal > 0 ? (lifestyle / incomeVal) * 100 : 0;
    const protectionPct = incomeVal > 0 ? (protection / incomeVal) * 100 : 0;
    const totalPct = incomeVal > 0 ? (totalAllocated / incomeVal) * 100 : 0;

    // Update Top Summary Banner
    summaryIncome.textContent = formatCurrency(incomeVal);
    if (summaryAllocatedAmount) {
        summaryAllocatedAmount.textContent = formatCurrency(totalAllocated);
    }
    if (summaryAllocation) {
        summaryAllocation.textContent = `${totalPct.toFixed(1)}% Allocated`;
    }

    // Update Progress Bars (normalize visual segments to 100% of the bar width)
    const barSum = Math.max(0.0001, needs + growth + lifestyle + protection);
    if (barNeeds) barNeeds.style.width = `${(needs / barSum) * 100}%`;
    if (barGrowth) barGrowth.style.width = `${(growth / barSum) * 100}%`;
    if (barLifestyle) barLifestyle.style.width = `${(lifestyle / barSum) * 100}%`;
    if (barProtection) barProtection.style.width = `${(protection / barSum) * 100}%`;

    // Tooltips for segments
    if (barNeeds) barNeeds.title = `Needs: ${formatCurrency(needs)} (${needsPct.toFixed(1)}%)`;
    if (barGrowth) barGrowth.title = `Growth: ${formatCurrency(growth)} (${growthPct.toFixed(1)}%)`;
    if (barLifestyle) barLifestyle.title = `Lifestyle: ${formatCurrency(lifestyle)} (${lifestylePct.toFixed(1)}%)`;
    if (barProtection) barProtection.title = `Protection: ${formatCurrency(protection)} (${protectionPct.toFixed(1)}%)`;

    // Progress percentage label & legend
    if (progressPercentage) {
        progressPercentage.textContent = `${totalPct.toFixed(1)}% Budgeted`;
    }
    if (legendNeedsPct) legendNeedsPct.textContent = `${needsPct.toFixed(1)}%`;
    if (legendGrowthPct) legendGrowthPct.textContent = `${growthPct.toFixed(1)}%`;
    if (legendLifestylePct) legendLifestylePct.textContent = `${lifestylePct.toFixed(1)}%`;
    if (legendProtectionPct) legendProtectionPct.textContent = `${protectionPct.toFixed(1)}%`;

    // Update Badges on Category Cards
    if (badgeNeeds) badgeNeeds.textContent = `${needsPct.toFixed(1)}% of Income`;
    if (badgeGrowth) badgeGrowth.textContent = `${growthPct.toFixed(1)}% of Income`;
    if (badgeLifestyle) badgeLifestyle.textContent = `${lifestylePct.toFixed(1)}% of Income`;
    if (badgeProtection) badgeProtection.textContent = `${protectionPct.toFixed(1)}% of Income`;

    // Update Main Cards Amounts
    needsElem.textContent = formatCurrency(needs);
    growthElem.textContent = formatCurrency(growth);
    lifestyleElem.textContent = formatCurrency(lifestyle);
    protElem.textContent = formatCurrency(protection);

    // Update Sub-items dynamically based on allocated category pool
    // Growth sub-items split equally across 3 buckets
    const growthSub = growth / 3;
    efElem.textContent = formatCurrency(growthSub);
    investElem.textContent = formatCurrency(growthSub);
    learnElem.textContent = formatCurrency(growthSub);

    // Protection sub-items split equally across 2 buckets
    const protSub = protection / 2;
    insElem.textContent = formatCurrency(protSub);
    debtElem.textContent = formatCurrency(protSub);

    // Update Transfer Section UI
    const currConfig = CURRENCIES[appState.currency] || CURRENCIES.USD;
    if (transferCurrencySymbol) {
        transferCurrencySymbol.textContent = currConfig.symbol;
    }
    updateTransferBadges();

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
                allocations: parsed.allocations || null,
                history: Array.isArray(parsed.history) ? parsed.history : []
            };

            // Restore Currency Selection
            currencySelect.value = appState.currency;
            const selectedOption = currencySelect.options[currencySelect.selectedIndex];
            if (selectedOption) {
                const sym = selectedOption.getAttribute("data-symbol") || "$";
                currencySymbolSpan.textContent = sym;
                if (transferCurrencySymbol) transferCurrencySymbol.textContent = sym;
            }

            // Restore Income & Allocations if exists
            if (appState.income > 0) {
                incomeInput.value = appState.income;
                if (!appState.allocations) {
                    initDefaultAllocations(appState.income);
                }
                updateUIResults();
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
            allocations: null,
            history: []
        };

        // Reset UI
        incomeInput.value = "";
        currencySelect.value = "USD";
        currencySymbolSpan.textContent = "$";
        if (transferCurrencySymbol) transferCurrencySymbol.textContent = "$";
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
                if (option) {
                    const sym = option.getAttribute("data-symbol") || "$";
                    currencySymbolSpan.textContent = sym;
                    if (transferCurrencySymbol) transferCurrencySymbol.textContent = sym;
                }
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




