# NK Finance Planner 💰

A modern, responsive, glassmorphic web application for calculating personal budget breakdowns based on customized monthly allocation rules, complete with LocalStorage persistence and data management features.

---

## 🌟 Key Features

- 🎨 **Glassmorphism UI**: High-end dark theme featuring frosted glass cards, vibrant ambient color gradients, and clean typography.
- 🧮 **Custom Allocation Logic**:
  - **Needs (50%)**: Essential expenses:
    - Travel (15%)
    - Medical (15%)
    - Other Needs (20%)
  - **Growth (30%)**:
    - Emergency Fund (10%)
    - Investments (10%)
    - Learning & Skills (10%)
  - **Lifestyle (10%)**: Personal entertainment and self-care:
    - Clothes (4%)
    - Grooming (3%)
    - Other Lifestyle (3%)
  - **Protection (10%)**:
    - Insurance (5%)
    - Debt Repayment (5%)
- 🔄 **Fund Transfer / Move Money (Sub-funds & Main Funds)**:
  - Reallocate money between any main category (*Needs*, *Growth*, *Lifestyle*, *Protection*) or any granular sub-tabs (*Travel*, *Medical*, *Other Needs*, *Emergency Fund*, *Investments*, *Learning & Skills*, *Clothes*, *Grooming*, *Other Lifestyle*, *Insurance*, *Debt Repayment*).
  - Quick percentage chips (`25%`, `50%`, `Max`) for fast calculations.
  - Live available fund badges showing real-time balance for source and target funds.
  - **Transfer Notes & Audit Log**: Attach a reason/note to each transfer (e.g., *"Moved for medical insurance premium"*) to accurately identify and audit where money moved.
  - **"Reset to Default"** button to restore standard distribution anytime.
- 🎛️ **Manual Allocation Editor**:
  - Set custom monetary amounts into any category or sub-category tab. Both the **Amount** and **Reason / Note** fields are optional:
    - If **Amount** is left empty, the current allocated balance is preserved, allowing you to log a note or audit comment.
    - If **Note** is left empty, a descriptive automatic audit entry is created.
  - Dynamically recalculates overall budget totals, percentages, and progress bars.
- 📈 **Dynamic Live Totals & Percentage Tracking**:
  - Live dynamic total allocated amount and allocation percentage indicators in the summary banner.
  - Interactive multi-segment progress bar and legend that reflect transfers dynamically.
  - Sub-items dynamically re-distribute values based on parent category allocation pools.
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
