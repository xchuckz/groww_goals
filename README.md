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

## Evaluations (Deliverable 3)

The application was evaluated across three core criteria: Mathematical Accuracy (benchmarked against spreadsheet formulas), Honesty (transparency of assumptions and risk disclosure), and Jargon Elimination (plain-English clarity for first-time Gen Z investors).

### 1. Mathematics and Edge Cases Evaluation

| Test | Expected Result | Actual Result | What You Fixed |
| :--- | :--- | :--- | :--- |
| **EMI Case 1 (Car Loan)**<br>Principal: ₹8,00,000, 9% p.a., 36 months | ₹25,439.79 per month (Excel `PMT`) | ₹25,439.79 | Standardized to reducing-balance monthly compounding formula. |
| **EMI Case 2 (Home Loan)**<br>Principal: ₹60,00,000, 8.5% p.a., 240 months | ₹52,069.39 per month (Excel `PMT`) | ₹52,069.39 | Handled multi-decade compounding precision without floating point drift. |
| **SIP FV Case 1 (Medium Term)**<br>₹10,000/mo, 12% p.a., 36 months | ₹4,35,076.47 total corpus (Excel `FV`) | ₹4,35,076.47 | Aligned with standard annuity due compounding factor $(1+r)$ for monthly SIPs. |
| **SIP FV Case 2 (Long Term)**<br>₹5,000/mo, 10% p.a., 60 months | ₹3,90,411.91 total corpus (Excel `FV`) | ₹3,90,411.91 | Verified against compound interest tables. |
| **SIP Required (Goal Planning)**<br>Target ₹8,00,000, 10% p.a., 36 months | ₹18,988.84 per month | ₹18,988.84 | Inverted annuity factor cleanly to derive exact required monthly investment. |
| **SWP Simulation 1 (Corpus Survival)**<br>Corpus ₹5,00,000, ₹5,000/mo, 8% p.a., 120 months | Corpus survives full term (never exhausted; final balance ₹1,95,089.94) | Corpus survives full term (exhaustedAt = null; final balance ₹1,95,089.94) | Implemented monthly loop compounding returns prior to sequential deduction. |
| **SWP Simulation 2 (Corpus Depletion)**<br>Corpus ₹1,00,000, ₹10,000/mo, 0% p.a., 24 months | Corpus runs out at Month 10 | Corpus runs out at Month 10 (exhaustedAt = 10) | Added exhaustion index tracking and clamped balances to zero. |
| **Edge Case: Zero Interest Rate**<br>Loan ₹1,20,000, 0% interest, 12 months | ₹10,000 per month ($P / n$) | ₹10,000 | Added guard clause to avoid division by zero when $r = 0$. |
| **Edge Case: Zero Amount**<br>Loan principal ₹0, or SIP monthly ₹0 | ₹0 output | ₹0 | Added early return guard clause returning 0 when input amount <= 0. |
| **Edge Case: Invalid Timeframe**<br>Zero or negative months entered for goal timeline | Form validation rejection | Form displays: "Please specify a target timeframe in months." and halts submission | Added validation on months input with min=1 and explicit error message. |
| **Edge Case: Down Payment Larger Than Price**<br>Target ₹5,00,000, existing savings ₹6,00,000 | ₹0 additional SIP required | ₹0 | Clamped remaining required amount using `Math.max(0, target - saved)` to prevent negative SIP output. |

### 2. Honesty and Transparency Evaluation

