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
const summaryCashInHand = document.getElementById("summary-cash-in-hand");
const summaryAllocation = document.getElementById("summary-allocation");
const progressPercentage = document.getElementById("progress-percentage");

// Cash in Hand Elements
const cashForm = document.getElementById("cash-form");
const cashActionSelect = document.getElementById("cash-action-select");
const cashAmountInput = document.getElementById("cash-amount-input");
const cashNoteInput = document.getElementById("cash-note-input");
const cashCurrencySymbol = document.getElementById("cash-currency-symbol");
const currentCashDisplay = document.getElementById("current-cash-display");
const downloadPdfBtn = document.getElementById("download-pdf-btn");

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

const travelElem = document.querySelector(".travel");
const medicalElem = document.querySelector(".medical");
const otherneedsElem = document.querySelector(".other-needs");

const clothesElem = document.querySelector(".clothes");
const groomingElem = document.querySelector(".grooming");
const otherlifestyleElem = document.querySelector(".other-ls");

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
    INR: { symbol: "₹", locale: "en-IN" },
    USD: { symbol: "$", locale: "en-US" },
    EUR: { symbol: "€", locale: "de-DE" },
    GBP: { symbol: "£", locale: "en-GB" }
};

// Application State
let appState = {
    income: 0,
    cashInHand: 0,
    currency: "INR",
    allocations: null, // Detailed fund breakdown
    transferLogs: [],   // Audit logs with notes
    history: []
};

