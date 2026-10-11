/**
 * Groww Goals - Financial Math Library
 * All calculations are deterministic pure functions.
 * No external dependencies. No DOM references.
 * Assumptions are explicit in each function's JSDoc.
 */

"use strict";

// ─── EMI ────────────────────────────────────────────────────────────────────

/**
 * Monthly EMI for a reducing-balance loan.
 * Formula: P * r * (1+r)^n / ((1+r)^n - 1)
 * @param {number} principal  - Loan amount in rupees
 * @param {number} annualRate - Annual interest rate as percentage (e.g. 9 for 9%)
 * @param {number} tenureMonths - Loan tenure in months
 * @returns {number} Monthly EMI in rupees, or 0 if any input is invalid
 */
export function calcEMI(principal, annualRate, tenureMonths) {
  if (principal <= 0 || tenureMonths <= 0) return 0;
  if (annualRate === 0) return principal / tenureMonths;
  const r = annualRate / 100 / 12;
  const n = tenureMonths;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

/**
 * Total interest paid over the life of a loan.
 * @param {number} principal
 * @param {number} annualRate
 * @param {number} tenureMonths
 * @returns {number}
 */
export function totalInterest(principal, annualRate, tenureMonths) {
  if (principal <= 0 || tenureMonths <= 0) return 0;
  const emi = calcEMI(principal, annualRate, tenureMonths);
  return emi * tenureMonths - principal;
}

/**
 * Total cost (principal + interest).
 */
export function totalCost(principal, annualRate, tenureMonths) {
  return principal + totalInterest(principal, annualRate, tenureMonths);
}

// ─── SIP ─────────────────────────────────────────────────────────────────────

/**
 * Future value of a fixed monthly SIP.
 * Assumes end-of-month investments, monthly compounding.
 * @param {number} monthly   - Monthly investment in rupees
 * @param {number} annualReturn - Annual return as percentage (e.g. 10 for 10%)
 * @param {number} months    - Total number of months
 * @returns {number} Corpus at the end of the period
 */
export function sipFutureValue(monthly, annualReturn, months) {
  if (monthly <= 0 || months <= 0) return 0;
  if (annualReturn === 0) return monthly * months;
  const r = annualReturn / 100 / 12;
  return monthly * ((Math.pow(1 + r, months) - 1) / r) * (1 + r);
}

/**
 * Monthly SIP needed to reach a goal amount.
 * Inverse of sipFutureValue.
 * @param {number} targetAmount
 * @param {number} annualReturn - Annual return as percentage
 * @param {number} months
 * @returns {number} Monthly SIP amount
 */
export function sipRequired(targetAmount, annualReturn, months) {
  if (targetAmount <= 0 || months <= 0) return 0;
  if (annualReturn === 0) return targetAmount / months;
  const r = annualReturn / 100 / 12;
  const fvFactor = ((Math.pow(1 + r, months) - 1) / r) * (1 + r);
  return targetAmount / fvFactor;
}

/**
 * Future value of a lump sum already saved.
 * @param {number} amount
 * @param {number} annualReturn
 * @param {number} months
 */
export function lumpSumFV(amount, annualReturn, months) {
  if (amount <= 0 || months <= 0) return 0;
  if (annualReturn === 0) return amount;
  const r = annualReturn / 100 / 12;
  return amount * Math.pow(1 + r, months);
}

/**
 * Monthly SIP needed after accounting for an existing lump sum.
 * @param {number} targetAmount  - Total goal amount
 * @param {number} alreadySaved  - Amount already saved
 * @param {number} annualReturn
 * @param {number} months
 */
export function sipRequiredWithLumpSum(targetAmount, alreadySaved, annualReturn, months) {
  if (months <= 0) return 0;
  const lumpSumGrowth = lumpSumFV(alreadySaved, annualReturn, months);
  const remaining = Math.max(0, targetAmount - lumpSumGrowth);
  return sipRequired(remaining, annualReturn, months);
}

// ─── SWP (Systematic Withdrawal Plan) ─────────────────────────────────────────

/**
 * Simulate SWP month by month.
 * Each month: corpus earns return, then withdrawal is made.
 * @param {number} initialCorpus
 * @param {number} monthlyWithdrawal
 * @param {number} annualReturn
 * @param {number} months
 * @returns {{ monthlyBalances: number[], exhaustedAt: number|null }}
 *   exhaustedAt is the month number (1-indexed) when corpus hits 0, or null if it survives.
 */
export function swpSimulation(initialCorpus, monthlyWithdrawal, annualReturn, months) {
  if (initialCorpus <= 0) return { monthlyBalances: [], exhaustedAt: 1 };
  const r = annualReturn / 100 / 12;
  const balances = [];
  let corpus = initialCorpus;
  let exhaustedAt = null;

  for (let m = 1; m <= months; m++) {
    corpus = corpus * (1 + r);
    corpus -= monthlyWithdrawal;
    if (corpus <= 0 && exhaustedAt === null) {
      exhaustedAt = m;
      corpus = 0;
    }
    balances.push(Math.max(0, corpus));
  }

  return { monthlyBalances: balances, exhaustedAt };
}

/**
 * Final corpus value after SWP over all months (or 0 if exhausted).
 */
export function swpFinalValue(initialCorpus, monthlyWithdrawal, annualReturn, months) {
  return swpSimulation(initialCorpus, monthlyWithdrawal, annualReturn, months).monthlyBalances[months - 1] ?? 0;
}

// ─── SAVINGS ACCOUNT BASELINE ────────────────────────────────────────────────

/**
 * What a monthly SIP becomes in a plain savings account (3.5% p.a. assumed).
 * @param {number} monthly
 * @param {number} months
 * @param {number} savingsRate - Annual savings account rate, default 3.5
 */
export function savingsAccountFV(monthly, months, savingsRate = 3.5) {
  return sipFutureValue(monthly, savingsRate, months);
}

/**
 * What a lump sum becomes in a savings account.
 */
export function savingsAccountLumpSumFV(amount, months, savingsRate = 3.5) {
  return lumpSumFV(amount, savingsRate, months);
}

// ─── BREAK-EVEN RETURN ───────────────────────────────────────────────────────

/**
 * Break-even annual return the investment must earn to equal paying down the loan.
 * Tax is applied only to capital gains, not the principal.
 * @param {number} invested     - Amount invested instead of paying down
 * @param {number} loanSaving   - Total interest saved if the loan were paid down (total interest on the loan)
 * @param {number} months       - Loan tenure in months
 * @param {number} taxRate      - Tax on gains as percentage (e.g. 12.5 for LTCG)
 * @returns {number} Break-even annual return as percentage
 */
export function breakEvenReturn(invested, loanSaving, months, taxRate = 12.5) {
  if (invested <= 0 || months <= 0 || loanSaving <= 0) return 0;
  // After-tax gain must equal loanSaving
  // invested * ((1+r)^months - 1) * (1 - taxRate/100) = loanSaving
  // (1+r)^months = 1 + loanSaving / (invested * (1 - taxRate/100))
  const afterTaxFactor = 1 - taxRate / 100;
  const target = 1 + loanSaving / (invested * afterTaxFactor);
  if (target <= 1) return 0;
  const monthly = Math.pow(target, 1 / months) - 1;
  return monthly * 12 * 100;
}

// ─── GOAL PROGRESS ───────────────────────────────────────────────────────────

/**
 * Progress percentage toward a goal.
 * @param {number} currentAmount
 * @param {number} targetAmount
 * @returns {number} 0 to 100
 */
export function goalProgress(currentAmount, targetAmount) {
  if (targetAmount <= 0) return 100;
  return Math.min(100, Math.max(0, (currentAmount / targetAmount) * 100));
}

// ─── MONTHS CALCULATION ──────────────────────────────────────────────────────

/**
 * Number of months from today to a target date.
 * @param {string} targetDate - ISO date string (YYYY-MM-DD)
 * @returns {number} Months remaining (can be negative if date is past)
 */
export function monthsUntil(targetDate) {
  const now = new Date();
  const target = new Date(targetDate);
  return (
    (target.getFullYear() - now.getFullYear()) * 12 +
    (target.getMonth() - now.getMonth())
  );
}

// ─── FORMATTING ──────────────────────────────────────────────────────────────

/**
 * Format a number in Indian number system with rupee symbol.
 * @param {number} n
 * @param {boolean} compact - If true, use lakh/crore shorthand
 */
export function formatINR(n, compact = false) {
  if (isNaN(n) || n === null || n === undefined) return "₹0";
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (compact) {
    if (abs >= 1e7) return `${sign}₹${(abs / 1e7).toFixed(2)} cr`;
    if (abs >= 1e5) return `${sign}₹${(abs / 1e5).toFixed(2)} L`;
    if (abs >= 1000) return `${sign}₹${(abs / 1000).toFixed(1)}k`;
    return `${sign}₹${Math.round(abs).toLocaleString("en-IN")}`;
  }
  return `${sign}₹${Math.round(abs).toLocaleString("en-IN")}`;
}

/**
 * Format a number in Indian system (no rupee symbol).
 */
export function formatNumber(n) {
  if (isNaN(n)) return "0";
  return Math.round(n).toLocaleString("en-IN");
}

// ─── UNIT TESTS ──────────────────────────────────────────────────────────────

/**
 * Run all unit tests. Returns { passed, failed, results }.
 */
export function runTests() {
  const results = [];
  let passed = 0;
  let failed = 0;

  function test(name, actual, expected, tolerance = 1) {
    const ok = Math.abs(actual - expected) <= tolerance;
    results.push({ name, actual: Math.round(actual), expected: Math.round(expected), ok });
    if (ok) passed++; else failed++;
  }

  // EMI tests
  test("EMI: standard 8L, 9%, 36 months", calcEMI(800000, 9, 36), 25440, 5);
  test("EMI: zero interest", calcEMI(120000, 0, 12), 10000, 1);
  test("EMI: zero principal", calcEMI(0, 9, 36), 0, 0);
  test("EMI: 1 month tenure", calcEMI(100000, 12, 1), 101000, 10);
  test("EMI: very large amount 5cr, 8%, 240 months", calcEMI(50000000, 8, 240), 418220, 100);

  // Total interest
  test("TotalInterest: 8L, 9%, 36 months", totalInterest(800000, 9, 36), 115832, 100);
  test("TotalInterest: zero rate", totalInterest(120000, 0, 12), 0, 0);

  // SIP FV
  test("SIP FV: 10k/mo, 12%, 36 months", sipFutureValue(10000, 12, 36), 435076, 200);
  test("SIP FV: zero return", sipFutureValue(10000, 0, 36), 360000, 1);
  test("SIP FV: zero amount", sipFutureValue(0, 12, 36), 0, 0);

  // SIP Required
  test("SIP Required: 8L goal, 10%, 36 months", sipRequired(800000, 10, 36), 18989, 50);
  test("SIP Required: zero return", sipRequired(120000, 0, 12), 10000, 1);

  // Lump sum FV
  test("LumpSum FV: 1L, 10%, 36 months", lumpSumFV(100000, 10, 36), 134818, 100);
  test("LumpSum FV: zero months", lumpSumFV(100000, 10, 0), 0, 0);

  // SIP with lump sum
  test("SIP+LumpSum: 8L goal, 1L saved, 10%, 36 months",
    sipRequiredWithLumpSum(800000, 100000, 10, 36),
    sipRequired(800000 - lumpSumFV(100000, 10, 36), 10, 36),
    50
  );
  test("SIP+LumpSum: down payment larger than price",
    sipRequiredWithLumpSum(500000, 600000, 10, 36),
    0, 0
  );

  // SWP
  const swpResult = swpSimulation(500000, 5000, 8, 120);
  test("SWP: 5L corpus, 5k/mo, 8%, 120 months - not exhausted", swpResult.exhaustedAt === null ? 0 : 1, 0, 0);

  const swpExhaust = swpSimulation(100000, 10000, 0, 24);
  test("SWP: exhausted corpus", swpExhaust.exhaustedAt !== null ? 0 : 1, 0, 0);

  // Savings account baseline
  test("Savings FV: 10k/mo, 3.5%, 36 months", savingsAccountFV(10000, 36), 380103, 500);

  // Break-even
  const bep = breakEvenReturn(300000, 115000, 36, 15);
  test("Break-even: positive result", bep > 0 ? 0 : 1, 0, 0);

  // Goal progress
  test("Progress: 50% done", goalProgress(400000, 800000), 50, 0);
  test("Progress: over 100%", goalProgress(900000, 800000), 100, 0);
  test("Progress: zero target", goalProgress(0, 0), 100, 0);

  // Months until
  const futureDate = new Date();
  futureDate.setMonth(futureDate.getMonth() + 6);
  test("Months until: 6 months ahead", monthsUntil(futureDate.toISOString().slice(0, 10)), 6, 1);

  const pastDate = new Date();
  pastDate.setMonth(pastDate.getMonth() - 3);
  const pastMonths = monthsUntil(pastDate.toISOString().slice(0, 10));
  test("Months until: past date is negative", pastMonths < 0 ? 0 : 1, 0, 0);

  return { passed, failed, results };
}
