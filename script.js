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
const transferNoteInput = document.getElementById("transfer-note");
const transferCurrencySymbol = document.getElementById("transfer-currency-symbol");
const availableFromBadge = document.getElementById("available-from-badge");
const availableToBadge = document.getElementById("available-to-badge");
const resetAllocationsBtn = document.getElementById("reset-allocations-btn");
const quickChips = document.querySelectorAll(".quick-transfer-buttons .btn-chip");
const transferLogList = document.getElementById("transfer-log-list");
const clearNotesBtn = document.getElementById("clear-notes-btn");

// Manual Allocation Editor Elements
const manualForm = document.getElementById("manual-form");
const manualTargetSelect = document.getElementById("manual-target-select");
const manualAmountInput = document.getElementById("manual-amount-input");
const manualNoteInput = document.getElementById("manual-note-input");
const manualCurrencySymbol = document.getElementById("manual-currency-symbol");
const manualCurrentBadge = document.getElementById("manual-current-badge");
const manualSetBtn = document.getElementById("manual-set-btn");

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
    allocations: null, // Detailed fund breakdown
    transferLogs: [],   // Audit logs with notes
    history: []
};

// --- Item Names & Hierarchy Mapping ---
const ALLOCATION_NAMES = {
    needs: "Needs",
    lifestyle: "Lifestyle",
    ef: "Emergency Fund",
    in: "Investments",
    learn: "Learning & Skills",
    ins: "Insurance",
    debt: "Debt Repayment",
    growth: "Growth (Total)",
    protection: "Protection (Total)"
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

    // Currency Switcher
    currencySelect.addEventListener("change", (e) => {
        appState.currency = e.target.value;
        const selectedOption = currencySelect.options[currencySelect.selectedIndex];
        const symbol = selectedOption.getAttribute("data-symbol") || "$";
        currencySymbolSpan.textContent = symbol;
        if (transferCurrencySymbol) transferCurrencySymbol.textContent = symbol;
        if (manualCurrencySymbol) manualCurrencySymbol.textContent = symbol;

        if (appState.income > 0) {
            updateUIResults();
        }
        renderHistory();
        renderTransferLogs();
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
    if (transferFromSelect) transferFromSelect.addEventListener("change", updateTransferBadges);
    if (transferToSelect) transferToSelect.addEventListener("change", updateTransferBadges);

    quickChips.forEach(chip => {
        chip.addEventListener("click", () => {
            const pct = parseFloat(chip.dataset.pct);
            const fromCat = transferFromSelect.value;
            const currentFromAmount = getFundAmount(fromCat);
            const computed = (currentFromAmount * pct);
            transferAmountInput.value = Math.max(0, Math.floor(computed * 100) / 100);
        });
    });

    if (transferForm) {
        transferForm.addEventListener("submit", (e) => {
            e.preventDefault();
            handleFundTransfer();
        });
    }

    const transferBtn = document.getElementById("transfer-btn");
    if (transferBtn) {
        transferBtn.addEventListener("click", (e) => {
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

    // Manual Allocation Editor Listeners
    if (manualTargetSelect) {
        manualTargetSelect.addEventListener("change", updateManualCurrentBadge);
    }

    if (manualForm) {
        manualForm.addEventListener("submit", (e) => {
            e.preventDefault();
            handleManualAllocation();
        });
    }

    if (manualSetBtn) {
        manualSetBtn.addEventListener("click", (e) => {
            e.preventDefault();
            handleManualAllocation();
        });
    }

    // Clear Transfer Log Button
    if (clearNotesBtn) {
        clearNotesBtn.addEventListener("click", () => {
            if (!appState.transferLogs || appState.transferLogs.length === 0) {
                showToast("Transfer log is already empty", "info");
                return;
            }
            appState.transferLogs = [];
            saveStateToLocalStorage();
            renderTransferLogs();
            showToast("Transfer history & notes cleared", "danger");
        });
    }

    // Delete All Data (Modal Flow)
    deleteDataBtn.addEventListener("click", () => {
        deleteModal.classList.remove("hidden");
    });

    cancelDeleteBtn.addEventListener("click", () => {
        deleteModal.classList.add("hidden");
    });

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

// --- Calculation & Fund State Logic ---
function initDefaultAllocations(income) {
    appState.allocations = {
        needs: income * 0.50,
        lifestyle: income * 0.10,
        ef: income * 0.10,
        in: income * 0.10,
        learn: income * 0.10,
        ins: income * 0.05,
        debt: income * 0.05
    };
}

function normalizeAllocationsState() {
    if (!appState.allocations) return;
    // Upgrade legacy state { needs, growth, lifestyle, protection } if found
    if (appState.allocations.ef === undefined) {
        const growth = appState.allocations.growth || 0;
        const prot = appState.allocations.protection || 0;
        appState.allocations.ef = growth / 3;
        appState.allocations.in = growth / 3;
        appState.allocations.learn = growth / 3;
        appState.allocations.ins = prot / 2;
        appState.allocations.debt = prot / 2;
        delete appState.allocations.growth;
        delete appState.allocations.protection;
    }
}

function getFundAmount(key) {
    if (!appState.allocations) return 0;
    normalizeAllocationsState();

    if (key === "growth") {
        return (appState.allocations.ef || 0) + (appState.allocations.in || 0) + (appState.allocations.learn || 0);
    }
    if (key === "protection") {
        return (appState.allocations.ins || 0) + (appState.allocations.debt || 0);
    }
    return appState.allocations[key] !== undefined ? appState.allocations[key] : 0;
}

function setFundAmount(key, amount) {
    if (!appState.allocations) return;
    normalizeAllocationsState();
    amount = Math.max(0, amount);

    if (key === "growth") {
        const currentTotal = getFundAmount("growth");
        if (currentTotal > 0) {
            const ratio = amount / currentTotal;
            appState.allocations.ef *= ratio;
            appState.allocations.in *= ratio;
            appState.allocations.learn *= ratio;
        } else {
            const part = amount / 3;
            appState.allocations.ef = part;
            appState.allocations.in = part;
            appState.allocations.learn = part;
        }
    } else if (key === "protection") {
        const currentTotal = getFundAmount("protection");
        if (currentTotal > 0) {
            const ratio = amount / currentTotal;
            appState.allocations.ins *= ratio;
            appState.allocations.debt *= ratio;
        } else {
            const part = amount / 2;
            appState.allocations.ins = part;
            appState.allocations.debt = part;
        }
    } else {
        appState.allocations[key] = amount;
    }
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
        const newRecord = {
            id: Date.now(),
            income: rawVal,
            currency: appState.currency,
            date: new Date().toLocaleString()
        };
        appState.history.unshift(newRecord);
        if (appState.history.length > 10) {
            appState.history.pop();
        }
        showToast("Calculation updated & saved to LocalStorage!", "success");
    }

    saveStateToLocalStorage();
    renderHistory();
}

// --- Fund Transfer Between Sub-funds & Main Funds ---
function handleFundTransfer() {
    if (!appState.income || !appState.allocations) {
        showToast("Please calculate budget first", "danger");
        return;
    }

    const fromCat = transferFromSelect.value;
    const toCat = transferToSelect.value;
    const transferAmount = parseFloat(transferAmountInput.value);
    const noteText = (transferNoteInput.value || "").trim();

    if (fromCat === toCat) {
        showToast("Please select two different categories/sub-funds to transfer", "danger");
        return;
    }

    if (isNaN(transferAmount) || transferAmount <= 0) {
        showToast("Please enter a valid transfer amount greater than 0", "danger");
        transferAmountInput.focus();
        return;
    }

    const availableAmount = getFundAmount(fromCat);
    if (transferAmount > availableAmount + 0.0001) {
        showToast(`Insufficient funds in ${getCategoryName(fromCat)}! Available: ${formatCurrency(availableAmount)}`, "danger");
        return;
    }

    // Execute transfer
    const newFromAmt = Math.max(0, availableAmount - transferAmount);
    const newToAmt = getFundAmount(toCat) + transferAmount;
    setFundAmount(fromCat, newFromAmt);
    setFundAmount(toCat, newToAmt);

    // Record Transfer Audit Log
    const logEntry = {
        id: Date.now(),
        type: "transfer",
        from: fromCat,
        fromName: getCategoryName(fromCat),
        to: toCat,
        toName: getCategoryName(toCat),
        amount: transferAmount,
        currency: appState.currency,
        note: noteText || "No note provided",
        date: new Date().toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
    };

    if (!Array.isArray(appState.transferLogs)) {
        appState.transferLogs = [];
    }
    appState.transferLogs.unshift(logEntry);
    if (appState.transferLogs.length > 25) {
        appState.transferLogs.pop();
    }

    // Reset inputs
    transferAmountInput.value = "";
    transferNoteInput.value = "";

    updateUIResults();
    saveStateToLocalStorage();

    showToast(`Transferred ${formatCurrency(transferAmount)} from ${getCategoryName(fromCat)} to ${getCategoryName(toCat)}!`, "success");
}

// --- Manual Direct Editor ---
function handleManualAllocation() {
    if (!appState.income || !appState.allocations) {
        showToast("Please calculate budget first", "danger");
        return;
    }

    const targetKey = manualTargetSelect.value;
    const newAmount = parseFloat(manualAmountInput.value);
    const noteText = (manualNoteInput.value || "").trim();

    if (isNaN(newAmount) || newAmount < 0) {
        showToast("Please enter a valid positive amount", "danger");
        manualAmountInput.focus();
        return;
    }

    const oldAmount = getFundAmount(targetKey);
    setFundAmount(targetKey, newAmount);

    // Log manual change in audit notes
    const diff = newAmount - oldAmount;
    const logEntry = {
        id: Date.now(),
        type: "manual",
        target: targetKey,
        targetName: getCategoryName(targetKey),
        oldAmount: oldAmount,
        newAmount: newAmount,
        diff: diff,
        amount: newAmount,
        currency: appState.currency,
        note: noteText || (diff >= 0 ? `Set to ${formatCurrency(newAmount)} (+${formatCurrency(diff)})` : `Set to ${formatCurrency(newAmount)} (${formatCurrency(diff)})`),
        date: new Date().toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
    };

    if (!Array.isArray(appState.transferLogs)) {
        appState.transferLogs = [];
    }
    appState.transferLogs.unshift(logEntry);
    if (appState.transferLogs.length > 25) {
        appState.transferLogs.pop();
    }

    manualAmountInput.value = "";
    manualNoteInput.value = "";

    updateUIResults();
    saveStateToLocalStorage();

    showToast(`${getCategoryName(targetKey)} updated to ${formatCurrency(newAmount)}!`, "success");
}

function getCategoryName(catKey) {
    return ALLOCATION_NAMES[catKey] || catKey;
}

function updateTransferBadges() {
    if (!appState.allocations) return;
    const fromCat = transferFromSelect.value;
    const toCat = transferToSelect.value;

    const fromAmt = getFundAmount(fromCat);
    const toAmt = getFundAmount(toCat);

    if (availableFromBadge) {
        availableFromBadge.textContent = `Available: ${formatCurrency(fromAmt)}`;
    }
    if (availableToBadge) {
        availableToBadge.textContent = `Current: ${formatCurrency(toAmt)}`;
    }
}

function updateManualCurrentBadge() {
    if (!appState.allocations || !manualTargetSelect) return;
    const targetKey = manualTargetSelect.value;
    const curAmt = getFundAmount(targetKey);
    if (manualCurrentBadge) {
        manualCurrentBadge.textContent = `Current: ${formatCurrency(curAmt)}`;
    }
}

function updateUIResults() {
    if (!appState.allocations || appState.income <= 0) return;
    normalizeAllocationsState();

    const needs = appState.allocations.needs || 0;
    const lifestyle = appState.allocations.lifestyle || 0;
    const ef = appState.allocations.ef || 0;
    const inVal = appState.allocations.in || 0;
    const learn = appState.allocations.learn || 0;
    const ins = appState.allocations.ins || 0;
    const debt = appState.allocations.debt || 0;

    const growth = ef + inVal + learn;
    const protection = ins + debt;

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

    // Update Progress Bars
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

    // Update Individual Sub-items directly from allocated state
    efElem.textContent = formatCurrency(ef);
    investElem.textContent = formatCurrency(inVal);
    learnElem.textContent = formatCurrency(learn);
    insElem.textContent = formatCurrency(ins);
    debtElem.textContent = formatCurrency(debt);

    // Update Currency Symbols & Interactive Badges
    const currConfig = CURRENCIES[appState.currency] || CURRENCIES.USD;
    if (transferCurrencySymbol) transferCurrencySymbol.textContent = currConfig.symbol;
    if (manualCurrencySymbol) manualCurrencySymbol.textContent = currConfig.symbol;

    updateTransferBadges();
    updateManualCurrentBadge();
    renderTransferLogs();

    // Unhide Results Section
    resultsSection.classList.remove("hidden");
}

// --- Render Transfer Audit History & Notes ---
function renderTransferLogs() {
    if (!transferLogList) return;
    transferLogList.innerHTML = "";

    if (!appState.transferLogs || appState.transferLogs.length === 0) {
        transferLogList.innerHTML = `<p class="empty-history-msg">No fund transfers recorded yet.</p>`;
        return;
    }

    appState.transferLogs.forEach(entry => {
        const itemEl = document.createElement("div");
        itemEl.className = "transfer-log-item";

        const formattedAmt = formatCurrency(entry.amount, entry.currency || appState.currency);

        if (entry.type === "manual") {
            const isGain = entry.diff >= 0;
            itemEl.innerHTML = `
                <div class="transfer-log-route">
                    <span class="log-badge log-manual"><i class="fa-solid fa-sliders"></i> Manual Set</span>
                    <span class="log-target"><strong>${entry.targetName}</strong></span>
                    <span class="log-arrow"><i class="fa-solid fa-arrow-right"></i></span>
                    <span class="log-amount ${isGain ? 'text-gain' : 'text-danger'}">${formattedAmt}</span>
                </div>
                <div class="transfer-log-details">
                    <p class="transfer-log-note"><i class="fa-solid fa-note-sticky"></i> ${escapeHTML(entry.note)}</p>
                    <span class="transfer-log-date">${entry.date}</span>
                </div>
            `;
        } else {
            itemEl.innerHTML = `
                <div class="transfer-log-route">
                    <span class="log-from">${entry.fromName}</span>
                    <span class="log-arrow"><i class="fa-solid fa-arrow-right-long"></i></span>
                    <span class="log-to">${entry.toName}</span>
                    <span class="log-amount text-accent">${formattedAmt}</span>
                </div>
                <div class="transfer-log-details">
                    <p class="transfer-log-note"><i class="fa-solid fa-note-sticky"></i> ${escapeHTML(entry.note)}</p>
                    <span class="transfer-log-date">${entry.date}</span>
                </div>
            `;
        }

        transferLogList.appendChild(itemEl);
    });
}

function escapeHTML(str) {
    if (!str) return "";
    return str.replace(/[&<>'"]/g, tag => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        "\"": "&quot;"
    }[tag] || tag));
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
                transferLogs: Array.isArray(parsed.transferLogs) ? parsed.transferLogs : [],
                history: Array.isArray(parsed.history) ? parsed.history : []
            };

            // Restore Currency Selection
            currencySelect.value = appState.currency;
            const selectedOption = currencySelect.options[currencySelect.selectedIndex];
            if (selectedOption) {
                const sym = selectedOption.getAttribute("data-symbol") || "$";
                currencySymbolSpan.textContent = sym;
                if (transferCurrencySymbol) transferCurrencySymbol.textContent = sym;
                if (manualCurrencySymbol) manualCurrencySymbol.textContent = sym;
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
            renderTransferLogs();
        }
    } catch (err) {
        console.error("Failed to load from LocalStorage:", err);
    }
}

// DELETE DATA FROM LOCALSTORAGE
function deleteAllLocalStorageData() {
    try {
        localStorage.removeItem(STORAGE_KEY);

        appState = {
            income: 0,
            currency: "USD",
            allocations: null,
            transferLogs: [],
            history: []
        };

        incomeInput.value = "";
        currencySelect.value = "USD";
        currencySymbolSpan.textContent = "$";
        if (transferCurrencySymbol) transferCurrencySymbol.textContent = "$";
        if (manualCurrencySymbol) manualCurrencySymbol.textContent = "$";
        resultsSection.classList.add("hidden");
        renderHistory();
        renderTransferLogs();

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
                    if (manualCurrencySymbol) manualCurrencySymbol.textContent = sym;
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