// --- Item Names & Hierarchy Mapping ---
const ALLOCATION_NAMES = {
    needs: "Needs (Total)",
    lifestyle: "Lifestyle (Total)",
    ef: "Emergency Fund",
    in: "Investments",
    learn: "Learning & Skills",
    ins: "Insurance",
    debt: "Debt Repayment",
    growth: "Growth (Total)",
    protection: "Protection (Total)",
    travel:"Travel",
    medical:"Medical",
    other_needs:"Other Needs",
    clothes:"Clothes",
    grooming:"Grooming",
    other_ls:"Other Life Style"


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
        if (cashCurrencySymbol) cashCurrencySymbol.textContent = symbol;

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

    // Cash in Hand Form Listener
    if (cashForm) {
        cashForm.addEventListener("submit", (e) => {
            e.preventDefault();
            handleCashTransaction();
        });
    }

    // Download PDF Button Listener
    if (downloadPdfBtn) {
        downloadPdfBtn.addEventListener("click", () => {
            generatePdfReport();
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
    const config = CURRENCIES[currencyCode] || CURRENCIES.INR;
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
        // Needs total is 50% of income:
        // Travel: 15%, Medical: 15%, Other Needs: 20% (Total = 50%)
        travel: income * 0.15,
        medical: income * 0.15,
        other_needs: income * 0.20,

        // Growth total is 30% of income (10% each):
        ef: income * 0.10,
        in: income * 0.10,
        learn: income * 0.10,

        // Lifestyle total is 10% of income:
        // Clothes: 4%, Grooming: 3%, Other Lifestyle: 3% (Total = 10%)
        clothes: income * 0.04,
        grooming: income * 0.03,
        other_ls: income * 0.03,

        // Protection total is 10% of income (5% each):
        ins: income * 0.05,
        debt: income * 0.05
    };
}

function normalizeAllocationsState() {
    if (!appState.allocations) return;

    // Check if legacy Needs main allocation exists without sub-funds
    if (appState.allocations.travel === undefined || appState.allocations.medical === undefined || appState.allocations.other_needs === undefined) {
        const needsTotal = appState.allocations.needs !== undefined ? appState.allocations.needs : (appState.income * 0.50);
        appState.allocations.travel = needsTotal * 0.30;
        appState.allocations.medical = needsTotal * 0.30;
        appState.allocations.other_needs = needsTotal * 0.40;
        delete appState.allocations.needs;
    }

    // Check if legacy Lifestyle main allocation exists without sub-funds
    if (appState.allocations.clothes === undefined || appState.allocations.grooming === undefined || appState.allocations.other_ls === undefined) {
        const lsTotal = appState.allocations.lifestyle !== undefined ? appState.allocations.lifestyle : (appState.income * 0.10);
        appState.allocations.clothes = lsTotal * 0.40;
        appState.allocations.grooming = lsTotal * 0.30;
        appState.allocations.other_ls = lsTotal * 0.30;
        delete appState.allocations.lifestyle;
    }

    // Check if legacy Growth main allocation exists
    if (appState.allocations.ef === undefined) {
        const growth = appState.allocations.growth || (appState.income * 0.30);
        appState.allocations.ef = growth / 3;
        appState.allocations.in = growth / 3;
        appState.allocations.learn = growth / 3;
        delete appState.allocations.growth;
    }

    // Check if legacy Protection main allocation exists
    if (appState.allocations.ins === undefined) {
        const prot = appState.allocations.protection || (appState.income * 0.10);
        appState.allocations.ins = prot / 2;
        appState.allocations.debt = prot / 2;
        delete appState.allocations.protection;
    }
}

function getFundAmount(key) {
    if (!appState.allocations) return 0;
    normalizeAllocationsState();

    if (key === "needs") {
        return (appState.allocations.travel || 0) + (appState.allocations.medical || 0) + (appState.allocations.other_needs || 0);
    }
    if (key === "growth") {
        return (appState.allocations.ef || 0) + (appState.allocations.in || 0) + (appState.allocations.learn || 0);
    }
    if (key === "lifestyle") {
        return (appState.allocations.clothes || 0) + (appState.allocations.grooming || 0) + (appState.allocations.other_ls || 0);
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

    if (key === "needs") {
        const currentTotal = getFundAmount("needs");
        if (currentTotal > 0) {
            const ratio = amount / currentTotal;
            appState.allocations.travel *= ratio;
            appState.allocations.medical *= ratio;
            appState.allocations.other_needs *= ratio;
        } else {
            appState.allocations.travel = amount * 0.30;
            appState.allocations.medical = amount * 0.30;
            appState.allocations.other_needs = amount * 0.40;
        }
    } else if (key === "growth") {
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
    } else if (key === "lifestyle") {
        const currentTotal = getFundAmount("lifestyle");
        if (currentTotal > 0) {
            const ratio = amount / currentTotal;
            appState.allocations.clothes *= ratio;
            appState.allocations.grooming *= ratio;
            appState.allocations.other_ls *= ratio;
        } else {
            appState.allocations.clothes = amount * 0.40;
            appState.allocations.grooming = amount * 0.30;
            appState.allocations.other_ls = amount * 0.30;
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
    const rawVal = manualAmountInput.value.trim();
    const noteText = (manualNoteInput.value || "").trim();

    const oldAmount = getFundAmount(targetKey);

    // If amount is left empty/omitted, keep the existing amount
    let newAmount = rawVal === "" ? oldAmount : parseFloat(rawVal);

    if (isNaN(newAmount) || newAmount < 0) {
        showToast("Please enter a valid positive amount or leave empty to keep current", "danger");
        manualAmountInput.focus();
        return;
    }

    // If neither amount changed nor a note was provided, nothing to update
    if (rawVal === "" && !noteText) {
        showToast(`No change made for ${getCategoryName(targetKey)} (Current: ${formatCurrency(oldAmount)})`, "info");
        return;
    }

    setFundAmount(targetKey, newAmount);

    // Log manual change in audit notes
    const diff = newAmount - oldAmount;
    let defaultNote;
    if (rawVal === "") {
        defaultNote = `Note attached: ${formatCurrency(newAmount)}`;
    } else if (diff === 0) {
        defaultNote = `Amount verified at ${formatCurrency(newAmount)}`;
    } else if (diff > 0) {
        defaultNote = `Set to ${formatCurrency(newAmount)} (+${formatCurrency(diff)})`;
    } else {
        defaultNote = `Set to ${formatCurrency(newAmount)} (${formatCurrency(diff)})`;
    }

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
        note: noteText || defaultNote,
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

    if (rawVal !== "") {
        showToast(`${getCategoryName(targetKey)} updated to ${formatCurrency(newAmount)}!`, "success");
    } else {
        showToast(`Note logged for ${getCategoryName(targetKey)}!`, "success");
    }
}

// --- Cash in Hand Management ---
function handleCashTransaction() {
    if (!cashAmountInput) return;
    const action = cashActionSelect.value;
    const amountVal = parseFloat(cashAmountInput.value);
    const noteText = (cashNoteInput.value || "").trim();

    if (isNaN(amountVal) || amountVal < 0) {
        showToast("Please enter a valid cash amount greater than or equal to 0", "danger");
        cashAmountInput.focus();
        return;
    }

    const prevCash = Number(appState.cashInHand) || 0;
    let newCash = prevCash;
    let actionDesc = "";

    if (action === "set") {
        newCash = amountVal;
        actionDesc = `Cash in hand set to ${formatCurrency(newCash)}`;
    } else if (action === "add") {
        newCash = prevCash + amountVal;
        actionDesc = `Added ${formatCurrency(amountVal)} to Cash in hand`;
    } else if (action === "deduct") {
        if (amountVal > prevCash) {
            showToast(`Cannot deduct ${formatCurrency(amountVal)}! Current cash available: ${formatCurrency(prevCash)}`, "danger");
            return;
        }
        newCash = Math.max(0, prevCash - amountVal);
        actionDesc = `Spent/Deducted ${formatCurrency(amountVal)} from Cash in hand`;
    }

    appState.cashInHand = newCash;

    // Record Cash Audit Log
    const logEntry = {
        id: Date.now(),
        type: "manual",
        target: "cash",
        targetName: "Cash in Hand",
        oldAmount: prevCash,
        newAmount: newCash,
        diff: newCash - prevCash,
        amount: newCash,
        currency: appState.currency,
        note: noteText ? `${actionDesc} (${noteText})` : actionDesc,
        date: new Date().toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
    };

    if (!Array.isArray(appState.transferLogs)) {
        appState.transferLogs = [];
    }
    appState.transferLogs.unshift(logEntry);
    if (appState.transferLogs.length > 25) {
        appState.transferLogs.pop();
    }

    cashAmountInput.value = "";
    if (cashNoteInput) cashNoteInput.value = "";

    updateUIResults();
    saveStateToLocalStorage();
    showToast(actionDesc, "success");
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

    
    const ef = appState.allocations.ef || 0;
    const inVal = appState.allocations.in || 0;
    const learn = appState.allocations.learn || 0;
    const ins = appState.allocations.ins || 0;
    const debt = appState.allocations.debt || 0;
    const travel = appState.allocations.travel || 0;
    const medical = appState.allocations.medical || 0;
    const other_needs = appState.allocations.other_needs || 0;
    const clothes = appState.allocations.clothes || 0;
    const grooming = appState.allocations.grooming || 0;
    const other_ls = appState.allocations.other_ls || 0;

    const needs = travel + medical + other_needs;
    const growth = ef + inVal + learn;
    const lifestyle = clothes + grooming + other_ls;
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
    if (travelElem) travelElem.textContent = formatCurrency(travel);
    if (medicalElem) medicalElem.textContent = formatCurrency(medical);
    if (otherneedsElem) otherneedsElem.textContent = formatCurrency(other_needs);

    if (efElem) efElem.textContent = formatCurrency(ef);
    if (investElem) investElem.textContent = formatCurrency(inVal);
    if (learnElem) learnElem.textContent = formatCurrency(learn);

    if (clothesElem) clothesElem.textContent = formatCurrency(clothes);
    if (groomingElem) groomingElem.textContent = formatCurrency(grooming);
    if (otherlifestyleElem) otherlifestyleElem.textContent = formatCurrency(other_ls);

    if (insElem) insElem.textContent = formatCurrency(ins);
    if (debtElem) debtElem.textContent = formatCurrency(debt);

    // Update Currency Symbols & Interactive Badges
    const currConfig = CURRENCIES[appState.currency] || CURRENCIES.USD;
    if (transferCurrencySymbol) transferCurrencySymbol.textContent = currConfig.symbol;
    if (manualCurrencySymbol) manualCurrencySymbol.textContent = currConfig.symbol;
    if (cashCurrencySymbol) cashCurrencySymbol.textContent = currConfig.symbol;

    if (summaryCashInHand) {
        summaryCashInHand.textContent = formatCurrency(appState.cashInHand || 0);
    }
    if (currentCashDisplay) {
        currentCashDisplay.textContent = formatCurrency(appState.cashInHand || 0);
    }

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
                cashInHand: Number(parsed.cashInHand) || 0,
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
                if (cashCurrencySymbol) cashCurrencySymbol.textContent = sym;
            }

            if (currentCashDisplay) {
                currentCashDisplay.textContent = formatCurrency(appState.cashInHand || 0);
            }
            if (summaryCashInHand) {
                summaryCashInHand.textContent = formatCurrency(appState.cashInHand || 0);
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
            cashInHand: 0,
            currency: "INR",
            allocations: null,
            transferLogs: [],
            history: []
        };

        incomeInput.value = "";
        currencySelect.value = "INR";
        currencySymbolSpan.textContent = "₹";
        if (transferCurrencySymbol) transferCurrencySymbol.textContent = "₹";
        if (manualCurrencySymbol) manualCurrencySymbol.textContent = "₹";
        if (cashCurrencySymbol) cashCurrencySymbol.textContent = "₹";
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

// --- PDF Currency & Clean Formatter ---
function formatPdfCurrency(amount) {
    const val = Number(amount) || 0;
    const formatted = val.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    if (appState.currency === "INR") {
        return `Rs. ${formatted}`;
    }
    const sym = (CURRENCIES[appState.currency] && CURRENCIES[appState.currency].symbol) || "$";
    return `${sym} ${formatted}`;
}

// --- PDF Report Generation with Pie Chart ---
function generatePdfReport() {
    if (!appState.income || !appState.allocations) {
        showToast("Please enter income and calculate before generating report", "danger");
        return;
    }

    if (!window.jspdf || !window.jspdf.jsPDF) {
        showToast("PDF generation library is still loading. Please try again in a moment.", "danger");
        return;
    }

    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: "portrait",
            unit: "pt",
            format: "a4"
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        // Palette
        const colorPrimary = [99, 102, 241];
        const colorDark = [15, 23, 42];
        const colorText = [30, 41, 59];
        const colorMuted = [100, 116, 139];

        normalizeAllocationsState();

        const needs = getFundAmount("needs");
        const growth = getFundAmount("growth");
        const lifestyle = getFundAmount("lifestyle");
        const protection = getFundAmount("protection");
        const totalAllocated = needs + growth + lifestyle + protection;
        const income = appState.income;
        const cash = Number(appState.cashInHand) || 0;

        // 1. Premium Header Banner
        doc.setFillColor(15, 23, 42);
        doc.rect(0, 0, pageWidth, 90, "F");

        // Top decorative accent line
        doc.setFillColor(99, 102, 241);
        doc.rect(0, 0, pageWidth, 4, "F");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.setTextColor(255, 255, 255);
        doc.text("NK Finance Planner", 40, 42);

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(148, 163, 184);
        doc.text("Comprehensive Budget Allocation & Liquid Cash Report", 40, 62);

        const dateStr = new Date().toLocaleDateString(undefined, {
            year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
        });
        doc.text(`Generated: ${dateStr}`, pageWidth - 40, 42, { align: "right" });
        doc.text(`Base Currency: ${appState.currency}`, pageWidth - 40, 62, { align: "right" });

        // 2. Summary KPI Cards
        const kpiY = 108;
        const cardWidth = (pageWidth - 80 - 30) / 4;
        const cardHeight = 60;

        const kpis = [
            { label: "MONTHLY INCOME", val: formatPdfCurrency(income), color: [79, 70, 229] },
            { label: "TOTAL ALLOCATED", val: formatPdfCurrency(totalAllocated), color: [16, 185, 129] },
            { label: "CASH IN HAND", val: formatPdfCurrency(cash), color: [6, 182, 212] },
            { label: "ALLOCATION RATIO", val: `${((totalAllocated / income) * 100).toFixed(1)}%`, color: [245, 158, 11] }
        ];

        kpis.forEach((kpi, idx) => {
            const cardX = 40 + idx * (cardWidth + 10);
            doc.setFillColor(248, 250, 252);
            doc.roundedRect(cardX, kpiY, cardWidth, cardHeight, 6, 6, "F");

            doc.setDrawColor(226, 232, 240);
            doc.setLineWidth(1);
            doc.roundedRect(cardX, kpiY, cardWidth, cardHeight, 6, 6, "S");

            doc.setFontSize(7.5);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(colorMuted[0], colorMuted[1], colorMuted[2]);
            doc.text(kpi.label, cardX + 12, kpiY + 20);

            doc.setFontSize(12);
            doc.setTextColor(kpi.color[0], kpi.color[1], kpi.color[2]);
            doc.text(kpi.val, cardX + 12, kpiY + 44);
        });

        // 3. Render High-Resolution Donut/Pie Chart on Canvas (with native Rupee glyph support)
        const chartY = 185;
        const chartBoxWidth = pageWidth - 80;
        const chartBoxHeight = 175;

        // Container card for chart
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(40, chartY, chartBoxWidth, chartBoxHeight, 6, 6, "F");
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(40, chartY, chartBoxWidth, chartBoxHeight, 6, 6, "S");

        const pieCanvas = document.createElement("canvas");
        pieCanvas.width = chartBoxWidth * 2;
        pieCanvas.height = chartBoxHeight * 2;
        const ctx = pieCanvas.getContext("2d");
        ctx.scale(2, 2);

        const slices = [
            { label: "Needs", value: needs, color: "#3b82f6" },
            { label: "Growth", value: growth, color: "#10b981" },
            { label: "Lifestyle", value: lifestyle, color: "#f59e0b" },
            { label: "Protection", value: protection, color: "#ec4899" }
        ];

        const totalSliceVal = slices.reduce((sum, s) => sum + s.value, 0) || 1;
        const centerX = 110;
        const centerY = 88;
        const radius = 68;
        let startAngle = -Math.PI / 2;

        slices.forEach(slice => {
            const sliceAngle = (slice.value / totalSliceVal) * 2 * Math.PI;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
            ctx.closePath();
            ctx.fillStyle = slice.color;
            ctx.fill();
            startAngle += sliceAngle;
        });

        // Donut center hole
        ctx.beginPath();
        ctx.arc(centerX, centerY, 36, 0, 2 * Math.PI);
        ctx.fillStyle = "#ffffff";
        ctx.fill();

        // Inner text inside donut hole
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "bold 11px Arial, sans-serif";
        ctx.fillStyle = "#0f172a";
        ctx.fillText("Budget", centerX, centerY - 6);
        ctx.font = "normal 10px Arial, sans-serif";
        ctx.fillStyle = "#64748b";
        ctx.fillText("Split", centerX, centerY + 8);

        // Legend Grid on Canvas with full currency formatting
        const legendX1 = 230;
        const legendX2 = 380;
        let legY1 = 45;
        let legY2 = 45;

        ctx.textAlign = "left";
        ctx.textBaseline = "alphabetic";

        slices.forEach((slice, idx) => {
            const isLeft = idx % 2 === 0;
            const lx = isLeft ? legendX1 : legendX2;
            const ly = isLeft ? legY1 : legY2;
            const pct = ((slice.value / totalSliceVal) * 100).toFixed(1);

            // Dot
            ctx.fillStyle = slice.color;
            ctx.beginPath();
            ctx.arc(lx + 5, ly - 4, 5, 0, 2 * Math.PI);
            ctx.fill();

            // Label & Percentage
            ctx.font = "bold 12px Arial, sans-serif";
            ctx.fillStyle = "#1e293b";
            ctx.fillText(`${slice.label} (${pct}%)`, lx + 16, ly);

            // Amount with Rupee symbol
            ctx.font = "600 11px Arial, sans-serif";
            ctx.fillStyle = slice.color;
            ctx.fillText(`${formatCurrency(slice.value)}`, lx + 16, ly + 18);

            if (isLeft) legY1 += 48;
            else legY2 += 48;
        });

        const pieImgData = pieCanvas.toDataURL("image/png");
        doc.addImage(pieImgData, "PNG", 40, chartY, chartBoxWidth, chartBoxHeight);

        // 4. Detailed Tab & Sub-Tab Allocation Table
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(colorText[0], colorText[1], colorText[2]);
        doc.text("Tab & Sub-Tab Allocation Breakdown", 40, 385);

        const tableBody = [
            // Needs
            [{ content: "Needs (Total)", styles: { fontStyle: "bold", fillColor: [239, 246, 255], textColor: [30, 64, 175] } },
             { content: "Main Category", styles: { fontStyle: "bold", fillColor: [239, 246, 255] } },
             { content: formatPdfCurrency(needs), styles: { fontStyle: "bold", fillColor: [239, 246, 255], textColor: [30, 64, 175] } },
             { content: `${((needs / income) * 100).toFixed(1)}%`, styles: { fontStyle: "bold", fillColor: [239, 246, 255] } }],
            ["   • Travel", "Needs Sub-Tab", formatPdfCurrency(appState.allocations.travel || 0), `${(((appState.allocations.travel || 0) / income) * 100).toFixed(1)}%`],
            ["   • Medical", "Needs Sub-Tab", formatPdfCurrency(appState.allocations.medical || 0), `${(((appState.allocations.medical || 0) / income) * 100).toFixed(1)}%`],
            ["   • Other Needs", "Needs Sub-Tab", formatPdfCurrency(appState.allocations.other_needs || 0), `${(((appState.allocations.other_needs || 0) / income) * 100).toFixed(1)}%`],

            // Growth
            [{ content: "Growth (Total)", styles: { fontStyle: "bold", fillColor: [236, 253, 245], textColor: [6, 95, 70] } },
             { content: "Main Category", styles: { fontStyle: "bold", fillColor: [236, 253, 245] } },
             { content: formatPdfCurrency(growth), styles: { fontStyle: "bold", fillColor: [236, 253, 245], textColor: [6, 95, 70] } },
             { content: `${((growth / income) * 100).toFixed(1)}%`, styles: { fontStyle: "bold", fillColor: [236, 253, 245] } }],
            ["   • Emergency Fund", "Growth Sub-Tab", formatPdfCurrency(appState.allocations.ef || 0), `${(((appState.allocations.ef || 0) / income) * 100).toFixed(1)}%`],
            ["   • Investments", "Growth Sub-Tab", formatPdfCurrency(appState.allocations.in || 0), `${(((appState.allocations.in || 0) / income) * 100).toFixed(1)}%`],
            ["   • Learning & Skills", "Growth Sub-Tab", formatPdfCurrency(appState.allocations.learn || 0), `${(((appState.allocations.learn || 0) / income) * 100).toFixed(1)}%`],

            // Lifestyle
            [{ content: "Lifestyle (Total)", styles: { fontStyle: "bold", fillColor: [254, 243, 199], textColor: [146, 64, 14] } },
             { content: "Main Category", styles: { fontStyle: "bold", fillColor: [254, 243, 199] } },
             { content: formatPdfCurrency(lifestyle), styles: { fontStyle: "bold", fillColor: [254, 243, 199], textColor: [146, 64, 14] } },
             { content: `${((lifestyle / income) * 100).toFixed(1)}%`, styles: { fontStyle: "bold", fillColor: [254, 243, 199] } }],
            ["   • Clothes", "Lifestyle Sub-Tab", formatPdfCurrency(appState.allocations.clothes || 0), `${(((appState.allocations.clothes || 0) / income) * 100).toFixed(1)}%`],
            ["   • Grooming", "Lifestyle Sub-Tab", formatPdfCurrency(appState.allocations.grooming || 0), `${(((appState.allocations.grooming || 0) / income) * 100).toFixed(1)}%`],
            ["   • Other Lifestyle", "Lifestyle Sub-Tab", formatPdfCurrency(appState.allocations.other_ls || 0), `${(((appState.allocations.other_ls || 0) / income) * 100).toFixed(1)}%`],

            // Protection
            [{ content: "Protection (Total)", styles: { fontStyle: "bold", fillColor: [253, 242, 248], textColor: [157, 23, 77] } },
             { content: "Main Category", styles: { fontStyle: "bold", fillColor: [253, 242, 248] } },
             { content: formatPdfCurrency(protection), styles: { fontStyle: "bold", fillColor: [253, 242, 248], textColor: [157, 23, 77] } },
             { content: `${((protection / income) * 100).toFixed(1)}%`, styles: { fontStyle: "bold", fillColor: [253, 242, 248] } }],
            ["   • Insurance", "Protection Sub-Tab", formatPdfCurrency(appState.allocations.ins || 0), `${(((appState.allocations.ins || 0) / income) * 100).toFixed(1)}%`],
            ["   • Debt Repayment", "Protection Sub-Tab", formatPdfCurrency(appState.allocations.debt || 0), `${(((appState.allocations.debt || 0) / income) * 100).toFixed(1)}%`]
        ];

        doc.autoTable({
            startY: 398,
            head: [["Category / Sub-Tab", "Level", "Allocated Amount", "% of Monthly Income"]],
            body: tableBody,
            margin: { left: 40, right: 40 },
            theme: "grid",
            headStyles: {
                fillColor: [15, 23, 42],
                textColor: [255, 255, 255],
                fontSize: 8.5,
                fontStyle: "bold"
            },
            bodyStyles: {
                fontSize: 8,
                textColor: [30, 41, 59]
            },
            alternateRowStyles: {
                fillColor: [248, 250, 252]
            }
        });

        // 5. Transfer Audit & Notes Log Table (if available)
        let lastY = doc.lastAutoTable.finalY + 22;

        if (appState.transferLogs && appState.transferLogs.length > 0) {
            // Check if page break is needed
            if (lastY > pageHeight - 130) {
                doc.addPage();
                lastY = 40;
            }

            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(colorText[0], colorText[1], colorText[2]);
            doc.text("Recent Activity & Transfer Notes", 40, lastY);

            const logRows = appState.transferLogs.slice(0, 8).map(entry => {
                if (entry.type === "manual") {
                    return [
                        entry.date,
                        `Set ${entry.targetName}`,
                        formatPdfCurrency(entry.amount),
                        entry.note || "Manual allocation"
                    ];
                }
                return [
                    entry.date,
                    `${entry.fromName} -> ${entry.toName}`,
                    formatPdfCurrency(entry.amount),
                    entry.note || "Fund re-allocation"
                ];
            });

            doc.autoTable({
                startY: lastY + 10,
                head: [["Date / Time", "Action / Route", "Amount", "Note / Reason"]],
                body: logRows,
                margin: { left: 40, right: 40 },
                theme: "striped",
                headStyles: {
                    fillColor: [79, 70, 229],
                    textColor: [255, 255, 255],
                    fontSize: 8
                },
                bodyStyles: {
                    fontSize: 7.5
                }
            });

            lastY = doc.lastAutoTable.finalY + 20;
        }

        // Footer Page Number & Branding
        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(148, 163, 184);
            doc.text(
                `NK Finance Planner • Page ${i} of ${totalPages}`,
                pageWidth / 2,
                pageHeight - 20,
                { align: "center" }
            );
        }

        const fileName = `Finance_Report_${new Date().toISOString().slice(0, 10)}.pdf`;
        doc.save(fileName);
        showToast("PDF Financial Report downloaded successfully!", "success");

    } catch (err) {
        console.error("PDF generation error:", err);
        showToast("Error generating PDF: " + err.message, "danger");
    }
}





