# Groww Goals

> **A goal-first financial planning and investment roadmap layer built for first-time Indian investors aged 20–26.**

[![Vanilla JS](https://img.shields.io/badge/JavaScript-Vanilla%20ES6%2B-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![CSS3](https://img.shields.io/badge/CSS3-Modern%20Design%20System-1572B6?logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-Zero-00D09C)](https://github.com/xchuckz/groww_goals)
[![Responsive](https://img.shields.io/badge/Layout-Mobile--First%20%26%20Responsive-brightgreen)](https://github.com/xchuckz/groww_goals)

---

## The Problem and Core Concept

First-time Gen Z investors in India frequently have disposable income and strong investing intent, but encounter three critical hurdles:
1. **Uncertainty of starting point:** Not knowing how much to invest, which asset class to choose, or how long to commit.
2. **Abstract returns:** Traditional apps showcase complex funds and historical CAGR without connecting them to tangible life milestones (buying a car, funding a vacation, building an emergency cushion).
3. **Hidden risks and opportunity costs:** Lack of transparency around what happens during market corrections or whether taking a loan vs. paying full cash makes mathematical sense.

**Groww Goals** is designed as a goal-oriented layer on top of the Groww fintech experience. It starts from the user's intent, models realistic conservative and expected outcomes, illustrates downside stress tests, and provides concrete, ordered steps without making unrealistic return promises.

---

## Key User Flows

### 1. Save Money (No Specific Goal)
* Designed for users who want to build disciplined savings and wealth without a fixed purchase item in mind.
* Uses age heuristics (100 - age) and user risk appetite to generate an automated 4-bucket portfolio split:
  * **Emergency Cushion (20%):** Liquid funds / sweep-in bank FDs for immediate safety.
  * **Debt and Stability (10–30%):** Short-duration debt funds and corporate bonds.
  * **Equity and Index Funds (40–70%):** Nifty 50 and broad market index funds for compounding.
  * **Gold Hedge (10%):** Sovereign gold funds / Gold ETFs as an inflation buffer.
* Displays projected wealth at 1, 3, 5, and 10-year horizons compared against a standard 3.5% bank savings account.

### 2. Saving for a Specific Goal
* Supports target categories: **Car / Vehicle**, **House Downpayment**, **Laptop / Gadgets**, **Vacation / Travel**, **Emergency Fund**, **Higher Education**, **Wedding**, or **Custom Goal**.
* Clean input architecture without forced pre-filled defaults, accompanied by convenient quick-selection chips.
* Deterministic financial math calculates exact required monthly SIP across:
  * **Conservative scenario** (Fixed income / hybrid return assumption)
  * **Expected scenario** (Broad index return assumption)
* Features:
  * **Horizon-specific category guidance:** Recommends liquid funds for <1 year, short debt for 1–3 years, hybrid funds for 3–5 years, and equity index funds for 5+ years.
  * **Opportunity cost comparison:** Contrasts investing gains against leaving money in a savings account.
  * **Market Crash Stress Test (-15%):** Quantifies potential drawdowns and advises whether to hold or shift profits into debt near the target date.
  * **Direct Save and Dashboard Tracking:** Saves the goal with active progress tracking and milestone badges (25%, 50%, 75%, 100%).

### 3. Buy Something (Capital Available)
* Decision engine for users who already have cash in hand to make a major purchase.
* Directly compares three financial pathways side-by-side:
  * **Path A (100% Cash):** Zero debt and zero interest outflow, but exhausts liquidity.
  * **Path B (50% Down Payment + Manageable EMI):** Balanced liquidity with low interest burden.
  * **Path C (Minimum Down + Invest the Rest and Pay EMIs):** Evaluates whether investing surplus capital into equity/hybrid funds yields higher post-tax compounding than the loan interest cost.
* Highlights the required break-even return after an assumed 12.5% LTCG tax (reflecting the current post-July 2024 equity LTCG rate for gains above ₹1.25 Lakh; explicitly labeled as an illustrative modeling assumption, not tax advice).

---

## Additional Features

* **Active Goals Dashboard:** Track ongoing goals, view milestone progress bars, and run monthly check-ins to update saved balances in `localStorage`.
* **Simulated Groww AutoPay Setup:** Interactive prototype simulation demonstrating the handoff to monthly SIP mandate setup with date selection (1st, 5th, 10th, 15th, 20th) and payment mode selection (UPI AutoPay / NetBanking e-Mandate). Clearly marked as simulated; no real bank data, mandates, or payments are processed.
* **Financial Glossary Modal:** Educational bottom-sheet explainers for key concepts: SIP, SWP, Index Funds, Liquid Funds, Debt Funds, LTCG tax, and Emergency Funds.
* **Working Explore Tabs:**
  * **Stocks:** Sample data mockups of major Indian indices (NIFTY 50, SENSEX) and trending stocks (static illustrative sample data only, not live market feeds).
  * **Mutual Funds:** Curated categories (Index funds, Flexi cap, Liquid funds).
  * **FDs:** Fixed deposit comparisons with illustrative benchmark rates (sample figures as of October 2026 for demonstration; not live quotes or official bank rate cards).
  * **Profile:** Investor details, KYC status, data reset utilities, and built-in financial math test diagnostics.
* **Theme Support:** Dark mode (default Groww dark slate palette) and Light mode toggle with immediate visual feedback.
* **Clean and Professional Aesthetics:** No emojis, high-contrast readable typography (`Plus Jakarta Sans`), and Groww brand emerald accent (`#00D09C`).

---

## Repository Structure

```
groww_goals/
├── index.html        # Semantic HTML5 app shell & accessible modals
├── styles.css        # Responsive design system, CSS custom properties & layout
├── app.js            # Pure Vanilla JS application router & UI controllers
├── math.js           # Deterministic financial math library with unit test suite
├── state.js          # Client-side state manager with localStorage persistence
├── .gitignore        # Ignores sensitive environment, build, and OS files
└── README.md         # Documentation and project overview
```

---

## Financial Math Implementation

All calculations in [`math.js`](math.js) are deterministic, pure functions with zero external dependencies:
* **Reducing-Balance EMI:** $P \cdot \frac{r(1+r)^n}{(1+r)^n - 1}$
* **SIP Future Value:** $M \cdot \frac{(1+r)^n - 1}{r} \cdot (1+r)$
* **Target SIP Required:** Inverse of SIP future value with compound lump-sum deduction.
* **Systematic Withdrawal Plan (SWP) Simulation:** Monthly portfolio balance compounding with sequential withdrawal exhaustion detection.
* **Break-Even Return Solver:** Calculates the minimum post-tax investment return needed to surpass total loan interest.

---

## Running Locally

This prototype uses native ES modules (`type="module"`), so it runs on any local HTTP server:

```bash
# Clone the repository
git clone https://github.com/xchuckz/groww_goals.git

# Navigate into the project folder
cd groww_goals

# Start a local static server (Python 3)
python -m http.server 8080

# Alternatively, using Node.js / npx
npx serve .
```

Open `http://localhost:8080` in any modern web browser.

---

## License and Disclaimer

This project is a design prototype built for demonstration and educational purposes. Financial projections, return rates, and calculations are illustrative models and do not constitute financial or investment advice.