| Test | Expected Result | Actual Result | What You Fixed |
| :--- | :--- | :--- | :--- |
| **Path 1 Wealth Projections** | Every growth projection must clearly show return rate assumption and downside risk note. | Blended rate displayed (~10.4% p.a.); disclaimer notes: "Equity portions fluctuate day-to-day and can have negative returns over short 1-2 year periods." | Added explicit disclaimer box warning that equity values fluctuate and past returns are not guaranteed. |
| **Path 2 Goal Projections** | Conservative and expected return rates must be labeled as assumptions, not promised returns. | Rates labeled as Conservative (6.5%) and Expected (10%); includes interactive "-15% Market Drop Stress Test" card. | Added drawdown stress-test calculation and advice on shifting to debt near target date. |
| **Path 3 Purchase Comparison** | Loan vs. investment outcome must state tax rate assumptions and breakeven requirements honestly. | Displays Poor (6%), Expected (11%), and Bull (14%) cases; highlights breakeven return with post-July 2024 12.5% LTCG assumption. | Labeled LTCG tax as an illustrative assumption and provided an objective verdict on debt-free peace of mind vs. compounding. |
| **Stock and Index Mockups** | Static mock data must not be misrepresented as real-time market data. | Explicitly labeled as "Sample data mockup of Indian market indices (static illustration, not live feeds)." | Replaced "Real-time" claims with clear "sample data mockup" labels in UI and README. |
| **Fixed Deposit Rate Table** | Hardcoded bank rates must not be presented as permanent or official quotes. | Labeled as "Illustrative sample rates as of October 2026, not live quotes." | Added date-stamped illustrative disclaimer to avoid misleading users with stale bank rates. |
| **AutoPay SIP Setup Modal** | Must be clearly identified as a prototype mock, not a live payment mandate. | Header displays "Simulated Demo" and modal states: "Prototype Simulation: No real money will be deducted." | Removed live registration copy and added prominent yellow simulation alert banner. |

### 3. Jargon Elimination Evaluation (Unexplained Term = Fail)

| Test | Expected Result | Actual Result | What You Fixed |
| :--- | :--- | :--- | :--- |
| **SIP (Systematic Investment Plan)** | Unexplained acronym = FAIL. Must explain concept in plain terms without jargon. | PASS. Explained in glossary and in context as fixed monthly investments averaging market highs and lows. | Added interactive click-to-open glossary modal for all instances of "SIP". |
| **SWP (Systematic Withdrawal Plan)** | Unexplained acronym = FAIL. Must clarify monthly withdrawal mechanism. | PASS. Explained in Path 3 comparison and glossary as periodic withdrawals to fund EMIs or expenses. | Added plain-language definition emphasizing risk of corpus depletion. |
| **EMI (Equated Monthly Instalment)** | Unexplained acronym = FAIL. Must define principal + interest payment. | PASS. Explained as a fixed monthly payment covering loan principal plus bank interest. | Added glossary entry and breakdowns in table headers. |
| **Index Fund** | Unexplained term = FAIL. Must explain what an index is and why it matters. | PASS. Explained as a fund mirroring Nifty 50 or Sensex with low expense ratios and broad diversification. | Added plain-English explanation highlighting passive tracking and lower fees. |
| **Liquid Fund** | Unexplained term = FAIL. Must explain capital safety and liquidity. | PASS. Explained as debt funds investing in instruments up to 91 days, ideal for emergency funds with 24h withdrawal. | Connected directly to the Emergency Cushion bucket in Path 1. |
| **Debt Fund** | Unexplained term = FAIL. Must explain lower volatility and fixed income. | PASS. Explained as bond investments offering capital stability over 1 to 3 year horizons. | Defined in glossary and recommended for short-horizon goals. |
| **Hybrid Fund** | Unexplained term = FAIL. Must explain asset mix. | PASS. Explained as a blend of equity and debt providing moderate capital growth with downside cushion. | Defined in glossary and recommended for 3 to 5 year goals. |
| **LTCG (Long-Term Capital Gains)** | Unexplained acronym = FAIL. Must state holding period and tax rate. | PASS. Explained as tax on equity held >12 months, taxed at 12.5% for gains above ₹1.25 Lakh under post-July 2024 rules. | Added comprehensive glossary definition and contextual notes. |
| **FD (Fixed Deposit)** | Unexplained acronym = FAIL. Must state bank guarantee limits. | PASS. Explained as locked lump-sum bank deposits insured up to ₹5 Lakh by DICGC. | Added deposit insurance safety note in glossary. |
| **Emergency Fund** | Unexplained concept = FAIL. Must state concrete size rule. | PASS. Defined as 3 to 6 months of mandatory living expenses (rent, food, EMIs) kept in liquid assets. | Structured as the first required step in all financial roadmaps. |

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
