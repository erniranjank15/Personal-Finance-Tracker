# NK Finance Planner 💰

A modern, responsive, glassmorphic web application for calculating personal budget breakdowns based on customized monthly allocation rules, complete with LocalStorage persistence and data management features.

---

## 🌟 Key Features

- 🎨 **Glassmorphism UI**: High-end dark theme featuring frosted glass cards, vibrant ambient color gradients, and clean typography.
- 🧮 **Custom Allocation Logic**:
  - **Needs (50%)**: Essential expenses (rent, groceries, utilities).
  - **Growth (30%)**:
    - Emergency Fund (10%)
    - Investments (10%)
    - Learning & Skills (10%)
  - **Life Style (10%)**: Personal entertainment, hobbies, and dining.
  - **Protection (10%)**:
    - Insurance (5%)
    - Debt Repayment (5%)
- 📊 **Visual Budget Bar**: Dynamic multi-segment progress bar showing total budget distribution.
- 💱 **Multi-Currency Support**: Switch seamlessly between **USD ($)**, **INR (₹)**, **EUR (€)**, and **GBP (£)** with automatic currency formatting (`Intl.NumberFormat`).
- 💾 **LocalStorage Auto-Save**: Automatically saves monthly income, currency choice, and history log to browser storage (`localStorage`).
- 🗑️ **Delete LocalStorage Data**: Prominent **"Delete Data"** header button with a modal prompt to permanently clear saved data and reset the planner state.
- 📜 **Calculation History**: Log up to 10 past calculation entries with timestamps, individual delete buttons, and single-click reload into the form.
- 🔔 **Toast Notifications**: Interactive alert toasts providing immediate feedback for calculations, resets, and deletions.

---

## 📁 Project Structure

```
Finance Planner/
├── index.html       # HTML5 Semantic structure & modal components
├── style.css        # CSS3 custom properties, glassmorphism theme & responsive grid
├── script.js        # Calculation logic, currency formatting & LocalStorage handlers
└── README.md        # Project documentation
```

---

## 🚀 Getting Started

1. **Clone or Download** the project folder.
2. Open [`index.html`](file:///e:/Finance%20Planner/index.html) in any web browser (Chrome, Firefox, Edge, Safari).
3. Enter your monthly income and click **Calculate** to see your budget breakdown!

---

## 🛠️ Technology Stack

- **HTML5**: Semantic tags & accessible forms
- **CSS3**: Vanilla CSS with custom design tokens (`:root`), Flexbox, CSS Grid, and backdrop blur
- **JavaScript (ES6+)**: LocalStorage API, DOM Manipulation, `Intl.NumberFormat`
- **Fonts & Icons**: Google Fonts (*Plus Jakarta Sans*) & FontAwesome icons
