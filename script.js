const form = document.getElementById("transactionForm");
const desc = document.getElementById("desc");
const amount = document.getElementById("amount");
const type = document.getElementById("type");
const list = document.getElementById("transactionList");
const noDataMessage = document.getElementById("noDataMessage");
const clearBtn = document.getElementById("clearBtn");


let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let chartInstance = null; // Global variable for chart instance


// Form submission to add new transactions
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const transaction = {
    id: Date.now(),
    desc: desc.value,
    amount: +amount.value,
    type: type.value,
  };
  transactions.push(transaction);
  localStorage.setItem("transactions", JSON.stringify(transactions));
  form.reset();
  render();
});



// Reset the list and localStorage
clearBtn.addEventListener("click", () => {
  if (confirm("Are you sure you want to clear all transactions?")) {
    transactions = [];
    localStorage.removeItem("transactions");
    render(); // Re-render with empty data
  }
});


// Render the transactions and update the chart
function render() {
  list.innerHTML = "";
  let income = 0;
  let expense = 0;

  // If no transactions, show message
  if (transactions.length === 0) {
    noDataMessage.style.display = "block";
  } else {
    noDataMessage.style.display = "none";
  }

  transactions.forEach(tx => {
    const li = document.createElement("li");
    li.className = tx.type;
    li.textContent = `${tx.desc}: $${tx.amount}`;
    list.appendChild(li);

    if (tx.type === "income") income += tx.amount;
    else expense += tx.amount;
  });

  document.getElementById("income").textContent = income;
  document.getElementById("expense").textContent = expense;
  document.getElementById("balance").textContent = income - expense;

  drawChart(income, expense);
}



// Draw or update the chart
function drawChart(income, expense) {
  const ctx = document.getElementById("chart").getContext("2d");

  // If chart already exists, destroy it
  if (chartInstance) {
    chartInstance.destroy();
  }

  // Don't create the chart if there's no data
  if (income === 0 && expense === 0) return;

  // Create a new chart instance
  chartInstance = new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["Income", "Expense"],
      datasets: [{
        data: [income, expense],
        backgroundColor: ["green", "red"]
      }]
    },
    options: {
      responsive: true,
      animation: {
        animateScale: true
      }
    }
  });
}

// Initial render of the page
render();
